# ⚡ ПРОСТЫЕ ШАГИ (5 минут)

## Копируй и вставляй по порядку:

### 1. Открой Git Bash в папке solana-tamagotchi

### 2. Скопируй ВСЁ и вставь:

```bash
# Создай кошелек
solana-keygen new --outfile devnet-wallet.json --no-bip39-passphrase

# Настрой devnet
solana config set --url devnet
solana config set --keypair devnet-wallet.json

# Получи SOL
solana airdrop 2 && sleep 2 && solana airdrop 2

# Баланс
solana balance

# Metadata
cd scripts && npm install && npm run generate-metadata && cd ..
```

### 3. Добавь картинки:

**Быстрый способ (placeholder):**
```bash
cd nft-assets
# Создай template.png (любую картинку 1000x1000)
# Потом:
for i in {0..100}; do cp template.png $i.png; done
cp template.png collection.png
cd ..
```

**Или скачай готовые с:**
- leonardo.ai (бесплатно)
- Сохрани как 0.png, 1.png, ..., collection.png

### 4. Деплой:

```bash
sugar validate
sugar upload
sugar deploy
sugar mint -n 1
```

### 5. Готово! 🎉

Проверь NFT в Phantom (переключи на devnet)

---

## 🆘 Проблемы?

**"Insufficient funds"** → `solana airdrop 2`

**"sugar not found"** → Установи Sugar:
```bash
bash <(curl -sSf https://sugar.metaplex.com/install.sh)
```

**Нет картинок** → Создай хотя бы одну, скопируй 100 раз

---

**ВСЁ! Просто копируй команды! 🚀**


