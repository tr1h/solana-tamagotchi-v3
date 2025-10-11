-- 🔧 FIX NFT_MINTS TABLE - SIMPLE VERSION
-- Запусти это в Supabase SQL Editor для исправления таблицы nft_mints

-- 1. Проверить структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'nft_mints' 
ORDER BY ordinal_position;

-- 2. Добавить колонку pet_name (если отсутствует)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS pet_name TEXT NOT NULL DEFAULT 'My Pet';

-- 3. Добавить колонку created_at (если отсутствует)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Добавить колонку updated_at (если отсутствует)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Обновить created_at для существующих записей (если NULL)
UPDATE nft_mints 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 6. Обновить updated_at для существующих записей (если NULL)
UPDATE nft_mints 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 7. Проверить финальную структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'nft_mints' 
ORDER BY ordinal_position;

-- 8. Показать пример данных
SELECT id, wallet_address, pet_name, nft_type, nft_rarity, created_at 
FROM nft_mints 
LIMIT 5;
