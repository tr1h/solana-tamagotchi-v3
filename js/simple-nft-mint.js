// ============================================
// SIMPLE NFT MINT WITHOUT UMI SDK
// ============================================

const SimpleNFTMint = {
    CANDY_MACHINE_ID: '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB',
    COLLECTION_MINT: 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT',
    
    wallet: null,
    connection: null,
    
    async init(wallet) {
        try {
            console.log('🚀 Initializing Simple NFT Mint...');
            
            this.wallet = wallet;
            this.connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
            
            console.log('✅ Simple NFT Mint initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Simple NFT Mint:', error);
            return false;
        }
    },
    
    async mintNFT() {
        try {
            console.log('🎨 Starting simple NFT mint...');
            
            // Генерируем NFT данные
            const nftData = this.generateNFTData();
            
            // Создаём NFT mint (новый keypair)
            const mintKeypair = solanaWeb3.Keypair.generate();
            const mintAddress = mintKeypair.publicKey.toString();
            
            console.log('🔑 Generated NFT Mint:', mintAddress);
            
            // В реальном случае здесь был бы вызов Candy Machine
            // Сейчас просто имитируем успешный минт
            
            // Для devnet теста - просто возвращаем сгенерированные данные
            console.log('✅ NFT minted successfully (demo)');
            
            return {
                success: true,
                mintAddress: mintAddress,
                signature: 'demo_signature_' + Date.now(),
                metadata: {
                    name: nftData.name,
                    symbol: 'TAMA',
                    uri: 'https://arweave.net/demo',
                    gameData: nftData
                },
                explorerUrl: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`
            };
            
        } catch (error) {
            console.error('❌ Mint failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    generateNFTData() {
        const types = [
            { name: 'cat', emoji: '🐱', weight: 30 },
            { name: 'dog', emoji: '🐶', weight: 25 },
            { name: 'dragon', emoji: '🐉', weight: 10 },
            { name: 'unicorn', emoji: '🦄', weight: 8 },
            { name: 'phoenix', emoji: '🔥', weight: 5 },
            { name: 'robot', emoji: '🤖', weight: 15 },
            { name: 'alien', emoji: '👽', weight: 12 },
            { name: 'bear', emoji: '🐻', weight: 20 },
            { name: 'panda', emoji: '🐼', weight: 18 },
            { name: 'tiger', emoji: '🐯', weight: 15 }
        ];
        
        const rarities = [
            { name: 'common', weight: 50 },
            { name: 'rare', weight: 30 },
            { name: 'epic', weight: 15 },
            { name: 'legendary', weight: 5 }
        ];
        
        // Weighted random selection
        const selectWeighted = (items) => {
            const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const item of items) {
                random -= item.weight;
                if (random <= 0) {
                    return item;
                }
            }
            return items[0];
        };
        
        const type = selectWeighted(types);
        const rarity = selectWeighted(rarities);
        
        return {
            type: type.name,
            emoji: type.emoji,
            rarity: rarity.name,
            name: `${rarity.name.charAt(0).toUpperCase() + rarity.name.slice(1)} ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}`,
            stats: {
                hunger: 100,
                energy: 100,
                happy: 100,
                health: 100
            },
            level: 1,
            xp: 0
        };
    },
    
    async checkNFTOwnership(walletAddress) {
        try {
            console.log('🔍 Checking NFT ownership for:', walletAddress);
            
            // Для devnet теста - проверяем в базе данных
            if (window.Database && window.Database.loadPlayerData) {
                const playerData = await window.Database.loadPlayerData(walletAddress);
                if (playerData && playerData.nft_mint_address) {
                    console.log('✅ NFT found in database:', playerData.nft_mint_address);
                    return {
                        hasNFT: true,
                        nfts: [{
                            publicKey: playerData.nft_mint_address,
                            metadata: {
                                name: playerData.pet_name || 'Tamagotchi',
                                symbol: 'TAMA',
                                uri: 'https://arweave.net/demo',
                                gameData: playerData.pet_data || {}
                            }
                        }]
                    };
                }
            }
            
            return {
                hasNFT: false,
                nfts: []
            };
            
        } catch (error) {
            console.error('❌ NFT ownership check failed:', error);
            return {
                hasNFT: false,
                nfts: []
            };
        }
    }
};

// Export для глобального использования
window.SimpleNFTMint = SimpleNFTMint;

console.log('✅ SimpleNFTMint ready (fallback mode)');
