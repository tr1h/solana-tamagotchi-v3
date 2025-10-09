@echo off
REM 🚀 Windows batch скрипт для devnet деплоя

echo 🚀 Solana Tamagotchi - Devnet Deploy
echo ====================================

REM Создание кошелька
if not exist devnet-wallet.json (
    echo 📝 Создаю кошелек...
    solana-keygen new --outfile devnet-wallet.json --no-bip39-passphrase
)

REM Настройка devnet
echo 🔧 Настраиваю devnet...
solana config set --url devnet
solana config set --keypair devnet-wallet.json

REM Airdrop SOL
echo 💰 Получаю SOL...
solana airdrop 2
timeout /t 2
solana airdrop 2

REM Проверка баланса
echo 💎 Баланс:
solana balance

REM Генерация metadata
if not exist nft-assets (
    echo 🎨 Генерирую metadata...
    cd scripts
    call npm install
    call npm run generate-metadata
    cd ..
)

echo.
echo ⚠️ ВАЖНО: Добавь картинки в nft-assets\
echo Нужно: 0.png, 1.png, ..., 100.png, collection.png
echo.
echo После добавления картинок запусти:
echo sugar validate
echo sugar upload  
echo sugar deploy
echo sugar mint -n 1
echo.
pause



