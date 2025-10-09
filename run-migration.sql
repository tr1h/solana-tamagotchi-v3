-- 🚀 MIGRATION: Add total_xp and advanced ranking system
-- Run this in Supabase SQL Editor

-- 1. Add total_xp column
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;

-- 2. Add ranking score column
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS ranking_score INT DEFAULT 0;

-- 3. Add activity tracking
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS total_playtime INT DEFAULT 0; -- in minutes

-- 4. Update existing records
UPDATE leaderboard 
SET 
    total_xp = (level - 1) * 100 + xp,
    last_activity = updated_at,
    ranking_score = ((level - 1) * 100 + xp) + (level * 100) + (tama * 0.1)
WHERE total_xp = 0;

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_xp ON leaderboard(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_ranking_score ON leaderboard(ranking_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_last_activity ON leaderboard(last_activity DESC);

-- 6. Add comments
COMMENT ON COLUMN leaderboard.total_xp IS 'Total accumulated XP across all levels';
COMMENT ON COLUMN leaderboard.ranking_score IS 'Calculated ranking score for leaderboard';
COMMENT ON COLUMN leaderboard.last_activity IS 'Last time player was active in game';
COMMENT ON COLUMN leaderboard.total_playtime IS 'Total time spent in game (minutes)';

-- 7. Show results
SELECT 
    wallet_address,
    pet_name,
    level,
    xp,
    total_xp,
    tama,
    ranking_score,
    last_activity
FROM leaderboard 
ORDER BY ranking_score DESC 
LIMIT 10;
