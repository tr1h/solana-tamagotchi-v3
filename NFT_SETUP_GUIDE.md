# 🎨 Solana Tamagotchi NFT Setup Guide

Пошаговая инструкция для создания настоящей NFT коллекции на Solana.

## 📋 Что нам нужно

- Node.js 16+ и npm
- Phantom Wallet или Solflare
- SOL на devnet (для тестов) или mainnet (для продакшена)
- Metaplex CLI
- Изображения NFT (готовые или сгенерированные)

---

## 🛠️ Шаг 1: Установка Metaplex Sugar CLI

Sugar - это официальный инструмент Metaplex для создания NFT коллекций.

```bash
# Установка Sugar CLI
bash <(curl -sSf https://sugar.metaplex.com/install.sh)

# Проверка установки
sugar --version
```

---

## 🎨 Шаг 2: Подготовка NFT Assets

### Структура файлов:

```
solana-tamagotchi/nft-assets/
├── 0.png              # Изображение NFT #0
├── 0.json             # Метаданные NFT #0
├── 1.png              # Изображение NFT #1
├── 1.json             # Метаданные NFT #1
├── ...
├── collection.png     # Изображение коллекции
└── collection.json    # Метаданные коллекции
```

### Пример метаданных (0.json):

```json
{
  "name": "Tamagotchi Pet #0",
  "symbol": "TAMA",
  "description": "A unique Solana Tamagotchi NFT Pet - Play, Earn, and Evolve!",
  "image": "0.png",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Cat"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    },
    {
      "trait_type": "Color",
      "value": "Orange"
    },
    {
      "trait_type": "Background",
      "value": "Forest"
    },
    {
      "trait_type": "Special Ability",
      "value": "None"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "0.png",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "YOUR_WALLET_ADDRESS",
        "share": 100
      }
    ]
  }
}
```

### Метаданные коллекции (collection.json):

```json
{
  "name": "Solana Tamagotchi",
  "symbol": "TAMA",
  "description": "The Ultimate Blockchain Pet Game on Solana! Collect, Play, Earn with unique NFT pets.",
  "image": "collection.png",
  "attributes": [],
  "properties": {
    "files": [
      {
        "uri": "collection.png",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}
```

---

## ⚙️ Шаг 3: Настройка Sugar Config

Создайте файл `config.json`:

```json
{
  "price": 0.3,
  "number": 100,
  "symbol": "TAMA",
  "sellerFeeBasisPoints": 500,
  "gatekeeper": null,
  "solTreasuryAccount": "YOUR_TREASURY_WALLET",
  "splTokenAccount": null,
  "splToken": null,
  "goLiveDate": "2024-01-15T00:00:00Z",
  "endSettings": null,
  "whitelistMintSettings": null,
  "hiddenSettings": null,
  "uploadMethod": "bundlr",
  "retainAuthority": true,
  "isMutable": true,
  "creators": [
    {
      "address": "YOUR_WALLET_ADDRESS",
      "share": 100
    }
  ]
}
```

**Параметры:**
- `price`: Цена минта в SOL
- `number`: Количество NFT в коллекции
- `sellerFeeBasisPoints`: Роялти (500 = 5%)
- `solTreasuryAccount`: Кошелек для получения SOL от минтов
- `isMutable`: Можно ли изменять метаданные

---

## 🚀 Шаг 4: Деплой NFT коллекции

### 1. Валидация assets:

```bash
cd solana-tamagotchi/nft-assets
sugar validate
```

### 2. Загрузка assets:

```bash
# Devnet (тестирование)
sugar upload -r https://api.devnet.solana.com

# Mainnet (продакшен)
sugar upload -r https://api.mainnet-beta.solana.com
```

### 3. Деплой Candy Machine:

```bash
# Devnet
sugar deploy -r https://api.devnet.solana.com

# Mainnet
sugar deploy -r https://api.mainnet-beta.solana.com
```

### 4. Верификация коллекции:

```bash
sugar verify -r https://api.devnet.solana.com
```

---

## 📝 Шаг 5: Сохраните важные данные

После деплоя Sugar создаст файл `.sugar/cache.json`:

```json
{
  "program": {
    "candyMachine": "CANDY_MACHINE_ID_HERE",
    "candyMachineCreator": "CREATOR_ADDRESS",
    "collectionMint": "COLLECTION_MINT_ADDRESS"
  }
}
```

