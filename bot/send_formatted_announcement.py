"""
Send formatted announcement with proper Markdown
"""
import os
from telebot import TeleBot
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# Bot token
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
bot = TeleBot(TOKEN)

# Group ID
GROUP_ID = -1002938566588  # @gotchigamechat

def send_formatted_announcement():
    """Send properly formatted announcement"""
    text = """🎉 <b>GAMIFICATION IS LIVE!</b> 🎉

Guys, we just launched the FULL gamification system! 🚀

<b>What's NEW:</b>
✅ Daily Rewards (streak system)
✅ 3 Mini-Games (Guess Number, Trivia, Spin Wheel)
✅ Badge Collection System
✅ Rank Progression (Bronze to Legend)
✅ Referral Quests with huge rewards

<b>EARN TAMA RIGHT NOW:</b>
🎁 Daily: Up to 2,000 TAMA
🎮 Games: Up to 500 TAMA each
🔗 Referrals: 1,000 TAMA per friend
🎯 Quests: Up to 50,000 TAMA!

<b>Try it now:</b> @solana_tamagotchi_v3_bot

Who's going to be the first Legend rank? 👑"""

    try:
        message = bot.send_message(GROUP_ID, text, parse_mode='HTML')
        print("Formatted announcement sent successfully!")
        print(f"Message ID: {message.message_id}")
        
        # Pin the message
        bot.pin_chat_message(GROUP_ID, message.message_id)
        print("Message pinned!")
        
    except Exception as e:
        print(f"Error sending formatted announcement: {e}")

if __name__ == "__main__":
    print("Sending formatted announcement...")
    send_formatted_announcement()
    print("Done!")
