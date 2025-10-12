-- 🛡️ ANTI-CHEAT SYSTEM - DATABASE SETUP
-- Запусти это в Supabase SQL Editor

-- =====================================================
-- 1. ТАБЛИЦА ДЛЯ ЛОГОВ ПОДОЗРИТЕЛЬНОЙ АКТИВНОСТИ
-- =====================================================

CREATE TABLE IF NOT EXISTS anti_cheat_logs (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    action_taken TEXT
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_ac_wallet ON anti_cheat_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ac_type ON anti_cheat_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_ac_timestamp ON anti_cheat_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ac_resolved ON anti_cheat_logs(resolved);

-- Комментарии
COMMENT ON TABLE anti_cheat_logs IS 'Логи подозрительной активности для обнаружения читеров';
COMMENT ON COLUMN anti_cheat_logs.activity_type IS 'Тип активности (xp_too_high, tama_too_high, etc.)';
COMMENT ON COLUMN anti_cheat_logs.details IS 'Детали инцидента (JSONB)';
COMMENT ON COLUMN anti_cheat_logs.resolved IS 'Инцидент рассмотрен';
COMMENT ON COLUMN anti_cheat_logs.action_taken IS 'Принятые меры (warning, temp_ban, perm_ban, etc.)';

-- =====================================================
-- 2. ТАБЛИЦА ЗАБАНЕННЫХ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================================

CREATE TABLE IF NOT EXISTS banned_users (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    ban_type TEXT NOT NULL, -- temp, permanent
    reason TEXT NOT NULL,
    banned_at TIMESTAMPTZ DEFAULT NOW(),
    banned_until TIMESTAMPTZ,
    banned_by TEXT DEFAULT 'system',
    appeal_status TEXT DEFAULT 'none', -- none, pending, approved, rejected
    notes TEXT
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_banned_wallet ON banned_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_banned_type ON banned_users(ban_type);
CREATE INDEX IF NOT EXISTS idx_banned_until ON banned_users(banned_until);

-- Комментарии
COMMENT ON TABLE banned_users IS 'Забаненные пользователи';
COMMENT ON COLUMN banned_users.ban_type IS 'Тип бана (temp, permanent)';
COMMENT ON COLUMN banned_users.banned_until IS 'До какого времени забанен (для temp)';
COMMENT ON COLUMN banned_users.appeal_status IS 'Статус апелляции';

-- =====================================================
-- 3. ТАБЛИЦА ДЛЯ ОТСЛЕЖИВАНИЯ ДЕЙСТВИЙ
-- =====================================================

CREATE TABLE IF NOT EXISTS player_actions (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_data JSONB,
    xp_gained INT DEFAULT 0,
    tama_gained INT DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_actions_wallet ON player_actions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_actions_type ON player_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_actions_timestamp ON player_actions(timestamp DESC);

-- Комментарии
COMMENT ON TABLE player_actions IS 'История всех действий игроков для анализа';
COMMENT ON COLUMN player_actions.action_type IS 'Тип действия (feed, play, levelup, etc.)';
COMMENT ON COLUMN player_actions.xp_gained IS 'XP получено за действие';
COMMENT ON COLUMN player_actions.tama_gained IS 'TAMA получено за действие';

-- =====================================================
-- 4. ФУНКЦИЯ ДЛЯ АВТОМАТИЧЕСКОГО БАНА
-- =====================================================

CREATE OR REPLACE FUNCTION auto_ban_cheater()
RETURNS TRIGGER AS $$
DECLARE
    cheat_count INT;
BEGIN
    -- Подсчитать количество читов за последний час
    SELECT COUNT(*) INTO cheat_count
    FROM anti_cheat_logs
    WHERE wallet_address = NEW.wallet_address
      AND timestamp > NOW() - INTERVAL '1 hour'
      AND resolved = FALSE;
    
    -- Если больше 5 читов за час - бан
    IF cheat_count > 5 THEN
        INSERT INTO banned_users (wallet_address, ban_type, reason, banned_until)
        VALUES (
            NEW.wallet_address,
            'temp',
            'Автоматический бан: множественные попытки обмана',
            NOW() + INTERVAL '24 hours'
        )
        ON CONFLICT (wallet_address) DO NOTHING;
        
        RAISE NOTICE 'User % auto-banned for cheating', NEW.wallet_address;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
DROP TRIGGER IF EXISTS trigger_auto_ban ON anti_cheat_logs;
CREATE TRIGGER trigger_auto_ban
    AFTER INSERT ON anti_cheat_logs
    FOR EACH ROW
    EXECUTE FUNCTION auto_ban_cheater();

-- =====================================================
-- 5. ФУНКЦИЯ ПРОВЕРКИ БАНА
-- =====================================================

CREATE OR REPLACE FUNCTION is_user_banned(user_wallet TEXT)
RETURNS TABLE (
    is_banned BOOLEAN,
    ban_type TEXT,
    reason TEXT,
    banned_until TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as is_banned,
        bu.ban_type,
        bu.reason,
        bu.banned_until
    FROM banned_users bu
    WHERE bu.wallet_address = user_wallet
      AND (
          bu.ban_type = 'permanent'
          OR (bu.ban_type = 'temp' AND bu.banned_until > NOW())
      )
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ФУНКЦИЯ АНАЛИЗА СТАТИСТИКИ ЧИТЕРОВ
-- =====================================================

CREATE OR REPLACE FUNCTION get_cheat_statistics(days_back INT DEFAULT 7)
RETURNS TABLE (
    activity_type TEXT,
    count BIGINT,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        acl.activity_type,
        COUNT(*) as count,
        COUNT(DISTINCT acl.wallet_address) as unique_users
    FROM anti_cheat_logs acl
    WHERE acl.timestamp > NOW() - (days_back || ' days')::INTERVAL
    GROUP BY acl.activity_type
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. ФУНКЦИЯ ВАЛИДАЦИИ ДЕЙСТВИЙ
-- =====================================================

CREATE OR REPLACE FUNCTION validate_player_action(
    user_wallet TEXT,
    action_type TEXT,
    xp_amount INT,
    tama_amount INT
)
RETURNS BOOLEAN AS $$
DECLARE
    recent_actions INT;
    is_banned_user BOOLEAN;
BEGIN
    -- Проверка бана
    SELECT COUNT(*) > 0 INTO is_banned_user
    FROM banned_users
    WHERE wallet_address = user_wallet
      AND (ban_type = 'permanent' OR banned_until > NOW());
    
    IF is_banned_user THEN
        RETURN FALSE;
    END IF;
    
    -- Проверка частоты действий (не более 60 в минуту)
    SELECT COUNT(*) INTO recent_actions
    FROM player_actions
    WHERE wallet_address = user_wallet
      AND timestamp > NOW() - INTERVAL '1 minute';
    
    IF recent_actions > 60 THEN
        -- Логировать подозрительную активность
        INSERT INTO anti_cheat_logs (wallet_address, activity_type, details)
        VALUES (user_wallet, 'action_spam', jsonb_build_object('count', recent_actions));
        
        RETURN FALSE;
    END IF;
    
    -- Проверка на аномальные значения
    IF xp_amount > 100 OR tama_amount > 100 THEN
        INSERT INTO anti_cheat_logs (wallet_address, activity_type, details)
        VALUES (user_wallet, 'suspicious_values', jsonb_build_object(
            'xp', xp_amount,
            'tama', tama_amount
        ));
        
        RETURN FALSE;
    END IF;
    
    -- Записать действие
    INSERT INTO player_actions (wallet_address, action_type, xp_gained, tama_gained)
    VALUES (user_wallet, action_type, xp_amount, tama_amount);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. VIEW ДЛЯ АДМИН ПАНЕЛИ
-- =====================================================

CREATE OR REPLACE VIEW admin_cheat_summary AS
SELECT 
    acl.wallet_address,
    COUNT(*) as total_incidents,
    COUNT(DISTINCT acl.activity_type) as different_types,
    MAX(acl.timestamp) as last_incident,
    BOOL_OR(bu.wallet_address IS NOT NULL) as is_banned,
    STRING_AGG(DISTINCT acl.activity_type, ', ') as incident_types
FROM anti_cheat_logs acl
LEFT JOIN banned_users bu ON acl.wallet_address = bu.wallet_address
GROUP BY acl.wallet_address
HAVING COUNT(*) > 2
ORDER BY total_incidents DESC;

COMMENT ON VIEW admin_cheat_summary IS 'Сводка по читерам для админ панели';

-- =====================================================
-- ✅ ГОТОВО!
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Anti-Cheat database setup complete!';
    RAISE NOTICE '📊 Tables created: anti_cheat_logs, banned_users, player_actions';
    RAISE NOTICE '🔧 Functions created: auto_ban_cheater, is_user_banned, validate_player_action';
    RAISE NOTICE '📈 View created: admin_cheat_summary';
END $$;

-- =====================================================
-- ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
-- =====================================================

-- Проверить забанен ли пользователь
-- SELECT * FROM is_user_banned('wallet_address');

-- Получить статистику читов за 7 дней
-- SELECT * FROM get_cheat_statistics(7);

-- Посмотреть топ читеров
-- SELECT * FROM admin_cheat_summary LIMIT 20;

-- Забанить пользователя вручную
-- INSERT INTO banned_users (wallet_address, ban_type, reason, banned_by)
-- VALUES ('wallet_address', 'permanent', 'Читы', 'admin');

-- Разбанить пользователя
-- DELETE FROM banned_users WHERE wallet_address = 'wallet_address';

