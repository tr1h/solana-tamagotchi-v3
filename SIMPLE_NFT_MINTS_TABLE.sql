-- 🎨 SIMPLE NFT MINTS TABLE
-- Создание таблицы без проблемных индексов

-- Создать таблицу NFT минтинга
CREATE TABLE IF NOT EXISTS nft_mints (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    mint_address TEXT NOT NULL UNIQUE,
    nft_name TEXT NOT NULL,
    nft_type TEXT NOT NULL,
    nft_rarity TEXT NOT NULL,
    mint_price DECIMAL(10,2) NOT NULL,
    mint_phase INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Добавить только безопасные индексы
CREATE INDEX IF NOT EXISTS idx_nft_wallet ON nft_mints(wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_mint ON nft_mints(mint_address);

-- Проверить что таблица создана
SELECT 'Table nft_mints created successfully!' as status;

