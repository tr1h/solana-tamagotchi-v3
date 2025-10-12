-- 🐾 UPDATE PET DATABASE - ДОБАВЛЕНИЕ КОЛОНОК ДЛЯ НОВОЙ СИСТЕМЫ ПИТОМЦЕВ
-- Запусти это в Supabase SQL Editor для обновления таблиц

-- =====================================================
-- 1. ОБНОВЛЕНИЕ ТАБЛИЦЫ NFT_MINTS
-- =====================================================

-- Добавляем колонки для эволюции и уровня
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS evolution INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;

-- Добавляем колонки для способностей (JSONB массив)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS abilities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ability_cooldowns JSONB DEFAULT '{}'::jsonb;

-- Добавляем колонки для атрибутов (JSONB объект)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{"intelligence": 50, "strength": 50, "speed": 50, "magic": 50}'::jsonb;

-- Добавляем колонки для статов (JSONB объект)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"hunger": 100, "energy": 100, "happy": 100, "health": 100}'::jsonb;

-- Добавляем колонку для множителя TAMA
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS tama_multiplier DECIMAL(10,2) DEFAULT 1.00;

-- Добавляем колонки для временных меток действий
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS last_fed TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_played TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_slept TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_update TIMESTAMPTZ DEFAULT NOW();

-- Добавляем колонки для состояний
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS is_dead BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_hibernating BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_stealthed BOOLEAN DEFAULT FALSE;

-- Добавляем категорию питомца (smart, strong, cute, mythical)
ALTER TABLE nft_mints 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'common';

-- =====================================================
-- 2. СОЗДАНИЕ ИНДЕКСОВ ДЛЯ БЫСТРОГО ПОИСКА
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_nft_evolution ON nft_mints(evolution);
CREATE INDEX IF NOT EXISTS idx_nft_level ON nft_mints(level);
CREATE INDEX IF NOT EXISTS idx_nft_category ON nft_mints(category);
CREATE INDEX IF NOT EXISTS idx_nft_is_dead ON nft_mints(is_dead);

-- Индексы для JSONB полей (GIN индексы)
CREATE INDEX IF NOT EXISTS idx_nft_abilities ON nft_mints USING GIN(abilities);
CREATE INDEX IF NOT EXISTS idx_nft_attributes ON nft_mints USING GIN(attributes);
CREATE INDEX IF NOT EXISTS idx_nft_stats ON nft_mints USING GIN(stats);

-- =====================================================
-- 3. ДОБАВЛЕНИЕ КОММЕНТАРИЕВ
-- =====================================================

COMMENT ON COLUMN nft_mints.evolution IS 'Уровень эволюции (0-4: Baby, Young, Adult, Wise, Legendary)';
COMMENT ON COLUMN nft_mints.level IS 'Уровень питомца';
COMMENT ON COLUMN nft_mints.xp IS 'Текущий опыт';
COMMENT ON COLUMN nft_mints.total_xp IS 'Общий заработанный опыт';
COMMENT ON COLUMN nft_mints.abilities IS 'Массив способностей питомца (JSONB)';
COMMENT ON COLUMN nft_mints.ability_cooldowns IS 'Кулдауны способностей (JSONB)';
COMMENT ON COLUMN nft_mints.attributes IS 'Атрибуты: intelligence, strength, speed, magic (JSONB)';
COMMENT ON COLUMN nft_mints.stats IS 'Статы: hunger, energy, happy, health (JSONB)';
COMMENT ON COLUMN nft_mints.tama_multiplier IS 'Множитель заработка TAMA';
COMMENT ON COLUMN nft_mints.category IS 'Категория питомца (smart, strong, cute, mythical)';
COMMENT ON COLUMN nft_mints.is_dead IS 'Питомец мертв';
COMMENT ON COLUMN nft_mints.is_critical IS 'Критическое состояние';
COMMENT ON COLUMN nft_mints.is_hibernating IS 'Режим гибернации';
COMMENT ON COLUMN nft_mints.is_stealthed IS 'Режим скрытности';

