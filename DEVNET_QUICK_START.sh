#!/bin/bash
# 🚀 Автоматический devnet деплой

echo "🚀 Solana Tamagotchi - Devnet Deploy"
echo "===================================="

# 1. Проверка Sugar
if ! command -v sugar &> /dev/null; then
    echo "❌ Sugar не установлен!"
    echo "Установи: bash <(curl -sSf https://sugar.metaplex.com/install.sh)"
    exit 1
fi

# 2. Создание кошелька (если нет)
if [ ! -f "devnet-wallet.json" ]; then
    echo "📝 Создаю кошелек..."
    solana-keygen new --outfile devnet-wallet.json --no-bip39-passphrase
fi

# 3. Настройка devnet
echo "🔧 Настраиваю devnet..."
solana config set --url devnet
solana config set --keypair devnet-wallet.json

# 4. Airdrop SOL
echo "💰 Получаю SOL..."
solana airdrop 2
sleep 2
solana airdrop 2

# 5. Проверка баланса
BALANCE=$(solana balance)
echo "💎 Баланс: $BALANCE"

# 6. Генерация metadata (если не сделано)
if [ ! -d "nft-assets" ]; then
    echo "🎨 Генерирую metadata..."
    cd scripts
    npm install
    npm run generate-metadata
    cd ..
fi

# 7. Проверка картинок
PNG_COUNT=$(ls nft-assets/*.png 2>/dev/null | wc -l)
if [ "$PNG_COUNT" -lt 101 ]; then
    echo "⚠️  Нужно добавить картинки в nft-assets/"
    echo "Нужно: 0.png, 1.png, ..., 100.png, collection.png"
    echo ""
    echo "Быстрый вариант: создай одну template.png и запусти:"
    echo "cd nft-assets && for i in {0..100}; do cp template.png \$i.png; done"
    exit 1
fi

# 8. Деплой
echo "🍬 Деплою Candy Machine..."
sugar validate
sugar upload
sugar deploy

# 9. Тестовый минт
echo "🎉 Минчу тестовый NFT..."
sugar mint -n 1

echo ""
echo "✅ ГОТОВО!"
echo "Проверь NFT в Phantom (переключи на devnet)"




