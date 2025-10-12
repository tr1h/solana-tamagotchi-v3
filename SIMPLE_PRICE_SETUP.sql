-- 💰 SIMPLE PRICE MANAGEMENT - ПРОСТАЯ ВЕРСИЯ
-- Запусти это в Supabase SQL Editor

-- =====================================================
-- 1. ТАБЛИЦА НАСТРОЕК ИГРЫ (ПРОСТАЯ)
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

-- =====================================================
-- 2. ТАБЛИЦА ИСТОРИИ ЦЕН (ПРОСТАЯ)
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

-- =====================================================
-- 3. ВСТАВКА НАЧАЛЬНЫХ НАСТРОЕК
-- =====================================================

-- Удаляем старые записи если есть
DELETE FROM game_settings WHERE key = 'nft_price';

-- Вставляем новую запись
INSERT INTO game_settings (key, value, phase, tama_bonus, description) VALUES
('nft_price', 0.1, 1, 500, 'Current NFT mint price in SOL');

-- =====================================================
-- ✅ ГОТОВО!
-- =====================================================

SELECT 'Price management tables created successfully!' as result;
