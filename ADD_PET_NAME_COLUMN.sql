-- 🔧 FIX NFT_MINTS TABLE - ADD MISSING COLUMNS
-- Запусти это в Supabase SQL Editor для исправления таблицы nft_mints

-- 1. Добавить колонку pet_name к существующей таблице
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS pet_name TEXT NOT NULL DEFAULT 'My Pet';

-- 2. Добавить колонку created_at (если отсутствует)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Добавить колонку updated_at (если отсутствует)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Обновить существующие записи (если есть)
UPDATE nft_mints 
SET pet_name = nft_name 
WHERE pet_name = 'My Pet' OR pet_name IS NULL;

-- 5. Обновить created_at для существующих записей (если NULL)
UPDATE nft_mints 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 6. Обновить updated_at для существующих записей (если NULL)
UPDATE nft_mints 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 7. Добавить комментарии к колонкам
COMMENT ON COLUMN nft_mints.pet_name IS 'Имя питомца от пользователя';
COMMENT ON COLUMN nft_mints.created_at IS 'Дата создания записи';
COMMENT ON COLUMN nft_mints.updated_at IS 'Дата последнего обновления';

-- 8. Проверить структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'nft_mints' 
ORDER BY ordinal_position;

-- 9. Показать пример данных
SELECT id, wallet_address, nft_name, pet_name, nft_type, nft_rarity, created_at 
FROM nft_mints 
LIMIT 5;
