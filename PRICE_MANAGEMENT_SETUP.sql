-- 💰 PRICE MANAGEMENT SYSTEM - УПРАВЛЕНИЕ ЦЕНАМИ
-- Запусти это в Supabase SQL Editor

-- =====================================================
-- 1. ТАБЛИЦА НАСТРОЕК ИГРЫ
-- =====================================================

CREATE TABLE IF NOT EXISTS game_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value DECIMAL(10,2) NOT NULL,
    phase INTEGER DEFAULT 1,
    tama_bonus INTEGER DEFAULT 500,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'admin'
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_game_settings_key ON game_settings(key);
CREATE INDEX IF NOT EXISTS idx_game_settings_updated ON game_settings(updated_at DESC);

-- Комментарии
COMMENT ON TABLE game_settings IS 'Настройки игры (цены, фазы, бонусы)';
COMMENT ON COLUMN game_settings.key IS 'Ключ настройки (nft_price, mint_bonus, etc.)';
COMMENT ON COLUMN game_settings.value IS 'Значение (цена в SOL)';
COMMENT ON COLUMN game_settings.phase IS 'Текущая фаза';
COMMENT ON COLUMN game_settings.tama_bonus IS 'Бонус TAMA за минт';

-- =====================================================
-- 2. ТАБЛИЦА ИСТОРИИ ИЗМЕНЕНИЙ ЦЕН
-- =====================================================

CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2) NOT NULL,
    phase INTEGER NOT NULL,
    tama_bonus INTEGER DEFAULT 500,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by TEXT DEFAULT 'admin',
    reason TEXT
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_phase ON price_history(phase);

-- Комментарии
COMMENT ON TABLE price_history IS 'История изменений цен NFT';
COMMENT ON COLUMN price_history.old_price IS 'Старая цена';
COMMENT ON COLUMN price_history.new_price IS 'Новая цена';
COMMENT ON COLUMN price_history.changed_by IS 'Кто изменил (admin, system, etc.)';

-- =====================================================
-- 3. ВСТАВКА НАЧАЛЬНЫХ НАСТРОЕК
-- =====================================================

INSERT INTO game_settings (key, value, phase, tama_bonus, description) VALUES
('nft_price', 0.1, 1, 500, 'Current NFT mint price in SOL'),
('mint_bonus', 500, 1, 500, 'TAMA bonus for minting NFT'),
('daily_login', 25, 1, 0, 'Daily login TAMA reward'),
('feed_reward', 5, 1, 0, 'Feed pet TAMA reward'),
('play_reward', 10, 1, 0, 'Play with pet TAMA reward'),
('level_up_reward', 50, 1, 0, 'Level up TAMA reward')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 4. ФУНКЦИЯ ПОЛУЧЕНИЯ ТЕКУЩЕЙ ЦЕНЫ
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_nft_price()
RETURNS TABLE (
    price DECIMAL(10,2),
    phase INTEGER,
    tama_bonus INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.value as price,
        gs.phase,
        gs.tama_bonus
    FROM game_settings gs
    WHERE gs.key = 'nft_price'
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0.1::DECIMAL(10,2), 1::INTEGER, 500::INTEGER;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. ФУНКЦИЯ ОБНОВЛЕНИЯ ЦЕНЫ
-- =====================================================

CREATE OR REPLACE FUNCTION update_nft_price(
    new_price DECIMAL(10,2),
    new_phase INTEGER,
    new_tama_bonus INTEGER,
    admin_name TEXT DEFAULT 'admin'
)
RETURNS BOOLEAN AS $$
DECLARE
    old_price DECIMAL(10,2);
BEGIN
    -- Получаем старую цену
    SELECT value INTO old_price
    FROM game_settings
    WHERE key = 'nft_price';
    
    -- Обновляем цену
    UPDATE game_settings
    SET 
        value = new_price,
        phase = new_phase,
        tama_bonus = new_tama_bonus,
        updated_at = NOW(),
        updated_by = admin_name
    WHERE key = 'nft_price';
    
    -- Записываем в историю
    INSERT INTO price_history (old_price, new_price, phase, tama_bonus, changed_by)
    VALUES (old_price, new_price, new_phase, new_tama_bonus, admin_name);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ФУНКЦИЯ ПОЛУЧЕНИЯ ИСТОРИИ ЦЕН
-- =====================================================

CREATE OR REPLACE FUNCTION get_price_history(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    changed_at TIMESTAMPTZ,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    phase INTEGER,
    tama_bonus INTEGER,
    changed_by TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.changed_at,
        ph.old_price,
        ph.new_price,
        ph.phase,
        ph.tama_bonus,
        ph.changed_by
    FROM price_history ph
    WHERE ph.changed_at > NOW() - (days_back || ' days')::INTERVAL
    ORDER BY ph.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО ЛОГИРОВАНИЯ
-- =====================================================

CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Логируем изменение только если цена действительно изменилась
    IF OLD.value != NEW.value OR OLD.phase != NEW.phase THEN
        INSERT INTO price_history (old_price, new_price, phase, tama_bonus, changed_by)
        VALUES (OLD.value, NEW.value, NEW.phase, NEW.tama_bonus, NEW.updated_by);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
DROP TRIGGER IF EXISTS trigger_log_price_change ON game_settings;
CREATE TRIGGER trigger_log_price_change
    AFTER UPDATE ON game_settings
    FOR EACH ROW
    EXECUTE FUNCTION log_price_change();

-- =====================================================
-- 8. VIEW ДЛЯ АДМИН ПАНЕЛИ
-- =====================================================

CREATE OR REPLACE VIEW admin_price_summary AS
SELECT 
    gs.key,
    gs.value as current_price,
    gs.phase as current_phase,
    gs.tama_bonus,
    gs.updated_at as last_updated,
    gs.updated_by as last_updated_by,
    COUNT(ph.id) as total_changes
FROM game_settings gs
LEFT JOIN price_history ph ON gs.key = 'nft_price' AND ph.new_price = gs.value
WHERE gs.key = 'nft_price'
GROUP BY gs.key, gs.value, gs.phase, gs.tama_bonus, gs.updated_at, gs.updated_by;

COMMENT ON VIEW admin_price_summary IS 'Сводка по ценам для админ панели';

-- =====================================================
-- ✅ ГОТОВО!
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Price Management system setup complete!';
    RAISE NOTICE '📊 Tables created: game_settings, price_history';
    RAISE NOTICE '🔧 Functions created: get_current_nft_price, update_nft_price, get_price_history';
    RAISE NOTICE '📈 View created: admin_price_summary';
    RAISE NOTICE '🎯 Initial settings inserted';
END $$;

-- =====================================================
-- ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
-- =====================================================

-- Получить текущую цену
-- SELECT * FROM get_current_nft_price();

-- Обновить цену
-- SELECT update_nft_price(0.2, 2, 750, 'admin');

-- Получить историю цен за 7 дней
-- SELECT * FROM get_price_history(7);

-- Посмотреть сводку
-- SELECT * FROM admin_price_summary;

-- Обновить цену через UPDATE
-- UPDATE game_settings SET value = 0.15, phase = 2, updated_by = 'admin' WHERE key = 'nft_price';
