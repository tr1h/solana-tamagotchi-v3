# ⚡ Quick NFT Deploy Guide

Быстрая инструкция для деплоя NFT коллекции за 30 минут.

## 🚀 Быстрый старт (Devnet)

### 1. Установка (5 минут)

```bash
# Установите Sugar CLI
bash <(curl -sSf https://sugar.metaplex.com/install.sh)

# Установите зависимости для скриптов
cd solana-tamagotchi/scripts
npm install
```

### 2. Создание кошелька (2 минуты)

```bash
# Создайте devnet кошелек
solana-keygen new --outfile devnet-wallet.json

# Настройте CLI
solana config set --url https://api.devnet.solana.com

# Получите тестовые SOL
solana airdrop 2
```

### 3. Генерация метаданных (5 минут)

```bash
# Сгенерируйте JSON метаданные
npm run generate-metadata

# Результат: nft-assets/0.json, 1.json, ..., collection.json
```

**ВАЖНО:** Добавьте изображения в `nft-assets/`:
- `0.png`, `1.png`, ... (по одному на каждый NFT)
- `collection.png` (для коллекции)

Можно использовать:
- Готовые изображения
- AI генерацию (Midjourney, DALL-E)
- Простые эмодзи (для теста)

### 4. Валидация assets (1 минута)

```bash
cd ..
sugar validate
```

Должно быть: ✅ `All assets verified!`

### 5. Деплой (10 минут)

```bash
# Загрузка на Arweave
sugar upload

# Деплой Candy Machine
sugar deploy

# Верификация
sugar verify
```

**Сохраните вывод!** Нужны адреса:
- `Candy Machine ID: ...`
- `Collection Mint: ...`

### 6. Обновление Frontend (5 минут)

Создайте файл `candy-machine-config.json`:

```json
{
  "network": "devnet",
  "candyMachine": {
    "address": "YOUR_CANDY_MACHINE_ID_HERE"
  },
  "collection": {
    "address": "YOUR_COLLECTION_MINT_HERE"
  }
}
```

### 7. Тест минта (2 минуты)

```bash
# Минт одного NFT для теста
sugar mint -n 1

# Проверьте в кошельке (Phantom -> Collectibles)
```

---

## 🎯 Интеграция с игрой

### Вариант A: Автоматическая (рекомендуется)

Добавьте в `mint.html` перед `</head>`:

```html
<script src="js/candy-machine-mint.js"></script>
```

Файл автоматически загрузит `candy-machine-config.json`.

### Вариант B: Ручная

Обновите `js/mint.js`:

```javascript
// В начале файла
const CANDY_MACHINE_ID = 'YOUR_CANDY_MACHINE_ID';
const COLLECTION_MINT = 'YOUR_COLLECTION_MINT';
```

---

## 📱 Быстрая проверка

1. Откройте `mint.html` в браузере
2. Подключите Phantom (devnet)
3. Запросите airdrop SOL
4. Нажмите "Mint NFT"
5. Подтвердите транзакцию
6. Проверьте NFT в кошельке

---

## 🔄 Обновление метаданных

Если нужно изменить metadata:

```bash
# 1. Отредактируйте JSON файлы в nft-assets/

# 2. Загрузите заново
sugar upload

# 3. Обновите Candy Machine
sugar update
```

---

## 🐛 Частые проблемы

### "Insufficient funds"

```bash
solana airdrop 2
```

### "Upload failed"

```bash
# Очистите cache
rm -rf .sugar/cache.json

# Попробуйте снова
sugar upload
```

### "Invalid config"

Проверьте `config.json` на ошибки:

```json
{
  "price": 0.3,
  "number": 100,
  "symbol": "TAMA"
}
```

### NFT не отображается

- Подождите 5-10 минут (индексация)
- Проверьте сеть в Phantom (должна быть devnet)
- Обновите кошелек

---

## 📊 Проверка статуса

```bash
# Показать информацию о Candy Machine
sugar show

# Количество оставшихся NFT
sugar show | grep "Items Redeemed"
```

---

## 🎨 Создание изображений

### Быстрый способ (для теста):

Используйте онлайн генераторы:
- https://www.nft-generator.art/
- https://nftcreator.com/
- https://www.bueno.art/

### Профессиональный способ:

1. **AI генерация:**
   - Midjourney
   - DALL-E
   - Stable Diffusion

2. **Ручное создание:**
   - Figma
   - Adobe Illustrator
   - Procreate

3. **Generative art:**
   - HashLips Art Engine
   - NFT Art Generator

**Требования к изображениям:**
- Формат: PNG
- Размер: 1000x1000px (рекомендуется)
- Макс. размер файла: 10MB
- Прозрачный фон (опционально)

---

## 💡 Pro Tips

1. **Начните с малого**
   - Деплойте 10-20 NFT для теста
   - Протестируйте весь flow
   - Затем масштабируйте

2. **Используйте batch upload**
   ```bash
   sugar upload --batch-size 50
   ```

3. **Мониторьте транзакции**
   - Solscan: https://solscan.io/?cluster=devnet
   - Solana Explorer: https://explorer.solana.com/?cluster=devnet

4. **Backup все**
   ```bash
   cp -r .sugar/ .sugar-backup/
   cp devnet-wallet.json devnet-wallet-backup.json
   ```

---

## 🚀 Переход на Mainnet

Когда все протестировано на devnet:

1. Замените `devnet` на `mainnet-beta` в конфигах
2. Создайте новый mainnet кошелек
3. Купите настоящие SOL (~2 SOL для старта)
4. Повторите шаги 4-7
5. Следуйте `MAINNET_CHECKLIST.md`

---

## 📚 Полезные команды

```bash
# Показать адрес кошелька
solana address

# Проверить баланс
solana balance

# Показать текущую сеть
solana config get

# Изменить сеть
solana config set --url devnet  # или mainnet-beta

# Список всех NFT из Candy Machine
sugar show

# Снять с продажи
sugar withdraw

# Обновить цену
sugar update --price 0.5
```

---

## 🎯 Next Steps

После успешного деплоя:

1. ✅ Протестируйте минт
2. ✅ Проверьте NFT в кошельке
3. ✅ Проверьте metadata на explorer
4. ✅ Интегрируйте с frontend
5. ✅ Добавьте в игру
6. ✅ Подготовьте маркетинг
7. ✅ Деплой на mainnet

---

## 🆘 Нужна помощь?

- **Discord:** https://discord.gg/metaplex
- **Docs:** https://docs.metaplex.com/
- **GitHub:** https://github.com/metaplex-foundation/

---

**Время выполнения:** ~30 минут  
**Сложность:** ⭐⭐☆☆☆  
**Стоимость (devnet):** FREE  
**Стоимость (mainnet):** ~1-2 SOL

Удачи! 🚀




