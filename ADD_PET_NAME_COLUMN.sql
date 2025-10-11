-- 🔧 ADD PET_NAME COLUMN TO EXISTING NFT_MINTS TABLE
-- Запусти это в Supabase SQL Editor для добавления колонки pet_name

-- 1. Добавить колонку pet_name к существующей таблице
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS pet_name TEXT NOT NULL DEFAULT 'My Pet';

-- 2. Обновить существующие записи (если есть)
UPDATE nft_mints 
SET pet_name = nft_name 
WHERE pet_name = 'My Pet' OR pet_name IS NULL;

-- 3. Добавить комментарий к колонке
COMMENT ON COLUMN nft_mints.pet_name IS 'Имя питомца от пользователя';

-- 4. Проверить структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'nft_mints' 
ORDER BY ordinal_position;

-- 5. Показать пример данных
SELECT id, wallet_address, nft_name, pet_name, nft_type, nft_rarity 
FROM nft_mints 
LIMIT 5;
