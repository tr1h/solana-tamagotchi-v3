# 🚀 Deployment Checklist - Solana Tamagotchi

## ✅ Что сделано

### 1. NFT Минт система ✅
- [x] Интегрирован Metaplex Umi SDK
- [x] Реальный минт через Candy Machine v3
- [x] NFT появляются в Phantom кошельке
- [x] Transaction подтверждаются на devnet
- [x] Metadata генерируется для каждого NFT

### 2. База данных ✅
- [x] `nft_mint_address` колонка добавлена
- [x] Mint записывается в `nft_mints` таблицу
- [x] Leaderboard обновляется с mint address
- [x] Migration SQL созданы
- [x] RLS политики настроены

### 3. Проверка владения NFT ✅
- [x] Проверка через базу данных (быстро)
- [x] Проверка через blockchain (Umi)
- [x] Fallback на blockchain если нет в базе
- [x] Фоновая верификация on-chain
- [x] Блокировка доступа без NFT

### 4. Изображения NFT ✅
- [x] 10 типов питомцев (эмодзи для devnet)
- [x] Рандомная генерация типа
- [x] Рарити система (70% common, 20% rare, 8% epic, 2% legendary)
- [x] Guide для создания реальных PNG
- [x] Arweave инструкции для mainnet

### 5. Интеграции ✅
- [x] Umi SDK подключен в mint.html
- [x] Umi SDK подключен в index.html
- [x] Wallet connection с Umi
- [x] Database записывает mint address
- [x] Game загружает pet из NFT

---

## 📝 TODO перед деплоем в PRODUCTION

### Critical (Обязательно)
- [ ] **Протестировать полный флоу** (см. TESTING_GUIDE.md)
- [ ] **Миграция Supabase**
  ```sql
  -- Выполни в Supabase SQL Editor:
  -- 1. SUPABASE_SETUP.sql
  -- 2. SUPABASE_NFT_MINTS.sql  
  -- 3. database-migration-add-mint-address.sql
  ```
- [ ] **Проверить Candy Machine**
  ```bash
  sugar show --url devnet
  # Должен показать: Items available, price, collection
  ```
- [ ] **Тест минта с реальным SOL**
  - Получить devnet SOL
  - Минт 1 NFT
  - Проверить в Explorer
  - Проверить в Phantom

### Important (Желательно)
- [ ] **Создать реальные PNG изображения** (для mainnet)
  - 10 типов питомцев
  - 512x512px
  - Прозрачный фон
  - Загрузить на Arweave
  
- [ ] **Обновить metadata URLs**
  ```js
  // В umi-candy-machine.js строка 177
  image: `https://arweave.net/YOUR_HASH/${type}.png`
  ```

- [ ] **Настроить мониторинг**
  - Sentry для ошибок
  - Google Analytics
  - Mint tracker

### Nice to have (Опционально)
- [ ] Тесты на разных браузерах
- [ ] Mobile тестирование
- [ ] Rate limiting для минта
- [ ] Admin панель для статистики

---

## 🔧 Быстрый старт для devnet

### Если свежая установка:

```bash
# 1. Клонируй репо
git clone <your-repo>
cd solana-tamagotchi

# 2. Настрой Supabase
# - Создай проект на supabase.com
# - Выполни SQL из SUPABASE_SETUP.sql
# - Скопируй API keys в database-supabase.js

# 3. Настрой Candy Machine (если ещё не сделано)
cd scripts
npm install
npm run create-candy-machine
# Скопируй ID в umi-candy-machine.js

# 4. Запусти локальный сервер
cd ..
python -m http.server 8000
# Открой http://localhost:8000

# 5. Протестируй минт
# - Открой mint.html
# - Подключи Phantom (devnet)
# - Минт NFT
# - Проверь что всё работает
```

### Если уже настроено:

```bash
# 1. Убедись что Candy Machine на месте
sugar show --url devnet

# 2. Проверь Supabase
# - Таблицы созданы?
# - RLS включен?
# - API key актуален?

# 3. Запусти и тестируй
python -m http.server 8000
```

---

## 🌐 Deploy на GitHub Pages

```bash
# 1. Закомить изменения
git add .
git commit -m "✨ Add real Umi NFT minting + ownership verification"
git push origin main

# 2. GitHub Pages автоматически обновится
# Проверь через 2-3 минуты

# 3. Проверь production сайт
# https://YOUR_USERNAME.github.io/solana-tamagotchi-v3
```

---

## 🎯 Переход на Mainnet

### Когда готов:

1. **Создай production Candy Machine**
   ```bash
   solana config set --url mainnet-beta
   sugar create --config config-mainnet.json
   ```

2. **Загрузи изображения на Arweave**
   ```bash
   npm install -g @bundlr-network/client
   bundlr upload cat.png -c solana -w wallet.json
   ```

3. **Обнови код**
   ```js
   // umi-candy-machine.js
   const umi = createUmi('https://api.mainnet-beta.solana.com');
   
   // wallet.js
   network: 'mainnet-beta'
   ```

4. **Тестируй с малыми суммами!**

---

## 📊 Проверка статуса

### База данных
```sql
-- Количество минтов
SELECT COUNT(*) FROM nft_mints;

-- Последние 10 минтов
SELECT * FROM nft_mints ORDER BY created_at DESC LIMIT 10;

-- Игроки с NFT
SELECT COUNT(*) FROM leaderboard WHERE nft_mint_address IS NOT NULL;
```

### Candy Machine
```bash
# Статус CM
sugar show --url devnet

# Сколько минтов
# Items redeemed / Items available
```

### Website
- [ ] mint.html загружается
- [ ] index.html загружается  
- [ ] Wallet подключается
- [ ] Минт работает
- [ ] Игра загружается с NFT
- [ ] Нет ошибок в консоли

---

## 🐛 Debug команды

```bash
# Проверить Candy Machine
sugar show --url devnet

# Проверить NFT в кошельке
spl-token accounts --owner YOUR_WALLET --url devnet

# Проверить transaction
solana confirm TX_SIGNATURE --url devnet

# Проверить баланс
solana balance YOUR_WALLET --url devnet
```

---

## 📞 Support

Если что-то не работает:

1. Проверь **TESTING_GUIDE.md** - там все частые ошибки
2. Проверь консоль браузера
3. Проверь Supabase Dashboard → Logs
4. Проверь Solana Explorer

Telegram: https://t.me/solana_tamagotchi

---

## 🎉 Готово к запуску?

Пройди этот финальный чеклист:

- [ ] ✅ Все TODO завершены
- [ ] ✅ База данных настроена
- [ ] ✅ Candy Machine работает
- [ ] ✅ Минт тестирован
- [ ] ✅ NFT появляются в кошельке
- [ ] ✅ Игра работает с NFT
- [ ] ✅ Сохранение работает
- [ ] ✅ Нет критических багов
- [ ] ✅ Документация обновлена

**Если всё ✅ - ЗАПУСКАЙ! 🚀**

Good luck! 🍀


