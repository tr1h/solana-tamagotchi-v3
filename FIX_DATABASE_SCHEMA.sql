-- ============================================
-- 🚨 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ БАЗЫ ДАННЫХ
-- ============================================

-- 1. Удаляем старую таблицу если есть
DROP TABLE IF EXISTS tama_transactions CASCADE;

-- 2. Создаем правильную таблицу tama_transactions
CREATE TABLE tama_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    amount NUMERIC(20, 9) NOT NULL,
    balance_before NUMERIC(20, 9) NOT NULL,
    balance_after NUMERIC(20, 9) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    entry_type TEXT NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем индексы
CREATE INDEX idx_tama_transactions_wallet_address ON tama_transactions (wallet_address);
CREATE INDEX idx_tama_transactions_operation_type ON tama_transactions (operation_type);
CREATE INDEX idx_tama_transactions_created_at ON tama_transactions (created_at DESC);

-- 4. Убеждаемся что leaderboard имеет правильную структуру
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS tama NUMERIC(20, 9) DEFAULT 0;

-- 5. Создаем функцию для обновления баланса
CREATE OR REPLACE FUNCTION update_leaderboard_tama_from_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_tama NUMERIC(20, 9);
BEGIN
    -- Убеждаемся что игрок существует в leaderboard
    INSERT INTO leaderboard (wallet_address, tama, created_at, updated_at)
    VALUES (NEW.wallet_address, 0, NOW(), NOW())
    ON CONFLICT (wallet_address) DO NOTHING;

    -- Получаем текущий баланс TAMA
    SELECT COALESCE(tama, 0) INTO current_tama 
    FROM leaderboard 
    WHERE wallet_address = NEW.wallet_address;

    -- Обновляем баланс в leaderboard
    UPDATE leaderboard
    SET 
        tama = current_tama + NEW.amount,
        updated_at = NOW()
    WHERE wallet_address = NEW.wallet_address;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Создаем триггер
DROP TRIGGER IF EXISTS trg_update_leaderboard_tama ON tama_transactions;
CREATE TRIGGER trg_update_leaderboard_tama
    AFTER INSERT ON tama_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard_tama_from_transaction();

-- 7. Проверяем что все колонки существуют
DO $$
BEGIN
    -- Проверяем колонки в leaderboard
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'leaderboard' AND column_name = 'tama') THEN
        ALTER TABLE leaderboard ADD COLUMN tama NUMERIC(20, 9) DEFAULT 0;
    END IF;
    
    -- Проверяем колонки в nft_mints
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'pet_name') THEN
        ALTER TABLE nft_mints ADD COLUMN pet_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'pet_type') THEN
        ALTER TABLE nft_mints ADD COLUMN pet_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'stats') THEN
        ALTER TABLE nft_mints ADD COLUMN stats JSONB DEFAULT '{"hunger": 100, "energy": 100, "happy": 100, "health": 100}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'level') THEN
        ALTER TABLE nft_mints ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'xp') THEN
        ALTER TABLE nft_mints ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'evolution') THEN
        ALTER TABLE nft_mints ADD COLUMN evolution INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'last_fed') THEN
        ALTER TABLE nft_mints ADD COLUMN last_fed TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'last_played') THEN
        ALTER TABLE nft_mints ADD COLUMN last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_mints' AND column_name = 'last_slept') THEN
        ALTER TABLE nft_mints ADD COLUMN last_slept TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 8. Создаем функцию для простого создания транзакций
CREATE OR REPLACE FUNCTION create_simple_tama_transaction(
    p_wallet_address TEXT,
    p_operation_type TEXT,
    p_amount NUMERIC(20, 9),
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
    balance_before NUMERIC(20, 9);
    balance_after NUMERIC(20, 9);
    entry_type TEXT;
BEGIN
    -- Генерируем ID
    transaction_id := gen_random_uuid();
    
    -- Получаем текущий баланс
    SELECT COALESCE(tama, 0) INTO balance_before
    FROM leaderboard
    WHERE wallet_address = p_wallet_address;
    
    -- Если записи нет, создаем
    IF balance_before IS NULL THEN
        INSERT INTO leaderboard (wallet_address, tama, created_at, updated_at)
        VALUES (p_wallet_address, 0, NOW(), NOW());
        balance_before := 0;
    END IF;
    
    -- Определяем тип операции
    IF p_operation_type IN (
        'MINT_REWARD', 'DAILY_LOGIN', 'PET_CLICK', 'MINIGAME_WIN',
        'REFERRAL_REWARD', 'ACHIEVEMENT_REWARD', 'ADMIN_BONUS'
    ) THEN
        entry_type := 'DEBIT';
        balance_after := balance_before + ABS(p_amount);
    ELSE
        entry_type := 'CREDIT';
        -- Проверяем достаточность средств
        IF balance_before < ABS(p_amount) THEN
            RAISE EXCEPTION 'Insufficient TAMA balance. Required: %, Available: %', ABS(p_amount), balance_before;
        END IF;
        balance_after := balance_before - ABS(p_amount);
    END IF;
    
    -- Создаем транзакцию
    INSERT INTO tama_transactions (
        id, wallet_address, operation_type, amount, balance_before, balance_after,
        description, entry_type, created_at
    ) VALUES (
        transaction_id, p_wallet_address, p_operation_type, 
        CASE WHEN entry_type = 'DEBIT' THEN ABS(p_amount) ELSE -ABS(p_amount) END,
        balance_before, balance_after, p_description, entry_type, NOW()
    );
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Тестовые данные для проверки
INSERT INTO tama_transactions (
    wallet_address, operation_type, amount, balance_before, balance_after,
    description, entry_type, created_at
) VALUES (
    'test_wallet', 'MINT_REWARD', 1000, 0, 1000,
    'Test mint reward', 'DEBIT', NOW()
) ON CONFLICT DO NOTHING;

-- 10. Обновляем leaderboard для тестового кошелька
INSERT INTO leaderboard (wallet_address, tama, created_at, updated_at)
VALUES ('test_wallet', 1000, NOW(), NOW())
ON CONFLICT (wallet_address) DO UPDATE SET
    tama = EXCLUDED.tama,
    updated_at = NOW();

PRINT '✅ Database schema fixes completed!';
