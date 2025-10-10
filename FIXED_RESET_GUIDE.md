# 🔧 FIXED RESET GUIDE - Исправленный гайд по сбросу

## 🎯 Проблема решена!

**Ошибка:** `column "mint_address" does not exist`
**Причина:** NFT таблицы создались с неправильной структурой

---

## 🚀 ПРАВИЛЬНЫЙ ПОРЯДОК ДЕЙСТВИЙ

### Шаг 1: Исправить NFT таблицы

**Выполни в Supabase SQL Editor:**

```sql
-- 1. Удалить неправильные таблицы NFT
DROP TABLE IF EXISTS nft_mints CASCADE;
DROP TABLE IF EXISTS nft_metadata CASCADE;
DROP TABLE IF EXISTS nft_holders CASCADE;

-- 2. Создать правильные таблицы NFT

-- NFT Mints table
CREATE TABLE nft_mints (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    mint_address TEXT UNIQUE NOT NULL,
    pet_name TEXT,
    pet_type TEXT,
    pet_traits JSONB,
    mint_price DECIMAL,
    mint_timestamp TIMESTAMPTZ DEFAULT NOW(),
    transaction_signature TEXT,
    status TEXT DEFAULT 'minted'
);

-- NFT Metadata table
CREATE TABLE nft_metadata (
    id SERIAL PRIMARY KEY,
    mint_address TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    attributes JSONB,
    rarity_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFT Holders table
CREATE TABLE nft_holders (
    id SERIAL PRIMARY KEY,
    mint_address TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    acquisition_type TEXT DEFAULT 'mint',
    transaction_signature TEXT
);

-- 3. Создать индексы
CREATE INDEX idx_nft_mints_wallet ON nft_mints(wallet_address);
CREATE INDEX idx_nft_mints_mint ON nft_mints(mint_address);
CREATE INDEX idx_nft_metadata_mint ON nft_metadata(mint_address);
CREATE INDEX idx_nft_holders_mint ON nft_holders(mint_address);
```

**✅ После этого NFT таблицы будут исправлены!**

### Шаг 2: Проверить структуру

**Выполни этот запрос:**

```sql
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('nft_mints', 'nft_metadata', 'nft_holders')
ORDER BY table_name, ordinal_position;
```

**Должно показать правильную структуру с колонкой `mint_address`!**

### Шаг 3: Сбросить данные

**Теперь можешь безопасно сбросить:**

```sql
-- Сбросить все данные
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

**Должно показать все 0! ✅**

---

## 🎯 Альтернативный способ (если все еще проблемы)

### Вариант A: Сброс только TAMA (без NFT)

```sql
-- Сбросить только TAMA таблицы
TRUNCATE TABLE tama_transactions, referrals, leaderboard RESTART IDENTITY CASCADE;

-- Проверить
SELECT 'leaderboard' as table_name, COUNT(*) as count FROM leaderboard
UNION ALL
SELECT 'tama_transactions', COUNT(*) FROM tama_transactions  
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals;
```

### Вариант B: Полный пересоздание

```sql
-- Удалить ВСЕ таблицы
DROP TABLE IF EXISTS tama_transactions CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS nft_mints CASCADE;
DROP TABLE IF EXISTS nft_metadata CASCADE;
DROP TABLE IF EXISTS nft_holders CASCADE;

-- Создать заново (используй FULL_RESET.sql)
```

---

## ✅ После успешного сброса

### Что проверить:

1. **В Supabase:**
   - Все таблицы пустые (count = 0)
   - NFT таблицы имеют правильную структуру

2. **В игре:**
   - Подключи кошелек
   - TAMA баланс = 0
   - Создай питомца (mint NFT)
   - Проверь что получил +500 TAMA
   - Проверь что NFT отображается

3. **Тестирование:**
   - Feed Pet → +5 TAMA
   - Play with Pet → +10 TAMA
   - Daily Login → +25 TAMA
   - История TAMA работает

---

## 🚨 Если все еще проблемы

**Ошибка "column does not exist":**
- Выполни Шаг 1 (исправить NFT таблицы)
- Потом Шаг 3 (сброс)

**Ошибка "table does not exist":**
- Используй Вариант B (полное пересоздание)

**Ошибка "permission denied":**
- Проверь права доступа в Supabase
- Убедись что ты владелец проекта

---

## 📁 Файлы для использования

1. **`FIX_NFT_TABLES.sql`** - исправить NFT таблицы
2. **`CHECK_STRUCTURE.sql`** - проверить структуру
3. **`QUICK_FULL_RESET.sql`** - сброс после исправления

---

**Удачи! Теперь все должно работать! 🚀**

