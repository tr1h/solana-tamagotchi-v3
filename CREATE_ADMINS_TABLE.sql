-- 👤 CREATE ADMINS TABLE
-- Создаем таблицу для админов

-- Создаем таблицу admins
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{"tama_operations": true, "nft_management": true, "price_control": true, "user_management": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_admins_wallet_address ON admins (wallet_address);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins (role);

-- Добавляем существующих админов
INSERT INTO admins (wallet_address, role, permissions, created_at, updated_at)
VALUES 
    ('8bJixyhkqKJtGDEwrc9xLb2MPpL4yGjDNmiXWhCq86KA', 'admin', '{"tama_operations": true, "nft_management": true, "price_control": true, "user_management": true}', NOW(), NOW()),
    ('G8vpUg12KQUXkv7JfRxfSxYPUDwW9jtZ8CiL8KB5aXK2', 'admin', '{"tama_operations": true, "nft_management": true, "price_control": true, "user_management": true}', NOW(), NOW()),
    ('FVqqbyFMDysBjoMUgUDp5fGXhPwR9P82t1mNd4GJmBZK', 'admin', '{"tama_operations": true, "nft_management": true, "price_control": true, "user_management": true}', NOW(), NOW()),
    ('2eyQycA4d4zu3FbbwdvHuJ1fVDcfQsz78qGdKGYa8NXw', 'treasury', '{"tama_operations": true, "nft_management": false, "price_control": false, "user_management": false}', NOW(), NOW()),
    ('94Bb9DHFrLgJqv9jAYYoMNHGjH4KJNjk86vFDYUvWowr', 'admin', '{"tama_operations": true, "nft_management": true, "price_control": true, "user_management": true}', NOW(), NOW())
ON CONFLICT (wallet_address) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();

-- Проверяем что все админы добавлены
SELECT 
    wallet_address,
    role,
    permissions,
    created_at
FROM admins 
ORDER BY created_at DESC;

-- Success message
SELECT '✅ Admins table created and populated!' as result;
