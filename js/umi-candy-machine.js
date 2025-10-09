// ============================================
// UMI CANDY MACHINE V3 - REAL MINT
// ============================================

const UmiCandyMachine = {
    // Твоя Candy Machine (из candy-machine-config.json)
    CANDY_MACHINE_ID: '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB',
    COLLECTION_MINT: 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT',
    
    umi: null,
    wallet: null,
    
    /**
     * Ждём загрузки Umi SDK
     */
    async waitForUmiSDK() {
        if (window.UmiLoader) {
            console.log('🔄 Using UmiLoader to load SDK...');
            return await window.UmiLoader.waitForUmiSDK();
        } else {
            // Fallback to old method
            const maxAttempts = 50; // 5 секунд максимум
            let attempts = 0;
            
            while (attempts < maxAttempts) {
                if (window['@metaplex-foundation/umi-bundle-defaults'] && 
                    window['@metaplex-foundation/mpl-candy-machine']) {
                    console.log('✅ Umi SDK loaded successfully');
                    return true;
                }
                
                console.log(`⏳ Waiting for Umi SDK... (${attempts + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            throw new Error('Umi SDK failed to load after 5 seconds');
        }
    },
    
    /**
     * Инициализация Umi
     */
    async init(wallet) {
        try {
            console.log('🚀 Initializing Umi for Candy Machine...');
            
            this.wallet = wallet;
            
            // Ждём загрузки Umi SDK
            await this.waitForUmiSDK();
            
            // Создаем Umi instance с devnet
            const { createUmi } = window['@metaplex-foundation/umi-bundle-defaults'];
            this.umi = createUmi('https://api.devnet.solana.com');
            
            console.log('✅ Umi initialized');
            
            // Регистрируем плагин Candy Machine
            const { mplCandyMachine } = window['@metaplex-foundation/mpl-candy-machine'];
            this.umi.use(mplCandyMachine());
            
            console.log('✅ Candy Machine plugin registered');
            
            // Создаем wallet adapter для Phantom
            const walletAdapter = this.createPhantomWalletAdapter(wallet);
            this.umi.use(walletAdapter);
            
            console.log('✅ Wallet adapter connected');
            console.log('🍬 Candy Machine ID:', this.CANDY_MACHINE_ID);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Umi:', error);
            return false;
        }
    },
    
    /**
     * Создаёт wallet adapter для Phantom
     */
    createPhantomWalletAdapter(phantomWallet) {
        const { walletAdapterIdentity } = window['@metaplex-foundation/umi'];
        const { publicKey } = window['@metaplex-foundation/umi'];
        
        // Конвертируем Phantom wallet в Umi wallet
        const umiWallet = {
            publicKey: publicKey(phantomWallet.publicKey.toString()),
            signMessage: async (message) => {
                const result = await phantomWallet.signMessage(message);
                return result.signature;
            },
            signTransaction: async (transaction) => {
                return await phantomWallet.signTransaction(transaction);
            },
            signAllTransactions: async (transactions) => {
                return await phantomWallet.signAllTransactions(transactions);
            }
        };
        
        return walletAdapterIdentity(umiWallet);
    },
    
    /**
     * РЕАЛЬНЫЙ МИНТ NFT через Candy Machine v3
     */
    async mintNFT() {
        if (!this.umi || !this.wallet) {
            throw new Error('Umi not initialized. Call init() first.');
        }
        
        try {
            console.log('🍬 Starting Candy Machine mint...');
            
            const { fetchCandyMachine, mintV2 } = window['@metaplex-foundation/mpl-candy-machine'];
            const { publicKey, generateSigner, transactionBuilder } = window['@metaplex-foundation/umi'];
            
            // 1. Загружаем Candy Machine
            const candyMachineId = publicKey(this.CANDY_MACHINE_ID);
            console.log('📥 Loading Candy Machine:', this.CANDY_MACHINE_ID);
            
            const candyMachine = await fetchCandyMachine(this.umi, candyMachineId);
            console.log('✅ Candy Machine loaded');
            console.log('📊 Items redeemed:', candyMachine.itemsRedeemed, '/', candyMachine.data.itemsAvailable);
            
            // 2. Создаём новый NFT mint
            const nftMint = generateSigner(this.umi);
            console.log('🔑 Generated NFT Mint:', nftMint.publicKey.toString());
            
            // 3. Создаём транзакцию минта
            console.log('📝 Creating mint transaction...');
            
            const mintBuilder = await transactionBuilder()
                .add(mintV2(this.umi, {
                    candyMachine: candyMachineId,
                    nftMint: nftMint,
                    collectionMint: publicKey(this.COLLECTION_MINT),
                    collectionUpdateAuthority: candyMachine.authority,
                    mintArgs: {
                        // Можно добавить mintArgs если нужно
                    }
                }));
            
            console.log('📤 Sending transaction...');
            
            // 4. Отправляем транзакцию
            const { signature } = await mintBuilder.sendAndConfirm(this.umi);
            
            console.log('✅ NFT MINTED SUCCESSFULLY!');
            console.log('📝 Signature:', signature);
            console.log('🎨 NFT Mint Address:', nftMint.publicKey.toString());
            
            // 5. Загружаем метадату NFT
            const metadata = await this.loadNFTMetadata(nftMint.publicKey.toString());
            
            return {
                success: true,
                mintAddress: nftMint.publicKey.toString(),
                signature: signature,
                metadata: metadata,
                explorerUrl: `https://explorer.solana.com/address/${nftMint.publicKey.toString()}?cluster=devnet`
            };
            
        } catch (error) {
            console.error('❌ Mint failed:', error);
            
            // Обработка ошибок
            if (error.message.includes('insufficient funds')) {
                throw new Error('Insufficient SOL balance. Get devnet SOL from faucet.');
            } else if (error.message.includes('already been processed')) {
                throw new Error('Transaction already processed. Check your wallet.');
            } else {
                throw error;
            }
        }
    },
    
    /**
     * Загружаем метадату NFT
     */
    async loadNFTMetadata(mintAddress) {
        try {
            console.log('📥 Loading NFT metadata for:', mintAddress);
            
            // Генерируем рандомную метадату для игры
            const types = ['cat', 'dog', 'dragon', 'fox', 'bear', 'rabbit', 'panda', 'lion', 'unicorn', 'wolf'];
            const emojis = ['🐱', '🐶', '🐉', '🦊', '🐻', '🐰', '🐼', '🦁', '🦄', '🐺'];
            const rarities = ['common', 'rare', 'epic', 'legendary'];
            
            // Рарити по вероятностям
            const rand = Math.random() * 100;
            let rarity;
            if (rand < 70) rarity = 'common';
            else if (rand < 90) rarity = 'rare';
            else if (rand < 98) rarity = 'epic';
            else rarity = 'legendary';
            
            // Рандомный тип
            const typeIndex = Math.floor(Math.random() * types.length);
            
            return {
                name: `Tamagotchi #${mintAddress.slice(0, 4)}`,
                symbol: 'TAMA',
                description: 'A unique Solana Tamagotchi NFT pet',
                image: `https://arweave.net/tamagotchi-${types[typeIndex]}.png`, // TODO: реальный URL
                attributes: [
                    { trait_type: 'Type', value: types[typeIndex] },
                    { trait_type: 'Rarity', value: rarity },
                    { trait_type: 'Generation', value: '1' },
                    { trait_type: 'Evolution', value: 'Baby' }
                ],
                // Данные для игры
                gameData: {
                    type: types[typeIndex],
                    emoji: emojis[typeIndex],
                    rarity: rarity,
                    level: 1,
                    xp: 0,
                    evolution: 0
                }
            };
        } catch (error) {
            console.error('Failed to load metadata:', error);
            return null;
        }
    },
    
    /**
     * Получить информацию о Candy Machine
     */
    async getCandyMachineInfo() {
        if (!this.umi) {
            console.error('❌ Umi not initialized');
            return null;
        }
        
        try {
            const { fetchCandyMachine } = window['@metaplex-foundation/mpl-candy-machine'];
            const { publicKey } = window['@metaplex-foundation/umi'];
            
            const candyMachineId = publicKey(this.CANDY_MACHINE_ID);
            const candyMachine = await fetchCandyMachine(this.umi, candyMachineId);
            
            return {
                exists: true,
                address: this.CANDY_MACHINE_ID,
                itemsAvailable: candyMachine.data.itemsAvailable,
                itemsRedeemed: candyMachine.itemsRedeemed,
                itemsRemaining: candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed,
                price: candyMachine.data.price?.sol?.basisPoints || 0,
                goLiveDate: candyMachine.data.goLiveDate
            };
        } catch (error) {
            console.error('Error getting Candy Machine info:', error);
            return null;
        }
    },
    
    /**
     * Проверка владения NFT из нашей коллекции
     */
    async checkNFTOwnership(walletAddress) {
        try {
            console.log('🔍 Checking NFT ownership for:', walletAddress);
            
            const { publicKey } = window['@metaplex-foundation/umi'];
            const { fetchAllDigitalAssetByOwner } = window['@metaplex-foundation/mpl-token-metadata'];
            
            // Получаем все NFT кошелька
            const owner = publicKey(walletAddress);
            const nfts = await fetchAllDigitalAssetByOwner(this.umi, owner);
            
            console.log(`📦 Found ${nfts.length} NFTs in wallet`);
            
            // Фильтруем NFT из нашей коллекции
            const collectionId = publicKey(this.COLLECTION_MINT);
            const ourNFTs = nfts.filter(nft => {
                return nft.metadata?.collection?.key === collectionId.toString();
            });
            
            console.log(`✅ Found ${ourNFTs.length} Tamagotchi NFTs`);
            
            if (ourNFTs.length > 0) {
                return {
                    hasNFT: true,
                    nfts: ourNFTs,
                    firstNFT: ourNFTs[0].publicKey.toString()
                };
            }
            
            return {
                hasNFT: false,
                nfts: []
            };
            
        } catch (error) {
            console.error('Error checking NFT ownership:', error);
            return {
                hasNFT: false,
                nfts: [],
                error: error.message
            };
        }
    }
};

// Export
window.UmiCandyMachine = UmiCandyMachine;

console.log('✅ Umi Candy Machine module loaded');

