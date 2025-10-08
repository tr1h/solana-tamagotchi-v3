# 🗄️ MySQL Setup Instructions

Инструкция по настройке MySQL для Solana Tamagotchi V3

---

## 📋 **Требования:**

1. ✅ **XAMPP** или **OpenServer** (Windows)
2. ✅ **PHP 7.4+**
3. ✅ **MySQL 5.7+**

---

## 🚀 **Установка XAMPP (Windows):**

### **Шаг 1: Скачать XAMPP**
1. Перейдите: https://www.apachefriends.org/
2. Скачайте XAMPP для Windows
3. Запустите установщик
4. Выберите компоненты: **Apache, MySQL, PHP**

### **Шаг 2: Запустить XAMPP**
1. Откройте **XAMPP Control Panel**
2. Нажмите **Start** для **Apache**
3. Нажмите **Start** для **MySQL**
4. Убедитесь что оба сервиса запущены (зелёные)

### **Шаг 3: Скопировать файлы**
1. Скопируйте папку `solana-tamagotchi` в `C:\xampp\htdocs\`
2. Путь должен быть: `C:\xampp\htdocs\solana-tamagotchi\`

### **Шаг 4: Настроить базу данных**

**Автоматическая настройка:**
- Откройте: `http://localhost/solana-tamagotchi/api/config.php`
- База данных создастся автоматически!

**Или вручную через phpMyAdmin:**
1. Откройте: http://localhost/phpmyadmin
2. Создайте базу данных: `solana_tamagotchi`
3. Выберите кодировку: `utf8mb4_unicode_ci`
4. Таблицы создадутся автоматически

### **Шаг 5: Настроить config.php**
Откройте `api/config.php` и измените параметры подключения:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');     // Ваш пользователь MySQL
define('DB_PASS', '');         // Ваш пароль (по умолчанию пусто)
define('DB_NAME', 'solana_tamagotchi');
```

### **Шаг 6: Добавить первого админа**
Откройте phpMyAdmin и выполните SQL:

```sql
INSERT INTO admins (wallet_address, name, permissions) 
VALUES ('ВАШ_SOLANA_АДРЕС', 'Main Admin', 'all');
```

Замените `ВАШ_SOLANA_АДРЕС` на ваш реальный Solana wallet адрес!

---

## 🔧 **Настройка в игре:**

### **Шаг 1: Включить MySQL**
В файле `js/database.js` найдите и измените:

```javascript
useMySQL: true, // true = MySQL, false = Firebase
apiURL: 'http://localhost/solana-tamagotchi/api',
```

### **Шаг 2: Изменить API URL (если нужно)**
Если XAMPP установлен по другому пути:

```javascript
apiURL: 'http://localhost:8080/solana-tamagotchi/api', // Ваш порт
```

---

## 🧪 **Проверка работы:**

### **1. Проверка API:**
Откройте в браузере:
- `http://localhost/solana-tamagotchi/api/leaderboard.php`
- Должны увидеть: `{"success":true,"data":[]}`

### **2. Проверка игры:**
1. Откройте: `http://localhost/solana-tamagotchi/index.html`
2. Подключите Phantom Wallet
3. Создайте питомца
4. Повысьте уровень
5. Проверьте лидерборд

### **3. Проверка админки:**
1. Откройте: `http://localhost/solana-tamagotchi/admin.html`
2. Подключите wallet админа
3. Должны увидеть панель с статистикой

---

## 🗄️ **Структура БД:**

### **Таблица: leaderboard**
```sql
- id (PRIMARY KEY)
- wallet_address (UNIQUE)
- pet_name
- level
- xp
- tama
- pet_type
- pet_rarity
- created_at
- updated_at
```

### **Таблица: players**
```sql
- id (PRIMARY KEY)
- wallet_address (UNIQUE)
- total_clicks
- total_games
- referrals
- is_online
- last_active
- created_at
```

### **Таблица: admins**
```sql
- id (PRIMARY KEY)
- wallet_address (UNIQUE)
- name
- permissions
- created_at
```

---

## 🐛 **Troubleshooting:**

### **Проблема: API не отвечает**
```
Решение:
1. Проверьте что Apache запущен в XAMPP
2. Проверьте путь: C:\xampp\htdocs\solana-tamagotchi
3. Откройте: http://localhost/solana-tamagotchi/api/config.php
```

### **Проблема: CORS ошибка**
```
Решение:
1. В api/config.php проверьте наличие CORS headers
2. Или добавьте расширение CORS в браузер
```

### **Проблема: База данных не создаётся**
```
Решение:
1. Откройте phpMyAdmin: http://localhost/phpmyadmin
2. Создайте вручную базу: solana_tamagotchi
3. Выполните SQL из файла api/config.php
```

### **Проблема: Доступ запрещён к админке**
```
Решение:
1. Проверьте что ваш wallet добавлен в таблицу admins
2. SQL: SELECT * FROM admins WHERE wallet_address = 'ВАШ_АДРЕС';
3. Если нет - добавьте через phpMyAdmin
```

---

## 🔒 **Безопасность:**

### **Для продакшена:**
1. ✅ Измените пароль MySQL
2. ✅ Добавьте SSL сертификат
3. ✅ Настройте правила firewall
4. ✅ Используйте .env файл для паролей
5. ✅ Ограничьте доступ к API по IP

### **Рекомендуемые настройки:**
```php
// В config.php для продакшена:
define('DB_PASS', getenv('DB_PASSWORD')); // Из переменных окружения
header('Access-Control-Allow-Origin: https://yourdomain.com'); // Только ваш домен
```

---

## 📊 **Полезные SQL запросы:**

### **Получить топ-10 игроков:**
```sql
SELECT * FROM leaderboard 
ORDER BY xp DESC, level DESC 
LIMIT 10;
```

### **Получить онлайн игроков:**
```sql
SELECT COUNT(*) as online 
FROM players 
WHERE is_online = 1 
AND last_active > DATE_SUB(NOW(), INTERVAL 5 MINUTE);
```

### **Очистить старых игроков:**
```sql
DELETE FROM players 
WHERE last_active < DATE_SUB(NOW(), INTERVAL 30 DAY) 
AND is_online = 0;
```

### **Посмотреть всех админов:**
```sql
SELECT * FROM admins;
```

---

## 🎉 **Готово!**

Теперь у вас работает:
- ✅ MySQL база данных
- ✅ PHP API для лидерборда
- ✅ Счётчик онлайн игроков
- ✅ Админ панель
- ✅ Автоматическая синхронизация

**Ссылки:**
- Игра: `http://localhost/solana-tamagotchi/index.html`
- Админка: `http://localhost/solana-tamagotchi/admin.html`
- phpMyAdmin: `http://localhost/phpmyadmin`

---

**Made with ❤️ for Solana Tamagotchi V3**




