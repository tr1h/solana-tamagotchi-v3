-- 🗑️ CLEAR ALL TEST DATA (KEEP STRUCTURE)
-- ⚠️ WARNING: This will delete ALL data but keep table structure

-- Clear all transaction history
DELETE FROM tama_transactions;

-- Clear all player data
DELETE FROM leaderboard;

-- Clear all NFT mints
DELETE FROM nft_mints;

-- Clear all referrals
DELETE FROM referrals;

-- Clear all evolution history
DELETE FROM evolution_history;

-- Clear all ability usage
DELETE FROM ability_usage;

-- Clear all anti-cheat logs
DELETE FROM anti_cheat_logs;

-- Clear all banned users
DELETE FROM banned_users;

-- Clear all player actions
DELETE FROM player_actions;

-- Clear all price history
DELETE FROM price_history;

-- Reset Treasury to initial state
INSERT INTO leaderboard (wallet_address, pet_name, level, xp, tama, pet_type, pet_rarity, created_at, updated_at)
VALUES ('TREASURY_MAIN_ACCOUNT', 'Treasury', 1, 0, 1000000000, 'Treasury', 'legendary', NOW(), NOW())
ON CONFLICT (wallet_address) DO UPDATE SET
    tama = 1000000000,
    updated_at = NOW();

-- Reset game settings to defaults
INSERT INTO game_settings (key, value, description, updated_at)
VALUES 
    ('nft_mint_price', '0.01', 'NFT mint price in SOL', NOW()),
    ('mint_phase', 'active', 'Current mint phase', NOW()),
    ('tama_bonus_multiplier', '1.0', 'TAMA bonus multiplier', NOW())
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Add test admin
INSERT INTO admins (wallet_address, name, permissions, created_at)
VALUES ('G8vpUg12KQUXkv7JfRxfSxYPUDwW9jtZ8CiL8KB5aXK2', 'Test Admin', 'all', NOW())
ON CONFLICT (wallet_address) DO NOTHING;

-- Success message
SELECT '✅ All test data cleared! Treasury reset to 1,000,000,000 TAMA' as result;
