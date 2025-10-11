import telebot
from telebot import types
import time
import schedule
import threading
import base64
import os
from datetime import datetime, timedelta
from collections import defaultdict
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Bot token
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
bot = telebot.TeleBot(TOKEN)

# URLs
GAME_URL = 'https://tr1h.github.io/solana-tamagotchi-v3/coming-soon.html'  # Coming Soon Page
MINT_URL = 'https://tr1h.github.io/solana-tamagotchi-v3/coming-soon.html'  # Coming Soon Page
CHANNEL_ID = 'solana_tamagotchi_v3_bot'

# Admin IDs (add your Telegram ID)
ADMIN_IDS = [7401131043]

# Supabase connection
SUPABASE_URL = os.getenv('SUPABASE_URL', 'YOUR_SUPABASE_URL_HERE')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'YOUR_SUPABASE_KEY_HERE')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Anti-spam tracking
user_messages = defaultdict(list)
SPAM_LIMIT = 5  # messages
SPAM_WINDOW = 10  # seconds

# Banned words
BANNED_WORDS = ['spam', 'scam', 'http://', 'https://']  # Add more

# Muted users
muted_users = {}

# Generate beautiful referral code
def generate_referral_code(wallet_address, user_id):
    """Generate a beautiful referral code like TAMA123, GOTCHI456"""
    import hashlib
    
    # Create hash from wallet + user_id
    data = f"{wallet_address}{user_id}".encode()
    hash_obj = hashlib.md5(data).hexdigest()
    
    # Take first 6 characters and make them uppercase
    code_part = hash_obj[:6].upper()
    
    # Add prefix based on user_id (for variety)
    prefixes = ['TAMA', 'GOTCHI', 'SOL', 'PET', 'NFT', 'GAME', 'PLAY', 'EARN']
    prefix = prefixes[user_id % len(prefixes)]
    
    return f"{prefix}{code_part}"

# Find wallet by referral code
def find_wallet_by_referral_code(ref_code):
    """Find wallet address by beautiful referral code"""
    try:
        # Get all users and check their codes
        response = supabase.table('leaderboard').select('wallet_address, telegram_id').execute()
        
        for user in response.data:
            if user.get('telegram_id'):
                # Generate code for this user
                generated_code = generate_referral_code(user['wallet_address'], user['telegram_id'])
                if generated_code == ref_code:
                    return user['wallet_address']
        
        return None
    except Exception as e:
        print(f"Error finding wallet by code: {e}")
        return None

# Get stats from MySQL
def get_stats():
    try:
        response = supabase.table('leaderboard').select('*', count='exact').execute()
        players = response.count or 0
        pets = players  # Same as players for now
        
        return {'players': players, 'pets': pets, 'price': '0.3 SOL'}
    except:
        return {'players': 0, 'pets': 0, 'price': '0.3 SOL'}

# Get wallet address by Telegram ID
def get_wallet_by_telegram(telegram_id):
    try:
        response = supabase.table('leaderboard').select('wallet_address').eq('telegram_id', telegram_id).single().execute()
        return response.data.get('wallet_address') if response.data else None
    except:
        return None

# Check if user is admin
def is_admin(user_id):
    return user_id in ADMIN_IDS or len(ADMIN_IDS) == 0

# Check if user is muted
def is_muted(user_id, chat_id):
    key = f"{chat_id}_{user_id}"
    if key in muted_users:
        if time.time() < muted_users[key]:
            return True
        else:
            del muted_users[key]
    return False

# Anti-spam check
def check_spam(user_id):
    now = time.time()
    user_messages[user_id] = [msg_time for msg_time in user_messages[user_id] if now - msg_time < SPAM_WINDOW]
    user_messages[user_id].append(now)
    return len(user_messages[user_id]) > SPAM_LIMIT

# Filter banned words
def has_banned_words(text):
    text_lower = text.lower()
    for word in BANNED_WORDS:
        if word in text_lower:
            return True
    return False

# Middleware for group messages (NON-COMMAND messages only)
@bot.message_handler(func=lambda message: message.chat.type in ['group', 'supergroup'] and message.text and not message.text.startswith('/'))
def handle_group_message(message):
    user_id = message.from_user.id
    chat_id = message.chat.id
    
    # Debug: log group messages
    print(f"Group message: {message.chat.title} (ID: {chat_id}) from {message.from_user.first_name}")
    
    # Skip if admin
    if is_admin(user_id):
        return
    
    # Check mute
    if is_muted(user_id, chat_id):
        try:
            bot.delete_message(chat_id, message.message_id)
        except:
            pass
        return
    
    # Check spam
    if check_spam(user_id):
        try:
            bot.delete_message(chat_id, message.message_id)
            bot.send_message(chat_id, f"⚠️ {message.from_user.first_name}, slow down! Anti-spam protection.")
        except:
            pass
        return
    
    # Check banned words
    if message.text and has_banned_words(message.text):
        try:
            bot.delete_message(chat_id, message.message_id)
            bot.send_message(chat_id, f"⚠️ {message.from_user.first_name}, your message was removed (prohibited content).")
        except:
            pass
        return

