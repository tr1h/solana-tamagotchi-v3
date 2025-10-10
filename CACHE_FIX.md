# 🧹 КАК ОЧИСТИТЬ КЕШ И ИСПРАВИТЬ РЕДИРЕКТЫ

---

## ❌ **ПРОБЛЕМА:**

Кнопка "Mint NFT" ведёт на `http://gotchigame.com/mint.html` (несуществующий домен).

---

## 🔍 **ПРИЧИНЫ:**

1. ❌ **Кеш браузера** - старые версии файлов
2. ❌ **Кеш GitHub Pages** - старые версии на сервере (до 10 минут)
3. ❌ **DNS кеш** - старые DNS записи

---

## ✅ **РЕШЕНИЯ:**

### **1️⃣ ОЧИСТИ КЕШ БРАУЗЕРА (САМОЕ ВАЖНОЕ):**

#### **Chrome/Edge:**
```
1. Нажми Ctrl + Shift + Delete
2. Выбери:
   ✅ Кешированные изображения и файлы
   ✅ Файлы cookie
3. Период: "Всё время"
4. Нажми "Удалить данные"
```

#### **Firefox:**
```
1. Нажми Ctrl + Shift + Delete
2. Выбери:
   ✅ Кеш
   ✅ Куки
3. Период: "Всё"
4. Нажми "Удалить сейчас"
```

#### **Safari:**
```
1. Safari → Настройки → Дополнения
2. ✅ Показывать меню "Разработка"
3. Разработка → Очистить кеш
```

---

### **2️⃣ ЖЁСТКАЯ ПЕРЕЗАГРУЗКА СТРАНИЦЫ:**

#### **Windows:**
```
Ctrl + Shift + R
или
Ctrl + F5
```

#### **Mac:**
```
Cmd + Shift + R
```

---

### **3️⃣ INCOGNITO/PRIVATE РЕЖИМ:**

#### **Chrome/Edge:**
```
Ctrl + Shift + N
```

#### **Firefox:**
```
Ctrl + Shift + P
```

Затем открой:
```
https://tr1h.github.io/solana-tamagotchi-v3
```

---

### **4️⃣ ДРУГОЙ БРАУЗЕР:**

Если используешь Chrome, попробуй:
- **Firefox**
- **Edge**
- **Brave**

---

### **5️⃣ ОЧИСТИ DNS КЕШ:**

#### **Windows:**
```powershell
ipconfig /flushdns
```

#### **Mac:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

#### **Linux:**
```bash
sudo systemd-resolve --flush-caches
```

---

## ⏰ **ПОДОЖДИ:**

GitHub Pages кеш обновляется **каждые 10 минут**.

Если изменения не появились сразу:
1. ✅ Подожди **5-10 минут**
2. ✅ Очисти кеш браузера
3. ✅ Ctrl + Shift + R

---

## 🔍 **ПРОВЕРЬ ТЕКУЩУЮ ВЕРСИЮ:**

### **В браузере (F12 → Console):**
```javascript
// Проверь содержимое кнопки
const mintBtn = document.querySelector('a[href*="mint"]');
console.log(mintBtn?.href);

// Должно быть:
// "https://tr1h.github.io/solana-tamagotchi-v3/mint.html"
```

---

## 🎯 **ПРАВИЛЬНЫЕ ССЫЛКИ:**

### **Главная страница:**
```
https://tr1h.github.io/solana-tamagotchi-v3
```

### **Mint страница:**
```
https://tr1h.github.io/solana-tamagotchi-v3/mint.html
```

### **НЕ gotchigame.com** (домен не куплен!)

---

## ✅ **ПОСЛЕ ИСПРАВЛЕНИЯ:**

1. ✅ Очисти кеш браузера
2. ✅ Жёсткая перезагрузка (Ctrl + Shift + R)
3. ✅ Зайди на сайт
4. ✅ Подключи кошелёк
5. ✅ Нажми "Mint NFT"
6. ✅ Должен открыться: `https://tr1h.github.io/solana-tamagotchi-v3/mint.html` ✅

---

## 🆘 **ЕСЛИ НЕ ПОМОГЛО:**

1. Сделай скриншот F12 → Network tab
2. Проверь какой файл `index.html` загружается
3. Посмотри его содержимое
4. Поделись в чате

---

## 📝 **ИТОГО:**

**Проблема:** Кеш браузера/GitHub Pages  
**Решение:** Ctrl + Shift + Delete + Ctrl + Shift + R  
**Время:** 2-10 минут  

**Все ссылки в коде уже исправлены!** ✅




