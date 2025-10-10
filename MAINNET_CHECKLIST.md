# 🚀 Mainnet Deployment Checklist

Пошаговый чеклист для деплоя Solana Tamagotchi на mainnet.

## ⚠️ ПЕРЕД СТАРТОМ

**КРИТИЧЕСКИ ВАЖНО:**
- ✅ Все протестировано на devnet
- ✅ Исправлены все баги
- ✅ UI/UX готов
- ✅ Документация обновлена
- ✅ Маркетинговый план готов
- ✅ Community готово
- ✅ Есть достаточно SOL для деплоя (минимум 5 SOL)

---

## 📋 ПОДГОТОВКА (за 1-2 недели до запуска)

### 1. Безопасность

- [ ] Создан **отдельный mainnet кошелек** (НЕ используйте devnet wallet!)
- [ ] Приватные ключи хранятся в **безопасном месте** (hardware wallet, Ledger)
- [ ] Настроен **мультисиг** для treasury кошелька (рекомендуется)
- [ ] Созданы **резервные копии** всех важных данных
- [ ] Проверена безопасность смарт-контрактов

### 2. Финансы

- [ ] Рассчитана стоимость деплоя:
  - Создание коллекции: ~0.01 SOL
  - Создание Candy Machine: ~0.1 SOL
  - Загрузка metadata на Arweave: ~0.1-1 SOL (зависит от количества)
  - Резерв на транзакции: ~0.5 SOL
  - **ИТОГО: минимум 1-2 SOL для деплоя**

- [ ] Создан **treasury wallet** для получения оплат
- [ ] Настроены **withdrawal процедуры**
- [ ] План распределения доходов готов

### 3. NFT Assets

- [ ] Все изображения готовы и оптимизированы (рекомендуется 1000x1000px PNG)
- [ ] Метаданные JSON созданы и проверены
- [ ] Collection изображение готово
- [ ] Все файлы проверены на качество
- [ ] Traits и rarity правильно распределены

### 4. Маркетинг

- [ ] Website готов и оптимизирован
- [ ] Social media аккаунты созданы:
  - [ ] Twitter/X
  - [ ] Discord
  - [ ] Telegram
- [ ] Landing page для минта готов
- [ ] Announcement посты написаны
- [ ] Influencer partnerships (опционально)
- [ ] Press release готов

---

## 🛠️ ТЕХНИЧЕСКИЙ ДЕПЛОЙ

### Шаг 1: Создание Mainnet Кошелька

```bash
# Создайте новый mainnet кошелек
solana-keygen new --outfile mainnet-wallet.json

# Сохраните seed phrase в БЕЗОПАСНОМ месте!
# НЕ КОММИТЬТЕ в git!

# Настройте Solana CLI на mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Проверьте адрес
solana address
```

**ВАЖНО:** Отправьте SOL на этот кошелек перед деплоем!

### Шаг 2: Обновление Конфигурации

Обновите `scripts/create-candy-machine.js`:

```javascript
const CONFIG = {
  network: 'mainnet-beta',  // ← Измените с 'devnet'
  itemsAvailable: 1000,     // Ваше количество NFT
  price: 0.3,               // Цена в SOL
  sellerFeeBasisPoints: 500, // 5% роялти
  walletPath: './mainnet-wallet.json',  // ← Mainnet кошелек
  treasuryWallet: 'YOUR_MAINNET_TREASURY_WALLET'
};
```

### Шаг 3: Загрузка Assets на Arweave

```bash
cd solana-tamagotchi

# Убедитесь что все assets готовы
ls nft-assets/

# Должно быть:
# 0.png, 0.json, 1.png, 1.json, ..., collection.png, collection.json

# Валидация
sugar validate

# Загрузка на Arweave (mainnet)
sugar upload -r https://api.mainnet-beta.solana.com

# ⚠️ ЭТО СТОИТ ДЕНЕГ! Проверьте стоимость перед подтверждением
```

### Шаг 4: Деплой Candy Machine

