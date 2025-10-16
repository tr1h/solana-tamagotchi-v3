#!/usr/bin/env python3
"""
Test Mini App data saving functionality
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

def simulate_mini_app_data():
    """Simulate data sent from Telegram Mini App"""
    
    # Connect to Supabase
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("=== SIMULATING MINI APP DATA SAVE ===\n")
    
    # Test user ID (Alex)
    telegram_id = "7401131043"
    
    # Simulate different types of data from Mini App
    test_cases = [
        {
            'name': 'Auto-save (every 30 seconds)',
            'data': {
                'action': 'auto_save',
                'data': {
                    'level': 6,
                    'tama': 2000,
                    'hp': 90,
                    'food': 75,
                    'happy': 85,
                    'totalClicks': 300
                }
            }
        },
        {
            'name': 'Manual save (user clicks save)',
            'data': {
                'action': 'save_game_state',
                'data': {
                    'level': 7,
                    'tama': 2500,
                    'hp': 95,
                    'food': 80,
                    'happy': 90,
                    'totalClicks': 350
                }
            }
        },
        {
            'name': 'Level up event',
            'data': {
                'action': 'level_up',
                'level': 8
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test {i}: {test_case['name']}")
        print(f"Data: {test_case['data']}")
        
        try:
            data = test_case['data']
            
            if data.get('action') == 'save_game_state' or data.get('action') == 'auto_save':
                # Save game state
                game_data = data.get('data', {})
                
                # Get current stats from leaderboard
                leaderboard = supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
                
                if leaderboard.data:
                    # User exists - update TAMA
                    current_tama = leaderboard.data[0].get('tama', 0)
                    game_tama = game_data.get('tama', 0)
                    
                    # Calculate new TAMA (don't overwrite, add difference)
                    if game_tama > current_tama:
                        tama_earned = game_tama - current_tama
                        
                        supabase.table('leaderboard').update({
                            'tama': game_tama,
                            'level': game_data.get('level', 1)
                        }).eq('telegram_id', telegram_id).execute()
                        
                        print(f"  Updated: +{tama_earned} TAMA")
                        print(f"  Total TAMA: {game_tama:,}")
                        print(f"  Level: {game_data.get('level', 1)}")
                    else:
                        print(f"  No update needed (game TAMA <= current)")
                else:
                    # Create new user entry
                    supabase.table('leaderboard').insert({
                        'telegram_id': telegram_id,
                        'wallet_address': f'telegram_{telegram_id}',
                        'tama': game_data.get('tama', 0),
                        'level': game_data.get('level', 1),
                        'referral_code': None
                    }).execute()
                    print(f"  Created new user entry!")
            
            elif data.get('action') == 'level_up':
                level = data.get('level', 1)
                print(f"  Level up to {level}!")
                
                # Award bonus TAMA for level up
                bonus_tama = level * 10
                leaderboard = supabase.table('leaderboard').select('tama').eq('telegram_id', telegram_id).execute()
                current_tama = leaderboard.data[0].get('tama', 0) if leaderboard.data else 0
                
                supabase.table('leaderboard').update({
                    'tama': current_tama + bonus_tama
                }).eq('telegram_id', telegram_id).execute()
                
                print(f"  Level up bonus: +{bonus_tama} TAMA")
                print(f"  New total: {current_tama + bonus_tama:,} TAMA")
            
        except Exception as e:
            print(f"  Error: {e}")
        
        print()
    
    # Final check
    print("=== FINAL DATABASE STATE ===")
    try:
        final_data = supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
        if final_data.data:
            user = final_data.data[0]
            print(f"Final stats for user {telegram_id}:")
            print(f"   TAMA: {user.get('tama', 0):,}")
            print(f"   Level: {user.get('level', 1)}")
            print(f"   Wallet: {user.get('wallet_address', 'N/A')}")
        else:
            print(f"User {telegram_id} not found!")
            
    except Exception as e:
        print(f"Final check error: {e}")

if __name__ == "__main__":
    simulate_mini_app_data()
