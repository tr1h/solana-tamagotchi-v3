# 🧪 TESTING CHECKLIST - ПРОВЕРКА СИСТЕМЫ ПИТОМЦЕВ

## 📋 **ЧЕКЛИСТ ДЛЯ ПРОВЕРКИ:**

### **1. ✅ ПОДГОТОВКА**
- [ ] Открыть сайт: `https://tr1h.github.io/solana-tamagotchi-v3/`
- [ ] Открыть DevTools (F12)
- [ ] Перейти в Console для логов
- [ ] Подготовить Phantom кошелек (Devnet)

---

### **2. 🔌 ПОДКЛЮЧЕНИЕ КОШЕЛЬКА**
- [ ] Нажать "CONNECT WALLET"
- [ ] Выбрать Phantom
- [ ] Подтвердить подключение
- [ ] **Проверить:** Адрес кошелька отображается

**Ожидаемые логи:**
```
✅ Wallet connected: [твой адрес]
```

---

### **3. 🎨 МИНТИНГ NFT**

#### **3.1 Перейти на страницу минтинга:**
- [ ] Открыть: `https://tr1h.github.io/solana-tamagotchi-v3/mint.html`
- [ ] Подключить кошелек
- [ ] Получить SOL (кнопка "💰 Get Free SOL")

#### **3.2 Ввести имя питомца:**
- [ ] Ввести имя в поле "Give your pet a name"
- [ ] Например: "Test Dragon"

#### **3.3 Заминтить:**
- [ ] Нажать "MINT NOW"
- [ ] Подтвердить транзакцию в Phantom
- [ ] Дождаться подтверждения

**Ожидаемые логи:**
```
🔄 Processing mint result...
💾 NFT object created: {type: "dragon", rarity: "epic", ...}
💾 Recording NFT mint to database...
🐾 Created 💜 Epic Dragon!
✅ NFT mint recorded successfully!
```

#### **3.4 Проверить переход:**
- [ ] Страница автоматически перенаправляет в игру
- [ ] Питомец отображается на главной странице

---

### **4. 🗄️ ПРОВЕРКА БАЗЫ ДАННЫХ**

#### **4.1 Открыть Supabase:**
- [ ] Зайти в Supabase SQL Editor
- [ ] Запустить проверку:

```sql
-- Проверка последнего заминченного NFT
SELECT 
    id,
    pet_name,
    pet_type,
    evolution,
    level,
    xp,
    abilities,
    attributes,
    stats,
    tama_multiplier,
    category,
    created_at
FROM nft_mints
ORDER BY id DESC
LIMIT 1;
```

**Ожидаемый результат:**
```json
{
  "pet_name": "Test Dragon",
  "pet_type": "dragon",
  "evolution": 0,
  "level": 1,
  "xp": 0,
  "abilities": ["fire_breath", "flight", "intimidate"],
  "attributes": {
    "intelligence": 85,
    "strength": 95,
    "speed": 75,
    "magic": 100
  },
  "stats": {
    "hunger": 100,
    "energy": 100,
    "happy": 100,
    "health": 100
  },
  "tama_multiplier": 1.5,
  "category": "mythical"
}
```

#### **4.2 Проверить все поля:**
- [ ] `pet_name` = твое имя
- [ ] `pet_type` = тип питомца
- [ ] `evolution` = 0 (Baby форма)
- [ ] `level` = 1
- [ ] `abilities` = массив из 3 способностей
- [ ] `attributes` = 4 атрибута (intelligence, strength, speed, magic)
- [ ] `stats` = 4 стата (hunger, energy, happy, health)
- [ ] `tama_multiplier` = правильный множитель
- [ ] `category` = правильная категория

---

### **5. 🐾 ПРОВЕРКА PET INFO UI**

#### **5.1 Открыть Pet Info:**
- [ ] На главной странице игры
- [ ] Нажать кнопку "🐾 PET INFO"
- [ ] Модальное окно открывается

#### **5.2 Проверить вкладку "📊 Stats":**
- [ ] Отображается имя питомца
- [ ] Отображается эмодзи питомца
- [ ] Отображается редкость с цветом
- [ ] Отображается эволюция (Baby, Young, etc.)
- [ ] Отображаются 4 прогресс-бара (Hunger, Energy, Happy, Health)
- [ ] Отображаются 4 атрибута (Intelligence, Strength, Speed, Magic)
- [ ] Отображается TAMA множитель
- [ ] Отображается Level и XP

**Ожидаемый вид:**
```
🐉
Test Dragon
💜 Epic

🥚 Baby Form
Только родился

🍖 Hunger: ████████████████████ 100%
⚡ Energy: ████████████████████ 100%
😊 Happy:  ████████████████████ 100%
❤️ Health: ████████████████████ 100%

🎯 Attributes
🧠 Intelligence: 85
💪 Strength: 95
⚡ Speed: 75
✨ Magic: 100

💰 TAMA Multiplier: ×1.50
📊 Level: 1
⭐ Total XP: 0
```

#### **5.3 Проверить вкладку "⚡ Abilities":**
- [ ] Переключить на вкладку "Abilities"
- [ ] Отображаются 3 способности
- [ ] Каждая способность показывает:
  - Название
  - Эмодзи
  - Описание
  - Статус (✅ Ready или ⏳ On Cooldown)
  - Кнопка "Use Ability"

