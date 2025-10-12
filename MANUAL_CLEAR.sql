-- 🗑️ MANUAL CLEAR - Execute in Supabase SQL Editor
-- This is the safest way to clear data

-- Step 1: Clear transaction history
DELETE FROM tama_transactions;

-- Step 2: Clear NFT mints
DELETE FROM nft_mints;

-- Step 3: Clear leaderboard (except Treasury)
DELETE FROM leaderboard WHERE wallet_address != 'TREASURY_MAIN_ACCOUNT';

-- Step 4: Reset Treasury balance
UPDATE leaderboard 
SET tama = 1000000000, updated_at = NOW() 
WHERE wallet_address = 'TREASURY_MAIN_ACCOUNT';

-- Step 5: If Treasury doesn't exist, create it
INSERT INTO leaderboard (wallet_address, pet_name, level, xp, tama, pet_type, pet_rarity, created_at, updated_at)
VALUES ('TREASURY_MAIN_ACCOUNT', 'Treasury', 1, 0, 1000000000, 'Treasury', 'legendary', NOW(), NOW())
ON CONFLICT (wallet_address) DO NOTHING;

-- Success message
SELECT '✅ Manual clear completed! Treasury: 1,000,000,000 TAMA' as result;
