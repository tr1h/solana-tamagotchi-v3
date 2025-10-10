# 🔗 TELEGRAM WALLET LINKING SYSTEM

Полное руководство по системе привязки кошелька и Telegram аккаунта.

---

## 📋 ДВА СЦЕНАРИЯ ПРИВЯЗКИ:

### **1️⃣ TELEGRAM → САЙТ (Рекомендуется)**
Пользователь начинает в Telegram боте, затем переходит на сайт.

### **2️⃣ САЙТ → TELEGRAM (Альтернатива)**
Пользователь начинает на сайте, затем связывает через бот.

---

## 🎯 СЦЕНАРИЙ 1: TELEGRAM → САЙТ (ЛУЧШИЙ)

### **Процесс:**

1. **Пользователь открывает бота:**
   ```
   /start
   ```

2. **Бот отвечает с кнопкой "🎮 Play Game":**
   ```
   Ссылка: https://tr1h.github.io/solana-tamagotchi-v3?tg_id=123456789&tg_username=username
   ```

3. **Пользователь кликает → открывается сайт с параметрами:**
   - `tg_id` - Telegram ID пользователя
   - `tg_username` - Telegram username пользователя

4. **Пользователь подключает кошелёк Phantom:**
   - Сайт автоматически **связывает** кошелёк с Telegram

5. **Результат:**
   ```
   ✅ Telegram linked: @username
   ```

### **Код (уже работает):**

#### **bot.py** (строки 144-155):
```python
@bot.message_handler(commands=['start'])
def send_welcome(message):
    user_id = message.from_user.id
    username = message.from_user.username or message.from_user.first_name
    
    # Генерируем ссылку с Telegram параметрами
    game_link = f"{GAME_URL}?tg_id={user_id}&tg_username={username}"
    
    markup = types.InlineKeyboardMarkup()
    markup.add(types.InlineKeyboardButton("🎮 Play Game", url=game_link))
    
    bot.send_message(message.chat.id, welcome_text, reply_markup=markup)
```

#### **telegram.js** (строки 10-22):
```javascript
getTelegramDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('tg_id');
    const telegramUsername = urlParams.get('tg_username');
    
    if (telegramId) {
        return {
            id: telegramId,
            username: telegramUsername || 'Unknown'
        };
    }
    return null;
}
```

#### **telegram.js** (строки 45-91):
```javascript
async linkWalletToTelegram(walletAddress) {
    const telegramData = this.getTelegramData();
    
    if (!telegramData) {
        console.log('ℹ️ No Telegram data available');
        return { success: false };
    }

    // Update Supabase
    const { data, error } = await window.Database.supabase
        .from('leaderboard')
        .update({
            telegram_id: telegramData.id,
            telegram_username: telegramData.username
        })
        .eq('wallet_address', walletAddress)
        .select();

    if (!error) {
        console.log('✅ Telegram linked:', telegramData);
        localStorage.setItem('telegram_id', telegramData.id);
        localStorage.setItem('telegram_username', telegramData.username);
    }
}
```

#### **wallet.js** (строки 100-102):
```javascript
// Auto-link Telegram if params present
if (window.TelegramIntegration) {
    await TelegramIntegration.linkWalletToTelegram(this.publicKey.toString());
}
```

### **Преимущества:**
✅ **Автоматическая** привязка  
✅ **Без ввода команд** вручную  
✅ **Простой UX** - один клик  
✅ **Безопасно** - параметры передаются через URL  

---

## 🔄 СЦЕНАРИЙ 2: САЙТ → TELEGRAM (Альтернатива)

### **Процесс:**

1. **Пользователь заходит на сайт:**
   ```
   https://tr1h.github.io/solana-tamagotchi-v3
   ```

2. **Подключает кошелёк Phantom:**
   - Копирует адрес кошелька

3. **Открывает Telegram бота:**
   ```
   /link WALLET_ADDRESS
   ```

4. **Бот связывает кошелёк:**
   ```
   ✅ Wallet linked successfully!
   ```

### **Код (уже работает):**

#### **bot.py** (строки 378-419):
```python
@bot.message_handler(commands=['link'])
def link_wallet(message):
    args = message.text.split()
    
    if len(args) < 2:
        bot.reply_to(message, "❌ Usage: /link YOUR_WALLET_ADDRESS")
        return
    
    wallet_address = args[1]
    telegram_id = str(message.from_user.id)
    telegram_username = message.from_user.username or message.from_user.first_name
    
    try:
        # Update Supabase
        response = supabase.table('leaderboard') \
            .update({
                'telegram_id': telegram_id,
                'telegram_username': telegram_username
            }) \
            .eq('wallet_address', wallet_address) \
            .execute()
        
        if response.data:
            bot.reply_to(message, f"✅ Wallet linked successfully!\n\n👛 {wallet_address}\n📱 @{telegram_username}")
        else:
            bot.reply_to(message, "❌ Wallet not found. Make sure you have a pet in the game first!")
    except Exception as e:
        bot.reply_to(message, f"❌ Error: {str(e)}")
```

### **Преимущества:**
✅ **Работает без сайта** - можно связать из бота  
✅ **Ручной контроль** - пользователь сам выбирает когда связать  
✅ **Fallback метод** - если автоматическая привязка не сработала  

### **Недостатки:**
❌ **Требует копирования** адреса кошелька  
❌ **Больше шагов** - нужно вводить команду вручную  
❌ **UX сложнее** - не все пользователи знают свой адрес кошелька  

