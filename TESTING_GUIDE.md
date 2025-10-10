# 🧪 Руководство по тестированию

## Полный флоу: Минт → Игра → Сохранение

### 📋 Чек-лист перед тестированием

#### 1. База данных Supabase
- [ ] Выполнен `SUPABASE_SETUP.sql`
- [ ] Выполнен `SUPABASE_NFT_MINTS.sql`
- [ ] Выполнен `database-migration-add-mint-address.sql`
- [ ] RLS политики включены
- [ ] Таблицы созданы: `leaderboard`, `referrals`, `nft_mints`

#### 2. Candy Machine
- [ ] Candy Machine развернута на devnet
- [ ] ID в `candy-machine-config.json`
- [ ] ID совпадает с `umi-candy-machine.js` (строка 7)
- [ ] Collection mint настроен

#### 3. Файлы подключены
- [ ] `mint.html` загружает Umi SDK
- [ ] `index.html` загружает Umi SDK
- [ ] `umi-candy-machine.js` загружен
- [ ] База данных инициализирована

---

## 🚀 Процедура тестирования

### Шаг 1: Подготовка

```bash
# 1. Запусти локальный сервер (важно для CORS)
cd solana-tamagotchi
python -m http.server 8000
# ИЛИ
npx serve
```

```bash
# 2. Получи devnet SOL в кошелёк
# Вариант A: Через faucet
# https://faucet.solana.com

# Вариант B: Через CLI
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

### Шаг 2: Тест минта NFT

1. **Открой mint страницу**
   - http://localhost:8000/mint.html

2. **Подключи Phantom**
   - Кликни "Connect Wallet"
   - Убедись что на devnet
   - Баланс > 0.3 SOL

3. **Минт NFT**
   - Кликни "MINT NOW"
   - Подтверди транзакцию
   - Дождись success modal
   - Проверь консоль на ошибки

4. **Проверка минта**
   ```
   Консоль должна показать:
   ✅ NFT MINTED SUCCESSFULLY!
   📝 Signature: <TX_ID>
   🎨 NFT Mint Address: <MINT_ADDRESS>
   ```

5. **Проверка в Phantom**
   - Открой Phantom → NFTs
   - NFT должен появиться (может занять 30 сек)
   - Проверь metadata

6. **Проверка в Explorer**
   ```
   https://explorer.solana.com/address/<MINT_ADDRESS>?cluster=devnet
   ```

7. **Проверка в базе данных**
   - Открой Supabase → Table Editor
   - Таблица `nft_mints` → новая запись
   - `nft_mint_address` должен быть заполнен
   - Таблица `leaderboard` → обновлено

### Шаг 3: Тест доступа к игре

1. **Переход в игру**
   - http://localhost:8000/index.html
   - Подключи кошелёк

2. **Проверка владения NFT**
   ```
   Консоль должна показать:
   🔍 Checking NFT ownership...
   ✅ NFT found in database, showing game
   ИЛИ
   ✅ NFT found on blockchain!
   ```

3. **Игра загрузилась**
   - Pet отображается
   - Данные из NFT загружены
   - Тип, rarity совпадают с минтом

### Шаг 4: Тест сохранения

1. **Действия в игре**
   - Покорми питомца
   - Поиграй с ним
   - Заработай XP

2. **Проверка автосохранения**
   ```
   Консоль каждые 30 сек:
   💾 Auto-saving pet data...
   ✅ Pet data saved successfully
   ```

3. **Проверка в базе**
   - Supabase → `leaderboard`
   - `pet_data` обновлён
   - `xp`, `level`, `tama` изменились

4. **Тест reload**
   - F5 (обновить страницу)
   - Подключи кошелёк снова
   - Pet загрузился с сохранённым прогрессом

### Шаг 5: Тест без NFT

1. **Новый кошелёк**
   - Создай новый Phantom аккаунт
   - Подключись к игре

2. **Проверка блокировки**
   ```
   Консоль:
   ❌ No NFT found, redirecting to mint
   ```

3. **Редирект на минт**
   - Должен показать "NFT Required" modal
   - Кнопка "Mint NFT" работает

---

## 🐛 Частые ошибки и решения

### Ошибка: "Umi not initialized"
**Решение:**
- Проверь что Umi SDK загружен в HTML
- Открой DevTools → Network → поищи umi
- Проверь консоль на ошибки загрузки

### Ошибка: "Insufficient funds"
**Решение:**
```bash
solana airdrop 1 --url devnet
```

### Ошибка: "Candy Machine not found"
**Решение:**
- Проверь ID в `umi-candy-machine.js`
- Убедись что CM на devnet
```bash
sugar show --url devnet
```

### Ошибка: NFT не появляется в Phantom
**Причины:**
1. Минт не завершился (проверь TX в explorer)
2. Phantom не обновился (переключи network туда-сюда)
3. Metadata не загружена (нормально для devnet)

### Ошибка: Database error
**Решение:**
- Проверь Supabase API key
- Проверь RLS политики (должны быть PUBLIC)
- Проверь что таблицы созданы

---

## ✅ Критерии успешного теста

### Минт
- ✅ Transaction confirmed
- ✅ NFT mint address создан
- ✅ NFT виден в Phantom (devnet)
- ✅ Запись в `nft_mints` таблице
- ✅ `nft_mint_address` сохранён

### Доступ к игре  
- ✅ NFT ownership проверен
- ✅ Pet загружен с правильным типом
- ✅ Rarity совпадает
- ✅ TAMA bonus начислен

### Сохранение
- ✅ Автосохранение работает
- ✅ Pet data в базе обновляется
- ✅ После reload прогресс сохранён
- ✅ Leaderboard показывает актуальные данные

### Без NFT
- ✅ Доступ заблокирован
- ✅ Modal "NFT Required" показан
- ✅ Кнопка "Mint" работает

---

## 📊 Мониторинг

### DevTools Console
```
Хорошие логи:
✅ Umi initialized
✅ Candy Machine plugin registered
✅ Wallet adapter connected
✅ NFT MINTED SUCCESSFULLY!
✅ NFT ownership confirmed
✅ Pet data saved

Плохие логи:
❌ Failed to initialize Umi
❌ Candy Machine not found
❌ Mint failed
❌ No NFT found
```

### Supabase Dashboard
- Realtime subscriptions работают
- Таблицы наполняются данными
- Errors log пустой

### Solana Explorer
```
https://explorer.solana.com/address/<MINT_ADDRESS>?cluster=devnet
```
- Token Account создан
- Metadata Program вызван
- Collection verified

---

## 🎯 Финальный чеклист запуска

### Pre-deploy
- [ ] Все тесты пройдены
- [ ] Ошибок в консоли нет
- [ ] База данных настроена
- [ ] Candy Machine работает
- [ ] NFT минтятся корректно

### Deploy на GitHub Pages
- [ ] Обнови Supabase URL (если production)
- [ ] Проверь CORS настройки
- [ ] Протестируй на production домене

### Mainnet готовность
- [ ] Смени devnet на mainnet
- [ ] Загрузи реальные изображения на Arweave
- [ ] Обнови Candy Machine цены
- [ ] Протестируй с малым SOL

---

## 🚨 Emergency contacts

Если что-то сломалось:

1. **Проверь консоль** - 90% проблем там
2. **Проверь Supabase** - база доступна?
3. **Проверь Candy Machine** - существует на devnet?
4. **Проверь wallet** - есть SOL?

Если всё ещё не работает - напиши в Telegram: https://t.me/solana_tamagotchi


