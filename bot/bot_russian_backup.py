import telebot
from telebot import types
import time
import schedule
import threading
import base64
import os
import io
import logging
import random
from datetime import datetime, timedelta
from collections import defaultdict
from supabase import create_client, Client
from dotenv import load_dotenv
import qrcode

# Import gamification module
from gamification import (
    DailyRewards, MiniGames, RankSystem, BadgeSystem, QuestSystem,
    BADGES, RANKS, QUESTS, ACHIEVEMENTS
)

# Load environment variables
import codecs
with codecs.open('../.env', 'r', encoding='utf-8-sig') as f:
    env_content = f.read()
    for line in env_content.strip().split('\n'):
        if '=' in line and not line.startswith('#'):
            key, value = line.split('=', 1)
            os.environ[key.strip()] = value.strip()

# Bot token
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
bot = telebot.TeleBot(TOKEN)

# URLs
GAME_URL = 'https://tr1h.github.io/solana-tamagotchi/'  # Coming Soon Page
MINT_URL = 'https://tr1h.github.io/solana-tamagotchi/'  # Coming Soon Page
CHANNEL_ID = 'solana_tamagotchi_v3_bot'

# Group settings
GROUP_ID = -1002938566588  # @gotchigamechat group ID

# Admin IDs (add your Telegram ID)
ADMIN_IDS = [7401131043]

# Group IDs that are exempt from anti-spam
EXEMPT_GROUP_IDS = [-1002938566588]  # @gotchigamechat group ID

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot_monitoring.log'),
        logging.StreamHandler()
    ]
)

# Monitoring counters
monitoring_stats = {
    'requests_per_minute': defaultdict(int),
    'suspicious_activities': 0,
    'errors_count': 0,
    'referrals_today': 0
}

# Supabase connection
SUPABASE_URL = os.getenv('SUPABASE_URL', 'YOUR_SUPABASE_URL_HERE')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'YOUR_SUPABASE_KEY_HERE')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize gamification systems
daily_rewards = DailyRewards(supabase)
mini_games = MiniGames(supabase)
rank_system = RankSystem(supabase)
badge_system = BadgeSystem(supabase)
quest_system = QuestSystem(supabase)

# Anti-spam tracking
user_messages = defaultdict(list)
SPAM_LIMIT = 5  # messages
SPAM_WINDOW = 10  # seconds

# Banned words
BANNED_WORDS = ['spam', 'scam', 'http://', 'https://']  # Add more

# Muted users
muted_users = {}

# Generate beautiful referral code
def generate_referral_code(telegram_id):
    """Generate a beautiful referral code from Telegram ID only - NO WALLET NEEDED!"""
    import hashlib
    import re
    
    # Validate telegram_id
    if not telegram_id or not str(telegram_id).isdigit():
        raise ValueError("Invalid Telegram ID")
    
    # Use SHA256 for better distribution
    hash_bytes = hashlib.sha256(str(telegram_id).encode()).digest()
    # Take first 3 bytes and convert to base36
    hash_val = int.from_bytes(hash_bytes[:3], 'big')
    code_part = format(hash_val % (36 ** 6), 'X').zfill(6)[:6]
    return f"TAMA{code_part}"

# Validate referral code
def validate_referral_code(ref_code):
    """Validate referral code format"""
    import re
    if not ref_code or not isinstance(ref_code, str):
        return False
    # Check format: TAMA + 6 alphanumeric characters
    pattern = r'^TAMA[A-Z0-9]{6}$'
    return bool(re.match(pattern, ref_code))

# Find telegram_id by referral code (NO WALLET NEEDED!)
def find_telegram_by_referral_code(ref_code):
    """Find Telegram ID by referral code - NO WALLET NEEDED!"""
    try:
        # Validate referral code first
        if not validate_referral_code(ref_code):
            print(f"Invalid referral code format: {ref_code}")
            return None
        # Try to find by referral_code in leaderboard (fast lookup)
        response = supabase.table('leaderboard').select('telegram_id').eq('referral_code', ref_code).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]['telegram_id']
        
        # Fallback: Generate codes for all users and find match
        response = supabase.table('leaderboard').select('telegram_id').execute()
        
        for user in response.data:
            if user.get('telegram_id'):
                # Generate code for this user
                generated_code = generate_referral_code(user['telegram_id'])
                if generated_code == ref_code:
                    # Save the code for next time (optimization)
                    supabase.table('leaderboard').update({
                        'referral_code': ref_code
                    }).eq('telegram_id', user['telegram_id']).execute()
                    return user['telegram_id']
        
        return None
    except Exception as e:
        print(f"Error finding telegram_id by code: {e}")
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

