-- 🚀 QUICK RESET - Быстрый сброс базы данных
-- Просто скопируй и вставь в Supabase SQL Editor

-- Удалить все данные
TRUNCATE TABLE tama_transactions, referrals, leaderboard RESTART IDENTITY CASCADE;

-- Проверить что все пусто
SELECT 'leaderboard' as table_name, COUNT(*) as count FROM leaderboard
UNION ALL
SELECT 'tama_transactions', COUNT(*) FROM tama_transactions  
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals;

-- ✅ Готово! Все таблицы пустые!