---

## 🔍 ПРОВЕРКА ПРИВЯЗКИ:

### **1. Через бота:**
```
/stats
```

**Ответ:**
```
📊 Your Stats:
👛 Wallet: AaU6b8BiNmkce6mw4WF8txPggR5LsMQ1kccD5BRcNApC
🐻 Pet: My Bear (Level 5)
💰 TAMA: 500
📱 Telegram: @username ✅
```

### **2. Через консоль браузера:**
```javascript
const telegramData = await TelegramIntegration.getTelegramByWallet('YOUR_WALLET_ADDRESS');
console.log(telegramData);
```

**Ответ:**
```javascript
{
    success: true,
    telegram_id: "123456789",
    telegram_username: "username"
}
```

### **3. Через Supabase Dashboard:**
1. Открой: https://supabase.com/dashboard
2. Выбери проект
3. Table Editor → `leaderboard`
4. Проверь колонки `telegram_id` и `telegram_username`

---

## 🛠️ TROUBLESHOOTING:

### **Проблема 1: Привязка не работает**

**Симптомы:**
- `telegram_id: None` в базе
- Нет уведомлений от бота

**Решения:**
1. **Проверь URL параметры:**
   ```javascript
   console.log(window.location.href);
   // Должно быть: ?tg_id=123456&tg_username=username
   ```

2. **Проверь консоль:**
   ```javascript
   const telegramData = TelegramIntegration.getTelegramData();
   console.log(telegramData);
   ```

3. **Используй ручную привязку:**
   ```
   /link YOUR_WALLET_ADDRESS
   ```

### **Проблема 2: Кошелёк не найден**

**Симптомы:**
- Бот отвечает "Wallet not found"

**Решение:**
- **Сначала создай питомца** на сайте
- **Потом** связывай через `/link`

### **Проблема 3: Дублирующиеся записи**

**Симптомы:**
- Несколько записей с одним кошельком

**Решение:**
- Удали дубли в Supabase Dashboard
- Оставь только одну запись с `telegram_id`

---

## 📊 БАЗА ДАННЫХ СТРУКТУРА:

### **Таблица: `leaderboard`**

| Колонка | Тип | Описание |
|---------|-----|----------|
| `wallet_address` | TEXT | Solana кошелёк (PRIMARY KEY) |
| `telegram_id` | TEXT | Telegram ID пользователя |
| `telegram_username` | TEXT | Telegram username |
| `pet_name` | TEXT | Имя питомца |
| `level` | INTEGER | Уровень |
| `xp` | INTEGER | Опыт |
| `tama` | INTEGER | Токены TAMA |
| `pet_type` | TEXT | Тип питомца |
| `pet_rarity` | TEXT | Редкость |
| `pet_data` | JSONB | Полные данные питомца |
| `created_at` | TIMESTAMP | Дата создания |
| `updated_at` | TIMESTAMP | Дата обновления |

---

## 🎯 РЕКОМЕНДАЦИИ:

### **Для новых пользователей:**
1. ✅ Используй **TELEGRAM → САЙТ** (автоматическая привязка)
2. ✅ Открывай сайт **только через бота**
3. ✅ Проверяй привязку через `/stats`

### **Для существующих игроков:**
1. ✅ Используй **САЙТ → TELEGRAM** (ручная привязка)
2. ✅ Скопируй адрес кошелька из Phantom
3. ✅ Напиши в боте `/link WALLET_ADDRESS`

### **Для разработчиков:**
1. ✅ Всегда проверяй `telegram_id` в базе
2. ✅ Логируй ошибки привязки
3. ✅ Используй `localStorage` для кеширования

---

## 🔐 БЕЗОПАСНОСТЬ:

### **Что безопасно:**
✅ Передача `tg_id` через URL (публичный ID)  
✅ Передача `tg_username` через URL (публичное имя)  
✅ Хранение в `localStorage` (только на клиенте)  

### **Что НЕ передавать:**
❌ **Private keys** кошелька  
❌ **Session tokens** Telegram  
❌ **API keys** Supabase  

---

## 🚀 ИТОГО:

### **Лучший UX:**
```
Пользователь → Telegram бот /start → Кнопка "Play Game" → Сайт → Phantom → Автоматическая привязка ✅
```

### **Fallback:**
```
Пользователь → Сайт → Phantom → Копирует адрес → Telegram бот → /link WALLET → Ручная привязка ✅
```

### **Результат:**
```
✅ Кошелёк привязан к Telegram
✅ Бот может отправлять уведомления
✅ Статистика доступна в /stats
✅ Реферальная система работает
```

---

## 📝 ТЕСТИРОВАНИЕ:

### **Шаги:**
1. Открой бота: https://t.me/solana_tamagotchi_v3_bot
2. Напиши `/start`
3. Нажми "🎮 Play Game"
4. Подключи Phantom
5. Создай питомца
6. Вернись в бот
7. Напиши `/stats`
8. Проверь: `📱 Telegram: @username ✅`

**Если видишь ✅ - привязка работает!**

---

## 🆘 ПОДДЕРЖКА:

Если что-то не работает:
1. Проверь консоль браузера (F12)
2. Проверь логи бота
3. Проверь Supabase Dashboard
4. Используй ручную привязку `/link`

**Привязка кошелька и Telegram - готова и работает!** 🎉




