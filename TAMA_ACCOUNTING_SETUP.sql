-- ============================================
-- 💰 TAMA DOUBLE-ENTRY ACCOUNTING SYSTEM
-- ============================================

-- Создание таблицы для транзакций TAMA
CREATE TABLE IF NOT EXISTS tama_transactions (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    balance_before DECIMAL(18,8) NOT NULL,
    balance_after DECIMAL(18,8) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    entry_type TEXT NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tama_transactions_wallet ON tama_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_tama_transactions_type ON tama_transactions(operation_type);
CREATE INDEX IF NOT EXISTS idx_tama_transactions_date ON tama_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_tama_transactions_entry_type ON tama_transactions(entry_type);

-- Создание индекса для составных запросов
CREATE INDEX IF NOT EXISTS idx_tama_transactions_wallet_date ON tama_transactions(wallet_address, created_at DESC);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_tama_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_tama_transactions_updated_at ON tama_transactions;
CREATE TRIGGER trigger_update_tama_transactions_updated_at
    BEFORE UPDATE ON tama_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_tama_transactions_updated_at();

-- Функция для проверки баланса
CREATE OR REPLACE FUNCTION check_tama_balance(wallet_addr TEXT)
RETURNS DECIMAL(18,8) AS $$
DECLARE
    current_balance DECIMAL(18,8);
BEGIN
    -- Получаем баланс из leaderboard
    SELECT COALESCE(tama, 0) INTO current_balance
    FROM leaderboard
    WHERE wallet_address = wallet_addr;
    
    -- Если записи нет, создаем с нулевым балансом
    IF current_balance IS NULL THEN
        INSERT INTO leaderboard (wallet_address, tama, xp, level, created_at, updated_at)
        VALUES (wallet_addr, 0, 0, 1, NOW(), NOW())
        ON CONFLICT (wallet_address) DO NOTHING;
        
        current_balance := 0;
    END IF;
    
    RETURN current_balance;
END;
$$ LANGUAGE plpgsql;

-- Функция для создания транзакции
CREATE OR REPLACE FUNCTION create_tama_transaction(
    p_wallet_address TEXT,
    p_operation_type TEXT,
    p_amount DECIMAL(18,8),
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS TEXT AS $$
DECLARE
    transaction_id TEXT;
    balance_before DECIMAL(18,8);
    balance_after DECIMAL(18,8);
    entry_type TEXT;
    actual_amount DECIMAL(18,8);
BEGIN
    -- Генерируем ID транзакции
    transaction_id := 'tama_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || substr(md5(random()::text), 1, 9);
    
    -- Получаем текущий баланс
    balance_before := check_tama_balance(p_wallet_address);
    
    -- Определяем тип операции
    IF p_operation_type IN (
        'MINT_REWARD', 'DAILY_LOGIN', 'PET_CLICK', 'MINIGAME_WIN',
        'REFERRAL_REWARD', 'ACHIEVEMENT_REWARD', 'ADMIN_BONUS'
    ) THEN
        entry_type := 'DEBIT';
        actual_amount := ABS(p_amount);
    ELSE
        entry_type := 'CREDIT';
        actual_amount := -ABS(p_amount);
    END IF;
    
    -- Проверяем, достаточно ли средств для расходной операции
    IF entry_type = 'CREDIT' AND balance_before < ABS(actual_amount) THEN
        RAISE EXCEPTION 'Insufficient TAMA balance. Required: %, Available: %', ABS(actual_amount), balance_before;
    END IF;
    
    -- Рассчитываем новый баланс
    balance_after := GREATEST(0, balance_before + actual_amount);
    
    -- Создаем транзакцию
    INSERT INTO tama_transactions (
        id, wallet_address, operation_type, amount, balance_before, balance_after,
        description, metadata, entry_type, created_at
    ) VALUES (
        transaction_id, p_wallet_address, p_operation_type, actual_amount,
        balance_before, balance_after, p_description, p_metadata, entry_type, NOW()
    );
    
    -- Обновляем баланс в leaderboard
    UPDATE leaderboard
    SET tama = balance_after, updated_at = NOW()
    WHERE wallet_address = p_wallet_address;
    
    -- Если записи нет в leaderboard, создаем
    IF NOT FOUND THEN
        INSERT INTO leaderboard (wallet_address, tama, xp, level, created_at, updated_at)
        VALUES (p_wallet_address, balance_after, 0, 1, NOW(), NOW());
    END IF;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения истории транзакций
CREATE OR REPLACE FUNCTION get_tama_transaction_history(
    p_wallet_address TEXT,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id TEXT,
    operation_type TEXT,
    amount DECIMAL(18,8),
    balance_before DECIMAL(18,8),
    balance_after DECIMAL(18,8),
    description TEXT,
    metadata JSONB,
    entry_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id, t.operation_type, t.amount, t.balance_before, t.balance_after,
        t.description, t.metadata, t.entry_type, t.created_at
    FROM tama_transactions t
    WHERE t.wallet_address = p_wallet_address
    ORDER BY t.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения статистики по операциям
CREATE OR REPLACE FUNCTION get_tama_operation_stats(
    p_wallet_address TEXT,
    p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_earned DECIMAL(18,8),
    total_spent DECIMAL(18,8),
    net_balance DECIMAL(18,8),
    operations_count BIGINT,
    by_type JSONB
) AS $$
DECLARE
    start_date TIMESTAMP WITH TIME ZONE;
BEGIN
    start_date := NOW() - INTERVAL '1 day' * p_period_days;
    
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0) as earned,
            COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN ABS(amount) ELSE 0 END), 0) as spent,
            COUNT(*) as total_ops,
            jsonb_object_agg(
                operation_type,
                jsonb_build_object(
                    'count', count,
                    'total_amount', total_amount
                )
            ) as type_stats
        FROM (
            SELECT 
                operation_type,
                entry_type,
                amount,
                COUNT(*) as count,
                SUM(ABS(amount)) as total_amount
            FROM tama_transactions
            WHERE wallet_address = p_wallet_address
                AND created_at >= start_date
            GROUP BY operation_type, entry_type, amount
        ) grouped
    )
    SELECT 
        stats.earned as total_earned,
        stats.spent as total_spent,
        (stats.earned - stats.spent) as net_balance,
        stats.total_ops as operations_count,
        stats.type_stats as by_type
    FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Функция для проверки целостности балансов
