-- ============================================
-- DATABASE MIGRATION: ADD NFT MINT ADDRESS
-- ============================================

-- 1. Добавляем колонку nft_mint_address в leaderboard
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT UNIQUE;

-- 2. Создаем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_leaderboard_nft_mint 
ON leaderboard(nft_mint_address);

-- 3. Обновляем таблицу nft_mints (если существует)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT UNIQUE;

-- 4. Добавляем метадату NFT
ALTER TABLE nft_mints
ADD COLUMN IF NOT EXISTS nft_name TEXT,
ADD COLUMN IF NOT EXISTS nft_image TEXT,
ADD COLUMN IF NOT EXISTS nft_attributes JSONB;

-- 5. Создаем индекс для nft_mints
CREATE INDEX IF NOT EXISTS idx_nft_mints_address 
ON nft_mints(nft_mint_address);

CREATE INDEX IF NOT EXISTS idx_nft_mints_wallet 
ON nft_mints(wallet_address);

-- 6. Комментарии для документации
COMMENT ON COLUMN leaderboard.nft_mint_address IS 'Unique Solana NFT mint address (public key of the NFT)';
COMMENT ON COLUMN nft_mints.nft_mint_address IS 'Unique Solana NFT mint address from Candy Machine';

-- 7. Просмотр структуры
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leaderboard';