# Handle referral links
@bot.message_handler(commands=['start'], func=lambda message: message.chat.type == 'private')
def handle_start(message):
    # Check if it's a referral link
    if len(message.text.split()) > 1:
        ref_param = message.text.split()[1]
        if ref_param.startswith('ref'):
            # Extract referral code
            ref_code = ref_param[3:]  # Remove 'ref' prefix
            try:
                # Check if it's a beautiful code (like TAMA123) or old base64
                if len(ref_code) > 8 and ref_code.isalnum():
                    # Beautiful code - need to find wallet by code
                    wallet_address = find_wallet_by_referral_code(ref_code)
                    if not wallet_address:
                        # Fallback to old system
                        ref_code_padded = ref_code + '=' * (4 - len(ref_code) % 4)
                        wallet_address = base64.b64decode(ref_code_padded).decode()
                else:
                    # Old base64 code
                    ref_code_padded = ref_code + '=' * (4 - len(ref_code) % 4)
                    wallet_address = base64.b64decode(ref_code_padded).decode()
                
                # Store referral info for when user connects wallet
                user_id = message.from_user.id
                username = message.from_user.username or message.from_user.first_name
                
                # Save to database or send to game
                referral_data = {
                    'referrer_wallet': wallet_address,
                    'telegram_id': user_id,
                    'telegram_username': username,
                    'timestamp': datetime.now().isoformat()
                }
                
                # Send welcome with referral info
                welcome_text = f"""
🎮 *Welcome to Solana Tamagotchi!*

You were invited by a friend! 🎉

✨ *What you can do:*
• 🎨 Mint unique NFT pets
• 💰 Earn TAMA tokens  
• 🔗 Multi-level referrals (100+50 TAMA)
• 🏆 Daily rewards & achievements
• 🌟 Community-driven gameplay

🚀 *Ready to start?*
                """
                
                keyboard = types.InlineKeyboardMarkup()
                keyboard.row(
                    types.InlineKeyboardButton("🎮 Play Game", url=f"{GAME_URL}?ref={wallet_address}&tg_id={user_id}&tg_username={username}"),
                    types.InlineKeyboardButton("🎨 Mint NFT", url=f"{MINT_URL}?ref={wallet_address}&tg_id={user_id}&tg_username={username}")
                )
                
                bot.reply_to(message, welcome_text, parse_mode='Markdown', reply_markup=keyboard)
                return
                
            except Exception as e:
                print(f"Error processing referral: {e}")
    
    # Regular start command
    send_welcome(message)

# Commands - Private chat only
@bot.message_handler(commands=['help'], func=lambda message: message.chat.type == 'private')
def send_welcome(message):
    welcome_text = f"""
🎮 *Welcome to Solana Tamagotchi!*

*The ultimate Play-to-Earn NFT pet game on Solana!*

✨ *What you can do:*
• 🎨 Mint unique NFT pets
• 💰 Earn TAMA tokens  
• 🔗 Multi-level referrals (100+50 TAMA)
• 🏆 Daily rewards & achievements
• 🌟 Community-driven gameplay

🚀 *Ready to start?*
    """
    
    # Create inline keyboard with referral links
    keyboard = types.InlineKeyboardMarkup()
    
    # Get user's wallet for referral links
    user_id = message.from_user.id
    username = message.from_user.username or message.from_user.first_name
    wallet_address = get_wallet_by_telegram(str(user_id))
    
    if wallet_address:
        # User has wallet - create referral links
        game_url = f"{GAME_URL}?ref={wallet_address}&tg_id={user_id}&tg_username={username}"
        mint_url = f"{MINT_URL}?ref={wallet_address}&tg_id={user_id}&tg_username={username}"
    else:
        # No wallet - use regular links
        game_url = GAME_URL
        mint_url = MINT_URL
    
    keyboard.row(
        types.InlineKeyboardButton("🎮 Play Game", url=game_url),
        types.InlineKeyboardButton("🎨 Mint NFT", url=mint_url)
    )
    keyboard.row(
        types.InlineKeyboardButton("📊 My Stats", callback_data="my_stats"),
        types.InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard")
    )
    keyboard.row(
        types.InlineKeyboardButton("📋 Rules", callback_data="rules")
    )
    
    bot.reply_to(message, welcome_text, parse_mode='Markdown', reply_markup=keyboard)

# Handle callback queries - REMOVED DUPLICATE

