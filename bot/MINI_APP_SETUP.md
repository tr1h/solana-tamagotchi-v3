# 🎮 TELEGRAM MINI APP SETUP GUIDE

## ✅ Что сделано:

### 1. **Создана Mini App игра** (`telegram-game.html`):
- 🐾 Полноценная Tamagotchi игра
- 📱 Адаптирована для Telegram
- 💰 Система заработка TAMA
- 🏆 Достижения и уровни
- 💾 Сохранение прогресса

### 2. **Интегрирована в бота**:
- ✅ Кнопка "🎮 Play Game" в главном меню
- ✅ Обработка данных из игры
- ✅ Автоматическое начисление TAMA
- ✅ Бонусы за повышение уровня

---

## 🚀 Как развернуть:

### 1. **Загрузить игру на хостинг:**
```bash
# Скопировать telegram-game.html на ваш хостинг
# Например, в папку solana-tamagotchi-public/
```

### 2. **Обновить URL в боте:**
```python
# В bot.py найти строку:
types.InlineKeyboardButton("🎮 Play Game", web_app=types.WebAppInfo(url="https://tr1h.github.io/solana-tamagotchi/telegram-game.html"))

# Заменить на ваш URL:
types.InlineKeyboardButton("🎮 Play Game", web_app=types.WebAppInfo(url="https://YOUR-DOMAIN.com/telegram-game.html"))
```

### 3. **Перезапустить бота:**
```bash
cd C:\goooog\solana-tamagotchi\bot
python bot.py
```

---

## 🎮 Как работает:

### **Для пользователей:**
1. Нажимают "🎮 Play Game" в боте
2. Открывается игра в Telegram
3. Ухаживают за питомцем, зарабатывают TAMA
4. Нажимают "Save Progress"
5. TAMA автоматически начисляется в боте

### **Функции игры:**
- 🐾 **Клик по питомцу** - +1 TAMA
- 🍎 **Кормление** - +2 TAMA
- 🎾 **Игра** - +3 TAMA  
- 💊 **Лечение** - +5 TAMA
- 🎉 **Повышение уровня** - бонус TAMA

---

## 🔧 Настройка Supabase (опционально):

### 1. **Добавить ключи в игру:**
```javascript
// В telegram-game.html найти:
// supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

// Заменить на реальные ключи:
supabase = createClient('https://your-project.supabase.co', 'your-anon-key');
```

### 2. **Синхронизация данных:**
- Прогресс сохраняется в localStorage
- Данные отправляются в бот при сохранении
- Бот обновляет базу данных

---

## 🎯 Следующие шаги:

### 1. **Загрузить игру:**
- Скопировать `telegram-game.html` на хостинг
- Убедиться, что файл доступен по HTTPS

### 2. **Обновить бота:**
- Заменить URL в коде бота
- Перезапустить бота

### 3. **Протестировать:**
- Открыть бота
- Нажать "🎮 Play Game"
- Поиграть и сохранить прогресс
- Проверить начисление TAMA

---

## 🚀 Готово к запуску!

**Mini App полностью интегрирована с ботом!** 

Пользователи теперь могут:
- ✅ Играть прямо в Telegram
- ✅ Зарабатывать TAMA
- ✅ Сохранять прогресс
- ✅ Получать бонусы за достижения

**Это серьезное конкурентное преимущество!** 🎮💪
