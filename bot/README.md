# 🤖 Solana Tamagotchi Telegram Bot

Полнофункциональный бот для Solana Tamagotchi с реферальной системой, QR кодами и Supabase.

## 🚀 Быстрый старт

### 1. Установите зависимости:
```bash
cd bot
pip install -r requirements.txt
```

### 2. Настройте .env файл:
```bash
# Скопируйте example
cp ../.env.example ../.env

# Отредактируйте .env:
# - TELEGRAM_BOT_TOKEN - получите у @BotFather
# - SUPABASE_URL и SUPABASE_KEY - из вашего Supabase проекта
# - ADMIN_IDS - ваш Telegram ID (узнайте у @userinfobot)
```

### 3. Запустите бота:
```bash
python bot.py
```

## ✨ Функции

### 🔗 Реферальная система
- ✅ 2-уровневая система (100 + 50 TAMA)
- ✅ Работает БЕЗ кошелька (только Telegram ID)
- ✅ Мгновенное начисление TAMA
- ✅ Pending referrals для не подключивших кошелёк
- ✅ Milestone бонусы (5, 10, 25, 50, 100 рефералов)

### 📱 QR коды
- ✅ Генерация QR кодов для реферальных ссылок
- ✅ Отправка прямо в чат

### 🛡️ Модерация
- ✅ Anti-spam (5 сообщений/10 сек)
- ✅ Фильтр запрещенных слов
- ✅ Mute/Ban/Kick команды для админов

### 💾 База данных
- ✅ Supabase интеграция
- ✅ Автоматическая синхронизация
- ✅ Leaderboard с статистикой

## 📋 Команды

### Для всех пользователей:
- `/start` - Приветствие
- `/help` - Справка
- `/ref` - Получить реферальную ссылку с QR кодом
- `/stats` - Ваша статистика
- `/link [wallet]` - Привязать кошелёк

### Для админов:
- `/mute` - Замутить (ответ на сообщение)
- `/unmute` - Размутить
- `/ban` - Забанить
- `/kick` - Кикнуть
- `/broadcast [текст]` - Отправить в канал

## 🎯 Структура реферальной системы

```
User clicks referral link (s.html?ref=TAMA3F2A1C)
    ↓
Bot receives /start refTAMA3F2A1C
    ↓
Find referrer by code (Telegram ID only!)
    ↓
Save to pending_referrals + Award 100 TAMA instantly
    ↓
When user connects wallet → Move to referrals table
```

## 🔧 Troubleshooting

**Bot не запускается:**
- Проверьте .env файл
- Убедитесь что установлены все зависимости
- Проверьте TELEGRAM_BOT_TOKEN

**Referrals не работают:**
- Проверьте Supabase подключение
- Убедитесь что таблицы созданы (leaderboard, referrals, pending_referrals)

**QR коды не генерируются:**
- Установите: `pip install qrcode pillow`

## 📦 Deployment

### Heroku:
```bash
# Procfile уже создан
git push heroku main
```

### VPS (Linux):
```bash
# Используйте systemd или screen
screen -S tamagotchi-bot
python bot.py
# Ctrl+A, D чтобы отключиться
```

### PythonAnywhere:
```bash
# Загрузите файлы
# В Web tab добавьте Always-on task
# Запустите bot.py
```

## 📄 License
MIT License