# Private commands (personal data)
@bot.message_handler(commands=['stats'], func=lambda message: message.chat.type == 'private')
def send_stats(message):
    telegram_id = str(message.from_user.id)
    username = message.from_user.username or message.from_user.first_name
    
    try:
        # Get player data from Supabase by telegram_id
        response = supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
        
        if response.data:
            player = response.data[0]
            
            # Get referral stats
            ref_l1_response = supabase.table('referrals').select('*', count='exact').eq('referrer_address', player['wallet_address']).eq('level', 1).execute()
            ref_l2_response = supabase.table('referrals').select('*', count='exact').eq('referrer_address', player['wallet_address']).eq('level', 2).execute()
            
            level1_count = ref_l1_response.count or 0
            level2_count = ref_l2_response.count or 0
            
            # Calculate total earned from referrals
            level1_earned = sum([r.get('signup_reward', 0) for r in ref_l1_response.data]) if ref_l1_response.data else 0
            level2_earned = sum([r.get('signup_reward', 0) for r in ref_l2_response.data]) if ref_l2_response.data else 0
            
            total_referrals = level1_count + level2_count
            total_earned = level1_earned + level2_earned
            
            text = f"""
📊 *Your Personal Stats:*

🐾 *Your Pet:*
• Name: {player.get('pet_name', 'No pet yet')}
• Type: {player.get('pet_type', 'N/A')}
• Rarity: {player.get('pet_rarity', 'N/A')}
• Level: {player.get('level', 1)}
• XP: {player.get('xp', 0)}

💰 *Your Balance:*
• TAMA Tokens: {player.get('tama', 0)}

🔗 *Your Referrals:*
• Level 1 Direct: {level1_count} ({level1_earned} TAMA)
• Level 2 Indirect: {level2_count} ({level2_earned} TAMA)
• Total Referrals: {total_referrals}
• Total Earned: {total_earned} TAMA

👛 *Wallet:*
• `{player['wallet_address'][:8]}...{player['wallet_address'][-8:]}`

*Keep playing and referring friends to earn more!* 🚀
            """
        else:
            # No wallet linked yet
            game_link = f"{GAME_URL}?tg_id={telegram_id}&tg_username={username}"
            text = f"""
📊 *Your Personal Stats:*

❌ *No wallet linked yet!*

To start playing and tracking your stats:
1️⃣ Click the button below
2️⃣ Connect your Phantom wallet
3️⃣ Your progress will be automatically saved!

🎮 *Ready to start?*
            """
            keyboard = types.InlineKeyboardMarkup()
            keyboard.row(
                types.InlineKeyboardButton("🎮 Start Playing", url=game_link),
                types.InlineKeyboardButton("🎨 Mint NFT", url=MINT_URL)
            )
            bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)
            return
        
        # Add buttons
        keyboard = types.InlineKeyboardMarkup()
        game_link = f"{GAME_URL}?tg_id={telegram_id}&tg_username={username}"
        keyboard.row(
            types.InlineKeyboardButton("🎮 Play Game", url=game_link),
            types.InlineKeyboardButton("🔗 Share Referral", callback_data="get_referral")
        )
        
        bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)
        
    except Exception as e:
        print(f"Error getting stats: {e}")
        bot.reply_to(message, "❌ Error getting your stats. Please try again later.")

@bot.message_handler(commands=['link'], func=lambda message: message.chat.type == 'private')
def link_wallet(message):
    """Link wallet to Telegram account"""
    telegram_id = str(message.from_user.id)
    username = message.from_user.username or message.from_user.first_name
    
    # Check if already linked
    try:
        db = mysql.connector.connect(**db_config)
        cursor = db.cursor(dictionary=True)
        
        cursor.execute("SELECT wallet_address FROM leaderboard WHERE telegram_id = %s", (telegram_id,))
        existing = cursor.fetchone()
        
        if existing:
            text = f"""
✅ *Already Linked!*

👛 *Your Wallet:*
`{existing['wallet_address'][:8]}...{existing['wallet_address'][-8:]}`

🎮 *To link a different wallet:*
1. Go to the game
2. Connect your new wallet
3. Use /link again
            """
        else:
            text = f"""
🔗 *Link Your Wallet*

To link your wallet to this Telegram account:

1️⃣ Go to the game: [Play Game]({GAME_URL})
2️⃣ Connect your Phantom wallet
3️⃣ Copy your wallet address
4️⃣ Send it to me with: `/link YOUR_WALLET_ADDRESS`

*Example:* `/link DteCpGbnUjubW7EFUUexiHY8J1cTJmowFhFzK9jt6D2e`
            """
        
        cursor.close()
        db.close()
        
    except Exception as e:
        print(f"Error in link command: {e}")
        text = "❌ Error. Please try again later."
    
    bot.reply_to(message, text, parse_mode='Markdown')