```bash
# Деплой Candy Machine на mainnet
sugar deploy -r https://api.mainnet-beta.solana.com

# Сохраните output! Нужны адреса:
# - Candy Machine ID
# - Collection Mint
```

### Шаг 5: Верификация

```bash
# Проверьте что все правильно задеплоено
sugar verify -r https://api.mainnet-beta.solana.com

# Тестовый минт (СТОИТ РЕАЛЬНЫЕ ДЕНЬГИ!)
sugar mint -n 1 -r https://api.mainnet-beta.solana.com
```

### Шаг 6: Обновление Frontend

Обновите `js/mint.js`:

```javascript
// Замените devnet на mainnet
const NETWORK = 'mainnet-beta';
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

// Обновите Candy Machine ID
const CANDY_MACHINE_ID = 'YOUR_MAINNET_CANDY_MACHINE_ID';
const COLLECTION_MINT = 'YOUR_MAINNET_COLLECTION_MINT';
const TREASURY_WALLET = 'YOUR_MAINNET_TREASURY_WALLET';
```

Обновите `js/database-supabase.js` для mainnet:

```javascript
// Создайте отдельную production базу данных
const SUPABASE_URL = 'https://YOUR_PRODUCTION_SUPABASE.supabase.co';
const SUPABASE_KEY = 'YOUR_PRODUCTION_ANON_KEY';
```

---

## 🌐 FRONTEND ДЕПЛОЙ

### Обновление GitHub Pages

```bash
# Коммит изменений
git add .
git commit -m "chore: Update to mainnet configuration"

# Push на GitHub
git push origin main

# GitHub Pages автоматически обновится
```

### Настройка Custom Domain (опционально)

```bash
# Создайте CNAME файл
echo "tamagotchi.yourdomain.com" > CNAME

# Обновите DNS записи у регистратора домена:
# Type: CNAME
# Name: tamagotchi
# Value: your-github-username.github.io
```

---

## 📊 POST-DEPLOYMENT

### 1. Мониторинг

- [ ] Проверьте что минтинг работает
- [ ] Мониторьте транзакции в Solana Explorer
- [ ] Проверьте что NFT отображаются в кошельках
- [ ] Мониторьте treasury баланс

### 2. Листинг на Маркетплейсах

- [ ] **Magic Eden:**
  - Заполните форму: https://magiceden.io/creators/apply
  - Предоставьте Candy Machine ID
  - Дождитесь верификации

- [ ] **Tensor:**
  - https://www.tensor.trade/
  - Submit collection для листинга

- [ ] **OpenSea (Solana):**
  - Collection автоматически появится после первого минта

### 3. Верификация Коллекции

```bash
# Верифицируйте коллекцию на Solana
metaplex verify_collection -k mainnet-wallet.json \
  --collection YOUR_COLLECTION_MINT \
  --candy-machine YOUR_CANDY_MACHINE_ID
```

### 4. Маркетинг Launch

- [ ] Announcement в Twitter/X
- [ ] Discord announcement
- [ ] Telegram announcement
- [ ] Email newsletter (если есть)
- [ ] Update website с Candy Machine адресом

---

## 🔐 БЕЗОПАСНОСТЬ ПОСЛЕ ЗАПУСКА

### 1. Защита Treasury

```bash
# Переведите деньги из treasury на secure wallet РЕГУЛЯРНО
# НЕ храните большие суммы на hot wallet
```

### 2. Мониторинг

- [ ] Настройте alerts на treasury wallet
- [ ] Мониторьте необычную активность
- [ ] Регулярно проверяйте Candy Machine state

### 3. Backup

- [ ] Сохраните `.sugar/cache.json` в безопасном месте
- [ ] Backup всех private keys
- [ ] Backup конфигурации

---

## 📈 АНАЛИТИКА

### Трекинг Метрик

- Количество минтов
- Revenue
- Floor price (если есть вторичка)
- Unique holders
- Social media engagement