**ВАЖНО:** Сохраните эти адреса! Они понадобятся для интеграции с frontend.

---

## 💻 Шаг 6: Интеграция с Frontend

Обновите файл `js/mint.js`:

```javascript
const CANDY_MACHINE_ID = 'YOUR_CANDY_MACHINE_ID';
const COLLECTION_MINT = 'YOUR_COLLECTION_MINT';
const TREASURY_WALLET = 'YOUR_TREASURY_WALLET';
```

---

## 🔧 Альтернативный метод: Metaplex JS SDK

Если вы хотите создать NFT программно:

```bash
npm install @metaplex-foundation/js @solana/web3.js
```

Создайте скрипт `scripts/create-collection.js`:

```javascript
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js');
const { Connection, clusterApiUrl, Keypair } = require('@solana/web3.js');
const fs = require('fs');

async function createCollection() {
  // Подключение к Solana
  const connection = new Connection(clusterApiUrl('devnet'));
  
  // Загрузка кошелька
  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync('wallet.json', 'utf-8')))
  );
  
  // Настройка Metaplex
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(walletKeypair))
    .use(bundlrStorage());
  
  // Создание коллекции
  const { nft: collectionNft } = await metaplex.nfts().create({
    name: 'Solana Tamagotchi',
    symbol: 'TAMA',
    uri: 'https://your-metadata-url.com/collection.json',
    sellerFeeBasisPoints: 500, // 5% royalty
    isCollection: true,
  });
  
  console.log('✅ Collection created:', collectionNft.address.toString());
  
  // Сохранение адреса коллекции
  fs.writeFileSync('collection-address.txt', collectionNft.address.toString());
}

createCollection().catch(console.error);
```

Запуск:

```bash
node scripts/create-collection.js
```

---

## 📊 Тестирование

### Тестовый минт через CLI:

```bash
sugar mint -n 1 -r https://api.devnet.solana.com
```

### Проверка NFT:

Посмотрите NFT в:
- **Solana Explorer:** https://explorer.solana.com/ (переключите на devnet)
- **Phantom Wallet:** Collectibles tab
- **Magic Eden:** https://magiceden.io/

---

## 🔐 Безопасность

⚠️ **НИКОГДА** не коммитьте:
- Private keys
- Seed phrases
- `.sugar/` директорию с cache
- `wallet.json`

Добавьте в `.gitignore`:

```
.sugar/
wallet.json
*.key
devnet-wallet.json
mainnet-wallet.json
```

---

## 💡 Рекомендации

1. **Тестируйте на devnet** перед деплоем на mainnet
2. **Создайте резервные копии** wallet и cache файлов
3. **Используйте мультисиг** для treasury кошелька
4. **Верифицируйте коллекцию** на Magic Eden/Opensea
5. **Установите правильные роялти** (обычно 5-10%)

---

## 🆘 Troubleshooting

### Ошибка: "Insufficient SOL"
```bash
# Получите devnet SOL
solana airdrop 2 --url devnet
```

### Ошибка: "Upload failed"
```bash
# Очистите cache и попробуйте снова
rm -rf .sugar/cache.json
sugar upload
```

### Ошибка: "Invalid metadata"
```bash
# Проверьте JSON на ошибки
sugar validate
```

---

## 📚 Полезные ссылки

- **Metaplex Docs:** https://docs.metaplex.com/
- **Sugar CLI:** https://docs.metaplex.com/developer-tools/sugar/
- **Solana Cookbook:** https://solanacookbook.com/
- **Metaplex JS SDK:** https://github.com/metaplex-foundation/js

---

## ✅ Checklist

- [ ] Установлен Sugar CLI
- [ ] Подготовлены изображения NFT
- [ ] Созданы JSON метаданные
- [ ] Настроен config.json
- [ ] Assets загружены
- [ ] Candy Machine задеплоена
- [ ] Коллекция верифицирована
- [ ] Frontend обновлен
- [ ] Протестирован минт
- [ ] Документация обновлена

---

## 🎯 Следующие шаги

После успешного деплоя NFT:

1. Обновите `mint.js` с Candy Machine ID
2. Добавьте whitelist функционал (опционально)
3. Настройте reveal механизм (опционально)
4. Создайте landing page для минта
5. Запустите маркетинговую кампанию

Удачи! 🚀


