# 🛠️ Solana Tamagotchi NFT Scripts

Скрипты для создания и деплоя NFT коллекции.

## 📦 Установка

```bash
cd scripts
npm install
```

## 🎨 Генерация метаданных NFT

Создает JSON метаданные для всей коллекции:

```bash
npm run generate-metadata
```

**Что создается:**
- `../nft-assets/0.json, 1.json, 2.json, ...` - метаданные для каждого NFT
- `../nft-assets/collection.json` - метаданные коллекции

**Конфигурация:**

Отредактируйте `generate-nft-metadata.js`:

```javascript
const CONFIG = {
  collectionName: 'Solana Tamagotchi',
  symbol: 'TAMA',
  totalSupply: 100,  // ← Измените количество NFT
  creatorAddress: 'YOUR_WALLET',  // ← Ваш адрес
  // ...
};
```

**После генерации:**

Добавьте изображения в `nft-assets/`:
- `0.png` (соответствует `0.json`)
- `1.png` (соответствует `1.json`)
- ...
- `collection.png`

## 🍬 Создание Candy Machine

Деплоит Candy Machine v3 на Solana:

```bash
npm run create-candy-machine
```

**Требования:**
- Solana CLI настроен
- Кошелек с SOL (devnet или mainnet)
- Metaplex SDK установлен

**Результат:**
- Создается NFT коллекция
- Деплоится Candy Machine
- Сохраняется `candy-machine-config.json`

**ВАЖНО:** Сохраните адреса из output!

## 🧪 Тестирование

### Тест минта (devnet):

```bash
npm run mint-test
```

Минтит 1 NFT для проверки работы Candy Machine.

## 📁 Структура файлов

```
scripts/
├── package.json                  # Зависимости
├── generate-nft-metadata.js      # Генератор метаданных
├── create-candy-machine.js       # Деплой Candy Machine
├── mint-test.js                  # Тест минта
└── README.md                     # Эта документация

../nft-assets/                    # Генерируется скриптами
├── 0.json, 0.png
├── 1.json, 1.png
├── ...
├── collection.json
└── collection.png

../                               # После деплоя
└── candy-machine-config.json     # Адреса коллекции и CM
```

## 🔧 Конфигурация

### generate-nft-metadata.js

```javascript
const CONFIG = {
  collectionName: 'Solana Tamagotchi',
  symbol: 'TAMA',
  description: '...',
  externalUrl: 'https://your-site.com',
  creatorAddress: 'YOUR_WALLET_ADDRESS',
  sellerFeeBasisPoints: 500,  // 5% роялти
  totalSupply: 100,
  outputDir: './nft-assets'
};
```

### create-candy-machine.js

```javascript
const CONFIG = {
  network: 'devnet',  // или 'mainnet-beta'
  collectionName: 'Solana Tamagotchi',
  collectionSymbol: 'TAMA',
  itemsAvailable: 100,
  price: 0.3,  // SOL
  sellerFeeBasisPoints: 500,
  walletPath: './devnet-wallet.json',
  collectionMetadataUri: 'https://arweave.net/...',
  treasuryWallet: 'YOUR_TREASURY_WALLET'
};
```

## 📚 Использование

### Полный flow (devnet):

1. **Генерация метаданных:**
   ```bash
   npm run generate-metadata
   ```

2. **Добавление изображений:**
   ```bash
   # Вручную добавьте PNG файлы в nft-assets/
   ```

3. **Валидация с Sugar:**
   ```bash
   cd ..
   sugar validate
   ```

4. **Загрузка на Arweave:**
   ```bash
   sugar upload
   ```

5. **Деплой Candy Machine:**
   ```bash
   cd scripts
   npm run create-candy-machine
   ```

6. **Тест минта:**
   ```bash
   npm run mint-test
   ```

### Альтернативный flow (только Sugar):

1. **Генерация метаданных:**
   ```bash
   npm run generate-metadata
   ```

2. **Полный деплой через Sugar:**
   ```bash
   cd ..
   sugar validate
   sugar upload
   sugar deploy
   sugar verify
   ```

## 🚨 Troubleshooting

### Error: "Cannot find module '@metaplex-foundation/js'"

```bash
npm install
```

### Error: "Invalid wallet path"

Создайте кошелек:

```bash
solana-keygen new --outfile devnet-wallet.json
```

### Error: "Insufficient funds"

Получите devnet SOL:

```bash
solana airdrop 2 --url devnet
```

### Metadata validation failed

Проверьте:
- Все JSON файлы валидны
- Есть соответствующие PNG файлы
- `collection.json` и `collection.png` существуют

## 🔐 Безопасность

**НЕ КОММИТЬТЕ:**
- `devnet-wallet.json`
- `mainnet-wallet.json`
- Любые `.key` файлы
- Private keys
- Seed phrases

Добавьте в `.gitignore`:
```
*.json
!package.json
!candy-machine-config.json
```

## 📖 Документация

- **Metaplex Docs:** https://docs.metaplex.com/
- **Sugar CLI:** https://docs.metaplex.com/developer-tools/sugar/
- **Candy Machine v3:** https://docs.metaplex.com/programs/candy-machine/

## 💡 Tips

1. **Всегда тестируйте на devnet** перед mainnet
2. **Сохраняйте все адреса** (collection, candy machine)
3. **Делайте backup** кошельков и конфигов
4. **Проверяйте metadata** перед загрузкой
5. **Мониторьте транзакции** в explorer

## 🆘 Нужна помощь?

- GitHub Issues: [ваш репозиторий]/issues
- Discord: https://discord.gg/metaplex
- Docs: См. `/NFT_SETUP_GUIDE.md`

## 📄 Лицензия

MIT

---

**Создано для Solana Tamagotchi 🐾**




