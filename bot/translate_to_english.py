"""
Script to replace all Russian text with English in bot.py
Run this after backing up bot.py
"""

replacements = {
    # Daily Rewards
    "**WEEK MILESTONE!** 7 дней подряд!": "**WEEK MILESTONE!** 7 days streak!",
    "**2 WEEKS!** Невероятный стрик!": "**2 WEEKS!** Amazing streak!",
    "**МЕСЯЦ!** Ты легенда!": "**MONTH!** You're a legend!",
    "**Награда:**": "**Reward:**",
    "**Стрик:**": "**Streak:**",
    "дней подряд": "days in a row",
    "**Следующая:** через 24 часа": "**Next:** in 24 hours",
    "**Возвращайся каждый день для больших наград!**": "**Come back every day for bigger rewards!**",
    "⏰ **Already Claimed Today!**\n\n🔥 **Current Streak:**": "⏰ **Already Claimed Today!**\n\n🔥 **Current Streak:**",
    "дней\n📅 **Вернись завтра** для следующей награды!": "days\n📅 **Come back tomorrow** for next reward!",
    "**Не пропусти день, чтобы не сбросить стрик!**": "**Don't miss a day to keep your streak!**",
    "❌ Ошибка при получении награды. Попробуй позже.": "❌ Error claiming reward. Try again later.",
    
    # Mini-Games
    "🎮 **Мини-Игры**": "🎮 **Mini-Games**",
    "**Играй и зарабатывай TAMA!**": "**Play and earn TAMA!**",
    "**Доступные игры:**": "**Available games:**",
    "Угадай Число (1-100) - до 500 TAMA": "Guess the Number (1-100) - up to 500 TAMA",
    "Solana Викторина - 100 TAMA": "Solana Trivia - 100 TAMA",
    "Колесо Фортуны - до 500 TAMA": "Spin the Wheel - up to 500 TAMA",
    "**Лимит:**": "**Limit:**",
    "игр осталось сегодня": "games left today",
    "**Выбери игру:**": "**Choose a game:**",
    "❌ Ошибка загрузки игр": "❌ Error loading games",
    "Угадай Число": "Guess Number",
    "Викторина": "Trivia",
    "Лимит игр на сегодня!": "Game limit reached!",
    
    # Guess Number Game
    "**Угадай Число (1-100)**": "**Guess the Number (1-100)**",
    "**Награды:**": "**Rewards:**",
    "Точное попадание: 500 TAMA": "Perfect guess: 500 TAMA",
    "Остальное: 25 TAMA": "Others: 25 TAMA",
    "**Введи число от 1 до 100:**": "**Enter a number from 1 to 100:**",
    "Назад": "Back",
    "**Заработано:**": "**Earned:**",
    "Играй еще завтра! 🎮": "Play again tomorrow! 🎮",
    "Меню": "Menu",
    "❌ Число должно быть от 1 до 100!": "❌ Number must be between 1 and 100!",
    "❌ Введи число от 1 до 100!": "❌ Enter a number from 1 to 100!",
    
    # Trivia
    "**Solana Викторина**": "**Solana Trivia**",
    "Какой язык используется для Solana смарт-контрактов?": "What language is used for Solana smart contracts?",
    "Сколько TPS может обрабатывать Solana?": "How many TPS can Solana process?",
    "Кто создатель Solana?": "Who created Solana?",
    "Какой консенсус использует Solana?": "What consensus does Solana use?",
    "**Награда:** 100 TAMA за правильный ответ": "**Reward:** 100 TAMA for correct answer",
    
    # Wheel
    "**Колесо Фортуны**": "**Spin the Wheel**",
    "**Приходи завтра за новыми играми!**": "**Come back tomorrow for new games!**",
    "Крутить еще": "Spin Again",
    
    # Badges
    "🏅 **Твои Значки**": "🏅 **Your Badges**",
    "Пока нет значков. Играй и приглашай друзей!": "No badges yet. Play and invite friends!",
    "**Как получить больше:**": "**How to earn more:**",
    "Будь в первых 100": "Be in first 100 users",
    "дней подряд": "days streak",
    "рефералов": "referrals",
    "мини-игр": "mini-games",
    "Джекпот в рулетке": "Wheel jackpot",
    "❌ Ошибка загрузки значков": "❌ Error loading badges",
    
    # Ranks
    "**Твой Ранг:**": "**Your Rank:**",
    "**Статистика:**": "**Stats:**",
    "Рефералы:": "Referrals:",
    "Прогресс:": "Progress:",
    "**Следующий ранг:**": "**Next rank:**",
    "**Осталось:**": "**Needed:**",
    "рефералов": "referrals",
    "**Максимальный ранг достигнут!**": "**Maximum rank achieved!**",
    "❌ Ошибка загрузки ранга": "❌ Error loading rank",
    
    # Quests
    "🎯 **Квесты Рефералов**": "🎯 **Referral Quests**",
    "Новичок": "Newbie",
    "Пригласи 1 друга": "Invite 1 friend",
    "Активист": "Active",
    "Пригласи 3 друзей": "Invite 3 friends",
    "Лидер": "Leader",
    "Пригласи 10 друзей": "Invite 10 friends",
    "Легенда": "Legend",
    "Пригласи 50 друзей": "Invite 50 friends",
    "Награда:": "Reward:",
    "**Приглашай друзей для выполнения квестов!**": "**Invite friends to complete quests!**",
    "❌ Ошибка загрузки квестов": "❌ Error loading quests",
    
    # Stats
    "📊 **Твоя Полная Статистика**": "📊 **Your Full Stats**",
    "**TAMA Баланс:**": "**TAMA Balance:**",
    "**Ранг:**": "**Rank:**",
    "**Рефералы:**": "**Referrals:**",
    "Всего приглашено:": "Total invited:",
    "Активные:": "Active:",
    "В ожидании:": "Pending:",
    "**Активность:**": "**Activity:**",
    "Стрик входов:": "Login streak:",
    "дней": "days",
    "Заработано значков:": "Badges earned:",
    "**Прогресс:**": "**Progress:**",
    "**Продолжай играть и приглашать друзей!**": "**Keep playing and inviting friends!**",
    "Реферал": "Referral",
    "Игры": "Games",
    
    # Callbacks
    "🔙 Назад": "🔙 Back",
    
    # Welcome/Menu - already in English, keep it
}

def translate_file(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for ru, en in replacements.items():
        content = content.replace(ru, en)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Translated {len(replacements)} phrases")
    print(f"Saved to: {output_file}")

if __name__ == "__main__":
    translate_file('bot.py', 'bot_english.py')
    print("\nDone! Review bot_english.py and then rename it to bot.py")

