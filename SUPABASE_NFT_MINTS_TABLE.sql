-- 🎨 NFT MINTS TABLE
-- Запусти это в Supabase SQL Editor для создания таблицы NFT минтинга

-- 1. Создать таблицу NFT минтинга
CREATE TABLE IF NOT EXISTS nft_mints (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    mint_address TEXT NOT NULL UNIQUE,
    nft_name TEXT NOT NULL,
    nft_type TEXT NOT NULL,
    nft_rarity TEXT NOT NULL,
    mint_price DECIMAL(10,2) NOT NULL,
    mint_phase INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Добавить индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_nft_wallet ON nft_mints(wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_mint ON nft_mints(mint_address);
CREATE INDEX IF NOT EXISTS idx_nft_created ON nft_mints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nft_phase ON nft_mints(mint_phase);

-- 3. Добавить комментарии
COMMENT ON TABLE nft_mints IS 'История всех NFT минтингов игроков';
COMMENT ON COLUMN nft_mints.wallet_address IS 'Адрес кошелька игрока';
COMMENT ON COLUMN nft_mints.mint_address IS 'Адрес NFT токена';
COMMENT ON COLUMN nft_mints.nft_name IS 'Имя NFT питомца';
COMMENT ON COLUMN nft_mints.nft_type IS 'Тип питомца (Dragon, Phoenix, etc.)';
COMMENT ON COLUMN nft_mints.nft_rarity IS 'Редкость (Common, Rare, Epic, Legendary)';
COMMENT ON COLUMN nft_mints.mint_price IS 'Цена минтинга в SOL';
COMMENT ON COLUMN nft_mints.mint_phase IS 'Фаза минтинга (1, 2, 3, 4)';

-- 4. Проверить что таблица создана
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'nft_mints'
ORDER BY ordinal_position;

-- 5. Пример вставки NFT минтинга
-- INSERT INTO nft_mints (wallet_address, mint_address, nft_name, nft_type, nft_rarity, mint_price, mint_phase)
-- VALUES ('3aMp...pqxU', '9rzA...SG6', 'My Dragon', 'Dragon', 'Epic', 0.1, 1);