# Monitoring functions
def log_activity(user_id, action, details=""):
    """Log user activity"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    logging.info(f"ACTIVITY: User {user_id} - {action} - {details}")
    
    # Track requests per minute
    current_minute = int(time.time() // 60)
    monitoring_stats['requests_per_minute'][current_minute] += 1

def send_admin_alert(message):
    """Send alert to admin"""
    try:
        for admin_id in ADMIN_IDS:
            bot.send_message(admin_id, f"🚨 **MONITORING ALERT**\n\n{message}", parse_mode='Markdown')
        logging.warning(f"ADMIN ALERT SENT: {message}")
    except Exception as e:
        logging.error(f"Failed to send admin alert: {e}")

def check_suspicious_activity(user_id, action):
    """Check for suspicious activity patterns"""
    current_time = time.time()
    
    # Check for high request rate
    current_minute = int(current_time // 60)
    requests_this_minute = monitoring_stats['requests_per_minute'][current_minute]
    
    if requests_this_minute > 50:  # More than 50 requests per minute
        monitoring_stats['suspicious_activities'] += 1
        send_admin_alert(f"🚨 **HIGH REQUEST RATE DETECTED**\n\nUser: {user_id}\nRequests this minute: {requests_this_minute}\nAction: {action}")
        return True
    
    # Check for rapid referral attempts
    if action == "referral_attempt":
        # This would need more sophisticated tracking
        pass
    
    return False

def log_error(error_type, details, user_id=None):
    """Log errors and send alerts for critical ones"""
    monitoring_stats['errors_count'] += 1
    error_msg = f"ERROR: {error_type} - {details}"
    if user_id:
        error_msg += f" - User: {user_id}"
    
    logging.error(error_msg)
    
    # Send alert for critical errors
    if error_type in ['database_error', 'security_violation', 'system_failure']:
        send_admin_alert(f"🚨 **CRITICAL ERROR**\n\nType: {error_type}\nDetails: {details}\nUser: {user_id}")

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
    
    # Skip if admin - no anti-spam for admins
    if is_admin(user_id):
        return
    
    # Skip if group is exempt from anti-spam
    if chat_id in EXEMPT_GROUP_IDS:
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
    user_id = message.from_user.id
    log_activity(user_id, "start_command")
    
    # Check for suspicious activity
    if check_suspicious_activity(user_id, "start_command"):
        return
    
    # Check if it's a referral link
    if len(message.text.split()) > 1:
        ref_param = message.text.split()[1]
        if ref_param.startswith('ref'):
            # Extract referral code
            ref_code = ref_param[3:]  # Remove 'ref' prefix
            log_activity(user_id, "referral_click", f"code: {ref_code}")
            try:
                # Store referral info
                user_id = message.from_user.id
                username = message.from_user.username or message.from_user.first_name
                
                # Find referrer telegram_id by code (NO WALLET NEEDED!)
                try:
                    # Find by referral code directly
                    referrer_telegram_id = find_telegram_by_referral_code(ref_code)
                    
                    if referrer_telegram_id:
                        # Get username
                        referrer_response = supabase.table('leaderboard').select('telegram_username').eq('telegram_id', str(referrer_telegram_id)).execute()
                        referrer_username = referrer_response.data[0].get('telegram_username', 'Friend') if referrer_response.data else 'Friend'
                    else:
                        referrer_telegram_id = None
                        referrer_username = 'Friend'
                    
                    # Check self-referral
                    if referrer_telegram_id and str(referrer_telegram_id) == str(user_id):
                        bot.reply_to(message, "❌ You cannot refer yourself!")
                        return
                    
                    # Save pending referral to database
                    if referrer_telegram_id:
                        # Check if referral already exists
                        existing = supabase.table('pending_referrals').select('*').eq('referrer_telegram_id', str(referrer_telegram_id)).eq('referred_telegram_id', str(user_id)).execute()
                        
                        if not existing.data:
                            supabase.table('pending_referrals').insert({
                                'referrer_telegram_id': str(referrer_telegram_id),
                                'referred_telegram_id': str(user_id),
                                'referrer_username': referrer_username,
                                'referred_username': username,
                                'referral_code': ref_code,
                                'status': 'pending'
                            }).execute()
                            print(f"✅ Saved pending referral: {referrer_telegram_id} -> {user_id}")
                        else:
                            print(f"⚠️ Referral already exists: {referrer_telegram_id} -> {user_id}")
                        
                        # IMMEDIATE TAMA REWARD - начисляем TAMA сразу! (NO WALLET NEEDED!)
                        # Only award if this is a NEW referral
                        if not existing.data:
                            try:
                                # Найти или создать реферера в leaderboard
                                referrer_data = supabase.table('leaderboard').select('*').eq('telegram_id', str(referrer_telegram_id)).execute()
                                
                                if referrer_data.data and len(referrer_data.data) > 0:
                                    referrer = referrer_data.data[0]
                                    current_tama = referrer.get('tama', 0) or 0
                                    new_tama = current_tama + 1000  # 1,000 TAMA за реферала
                                    
                                    # Обновить TAMA баланс
                                    supabase.table('leaderboard').update({
                                        'tama': new_tama
                                    }).eq('telegram_id', str(referrer_telegram_id)).execute()
                                    
                                    print(f"💰 Awarded 1,000 TAMA to {referrer_telegram_id} (new balance: {new_tama})")
                                else:
                                    # Создать нового пользователя если его нет
                                    referrer_ref_code = generate_referral_code(referrer_telegram_id)
                                    supabase.table('leaderboard').insert({
                                        'telegram_id': str(referrer_telegram_id),
                                        'telegram_username': referrer_username,
                                        'wallet_address': f'telegram_{referrer_telegram_id}',  # Placeholder
                                        'tama': 1000,
                                        'referral_code': referrer_ref_code
                                    }).execute()
                                    print(f"💰 Created new user and awarded 1,000 TAMA to {referrer_telegram_id}")
                                
                                # Создать запись в referrals для отслеживания (NO WALLET!)
                                # Check if referral record already exists
                                existing_ref = supabase.table('referrals').select('*').eq('referrer_telegram_id', str(referrer_telegram_id)).eq('referred_telegram_id', str(user_id)).execute()
                                
                                if not existing_ref.data:
                                    supabase.table('referrals').insert({
                                        'referrer_telegram_id': str(referrer_telegram_id),
                                        'referred_telegram_id': str(user_id),
                                        'referrer_address': f'telegram_{referrer_telegram_id}',  # Placeholder
                                        'referred_address': f'telegram_{user_id}',  # Placeholder
                                        'referral_code': ref_code,
                                        'level': 1,
                                        'signup_reward': 1000
                                    }).execute()
                                    print(f"✅ Created referral record for {referrer_telegram_id} -> {user_id}")
                                    
                                    # 🎁 ПРОВЕРКА МИЛЕСТОУНОВ
                                    try:
                                        # Подсчитать общее количество рефералов
                                        total_refs_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', str(referrer_telegram_id)).execute()
                                        total_pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', str(referrer_telegram_id)).eq('status', 'pending').execute()
                                        
                                        total_referrals = (total_refs_response.count or 0) + (total_pending_response.count or 0)
                                        
                                        # Проверить милестоуны
                                        milestone_bonus = 0
                                        milestone_text = ""
                                        
                                        if total_referrals == 5:
                                            milestone_bonus = 1000
                                            milestone_text = "🎉 **MILESTONE ACHIEVED!**\n\n🏆 **5 Referrals → +1,000 TAMA Bonus!**"
                                        elif total_referrals == 10:
                                            milestone_bonus = 3000
                                            milestone_text = "🎉 **MILESTONE ACHIEVED!**\n\n🏆 **10 Referrals → +3,000 TAMA Bonus!**"
                                        elif total_referrals == 25:
                                            milestone_bonus = 10000
                                            milestone_text = "🎉 **MILESTONE ACHIEVED!**\n\n🏆 **25 Referrals → +10,000 TAMA Bonus!**"
                                        elif total_referrals == 50:
                                            milestone_bonus = 30000
                                            milestone_text = "🎉 **MILESTONE ACHIEVED!**\n\n🏆 **50 Referrals → +30,000 TAMA Bonus!**"
                                        elif total_referrals == 100:
                                            milestone_bonus = 100000
                                            milestone_text = "🎉 **LEGENDARY MILESTONE!**\n\n🏆 **100 Referrals → +100,000 TAMA + Legendary Badge!**"
                                        
                                        # Начислить милестоун бонус
                                        if milestone_bonus > 0:
                                            # Получить текущий баланс
                                            current_balance_response = supabase.table('leaderboard').select('tama').eq('telegram_id', str(referrer_telegram_id)).execute()
                                            current_balance = current_balance_response.data[0].get('tama', 0) if current_balance_response.data else 0
                                            new_balance = current_balance + milestone_bonus
                                            
                                            # Обновить баланс
                                            supabase.table('leaderboard').update({
                                                'tama': new_balance
                                            }).eq('telegram_id', str(referrer_telegram_id)).execute()
                                            
                                            print(f"🎁 Milestone bonus: {milestone_bonus} TAMA to {referrer_telegram_id} (new balance: {new_balance})")
                                            
                                            # Отправить уведомление о милестоуне
                                            try:
                                                bot.send_message(
                                                    int(referrer_telegram_id), 
                                                    milestone_text, 
                                                    parse_mode='Markdown'
                                                )
                                                print(f"🎁 Sent milestone notification to {referrer_telegram_id}")
                                            except Exception as milestone_notify_error:
                                                print(f"Error sending milestone notification: {milestone_notify_error}")
                                                
                                    except Exception as milestone_error:
                                        print(f"Error processing milestone: {milestone_error}")
                                    
                                    # 🔔 УВЕДОМЛЕНИЕ РЕФЕРЕРУ О НОВОМ РЕФЕРАЛЕ
                                    try:
                                        notification_text = f"""
🎉 *New Referral!*

👤 *New user joined:* {username}
💰 *You earned:* 1,000 TAMA
📊 *Your total referrals:* {total_referrals + 1}

🔗 *Keep sharing your link to earn more!*
                                        """
                                        
                                        bot.send_message(
                                            int(referrer_telegram_id), 
                                            notification_text, 
                                            parse_mode='Markdown'
                                        )
                                        print(f"🔔 Sent notification to referrer {referrer_telegram_id}")
                                        
                                    except Exception as notify_error:
                                        print(f"Error sending notification: {notify_error}")
                                    
                            except Exception as tama_error:
                                print(f"Error awarding TAMA: {tama_error}")
                                log_error("tama_award_error", str(tama_error), user_id)
                except Exception as e:
                    print(f"Error saving pending referral: {e}")
                
                # Send welcome with referral info
                welcome_text = f"""
🎉 *Welcome to Solana Tamagotchi!*

You were invited by a friend! 🎁

🔗 *Start earning TAMA:*
• Get your referral link below
• Share with friends = 1,000 TAMA each!
• Level 2 referrals = 500 TAMA each!
• Milestone bonuses up to 100,000 TAMA!

🎮 *Game Features:*
• 🐾 Adopt & nurture NFT pets
• 🏆 Climb leaderboards
• 🎨 Mint unique pet NFTs
• 💎 Daily rewards & achievements

🚀 *Ready to start earning?*
                """
                
                keyboard = types.InlineKeyboardMarkup()
                keyboard.row(
                    types.InlineKeyboardButton("🔗 Get My Referral Link", callback_data="get_referral"),
                    types.InlineKeyboardButton("📊 My Stats", callback_data="my_stats")
                )
                keyboard.row(
                    types.InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard"),
                    types.InlineKeyboardButton("⭐ Reviews & Feedback", url="https://t.me/gotchigamechat")
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
    # Get user stats
    telegram_id = str(message.from_user.id)
    streak_days = daily_rewards.get_streak(telegram_id)
    can_claim, _ = daily_rewards.can_claim(telegram_id)
    
    welcome_text = f"""
🎮 *Welcome to Solana Tamagotchi!*

*The ultimate Play-to-Earn NFT pet game on Solana!*
🚀 *Currently in pre-launch phase - building our community!*

✨ *What you can do RIGHT NOW:*
• 🎁 **Daily Rewards** - Claim your daily TAMA! (Streak: {streak_days} days)
• 🎮 **Mini-Games** - Play and earn TAMA tokens!
• 🔗 **Referral Program** - 1,000 TAMA per friend!
• 🏅 **Badges & Ranks** - Collect achievements!
• 🎯 **Quests** - Complete challenges for bonuses!

