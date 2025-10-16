"""
Test referral system
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

def generate_referral_code(telegram_id):
    """Generate referral code for user"""
    import hashlib
    import base64
    
    # Create unique code
    raw_code = f"tama_{telegram_id}_v30"
    hash_code = hashlib.md5(raw_code.encode()).hexdigest()[:8].upper()
    return f"TAMA{hash_code}"

def test_referral_system():
    print("Testing Referral System...")
    print("=" * 50)
    
    # Test user ID
    test_telegram_id = "7401131043"  # Your ID
    
    # Generate referral code
    ref_code = generate_referral_code(test_telegram_id)
    short_link = f"https://tr1h.github.io/solana-tamagotchi/s.html?ref={ref_code}&v=30"
    
    print(f"Test User ID: {test_telegram_id}")
    print(f"Generated Code: {ref_code}")
    print(f"Referral Link: {short_link}")
    print()
    
    # Check current stats
    try:
        # Check referrals
        response = supabase.table('referrals').select('*', count='exact').eq('referrer_telegram_id', test_telegram_id).execute()
        total_referrals = response.count or 0
        
        # Check pending
        pending_response = supabase.table('pending_referrals').select('*', count='exact').eq('referrer_telegram_id', test_telegram_id).execute()
        pending_count = pending_response.count or 0
        
        # Check TAMA balance
        leaderboard_response = supabase.table('leaderboard').select('tama').eq('telegram_id', test_telegram_id).execute()
        total_earnings = leaderboard_response.data[0].get('tama', 0) if leaderboard_response.data else 0
        
        print(f"Current Stats:")
        print(f"  - Total Referrals: {total_referrals}")
        print(f"  - Pending Referrals: {pending_count}")
        print(f"  - Total TAMA: {total_earnings}")
        
    except Exception as e:
        print(f"Error checking stats: {e}")
    
    print()
    print("Referral System Test Complete!")
    print("=" * 50)

if __name__ == "__main__":
    test_referral_system()
