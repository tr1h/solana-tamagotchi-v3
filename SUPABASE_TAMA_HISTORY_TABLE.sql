-- 💰 TAMA TRANSACTION HISTORY TABLE
-- Запусти это в Supabase SQL Editor для создания таблицы истории TAMA

-- 1. Создать таблицу истории транзакций
CREATE TABLE IF NOT EXISTS tama_transactions (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    amount INT NOT NULL,
    balance_before INT NOT NULL,
    balance_after INT NOT NULL,
    type TEXT NOT NULL, -- 'earn' or 'spend'
    reason TEXT NOT NULL, -- 'Daily Login', 'Feed Pet', 'Evolve Pet', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Добавить индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tama_wallet ON tama_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_tama_created ON tama_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tama_type ON tama_transactions(type);

-- 3. Добавить комментарии
COMMENT ON TABLE tama_transactions IS 'История всех TAMA транзакций игроков';
COMMENT ON COLUMN tama_transactions.wallet_address IS 'Адрес кошелька игрока';
COMMENT ON COLUMN tama_transactions.amount IS 'Количество TAMA (положительное или отрицательное)';
COMMENT ON COLUMN tama_transactions.balance_before IS 'Баланс до транзакции';
COMMENT ON COLUMN tama_transactions.balance_after IS 'Баланс после транзакции';
COMMENT ON COLUMN tama_transactions.type IS 'Тип транзакции: earn (заработал) или spend (потратил)';
COMMENT ON COLUMN tama_transactions.reason IS 'Причина транзакции';

-- 4. Проверить что таблица создана
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'tama_transactions'
ORDER BY ordinal_position;

-- 5. Пример вставки транзакции
-- INSERT INTO tama_transactions (wallet_address, amount, balance_before, balance_after, type, reason)
-- VALUES ('3aMp...pqxU', 25, 500, 525, 'earn', 'Daily Login');