💡 *Start earning TAMA today - no wallet needed!*
    """
    
    # Create inline keyboard with gamification
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
    
    # Row 1: Daily Reward (highlight if available)
    daily_emoji = "🎁✨" if can_claim else "🎁"
    keyboard.row(
        types.InlineKeyboardButton(f"{daily_emoji} Daily Reward", callback_data="daily_reward")
    )
    
    # Row 2: Games & Referral
    keyboard.row(
        types.InlineKeyboardButton("🎮 Mini-Games", callback_data="mini_games"),
        types.InlineKeyboardButton("🔗 Referral", callback_data="get_referral")
    )
    
    # Row 3: Stats & Quests
    keyboard.row(
        types.InlineKeyboardButton("📊 My Stats", callback_data="my_stats_detailed"),
        types.InlineKeyboardButton("🎯 Quests", callback_data="view_quests")
    )
    
    # Row 4: Badges & Rank
    keyboard.row(
        types.InlineKeyboardButton("🏅 Badges", callback_data="view_badges"),
        types.InlineKeyboardButton("⭐ My Rank", callback_data="view_rank")
    )
    
    # Row 5: Leaderboard & Community
    keyboard.row(
        types.InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard"),
        types.InlineKeyboardButton("👥 Community", url="https://t.me/gotchigamechat")
    )
    
    bot.reply_to(message, welcome_text, parse_mode='Markdown', reply_markup=keyboard)

# Handle callback queries - REMOVED DUPLICATE

# Private commands (personal data)
@bot.message_handler(commands=['analytics'], func=lambda message: message.chat.type == 'private')
def send_analytics(message):
    """Show referral analytics"""
    telegram_id = str(message.from_user.id)
    
    try:
        # Get referral stats
        ref_response = supabase.table('referrals').select('*').eq('referrer_telegram_id', telegram_id).execute()
        pending_response = supabase.table('pending_referrals').select('*').eq('referrer_telegram_id', telegram_id).execute()
        
        total_refs = len(ref_response.data or []) + len(pending_response.data or [])
        active_refs = len(ref_response.data or [])
        pending_refs = len(pending_response.data or [])
        
        # Get real TAMA balance from leaderboard
        leaderboard_response = supabase.table('leaderboard').select('tama').eq('telegram_id', telegram_id).execute()
        total_earned = leaderboard_response.data[0].get('tama', 0) if leaderboard_response.data else 0
        
        # Get last 5 referrals
        recent = (ref_response.data or [])[:5]
        recent_text = "\n".join([f"• {r.get('created_at', 'N/A')[:10]} - {r.get('signup_reward', 0)} TAMA" for r in recent]) or "No referrals yet"
        
        text = f"""
📊 *Referral Analytics:*

📈 *Overview:*
• Total Referrals: {total_refs}
• Active: {active_refs}
• Pending: {pending_refs}
• Total Earned: {total_earned} TAMA

📅 *Recent Referrals:*
{recent_text}

💡 *Tips:*
• Share your link in groups
• Use QR codes for offline
• Post on social media

Use /ref to get your link!
        """
        
        bot.reply_to(message, text, parse_mode='Markdown')
        
    except Exception as e:
        print(f"Error getting analytics: {e}")
        bot.reply_to(message, "❌ Error loading analytics")

@bot.message_handler(commands=['stats'], func=lambda message: message.chat.type == 'private')
def send_stats(message):
    telegram_id = str(message.from_user.id)
    username = message.from_user.username or message.from_user.first_name
    
    try:
        # Get player data from Supabase by telegram_id
        response = supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
        
        if response.data:
            player = response.data[0]
            
            # Get referral stats (active referrals with wallets)
            ref_l1_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).eq('level', 1).execute()
            ref_l2_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).eq('level', 2).execute()
            
            level1_count = ref_l1_response.count or 0
            level2_count = ref_l2_response.count or 0
            
            # Get pending referrals (not connected wallet yet)
            pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).eq('status', 'pending').execute()
            pending_count = pending_response.count or 0
            
            # Calculate total earned from referrals (use real TAMA balance)
            level1_earned = sum([r.get('signup_reward', 0) for r in ref_l1_response.data]) if ref_l1_response.data else 0
            level2_earned = sum([r.get('signup_reward', 0) for r in ref_l2_response.data]) if ref_l2_response.data else 0
            
            total_referrals = level1_count + level2_count + pending_count
            total_earned = player.get('tama', 0)  # Use real TAMA balance from leaderboard
            
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
• 👥 Total Referrals: {total_referrals}
• ✅ Level 1 Direct: {level1_count + pending_count} ({level1_earned + (pending_count * 100)} TAMA)
• ✅ Level 2 Indirect: {level2_count} ({level2_earned} TAMA)
• 💰 Total Earned: {total_earned} TAMA

👛 *Wallet:*
• `{player['wallet_address'][:8]}...{player['wallet_address'][-8:]}`

*Keep playing and referring friends to earn more!* 🚀
            """
        else:
            # No wallet linked yet - but show pending referrals!
            game_link = f"{GAME_URL}?tg_id={telegram_id}&tg_username={username}"
            
            # Get pending referrals even without wallet
            try:
                pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).eq('status', 'pending').execute()
                pending_count = pending_response.count or 0
            except:
                pending_count = 0
            
            text = f"""
📊 *Your Personal Stats:*

❌ *No wallet linked yet!*

🔗 *Your Referrals:*
• 👥 Total Referrals: {pending_count}
• 💰 Total Earned: {pending_count * 100} TAMA

To start playing and tracking your stats:
1️⃣ Click the button below
2️⃣ Connect your Phantom wallet
3️⃣ Your progress will be automatically saved!
4️⃣ All pending referrals will be activated!

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
    
    try:
        response = supabase.table('leaderboard').select('wallet_address').eq('telegram_id', telegram_id).execute()
        
        if response.data and len(response.data) > 0:
            existing = response.data[0]
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
        response = supabase.table('leaderboard').select('*').eq('wallet_address', wallet_address).execute()
        
        if response.data and len(response.data) > 0:
            wallet_data = response.data[0]
            
            supabase.table('leaderboard').update({
                'telegram_id': telegram_id,
                'telegram_username': username
            }).eq('wallet_address', wallet_address).execute()
            
            text = f"""
✅ *Wallet Linked Successfully!*

👛 *Wallet:* `{wallet_address[:8]}...{wallet_address[-8:]}`
🐾 *Pet:* {wallet_data.get('pet_name') or 'No pet yet'}
💰 *TAMA:* {wallet_data.get('tama') or 0}
📊 *Level:* {wallet_data.get('level') or 1}

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
        
    except Exception as e:
        print(f"Error linking wallet: {e}")
        text = "❌ Error linking wallet. Please try again later."
    
    bot.reply_to(message, text, parse_mode='Markdown')

@bot.message_handler(commands=['save'], func=lambda message: message.chat.type == 'private')
def save_pet_progress(message):
    """Save pet progress to database"""
    parts = message.text.split(maxsplit=2)
    if len(parts) < 3:
        bot.reply_to(message, "Usage: /save WALLET_ADDRESS {pet_data_json}")
        return
    
    wallet_address = parts[1]
    try:
        pet_data_str = parts[2]
        
        supabase.table('leaderboard').update({
            'pet_data': pet_data_str
        }).eq('wallet_address', wallet_address).execute()
        
        bot.reply_to(message, "✅ Pet progress saved!")
        
    except Exception as e:
        print(f"Error saving pet: {e}")
        bot.reply_to(message, "❌ Error saving pet progress")

