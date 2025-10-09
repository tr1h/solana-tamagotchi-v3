# 🏗️ NFT ARCHITECTURE - ПРАВИЛЬНАЯ ПРИВЯЗКА

---

## ❌ **ТЕКУЩАЯ ПРОБЛЕМА:**

### **Что не так:**
```javascript
// mint.js - строка 407
name: `My Lion` // ← ВСЕГДА ОДИНАКОВОЕ ИМЯ!
```

**Проблема:** Рандомная генерация вместо использования **реального NFT mint address**.

### **Почему это плохо:**
1. ❌ **Нет уникального ключа** NFT
2. ❌ **Невозможно проверить владение** реальным NFT
3. ❌ **Легко подделать** (просто изменить localStorage)
4. ❌ **Не работает с вторичным рынком** (перепродажа NFT)

---

## ✅ **ПРАВИЛЬНАЯ АРХИТЕКТУРА:**

### **Как должно быть:**

```
1. Пользователь → Минт NFT через Candy Machine
2. Получаем MINT ADDRESS (уникальный ключ NFT)
3. Сохраняем в базу: wallet + nft_mint_address
4. При входе: проверяем владение NFT через блокчейн
5. Загружаем данные игры по nft_mint_address
```

---

## 🗄️ **БАЗА ДАННЫХ:**

### **Новая структура таблицы `leaderboard`:**

```sql
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    
    -- Wallet & NFT (уникальная привязка)
    wallet_address TEXT NOT NULL,
    nft_mint_address TEXT UNIQUE, -- ← КЛЮЧ NFT!
    
    -- Pet Data
    pet_name TEXT,
    pet_type TEXT,
    pet_rarity TEXT,
    
    -- Game Stats
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    tama INTEGER DEFAULT 500,
    
    -- Pet State (JSONB)
    pet_data JSONB,
    
    -- Telegram
    telegram_id TEXT,
    telegram_username TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(wallet_address, nft_mint_address)
);
```

### **Новая таблица `nft_mints` (история минтов):**

```sql
CREATE TABLE nft_mints (
    id SERIAL PRIMARY KEY,
    
    -- NFT Info
    nft_mint_address TEXT UNIQUE NOT NULL, -- ← КЛЮЧ NFT!
    wallet_address TEXT NOT NULL,
    
    -- Mint Details
    nft_name TEXT,
    nft_image TEXT,
    nft_type TEXT,
    nft_rarity TEXT,
    nft_metadata JSONB,
    
    -- Pricing
    mint_price DECIMAL,
    mint_phase INTEGER,
    
    -- Timestamps
    minted_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 **КОД ИСПРАВЛЕНИЙ:**

### **1️⃣ mint.js - Правильный минт:**

```javascript
async mintNFT() {
    console.log('🚀 Starting NFT mint...');
    
    const mintBtn = document.getElementById('mint-btn');
    mintBtn.disabled = true;
    
    try {
        // Проверка Candy Machine
        if (!window.CandyMachineV3 || !window.CandyMachineV3.CANDY_MACHINE_ID) {
            throw new Error('Candy Machine not configured');
        }
        
        // Создаем транзакцию минта через Candy Machine
        const candyMachineId = new solanaWeb3.PublicKey(
            window.CandyMachineV3.CANDY_MACHINE_ID
        );
        
        // Получаем текущую цену
        const price = this.getCurrentPrice();
        
        // Создаем новый mint account (это будет адрес NFT)
        const mintKeypair = solanaWeb3.Keypair.generate();
        const nftMintAddress = mintKeypair.publicKey.toString();
        
        console.log('🔑 NFT Mint Address:', nftMintAddress);
        
        // Создаем транзакцию минта
        // (здесь нужна полная интеграция с Metaplex SDK)
        const transaction = new solanaWeb3.Transaction();
        // ... добавляем инструкции минта
        
        // Отправляем транзакцию
        const signature = await this.wallet.signAndSendTransaction(transaction);
        
        console.log('✅ Mint successful!', signature);
        
        // Загружаем метадату NFT
        const metadata = await this.loadNFTMetadata(nftMintAddress);
        
        // Сохраняем в базу данных
        await this.saveNFTToDB({
            nft_mint_address: nftMintAddress,
            wallet_address: this.publicKey.toString(),
            nft_name: metadata.name,
            nft_image: metadata.image,
            nft_type: this.extractType(metadata.attributes),
            nft_rarity: this.extractRarity(metadata.attributes),
            mint_price: price
        });
        
        // Показываем успех
        this.showSuccessModal({
            mint_address: nftMintAddress,
            name: metadata.name,
            image: metadata.image
        });
        
    } catch (error) {
        console.error('❌ Mint failed:', error);
        alert('Mint failed: ' + error.message);
    } finally {
        mintBtn.disabled = false;
    }
}

