# 🔄 TAMA Recalculation Guide

## Проблема
Раньше все пользователи получали фиксированные 500 TAMA при минте, независимо от фазы. Теперь нужно пересчитать TAMA согласно правильным фазам.

## Решение

### 1. Открой Database Viewer
Перейди на: `https://tr1h.github.io/solana-tamagotchi-v3/database-viewer.html`

### 2. Загрузи скрипт пересчета
В консоли браузера (F12) выполни:

```javascript
// Загрузить скрипт
const script = document.createElement('script');
script.src = 'https://tr1h.github.io/solana-tamagotchi-v3/recalculate-tama.js';
document.head.appendChild(script);
```

### 3. Проверь текущее распределение
```javascript
TAMARecalculation.showTAMADistribution();
```

### 4. Запусти пересчет
```javascript
TAMARecalculation.recalculateAllTAMA();
```

## Что делает скрипт

### 📊 Анализ данных
1. **Получает все NFT минты** из таблицы `nft_mints` (по времени создания)
2. **Получает всех игроков** из таблицы `leaderboard`
3. **Определяет порядок минта** для каждого кошелька

### 🎯 Определение фазы
- **Минт #1-100**: Phase 1 → 600 TAMA
- **Минт #101-500**: Phase 2 → 500 TAMA  
- **Минт #501-1000**: Phase 3 → 500 TAMA
- **Минт #1001+**: Phase 4 → 500 TAMA

### 🔄 Обновление TAMA
1. **Сравнивает** текущий TAMA с правильным
2. **Обновляет** в базе данных
3. **Показывает статистику** изменений

## Пример вывода

```
🔄 Starting TAMA recalculation...
📊 Found 25 NFT mints
👥 Found 25 players

🔄 Updating Ars7...yDHE...
   Mint Order: 1 (Phase 1)
   Current TAMA: 500 → Correct TAMA: 600
   Difference: +100
✅ Updated successfully

🔄 Updating 3aMp...pqxU...
   Mint Order: 2 (Phase 1)  
   Current TAMA: 500 → Correct TAMA: 600
   Difference: +100
✅ Updated successfully

🎉 TAMA recalculation completed!
📊 Updated 15 players
💰 Total TAMA difference: +1500
```

## Безопасность

- ✅ **Только чтение** существующих данных
- ✅ **Проверка** перед обновлением
- ✅ **Логирование** всех изменений
- ✅ **Обработка ошибок**

## После пересчета

1. **Проверь** новое распределение:
   ```javascript
   TAMARecalculation.showTAMADistribution();
   ```

2. **Обнови** страницу database viewer

3. **Убедись**, что TAMA отображается правильно

## Важно

- 🚨 **Запускай только один раз**
- 🚨 **Не закрывай браузер** во время выполнения
- 🚨 **Проверь результат** после завершения