CREATE OR REPLACE FUNCTION verify_tama_balance_integrity()
RETURNS TABLE (
    wallet_address TEXT,
    leaderboard_balance DECIMAL(18,8),
    calculated_balance DECIMAL(18,8),
    difference DECIMAL(18,8),
    is_correct BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH calculated_balances AS (
        SELECT 
            wallet_address,
            SUM(amount) as calculated_balance
        FROM tama_transactions
        GROUP BY wallet_address
    )
    SELECT 
        l.wallet_address,
        l.tama as leaderboard_balance,
        COALESCE(cb.calculated_balance, 0) as calculated_balance,
        (l.tama - COALESCE(cb.calculated_balance, 0)) as difference,
        (l.tama = COALESCE(cb.calculated_balance, 0)) as is_correct
    FROM leaderboard l
    LEFT JOIN calculated_balances cb ON l.wallet_address = cb.wallet_address
    WHERE l.tama != COALESCE(cb.calculated_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Создание представления для удобного просмотра транзакций
CREATE OR REPLACE VIEW v_tama_transactions AS
SELECT 
    t.id,
    t.wallet_address,
    t.operation_type,
    t.amount,
    t.balance_before,
    t.balance_after,
    t.description,
    t.metadata,
    t.entry_type,
    CASE 
        WHEN t.entry_type = 'DEBIT' THEN '+' || t.amount::TEXT
        ELSE t.amount::TEXT
    END as formatted_amount,
    t.created_at,
    t.updated_at
FROM tama_transactions t
ORDER BY t.created_at DESC;

-- Создание представления для статистики по типам операций
CREATE OR REPLACE VIEW v_tama_operation_summary AS
SELECT 
    operation_type,
    entry_type,
    COUNT(*) as transaction_count,
    SUM(ABS(amount)) as total_amount,
    AVG(ABS(amount)) as avg_amount,
    MIN(ABS(amount)) as min_amount,
    MAX(ABS(amount)) as max_amount,
    DATE_TRUNC('day', created_at) as transaction_date
FROM tama_transactions
GROUP BY operation_type, entry_type, DATE_TRUNC('day', created_at)
ORDER BY transaction_date DESC, operation_type;

-- Добавление комментариев к таблицам и функциям
COMMENT ON TABLE tama_transactions IS 'Таблица для хранения всех транзакций TAMA с системой двойной записи';
COMMENT ON COLUMN tama_transactions.entry_type IS 'Тип записи: DEBIT (приход) или CREDIT (расход)';
COMMENT ON COLUMN tama_transactions.amount IS 'Сумма транзакции (положительная для DEBIT, отрицательная для CREDIT)';
COMMENT ON COLUMN tama_transactions.balance_before IS 'Баланс до транзакции';
COMMENT ON COLUMN tama_transactions.balance_after IS 'Баланс после транзакции';

COMMENT ON FUNCTION create_tama_transaction IS 'Создает новую транзакцию TAMA с проверкой баланса';
COMMENT ON FUNCTION get_tama_transaction_history IS 'Возвращает историю транзакций для кошелька';
COMMENT ON FUNCTION get_tama_operation_stats IS 'Возвращает статистику по операциям за период';
COMMENT ON FUNCTION verify_tama_balance_integrity IS 'Проверяет целостность балансов между таблицами';

-- Примеры использования:
-- 
-- Создать транзакцию (заработок):
-- SELECT create_tama_transaction('wallet123', 'PET_CLICK', 5, 'Earned TAMA for clicking pet');
--
-- Создать транзакцию (расход):
-- SELECT create_tama_transaction('wallet123', 'FEEDING_COST', 10, 'Spent TAMA for feeding pet');
--
-- Получить историю:
-- SELECT * FROM get_tama_transaction_history('wallet123', 20, 0);
--
-- Получить статистику:
-- SELECT * FROM get_tama_operation_stats('wallet123', 7);
--
-- Проверить целостность:
-- SELECT * FROM verify_tama_balance_integrity();

-- ✅ TAMA Double-Entry Accounting System setup completed!
