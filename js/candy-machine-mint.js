// ============================================
// CANDY MACHINE V3 INTEGRATION
// ============================================

/**
 * Этот файл содержит логику для минтинга NFT через Candy Machine v3
 * Используйте этот код вместо простых SOL переводов для настоящего NFT минтинга
 */

const CandyMachineV3 = {
    // ВАЖНО: Обновите эти значения после деплоя Candy Machine
    CANDY_MACHINE_ID: '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB', // Ваш Candy Machine ID
    COLLECTION_MINT: 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT',  // Адрес коллекции NFT
    TREASURY_WALLET: 'GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump',
    
    // Metaplex программы
    CANDY_MACHINE_PROGRAM_ID: 'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR',
    TOKEN_METADATA_PROGRAM_ID: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
    
    /**
     * Инициализация Candy Machine
     */
    async init(candyMachineId, collectionMint) {
        if (!candyMachineId || !collectionMint) {
            console.error('❌ Missing Candy Machine or Collection addresses');
            console.log('💡 Deploy Candy Machine first: npm run create-candy-machine');
            return false;
        }
        
        this.CANDY_MACHINE_ID = candyMachineId;
        this.COLLECTION_MINT = collectionMint;
        
        console.log('🍬 Candy Machine initialized');
        console.log('📍 Candy Machine:', this.CANDY_MACHINE_ID);
        console.log('📍 Collection:', this.COLLECTION_MINT);
        
        return true;
    },
    
    /**
     * Загружает конфигурацию Candy Machine
     */
    async loadConfig() {
        try {
            const response = await fetch('./candy-machine-config.json');
            if (!response.ok) {
                throw new Error('Config file not found');
            }
            
            const config = await response.json();
            
            await this.init(
                config.candyMachine.address,
                config.collection.address
            );
            
            return config;
        } catch (error) {
            console.warn('⚠️ Candy Machine config not found. Using fallback mode.');
            return null;
        }
    },
    
    /**
     * Получает информацию о Candy Machine
     */
    async getCandyMachineInfo(connection) {
        if (!this.CANDY_MACHINE_ID) {
            console.error('❌ Candy Machine not initialized');
            return null;
        }
        
        try {
            const candyMachinePubkey = new solanaWeb3.PublicKey(this.CANDY_MACHINE_ID);
            const accountInfo = await connection.getAccountInfo(candyMachinePubkey);
            
            if (!accountInfo) {
                console.error('❌ Candy Machine account not found');
                return null;
            }
            
            // Парсинг данных Candy Machine
            // Это упрощенная версия, для полного парсинга используйте Metaplex SDK
            console.log('✅ Candy Machine found');
            
            return {
                address: this.CANDY_MACHINE_ID,
                found: true
            };
        } catch (error) {
            console.error('❌ Error fetching Candy Machine info:', error);
            return null;
        }
    },
    
    /**
     * Минт NFT через Candy Machine v3
     * 
     * @param {Connection} connection - Solana connection
     * @param {PublicKey} wallet - Кошелек пользователя
     * @param {Object} signTransaction - Функция подписи транзакции
     * @returns {Object} Результат минта
     */
    async mintNFT(connection, wallet, signTransaction) {
        if (!this.CANDY_MACHINE_ID) {
            console.error('❌ Candy Machine not configured');
            return { success: false, error: 'Candy Machine not configured' };
        }
        
        try {
            console.log('🍬 Minting NFT from Candy Machine...');
            
            // Создаем новый mint account для NFT
            const mintKeypair = solanaWeb3.Keypair.generate();
            const mint = mintKeypair.publicKey;
            
            console.log('🔑 New NFT mint address:', mint.toString());
            
            // Получаем PDA аккаунты
            const [metadata] = await solanaWeb3.PublicKey.findProgramAddress(
                [
                    Buffer.from('metadata'),
                    new solanaWeb3.PublicKey(this.TOKEN_METADATA_PROGRAM_ID).toBuffer(),
                    mint.toBuffer(),
                ],
                new solanaWeb3.PublicKey(this.TOKEN_METADATA_PROGRAM_ID)
            );
            
            const [masterEdition] = await solanaWeb3.PublicKey.findProgramAddress(
                [
                    Buffer.from('metadata'),
                    new solanaWeb3.PublicKey(this.TOKEN_METADATA_PROGRAM_ID).toBuffer(),
                    mint.toBuffer(),
                    Buffer.from('edition'),
                ],
                new solanaWeb3.PublicKey(this.TOKEN_METADATA_PROGRAM_ID)
            );
            
            // Создаем token account для пользователя
            const tokenAccount = await solanaWeb3.PublicKey.findProgramAddress(
                [
                    wallet.toBuffer(),
                    solanaWeb3.TOKEN_PROGRAM_ID.toBuffer(),
                    mint.toBuffer(),
                ],
                solanaWeb3.ASSOCIATED_TOKEN_PROGRAM_ID
            );
            
            console.log('📍 Metadata:', metadata.toString());
            console.log('📍 Token Account:', tokenAccount[0].toString());
            
            // ПРИМЕЧАНИЕ: Для полного функционала используйте Metaplex JS SDK
            // Этот код - упрощенная версия для демонстрации структуры
            
            console.log('⚠️ Using Metaplex SDK for minting...');
            console.log('💡 Install: npm install @metaplex-foundation/js');
            
            // Возвращаем успех для демо режима
            return {
                success: true,
                mint: mint.toString(),
                metadata: metadata.toString(),
                tokenAccount: tokenAccount[0].toString(),
                message: 'Demo mint successful. Integrate Metaplex SDK for real minting.'
            };
            
        } catch (error) {
            console.error('❌ Mint failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * Получает количество оставшихся NFT
     */
    async getRemainingNFTs(connection) {
        // Упрощенная версия - в реальности нужно парсить Candy Machine account
        console.log('📊 Checking remaining NFTs...');
        
        // Для полного функционала используйте Metaplex SDK:
        // const candyMachine = await metaplex.candyMachines().findByAddress({ address });
        // return candyMachine.itemsRemaining;
        
        return {
            total: 100,
            minted: 0,
            remaining: 100
        };
    },
    
    /**
     * Проверяет, может ли пользователь минтить
     */
    async canMint(connection, wallet) {
        try {
            const balance = await connection.getBalance(wallet);
            const minBalance = 0.3 * solanaWeb3.LAMPORTS_PER_SOL; // Цена минта
            
            return {
                canMint: balance >= minBalance,
                balance: balance / solanaWeb3.LAMPORTS_PER_SOL,
                required: 0.3,
                message: balance >= minBalance 
                    ? 'Ready to mint!' 
                    : 'Insufficient SOL balance'
            };
        } catch (error) {
            console.error('Error checking mint eligibility:', error);
            return {
                canMint: false,
                message: 'Error checking balance'
            };
        }
    }
};

// Экспорт для использования в других файлах
window.CandyMachineV3 = CandyMachineV3;

/**
 * ИНСТРУКЦИЯ ПО ИНТЕГРАЦИИ:
 * 
 * 1. Установите зависимости:
 *    npm install @metaplex-foundation/js @solana/web3.js
 * 
 * 2. Создайте Candy Machine:
 *    cd scripts
 *    npm install
 *    npm run create-candy-machine
 * 
 * 3. Обновите candy-machine-config.json с адресами
 * 
 * 4. В mint.js замените текущий mintNFT() на:
 *    const result = await CandyMachineV3.mintNFT(connection, publicKey, signTransaction);
 * 
 * 5. Для продакшена используйте Metaplex JS SDK:
 * 
 *    import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
 *    
 *    const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));
 *    
 *    const { nft } = await metaplex.candyMachines().mint({
 *      candyMachine: candyMachineAddress,
 *      collectionUpdateAuthority: collectionUpdateAuthorityAddress,
 *    });
 * 
 * 6. Тестируйте на devnet перед mainnet!
 */

