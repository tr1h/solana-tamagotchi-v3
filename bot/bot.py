import telebot
from telebot import types
import mysql.connector
import time
import schedule
import threading
from datetime import datetime, timedelta
from collections import defaultdict

# Bot token
TOKEN = '8278463878:AAH590EtqekSpfoE_uJwaNQ-qKACFyt8eaw'
bot = telebot.TeleBot(TOKEN)

# URLs
GAME_URL = 'https://tr1h.github.io/solana-tamagotchi-v3/'
MINT_URL = 'https://tr1h.github.io/solana-tamagotchi-v3/mint.html'
CHANNEL_ID = 'solana_tamagotchi_v3_bot'

# Admin IDs (add your Telegram ID)
ADMIN_IDS = [7401131043]

# MySQL connection
def get_db():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='solana_tamagotchi'
    )

# Anti-spam tracking
user_messages = defaultdict(list)
SPAM_LIMIT = 5  # messages
SPAM_WINDOW = 10  # seconds

# Banned words
BANNED_WORDS = ['spam', 'scam', 'http://', 'https://']  # Add more

# Muted users
muted_users = {}

# Get stats from MySQL
def get_stats():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        cursor.execute("SELECT COUNT(*) as count FROM leaderboard")
        players = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as total FROM leaderboard")
        result = cursor.fetchone()
        pets = result['total']
        
        cursor.close()
        db.close()
        
        return {'players': players, 'pets': pets, 'price': '0.3 SOL'}
    except:
        return {'players': 0, 'pets': 0, 'price': '0.3 SOL'}

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

# Commands
@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    welcome_text = f"""
🎮 *Welcome to Solana Tamagotchi!*

*The ultimate Play-to-Earn NFT pet game on Solana!*

✨ *What you can do:*
• 🎨 Mint unique NFT pets
• 💰 Earn TAMA tokens  
• 🔗 Multi-level referrals (25+12 TAMA)
• 🏆 Daily rewards & achievements
• 🌟 Community-driven gameplay

🚀 *Ready to start?*
    """
    
    # Create inline keyboard
    keyboard = types.InlineKeyboardMarkup()
    keyboard.row(
        types.InlineKeyboardButton("🎮 Play Game", url=GAME_URL),
        types.InlineKeyboardButton("🎨 Mint NFT", url=MINT_URL)
    )
    keyboard.row(
        types.InlineKeyboardButton("🔗 Get Referral", callback_data="get_referral"),
        types.InlineKeyboardButton("📊 My Stats", callback_data="my_stats")
    )
    keyboard.row(
        types.InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard"),
        types.InlineKeyboardButton("📋 Rules", callback_data="rules")
    )
    
    bot.reply_to(message, welcome_text, parse_mode='Markdown', reply_markup=keyboard)

@bot.message_handler(commands=['game'])
def send_game(message):
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("🎮 Play Game", url=GAME_URL))
    bot.reply_to(message, "🐾 Ready to play?", reply_markup=keyboard)

@bot.message_handler(commands=['mint'])
def send_mint(message):
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("🖼️ Mint NFT Pet", url=MINT_URL))
    bot.reply_to(message, "✨ Mint your unique NFT Pet!\n\n💰 Price: 0.3 SOL", reply_markup=keyboard)

@bot.message_handler(commands=['price'])
def send_price(message):
    stats = get_stats()
    price_text = f"""
💰 **NFT Pet Price:**

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

@bot.message_handler(commands=['ref'])
def send_ref(message):
    user_id = message.from_user.id
    username = message.from_user.username or str(user_id)
    
    import base64
    ref_code = base64.b64encode(username.encode()).decode()
    ref_link = f"{GAME_URL}?ref={ref_code}"
    
    ref_text = f"""
🎁 **Your Referral Link:**

`{ref_link}`

**Rewards:**
👥 Level 1: 25 TAMA per signup
👥 Level 2: 12 TAMA per signup
💰 Activity rewards: 10% + 5%

Share with friends and earn! 🚀
    """
    
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("📋 Copy Link", url=ref_link))
    
    bot.reply_to(message, ref_text, parse_mode='Markdown', reply_markup=keyboard)

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
🎮 *Welcome to Solana Tamagotchi Community, {new_member.first_name}!*

🐾 *What's this about?*
• Play-to-Earn NFT pet game on Solana
• Mint unique pets and earn TAMA tokens
• Multi-level referral system
• Daily rewards & achievements

🚀 *Get Started:*
• Mint your first pet: [Mint Page]({MINT_URL})
• Play the game: [Game]({GAME_URL})
• Use /help for bot commands

📢 *Stay Updated:*
• News: @solana_tamagotchi
• Bot: @solana_tamagotchi_v3_bot

*Let's build the biggest Tamagotchi community on Solana!* 🌟
        """
        
        # Create welcome keyboard
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🎮 Play Game", url=GAME_URL),
            types.InlineKeyboardButton("🎨 Mint NFT", url=MINT_URL)
        )
        keyboard.add(types.InlineKeyboardButton("🤖 Bot Commands", url="https://t.me/solana_tamagotchi_v3_bot?start=help"))
        
        bot.send_message(message.chat.id, welcome_text, parse_mode='Markdown', reply_markup=keyboard)

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
        # Generate referral link
        user_id = call.from_user.id
        referral_code = base64.b64encode(str(user_id).encode()).decode()
        referral_link = f"{GAME_URL}?ref={referral_code}"
        
        text = f"""
🔗 *Your Referral Link:*

`{referral_link}`

💰 *Earn rewards:*
• 25 TAMA for each friend who joins
• 12 TAMA for Level 2 referrals
• 10% of their earnings forever!

📤 *Share with friends and earn!*
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.add(types.InlineKeyboardButton("📤 Share Link", url=f"https://t.me/share/url?url={referral_link}&text=🎮 Join me in Solana Tamagotchi! Earn TAMA tokens by playing!"))
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, 
                            parse_mode='Markdown', reply_markup=keyboard)
    
    elif call.data == "my_stats":
        stats = get_game_stats()
        text = f"""
📊 *Game Statistics:*

👥 Total Players: {stats['players']}
🐾 Total Pets: {stats['pets']}
💰 NFT Price: {stats['price']}

🎮 *Your Stats:*
• Referrals: Coming soon!
• TAMA Earned: Coming soon!
• Level: Coming soon!
        """
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, parse_mode='Markdown')
    
    elif call.data == "leaderboard":
        text = """
🏆 *Leaderboard:*

*Top Players by TAMA:*
1. 🥇 Player1 - 1,250 TAMA
2. 🥈 Player2 - 980 TAMA  
3. 🥉 Player3 - 750 TAMA

*Top Players by Level:*
1. 🥇 Player1 - Level 15
2. 🥈 Player2 - Level 12
3. 🥉 Player3 - Level 10

🎮 *Play more to climb the ranks!*
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
        # Clear any pending updates first
        bot.remove_webhook()
        print("Webhook cleared, starting polling...")
        # Wait a bit before starting polling
        time.sleep(5)
        bot.infinity_polling(none_stop=True, interval=2, timeout=60)
    except Exception as e:
        print(f"Bot error: {e}")
        print("Restarting bot in 15 seconds...")
        time.sleep(15)
        bot.remove_webhook()
        time.sleep(5)
        bot.infinity_polling(none_stop=True, interval=2, timeout=60)
