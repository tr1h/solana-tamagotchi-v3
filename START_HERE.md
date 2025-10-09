# 🎮 Solana Tamagotchi - START HERE

## 👋 Привет!

Это **полнофункциональная NFT-игра на Solana** с реальным минтом через Candy Machine!

---

## ⚡ БЫСТРЫЙ СТАРТ (5 минут)

### Шаг 1: Миграция базы данных
```sql
-- Открой Supabase SQL Editor и выполни:
ALTER TABLE public.leaderboard 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT;

ALTER TABLE public.nft_mints 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT UNIQUE;
```

### Шаг 2: Запуск
```bash
cd solana-tamagotchi
python -m http.server 8000
```

### Шаг 3: Тестирование
1. Открой http://localhost:8000/mint.html
2. Получи devnet SOL: https://faucet.solana.com
3. Mint NFT → NFT появится в Phantom!
4. Открой http://localhost:8000/index.html
5. Играй с питомцем! 🐾

---

## 📚 Документация

### Начинающим
- ⚡ **[QUICK_START.md](./QUICK_START.md)** - запуск за 5 минут
- 📖 **[LATEST_UPDATES.md](./LATEST_UPDATES.md)** - что нового

### Разработчикам
- 🧪 **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - полное руководство по тестам
- 📋 **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - чеклист деплоя
- 🎨 **[GENERATE_NFT_IMAGES.md](./GENERATE_NFT_IMAGES.md)** - создание изображений

### Продвинутым
- 📝 **[HOW_TO_MINT_NFT.md](./HOW_TO_MINT_NFT.md)** - детали минта
- 🔧 **[CANDY_MACHINE_READY.md](./CANDY_MACHINE_READY.md)** - статус CM
- ✅ **[DONE.md](./DONE.md)** - список выполненных задач

---

## ✨ Что работает

### ✅ Полностью готово для DEVNET!
- Реальный минт NFT через Candy Machine v3
- NFT появляются в Phantom кошельке
- Проверка владения NFT (база + blockchain)
- 10 типов питомцев с рарити системой
- Play-to-Earn механика
- Telegram бот интеграция
- Реферальная система
- Leaderboard
- **🚫 ДЕМО РЕЖИМ УБРАН** - только реальные SOL транзакции!
- **💰 Airdrop кнопка работает** - начисляет реальный SOL на devnet

### ⏳ Для MAINNET нужно
- Создать реальные PNG (сейчас эмодзи)
- Загрузить на Arweave
- Создать mainnet Candy Machine

---

## 🎯 Архитектура

```
┌─────────────┐
│   mint.html │ → Минт NFT через Candy Machine
└─────────────┘
       ↓
┌─────────────┐
│ Candy       │ → Metaplex Umi SDK
│ Machine v3  │ → Создаёт NFT on-chain
└─────────────┘
       ↓
┌─────────────┐
│  Phantom    │ → NFT в кошельке
│  Wallet     │
└─────────────┘
       ↓
┌─────────────┐
│  index.html │ → Проверка владения NFT
└─────────────┘ → Загрузка игры
       ↓
┌─────────────┐
│   Supabase  │ → Сохранение прогресса
└─────────────┘ → Leaderboard
```

---

## 🔑 Ключевые файлы

### Frontend
- `mint.html` - страница минта NFT
- `index.html` - главная игра

### JavaScript Core
- `js/umi-candy-machine.js` - **НОВЫЙ!** Реальный минт через Umi
- `js/mint.js` - логика страницы минта
- `js/game.js` - игровая логика + проверка NFT
- `js/wallet.js` - Phantom интеграция
- `js/database-supabase.js` - Supabase интеграция

### Backend
- `SUPABASE_SETUP.sql` - создание таблиц
- `SUPABASE_NFT_MINTS.sql` - таблица минтов
- `database-migration-add-mint-address.sql` - **НОВЫЙ!** миграция

---

## 🚀 Технологии

- **Blockchain:** Solana (devnet/mainnet)
- **NFT Standard:** Metaplex Candy Machine v3
- **SDK:** Metaplex Umi (latest)
- **Wallet:** Phantom
- **Database:** Supabase (PostgreSQL)
- **Bot:** Python Telegram Bot
- **Frontend:** Vanilla JS (no frameworks!)

---

## 📊 Candy Machine Info

```
ID: 3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB
Collection: EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT
Network: Devnet
Items: 100 available
Price: 0.3 SOL (phase 1)
```

---

## 🌐 Live Demo

- **Сайт:** https://tr1h.github.io/solana-tamagotchi-v3
- **Database Viewer:** https://tr1h.github.io/solana-tamagotchi-v3/database-viewer.html
- **Telegram Bot:** @YourTamagotchiBot

---

## 💡 Что дальше?

### Для тестирования на devnet:
1. Следуй **QUICK_START.md**
2. Минт NFT
3. Играй!

### Для запуска на mainnet:
1. Следуй **DEPLOYMENT_CHECKLIST.md**
2. Создай реальные изображения
3. Настрой mainnet Candy Machine
4. Протестируй с малыми суммами

---

## 🆘 Помощь

### Частые проблемы
- **Umi not initialized** → Проверь что SDK загружен в HTML
- **Candy Machine not found** → Проверь ID в umi-candy-machine.js
- **NFT не появляется** → Подожди 30 сек, переключи network в Phantom
- **Database error** → Проверь миграцию выполнена

### Документация
- Все ответы в **TESTING_GUIDE.md**
- Чеклист в **DEPLOYMENT_CHECKLIST.md**

### Контакты
- Telegram: https://t.me/solana_tamagotchi
- GitHub Issues: создай issue в репо

---

## ✅ Готов к запуску!

Все задачи выполнены:
- ✅ Реальный минт NFT
- ✅ Проверка владения
- ✅ Сохранение в базу
- ✅ Полная документация

**Начни с QUICK_START.md! 🚀**

---

*Made with ❤️ on Solana blockchain*