**Для Dragon:**
```
🔥 Fire Breath
✅ Ready
Мощная атака, которая дает +50 TAMA
💰 +0% TAMA
[🚀 Use Ability]

✈️ Flight
✅ Ready
Пассивный бонус +20% к энергии

😈 Intimidate
✅ Ready
Увеличивает награды за рефералов на 25%
```

#### **5.4 Проверить вкладку "🔄 Evolution":**
- [ ] Переключить на вкладку "Evolution"
- [ ] Отображается текущая форма (Baby)
- [ ] Отображаются требования для следующей эволюции:
  - Level: 1 / 5
  - XP: 0 / 500
  - TAMA: 100 required
- [ ] Кнопка "🔒 Requirements not met" (disabled)

**Ожидаемый вид:**
```
🐾 Current Form
🥚 Baby
Только родился
Stats: ×0.8

⬇️

🌟 Next Evolution

📊 Level: 1 / 5
⭐ XP: 0 / 500
💰 TAMA: 100 required

[🔒 Requirements not met]
```

---

### **6. ⚡ ПРОВЕРКА СПОСОБНОСТЕЙ**

#### **6.1 Использовать способность:**
- [ ] Открыть Pet Info
- [ ] Перейти в "Abilities"
- [ ] Нажать "🚀 Use Ability" на Fire Breath
- [ ] **Проверить:** Появляется уведомление "+50 TAMA!"
- [ ] **Проверить:** Способность переходит в кулдаун

**Ожидаемые логи:**
```
⚡ Ability used: fire_breath
💰 Earned 50 TAMA
✅ Pet data saved
```

#### **6.2 Проверить кулдаун:**
- [ ] Закрыть и открыть Pet Info снова
- [ ] Fire Breath показывает "⏳ 60m" (кулдаун)
- [ ] Кнопка "⏳ On Cooldown" (disabled)

#### **6.3 Проверить в БД:**
```sql
-- Проверка использования способности
SELECT * FROM pet_ability_usage
WHERE wallet_address = 'твой_адрес'
ORDER BY usage_timestamp DESC
LIMIT 1;
```

**Ожидаемый результат:**
```json
{
  "ability_name": "fire_breath",
  "tama_earned": 50,
  "usage_timestamp": "2024-10-12T10:30:00Z"
}
```

---

### **7. 🔄 ПРОВЕРКА ЭВОЛЮЦИИ (ОПЦИОНАЛЬНО)**

Если хочешь проверить эволюцию, можно искусственно добавить XP:

```sql
-- Добавить XP для тестирования эволюции
UPDATE nft_mints 
SET 
    level = 5,
    xp = 500,
    total_xp = 500
WHERE pet_name = 'Test Dragon';
```

Затем:
- [ ] Обнови страницу
- [ ] Открой Pet Info → Evolution
- [ ] **Проверить:** Кнопка "🚀 EVOLVE NOW!" активна
- [ ] Нажми "EVOLVE NOW!"
- [ ] Подтверди (нужно 100 TAMA)
- [ ] **Проверить:** Питомец эволюционировал

**Ожидаемые логи:**
```
🎉 Pet evolved to Young!
Stats multiplier: ×1.0 → ×1.0
TAMA multiplier increased!
```

---

### **8. 📊 ФИНАЛЬНАЯ ПРОВЕРКА БД**

```sql
-- Полная проверка всех данных
SELECT 
    pet_name,
    pet_type,
    evolution,
    level,
    xp,
    total_xp,
    abilities,
    attributes,
    stats,
    tama_multiplier,
    category,
    ability_cooldowns,
    last_fed,
    last_played,
    is_dead,
    is_critical
FROM nft_mints
WHERE wallet_address = 'твой_адрес'
ORDER BY created_at DESC;
```

**Проверить:**
- [ ] Все поля заполнены
- [ ] `abilities` - массив из 3 элементов
- [ ] `attributes` - объект с 4 ключами
- [ ] `stats` - объект с 4 ключами
- [ ] `ability_cooldowns` - объект (пустой или с кулдаунами)
- [ ] `tama_multiplier` - правильное значение
- [ ] `category` - правильная категория

---

## ✅ **РЕЗУЛЬТАТ ПРОВЕРКИ:**

### **ВСЕ РАБОТАЕТ ЕСЛИ:**
- [x] NFT минтится без ошибок
- [x] Данные сохраняются в БД со всеми полями
- [x] Pet Info открывается и показывает все данные
- [x] Способности работают и уходят в кулдаун
- [x] Эволюция доступна при выполнении требований
- [x] В консоли нет ошибок

### **ПРОБЛЕМЫ:**
Если что-то не работает - запиши:
1. Какой шаг не прошел
2. Какие ошибки в консоли
3. Скриншот проблемы

---

## 🎯 **БЫСТРАЯ ПРОВЕРКА (5 МИНУТ):**

Если нет времени на полную проверку:

1. ✅ Заминти NFT
2. ✅ Открой Pet Info
3. ✅ Проверь что все 3 вкладки открываются
4. ✅ Проверь в БД что все поля заполнены

```sql
SELECT 
    pet_name, 
    abilities, 
    attributes, 
    tama_multiplier 
FROM nft_mints 
ORDER BY id DESC 
LIMIT 1;
```

Если эти 4 пункта работают - **система готова к использованию!** 🚀

---

**📝 ЗАПОЛНИ ЧЕКЛИСТ И НАПИШИ РЕЗУЛЬТАТ!**

