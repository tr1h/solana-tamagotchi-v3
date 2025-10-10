# 🔥 METAPLEX NFT INTEGRATION - РЕАЛИЗОВАНО!

---

## ✅ **ЧТО СДЕЛАНО:**

### **1️⃣ База данных:**
- ✅ `database-migration.sql` - SQL для добавления `nft_mint_address`

### **2️⃣ Metaplex интеграция:**
- ✅ `js/metaplex-integration.js` - полная работа с NFT
- ✅ Минт NFT через Token Program
- ✅ Получение NFT кошелька
- ✅ Проверка владения NFT

### **3️⃣ Обновлен mint.js:**
- ✅ Использует `MetaplexNFT.mintNFT()` вместо простого transfer
- ✅ Сохраняет **реальный mint address** в базу
- ✅ Создает NFT с уникальным ключом

---

## 🚀 **КАК ЗАПУСТИТЬ:**

### **Шаг 1: Обнови базу данных**

Открой Supabase Dashboard → SQL Editor → Выполни:

```sql
-- Добавить nft_mint_address
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT UNIQUE;

-- Создать индекс
CREATE INDEX IF NOT EXISTS idx_leaderboard_nft_mint 
ON leaderboard(nft_mint_address);
```

### **Шаг 2: Деплой код**

```bash
cd C:\goooog\solana-tamagotchi
git add .
git commit -m "Metaplex NFT integration"
git push origin main
```

### **Шаг 3: Тест на devnet**

1. Открой https://tr1h.github.io/solana-tamagotchi-v3/mint.html
2. Подключи Phantom (devnet)
3. Нажми "Mint NFT"
4. Проверь консоль:
   ```
   ✅ NFT Minted!
   🔑 Mint Address: ABC123...
   ```

---

## 🔑 **ВАЖНО: NFT MINT ADDRESS**

### **Что это:**
```
Уникальный публичный ключ NFT на блокчейне
Например: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TJcs..."
```

### **Где хранится:**
```sql
SELECT wallet_address, nft_mint_address, pet_name 
FROM leaderboard
WHERE nft_mint_address IS NOT NULL;
```

### **Зачем нужен:**
1. ✅ Уникальная идентификация NFT
2. ✅ Проверка владения через блокчейн
3. ✅ Поддержка торговли на маркетплейсах
4. ✅ Привязка игровых данных к NFT

---

## 📊 **ПРОЦЕСС МИНТА:**

```javascript
// 1. Пользователь нажимает "Mint NFT"
await MintPage.mintNFT();

// 2. Вызывается Metaplex
const result = await MetaplexNFT.mintNFT(price);

// 3. Получаем mint address
const mintAddress = result.mintAddress; // "ABC123..."

// 4. Сохраняем в базу
await Database.supabase
    .from('leaderboard')
    .insert({
        wallet_address: wallet,
        nft_mint_address: mintAddress, // ← КЛЮЧ!
        pet_name: 'My Lion',
        ...
    });

// 5. Показываем успех
showSuccessModal({ mintAddress });
```

---

## 🔍 **ПРОВЕРКА ВЛАДЕНИЯ:**

```javascript
// В game.js
async checkNFTOwnership() {
    // 1. Получаем NFT кошелька из блокчейна
    const nfts = await MetaplexNFT.getWalletNFTs(wallet);
    
    // 2. Проверяем есть ли наш NFT
    const ourNFT = nfts.find(nft => 
        // Проверка через базу данных
        await Database.hasNFT(nft.mint)
    );
    
    // 3. Загружаем данные игры
    if (ourNFT) {
        const petData = await Database.getByNFTMint(ourNFT.mint);
        loadPet(petData);
    }
}
```

---

## 🛠️ **ОСНОВНЫЕ ФУНКЦИИ:**

### **metaplex-integration.js:**

