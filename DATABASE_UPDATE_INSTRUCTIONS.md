# 🗄️ ИНСТРУКЦИЯ ПО ОБНОВЛЕНИЮ БАЗЫ ДАННЫХ

## ✅ ЧТО НУЖНО СДЕЛАТЬ:

### **1. ОТКРОЙ SUPABASE:**
```
1. Зайди на https://supabase.com
2. Открой свой проект
3. Перейди в SQL Editor (слева в меню)
```

### **2. ЗАПУСТИ SQL СКРИПТ:**
```
1. Открой файл: solana-tamagotchi/UPDATE_PET_DATABASE.sql
2. Скопируй весь код
3. Вставь в SQL Editor в Supabase
4. Нажми "RUN" (или Ctrl+Enter)
```

### **3. ПРОВЕРЬ РЕЗУЛЬТАТ:**
```sql
-- Запусти эту проверку после выполнения скрипта:
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'nft_mints' 
ORDER BY ordinal_position;
```

**Ты должен увидеть новые колонки:**
- ✅ `evolution` (integer)
- ✅ `level` (integer)
- ✅ `xp` (integer)
- ✅ `total_xp` (integer)
- ✅ `abilities` (jsonb)
- ✅ `ability_cooldowns` (jsonb)
- ✅ `attributes` (jsonb)
- ✅ `stats` (jsonb)
- ✅ `tama_multiplier` (numeric)
- ✅ `category` (text)
- ✅ `last_fed` (timestamptz)
- ✅ `last_played` (timestamptz)
- ✅ `last_slept` (timestamptz)
- ✅ `is_dead` (boolean)
- ✅ `is_critical` (boolean)
- ✅ `is_hibernating` (boolean)
- ✅ `is_stealthed` (boolean)

---

## 📋 **ЧТО ДЕЛАЕТ СКРИПТ:**

### **1. Добавляет новые колонки:**
- Эволюция питомца (0-4)
- Уровень и опыт
- Способности (массив)
- Атрибуты (Intelligence, Strength, Speed, Magic)
- Статы (Hunger, Energy, Happy, Health)
- Множитель TAMA
- Временные метки действий
- Состояния (dead, critical, hibernating, stealthed)

### **2. Обновляет существующие данные:**
- Присваивает способности на основе типа питомца
- Устанавливает категории (smart, strong, cute, mythical)
- Рассчитывает атрибуты для каждого типа
- Вычисляет множитель TAMA на основе типа и редкости

### **3. Создает новые таблицы:**
- **`pet_evolution_history`** - история эволюций
- **`pet_ability_usage`** - история использования способностей

### **4. Добавляет индексы:**
- Для быстрого поиска по эволюции, уровню, категории
- GIN индексы для JSONB полей (abilities, attributes, stats)

### **5. Создает триггер:**
- Автоматическое обновление `last_update` при изменении записи

---

## 🔍 **ПРОВЕРКА РАБОТОСПОСОБНОСТИ:**

### **1. Проверка структуры:**
```sql
-- Показать все колонки таблицы nft_mints
SELECT * FROM information_schema.columns 
WHERE table_name = 'nft_mints';
```

### **2. Проверка данных:**
```sql
-- Показать всех питомцев с новыми полями
SELECT 
    id,
    pet_name,
    pet_type,
    evolution,
    level,
    abilities,
    attributes,
    tama_multiplier
FROM nft_mints
LIMIT 10;
```

### **3. Проверка способностей:**
```sql
-- Показать питомцев и их способности
SELECT 
    pet_name,
    pet_type,
    abilities,
    category
FROM nft_mints
WHERE abilities IS NOT NULL;
```

### **4. Проверка множителя TAMA:**
```sql
-- Показать питомцев с самым высоким множителем
SELECT 
    pet_name,
    pet_type,
    pet_traits->>'rarity' as rarity,
    tama_multiplier
FROM nft_mints
ORDER BY tama_multiplier DESC
LIMIT 10;
```

---

## 🚨 **ЕСЛИ ЧТО-ТО ПОШЛО НЕ ТАК:**

### **Ошибка: "column already exists"**
```
✅ ЭТО НОРМАЛЬНО! Значит колонка уже была добавлена.
Скрипт использует IF NOT EXISTS, поэтому безопасен для повторного запуска.
```

### **Ошибка: "permission denied"**
```
❌ Убедись что у тебя есть права администратора проекта в Supabase.
```

### **Ошибка: "syntax error"**
```
❌ Убедись что скопировал весь скрипт целиком.
Попробуй скопировать заново из файла UPDATE_PET_DATABASE.sql
```

### **Ошибка: "relation does not exist"**
```
❌ Сначала нужно создать таблицу nft_mints.
Запусти файл SUPABASE_NFT_MINTS_TABLE.sql перед обновлением.
```

---

## 📊 **СТАТИСТИКА ПОСЛЕ ОБНОВЛЕНИЯ:**

### **Количество новых колонок:** 17
### **Новые таблицы:** 2
### **Новые индексы:** 8
### **Новые триггеры:** 1

---

## ✅ **ПОСЛЕ ОБНОВЛЕНИЯ:**

1. **Проверь работу Pet Info:**
   - Открой игру
   - Нажми "🐾 PET INFO"
   - Проверь что все 3 вкладки работают

2. **Протестируй способности:**
   - Попробуй использовать способность
   - Проверь что кулдаун работает

3. **Попробуй эволюцию:**
   - Если у питомца достаточно XP и TAMA
   - Попробуй эволюционировать
   - Проверь что характеристики обновились

---

## 🎯 **ГОТОВО!**

После выполнения всех шагов база данных полностью готова для новой системы питомцев!

**Если возникли проблемы - напиши мне!** 🚀

