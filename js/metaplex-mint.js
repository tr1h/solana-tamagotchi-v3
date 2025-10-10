// ============================================
// METAPLEX JS SDK MINT (REAL BLOCKCHAIN)
// ============================================

const MetaplexMint = {
    CANDY_MACHINE_ID: '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB',
    COLLECTION_MINT: 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT',
    
    metaplex: null,
    wallet: null,
    
    async init(wallet) {
        try {
            console.log('🍬 Initializing Metaplex JS SDK...');
            
            this.wallet = wallet;
            
            // Load Metaplex JS SDK
            if (!window.metaplex) {
                await this.loadMetaplexSDK();
            }
            
            // Create Metaplex instance
            const connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
            
            this.metaplex = window.metaplex.Metaplex.make(connection)
                .use(window.metaplex.walletAdapterIdentity(wallet))
                .use(window.metaplex.bundlrStorage({
                    address: 'https://devnet.bundlr.network',
                    providerUrl: 'https://api.devnet.solana.com',
                    timeout: 60000,
                }));
            
            console.log('✅ Metaplex initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Metaplex:', error);
            return false;
        }
    },
    
    async loadMetaplexSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@metaplex-foundation/js@0.19.0/dist/index.umd.js';
            script.onload = () => {
                console.log('✅ Metaplex JS SDK loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load Metaplex JS SDK');
                reject(new Error('Failed to load Metaplex JS SDK'));
            };
            document.head.appendChild(script);
        });
    },
    
    async mintNFT() {
        try {
            console.log('🎨 Starting real NFT mint with Metaplex...');
            
            if (!this.metaplex) {
                throw new Error('Metaplex not initialized');
            }
            
            // Get pet name
            const petNameInput = document.getElementById('pet-name');
            const customName = petNameInput && petNameInput.value ? petNameInput.value.trim() : '';
            
            // Generate NFT data
            const nftData = this.generateNFTData(customName);
            
            // Create NFT with Metaplex
            const { nft } = await this.metaplex.nfts().create({
                name: nftData.name,
                symbol: 'TAMA',
                description: nftData.description,
                image: nftData.image,
                attributes: nftData.attributes,
                sellerFeeBasisPoints: 500, // 5% royalty
            });
            
            console.log('✅ Real NFT minted!', nft);
            
            return {
                success: true,
                mintAddress: nft.address.toString(),
                nftData: nftData,
                transaction: nft.metadataAddress.toString()
            };
            
        } catch (error) {
            console.error('❌ Failed to mint NFT:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    generateNFTData(customName) {
        const types = ['Dragon', 'Phoenix', 'Unicorn', 'Griffin'];
        const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
        
        const type = types[Math.floor(Math.random() * types.length)];
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];
        const name = customName || `${type} #${Math.floor(Math.random() * 10000)}`;
        
        return {
            name: name,
            type: type,
            rarity: rarity,
            description: `A magical ${rarity.toLowerCase()} ${type.toLowerCase()} companion in the Solana Tamagotchi universe.`,
            image: `https://tr1h.github.io/solana-tamagotchi-v3/nft-assets/${type.toLowerCase()}-${rarity.toLowerCase()}.png`,
            attributes: [
                { trait_type: 'Type', value: type },
                { trait_type: 'Rarity', value: rarity },
                { trait_type: 'Generation', value: 'Genesis' }
            ]
        };
    }
};

// Export
window.MetaplexMint = MetaplexMint;

console.log('✅ Metaplex Mint module loaded');