# Handle wallet address linking
@bot.message_handler(func=lambda message: message.chat.type == 'private' and message.text and message.text.startswith('/link ') and len(message.text.split()) == 2)
def handle_wallet_link(message):
    """Handle wallet address linking"""
    telegram_id = str(message.from_user.id)
    username = message.from_user.username or message.from_user.first_name
    wallet_address = message.text.split()[1]
    
    try:
        db = mysql.connector.connect(**db_config)
        cursor = db.cursor(dictionary=True)
        
        # Check if wallet exists in leaderboard
        cursor.execute("SELECT * FROM leaderboard WHERE wallet_address = %s", (wallet_address,))
        wallet_data = cursor.fetchone()
        
        if wallet_data:
            # Update existing record with Telegram info
            cursor.execute("""
                UPDATE leaderboard 
                SET telegram_id = %s, telegram_username = %s 
                WHERE wallet_address = %s
            """, (telegram_id, username, wallet_address))
            
            db.commit()
            
            text = f"""
✅ *Wallet Linked Successfully!*

👛 *Wallet:* `{wallet_address[:8]}...{wallet_address[-8:]}`
🐾 *Pet:* {wallet_data['pet_name'] or 'No pet yet'}
💰 *TAMA:* {wallet_data['tama'] or 0}
📊 *Level:* {wallet_data['level'] or 1}

🎮 *Now you can:*
• Use /stats to see your progress
• Use /ref to get referral links
• Track your referrals perfectly!

*Your Telegram is now linked to this wallet!* 🚀
            """
        else:
            text = f"""
❌ *Wallet Not Found*

The wallet address `{wallet_address[:8]}...{wallet_address[-8:]}` is not in our database.

🎮 *To link your wallet:*
1. Go to the game: [Play Game]({GAME_URL})
2. Connect your Phantom wallet
3. Create your first pet
4. Then use /link with your wallet address

*Make sure you've played the game first!* 🎯
            """
        
        cursor.close()
        db.close()
        
    except Exception as e:
        print(f"Error linking wallet: {e}")
        text = "❌ Error linking wallet. Please try again later."
    
    bot.reply_to(message, text, parse_mode='Markdown')

@bot.message_handler(commands=['save'], func=lambda message: message.chat.type == 'private')
def save_pet_progress(message):
    """Save pet progress to database"""
    # Expecting format: /save WALLET_ADDRESS JSON_DATA
    parts = message.text.split(maxsplit=2)
    if len(parts) < 3:
        bot.reply_to(message, "Usage: /save WALLET_ADDRESS {pet_data_json}")
        return
    
    wallet_address = parts[1]
    try:
        pet_data_str = parts[2]
        
        db = mysql.connector.connect(**db_config)
        cursor = db.cursor()
        
        # Update pet data
        cursor.execute("""
            UPDATE leaderboard 
            SET pet_data = %s, updated_at = NOW()
            WHERE wallet_address = %s
        """, (pet_data_str, wallet_address))
        
        db.commit()
        cursor.close()
        db.close()
        
        bot.reply_to(message, "✅ Pet progress saved!")
        
    except Exception as e:
        print(f"Error saving pet: {e}")
        bot.reply_to(message, "❌ Error saving pet progress")

@bot.message_handler(commands=['ref', 'referral'], func=lambda message: message.chat.type == 'private')
def send_referral(message):
    user_id = message.from_user.id
    username = message.from_user.username or message.from_user.first_name
    
    # Get wallet address from database
    telegram_id = str(user_id)
    wallet_address = get_wallet_by_telegram(telegram_id)
    
    if not wallet_address:
        # Create referral link using Telegram ID as fallback
        user_id = message.from_user.id
        username = message.from_user.username or message.from_user.first_name
        telegram_ref_code = base64.b64encode(str(user_id).encode()).decode()[:8]
        telegram_link = f"https://t.me/solana_tamagotchi_v3_bot?start=ref{telegram_ref_code}"
        game_link = f"{GAME_URL}?tg_id={user_id}&tg_username={username}"
        
        text = f"""
🔗 *Your Personal Referral Link:*

`{telegram_link}`

✨ *This link will:*
• Automatically link your Telegram to your wallet
• Track your referrals perfectly
• Give you bonus rewards

💰 *Earn rewards:*
• 100 TAMA for each friend (Level 1)
• 50 TAMA for Level 2 referrals  
• 15% of their earnings forever!

🎁 *Milestone Bonuses:*
• 5 referrals → +1000 TAMA
• 10 referrals → +3000 TAMA
• 25 referrals → +10000 TAMA
• 50 referrals → +30000 TAMA
• 100 referrals → +100000 TAMA + Legendary Badge!

📤 *Share with friends and earn!*

💡 *Note:* Connect your wallet to get full referral tracking!
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🎮 Play Game", url=game_link),
            types.InlineKeyboardButton("📤 Share Link", url=f"https://t.me/share/url?url={telegram_link}&text=🎮 Join me in Solana Tamagotchi! Earn TAMA tokens!")
        )
        
        bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)
        return
    
    # Create beautiful referral code
    ref_code = generate_referral_code(wallet_address, user_id)
    telegram_link = f"https://t.me/solana_tamagotchi_v3_bot?start=ref{ref_code}"
    game_link = f"{GAME_URL}?ref={wallet_address}&tg_id={user_id}&tg_username={username}"
    short_link = f"https://tama.game/ref/{ref_code}"
    
    # Get referral stats
    try:
        response = supabase.table('referrals').select('*', count='exact').eq('referrer_address', wallet_address).execute()
        total_referrals = response.count or 0
        
        level1_count = len([r for r in response.data if r.get('level') == 1]) if response.data else 0
        level2_count = len([r for r in response.data if r.get('level') == 2]) if response.data else 0
        
        total_earnings = sum([r.get('signup_reward', 0) for r in response.data]) if response.data else 0
    except:
        total_referrals = 0
        level1_count = 0
        level2_count = 0
        total_earnings = 0
    
    text = f"""