-- =====================================================
-- 4. ОБНОВЛЕНИЕ СУЩЕСТВУЮЩИХ ЗАПИСЕЙ
-- =====================================================

-- Обновляем существующие записи с дефолтными значениями на основе типа питомца
UPDATE nft_mints 
SET 
    abilities = CASE pet_type
        WHEN 'cat' THEN '["nine_lives", "stealth", "agility"]'::jsonb
        WHEN 'dog' THEN '["loyalty", "fetch", "guard"]'::jsonb
        WHEN 'dragon' THEN '["fire_breath", "flight", "intimidate"]'::jsonb
        WHEN 'fox' THEN '["cunning", "stealth", "charm"]'::jsonb
        WHEN 'bear' THEN '["roar", "hibernate", "crush"]'::jsonb
        WHEN 'rabbit' THEN '["jump", "dash", "luck"]'::jsonb
        WHEN 'panda' THEN '["bamboo_feast", "calm", "zen"]'::jsonb
        WHEN 'lion' THEN '["roar", "leadership", "pride"]'::jsonb
        WHEN 'unicorn' THEN '["healing", "magic_boost", "purify"]'::jsonb
        WHEN 'wolf' THEN '["howl", "pack_leader", "hunt"]'::jsonb
        WHEN 'griffin' THEN '["sky_strike", "noble_aura", "swift_flight"]'::jsonb
        ELSE '[]'::jsonb
    END,
    category = CASE pet_type
        WHEN 'cat' THEN 'smart'
        WHEN 'fox' THEN 'smart'
        WHEN 'bear' THEN 'strong'
        WHEN 'lion' THEN 'strong'
        WHEN 'wolf' THEN 'strong'
        WHEN 'dog' THEN 'friendly'
        WHEN 'rabbit' THEN 'cute'
        WHEN 'panda' THEN 'cute'
        WHEN 'dragon' THEN 'mythical'
        WHEN 'unicorn' THEN 'mythical'
        WHEN 'griffin' THEN 'mythical'
        ELSE 'common'
    END,
    attributes = CASE pet_type
        WHEN 'cat' THEN '{"intelligence": 90, "strength": 60, "speed": 85, "magic": 50}'::jsonb
        WHEN 'dog' THEN '{"intelligence": 70, "strength": 80, "speed": 90, "magic": 30}'::jsonb
        WHEN 'dragon' THEN '{"intelligence": 85, "strength": 95, "speed": 75, "magic": 100}'::jsonb
        WHEN 'fox' THEN '{"intelligence": 95, "strength": 65, "speed": 92, "magic": 60}'::jsonb
        WHEN 'bear' THEN '{"intelligence": 60, "strength": 100, "speed": 60, "magic": 40}'::jsonb
        WHEN 'rabbit' THEN '{"intelligence": 75, "strength": 50, "speed": 100, "magic": 55}'::jsonb
        WHEN 'panda' THEN '{"intelligence": 80, "strength": 85, "speed": 65, "magic": 70}'::jsonb
        WHEN 'lion' THEN '{"intelligence": 75, "strength": 95, "speed": 88, "magic": 50}'::jsonb
        WHEN 'unicorn' THEN '{"intelligence": 90, "strength": 70, "speed": 85, "magic": 100}'::jsonb
        WHEN 'wolf' THEN '{"intelligence": 85, "strength": 90, "speed": 95, "magic": 60}'::jsonb
        WHEN 'griffin' THEN '{"intelligence": 90, "strength": 90, "speed": 95, "magic": 85}'::jsonb
        ELSE '{"intelligence": 50, "strength": 50, "speed": 50, "magic": 50}'::jsonb
    END,
    tama_multiplier = CASE 
        WHEN pet_type IN ('dragon', 'griffin') THEN 1.50
        WHEN pet_type IN ('lion', 'wolf', 'unicorn') THEN 1.30
        WHEN pet_type IN ('fox', 'panda') THEN 1.10
        ELSE 1.00
    END * CASE pet_traits->>'rarity'
        WHEN 'legendary' THEN 1.50
        WHEN 'epic' THEN 1.30
        WHEN 'rare' THEN 1.10
        ELSE 1.00
    END
