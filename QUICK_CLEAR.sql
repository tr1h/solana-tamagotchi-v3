-- 🚀 QUICK CLEAR - MINIMAL DATA RESET
-- Only clears essential tables, keeps some test data

-- Clear transaction history
DELETE FROM tama_transactions;

-- Clear leaderboard (except Treasury)
DELETE FROM leaderboard WHERE wallet_address != 'TREASURY_MAIN_ACCOUNT';

-- Clear NFT mints
DELETE FROM nft_mints;

-- Reset Treasury balance
UPDATE leaderboard 
SET tama = 1000000000, updated_at = NOW() 
WHERE wallet_address = 'TREASURY_MAIN_ACCOUNT';

-- If Treasury doesn't exist, create it
INSERT INTO leaderboard (wallet_address, pet_name, level, xp, tama, pet_type, pet_rarity, created_at, updated_at)
VALUES ('TREASURY_MAIN_ACCOUNT', 'Treasury', 1, 0, 1000000000, 'Treasury', 'legendary', NOW(), NOW())
ON CONFLICT (wallet_address) DO NOTHING;

SELECT '✅ Quick clear completed! Treasury: 1,000,000,000 TAMA' as result;
