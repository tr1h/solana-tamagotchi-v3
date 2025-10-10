-- Add total_xp column to leaderboard table
-- Run this in Supabase SQL Editor

-- Add total_xp column
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;

-- Update existing records to set total_xp based on level and current xp
-- This is an approximation - real total_xp would need to be calculated from pet_data
UPDATE leaderboard 
SET total_xp = (level - 1) * 100 + xp 
WHERE total_xp = 0;

-- Add index for total_xp for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_xp ON leaderboard(total_xp DESC);

-- Update the comment
COMMENT ON COLUMN leaderboard.total_xp IS 'Total accumulated XP across all levels';

