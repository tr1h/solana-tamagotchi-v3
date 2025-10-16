# 🚀 QUICK START - Gamification

## 📋 Чеклист запуска (5 минут):

### ✅ Шаг 1: SQL таблицы
```sql
-- Открой Supabase Dashboard
-- SQL Editor → New Query
-- Скопируй gamification_tables.sql
-- Run Query
```

### ✅ Шаг 2: Запуск бота
```bash
cd C:\goooog\solana-tamagotchi\bot
python bot.py
```

### ✅ Шаг 3: Тест
В боте попробуй:
- `/help` - новое меню
- `/daily` - получи награду
- `/games` - сыграй
- `/badges` - посмотри значки

---

## 🎮 Новые команды:

| Команда | Что делает |
|---------|------------|
| `/daily` | Ежедневная награда (50-2,000 TAMA) |
| `/games` | Мини-игры (3/день) |
| `/badges` | Твои значки |
| `/rank` | Твой ранг |
| `/quests` | Квесты рефералов |

---

## 💰 Как зарабатывать TAMA:

1. **Daily Reward**: до 2,000 TAMA/день (streak)
2. **Mini-Games**: до 1,500 TAMA/день (3 игры)
3. **Referrals**: 1,000 TAMA за друга
4. **Quests**: до 50,000 TAMA бонусов

**Максимум в день: ~3,500 TAMA** без рефералов!

---

## 🎯 Rewards Table:

### Daily Rewards:
- День 1: 50 TAMA
- День 3: 150 TAMA
- День 7: 500 TAMA ⭐
- День 14: 1,000 TAMA
- День 30: 2,000 TAMA 👑

### Mini-Games:
- Guess Number: 25-500 TAMA
- Trivia: 25-100 TAMA
- Spin Wheel: 10-500 TAMA

### Ranks:
- 🥉 Bronze: 0-4 refs
- 🥈 Silver: 5-9 refs
- 🥇 Gold: 10-24 refs
- 💎 Platinum: 25-49 refs
- 👑 Legend: 50+ refs

---

## 🏅 Badges List:

- 🐦 **Early Bird** - Первые 100 юзеров
- ⚔️ **Week Warrior** - 7 дней streak
- 🔥 **Streak Master** - 30 дней streak
- 👑 **Referral King** - 50+ рефералов
- 💎 **Generous** - 100+ рефералов
- 🎮 **Gamer** - 100 мини-игр
- 🍀 **Lucky** - Джекпот в рулетке

---

## 📊 Структура БД:

```
Новые таблицы:
├── daily_rewards      (streak tracking)
├── game_plays         (game history)
├── game_limits        (3 games/day limit)
├── user_badges        (badges collection)
├── achievements       (achievements)
├── user_ranks         (rank system)
├── user_quests        (quest progress)
└── notifications      (push notifications)
```

---

## 🔥 Engagement Mechanics:

### Retention Boosters:
✅ Daily login (streak)
✅ Games (3x/day touchpoint)
✅ Quests (long-term goals)
✅ Badges (collectibles)
✅ Ranks (status)

### Virality Boosters:
✅ Referral quests
✅ Visible ranks
✅ Shareable badges
✅ Leaderboard competition

---

## 🚨 Troubleshooting:

**Бот не запускается?**
```bash
pip install pyTelegramBotAPI supabase python-dotenv qrcode pillow schedule
```

**Ошибка импорта gamification?**
- Проверь что `gamification.py` в папке `bot/`

**SQL ошибка?**
- Выполни `gamification_tables.sql` в Supabase

**Games не работают?**
- Проверь таблицу `game_limits` создана

---

## 📈 Метрики для отслеживания:

```sql
-- Daily Active Users
SELECT COUNT(DISTINCT telegram_id) 
FROM daily_rewards 
WHERE last_claim::date = CURRENT_DATE;

-- Game plays today
SELECT COUNT(*) 
FROM game_plays 
WHERE played_at::date = CURRENT_DATE;

-- Average streak
SELECT AVG(streak_days) 
FROM daily_rewards;

-- Top badges
SELECT badge_id, COUNT(*) 
FROM user_badges 
GROUP BY badge_id 
ORDER BY COUNT(*) DESC;
```

---

## ✨ Tips для максимального engagement:

1. **Анонсируй в группе** каждое обновление
2. **Челлендж**: "Кто первым 30-day streak?"
3. **Конкурсы**: "Лучший результат в игре"
4. **Showcase winners** в группе
5. **Weekly leaderboard** updates

---

## 🎯 Ready to Launch!

Всё готово! Просто:

1. ✅ Создай таблицы (SQL)
2. ✅ Запусти бота
3. ✅ Протестируй команды
4. ✅ Анонсируй в группе

**LFG! 🚀**

