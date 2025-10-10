# 🗑️ DATABASE RESET GUIDE

## 🎯 Зачем сбрасывать базу?

**Причины для сброса:**
- ✅ Чистое тестирование новой TAMA системы
- ✅ Убрать старые тестовые данные
- ✅ Начать с правильной структуры таблиц
- ✅ Протестировать токеномику с нуля
- ✅ Сбросить NFT данные для чистого тестирования
- ✅ Подготовиться к Mainnet запуску

---

## 🚀 Быстрый сброс (Рекомендуется)

### Вариант 1: Сброс только TAMA (без NFT)
```sql
-- Скопируй и вставь этот код:

TRUNCATE TABLE tama_transactions, referrals, leaderboard RESTART IDENTITY CASCADE;

-- Проверить что все пусто
SELECT 'leaderboard' as table_name, COUNT(*) as count FROM leaderboard
UNION ALL
SELECT 'tama_transactions', COUNT(*) FROM tama_transactions  
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals;
```

### Вариант 2: Полный сброс включая NFT (Рекомендуется)
```sql
-- Скопируй и вставь этот код:

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
```

### Шаг 1: Открой Supabase
1. Зайди в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выбери свой проект
3. Перейди в **SQL Editor**

### Шаг 2: Выбери нужный вариант
- **Только TAMA** → используй Вариант 1
- **Все включая NFT** → используй Вариант 2 (рекомендую)

### Шаг 3: Проверь результат
Должно показать все 0:
```
table_name      | count
----------------|-------
leaderboard     | 0
tama_transactions| 0
referrals       | 0
nft_mints       | 0
nft_metadata    | 0
nft_holders     | 0
```

**✅ Готово! База сброшена за 30 секунд!**

---

## 🔄 Полный сброс (Если нужно пересоздать структуру)

### Если что-то пошло не так с таблицами:

1. Выполни `RESET_DATABASE.sql` - он пересоздаст все таблицы
2. Это займет ~1 минуту
3. Все индексы и связи будут восстановлены

---

## 🧪 Тестирование после сброса

### 1. Подключи кошелек в игре
- Открой игру
- Подключи Phantom
- Проверь что баланс TAMA = 0

### 2. Создай питомца
- Нажми "Create Pet"
- Заплати 0.1 SOL
- Проверь что получил +500 TAMA

### 3. Протестируй earning
- Feed Pet → +5 TAMA
- Play with Pet → +10 TAMA
- Daily Login → +25 TAMA

### 4. Проверь историю
- Нажми на TAMA баланс в header
- Нажми "View TAMA History"
- Должны быть все транзакции

### 5. Протестируй NFT (если делал полный сброс)
- Создай питомца (mint NFT)
- Проверь что NFT появился в базе
- Проверь что получил +500 TAMA за mint
- Проверь что NFT отображается в игре

---

## 📊 Что проверить после сброса

### В Supabase:
```sql
-- Проверить игроков
SELECT wallet_address, pet_name, level, tama FROM leaderboard;

-- Проверить транзакции
SELECT wallet_address, amount, reason, created_at 
FROM tama_transactions 
ORDER BY created_at DESC;

-- Проверить рефералы
SELECT * FROM referrals;

-- Проверить NFT (если делал полный сброс)
SELECT wallet_address, mint_address, pet_name, pet_type FROM nft_mints;
SELECT mint_address, name, rarity_score FROM nft_metadata;
SELECT mint_address, wallet_address FROM nft_holders;
```

### В игре:
- ✅ TAMA баланс обновляется
- ✅ История транзакций работает
- ✅ Leaderboard пустой (пока)
- ✅ Все earning работает
- ✅ NFT minting работает (если делал полный сброс)
- ✅ NFT отображается в игре

---

## 🚨 Если что-то не работает

### Проблема: TAMA не начисляются
**Решение:**
1. Проверь что таблица `tama_transactions` создана
2. Проверь что `leaderboard` имеет колонку `tama`
3. Перезагрузи страницу

### Проблема: История не загружается
**Решение:**
1. Проверь что таблица `tama_transactions` не пустая
2. Проверь права доступа в Supabase
3. Проверь консоль браузера на ошибки

### Проблема: Leaderboard не работает
**Решение:**
1. Проверь что таблица `leaderboard` создана
2. Проверь индексы
3. Добавь тестового игрока

---

## 🎯 После сброса

### Что делать дальше:
1. **Тестируй earning** - проверь все способы заработка
2. **Тестируй spending** - проверь траты TAMA
3. **Тестируй историю** - проверь что все сохраняется
4. **Собери feedback** - что работает, что нет
5. **Готовься к токену** - когда все работает идеально

### Готов к Mainnet когда:
- ✅ Все earning работает
- ✅ История сохраняется
- ✅ Нет багов
- ✅ Community тестирует
- ✅ Токеномика сбалансирована

---

## 📞 Поддержка

Если что-то не работает:
1. Проверь консоль браузера (F12)
2. Проверь Supabase логи
3. Проверь что все SQL выполнилось
4. Перезагрузи страницу

**Удачи с тестированием! 🚀**

---

*После сброса у тебя будет чистая база для тестирования новой TAMA системы!*
