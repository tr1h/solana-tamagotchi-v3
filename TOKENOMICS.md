# 💰 SOLANA TAMAGOTCHI - ТОКЕНОМИКА

## 🎯 КОНЦЕПЦИЯ:

**NFT = Ключ к игре**
- NFT дает доступ к игре
- Без NFT → только mint page
- NFT = пожизненный доступ

**TAMA = Внутриигровая валюта**
- Заработок через игру
- Оплата за улучшения
- Вывод в SOL (опционально)

---

## 📊 NFT MINT DISTRIBUTION:

### Цена минтинга:
```
Phase 1: 0.3 SOL (0-100 NFTs)
Phase 2: 0.5 SOL (101-500 NFTs)
Phase 3: 0.8 SOL (501-1000 NFTs)
Phase 4: 1.0 SOL (1001+ NFTs)
```

### Распределение средств от минта:
```
100% от mint price
├─ 60% - Команда/Разработка
│   └─ Оплата разработчиков, серверов, поддержки
├─ 20% - Маркетинг & Airdrop Fund
│   └─ Продвижение, конкурсы, награды
├─ 15% - Liquidity Pool (TAMA/SOL)
│   └─ Для торговли TAMA токеном
└─ 5% - Резервный фонд
    └─ Непредвиденные расходы
```

### Treasury Wallet (сейчас):
```
GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump
```

**TODO для mainnet:**
- Создать новый treasury wallet
- Настроить мультисиг для безопасности
- Автоматическое распределение через программу

---

## 💎 TAMA TOKEN:

### Вариант 1: Виртуальный (для старта) ✅ СЕЙЧАС
```
Хранение: Supabase database
Преимущества:
  ✅ Бесплатно
  ✅ Быстрые транзакции
  ✅ Нет комиссий
  ✅ Легко балансировать
Недостатки:
  ❌ Не торгуется
  ❌ Только внутри игры
```

### Вариант 2: SPL Token (реальный) 🔮 БУДУЩЕЕ
```
Хранение: Solana blockchain
Преимущества:
  ✅ Настоящий токен
  ✅ Торговля на DEX (Jupiter, Raydium)
  ✅ Стейкинг
  ✅ Вывод в SOL
Недостатки:
  ❌ Стоит ~0.1 SOL создать
  ❌ Комиссии за транзакции
  ❌ Сложнее балансировать
```

### Параметры SPL Token (когда будем делать):
```
Name: Tamagotchi Token
Symbol: TAMA
Decimals: 9
Total Supply: 1,000,000,000 TAMA
Mintable: No (фиксированный supply)
```

---

## 💰 КАК ЗАРАБАТЫВАТЬ TAMA:

### 1. NFT Mint (одноразово):
```
Phase 1: +500 TAMA
Phase 2: +500 TAMA
Phase 3: +500 TAMA
Phase 4: +500 TAMA
```

### 2. Игровая активность (ежедневно):
```
Кормление питомца: +5 TAMA
Игра с питомцем: +10 TAMA
Тренировка: +15 TAMA
Достижение уровня: +50 TAMA
Ежедневный логин: +25 TAMA

Максимум в день: ~100-150 TAMA
```

### 3. Реферальная программа:
```
Level 1 (прямой реферал):
  - +25 TAMA при регистрации
  - +10% от его заработка

Level 2 (реферал реферала):
  - +12 TAMA при регистрации
  - +5% от его заработка
```

### 4. Достижения:
```
Первый минт: +100 TAMA
10 дней подряд: +200 TAMA
Уровень 10: +500 TAMA
Эволюция 5: +1000 TAMA
```

### 5. События/Конкурсы:
```
Еженедельные турниры: 500-5000 TAMA
Seasonal события: 1000-10000 TAMA
Community challenges: 100-1000 TAMA
```

---

## 🛍️ ЧТО ПОКУПАТЬ ЗА TAMA:

### 1. Эволюция питомца:
```
Level 1 → 2: 500 TAMA
Level 2 → 3: 1000 TAMA
Level 3 → 4: 2000 TAMA
Level 4 → 5: 5000 TAMA
```

### 2. Косметика (Skins):
```
Обычные скины: 500 TAMA
Редкие скины: 1500 TAMA
Эпические скины: 5000 TAMA
Legendary скины: 10000 TAMA
```

### 3. Бустеры:
```
2x XP (1 час): 100 TAMA
2x Earnings (1 час): 200 TAMA
Auto-feed (24 часа): 500 TAMA
```

### 4. Специальные предметы:
```
Новый питомец слот: 10000 TAMA
Rename питомца: 1000 TAMA
Custom badge: 5000 TAMA
```

---

## 🔄 ВЫВОД TAMA В SOL (если SPL Token):

### Liquidity Pool:
```
TAMA/SOL пул на Raydium
Начальная ликвидность: 15% от mint proceeds

Пример курса:
1 SOL = 10,000 TAMA
0.1 SOL = 1,000 TAMA
0.01 SOL = 100 TAMA
```

