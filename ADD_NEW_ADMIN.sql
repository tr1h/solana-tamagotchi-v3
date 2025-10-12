-- ============================================
-- 🔐 ADD NEW ADMIN WALLET
-- ============================================

-- Добавляем новый админский кошелек
INSERT INTO admins (wallet_address, role, permissions, created_at, updated_at)
VALUES (
    'G8vpUg12KQUXkv7JfRxfSxYPUDwW9jtZ8CiL8KB5aXK2',
    'admin',
    '["read", "write", "delete", "admin"]',
    NOW(),
    NOW()
)
ON CONFLICT (wallet_address) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();

-- Проверяем что добавилось
SELECT * FROM admins WHERE wallet_address = 'G8vpUg12KQUXkv7JfRxfSxYPUDwW9jtZ8CiL8KB5aXK2';

-- ✅ Новый админ добавлен!
