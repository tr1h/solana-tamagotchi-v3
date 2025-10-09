# 🍬 CANDY MACHINE READY - ФИНАЛЬНАЯ НАСТРОЙКА

---

## ✅ **У ТЕБЯ УЖЕ ЕСТЬ CANDY MACHINE!**

```
🍬 ID: 3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB
📦 Collection: EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT
👤 Authority: FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb
💰 Treasury: FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb
```

---

## 📊 **СТАТУС CANDY MACHINE:**

```
✅ Items available: 100
✅ Items minted: 1
💎 Symbol: TAMA
🎨 Name format: Tamagotchi #XX
📍 Metadata URI: https://gateway.irys.xyz/[hash]
💰 Seller fee: 5% (500 basis points)
🔧 Is mutable: true
🎲 Is sequential: false
```

---

## 🔥 **ЧТО ОБНОВЛЕНО В КОДЕ:**

### **1️⃣ metaplex-integration.js:**
```javascript
CANDY_MACHINE_ID: '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB'
COLLECTION_MINT: 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT'
CANDY_MACHINE_AUTHORITY: 'FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb'
TREASURY_WALLET: 'FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb'
```

### **2️⃣ candy-machine-mint.js:**
```javascript
CANDY_MACHINE_ID: '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB'
COLLECTION_MINT: 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT'
TREASURY_WALLET: 'FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb'
```

---

## 🚀 **КАК МИНТИТЬ ЧЕРЕЗ ТВОЮ CANDY MACHINE:**

### **Вариант A: Sugar CLI (командная строка)**

```bash
# Подключи свой кошелёк
solana config set --keypair devnet-wallet.json

# Минт 1 NFT
sugar mint --number 1

# Проверь что заминтилось
sugar show
```

### **Вариант B: Через сайт (после деплоя)**

```
1. Открой: https://tr1h.github.io/solana-tamagotchi-v3/mint.html
2. Подключи Phantom (devnet)
3. Нажми "Mint NFT"
4. Оплати 0.3 SOL
5. Получи уникальный Tamagotchi NFT!
```

---

## 📋 **ИНФОРМАЦИЯ О ТВОИХ NFT:**

### **Формат имени:**
```
Tamagotchi #01
Tamagotchi #02
...
Tamagotchi #99
```

### **Метадата:**
```json
{
  "name": "Tamagotchi #XX",
  "symbol": "TAMA",
  "description": "A cute tamagotchi pet",
  "image": "https://gateway.irys.xyz/[hash]",
  "attributes": [
    { "trait_type": "Type", "value": "Pet" }
  ]
}
```

### **Где хранятся изображения:**
```
Irys (Arweave): https://gateway.irys.xyz/[hash]
```

---

## 🔍 **ПРОВЕРКА CANDY MACHINE:**

### **Команды Sugar CLI:**

```bash
# Показать информацию о CM
sugar show

# Проверить сколько осталось
sugar show | grep "items available"

# Показать Guard настройки (цена, лимиты)
sugar guard show

# Обновить цену (если нужно)
sugar guard update
```

### **Через Solana Explorer:**

```
https://explorer.solana.com/address/3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB?cluster=devnet
```

---

## 💰 **НАСТРОЙКА ЦЕНЫ И GUARDS:**

### **Текущие guards (проверь):**

```bash
sugar guard show
```

### **Если нужно обновить цену:**

```bash
# Создай config для guard
sugar guard add

# Установи цену
# В интерактивном режиме выбери:
# - solPayment: 0.3 SOL (или другая цена)
# - startDate: сейчас или в будущем

# Примени изменения
sugar guard update
```

---

## 🎯 **INTEGRATION С САЙТОМ:**

### **Шаг 1: Убедись что код обновлен**

✅ `metaplex-integration.js` - обновлен  
✅ `candy-machine-mint.js` - обновлен  
✅ Все ID правильные  

### **Шаг 2: Деплой на GitHub Pages**

```bash
cd C:\goooog\solana-tamagotchi
git add .
git commit -m "Update Candy Machine IDs"
git push origin main
```

### **Шаг 3: Тест минта**

```
1. Открой: https://tr1h.github.io/solana-tamagotchi-v3/mint.html
2. Phantom → Switch to Devnet
3. Mint NFT
4. Проверь в консоли (F12):
   - Mint Address
   - Transaction signature
   - NFT metadata
```

---

## 📊 **КАК ПРОВЕРИТЬ ЧТО NFT ЗАМИНТИЛСЯ:**

### **1️⃣ Через Phantom:**
```
Phantom → NFTs → должен появиться Tamagotchi #XX
```

### **2️⃣ Через Solana Explorer:**
```
https://explorer.solana.com/address/[ТВОЙ_КОШЕЛЕК]?cluster=devnet
→ Tokens → NFTs
```

### **3️⃣ Через Sugar CLI:**
```bash
sugar show
# Смотри: items redeemed (должно увеличиться)
```

### **4️⃣ Через базу данных:**
```sql
SELECT wallet_address, nft_mint_address, pet_name
FROM leaderboard
WHERE nft_mint_address IS NOT NULL;
```

---

## 🔧 **TROUBLESHOOTING:**

### **Проблема 1: "Insufficient funds"**

```bash
# Получи devnet SOL
solana airdrop 2

# Или используй фaucet
https://faucet.solana.com
```

### **Проблема 2: "Candy Machine not live"**

```bash
# Проверь guard настройки
sugar guard show

# Обнови startDate если нужно
sugar guard update
```

### **Проблема 3: "All items minted"**

```bash
# Проверь количество
sugar show | grep "items available"

# Если 0 - загрузи больше NFT
sugar upload
```

---

## 📝 **КОМАНДЫ ДЛЯ УПРАВЛЕНИЯ:**

### **Посмотреть информацию:**
```bash
sugar show                    # Вся информация
sugar show --candy-machine    # Только CM
sugar guard show              # Guard настройки
```

### **Минт:**
```bash
sugar mint                    # Минт 1 NFT
sugar mint --number 5         # Минт 5 NFT
```

### **Обновить:**
```bash
sugar update                  # Обновить CM
sugar guard update            # Обновить guards
sugar upload                  # Загрузить новые NFT
```

### **Withdraw:**
```bash
sugar withdraw                # Забрать средства из CM
```

---

## 🎉 **ИТОГО:**

### **У тебя есть:**
✅ Candy Machine на devnet  
✅ 100 NFT готовы к минту  
✅ 1 NFT уже заминчен (тест)  
✅ Код обновлен с правильными ID  
✅ Metaplex integration готов  

### **Что делать дальше:**
1. ✅ Деплой обновленный код на GitHub Pages
2. ✅ Тест минта через сайт
3. ✅ Проверь NFT в Phantom
4. ✅ Обнови базу данных (добавь `nft_mint_address`)
5. ✅ Тест игры с реальным NFT

---

## 🚀 **СЛЕДУЮЩИЙ ШАГ:**

**Деплой и тест!**

```bash
cd C:\goooog\solana-tamagotchi
git add .
git commit -m "Final Candy Machine integration"
git push origin main
```

**Затем:**
1. Открой https://tr1h.github.io/solana-tamagotchi-v3/mint.html
2. Минт NFT
3. Проверь что всё работает!

**Твоя Candy Machine готова! 🎉**


