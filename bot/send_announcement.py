"""
Send launch announcement to Telegram groups
"""
import os
from telebot import TeleBot
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# Bot token
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
bot = TeleBot(TOKEN)

# Group IDs
GROUP_ID = -1002938566588  # @gotchigamechat
CHANNEL_ID = 'solana_tamagotchi_v3_bot'  # Channel username

def send_group_announcement():
    """Send announcement to group"""
    group_text = """🎉 *GAMIFICATION IS LIVE!* 🎉

Guys, we just launched the FULL gamification system! 🚀

*What's NEW:*
✅ Daily Rewards (streak system)
✅ 3 Mini-Games (Guess Number, Trivia, Spin Wheel)
✅ Badge Collection System
✅ Rank Progression (Bronze to Legend)
✅ Referral Quests with huge rewards

*EARN TAMA RIGHT NOW:*
🎁 Daily: Up to 2,000 TAMA
🎮 Games: Up to 500 TAMA each
🔗 Referrals: 1,000 TAMA per friend
🎯 Quests: Up to 50,000 TAMA!

*Try it now:* @solana_tamagotchi_v3_bot

Who's going to be the first Legend rank? 👑"""

    try:
        message = bot.send_message(GROUP_ID, group_text)
        print(f"Group announcement sent successfully!")
        print(f"Message ID: {message.message_id}")
        
        # Pin the message
        bot.pin_chat_message(GROUP_ID, message.message_id)
        print("Message pinned!")
        
    except Exception as e:
        print(f"Error sending group announcement: {e}")

def send_channel_announcement():
    """Send announcement to channel"""
    channel_text = """🎮 *MAJOR UPDATE: GAMIFICATION SYSTEM LIVE!* 🎮

🔥 *NEW FEATURES:*
• 🎁 *Daily Rewards* - Earn TAMA every day with streak bonuses!
• 🎯 *Mini-Games* - Play & win up to 500 TAMA per game!
• 🏅 *Badges & Ranks* - Collect achievements from Bronze to Legend!
• 🎯 *Referral Quests* - Complete challenges for massive rewards!

💰 *EARN RIGHT NOW (NO WALLET NEEDED!):*
• 1,000 TAMA per friend referral
• Daily rewards up to 2,000 TAMA
• Mini-games up to 500 TAMA each
• Quest rewards up to 50,000 TAMA!

🎁 *SPECIAL LAUNCH BONUSES:*
• First 100 users get Early Bird badge
• 7-day streak = Week Warrior badge
• 30-day streak = Streak Master badge

🤖 *START EARNING:* @solana_tamagotchi_v3_bot
👥 *JOIN COMMUNITY:* @gotchigamechat

#SolanaTamagotchi #PlayToEarn #NFT #Solana #Gamification #TAMA"""

    try:
        message = bot.send_message(CHANNEL_ID, channel_text)
        print(f"Channel announcement sent successfully!")
        print(f"Message ID: {message.message_id}")
        
        # Pin the message
        bot.pin_chat_message(CHANNEL_ID, message.message_id)
        print("Message pinned!")
        
    except Exception as e:
        print(f"Error sending channel announcement: {e}")

if __name__ == "__main__":
    print("Sending Gamification Launch Announcements...")
    print("=" * 50)
    
    print("Sending to Group (@gotchigamechat)...")
    send_group_announcement()
    
    print("\nSending to Channel (@solana_tamagotchi_v3_bot)...")
    send_channel_announcement()
    
    print("\nAll announcements sent!")
    print("=" * 50)
