-- Gamification Tables for Solana Tamagotchi Bot
-- Run this in Supabase SQL Editor

-- Daily Rewards tracking
CREATE TABLE IF NOT EXISTS daily_rewards (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL,
    last_claim TIMESTAMP DEFAULT NOW(),
    streak_days INTEGER DEFAULT 1,
    total_claims INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(telegram_id)
);

-- Mini-games tracking
CREATE TABLE IF NOT EXISTS game_plays (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL,
    game_type TEXT NOT NULL, -- 'guess_number', 'trivia', 'spin_wheel'
    result TEXT, -- 'win', 'lose'
    tama_earned INTEGER DEFAULT 0,
    played_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily game limits
CREATE TABLE IF NOT EXISTS game_limits (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL,
    game_date DATE DEFAULT CURRENT_DATE,
    games_played INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(telegram_id, game_date)
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL,
    badge_id TEXT NOT NULL, -- 'early_bird', 'streak_master', 'referral_king', etc.
    earned_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(telegram_id, badge_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(telegram_id, achievement_id)
);

-- User ranks
CREATE TABLE IF NOT EXISTS user_ranks (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL UNIQUE,
    rank_level TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum, legend
    rank_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quests
CREATE TABLE IF NOT EXISTS user_quests (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(telegram_id, quest_id)
);

-- Notifications queue
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    message TEXT NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_rewards_telegram_id ON daily_rewards(telegram_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_telegram_id ON game_plays(telegram_id);
CREATE INDEX IF NOT EXISTS idx_game_limits_telegram_id ON game_limits(telegram_id, game_date);
CREATE INDEX IF NOT EXISTS idx_user_badges_telegram_id ON user_badges(telegram_id);
CREATE INDEX IF NOT EXISTS idx_achievements_telegram_id ON achievements(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_ranks_telegram_id ON user_ranks(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_telegram_id ON user_quests(telegram_id);
CREATE INDEX IF NOT EXISTS idx_notifications_telegram_id ON notifications(telegram_id, sent);