async saveNFTToDB(nftData) {
    try {
        // Сохраняем в nft_mints
        const { data: mintData, error: mintError } = await window.Database.supabase
            .from('nft_mints')
            .insert({
                nft_mint_address: nftData.nft_mint_address,
                wallet_address: nftData.wallet_address,
                nft_name: nftData.nft_name,
                nft_image: nftData.nft_image,
                nft_type: nftData.nft_type,
                nft_rarity: nftData.nft_rarity,
                mint_price: nftData.mint_price
            });
        
        if (mintError) throw mintError;
        
        // Создаем запись в leaderboard
        const { data: leaderData, error: leaderError } = await window.Database.supabase
            .from('leaderboard')
            .insert({
                wallet_address: nftData.wallet_address,
                nft_mint_address: nftData.nft_mint_address,
                pet_name: nftData.nft_name,
                pet_type: nftData.nft_type,
                pet_rarity: nftData.nft_rarity,
                level: 1,
                xp: 0,
                tama: 500
            });
        
        if (leaderError) throw leaderError;
        
        console.log('✅ NFT saved to database');
    } catch (error) {
        console.error('❌ Failed to save NFT:', error);
    }
}
```

### **2️⃣ game.js - Правильная проверка владения:**

```javascript
async checkNFTOwnership() {
    console.log('🔍 Checking NFT ownership...');
    
    if (!WalletManager.publicKey) {
        console.log('❌ No wallet connected');
        return false;
    }
    
    const wallet = WalletManager.publicKey.toString();
    
    try {
        // ВАРИАНТ A: Проверка через блокчейн (правильно)
        const nfts = await this.getWalletNFTs(wallet);
        
        // Ищем NFT из нашей коллекции
        const ourNFT = nfts.find(nft => 
            nft.collection?.address === window.CandyMachineV3.COLLECTION_MINT
        );
        
        if (ourNFT) {
            console.log('✅ NFT found in wallet:', ourNFT.address);
            
            // Загружаем данные игры по mint address
            const { data } = await window.Database.supabase
                .from('leaderboard')
                .select('*')
                .eq('nft_mint_address', ourNFT.address.toString())
                .single();
            
            if (data) {
                console.log('✅ Game data found for NFT');
                this.loadPetData(data);
                return true;
            } else {
                console.log('⚠️ NFT found but no game data. Creating new pet...');
                await this.createPetForNFT(ourNFT);
                return true;
            }
        }
        
        // ВАРИАНТ B: Проверка через базу (fallback)
        const { data } = await window.Database.supabase
            .from('leaderboard')
            .select('*')
            .eq('wallet_address', wallet)
            .not('nft_mint_address', 'is', null)
            .single();
        
        if (data) {
            console.log('✅ NFT data found in database');
            this.loadPetData(data);
            return true;
        }
        
        // Нет NFT
        console.log('❌ No NFT found');
        this.showMintRequired();
        return false;
        
    } catch (error) {
        console.error('❌ Error checking NFT ownership:', error);
        this.showMintRequired();
        return false;
    }
}

async getWalletNFTs(walletAddress) {
    try {
        // Используем Metaplex для получения NFT
        const connection = new solanaWeb3.Connection(
            'https://api.devnet.solana.com'
        );
        
        // Получаем все токены кошелька
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            new solanaWeb3.PublicKey(walletAddress),
            { programId: solanaWeb3.TOKEN_PROGRAM_ID }
        );
        
        // Фильтруем NFT (amount = 1, decimals = 0)
        const nfts = tokenAccounts.value
            .filter(ta => {
                const amount = ta.account.data.parsed.info.tokenAmount;
                return amount.decimals === 0 && amount.uiAmount === 1;
            })
            .map(ta => ({
                address: ta.account.data.parsed.info.mint,
                tokenAccount: ta.pubkey.toString()
            }));
        
        return nfts;
    } catch (error) {
        console.error('Error getting wallet NFTs:', error);
        return [];
    }
}
```

---

## 🚀 **МИГРАЦИЯ:**

### **Шаг 1: Обновить базу данных**

```sql
-- Добавить колонку nft_mint_address
ALTER TABLE leaderboard 
ADD COLUMN nft_mint_address TEXT UNIQUE;

-- Создать таблицу nft_mints
CREATE TABLE nft_mints (
    id SERIAL PRIMARY KEY,
    nft_mint_address TEXT UNIQUE NOT NULL,
    wallet_address TEXT NOT NULL,
    nft_name TEXT,
    nft_type TEXT,
    nft_rarity TEXT,
    mint_price DECIMAL,
    minted_at TIMESTAMP DEFAULT NOW()
);
```

### **Шаг 2: Обновить код**
- ✅ `mint.js` - использовать реальный mint address
- ✅ `game.js` - проверять через блокчейн
- ✅ `database-supabase.js` - сохранять mint address

### **Шаг 3: Тестировать**
1. Минт NFT через Candy Machine
2. Проверить mint address в логах
3. Проверить запись в базе
4. Зайти в игру → должен загрузиться правильный NFT

---

## 💡 **ВРЕМЕННОЕ РЕШЕНИЕ (Demo mode):**

Если **Candy Machine еще не готов**, можно использовать **demo NFT IDs**:

```javascript
generateNFT() {
    // Генерируем УНИКАЛЬНЫЙ fake mint address
    const fakeMintAddress = `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        mint_address: fakeMintAddress, // ← УНИКАЛЬНЫЙ КЛЮЧ
        type: 'lion',
        emoji: '🦁',
        rarity: 'common',
        owner: this.publicKey.toString()
    };
}
```

Но это **НЕ БЕЗОПАСНО** для продакшена!

---

## 🎯 **ИТОГО:**

### **Текущая проблема:**
```
❌ Рандомная генерация → нет уникального ключа NFT
❌ Все питомцы "My Lion"
❌ Невозможно проверить реальное владение
```

### **Правильное решение:**
```
✅ Минт через Candy Machine → MINT ADDRESS
✅ Сохранение mint address в базу
✅ Проверка владения через блокчейн
✅ Уникальный ключ для каждого NFT
```

### **Следующие шаги:**
1. **Добавить `nft_mint_address` в базу**
2. **Интегрировать Metaplex SDK** для минта
3. **Обновить проверку владения** через блокчейн
4. **Тестировать на devnet**

**Нужна помощь с интеграцией Metaplex?** 🚀


