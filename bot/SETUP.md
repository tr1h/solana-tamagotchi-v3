# 🎯 Checklist - Telegram Setup

## ✅ Бот готов! Что дальше?

### 1. Настройте Admin ID
```
1. Напишите боту @userinfobot
2. Скопируйте ваш ID
3. Откройте bot.py
4. Измените: ADMIN_IDS = [ваш_ID]
5. Перезапустите: python bot.py
```

### 2. Закрепите правила в группе
```
1. Откройте RULES.txt
2. Скопируйте текст
3. Отправьте в группу
4. Закрепите сообщение (Pin)
```

### 3. Сделайте бота админом
```
Группа:
- Права: Delete messages, Ban users

Канал:
- Права: Post messages
```

### 4. Настройте описание группы
```
🐾 Solana Tamagotchi Community

Обсуждаем игру, делимся питомцами, помогаем друг другу!

📢 Канал: @solana_tamagotchi
🤖 Бот: @solana_tamagotchi_bot
🐦 Twitter: @GotchiGame

Правила закреплены ⬆️
```

### 5. Проверьте работу:
- [ ] Бот приветствует новых участников
- [ ] Анти-спам работает (отправьте 6 сообщений подряд)
- [ ] Команды работают (/help, /players, /price)
- [ ] Модерация работает (/mute, /ban - только для админов)

### 6. Первый пост в канале:
```
🚀 Solana Tamagotchi - Coming Soon!

🐾 Play-to-Earn Pet Game
💰 NFT Minting System
🎁 Multi-Level Referrals
🏆 Competitive Leaderboard

Join the community:
👥 Group: [ссылка на группу]
🤖 Bot: @solana_tamagotchi_bot

Launch: Soon! 🔥
```

## 🔄 Автопосты

Бот автоматически постит статистику в канал **ежедневно в 12:00**

Чтобы изменить время - см. ADMIN_GUIDE.md

## ❓ Проблемы?

**Бот не отвечает:**
- Проверьте, запущен ли `python bot.py`
- Посмотрите ошибки в консоли

**Не работает модерация:**
- Проверьте права админа в группе
- Добавьте свой ID в ADMIN_IDS

**MySQL ошибки:**
- Запустите XAMPP
- Проверьте настройки в bot.py

## 🎉 Готово!

Бот настроен и готов к работе!









