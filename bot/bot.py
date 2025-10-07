import telebot
from telebot import types
import json
import os

# Bot token
TOKEN = '8189046152:AAEJYAexkdPTJN8sz9qdi44b4p_4cNz5P3Y'

# Initialize bot
bot = telebot.TeleBot(TOKEN)

# Game URL
GAME_URL = 'https://tr1h.github.io/solana-tamagotchi-v3/'
MINT_URL = 'https://tr1h.github.io/solana-tamagotchi-v3/mint.html'

# Stats file
STATS_FILE = 'stats.json'

# Load stats
def load_stats():
    if os.path.exists(STATS_FILE):
        with open(STATS_FILE, 'r') as f:
            return json.load(f)
    return {'players': 0, 'pets': 0, 'price': '0.3 SOL'}

# Save stats
def save_stats(stats):
    with open(STATS_FILE, 'w') as f:
        json.dump(stats, f)

# Welcome message
@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    welcome_text = """
🐾 **Welcome to Solana Tamagotchi Bot!**

Available commands:

🎮 **Game:**
/game - Play the game
/mint - Mint NFT Pet
/price - Current NFT price

📊 **Statistics:**
/players - Total players
/pets - Total pets created
/stats - Your referral stats

🎁 **Referrals:**
/ref - Get your referral link

❓ /help - Show this message

🚀 **Play-to-Earn Pet Game on Solana!**
    """
    bot.reply_to(message, welcome_text, parse_mode='Markdown')

# Game link
@bot.message_handler(commands=['game'])
def send_game(message):
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("🎮 Play Game", url=GAME_URL))
    bot.reply_to(message, "🐾 Ready to play?", reply_markup=keyboard)

# Mint link
@bot.message_handler(commands=['mint'])
def send_mint(message):
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("🖼️ Mint NFT Pet", url=MINT_URL))
    bot.reply_to(message, "✨ Mint your unique NFT Pet!\n\n💰 Price: 0.3 SOL", reply_markup=keyboard)

# Price
@bot.message_handler(commands=['price'])
def send_price(message):
    stats = load_stats()
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

# Players count
@bot.message_handler(commands=['players'])
def send_players(message):
    stats = load_stats()
    bot.reply_to(message, f"👥 **Total Players:** {stats['players']}\n\n🚀 Join the community!", parse_mode='Markdown')

# Pets count
@bot.message_handler(commands=['pets'])
def send_pets(message):
    stats = load_stats()
    bot.reply_to(message, f"🐾 **Total Pets Created:** {stats['pets']}\n\n✨ Mint yours: /mint", parse_mode='Markdown')

# Referral link
@bot.message_handler(commands=['ref'])
def send_ref(message):
    user_id = message.from_user.id
    username = message.from_user.username or str(user_id)
    
    # Generate referral code (base64 of wallet would be better, but for demo use username)
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

# User stats
@bot.message_handler(commands=['stats'])
def send_user_stats(message):
    stats_text = """
📊 **Your Statistics:**

👥 Referrals: 0
💰 TAMA Earned: 0

Start inviting friends with /ref to earn rewards! 🚀
    """
    bot.reply_to(message, stats_text, parse_mode='Markdown')

# Admin command: update stats
@bot.message_handler(commands=['update_stats'])
def update_stats_command(message):
    # Check if admin (you can add admin user IDs here)
    admin_ids = []  # Add your Telegram user ID here
    
    if message.from_user.id in admin_ids or True:  # Remove "or True" after adding admin IDs
        try:
            # Format: /update_stats players:10 pets:5
            args = message.text.split()[1:]
            stats = load_stats()
            
            for arg in args:
                key, value = arg.split(':')
                if key in ['players', 'pets']:
                    stats[key] = int(value)
                elif key == 'price':
                    stats['price'] = value
            
            save_stats(stats)
            bot.reply_to(message, "✅ Stats updated!", parse_mode='Markdown')
        except Exception as e:
            bot.reply_to(message, f"❌ Error: {str(e)}", parse_mode='Markdown')
    else:
        bot.reply_to(message, "❌ Access denied. Admin only.", parse_mode='Markdown')

# Admin command: broadcast
@bot.message_handler(commands=['announce'])
def announce_command(message):
    admin_ids = []  # Add your Telegram user ID here
    
    if message.from_user.id in admin_ids or True:  # Remove "or True" after adding admin IDs
        # Format: /announce Your message here
        text = message.text.replace('/announce ', '', 1)
        bot.reply_to(message, f"📢 **Announcement:**\n\n{text}", parse_mode='Markdown')
    else:
        bot.reply_to(message, "❌ Access denied. Admin only.", parse_mode='Markdown')

# Echo all other messages
@bot.message_handler(func=lambda message: True)
def echo_message(message):
    bot.reply_to(message, "Use /help to see available commands! 🚀")

# Start bot
if __name__ == '__main__':
    print("🤖 Bot started!")
    bot.infinity_polling()