@bot.message_handler(commands=['ref', 'referral'], func=lambda message: message.chat.type == 'private')
def send_referral(message):
    user_id = message.from_user.id
    username = message.from_user.username or message.from_user.first_name
    telegram_id = str(user_id)
    
    # Generate referral code from Telegram ID only (NO WALLET NEEDED!)
    ref_code = generate_referral_code(telegram_id)
    telegram_link = f"https://t.me/solana_tamagotchi_v3_bot?start=ref{ref_code}"
    game_link = f"{GAME_URL}?tg_id={user_id}&tg_username={username}"
    
    # Save referral code to database for fast lookup
    try:
        existing = supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
        
        if existing.data:
            supabase.table('leaderboard').update({
                'referral_code': ref_code,
                'telegram_username': username
            }).eq('telegram_id', telegram_id).execute()
        else:
            supabase.table('leaderboard').insert({
                'telegram_id': telegram_id,
                'telegram_username': username,
                'wallet_address': f'telegram_{telegram_id}',
                'tama': 0,
                'referral_code': ref_code
            }).execute()
    except Exception as e:
        print(f"Error saving referral code: {e}")
    
    # Get referral stats
    try:
        response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        total_referrals = response.count or 0
        
        pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).eq('status', 'pending').execute()
        pending_count = pending_response.count or 0
        
        # Get TAMA balance from leaderboard (real balance)
        leaderboard_response = supabase.table('leaderboard').select('tama').eq('telegram_id', telegram_id).execute()
        total_earnings = leaderboard_response.data[0].get('tama', 0) if leaderboard_response.data else 0
        
    except:
        total_referrals = 0
        total_earnings = 0
        pending_count = 0
    
    # Create super short beautiful referral link with preview (using query parameters for GitHub Pages)
    short_link = f"https://tr1h.github.io/solana-tamagotchi/s.html?ref={ref_code}&v=30"
    
    text = f"""
🔗 <b>Your Personal Referral Link:</b>

<code>{short_link}</code>

📊 <b>Your Stats:</b>
• 👥 Total Referrals: {total_referrals + pending_count}
• 💰 Total Earned: {total_earnings} TAMA

💰 <b>Earn instantly (NO WALLET NEEDED!):</b>
• 1,000 TAMA for each friend instantly!
• Just share your link and earn!
• TAMA accumulates in your account

🎁 <b>Milestone Bonuses:</b>
• 5 referrals → +1,000 TAMA
• 10 referrals → +3,000 TAMA
• 25 referrals → +10,000 TAMA
• 50 referrals → +30,000 TAMA
• 100 referrals → +100,000 TAMA + Legendary Badge!

📤 <b>Share with friends and start earning!</b>
    """
    
    keyboard = types.InlineKeyboardMarkup()
    keyboard.row(
        types.InlineKeyboardButton("🎮 Visit Site", url=game_link),
        types.InlineKeyboardButton("📤 Share Link", url=f"https://t.me/share/url?url={short_link}&text=🎮 Join me in Solana Tamagotchi! Get 1,000 TAMA bonus! No wallet needed!")
    )
    keyboard.row(
        types.InlineKeyboardButton("📱 Get QR Code", callback_data=f"qr_{ref_code}")
    )
    
    bot.reply_to(message, text, parse_mode='HTML', reply_markup=keyboard)

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
@bot.message_handler(commands=['start'], func=lambda message: message.chat.type in ['group', 'supergroup'])
def send_group_welcome(message):
    text = """🐾 <b>Welcome to Solana Tamagotchi Community!</b>

🎮 <b>What's this about?</b>
<b>Play-to-Earn NFT pet game</b> on Solana blockchain <i>(Coming Soon!)</i>
<b>Mint unique pets</b> and earn TAMA tokens <i>(Pre-launch)</i>
<b>Multi-level referral system</b> (1,000+500 TAMA per friend!)
<b>Daily rewards & achievements</b> <i>(Coming Soon)</i>
<b>Community-driven gameplay</b>

🚀 <b>Get Started (Pre-Launch):</b>
<b>Get referral link:</b> Message @solana_tamagotchi_v3_bot
<b>Start earning TAMA:</b> Share your referral link now!
<b>Join waitlist:</b> <a href="https://tr1h.github.io/solana-tamagotchi/?v=6">Landing Page</a>
<b>Use /help</b> for bot commands

💰 <b>Earn TAMA Tokens:</b>
<b>1,000 TAMA</b> for each friend you refer
<b>500 TAMA</b> for Level 2 referrals
<b>Milestone bonuses</b> up to 100,000 TAMA!

📢 <b>Stay Updated:</b>
<b>Twitter:</b> @GotchiGame
<b>News:</b> @gotchigamechat  
<b>Bot:</b> @solana_tamagotchi_v3_bot
<b>Community:</b> This group!

🎯 <b>Community Rules:</b>
✅ Share referral achievements & screenshots
✅ Ask questions & get help
✅ Discuss referral strategies & tips
❌ No spam or offensive content
❌ No fake giveaways or scams

🏆 <b>Pre-Launch Leaderboard:</b>
Use `/leaderboard` in the bot to see top referrers!

🚀 <b>Coming Soon:</b>
<b>Game Launch:</b> Coming Soon
<b>NFT Minting:</b> After game launch
<b>Full Play-to-Earn:</b> Coming soon!

---

<i>Let's build the biggest Tamagotchi community on Solana!</i> ✨

<i>Start earning TAMA today - no wallet needed to begin!</i> 🚀"""
    
    keyboard = types.InlineKeyboardMarkup()
    keyboard.row(
        types.InlineKeyboardButton("🤖 Message Bot", url="https://t.me/solana_tamagotchi_v3_bot"),
        types.InlineKeyboardButton("📋 Join Waitlist", url="https://tr1h.github.io/solana-tamagotchi/?v=6")
    )
    keyboard.row(
        types.InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard"),
        types.InlineKeyboardButton("📊 My Stats", callback_data="my_stats")
    )
    keyboard.row(
        types.InlineKeyboardButton("🔗 Get Referral Link", callback_data="get_referral")
    )
    
    bot.reply_to(message, text, parse_mode='HTML', reply_markup=keyboard)

@bot.message_handler(commands=['game'], func=lambda message: message.chat.type in ['group', 'supergroup'])
def send_game(message):
    text = """
🎮 *Game Coming Soon!*

🚀 *Pre-Launch Phase:*
• Game is currently in development
• Expected launch: Q4 2025
• Join waitlist to be notified when ready!

💰 *Start Earning Now:*
• Get your referral link from the bot
• Earn 1,000 TAMA for each friend
• Build your community before launch!

*Stay tuned for updates!* ✨
    """
    
    keyboard = types.InlineKeyboardMarkup()
    keyboard.row(
        types.InlineKeyboardButton("🤖 Get Referral Link", url="https://t.me/solana_tamagotchi_v3_bot"),
        types.InlineKeyboardButton("📋 Join Waitlist", url="https://tr1h.github.io/solana-tamagotchi/?v=6")
    )
    
    bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)

@bot.message_handler(commands=['mint'], func=lambda message: message.chat.type in ['group', 'supergroup'])
def send_mint(message):
    text = """
🚀 *NFT Minting Coming Soon!*

🎮 *Pre-Launch Phase:*
• NFT minting will be available after game launch
• Currently in development phase
• Join waitlist to be notified when ready!

💰 *Start Earning Now:*
• Get your referral link from the bot
• Earn 1,000 TAMA for each friend
• Build your community before launch!

*Stay tuned for updates!* ✨
    """
    
    keyboard = types.InlineKeyboardMarkup()
    keyboard.row(
        types.InlineKeyboardButton("🤖 Get Referral Link", url="https://t.me/solana_tamagotchi_v3_bot"),
        types.InlineKeyboardButton("📋 Join Waitlist", url="https://tr1h.github.io/solana-tamagotchi/?v=6")
    )
    
    bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)

@bot.message_handler(commands=['referral', 'ref'], func=lambda message: message.chat.type in ['group', 'supergroup'])
def send_group_referral_info(message):
    text = """💰 *Earn 1,000 TAMA per Friend\\!*

🔗 *How it works:*
• Message @solana\\_tamagotchi\\_v3\\_bot
• Get your personal referral link
• Share with friends
• Earn 1,000 TAMA for each friend\\!

🎁 *Bonus Rewards:*
• Level 2 referrals: 500 TAMA each
• Milestone bonuses up to 100,000 TAMA\\!
• Daily rewards & achievements

*Start earning today\\!* 🚀"""
    
    keyboard = types.InlineKeyboardMarkup()
    keyboard.row(
        types.InlineKeyboardButton("🤖 Get My Link", url="https://t.me/solana_tamagotchi_v3_bot"),
        types.InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard")
    )
    
    bot.reply_to(message, text, parse_mode='MarkdownV2', reply_markup=keyboard)

@bot.message_handler(commands=['leaderboard', 'top'])
def send_leaderboard(message):
    try:
        # Get referral leaderboard - top referrers by total referrals
        referral_stats = []
        
        # Get all users with their referral counts
        users_response = supabase.table('leaderboard').select('pet_name, telegram_username, telegram_id, wallet_address').execute()
        
        for user in users_response.data:
            wallet_address = user.get('wallet_address')
            telegram_id = user.get('telegram_id')
            
            if wallet_address and telegram_id:
                # Count active referrals (with wallets)
                active_refs = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', str(telegram_id)).execute()
                active_count = active_refs.count or 0
                
                # Count pending referrals (without wallets yet)
                pending_refs = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', str(telegram_id)).eq('status', 'pending').execute()
                pending_count = pending_refs.count or 0
                
                # Only count active referrals for leaderboard (no pending)
                total_referrals = active_count
                
                if total_referrals > 0:  # Only show users with referrals
                    # Get TAMA balance
                    tama_response = supabase.table('leaderboard').select('tama').eq('telegram_id', str(telegram_id)).execute()
                    tama_balance = tama_response.data[0].get('tama', 0) if tama_response.data else 0
                    
                    referral_stats.append({
                        'name': user.get('pet_name', user.get('telegram_username', 'Anonymous')) or 'Anonymous',
                        'active': active_count,
                        'pending': pending_count,
                        'total': total_referrals,
                        'tama': tama_balance
                    })
        
        # Sort by total referrals
        referral_stats.sort(key=lambda x: x['total'], reverse=True)
        
        # Build referral leaderboard
        referral_text = ""
        if referral_stats:
            # Show more users in private chats
            max_users = 10 if message.chat.type == 'private' else 5
            for i, user in enumerate(referral_stats[:max_users], 1):
                medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
                name = user['name']
                total = user['total']
                active = user['active']
                pending = user['pending']
                tama_balance = user['tama']
                
                referral_text += f"{medal} {name} - {active} referrals ({tama_balance:,} TAMA)\n"
        else:
            referral_text = "No referrals yet!\n\n🔗 Start referring friends!"
        
        text = f"""
🏆 <b>Referral Leaderboard:</b>

<b>Top Referrers:</b>
{referral_text}

💡 <b>How to earn:</b>
• Share your referral link
• Get 1,000 TAMA per friend
• Milestone bonuses available!

🎯 <b>Get your link:</b> /ref
        """
        
        # Add interactive buttons
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🔗 Get My Link", callback_data="get_referral"),
            types.InlineKeyboardButton("📊 My Stats", callback_data="my_stats")
        )
        
    except Exception as e:
        print(f"Error getting referral leaderboard: {e}")
        text = """
🏆 <b>Referral Leaderboard:</b>

❌ <b>Error loading leaderboard</b>

Please try again later!
        """
        keyboard = None
    
    if keyboard:
        bot.reply_to(message, text, parse_mode='HTML', reply_markup=keyboard)
    else:
        bot.reply_to(message, text, parse_mode='HTML')

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
    user_id = message.from_user.id
    telegram_id = str(user_id)
    
    try:
        # Get player data from Supabase
        response = supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
        
        if response.data:
            player = response.data[0]
            
            # Get referral stats
            ref_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
            pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).eq('status', 'pending').execute()
            
            total_referrals = ref_response.count or 0
            pending_count = pending_response.count or 0
            # Show correct TAMA balance (use actual balance from database)
            base_tama = player.get('tama', 0)
            total_earned = base_tama
            
            stats_text = f"""
📊 **Your Statistics:**

👥 Total Referrals: {total_referrals + pending_count}
💰 TAMA Earned: {total_earned:,}
🔗 Referral Code: {player.get('referral_code', 'Generate with /ref')}

Start inviting friends with /ref to earn more rewards! 🚀
            """
        else:
            stats_text = """
📊 **Your Statistics:**

👥 Referrals: 0
💰 TAMA Earned: 0

Start inviting friends with /ref to earn rewards! 🚀
            """
    except Exception as e:
        print(f"Error getting stats: {e}")
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

