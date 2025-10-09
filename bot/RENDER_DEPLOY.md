# 🚀 ДЕПЛОЙ БОТА НА RENDER (БЕСПЛАТНО)

## ШАГ 1: СОЗДАТЬ АККАУНТ

1. Перейти на: https://render.com/
2. **Sign Up with GitHub**
3. Подтвердить email

## ШАГ 2: СОЗДАТЬ WEB SERVICE

1. Dashboard → **New +** → **Background Worker**
2. Выбрать **"Connect a repository"**
3. Найти: `tr1h/solana-tamagotchi-v3`
4. Нажать **"Connect"**

## ШАГ 3: НАСТРОЙКИ

### Name:
```
solana-tamagotchi-bot
```

### Region:
```
Frankfurt (EU Central)
```

### Root Directory:
```
bot
```

### Runtime:
```
Python 3
```

### Build Command:
```
pip install -r requirements.txt
```

### Start Command:
```
python bot.py
```

## ШАГ 4: ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

Нажать **"Advanced"** → **"Add Environment Variable"**

Добавить:

```
BOT_TOKEN=8278463878:AAH590EtqekSpfoE_uJwaNQ-qKACFyt8eaw
SUPABASE_URL=https://zfrazyupameidxpjihrh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmcmF6eXVwYW1laWR4cGppaHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Mzc1NTAsImV4cCI6MjA3NTUxMzU1MH0.1EkMDqCNJoAjcJDh3Dd3yPfus-JpdcwE--z2dhjh7wU
```

## ШАГ 5: ПЛАН

Выбрать **"Free"** план

## ШАГ 6: DEPLOY

1. Нажать **"Create Background Worker"**
2. Дождаться деплоя (3-5 минут)
3. Проверить логи - должно быть: "Bot started!"

## ✅ ГОТОВО!

Бот работает 24/7 бесплатно!

## 💰 БЕСПЛАТНЫЕ ЛИМИТЫ

- ✅ 750 часов в месяц (достаточно!)
- ✅ Автоматический sleep после 15 минут неактивности
- ✅ Автоматическое пробуждение при запросе

## ⚠️ ВАЖНО

Render может "засыпать" бота после 15 минут неактивности.
Для постоянной работы можно:
1. Использовать платный план ($7/мес)
2. Или настроить ping каждые 10 минут




