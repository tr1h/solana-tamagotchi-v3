"""
Check database status and data
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# Supabase connection
SUPABASE_URL = os.getenv('SUPABASE_URL', 'YOUR_SUPABASE_URL_HERE')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'YOUR_SUPABASE_KEY_HERE')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_database():
    print("Checking Database Status...")
    print("=" * 50)
    
    # Check leaderboard
    try:
        leaderboard = supabase.table('leaderboard').select('*').limit(10).execute()
        print(f"Leaderboard: {len(leaderboard.data)} users")
        for user in leaderboard.data[:5]:
            print(f"  - {user.get('telegram_id', 'N/A')}: {user.get('tama', 0)} TAMA")
    except Exception as e:
        print(f"Leaderboard error: {e}")
    
    # Check referrals
    try:
        referrals = supabase.table('referrals').select('*', count='exact').execute()
        print(f"Referrals: {referrals.count or 0} total")
    except Exception as e:
        print(f"Referrals error: {e}")
    
    # Check pending referrals
    try:
        pending = supabase.table('pending_referrals').select('*', count='exact').execute()
        print(f"Pending referrals: {pending.count or 0}")
    except Exception as e:
        print(f"Pending referrals error: {e}")
    
    # Check gamification tables
    try:
        daily_rewards = supabase.table('daily_rewards').select('*', count='exact').execute()
        print(f"Daily rewards: {daily_rewards.count or 0} users")
    except Exception as e:
        print(f"Daily rewards error: {e}")
    
    try:
        game_plays = supabase.table('game_plays').select('*', count='exact').execute()
        print(f"Game plays: {game_plays.count or 0} total")
    except Exception as e:
        print(f"Game plays error: {e}")
    
    try:
        user_badges = supabase.table('user_badges').select('*', count='exact').execute()
        print(f"User badges: {user_badges.count or 0} total")
    except Exception as e:
        print(f"User badges error: {e}")
    
    try:
        user_ranks = supabase.table('user_ranks').select('*', count='exact').execute()
        print(f"User ranks: {user_ranks.count or 0} users")
    except Exception as e:
        print(f"User ranks error: {e}")
    
    try:
        user_quests = supabase.table('user_quests').select('*', count='exact').execute()
        print(f"User quests: {user_quests.count or 0} total")
    except Exception as e:
        print(f"User quests error: {e}")
    
    print("=" * 50)
    print("Database check complete!")

if __name__ == "__main__":
    check_database()