@bot.message_handler(commands=['monitor'], func=lambda message: message.chat.type == 'private')
def show_monitoring_stats(message):
    """Show monitoring statistics for admin"""
    if not is_admin(message.from_user.id):
        bot.reply_to(message, "❌ Admin only")
        return
    
    try:
        current_minute = int(time.time() // 60)
        requests_this_minute = monitoring_stats['requests_per_minute'][current_minute]
        
        stats_text = f"""
📊 **MONITORING STATISTICS**

🚨 **Security:**
• Suspicious Activities: {monitoring_stats['suspicious_activities']}
• Errors Count: {monitoring_stats['errors_count']}
• Requests This Minute: {requests_this_minute}

📈 **Activity:**
• Referrals Today: {monitoring_stats['referrals_today']}

🕐 **Last Updated:** {datetime.now().strftime("%H:%M:%S")}

💡 **Alerts:** Active monitoring enabled
        """
        
        bot.reply_to(message, stats_text, parse_mode='Markdown')
        
    except Exception as e:
        log_error("monitoring_error", str(e), message.from_user.id)
        bot.reply_to(message, f"❌ Error getting stats: {str(e)}")

# ==================== GAMIFICATION COMMANDS ====================

@bot.message_handler(commands=['daily'], func=lambda message: message.chat.type == 'private')
def claim_daily_reward(message):
    """Claim daily reward"""
    telegram_id = str(message.from_user.id)
    
    try:
        success, streak_days, reward_amount = daily_rewards.claim_reward(telegram_id)
        
        if success:
            # Check for streak milestones
            milestone_text = ""
            if streak_days == 7:
                milestone_text = "\n\n🎉 **WEEK MILESTONE!** 7 дней подряд!"
            elif streak_days == 14:
                milestone_text = "\n\n🔥 **2 WEEKS!** Невероятный стрик!"
            elif streak_days == 30:
                milestone_text = "\n\n👑 **МЕСЯЦ!** Ты легенда!"
            
            text = f"""
✅ **Daily Reward Claimed!**

💰 **Награда:** +{reward_amount:,} TAMA
🔥 **Стрик:** {streak_days} дней подряд
📅 **Следующая:** через 24 часа{milestone_text}

💡 **Возвращайся каждый день для больших наград!**
            """
            
            # Award streak badges
            if streak_days == 7:
                badge_system.award_badge(telegram_id, 'week_warrior')
            elif streak_days == 30:
                badge_system.award_badge(telegram_id, 'streak_master')
        else:
            # Calculate time until next claim
            can_claim, current_streak = daily_rewards.can_claim(telegram_id)
            text = f"""
⏰ **Already Claimed Today!**

🔥 **Current Streak:** {current_streak} дней
📅 **Вернись завтра** для следующей награды!

💡 **Не пропусти день, чтобы не сбросить стрик!**
            """
        
        bot.reply_to(message, text, parse_mode='Markdown')
        
    except Exception as e:
        print(f"Error claiming daily reward: {e}")
        bot.reply_to(message, "❌ Ошибка при получении награды. Попробуй позже.")

@bot.message_handler(commands=['games'], func=lambda message: message.chat.type == 'private')
def show_games_menu(message):
    """Show mini-games menu"""
    telegram_id = str(message.from_user.id)
    
    try:
        can_play, games_played = mini_games.can_play(telegram_id)
        games_left = 3 - games_played
        
        text = f"""
🎮 **Мини-Игры**

💰 **Играй и зарабатывай TAMA!**

🎯 **Доступные игры:**
• Угадай Число (1-100) - до 500 TAMA
• Solana Викторина - 100 TAMA
• Колесо Фортуны - до 500 TAMA

📊 **Лимит:** {games_left}/3 игр осталось сегодня

💡 **Выбери игру:**
        """
        
        keyboard = types.InlineKeyboardMarkup()
        if can_play:
            keyboard.row(
                types.InlineKeyboardButton("🎯 Угадай Число", callback_data="game_guess"),
                types.InlineKeyboardButton("❓ Викторина", callback_data="game_trivia")
            )
            keyboard.row(
                types.InlineKeyboardButton("🎰 Колесо Фортуны", callback_data="game_wheel")
            )
        keyboard.row(
            types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu")
        )
        
        bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)
        
    except Exception as e:
        print(f"Error showing games: {e}")
        bot.reply_to(message, "❌ Ошибка загрузки игр")

@bot.message_handler(commands=['badges'], func=lambda message: message.chat.type == 'private')
def show_user_badges(message):
    """Show user badges"""
    telegram_id = str(message.from_user.id)
    
    try:
        user_badges = badge_system.get_user_badges(telegram_id)
        
        if user_badges:
            badges_text = "\n".join([f"{b['name']} - {b['desc']}" for b in user_badges])
        else:
            badges_text = "Пока нет значков. Играй и приглашай друзей!"
        
        text = f"""
🏅 **Твои Значки**

{badges_text}

💡 **Как получить больше:**
• 🐦 Early Bird - Будь в первых 100
• 🔥 Streak Master - 30 дней подряд
• 👑 Referral King - 50+ рефералов
• 💎 Generous - 100+ рефералов
• 🎮 Gamer - 100 мини-игр
• 🍀 Lucky - Джекпот в рулетке
        """
        
        bot.reply_to(message, text, parse_mode='Markdown')
        
    except Exception as e:
        print(f"Error showing badges: {e}")
        bot.reply_to(message, "❌ Ошибка загрузки значков")

@bot.message_handler(commands=['rank'], func=lambda message: message.chat.type == 'private')
def show_user_rank(message):
    """Show user rank"""
    telegram_id = str(message.from_user.id)
    
    try:
        # Get referral count
        ref_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        
        total_refs = (ref_response.count or 0) + (pending_response.count or 0)
        
        # Update and get rank
        rank_changed, rank_id, rank_data = rank_system.update_rank(telegram_id, total_refs)
        
        # Get next rank
        next_rank = None
        for r_id, r_data in RANKS.items():
            if r_data['min_refs'] > total_refs:
                next_rank = (r_id, r_data)
                break
        
        progress_bar = "▰" * (total_refs % 5) + "▱" * (5 - (total_refs % 5))
        
        text = f"""
{rank_data['emoji']} **Твой Ранг: {rank_data['name']}**

📊 **Статистика:**
• Рефералы: {total_refs}
• Прогресс: {progress_bar}
        """
        
        if next_rank:
            refs_needed = next_rank[1]['min_refs'] - total_refs
            text += f"""

🎯 **Следующий ранг:** {next_rank[1]['name']}
📈 **Осталось:** {refs_needed} рефералов
        """
        else:
            text += "\n\n👑 **Максимальный ранг достигнут!**"
        
        bot.reply_to(message, text, parse_mode='Markdown')
        
    except Exception as e:
        print(f"Error showing rank: {e}")
        bot.reply_to(message, "❌ Ошибка загрузки ранга")

@bot.message_handler(commands=['quests'], func=lambda message: message.chat.type == 'private')
def show_quests(message):
    """Show quests"""
    telegram_id = str(message.from_user.id)
    
    try:
        # Get referral count
        ref_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        
        total_refs = (ref_response.count or 0) + (pending_response.count or 0)
        
        # Check quests
        completed_quests = quest_system.check_quests(telegram_id, total_refs)
        
        text = "🎯 **Квесты Рефералов**\n\n"
        
        for quest_id, quest_data in QUESTS.items():
            progress = min(total_refs, quest_data['target'])
            percentage = int((progress / quest_data['target']) * 100)
            
            if total_refs >= quest_data['target']:
                status = "✅"
            else:
                status = f"{progress}/{quest_data['target']}"
            
            text += f"{status} **{quest_data['name']}**\n"
            text += f"   {quest_data['desc']}\n"
            text += f"   Награда: {quest_data['reward']:,} TAMA\n\n"
        
        text += "💡 **Приглашай друзей для выполнения квестов!**"
        
        bot.reply_to(message, text, parse_mode='Markdown')
        
    except Exception as e:
        print(f"Error showing quests: {e}")
        bot.reply_to(message, "❌ Ошибка загрузки квестов")

