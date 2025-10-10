-- 🔧 FIX NFT TABLES - Исправить структуру NFT таблиц
-- Запусти это в Supabase SQL Editor

-- 1. Сначала проверим что у нас есть
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('nft_mints', 'nft_metadata', 'nft_holders')
ORDER BY table_name, ordinal_position;

-- 2. Удалить неправильные таблицы NFT
DROP TABLE IF EXISTS nft_mints CASCADE;
DROP TABLE IF EXISTS nft_metadata CASCADE;
DROP TABLE IF EXISTS nft_holders CASCADE;

-- 3. Создать правильные таблицы NFT

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

-- 4. Создать индексы для производительности
CREATE INDEX idx_nft_mints_wallet ON nft_mints(wallet_address);
CREATE INDEX idx_nft_mints_mint ON nft_mints(mint_address);
CREATE INDEX idx_nft_mints_timestamp ON nft_mints(mint_timestamp DESC);

CREATE INDEX idx_nft_metadata_mint ON nft_metadata(mint_address);
CREATE INDEX idx_nft_metadata_rarity ON nft_metadata(rarity_score DESC);

CREATE INDEX idx_nft_holders_mint ON nft_holders(mint_address);
CREATE INDEX idx_nft_holders_wallet ON nft_holders(wallet_address);

-- 5. Добавить комментарии
COMMENT ON TABLE nft_mints IS 'Отслеживание минтинга NFT';
COMMENT ON TABLE nft_metadata IS 'Метаданные NFT';
COMMENT ON TABLE nft_holders IS 'Владельцы NFT';

-- 6. Проверить что все создано правильно
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('nft_mints', 'nft_metadata', 'nft_holders')
ORDER BY table_name, ordinal_position;

-- ✅ Готово! NFT таблицы исправлены!