🔗 *Your Personal Referral Code:*

`{ref_code}`

🔗 *Your Links:*
• Telegram: `{telegram_link}`
• Game: `{game_link}`
• Short: `{short_link}`

📊 *Your Stats:*
• Total Referrals: {total_referrals}
• Level 1: {level1_count}
• Level 2: {level2_count}
• Total Earned: {total_earnings} TAMA

💰 *Earn rewards:*
• 100 TAMA for each friend (Level 1)
• 50 TAMA for Level 2 referrals  
• 15% of their earnings forever!

🎁 *Milestone Bonuses:*
• 5 referrals → +1000 TAMA
• 10 referrals → +3000 TAMA
• 25 referrals → +10000 TAMA
• 50 referrals → +30000 TAMA
• 100 referrals → +100000 TAMA + Legendary Badge!

📤 *Share your code: {ref_code}*
    """
    
    keyboard = types.InlineKeyboardMarkup()
    keyboard.row(
        types.InlineKeyboardButton("🎮 Play Game", url=game_link),
        types.InlineKeyboardButton("📤 Share Link", url=f"https://t.me/share/url?url={telegram_link}&text=🎮 Join me in Solana Tamagotchi! Earn TAMA tokens!")
    )
    keyboard.row(
        types.InlineKeyboardButton("📊 View Stats", callback_data="referral_stats"),
        types.InlineKeyboardButton("🏆 Milestones", callback_data="referral_milestones")
    )
    
    bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)

# Get referral code command
@bot.message_handler(commands=['code'], func=lambda message: message.chat.type == 'private')
def get_referral_code(message):
    user_id = message.from_user.id
    username = message.from_user.username or message.from_user.first_name
    
    # Get wallet address from database
    telegram_id = str(user_id)
    wallet_address = get_wallet_by_telegram(telegram_id)
    
    if not wallet_address:
        bot.reply_to(message, """
❌ *No wallet linked yet!*

To get your referral code:
1. Connect your wallet in the game
2. Use /ref to get your code

Your code will be something like: `TAMA123ABC`
        """, parse_mode='Markdown')
        return
    
    # Generate beautiful code
    ref_code = generate_referral_code(wallet_address, user_id)
    
    text = f"""
🎯 *Your Referral Code:*

`{ref_code}`

✨ *How to use:*
• Share: `{ref_code}`
• Link: `https://tama.game/ref/{ref_code}`
• Telegram: `/start ref{ref_code}`

📤 *Easy to remember and share!*
    """
    
    keyboard = types.InlineKeyboardMarkup()
    keyboard.row(
        types.InlineKeyboardButton("📋 Copy Code", callback_data=f"copy_code_{ref_code}"),
        types.InlineKeyboardButton("🔗 Get Full Link", callback_data="get_full_link")
    )
    
    bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)

# Group commands (public)
@bot.message_handler(commands=['game'], func=lambda message: message.chat.type in ['group', 'supergroup'])
def send_game(message):
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("🎮 Play Game", url=GAME_URL))
    bot.reply_to(message, "🐾 Ready to play?", reply_markup=keyboard)

@bot.message_handler(commands=['mint'], func=lambda message: message.chat.type in ['group', 'supergroup'])
def send_mint(message):
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("🖼️ Mint NFT Pet", url=MINT_URL))
    bot.reply_to(message, "✨ Mint your unique NFT Pet!\n\n💰 Price: 0.3 SOL", reply_markup=keyboard)

@bot.message_handler(commands=['leaderboard', 'top'], func=lambda message: message.chat.type in ['group', 'supergroup'])
def send_leaderboard(message):
    text = """
🏆 *Leaderboard:*

*Top Players by XP:*
1. 🥇 Player1 - Level 15
2. 🥈 Player2 - Level 12
3. 🥉 Player3 - Level 10

🎮 *Play more to climb the ranks!*
    """
    bot.reply_to(message, text, parse_mode='Markdown')

@bot.message_handler(commands=['info'], func=lambda message: message.chat.type in ['group', 'supergroup'])
def send_info(message):
    stats = get_stats()
    text = f"""