### Инструменты:

- **Solscan:** https://solscan.io/
- **Solana Explorer:** https://explorer.solana.com/
- **Magic Eden Analytics:** В dashboard после листинга
- **Hellomoon:** https://www.hellomoon.io/

---

## 🆘 TROUBLESHOOTING

### Проблема: "Insufficient funds"

```bash
# Проверьте баланс
solana balance

# Пополните кошелек
# Для mainnet купите SOL на бирже и переведите
```

### Проблема: "Candy Machine full"

```bash
# Проверьте текущее состояние
sugar show -r https://api.mainnet-beta.solana.com

# Обновите лимит если нужно
sugar update -r https://api.mainnet-beta.solana.com
```

### Проблема: NFT не отображаются

- Проверьте что metadata правильно загружен
- Проверьте Arweave links
- Дождитесь индексации (может занять 5-10 минут)

---

## 💰 ЦЕНЫ И КОМИССИИ

### Один раз (деплой):

- Collection creation: ~0.01 SOL
- Candy Machine: ~0.1 SOL
- Arweave upload (100 NFT): ~0.5-1 SOL
- **ИТОГО: ~1-2 SOL**

### На каждый минт:

- Solana transaction fee: ~0.00001 SOL (платит пользователь)
- Metaplex royalty: 0% (на первичке)
- Your revenue: 100% от mint price

### Вторичный рынок:

- Marketplace fee: 2-2.5% (Magic Eden, Tensor)
- Creator royalty: 5% (ваша настройка)

---

## 📞 КОНТАКТЫ SUPPORT

### Если что-то пошло не так:

- **Metaplex Discord:** https://discord.gg/metaplex
- **Solana Discord:** https://discord.gg/solana
- **Magic Eden Discord:** https://discord.gg/magiceden
- **Sugar CLI Docs:** https://docs.metaplex.com/developer-tools/sugar/

---

## ✅ ФИНАЛЬНЫЙ CHECKLIST

Перед публичным запуском:

- [ ] Все тесты пройдены на devnet
- [ ] Mainnet кошельки безопасно сохранены
- [ ] Достаточно SOL на кошельке
- [ ] NFT assets загружены
- [ ] Candy Machine задеплоен
- [ ] Frontend обновлен на mainnet
- [ ] Минт протестирован (хотя бы 1 NFT)
- [ ] Treasury настроен
- [ ] Маркетинговые материалы готовы
- [ ] Social media посты запланированы
- [ ] Discord/Telegram community готово
- [ ] Support team briefed
- [ ] Мониторинг настроен
- [ ] Backup созданы

---

## 🎉 ПОСЛЕ УСПЕШНОГО ЗАПУСКА

1. **Следите за метриками** - смотрите на mint rate, revenue, engagement
2. **Общайтесь с community** - отвечайте на вопросы, собирайте фидбек
3. **Развивайте проект** - добавляйте новые фичи, события, rewards
4. **Поддерживайте игру** - фиксите баги, улучшайте UX
5. **Растите community** - делайте giveaways, contests, collaborations

---

## 🚨 ЧТО ДЕЛАТЬ ЕСЛИ...

### Критическая ошибка в Candy Machine

1. НЕ ПАНИКУЙТЕ
2. Приостановите минты (если возможно)
3. Обратитесь в Metaplex Discord
4. Communicate с community
5. Работайте над fix

### Проблемы с frontend

1. Откатитесь на предыдущий working commit
2. Фиксите в dev environment
3. Тестируйте
4. Деплойте fix

### Treasury компрометирован

1. НЕМЕДЛЕННО выведите все средства
2. Создайте новый secure wallet
3. Обновите Candy Machine config
4. Уведомите community

---

## 💪 УДАЧИ!

Деплой на mainnet - это большой шаг! Помните:

- Тестируйте все на devnet сначала
- Не спешите
- Безопасность превыше всего
- Community - ваш главный актив
- Учитесь на ошибках

**LFG! 🚀**





