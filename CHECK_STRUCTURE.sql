-- 🔍 CHECK STRUCTURE - Проверить структуру таблиц
-- Запусти это чтобы увидеть структуру всех таблиц

-- Проверить структуру всех нужных таблиц
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('leaderboard', 'tama_transactions', 'referrals', 'nft_mints', 'nft_metadata', 'nft_holders')
ORDER BY table_name, ordinal_position;

-- Проверить индексы
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('leaderboard', 'tama_transactions', 'referrals', 'nft_mints', 'nft_metadata', 'nft_holders')
ORDER BY tablename, indexname;