# Welcome new members
@bot.message_handler(content_types=['new_chat_members'])
def welcome_new_member(message):
    for new_member in message.new_chat_members:
        welcome_text = f"""🎮 Welcome to Solana Tamagotchi Community, {new_member.first_name}!

🐾 What's this about?
<b>Play-to-Earn NFT pet game</b> on Solana blockchain <i>(Coming Soon!)</i>
<b>Mint unique pets</b> and earn TAMA tokens <i>(Pre-launch)</i>
<b>Multi-level referral system</b> (1,000+500 TAMA per friend!)
<b>Daily rewards & achievements</b> <i>(Coming Soon)</i>
<b>Community-driven gameplay</b>

🚀 Get Started (Pre-Launch):
<b>Get referral link:</b> Message @solana_tamagotchi_v3_bot
<b>Start earning TAMA:</b> Share your referral link now!
<b>Join waitlist:</b> <a href="https://tr1h.github.io/solana-tamagotchi/?v=6">Landing Page</a>
<b>Use /help</b> for bot commands

💰 Earn TAMA Tokens:
<b>1,000 TAMA</b> for each friend you refer
<b>500 TAMA</b> for Level 2 referrals
<b>Milestone bonuses</b> up to 100,000 TAMA!

📢 Stay Updated:
<b>Twitter:</b> @GotchiGame
<b>News:</b> @gotchigamechat
<b>Bot:</b> @solana_tamagotchi_v3_bot
<b>Community:</b> This group!

🚀 Coming Soon:
<b>Game Launch:</b> Coming Soon
<b>NFT Minting:</b> After game launch

Let's build the biggest Tamagotchi community on Solana! ✨

<i>Start earning TAMA today - no wallet needed to begin!</i> 🚀"""
        
        # Create welcome keyboard
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🤖 Message Bot", url="https://t.me/solana_tamagotchi_v3_bot"),
            types.InlineKeyboardButton("📋 Join Waitlist", url="https://tr1h.github.io/solana-tamagotchi/?v=6")
        )
        keyboard.row(
            types.InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard"),
            types.InlineKeyboardButton("📊 My Stats", callback_data="my_stats")
        )
        keyboard.row(
            types.InlineKeyboardButton("🔗 Get Referral Link", callback_data="get_referral")
        )
        
        bot.send_message(message.chat.id, welcome_text, parse_mode='HTML', reply_markup=keyboard)

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
        
        # Post to group instead of channel
        bot.send_message(GROUP_ID, stats_text, parse_mode='Markdown')
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
        username = call.from_user.username or call.from_user.first_name
        telegram_id = str(user_id)
        
        # Generate referral code
        ref_code = generate_referral_code(telegram_id)
        short_link = f"https://tr1h.github.io/solana-tamagotchi/s.html?ref={ref_code}&v=30"
        
        # Get referral stats
        try:
            response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
            total_referrals = response.count or 0
            
            pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).eq('status', 'pending').execute()
            pending_count = pending_response.count or 0
            
            # Get TAMA balance
            leaderboard_response = supabase.table('leaderboard').select('tama').eq('telegram_id', telegram_id).execute()
            total_earnings = leaderboard_response.data[0].get('tama', 0) if leaderboard_response.data else 0
            
        except:
            total_referrals = 0
            pending_count = 0
            total_earnings = 0
        
        text = f"""
🔗 <b>Your Personal Referral Link:</b>

<code>{short_link}</code>

📊 <b>Your Stats:</b>
• 👥 Total Referrals: {total_referrals + pending_count}
• 💰 Total Earned: {total_earnings} TAMA

💰 <b>Earn instantly (NO WALLET NEEDED!):</b>
• 1,000 TAMA for each friend instantly!
• Just share your link and earn!
• TAMA accumulates in your account

🎁 <b>Milestone Bonuses:</b>
• 5 referrals → +1,000 TAMA
• 10 referrals → +3,000 TAMA
• 25 referrals → +10,000 TAMA
• 50 referrals → +30,000 TAMA
• 100 referrals → +100,000 TAMA + Legendary Badge!

📤 <b>Share with friends and start earning!</b>
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🎮 Visit Site", url=short_link),
            types.InlineKeyboardButton("📤 Share Link", url=f"https://t.me/share/url?url={short_link}&text=🎮 Join me in Solana Tamagotchi! Get 1,000 TAMA bonus! No wallet needed!")
        )
        keyboard.row(
            types.InlineKeyboardButton("📱 Get QR Code", callback_data=f"qr_{ref_code}")
        )
        keyboard.row(
            types.InlineKeyboardButton("🔙 Back to Menu", callback_data="back_to_menu")
        )
        
        try:
            bot.edit_message_text(text, call.message.chat.id, call.message.message_id, 
                                parse_mode='HTML', reply_markup=keyboard)
        except Exception as e:
            print(f"Error editing message: {e}")
            # Send new message if edit fails
            bot.send_message(call.message.chat.id, text, parse_mode='HTML', reply_markup=keyboard)
    
    elif call.data == "my_stats":
        # Create stats with back button for callback
        telegram_id = str(call.from_user.id)
        username = call.from_user.username or call.from_user.first_name
        
        try:
            # Get player data from Supabase by telegram_id
            response = supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
            
            if response.data:
                player = response.data[0]
                
                # Get referral stats
                ref_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
                pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).eq('status', 'pending').execute()
                
                total_referrals = ref_response.count or 0
                pending_count = pending_response.count or 0
                # Show correct TAMA balance (use actual balance from database)
                base_tama = player.get('tama', 0)
                total_earned = base_tama
                
                text = f"""
📊 <b>Your Personal Stats:</b>

🐾 <b>Your Pet:</b>
• Name: {player.get('pet_name', 'No pet yet')}
• Type: {player.get('pet_type', 'N/A')}
• Rarity: {player.get('pet_rarity', 'N/A')}
• Level: {player.get('level', 1)}
• XP: {player.get('xp', 0)}

💰 <b>Your Balance:</b>
• TAMA Tokens: {total_earned:,}

🔗 <b>Your Referrals:</b>
• Level 1 Direct: {total_referrals + pending_count}
• Pending (no wallet): {pending_count}
• Total Referrals: {total_referrals + pending_count}
• Total Earned: {total_earned:,} TAMA

👛 <b>Wallet:</b>
• <code>{player['wallet_address'][:8]}...{player['wallet_address'][-8:]}</code>

🎯 <b>Your Referral Code:</b>
• <code>{player.get('referral_code', 'Generate with /ref')}</code>

<i>Keep playing and referring friends to earn more!</i> 🚀
                """
            else:
                # No wallet linked yet
                text = f"""
📊 <b>Your Personal Stats:</b>

❌ <b>No wallet linked yet!</b>

To start playing and tracking your stats:
1️⃣ Use /ref to get your personal link
2️⃣ Connect your Phantom wallet
3️⃣ Your progress will be automatically saved!

🎮 <b>Ready to start?</b>
                """
            
        except Exception as e:
            print(f"Error getting stats: {e}")
            text = "❌ Error getting your stats. Please try again later."
        
        # Add back button
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🔙 Back to Menu", callback_data="back_to_menu")
        )
        
        try:
            bot.edit_message_text(text, call.message.chat.id, call.message.message_id, 
                                parse_mode='HTML', reply_markup=keyboard)
        except Exception as e:
            print(f"Error editing message: {e}")
            bot.send_message(call.message.chat.id, text, parse_mode='HTML', reply_markup=keyboard)
    
    elif call.data == "leaderboard":
        try:
            # Get referral leaderboard - top referrers by total referrals
            referral_stats = []
            
            # Get all users with their referral counts
            users_response = supabase.table('leaderboard').select('pet_name, telegram_username, telegram_id, wallet_address').execute()
            
            for user in users_response.data:
                wallet_address = user.get('wallet_address')
                telegram_id = user.get('telegram_id')
                
                if wallet_address and telegram_id:
                    # Count active referrals (with wallets)
                    active_refs = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', str(telegram_id)).execute()
                    active_count = active_refs.count or 0
                    
                    # Count pending referrals (without wallets yet)
                    pending_refs = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', str(telegram_id)).eq('status', 'pending').execute()
                    pending_count = pending_refs.count or 0
                    
                    total_referrals = active_count + pending_count
                    
                    if total_referrals > 0:  # Only show users with referrals
                        # Get TAMA balance
                        tama_response = supabase.table('leaderboard').select('tama').eq('telegram_id', str(telegram_id)).execute()
                        tama_balance = tama_response.data[0].get('tama', 0) if tama_response.data else 0
                        
                        # Get better name
                        name = user.get('pet_name')
                        if not name:
                            name = user.get('telegram_username')
                        if not name:
                            name = f"User {user.get('telegram_id', 'Unknown')}"
                        
                        referral_stats.append({
                            'name': name,
                            'active': active_count,
                            'pending': pending_count,
                            'total': total_referrals,
                            'tama': tama_balance
                        })
            
            # Sort by total referrals
            referral_stats.sort(key=lambda x: x['total'], reverse=True)
            
            # Build referral leaderboard
            referral_text = ""
            if referral_stats:
                for i, user in enumerate(referral_stats[:10], 1):  # Top 10
                    medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
                    name = user['name']
                    total = user['total']
                    active = user['active']
                    pending = user['pending']
                    
                    # Show actual TAMA balance from database
                    display_tama = tama_balance
                    referral_text += f"{medal} {name} - {total} referrals ({display_tama:,} TAMA)\n"
            else:
                referral_text = "No referrals yet!\n\n🔗 Start referring friends to climb the ranks!"
            
            text = f"""
