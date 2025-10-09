# ⚡ Quick Start - Solana Tamagotchi

## 🎯 Минимальные шаги для запуска

### 1️⃣ Миграция базы данных (2 мин)

Открой **Supabase SQL Editor** и выполни:

```sql
-- Добавить nft_mint_address колонку
ALTER TABLE public.leaderboard 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT;

ALTER TABLE public.nft_mints 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT UNIQUE;

-- Готово!
```

### 2️⃣ Проверка Candy Machine (30 сек)

```bash
sugar show --url devnet
```

Должно показать:
- ✅ ID: 3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB
- ✅ Items available: 100
- ✅ Price: 0.3 SOL

### 3️⃣ Запуск локального сервера (10 сек)

```bash
cd solana-tamagotchi
python -m http.server 8000
```

### 4️⃣ Тестирование (3 мин)

1. **Получи devnet SOL**
   - https://faucet.solana.com
   - ИЛИ кнопка "Get 1 SOL" на mint.html

2. **Минт NFT**
   - Открой: http://localhost:8000/mint.html
   - Connect Wallet
   - Mint Now
   - ✅ NFT появится в Phantom

3. **Играй**
   - Открой: http://localhost:8000/index.html
   - Connect Wallet
   - ✅ Pet загружен из NFT

---

## ✅ Всё работает?

**ДА** → Пуш в GitHub:
```bash
git add .
git commit -m "✨ Real NFT minting integrated"
git push origin main
```

**НЕТ** → Смотри [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 🚀 Deploy на GitHub Pages

После push автоматически обновится:
```
https://tr1h.github.io/solana-tamagotchi-v3
```

Проверь через 2-3 минуты!

---

## 📞 Помощь

- 📖 Детали: [LATEST_UPDATES.md](./LATEST_UPDATES.md)
- 🧪 Тесты: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- 📋 Чеклист: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**Готов к запуску!** 🎉

