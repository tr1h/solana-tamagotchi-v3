-- 👤 ADD NEW ADMIN WALLET
-- Добавляем новый админский кошелек в базу данных

-- Сначала создаем таблицу если её нет
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{"tama_operations": true, "nft_management": true, "price_control": true, "user_management": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем нового админа
INSERT INTO admins (wallet_address, role, permissions, created_at, updated_at)
VALUES (
    '94Bb9DHFrLgJqv9jAYYoMNHGjH4KJNjk86vFDYUvWowr',
    'admin',
    '{"tama_operations": true, "nft_management": true, "price_control": true, "user_management": true}',
    NOW(),
    NOW()
)
ON CONFLICT (wallet_address) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();

-- Проверяем что админ добавлен
SELECT 
    wallet_address,
    role,
    permissions,
    created_at
FROM admins 
WHERE wallet_address = '94Bb9DHFrLgJqv9jAYYoMNHGjH4KJNjk86vFDYUvWowr';

-- Показываем всех админов
SELECT 
    wallet_address,
    role,
    created_at
FROM admins 
ORDER BY created_at DESC;