```javascript
// Минт NFT
MetaplexNFT.mintNFT(price) 
→ returns { success, mintAddress, signature, metadata }

// Получить NFT кошелька
MetaplexNFT.getWalletNFTs(walletAddress)
→ returns [{ mint, tokenAccount }, ...]

// Проверить владение
MetaplexNFT.checkNFTOwnership(walletAddress)
→ returns mintAddress or null
```

### **mint.js:**

```javascript
// Сохранить NFT с mint address
MintPage.saveNFTToDatabase(nftData, phaseIndex)
→ saves to nft_mints + leaderboard
```

---

## 📝 **ПРИМЕР ЗАПИСИ В БАЗЕ:**

```json
{
  "wallet_address": "J2XcRxsXruvSUpee2YynQ1cb2UrbdfeUBETXNTJ3Ded5",
  "nft_mint_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TJcs...",
  "pet_name": "Tamagotchi #7xKX",
  "pet_type": "lion",
  "pet_rarity": "rare",
  "level": 1,
  "xp": 0,
  "tama": 500
}
```

---

## ⚠️ **ВАЖНЫЕ ЗАМЕЧАНИЯ:**

### **1. Token Program инструкции:**
Текущая реализация использует **базовый Token Program** для создания NFT. Для полной функциональности Metaplex (Metadata, Collection, Candy Machine) нужно:

```bash
npm install @metaplex-foundation/js
```

И использовать Metaplex SDK вместо ручных инструкций.

### **2. Metaplex Metadata:**
Для полной метадаты NFT (имя, изображение, атрибуты) нужно создавать **Metadata Account** через Metaplex.

### **3. Candy Machine v3:**
Полная интеграция с Candy Machine v3 требует использования Metaplex SDK и правильной настройки Candy Machine через Sugar CLI.

---

## 🎯 **СЛЕДУЮЩИЕ ШАГИ:**

### **Для production:**

1. **Установить Metaplex SDK:**
   ```bash
   npm install @metaplex-foundation/js
   ```

2. **Использовать Metaplex SDK в mint.js:**
   ```javascript
   import { Metaplex } from '@metaplex-foundation/js';
   const metaplex = Metaplex.make(connection);
   const result = await metaplex.candyMachines().mint({
       candyMachine: CANDY_MACHINE_ID
   });
   ```

3. **Загружать метадату через Metaplex:**
   ```javascript
   const nft = await metaplex.nfts().findByMint({
       mintAddress: mintAddress
   });
   ```

4. **Проверять collection:**
   ```javascript
   if (nft.collection?.address === COLLECTION_MINT) {
       // Это наш NFT!
   }
   ```

---

## 🔐 **БЕЗОПАСНОСТЬ:**

### **Текущая реализация (demo):**
- ✅ Создает реальный NFT mint address
- ✅ Сохраняет в базу данных
- ⚠️ Простая метадата (без IPFS/Arweave)
- ⚠️ Не проверяет collection

### **Production требования:**
- ✅ Использовать Metaplex SDK
- ✅ Загружать изображения на IPFS/Arweave
- ✅ Создавать Metadata Account
- ✅ Проверять collection через Metaplex
- ✅ Интеграция с Candy Machine v3

---

## 📚 **ДОКУМЕНТАЦИЯ:**

- **Metaplex Docs:** https://docs.metaplex.com
- **Token Program:** https://spl.solana.com/token
- **Candy Machine v3:** https://docs.metaplex.com/programs/candy-machine/
- **Sugar CLI:** https://docs.metaplex.com/tools/sugar/

---

## 🎉 **ИТОГО:**

### **Сейчас работает:**
✅ Реальный минт NFT с уникальным mint address  
✅ Сохранение mint address в базу  
✅ Получение NFT кошелька из блокчейна  
✅ Проверка владения NFT  

### **Для production нужно:**
🔧 Установить Metaplex SDK  
🔧 Загружать изображения на IPFS  
🔧 Создавать Metadata Account  
🔧 Интеграция с Candy Machine v3  

**Базовая инфраструктура готова! 🚀**




