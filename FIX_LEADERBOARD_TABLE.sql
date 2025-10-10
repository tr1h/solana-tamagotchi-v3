-- 🔧 FIX LEADERBOARD TABLE
-- Запусти это в Supabase SQL Editor для исправления таблицы leaderboard

-- 1. Проверить структуру таблицы leaderboard
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'leaderboard'
ORDER BY ordinal_position;

-- 2. Добавить колонку updated_at если её нет
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leaderboard' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE leaderboard ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Column updated_at added to leaderboard table';
    ELSE
        RAISE NOTICE 'Column updated_at already exists in leaderboard table';
    END IF;
END $$;

-- 3. Добавить колонку created_at если её нет
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leaderboard' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE leaderboard ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Column created_at added to leaderboard table';
    ELSE
        RAISE NOTICE 'Column created_at already exists in leaderboard table';
    END IF;
END $$;

-- 4. Обновить существующие записи (установить created_at для старых записей)
UPDATE leaderboard 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 5. Проверить финальную структуру
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'leaderboard'
ORDER BY ordinal_position;