🏆 <b>Referral Leaderboard:</b>

<b>Top Referrers:</b>
{referral_text}

💡 <b>How to earn:</b>
• Share your referral link
• Get 1,000 TAMA per friend
• Milestone bonuses available!

🎯 <b>Get your link:</b> /ref
            """
            
            # Add interactive buttons
            keyboard = types.InlineKeyboardMarkup()
            keyboard.row(
                types.InlineKeyboardButton("🔗 Get My Link", callback_data="get_referral"),
                types.InlineKeyboardButton("📊 My Stats", callback_data="my_stats")
            )
            keyboard.row(
                types.InlineKeyboardButton("🔙 Back to Menu", callback_data="back_to_menu")
            )
            
        except Exception as e:
            print(f"Error getting referral leaderboard: {e}")
            text = """
🏆 <b>Referral Leaderboard:</b>

❌ <b>Error loading leaderboard</b>

Please try again later!
            """
            
            # Add back button
            keyboard = types.InlineKeyboardMarkup()
            keyboard.row(
                types.InlineKeyboardButton("🔙 Back to Menu", callback_data="back_to_menu")
            )
        
        try:
            bot.edit_message_text(text, call.message.chat.id, call.message.message_id, 
                                parse_mode='HTML', reply_markup=keyboard)
        except Exception as e:
            print(f"Error editing message: {e}")
            bot.send_message(call.message.chat.id, text, parse_mode='HTML', reply_markup=keyboard)
    
    elif call.data == "rules":
        text = """
📋 *Community Rules:*

✅ *Allowed:*
• Game discussions & strategies
• Sharing achievements & screenshots
• Referral links & codes
• Help requests & questions
• Trading & marketplace discussions
• Pet evolution tips
• TAMA earning strategies

❌ *Not Allowed:*
• Spam, flooding or repetitive messages
• Offensive language or harassment
• Scam links or fake giveaways
• NSFW content or inappropriate media
• Impersonation or fake accounts
• Price manipulation discussions
• Off-topic political/religious content

🚫 *Violations result in:*
• Warning → Mute → Ban
• Severe violations = instant ban

💡 *Tips for better experience:*
• Use English for global communication
• Be respectful to all community members
• Report suspicious activity to admins
• Follow Discord/Telegram ToS

🎮 *Let's keep it fun and friendly\\!*
        """
        
        # Add back button
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🔙 Back to Menu", callback_data="back_to_menu")
        )
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, 
                            reply_markup=keyboard)
    
    elif call.data.startswith("qr_"):
        ref_code = call.data[3:]
        short_link = f"https://tr1h.github.io/solana-tamagotchi/s.html?ref={ref_code}&v=30"
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(short_link)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to bytes
        bio = io.BytesIO()
        img.save(bio, 'PNG')
        bio.seek(0)
        
        # Add back button to QR code
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🔙 Back to Referral", callback_data="get_referral")
        )
        
        bot.send_photo(call.message.chat.id, bio, 
                      caption=f"📱 *Your Referral QR Code*\n\n`{short_link}`\n\nScan to join!", 
                      parse_mode='Markdown', reply_markup=keyboard)
    
    # ==================== NEW MENU CALLBACKS ====================
    
    elif call.data == "daily_reward":
        # Handle daily reward from button
        telegram_id = str(call.from_user.id)
        
        success, streak_days, reward_amount = daily_rewards.claim_reward(telegram_id)
        
        if success:
            milestone_text = ""
            if streak_days == 7:
                milestone_text = "\n\n🎉 **WEEK MILESTONE!** 7 дней подряд!"
            elif streak_days == 14:
                milestone_text = "\n\n🔥 **2 WEEKS!** Невероятный стрик!"
            elif streak_days == 30:
                milestone_text = "\n\n👑 **МЕСЯЦ!** Ты легенда!"
            
            text = f"""
✅ **Daily Reward Claimed!**

💰 **Награда:** +{reward_amount:,} TAMA
🔥 **Стрик:** {streak_days} дней подряд
📅 **Следующая:** через 24 часа{milestone_text}

💡 **Возвращайся каждый день для больших наград!**
            """
            
            if streak_days == 7:
                badge_system.award_badge(telegram_id, 'week_warrior')
            elif streak_days == 30:
                badge_system.award_badge(telegram_id, 'streak_master')
        else:
            can_claim, current_streak = daily_rewards.can_claim(telegram_id)
            text = f"""
⏰ **Already Claimed Today!**

🔥 **Current Streak:** {current_streak} дней
📅 **Вернись завтра** для следующей награды!

💡 **Не пропусти день, чтобы не сбросить стрик!**
            """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu"))
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                            parse_mode='Markdown', reply_markup=keyboard)
    
    elif call.data == "mini_games":
        # Show games menu
        telegram_id = str(call.from_user.id)
        can_play, games_played = mini_games.can_play(telegram_id)
        games_left = 3 - games_played
        
        text = f"""
🎮 **Мини-Игры**

💰 **Играй и зарабатывай TAMA!**

🎯 **Доступные игры:**
• Угадай Число (1-100) - до 500 TAMA
• Solana Викторина - 100 TAMA
• Колесо Фортуны - до 500 TAMA

📊 **Лимит:** {games_left}/3 игр осталось сегодня

💡 **Выбери игру:**
        """
        
        keyboard = types.InlineKeyboardMarkup()
        if can_play:
            keyboard.row(
                types.InlineKeyboardButton("🎯 Угадай Число", callback_data="game_guess"),
                types.InlineKeyboardButton("❓ Викторина", callback_data="game_trivia")
            )
            keyboard.row(
                types.InlineKeyboardButton("🎰 Колесо Фортуны", callback_data="game_wheel")
            )
        keyboard.row(types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu"))
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                            parse_mode='Markdown', reply_markup=keyboard)
    
    elif call.data == "view_badges":
        # Show badges
        telegram_id = str(call.from_user.id)
        user_badges = badge_system.get_user_badges(telegram_id)
        
        if user_badges:
            badges_text = "\n".join([f"• {b['name']} - {b['desc']}" for b in user_badges])
        else:
            badges_text = "Пока нет значков. Играй и приглашай друзей!"
        
        text = f"""
🏅 **Твои Значки**

{badges_text}

