-- 🔍 CHECK TABLES - Проверить какие таблицы есть
-- Запусти это чтобы увидеть какие таблицы существуют

-- Проверить все таблицы в проекте
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Проверить только нужные таблицы
SELECT 
    CASE 
        WHEN table_name IN ('leaderboard', 'tama_transactions', 'referrals', 'nft_mints', 'nft_metadata', 'nft_holders') 
        THEN '✅ ' || table_name 
        ELSE '❌ ' || table_name 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leaderboard', 'tama_transactions', 'referrals', 'nft_mints', 'nft_metadata', 'nft_holders')
ORDER BY table_name;

-- Проверить количество записей в каждой таблице
SELECT 
    'leaderboard' as table_name, 
    COUNT(*) as count 
FROM leaderboard
UNION ALL
SELECT 'tama_transactions', COUNT(*) FROM tama_transactions  
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals
UNION ALL
SELECT 'nft_mints', COUNT(*) FROM nft_mints
UNION ALL
SELECT 'nft_metadata', COUNT(*) FROM nft_metadata
UNION ALL
SELECT 'nft_holders', COUNT(*) FROM nft_holders;

