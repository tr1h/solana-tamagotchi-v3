#!/usr/bin/env python3
"""
Test script to verify data saving from game
"""
import os
import sys
import json

# Add parent directory to path
sys.path.append('..')

# Load environment variables
import codecs
with codecs.open('../.env', 'r', encoding='utf-8-sig') as f:
    env_content = f.read()
    for line in env_content.strip().split('\n'):
        if '=' in line and not line.startswith('#'):
            key, value = line.split('=', 1)
            os.environ[key.strip()] = value.strip()

from supabase import create_client, Client

def test_data_saving():
    """Test if game data is being saved properly"""
    
    # Connect to Supabase
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Supabase credentials not found!")
        return
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("=== TESTING DATA SAVING ===\n")
    
    # Test user ID (Alex)
    test_user_id = "7401131043"
    
    # Simulate game data from Mini App
    test_game_data = {
        'action': 'save_game_state',
        'data': {
            'level': 5,
            'tama': 1500,
            'hp': 80,
            'food': 60,
            'happy': 70,
            'totalClicks': 250
        }
    }
    
    print(f"Testing save for user {test_user_id}")
    print(f"Game data: {test_game_data['data']}")
    
    # Check current data
    try:
        leaderboard = supabase.table('leaderboard').select('*').eq('telegram_id', test_user_id).execute()
        
        if leaderboard.data:
            current_user = leaderboard.data[0]
            print(f"Current data:")
            print(f"   TAMA: {current_user.get('tama', 0):,}")
            print(f"   Level: {current_user.get('level', 1)}")
            
            # Update with test data
            game_data = test_game_data['data']
            current_tama = current_user.get('tama', 0)
            game_tama = game_data.get('tama', 0)
            
            if game_tama > current_tama:
                # Update leaderboard
                result = supabase.table('leaderboard').update({
                    'tama': game_tama,
                    'level': game_data.get('level', 1)
                }).eq('telegram_id', test_user_id).execute()
                
                print(f"Updated successfully!")
                print(f"   New TAMA: {game_tama:,}")
                print(f"   New Level: {game_data.get('level', 1)}")
            else:
                print(f"No update needed (game TAMA <= current)")
                
        else:
            # Create new user
            result = supabase.table('leaderboard').insert({
                'telegram_id': test_user_id,
                'wallet_address': f'telegram_{test_user_id}',
                'tama': test_game_data['data'].get('tama', 0),
                'level': test_game_data['data'].get('level', 1),
                'referral_code': None
            }).execute()
            print(f"Created new user entry!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test level up action
    print(f"\nTesting level up action...")
    try:
        level_up_data = {
            'action': 'level_up',
            'level': 6
        }
        
        # Get current data
        leaderboard = supabase.table('leaderboard').select('tama').eq('telegram_id', test_user_id).execute()
        if leaderboard.data:
            current_tama = leaderboard.data[0].get('tama', 0)
            bonus_tama = level_up_data['level'] * 10
            
            # Award bonus
            supabase.table('leaderboard').update({
                'tama': current_tama + bonus_tama
            }).eq('telegram_id', test_user_id).execute()
            
            print(f"Level up bonus awarded: +{bonus_tama} TAMA")
            print(f"   New total: {current_tama + bonus_tama:,} TAMA")
            
    except Exception as e:
        print(f"Level up error: {e}")
    
    # Final check
    print(f"\nFinal data check...")
    try:
        final_data = supabase.table('leaderboard').select('*').eq('telegram_id', test_user_id).execute()
        if final_data.data:
            user = final_data.data[0]
            print(f"Final stats:")
            print(f"   TAMA: {user.get('tama', 0):,}")
            print(f"   Level: {user.get('level', 1)}")
            print(f"   Wallet: {user.get('wallet_address', 'N/A')}")
        else:
            print(f"User not found!")
            
    except Exception as e:
        print(f"Final check error: {e}")

if __name__ == "__main__":
    test_data_saving()