💡 **Как получить больше:**
• 🐦 Early Bird - Будь в первых 100
• 🔥 Streak Master - 30 дней подряд
• 👑 Referral King - 50+ рефералов
• 💎 Generous - 100+ рефералов
• 🎮 Gamer - 100 мини-игр
• 🍀 Lucky - Джекпот в рулетке
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu"))
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                            parse_mode='Markdown', reply_markup=keyboard)
    
    elif call.data == "view_rank":
        # Show rank
        telegram_id = str(call.from_user.id)
        
        ref_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        
        total_refs = (ref_response.count or 0) + (pending_response.count or 0)
        rank_changed, rank_id, rank_data = rank_system.update_rank(telegram_id, total_refs)
        
        next_rank = None
        for r_id, r_data in RANKS.items():
            if r_data['min_refs'] > total_refs:
                next_rank = (r_id, r_data)
                break
        
        progress_bar = "▰" * min(total_refs % 5, 5) + "▱" * max(5 - (total_refs % 5), 0)
        
        text = f"""
{rank_data['emoji']} **Твой Ранг: {rank_data['name']}**

📊 **Статистика:**
• Рефералы: {total_refs}
• Прогресс: {progress_bar}
        """
        
        if next_rank:
            refs_needed = next_rank[1]['min_refs'] - total_refs
            text += f"""

🎯 **Следующий ранг:** {next_rank[1]['name']}
📈 **Осталось:** {refs_needed} рефералов
        """
        else:
            text += "\n\n👑 **Максимальный ранг достигнут!**"
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu"))
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                            parse_mode='Markdown', reply_markup=keyboard)
    
    elif call.data == "view_quests":
        # Show quests
        telegram_id = str(call.from_user.id)
        
        ref_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        
        total_refs = (ref_response.count or 0) + (pending_response.count or 0)
        quest_system.check_quests(telegram_id, total_refs)
        
        text = "🎯 **Квесты Рефералов**\n\n"
        
        for quest_id, quest_data in QUESTS.items():
            progress = min(total_refs, quest_data['target'])
            
            if total_refs >= quest_data['target']:
                status = "✅"
            else:
                status = f"{progress}/{quest_data['target']}"
            
            text += f"{status} **{quest_data['name']}**\n"
            text += f"   {quest_data['desc']}\n"
            text += f"   Награда: {quest_data['reward']:,} TAMA\n\n"
        
        text += "💡 **Приглашай друзей для выполнения квестов!**"
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu"))
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                            parse_mode='Markdown', reply_markup=keyboard)
    
    elif call.data == "my_stats_detailed":
        # Detailed stats with gamification
        telegram_id = str(call.from_user.id)
        
        # Get all stats
        ref_response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', telegram_id).execute()
        leaderboard_response = supabase.table('leaderboard').select('tama').eq('telegram_id', telegram_id).execute()
        
        total_refs = (ref_response.count or 0) + (pending_response.count or 0)
        total_tama = leaderboard_response.data[0].get('tama', 0) if leaderboard_response.data else 0
        
        streak_days = daily_rewards.get_streak(telegram_id)
        rank_id, rank_data = rank_system.get_user_rank(telegram_id)
        user_badges = badge_system.get_user_badges(telegram_id)
        
        badges_count = len(user_badges)
        
        text = f"""
📊 **Твоя Полная Статистика**

💰 **TAMA Баланс:** {total_tama:,}
{rank_data['emoji']} **Ранг:** {rank_data['name']}

👥 **Рефералы:**
• Всего приглашено: {total_refs}
• Активные: {ref_response.count or 0}
• В ожидании: {pending_response.count or 0}

🔥 **Активность:**
• Стрик входов: {streak_days} дней
• Заработано значков: {badges_count}

📈 **Прогресс:**
{"▰" * min(total_refs % 10, 10)}{"▱" * max(10 - (total_refs % 10), 0)}

💡 **Продолжай играть и приглашать друзей!**
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🔗 Реферал", callback_data="get_referral"),
            types.InlineKeyboardButton("🎮 Игры", callback_data="mini_games")
        )
        keyboard.row(types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu"))
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                            parse_mode='Markdown', reply_markup=keyboard)
    
    # ==================== GAME CALLBACKS ====================
    
    elif call.data == "game_guess":
        # Guess the number game
        telegram_id = str(call.from_user.id)
        can_play, games_played = mini_games.can_play(telegram_id)
        
        if not can_play:
            bot.answer_callback_query(call.id, "Лимит игр на сегодня!")
            return
        
        text = """
🎯 **Угадай Число (1-100)**

💰 **Награды:**
• Точное попадание: 500 TAMA
• ±5: 200 TAMA  
• ±10: 100 TAMA
• ±20: 50 TAMA
• Остальное: 25 TAMA

**Введи число от 1 до 100:**
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.row(
            types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu")
        )
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                            parse_mode='Markdown', reply_markup=keyboard)
        
        # Set waiting state for number input
        bot.register_next_step_handler(call.message, process_guess_number)
    
    elif call.data == "game_trivia":
        # Trivia game
        telegram_id = str(call.from_user.id)
        can_play, games_played = mini_games.can_play(telegram_id)
        
        if not can_play:
            bot.answer_callback_query(call.id, "Лимит игр на сегодня!")
            return
        
        # Random trivia question
        questions = [
            {
                "q": "Какой язык используется для Solana смарт-контрактов?",
                "options": ["Rust", "Python", "JavaScript", "Solidity"],
                "correct": "Rust"
            },
            {
                "q": "Сколько TPS может обрабатывать Solana?",
                "options": ["1,000", "10,000", "50,000+", "100"],
                "correct": "50,000+"
            },
            {
                "q": "Кто создатель Solana?",
                "options": ["Anatoly Yakovenko", "Vitalik Buterin", "Changpeng Zhao", "Sam Bankman-Fried"],
                "correct": "Anatoly Yakovenko"
            },
            {
                "q": "Какой консенсус использует Solana?",
                "options": ["Proof of Work", "Proof of Stake", "Proof of History + PoS", "Delegated PoS"],
                "correct": "Proof of History + PoS"
            },
        ]
        
        question = random.choice(questions)
        
        text = f"""
❓ **Solana Викторина**

**{question['q']}**

💰 **Награда:** 100 TAMA за правильный ответ
        """
        
        keyboard = types.InlineKeyboardMarkup()
        for option in question['options']:
            keyboard.row(
                types.InlineKeyboardButton(option, callback_data=f"trivia_{option}_{question['correct']}")
            )
        keyboard.row(
            types.InlineKeyboardButton("🔙 Назад", callback_data="back_to_menu")
        )
        
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                            parse_mode='Markdown', reply_markup=keyboard)
    
    elif call.data.startswith("trivia_"):
        # Process trivia answer
        telegram_id = str(call.from_user.id)
        parts = call.data.split('_', 2)
        answer = parts[1]
        correct = parts[2] if len(parts) > 2 else ""
        
        success, reward, result_text = mini_games.play_trivia(telegram_id, answer, correct)
        
        if success:
            text = f"""
{result_text}

💰 **Заработано:** +{reward} TAMA

Играй еще завтра! 🎮
            """
            
            keyboard = types.InlineKeyboardMarkup()
            keyboard.row(
                types.InlineKeyboardButton("🔙 Меню", callback_data="back_to_menu")
            )
            
            bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                                parse_mode='Markdown', reply_markup=keyboard)
        else:
            bot.answer_callback_query(call.id, result_text)
    
    elif call.data == "game_wheel":
        # Spin the wheel
        telegram_id = str(call.from_user.id)
        
        success, reward, result_text = mini_games.spin_wheel(telegram_id)
        
        if success:
            text = f"""
🎰 **Колесо Фортуны**

{result_text}

💰 **Заработано:** +{reward} TAMA

🎮 **Приходи завтра за новыми играми!**
            """
            
            keyboard = types.InlineKeyboardMarkup()
            keyboard.row(
                types.InlineKeyboardButton("🔄 Крутить еще", callback_data="game_wheel"),
                types.InlineKeyboardButton("🔙 Меню", callback_data="back_to_menu")
            )
            
            bot.edit_message_text(text, call.message.chat.id, call.message.message_id,
                                parse_mode='Markdown', reply_markup=keyboard)
        else:
            bot.answer_callback_query(call.id, result_text)
    
    elif call.data == "back_to_menu":
        # Return to main menu
        send_welcome(call.message)

# Handler for guess number game
def process_guess_number(message):
    """Process guess number game input"""
    telegram_id = str(message.from_user.id)
    
    try:
        guess = int(message.text)
        if guess < 1 or guess > 100:
            bot.reply_to(message, "❌ Число должно быть от 1 до 100!")
            return
        
        success, reward, result_text = mini_games.play_guess_number(telegram_id, guess)
        
        if success:
            text = f"""
{result_text}

💰 **Заработано:** +{reward} TAMA

🎮 **Приходи завтра за новыми играми!**
            """
            
            keyboard = types.InlineKeyboardMarkup()
            keyboard.row(
                types.InlineKeyboardButton("🔙 Меню", callback_data="back_to_menu")
            )
            
            bot.reply_to(message, text, parse_mode='Markdown', reply_markup=keyboard)
        else:
            bot.reply_to(message, f"❌ {result_text}")
            
    except ValueError:
        bot.reply_to(message, "❌ Введи число от 1 до 100!")

# Start bot
if __name__ == '__main__':
    print("Bot started!")
    
    # Start scheduler in background
    scheduler_thread = threading.Thread(target=run_schedule, daemon=True)
    scheduler_thread.start()
    
    # Setup group permissions to bypass anti-spam
    async def setup_group_permissions():
        try:
            # Set bot permissions in group
            await bot.set_chat_permissions(
                chat_id=GROUP_ID,
                permissions=types.ChatPermissions(
                    can_send_messages=True,
                    can_send_media_messages=True,
                    can_send_polls=True,
                    can_send_other_messages=True,
                    can_add_web_page_previews=True,
                    can_change_info=True,
                    can_invite_users=True,
                    can_pin_messages=True
                )
            )
            print(f"Group permissions set for {GROUP_ID}")
        except Exception as e:
            print(f"Error setting group permissions: {e}")

    # Infinite restart loop
    while True:
        try:
            # Skip webhook operations on PythonAnywhere (causes proxy errors)
            print("Starting polling (webhook disabled for PythonAnywhere)...")
            bot.infinity_polling(none_stop=True, interval=2, timeout=60)
        except KeyboardInterrupt:
            print("\nBot stopped by user")
            break
        except Exception as e:
            print(f"Bot error: {e}")
            print("Auto-restarting in 10 seconds...")
            time.sleep(10)
            print("Restarting now...")