🎮 *Solana Tamagotchi Info:*

📊 *Statistics:*
• Total Players: {stats['players']}
• Total Pets: {stats['pets']}
• NFT Price: {stats['price']}

🎯 *How to Play:*
• Mint NFT pet: [Mint Page]({MINT_URL})
• Play game: [Game]({GAME_URL})
• Earn TAMA tokens
• Refer friends for rewards

🤖 *Bot Commands:*
• /game - Play the game
• /mint - Mint NFT pet
• /leaderboard - Top players
• /info - This message

*For personal stats, message the bot privately!* 🚀
    """
    bot.reply_to(message, text, parse_mode='Markdown')

@bot.message_handler(commands=['price'])
def send_price(message):
    stats = get_stats()
    price_text = f"""
💰 *NFT Pet Price:*

Current: {stats['price']}

✅ 10 unique pet types
✅ Evolution system
✅ Play-to-Earn TAMA tokens
✅ Multi-level referrals

Mint now: /mint
    """
    bot.reply_to(message, price_text, parse_mode='Markdown')

@bot.message_handler(commands=['players'])
def send_players(message):
    stats = get_stats()
    bot.reply_to(message, f"👥 **Total Players:** {stats['players']}\n\n🚀 Join the community!", parse_mode='Markdown')

@bot.message_handler(commands=['pets'])
def send_pets(message):
    stats = get_stats()
    bot.reply_to(message, f"🐾 **Total Pets Created:** {stats['pets']}\n\n✨ Mint yours: /mint", parse_mode='Markdown')


@bot.message_handler(commands=['stats'])
def send_user_stats(message):
    stats_text = """
📊 **Your Statistics:**

👥 Referrals: 0
💰 TAMA Earned: 0

Start inviting friends with /ref to earn rewards! 🚀
    """
    bot.reply_to(message, stats_text, parse_mode='Markdown')

# ADMIN COMMANDS
@bot.message_handler(commands=['mute'])
def mute_user(message):
    if not is_admin(message.from_user.id):
        bot.reply_to(message, "❌ Admin only")
        return
    
    try:
        args = message.text.split()
        
        if message.reply_to_message:
            # Mute by reply
            user_id = message.reply_to_message.from_user.id
            username = message.reply_to_message.from_user.first_name
            duration = int(args[1]) if len(args) > 1 else 60
        else:
            # Mute by username
            if len(args) < 2:
                bot.reply_to(message, "❌ Usage: /mute [username] [minutes] or reply to message")
                return
            
            username = args[1].replace('@', '')
            duration = int(args[2]) if len(args) > 2 else 60
            
            # Find user by username (this is simplified - in real implementation you'd need to store usernames)
            bot.reply_to(message, f"❌ Please reply to user's message to mute them")
            return
        
        chat_id = message.chat.id
        key = f"{chat_id}_{user_id}"
        
        muted_users[key] = time.time() + (duration * 60)
        
        bot.reply_to(message, f"✅ {username} muted for {duration} minutes")
    except Exception as e:
        bot.reply_to(message, f"❌ Error: {str(e)}")

@bot.message_handler(commands=['unmute'])
def unmute_user(message):
    if not is_admin(message.from_user.id):
        bot.reply_to(message, "❌ Admin only")
        return
    
    if not message.reply_to_message:
        bot.reply_to(message, "❌ Reply to a message to unmute user")
        return
    
    user_id = message.reply_to_message.from_user.id
    chat_id = message.chat.id
    key = f"{chat_id}_{user_id}"
    
    if key in muted_users:
        del muted_users[key]
        bot.reply_to(message, "✅ User unmuted")
    else:
        bot.reply_to(message, "❌ User is not muted")

@bot.message_handler(commands=['ban'])
def ban_user(message):
    if not is_admin(message.from_user.id):
        bot.reply_to(message, "❌ Admin only")
        return
    
    if not message.reply_to_message:
        bot.reply_to(message, "❌ Reply to a message to ban user")
        return
    
    try:
        user_id = message.reply_to_message.from_user.id
        chat_id = message.chat.id
        
        bot.ban_chat_member(chat_id, user_id)
        bot.reply_to(message, "✅ User banned")
    except Exception as e:
        bot.reply_to(message, f"❌ Error: {str(e)}")

@bot.message_handler(commands=['kick'])
def kick_user(message):
    if not is_admin(message.from_user.id):
        bot.reply_to(message, "❌ Admin only")
        return
    
    if not message.reply_to_message:
        bot.reply_to(message, "❌ Reply to a message to kick user")
        return
    
    try:
        user_id = message.reply_to_message.from_user.id
        chat_id = message.chat.id
        
        bot.ban_chat_member(chat_id, user_id)
        bot.unban_chat_member(chat_id, user_id)
        bot.reply_to(message, "✅ User kicked")
    except Exception as e:
        bot.reply_to(message, f"❌ Error: {str(e)}")

@bot.message_handler(commands=['broadcast'])
def broadcast_message(message):
    if not is_admin(message.from_user.id):
        bot.reply_to(message, "❌ Admin only")
        return
    
    try:
        text = message.text.replace('/broadcast ', '', 1)
        
        # Send to channel
        bot.send_message(CHANNEL_ID, f"📢 **Announcement:**\n\n{text}", parse_mode='Markdown')
        
        bot.reply_to(message, "✅ Message sent to channel!")
    except Exception as e:
        bot.reply_to(message, f"❌ Error: {str(e)}")

# Welcome new members
@bot.message_handler(content_types=['new_chat_members'])
def welcome_new_member(message):
    for new_member in message.new_chat_members:
        welcome_text = f"""
