-- 🔧 FIX: Remove "active" strings from tama field
-- This fixes the "invalid input syntax for type numeric: 'active'" error

-- Step 1: Find and fix records with "active" in tama field
UPDATE leaderboard 
SET tama = 0 
WHERE tama::text = 'active' OR tama IS NULL;

-- Step 2: Ensure all tama values are numeric
UPDATE leaderboard 
SET tama = COALESCE(tama::numeric, 0)
WHERE wallet_address != 'TREASURY_MAIN_ACCOUNT';

-- Step 3: Reset Treasury to proper value
UPDATE leaderboard 
SET tama = 1000000000 
WHERE wallet_address = 'TREASURY_MAIN_ACCOUNT';

-- Step 4: Create Treasury if it doesn't exist
INSERT INTO leaderboard (wallet_address, pet_name, level, xp, tama, pet_type, pet_rarity, created_at, updated_at)
VALUES ('TREASURY_MAIN_ACCOUNT', 'Treasury', 1, 0, 1000000000, 'Treasury', 'legendary', NOW(), NOW())
ON CONFLICT (wallet_address) DO UPDATE SET
    tama = 1000000000,
    updated_at = NOW();

-- Success message
SELECT '✅ Fixed "active" error! All tama values are now numeric.' as result;
