# 🎯 STEP BY STEP RESET - Пошаговый сброс

## ⚠️ ВАЖНО: Правильный порядок действий!

**Если у тебя ошибка "таблица не существует" - следуй этому порядку:**

---

## 📋 Шаг 1: Создать NFT таблицы (если их нет)

### Выполни в Supabase SQL Editor:

```sql
-- Создать таблицы NFT если их нет

-- NFT Mints table
CREATE TABLE IF NOT EXISTS nft_mints (
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
CREATE TABLE IF NOT EXISTS nft_metadata (
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
CREATE TABLE IF NOT EXISTS nft_holders (
    id SERIAL PRIMARY KEY,
    mint_address TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    acquisition_type TEXT DEFAULT 'mint',
    transaction_signature TEXT
);

-- Создать индексы
CREATE INDEX IF NOT EXISTS idx_nft_mints_wallet ON nft_mints(wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_mints_mint ON nft_mints(mint_address);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_mint ON nft_metadata(mint_address);
CREATE INDEX IF NOT EXISTS idx_nft_holders_mint ON nft_holders(mint_address);
```

**✅ После этого NFT таблицы будут созданы!**

---

## 📋 Шаг 2: Проверить какие таблицы есть

### Выполни этот запрос:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leaderboard', 'tama_transactions', 'referrals', 'nft_mints', 'nft_metadata', 'nft_holders')
ORDER BY table_name;
```

**Должно показать все 6 таблиц:**
```
table_name
-----------
leaderboard
nft_holders
nft_metadata
nft_mints
referrals
tama_transactions
```

---

## 📋 Шаг 3: Сбросить данные

### Теперь можешь безопасно сбросить:

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

## 🚨 Если все еще ошибки

### Вариант A: Сброс только существующих таблиц

```sql
-- Проверить какие таблицы есть
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leaderboard', 'tama_transactions', 'referrals')
ORDER BY table_name;

-- Сбросить только их
TRUNCATE TABLE tama_transactions, referrals, leaderboard RESTART IDENTITY CASCADE;
```

### Вариант B: Полный пересоздание (если что-то сломалось)

```sql
-- Удалить все таблицы
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
   - NFT таблицы созданы

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

## 📞 Если проблемы

**Ошибка "таблица не существует":**
- Выполни Шаг 1 (создать NFT таблицы)
- Потом Шаг 3 (сброс)

**Ошибка "permission denied":**
- Проверь права доступа в Supabase
- Убедись что ты владелец проекта

**Ошибка "syntax error":**
- Копируй код точно
- Проверь кавычки
- Выполняй по частям

---

**Удачи! 🚀**