🎮 Welcome to Solana Tamagotchi Community, {new_member.first_name}!

🐾 What's this about?
• Play-to-Earn NFT pet game on Solana
• Mint unique pets and earn TAMA tokens
• Multi-level referral system
• Daily rewards & achievements

🚀 Get Started:
• Mint your first pet: [Mint Page]({MINT_URL})
• Play the game: [Game]({GAME_URL})
• Use /help for bot commands

📢 Stay Updated:
• Twitter: @GotchiGame
• News: @GotchiGame
• Bot: @solana_tamagotchi_v3_bot

Let's build the biggest Tamagotchi community on Solana! 🌟
        """
        
        # Create welcome keyboard
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🎮 Play Game", url=GAME_URL),
            types.InlineKeyboardButton("🎨 Mint NFT", url=MINT_URL)
        )
        keyboard.add(types.InlineKeyboardButton("🤖 Bot Commands", url="https://t.me/solana_tamagotchi_v3_bot?start=help"))
        
        bot.send_message(message.chat.id, welcome_text, reply_markup=keyboard)

# Daily stats post
def post_daily_stats():
    try:
        stats = get_stats()
        stats_text = f"""📊 **Daily Statistics**

👥 Total Players: {stats['players']}
🐾 Total Pets: {stats['pets']}
💰 NFT Price: {stats['price']}

🎮 Play: Coming Soon!
✨ Mint: Coming Soon!

🚀 Join the community!"""
        
        bot.send_message(CHANNEL_ID, stats_text, parse_mode='Markdown')
    except Exception as e:
        print(f"Error posting daily stats: {e}")

# Schedule daily posts
def run_schedule():
    schedule.every().day.at("12:00").do(post_daily_stats)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

# Handle unknown commands in private chat only
@bot.message_handler(func=lambda message: message.chat.type == 'private')
def echo_message(message):
    bot.reply_to(message, "Use /help to see available commands! 🚀")

# Callback handlers
@bot.callback_query_handler(func=lambda call: True)
def handle_callback(call):
    if call.data == "get_referral":
        # Generate referral link with Telegram auto-linking
        user_id = call.from_user.id
        username = call.from_user.username or call.from_user.first_name
        referral_code = base64.b64encode(str(user_id).encode()).decode()
        
        # Create game link with Telegram params for auto-linking
        game_link = f"{GAME_URL}?ref={referral_code}&tg_id={user_id}&tg_username={username}"
        
        text = f"""
🔗 *Your Personal Game Link:*

`{game_link}`

✨ *This link will:*
• Automatically link your Telegram to your wallet
• Track your referrals perfectly
• Give you bonus rewards

💰 *Earn rewards:*
• 25 TAMA for each friend who joins
• 12 TAMA for Level 2 referrals
• 10% of their earnings forever!

