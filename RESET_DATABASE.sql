-- 🗑️ RESET DATABASE - Clean Slate for TAMA Token System
-- Запусти это в Supabase SQL Editor для полного сброса

-- ⚠️ ВНИМАНИЕ: Это удалит ВСЕ данные!
-- Сделай backup если нужно!

-- 1. Удалить все таблицы
DROP TABLE IF EXISTS tama_transactions CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;

-- 2. Создать таблицы заново с правильной структурой

-- Leaderboard table
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    pet_name TEXT,
    pet_type TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    tama INTEGER DEFAULT 0,
    ranking_score DECIMAL DEFAULT 0,
    pet_data JSONB,
    telegram_username TEXT,
    telegram_user_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAMA Transactions table
CREATE TABLE tama_transactions (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'earn' or 'spend'
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_address TEXT NOT NULL,
    referred_address TEXT NOT NULL,
    referral_code TEXT NOT NULL,
    level INTEGER NOT NULL, -- 1 or 2
    signup_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Создать индексы для производительности
CREATE INDEX idx_leaderboard_wallet ON leaderboard(wallet_address);
CREATE INDEX idx_leaderboard_level ON leaderboard(level DESC);
CREATE INDEX idx_leaderboard_total_xp ON leaderboard(total_xp DESC);
CREATE INDEX idx_leaderboard_ranking ON leaderboard(ranking_score DESC);

CREATE INDEX idx_tama_wallet ON tama_transactions(wallet_address);
CREATE INDEX idx_tama_created ON tama_transactions(created_at DESC);
CREATE INDEX idx_tama_type ON tama_transactions(type);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_address);
CREATE INDEX idx_referrals_referred ON referrals(referred_address);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- 4. Добавить комментарии
COMMENT ON TABLE leaderboard IS 'Основная таблица игроков с рейтингом';
COMMENT ON TABLE tama_transactions IS 'История всех TAMA транзакций';
COMMENT ON TABLE referrals IS 'Реферальная система';

-- 5. Проверить что все создано
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('leaderboard', 'tama_transactions', 'referrals')
ORDER BY table_name, ordinal_position;

-- 6. Добавить тестового игрока (опционально)
-- INSERT INTO leaderboard (wallet_address, pet_name, pet_type, level, xp, total_xp, tama)
-- VALUES ('test_wallet_address', 'Test Pet', 'cat', 1, 0, 0, 0);

-- ✅ Готово! База данных сброшена и готова к работе!
