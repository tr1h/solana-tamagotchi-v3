# 🤖 Solana Tamagotchi Telegram Bot

Полнофункциональный бот с модерацией, MySQL и автопостами.

## 🚀 Быстрый старт

### 1. Установите зависимости:
```bash
pip install -r requirements.txt
```

### 2. Настройте админ ID:
- Узнайте свой Telegram ID у `@userinfobot`
- Добавьте в `bot.py`: `ADMIN_IDS = [ваш_ID]`

### 3. Запустите:
```bash
python bot.py
```
Или используйте `start_bot.bat`

## 📋 Команды

### Для всех:
- `/start`, `/help` - Справка
- `/game` - Ссылка на игру
- `/mint` - Минт NFT
- `/price` - Цена NFT
- `/players` - Количество игроков
- `/pets` - Количество питомцев
- `/ref` - Реферальная ссылка
- `/stats` - Ваша статистика

### Для админов:
- `/mute [минуты]` - Замутить (ответ на сообщение)
- `/unmute` - Размутить
- `/ban` - Забанить
- `/kick` - Кикнуть
- `/broadcast` - Отправить в канал

## 🛡️ Автомодерация

- **Анти-спам:** 5 сообщений/10 сек
- **Фильтр слов:** Автоматическое удаление
- **Защита от ссылок:** Блокировка URL

## 📊 Функции

- **MySQL интеграция** - реальная статистика
- **Автопосты** - ежедневно в 12:00 в канал
- **Приветствие** - новых участников группы
- **Модерация** - автоматическая и ручная

## 📖 Документация

- `SETUP.md` - Пошаговая настройка
- `ADMIN_GUIDE.md` - Руководство администратора
- `RULES.txt` - Правила группы

## 🔧 Troubleshooting

**Bot doesn't respond:**
- Check bot token
- Ensure bot is running
- Check internet connection

**Commands don't work:**
- Make sure you set commands in BotFather
- Restart the bot

## 🌐 Deploy to Server

### Using screen (Linux):
```bash
screen -S tamagotchi-bot
python bot.py
# Press Ctrl+A, then D to detach
```

### Using PM2 (Node.js):
```bash
npm install -g pm2
pm2 start bot.py --name tamagotchi-bot --interpreter python3
pm2 save
```

### Using systemd (Linux):
Create `/etc/systemd/system/tamagotchi-bot.service`:
```ini
[Unit]
Description=Solana Tamagotchi Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/python3 /path/to/bot/bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable tamagotchi-bot
sudo systemctl start tamagotchi-bot
```

## 📝 License

MIT License


