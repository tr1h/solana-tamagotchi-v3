-- ============================================
-- 🔧 ADD ADMIN WALLET
-- ============================================

-- Добавляем кошелек пользователя в таблицу админов
INSERT INTO admins (wallet_address, name, permissions, created_at, updated_at) 
VALUES (
    '8bJixyhkqKJtGDEwrc9xLb2MPpL4yGjDNmiXWhCq86KA',
    'Main Admin',
    'all',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    permissions = VALUES(permissions),
    updated_at = NOW();

-- Проверяем, что админ добавлен
SELECT * FROM admins WHERE wallet_address = '8bJixyhkqKJtGDEwrc9xLb2MPpL4yGjDNmiXWhCq86KA';

-- Показываем всех админов
SELECT wallet_address, name, permissions, created_at FROM admins ORDER BY created_at DESC;

-- ✅ Admin wallet added successfully!
