-- 🚀 QUICK FULL RESET - Быстрый сброс ВСЕГО включая NFT
-- Просто скопируй и вставь в Supabase SQL Editor

-- Удалить все данные из всех таблиц
TRUNCATE TABLE 
    tama_transactions, 
    referrals, 
    leaderboard,
    nft_mints,
    nft_metadata,
    nft_holders
RESTART IDENTITY CASCADE;

-- Проверить что все пусто
SELECT 'leaderboard' as table_name, COUNT(*) as count FROM leaderboard
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

-- ✅ Готово! Все таблицы пустые включая NFT!