📤 *Share with friends and earn!*
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🎮 Play Game", url=game_link),
            types.InlineKeyboardButton("📤 Share Link", url=f"https://t.me/share/url?url={game_link}&text=🎮 Join me in Solana Tamagotchi! Earn TAMA tokens by playing!")
        )
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, 
                            parse_mode='Markdown', reply_markup=keyboard)
    
    elif call.data == "my_stats":
        telegram_id = str(call.from_user.id)
        username = call.from_user.username or call.from_user.first_name
        
        try:
            # Get player data from Supabase by telegram_id
            response = supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
            
            if response.data:
                player = response.data[0]
                
                # Get referral stats
                ref_l1_response = supabase.table('referrals').select('*', count='exact').eq('referrer_address', player['wallet_address']).eq('level', 1).execute()
                ref_l2_response = supabase.table('referrals').select('*', count='exact').eq('referrer_address', player['wallet_address']).eq('level', 2).execute()
                
                level1_count = ref_l1_response.count or 0
                level2_count = ref_l2_response.count or 0
                
                # Calculate total earned from referrals
                level1_earned = sum([r.get('signup_reward', 0) for r in ref_l1_response.data]) if ref_l1_response.data else 0
                level2_earned = sum([r.get('signup_reward', 0) for r in ref_l2_response.data]) if ref_l2_response.data else 0
                
                total_referrals = level1_count + level2_count
                total_earned = level1_earned + level2_earned
                
                text = f"""
📊 *Your Personal Stats:*

🐾 *Your Pet:*
• Name: {player.get('pet_name', 'No pet yet')}
• Type: {player.get('pet_type', 'N/A')}
• Rarity: {player.get('pet_rarity', 'N/A')}
• Level: {player.get('level', 1)}
• XP: {player.get('xp', 0)}

💰 *Your Balance:*
• TAMA Tokens: {player.get('tama', 0)}

🔗 *Your Referrals:*
• Level 1 Direct: {level1_count} ({level1_earned} TAMA)
• Level 2 Indirect: {level2_count} ({level2_earned} TAMA)
• Total Referrals: {total_referrals}
• Total Earned: {total_earned} TAMA

👛 *Wallet:*
• `{player['wallet_address'][:8]}...{player['wallet_address'][-8:]}`

*Keep playing and referring friends to earn more!* 🚀
                """
            else:
                # No wallet linked yet
                text = f"""
📊 *Your Personal Stats:*

❌ *No wallet linked yet!*

To start playing and tracking your stats:
1️⃣ Use /ref to get your personal link
2️⃣ Connect your Phantom wallet
3️⃣ Your progress will be automatically saved!

🎮 *Ready to start?*
                """
            
        except Exception as e:
            print(f"Error getting stats: {e}")
            text = "❌ Error getting your stats. Please try again later."
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, parse_mode='Markdown')
    
    elif call.data == "leaderboard":
        try:
            # Debug: Check all data in leaderboard table
            debug_response = supabase.table('leaderboard').select('*').execute()
            print(f"DEBUG: Found {len(debug_response.data)} players in database")
            print(f"DEBUG: Data: {debug_response.data}")
            
            # Get top players by TAMA from Supabase
            tama_response = supabase.table('leaderboard').select('pet_name, tama, level, pet_type').order('tama', desc=True).limit(5).execute()
            
            # Get top players by level from Supabase
            level_response = supabase.table('leaderboard').select('pet_name, level, tama, pet_type').order('level', desc=True).limit(5).execute()
            
            # Build TAMA leaderboard
            tama_text = ""
            if tama_response.data:
                for i, player in enumerate(tama_response.data, 1):
                    medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
                    name = player.get('pet_name', 'Anonymous') or 'Anonymous'
                    tama = player.get('tama', 0) or 0
                    pet_type = player.get('pet_type', 'Unknown') or 'Unknown'
                    tama_text += f"{medal} {name} ({pet_type}) - {tama:,} TAMA\n"
            else:
                tama_text = "No players yet!\n"
            
            # Build Level leaderboard
            level_text = ""
            if level_response.data:
                for i, player in enumerate(level_response.data, 1):
                    medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
                    name = player.get('pet_name', 'Anonymous') or 'Anonymous'
                    level = player.get('level', 1) or 1
                    pet_type = player.get('pet_type', 'Unknown') or 'Unknown'
                    level_text += f"{medal} {name} ({pet_type}) - Level {level}\n"
            else:
                level_text = "No players yet!\n"
            
            text = f"""
🏆 *Live Leaderboard:*

*Top Players by XP:*
{level_text}
🎮 *Play more to climb the ranks!*
            """
            
        except Exception as e:
            print(f"Error getting leaderboard: {e}")
            text = """
🏆 *Leaderboard:*

❌ *Error loading leaderboard*

Please try again later!
            """
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, parse_mode='Markdown')
    
    elif call.data == "rules":
        text = """
📋 *Community Rules:*

✅ *Allowed:*
• Game discussions
• Sharing achievements
• Referral links
• Help requests

❌ *Not Allowed:*
• Spam or flooding
• Offensive language
• Scam links
• NSFW content

🚫 *Violations result in:*
• Warning → Mute → Ban

🎮 *Let's keep it fun and friendly!*
        """
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, parse_mode='Markdown')

# Start bot
if __name__ == '__main__':
    print("Bot started!")
    
    # Start scheduler in background
    scheduler_thread = threading.Thread(target=run_schedule, daemon=True)
    scheduler_thread.start()
    
    try:
        # Skip webhook operations on PythonAnywhere (causes proxy errors)
        print("Starting polling (webhook disabled for PythonAnywhere)...")
        bot.infinity_polling(none_stop=True, interval=2, timeout=60)
    except Exception as e:
        print(f"Bot error: {e}")
        print("Restarting bot in 15 seconds...")
        time.sleep(15)
        # Retry without webhook operations
        try:
            bot.infinity_polling(none_stop=True, interval=2, timeout=60)
        except Exception as e2:
            print(f"Retry failed: {e2}")
            print("Bot stopped due to connection issues")