### Вывод:
```
Минимум: 1000 TAMA
Комиссия: 5% (сжигается)
Через: Jupiter/Raydium DEX
```

---

## 📈 ROADMAP ТОКЕНОМИКИ:

### Phase 1: CURRENT (Devnet) ✅
- ✅ NFT mint working
- ✅ Виртуальные TAMA токены
- ✅ База данных Supabase
- ✅ Реферальная система

### Phase 2: Mainnet Launch 🚀
- Create real treasury wallet
- Setup multisig
- Launch NFT collection (500-1000 NFTs)
- Virtual TAMA continues

### Phase 3: SPL Token Launch 💎
- Create TAMA SPL token
- Create liquidity pool
- Enable withdrawals
- Staking program

### Phase 4: DeFi Integration 🏦
- Yield farming
- LP rewards
- Governance (DAO)
- Cross-chain bridge

---

## 🔐 РАСПРЕДЕЛЕНИЕ TREASURY:

### Автоматическое распределение (через Solana program):

```javascript
// Псевдокод
const TREASURY_DISTRIBUTION = {
    team: 0.60,        // 60% команде
    marketing: 0.20,   // 20% маркетинг
    liquidity: 0.15,   // 15% LP
    reserve: 0.05      // 5% резерв
};

// Кошельки
const WALLETS = {
    team: "TEAM_WALLET_ADDRESS",
    marketing: "MARKETING_WALLET_ADDRESS",
    liquidity: "LP_WALLET_ADDRESS",
    reserve: "RESERVE_WALLET_ADDRESS"
};

// При минте NFT:
onMint(price) {
    for (const [key, percentage] of Object.entries(TREASURY_DISTRIBUTION)) {
        transfer(WALLETS[key], price * percentage);
    }
}
```

### TODO для mainnet:
1. Создать отдельные кошельки для каждой категории
2. Написать Solana программу для автораспределения
3. Настроить мультисиг на team wallet (2/3 подписи)
4. Публичная отчетность раз в месяц

---

## 💡 РЕКОМЕНДАЦИИ:

### Для devnet (сейчас):
✅ Используй виртуальные TAMA
✅ Тестируй баланс и экономику
✅ Собирай фидбек

### Для mainnet:
1. **Сначала:** Запусти только с NFT + виртуальные TAMA
2. **Через 1-2 месяца:** Создай SPL token когда база пользователей есть
3. **Через 3-6 месяцев:** DeFi интеграция

### Почему постепенно:
- Меньше рисков
- Время настроить экономику
- Собрать сообщество
- Избежать "pump and dump"

---

## 📊 ПРИМЕРНАЯ ЭКОНОМИКА:

### Если 1000 NFT минтов по 0.5 SOL средней:
```
Total: 500 SOL (~$75,000 at $150/SOL)

Распределение:
├─ 300 SOL ($45,000) - Команда
├─ 100 SOL ($15,000) - Маркетинг
├─ 75 SOL ($11,250) - Liquidity Pool
└─ 25 SOL ($3,750) - Резерв
```

### TAMA в обороте (через 1 месяц):
```
1000 пользователей × 500 (mint bonus) = 500,000 TAMA
+ 1000 × 30 дней × 100 (daily) = 3,000,000 TAMA
+ Рефералы/Достижения = ~500,000 TAMA

Total: ~4,000,000 TAMA в обороте

Liquidity Pool: 75 SOL = 750,000 TAMA
Market Cap: $11,250 / 750,000 = $0.015 за TAMA
```

---

## 🎯 ИТОГОВАЯ СТРАТЕГИЯ:

### Короткосрочно (1-3 месяца):
1. ✅ NFT-gated доступ
2. ✅ Виртуальные TAMA токены
3. ✅ Реферальная система
4. ⏳ Больше игровых механик

### Среднесрочно (3-6 месяцев):
1. 🔮 SPL Token запуск
2. 🔮 Liquidity Pool
3. 🔮 DEX листинг
4. 🔮 Вывод TAMA → SOL

### Долгосрочно (6-12 месяцев):
1. 🚀 Стейкинг программа
2. 🚀 DAO управление
3. 🚀 P2E турниры с призами
4. 🚀 Мерч за TAMA

---

## 🔥 КЛЮЧЕВЫЕ ПРИНЦИПЫ:

1. **NFT = Долгосрочная ценность**
   - Доступ к игре навсегда
   - Редкость (ограниченный supply)
   - Растущая ценность

2. **TAMA = Игровая экономика**
   - Легко заработать играя
   - Много способов потратить
   - Баланс инфляции/дефляции

3. **Sustainable Growth**
   - Не rush с токеном
   - Сначала сообщество
   - Потом монетизация

**ВСЕ ГОТОВО ДЛЯ СТАРТА! 🚀**




