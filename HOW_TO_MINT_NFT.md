# 🎨 КАК ЗАМИНТИТЬ NFT - ПОДРОБНАЯ ИНСТРУКЦИЯ

---

## 🎯 **ДВА СПОСОБА МИНТА:**

### **СПОСОБ 1: Sugar CLI (РАБОТАЕТ 100%)** ⭐ Рекомендуем
### **СПОСОБ 2: Через сайт (В разработке)**

---

## 🍬 **СПОСОБ 1: SUGAR CLI (РЕАЛЬНЫЙ МИНТ)**

### **Подготовка:**

1. **Открой WSL / Git Bash**
2. **Перейди в папку:**
   ```bash
   cd /mnt/c/goooog/solana-tamagotchi
   ```

3. **Проверь что у тебя есть SOL:**
   ```bash
   solana balance
   ```
   
   Если нет - получи devnet SOL:
   ```bash
   solana airdrop 2
   ```
   
   Или используй фaucet: https://faucet.solana.com

---

### **Минт NFT:**

```bash
# Минт 1 NFT
sugar mint --number 1

# Минт 5 NFT
sugar mint --number 5

# Минт без подтверждения
sugar mint --number 1 --no-confirm
```

---

### **После минта:**

```bash
# Проверь статус Candy Machine
sugar show

# Должно увеличиться:
# items redeemed: 14 (было 13)
```

---

### **Проверь NFT в кошельке:**

#### **Вариант A: Phantom**
```
1. Открой Phantom
2. Settings → Developer Settings
3. ✅ Enable Testnet Mode
4. Switch to Devnet
5. NFTs tab → Должен появиться Tamagotchi!
```

#### **Вариант B: Solana Explorer**
```
https://explorer.solana.com/?cluster=devnet
→ Вставь свой кошелёк
→ Tokens tab
→ Найди NFT (balance = 1)
```

#### **Вариант C: Через скрипт**
```bash
node check-nfts.js
```

---

## 🌐 **СПОСОБ 2: ЧЕРЕЗ САЙТ (В РАЗРАБОТКЕ)**

### **Текущий статус:**

```
✅ UI готов
✅ Wallet подключается
✅ Транзакции отправляются
❌ Реальный минт через Candy Machine - в процессе
```

### **Что работает:**

- Подключение Phantom
- Проверка баланса
- Demo минт (для тестирования UI)
- Сохранение в базу данных

### **Что НЕ работает:**

- Реальное создание NFT через Candy Machine v3
- Загрузка метадаты на Arweave/IPFS
- Проверка владения NFT

---

### **Почему так сложно?**

Candy Machine v3 требует:
1. Правильную десериализацию account data
2. Вычисление всех PDA (Program Derived Addresses)
3. Создание сложной транзакции с множеством инструкций
4. Интеграцию с Metaplex Token Metadata program
5. Правильную обработку Guards (ограничений минта)

**Короче:** Нужна полная интеграция Metaplex JS SDK или использование Sugar CLI.

---

## 🛠️ **ПЛАН РАЗРАБОТКИ "МИНТ С САЙТА":**

### **Фаза 1: Подготовка (✅ Готово)**
- [x] Создать UI
- [x] Подключить Phantom
- [x] Настроить Candy Machine
- [x] Загрузить NFT assets

### **Фаза 2: Backend (⏳ В процессе)**
- [ ] Установить Metaplex JS SDK
- [ ] Создать mint endpoint
- [ ] Интегрировать с Candy Machine
- [ ] Тестирование на devnet

### **Фаза 3: Frontend (⏳ Следующая)**
- [ ] Подключить к backend
- [ ] Обработка ошибок
- [ ] Loading states
- [ ] Success animations

### **Фаза 4: Testing (⏳ Следующая)**
- [ ] Тесты на devnet
- [ ] Проверка всех edge cases
- [ ] Оптимизация UX

### **Фаза 5: Production (⏳ Финал)**
- [ ] Деплой на mainnet
- [ ] Мониторинг
- [ ] Support

---

## 💡 **ВРЕМЕННОЕ РЕШЕНИЕ:**

### **Для тестирования СЕЙЧАС:**

1. **Используй Sugar CLI** для реального минта
2. **Используй сайт** для тестирования UI и игровой логики
3. **После минта через Sugar** → играй в игру на сайте!

---

## 🎯 **ПРИМЕР: ПОЛНЫЙ ПРОЦЕСС МИНТА**

### **Шаг 1: Открой терминал**
```bash
cd /mnt/c/goooog/solana-tamagotchi
```

### **Шаг 2: Проверь баланс**
```bash
solana balance
# Если < 1 SOL:
solana airdrop 2
```

### **Шаг 3: Минт NFT**
```bash
sugar mint --number 1
```

**Вывод:**
```
[1/1] 🍬 Minting from candy machine

✅ Minted! 1 NFT(s)
Mint: ABC123def456ghi789...
Transaction: https://explorer.solana.com/tx/...
```

### **Шаг 4: Проверь Phantom**
```
Phantom → Devnet → NFTs
→ Должен быть Tamagotchi #XX!
```

### **Шаг 5: Играй!**
```
https://tr1h.github.io/solana-tamagotchi-v3
→ Connect Wallet
→ Должен загрузить твоего питомца!
```

---

## 🆘 **TROUBLESHOOTING:**

### **Проблема: "Insufficient funds"**
```bash
solana balance
solana airdrop 2
# Или используй: https://faucet.solana.com
```

### **Проблема: "Candy Machine not live"**
```bash
sugar guard show
# Проверь startDate
```

### **Проблема: "All items minted"**
```bash
sugar show | grep "items available"
# Если 0 - загрузи больше NFT
```

### **Проблема: NFT не появляется в Phantom**
```
1. Подожди 1-2 минуты
2. Перезапусти Phantom
3. Проверь что ты на Devnet
4. Проверь Explorer
```

---

## 📚 **ПОЛЕЗНЫЕ КОМАНДЫ:**

```bash
# Информация о Candy Machine
sugar show

# Статус Guards
sugar guard show

# Твой кошелёк
solana address

# Баланс
solana balance

# История транзакций
solana transaction-history

# Проверка NFT
node check-nfts.js
```

---

## 🎉 **ГОТОВО!**

Теперь ты знаешь как минтить NFT через Sugar CLI!

**Для автоматического минта с сайта - жди обновления!** 🚀

**Или помоги с разработкой - open source!** 💪



