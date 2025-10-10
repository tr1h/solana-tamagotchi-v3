-- 🗑️ FULL RESET - Полный сброс включая NFT
-- Запусти это в Supabase SQL Editor для полного сброса ВСЕГО

-- ⚠️ ВНИМАНИЕ: Это удалит ВСЕ данные включая NFT!
-- Сделай backup если нужно!

-- 1. Удалить ВСЕ таблицы
DROP TABLE IF EXISTS tama_transactions CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS nft_mints CASCADE;
DROP TABLE IF EXISTS nft_metadata CASCADE;
DROP TABLE IF EXISTS nft_holders CASCADE;

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

-- NFT Mints table (для отслеживания минтинга)
CREATE TABLE nft_mints (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    mint_address TEXT UNIQUE NOT NULL,
    pet_name TEXT,
    pet_type TEXT,
    pet_traits JSONB,
    mint_price DECIMAL,
    mint_timestamp TIMESTAMPTZ DEFAULT NOW(),
    transaction_signature TEXT,
    status TEXT DEFAULT 'minted' -- 'minted', 'transferred', 'burned'
);

-- NFT Metadata table (для хранения метаданных)
CREATE TABLE nft_metadata (
    id SERIAL PRIMARY KEY,
    mint_address TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    attributes JSONB,
    rarity_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFT Holders table (для отслеживания владельцев)
CREATE TABLE nft_holders (
    id SERIAL PRIMARY KEY,
    mint_address TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    acquisition_type TEXT DEFAULT 'mint', -- 'mint', 'transfer', 'purchase'
    transaction_signature TEXT
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

CREATE INDEX idx_nft_mints_wallet ON nft_mints(wallet_address);
CREATE INDEX idx_nft_mints_mint ON nft_mints(mint_address);
CREATE INDEX idx_nft_mints_timestamp ON nft_mints(mint_timestamp DESC);

CREATE INDEX idx_nft_metadata_mint ON nft_metadata(mint_address);
CREATE INDEX idx_nft_metadata_rarity ON nft_metadata(rarity_score DESC);

CREATE INDEX idx_nft_holders_mint ON nft_holders(mint_address);
CREATE INDEX idx_nft_holders_wallet ON nft_holders(wallet_address);

-- 4. Добавить комментарии
COMMENT ON TABLE leaderboard IS 'Основная таблица игроков с рейтингом';
COMMENT ON TABLE tama_transactions IS 'История всех TAMA транзакций';
COMMENT ON TABLE referrals IS 'Реферальная система';
COMMENT ON TABLE nft_mints IS 'Отслеживание минтинга NFT';
COMMENT ON TABLE nft_metadata IS 'Метаданные NFT';
COMMENT ON TABLE nft_holders IS 'Владельцы NFT';

-- 5. Проверить что все создано
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('leaderboard', 'tama_transactions', 'referrals', 'nft_mints', 'nft_metadata', 'nft_holders')
ORDER BY table_name, ordinal_position;

-- 6. Добавить тестового игрока (опционально)
-- INSERT INTO leaderboard (wallet_address, pet_name, pet_type, level, xp, total_xp, tama)
-- VALUES ('test_wallet_address', 'Test Pet', 'cat', 1, 0, 0, 0);

-- ✅ Готово! Полный сброс выполнен!
-- Теперь у тебя чистая база для тестирования NFT + TAMA системы!
