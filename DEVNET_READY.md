# 🚀 DEVNET ГОТОВ К ТЕСТИРОВАНИЮ!

## ✅ ЧТО ГОТОВО:

### 1. NFT Smart Contract (Candy Machine V3)
- **Collection NFT:** `EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT`
- **Candy Machine:** `3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB`
- **Network:** Solana Devnet
- **Total Supply:** 100 NFTs
- **Uploaded:** 100 metadata + images на IPFS

### 2. Mint Page
- **URL:** https://tr1h.github.io/solana-tamagotchi-v3/mint.html
- **Цена:** 0.3 SOL (devnet)
- **Фазы минтинга:** 4 фазы с увеличением цены
- **Интеграция:** Phantom кошелек + Supabase

### 3. Game
- **URL:** https://tr1h.github.io/solana-tamagotchi-v3/
- **NFT-gated:** Доступ только с NFT
- **10 типов питомцев:** 🐱🐶🐉🦊🐻🐰🐼🦁🦄🐺
- **Система редкости:** Common, Rare, Epic, Legendary

### 4. Database (Supabase)
- ✅ Таблица `leaderboard` - игроки
- ✅ Таблица `nft_mints` - минты NFT
- ✅ Таблица `referrals` - рефералы
- ✅ RLS настроен

### 5. Telegram Bot
- ✅ Команды: /start, /help, /stats, /ref
- ✅ Реферальная система
- ✅ Интеграция с Supabase

---

## 🎯 КАК ТЕСТИРОВАТЬ:

### Шаг 1: Настрой Phantom на Devnet
1. Открой Phantom кошелек
2. Настройки → Developer Settings
3. Включи "Testnet Mode"
4. Выбери "Devnet"

### Шаг 2: Получи devnet SOL
**Вариант 1 - Web Faucet:**
- https://faucet.solana.com/
- Введи свой адрес кошелька
- Получи 1-2 SOL

**Вариант 2 - CLI:**
```bash
solana airdrop 1 YOUR_WALLET_ADDRESS
```

### Шаг 3: Минт NFT
1. Открой: https://tr1h.github.io/solana-tamagotchi-v3/mint.html
2. Connect Wallet (Phantom)
3. Нажми "MINT NOW - 0.3 SOL"
4. Подтверди транзакцию
5. Подожди 3 секунды → автоматический редирект в игру

### Шаг 4: Играй
1. После минта откроется игра автоматически
2. Твой питомец уже создан
3. Корми, играй, зарабатывай TAMA!

### Шаг 5: Тестируй рефералы
1. Открой Telegram: https://t.me/YourTamagotchiBot
2. Команда: `/ref`
3. Получи реферальную ссылку
4. Поделись с другом
5. Получи +25 TAMA когда он заминтит NFT

---

## 📊 ЛОГИКА РАБОТЫ:

### 1. Реферальная ссылка
**Формат:**
```
https://tr1h.github.io/solana-tamagotchi-v3/?ref={code}&tg_id={user_id}
```

**Что происходит:**
1. Пользователь кликает по ссылке
2. Код сохраняется в `localStorage`
3. При минте NFT активируется бонус +25 TAMA
4. Реферер получает награду

### 2. После минта NFT
**Автоматически:**
1. ✅ NFT создается в Solana
2. ✅ Запись в Supabase (`nft_mints` + `leaderboard`)
3. ✅ Питомец создается с данными NFT
4. ✅ Модальное окно "Success" (3 сек)
5. ✅ **Автоматический редирект** на `index.html`
6. ✅ Игра проверяет NFT ownership
7. ✅ Загружается питомец из базы
8. ✅ Игра доступна!

### 3. Без NFT
**Если нет NFT:**
1. Игра показывает "🔒 NFT Required"
2. Кнопка "🚀 Mint NFT" → редирект на `mint.html`
3. После минта → возврат в игру

---

## 🔍 ВИДЫ NFT В CANDY MACHINE:

### Что у нас (Standard NFT):
- **Формат:** Metaplex NFT Standard
- **Тип:** Non-Fungible (уникальные)
- **Metadata:** JSON на IPFS
- **Images:** PNG на IPFS
- **Royalty:** 5% (500 basis points)
- **Mutable:** Да (можно обновлять)

### Другие варианты:
1. **Programmable NFT (pNFT)**
   - Программируемые роялти
   - Автоматическое списание

2. **Compressed NFT**
   - Дешевые (0.0001 SOL)
   - Для масштаба (миллионы NFT)

3. **Master Edition**
   - Уникальные 1/1
   - Limited editions

---

## 🛠️ КОМАНДЫ ДЛЯ УПРАВЛЕНИЯ:

### Посмотреть статус Candy Machine:
```bash
cd /mnt/c/goooog/solana-tamagotchi
sugar show
```

### Минтинг через CLI:
```bash
sugar mint
```

### Проверить баланс:
```bash
solana balance
```

### Получить devnet SOL:
```bash
solana airdrop 1
```

---

## ⚠️ ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ DEVNET:

1. **Rate Limits:**
   - Airdrop: 1 SOL раз в несколько минут
   - Используй web faucet при лимитах

2. **Transaction Speed:**
   - Devnet медленнее mainnet
   - Ожидай 5-10 секунд на подтверждение

3. **NFT Visibility:**
   - NFT видны в Phantom через несколько минут
   - Проверяй в Solana Explorer

---

## 🎉 ИТОГОВЫЙ ЧЕКЛИСТ:

### Минтинг:
- ✅ Phantom подключается
- ✅ Баланс отображается
- ✅ Цена правильная (0.3 SOL)
- ✅ Транзакция проходит
- ✅ NFT записывается в Supabase
- ✅ Счетчик обновляется
- ✅ Модальное окно показывает результат
- ✅ Автоматический редирект в игру

### Игра:
- ✅ NFT ownership проверяется
- ✅ Питомец загружается из базы
- ✅ Игра доступна только с NFT
- ✅ Без NFT → редирект на минт
- ✅ Данные сохраняются в Supabase

### Рефералы:
- ✅ Ссылки генерируются
- ✅ Коды сохраняются
- ✅ Бонусы начисляются
- ✅ Статистика отображается

### Telegram:
- ✅ Бот работает
- ✅ Команды отвечают
- ✅ Данные из Supabase
- ✅ Рефералы работают

---

## 🚀 ВСЕ ГОТОВО ДЛЯ DEVNET ТЕСТИРОВАНИЯ!

**Начинай тестировать:** https://tr1h.github.io/solana-tamagotchi-v3/mint.html

**Telegram бот:** @YourTamagotchiBot (замени на свой)

**Документация:**
- `NFT_SETUP_GUIDE.md` - полная инструкция по NFT
- `MAINNET_CHECKLIST.md` - чеклист для mainnet
- `SIMPLE_STEPS.md` - быстрый старт

---

## 📝 СЛЕДУЮЩИЕ ШАГИ ДЛЯ MAINNET:

1. **Тестирование:**
   - Протестируй все функции на devnet
   - Исправь баги
   - Собери фидбек

2. **Подготовка:**
   - Создай реальные NFT картинки (100+ уникальных)
   - Настрой treasury wallet
   - Проверь все контракты

3. **Деплой на Mainnet:**
   - Используй `MAINNET_CHECKLIST.md`
   - Загрузи новые assets
   - Создай Candy Machine на mainnet

4. **Маркетинг:**
   - Анонс в Twitter
   - Telegram группа
   - Discord сервер

**УДАЧИ! 🎮🚀**




