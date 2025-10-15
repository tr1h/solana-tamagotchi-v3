# 🚀 Инструкция по запуску Telegram бота

## Шаг 1: Создание бота в Telegram

1. Откройте @BotFather в Telegram
2. Отправьте `/newbot`
3. Введите имя: `Solana Tamagotchi`
4. Введите username: `solana_tamagotchi_v3_bot` (или свой)
5. Скопируйте **BOT TOKEN**

## Шаг 2: Настройка команд бота

Отправьте @BotFather:
```
/setcommands
```

Вставьте:
```
start - Начать работу с ботом
help - Помощь и информация
ref - Получить реферальную ссылку
stats - Ваша статистика
link - Привязать кошелёк
game - Играть в игру
leaderboard - Таблица лидеров
```

## Шаг 3: Supabase настройка

1. Зайдите на https://supabase.com
2. Создайте новый проект
3. Создайте таблицы:

### Таблица: leaderboard
```sql
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  telegram_id TEXT,
  telegram_username TEXT,
  pet_name TEXT,
  pet_type TEXT,
  pet_rarity TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  tama INTEGER DEFAULT 0,
  referral_code TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица: referrals
```sql
CREATE TABLE referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_telegram_id TEXT NOT NULL,
  referred_telegram_id TEXT NOT NULL,
  referral_code TEXT,
  level INTEGER DEFAULT 1,
  signup_reward INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица: pending_referrals
```sql
CREATE TABLE pending_referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_telegram_id TEXT NOT NULL,
  referred_telegram_id TEXT NOT NULL,
  referrer_username TEXT,
  referred_username TEXT,
  referral_code TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Шаг 4: Настройка .env

Создайте файл `.env` в корне проекта:
```bash
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
SUPABASE_URL=https://ваш-проект.supabase.co
SUPABASE_KEY=ваш_anon_public_ключ
ADMIN_IDS=ваш_telegram_id
GAME_URL=https://tr1h.github.io/solana-tamagotchi/
MINT_URL=https://tr1h.github.io/solana-tamagotchi/
```

**Как узнать свой Telegram ID:**
- Напишите @userinfobot
- Скопируйте Id

## Шаг 5: Установка и запуск

```bash
# Перейти в папку бота
cd bot

# Установить зависимости
pip install -r requirements.txt

# Запустить бота
python bot.py
```

## Шаг 6: Деплой на сервер

### Вариант A: PythonAnywhere (БЕСПЛАТНО)
1. Зарегистрируйтесь на https://www.pythonanywhere.com
2. Загрузите файлы проекта
3. Установите зависимости в консоли
4. В разделе "Tasks" создайте Always-on task
5. Запустите `python bot/bot.py`

### Вариант B: Heroku
1. Создайте `Procfile` в папке bot:
```
worker: python bot.py
```

2. Деплой:
```bash
heroku create solana-tamagotchi-bot
heroku config:set TELEGRAM_BOT_TOKEN=ваш_токен
heroku config:set SUPABASE_URL=ваш_url
heroku config:set SUPABASE_KEY=ваш_ключ
git push heroku main
heroku ps:scale worker=1
```

### Вариант C: VPS (Digital Ocean, AWS, etc.)
```bash
# SSH на сервер
ssh root@ваш_ip

# Установить Python и зависимости
apt update && apt install python3 python3-pip screen

# Загрузить проект
git clone ваш_репозиторий

# Запустить в screen
screen -S tamagotchi-bot
cd bot
pip3 install -r requirements.txt
python3 bot.py

# Отключиться от screen: Ctrl+A, затем D
# Вернуться: screen -r tamagotchi-bot
```

## ✅ Проверка работы

1. Найдите бота в Telegram
2. Отправьте `/start`
3. Отправьте `/ref` - должна появиться реферальная ссылка
4. Нажмите "📱 Get QR Code" - должен сгенерироваться QR код

## 🐛 Troubleshooting

**Бот не отвечает:**
- Проверьте что `bot.py` запущен
- Проверьте токен в .env
- Посмотрите логи в консоли

**Referrals не работают:**
- Проверьте подключение к Supabase
- Убедитесь что таблицы созданы
- Проверьте SUPABASE_KEY

**QR коды не генерируются:**
```bash
pip install qrcode pillow
```

## 📊 Мониторинг

Логи бота показывают:
- ✅ Сохранённые рефералы
- 💰 Начисленные TAMA
- 🔗 Генерацию кодов
- ❌ Ошибки

Следите за консолью!

