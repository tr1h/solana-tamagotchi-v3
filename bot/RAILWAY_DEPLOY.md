# 🚀 ДЕПЛОЙ БОТА НА RAILWAY

## ШАГ 1: СОЗДАТЬ АККАУНТ

1. Перейти на: https://railway.app/
2. Sign Up with GitHub
3. Подтвердить email

## ШАГ 2: СОЗДАТЬ ПРОЕКТ

1. Нажать **"New Project"**
2. Выбрать **"Deploy from GitHub repo"**
3. Выбрать репозиторий: `tr1h/solana-tamagotchi-v3`
4. Railway автоматически обнаружит Python

## ШАГ 3: НАСТРОИТЬ

1. В настройках проекта → **Settings**
2. **Root Directory**: `bot`
3. **Start Command**: `python bot.py`

## ШАГ 4: ДОБАВИТЬ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

В разделе **Variables** добавить:

```
BOT_TOKEN=8278463878:AAH590EtqekSpfoE_uJwaNQ-qKACFyt8eaw
SUPABASE_URL=https://zfrazyupameidxpjihrh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmcmF6eXVwYW1laWR4cGppaHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Mzc1NTAsImV4cCI6MjA3NTUxMzU1MH0.1EkMDqCNJoAjcJDh3Dd3yPfus-JpdcwE--z2dhjh7wU
```

## ШАГ 5: ДЕПЛОЙ

1. Нажать **"Deploy"**
2. Дождаться сборки (2-3 минуты)
3. Проверить логи - должно быть: "Bot started!"

## ✅ ГОТОВО!

Бот теперь работает 24/7 в облаке Railway!

## 💰 БЕСПЛАТНЫЕ ЛИМИТЫ

- 500 часов в месяц (достаточно для одного бота)
- После исчерпания - $5/месяц

## 🔧 АЛЬТЕРНАТИВЫ

Если Railway закончится, можно использовать:
- **Render** (бесплатно)
- **Heroku** ($7/месяц)
- **DigitalOcean** ($5/месяц)