WHERE abilities IS NULL OR abilities = '[]'::jsonb;

-- =====================================================
-- 5. СОЗДАНИЕ ТАБЛИЦЫ ДЛЯ ИСТОРИИ ЭВОЛЮЦИЙ
-- =====================================================

CREATE TABLE IF NOT EXISTS pet_evolution_history (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    mint_address TEXT NOT NULL,
    old_evolution INT NOT NULL,
    new_evolution INT NOT NULL,
    tama_spent INT NOT NULL,
    evolution_timestamp TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (mint_address) REFERENCES nft_mints(mint_address) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evolution_wallet ON pet_evolution_history(wallet_address);
CREATE INDEX IF NOT EXISTS idx_evolution_mint ON pet_evolution_history(mint_address);
CREATE INDEX IF NOT EXISTS idx_evolution_timestamp ON pet_evolution_history(evolution_timestamp DESC);

COMMENT ON TABLE pet_evolution_history IS 'История эволюций питомцев';
COMMENT ON COLUMN pet_evolution_history.old_evolution IS 'Предыдущий уровень эволюции';
COMMENT ON COLUMN pet_evolution_history.new_evolution IS 'Новый уровень эволюции';
COMMENT ON COLUMN pet_evolution_history.tama_spent IS 'Потрачено TAMA на эволюцию';

-- =====================================================
-- 6. СОЗДАНИЕ ТАБЛИЦЫ ДЛЯ ИСПОЛЬЗОВАНИЯ СПОСОБНОСТЕЙ
-- =====================================================

CREATE TABLE IF NOT EXISTS pet_ability_usage (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    mint_address TEXT NOT NULL,
    ability_name TEXT NOT NULL,
    tama_earned INT DEFAULT 0,
    usage_timestamp TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (mint_address) REFERENCES nft_mints(mint_address) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ability_wallet ON pet_ability_usage(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ability_mint ON pet_ability_usage(mint_address);
CREATE INDEX IF NOT EXISTS idx_ability_name ON pet_ability_usage(ability_name);
CREATE INDEX IF NOT EXISTS idx_ability_timestamp ON pet_ability_usage(usage_timestamp DESC);

COMMENT ON TABLE pet_ability_usage IS 'История использования способностей';
COMMENT ON COLUMN pet_ability_usage.ability_name IS 'Название использованной способности';
COMMENT ON COLUMN pet_ability_usage.tama_earned IS 'TAMA заработано от способности';

-- =====================================================
-- 7. ПРОВЕРКА ОБНОВЛЕНИЙ
-- =====================================================

-- Показать структуру обновленной таблицы
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'nft_mints' 
ORDER BY ordinal_position;

-- Показать количество питомцев по типам и эволюциям
SELECT 
    pet_type,
    evolution,
    COUNT(*) as count
FROM nft_mints
GROUP BY pet_type, evolution
ORDER BY pet_type, evolution;

-- =====================================================
-- 8. ФУНКЦИЯ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ last_update
-- =====================================================

CREATE OR REPLACE FUNCTION update_last_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_update = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
DROP TRIGGER IF EXISTS trigger_update_last_update ON nft_mints;
CREATE TRIGGER trigger_update_last_update
    BEFORE UPDATE ON nft_mints
    FOR EACH ROW
    EXECUTE FUNCTION update_last_update_timestamp();

-- =====================================================
-- ✅ ГОТОВО! БАЗА ДАННЫХ ОБНОВЛЕНА!
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Pet database updated successfully!';
    RAISE NOTICE '📊 New columns added: evolution, level, xp, abilities, attributes, stats, etc.';
    RAISE NOTICE '📋 New tables created: pet_evolution_history, pet_ability_usage';
    RAISE NOTICE '🔧 Triggers and indexes created';
    RAISE NOTICE '🎉 Ready to use the new Pet System!';
END $$;

