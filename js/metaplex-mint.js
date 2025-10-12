// ============================================
// METAPLEX JS SDK MINT (REAL BLOCKCHAIN)
// ============================================

const MetaplexMint = {
    CANDY_MACHINE_ID: '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB',
    COLLECTION_MINT: 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT',
    
    // Treasury адрес для получения SOL
    TREASURY_ADDRESS: '2eyQycA4d4zu3FbbwdvHuJ1fVDcfQsz78qGdKGYa8NXw', // Твой treasury адрес
    
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
        const metaplexUrls = [
            'https://cdn.jsdelivr.net/npm/@metaplex-foundation/js@0.19.0/dist/index.umd.js',
            'https://unpkg.com/@metaplex-foundation/js@0.19.0/dist/index.umd.js',
            'https://cdn.skypack.dev/@metaplex-foundation/js@0.19.0'
        ];
        
        for (const url of metaplexUrls) {
            try {
                await this.loadScript(url);
                console.log('✅ Metaplex JS SDK loaded from:', url);
                return;
            } catch (error) {
                console.warn('⚠️ Failed to load Metaplex from:', url);
            }
        }
        
        throw new Error('All Metaplex CDN sources failed');
    },
    
    async loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${url}`));
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
            const petNameInput = document.getElementById('pet-name-input-field');
            const customName = petNameInput && petNameInput.value ? petNameInput.value.trim() : '';
            
            // Generate NFT data
            const nftData = this.generateNFTData(customName);
            
            // Create NFT with Metaplex and send SOL to treasury
            const treasuryPublicKey = new solanaWeb3.PublicKey(this.TREASURY_ADDRESS);
            const mintPrice = await this.getCurrentPrice(); // Get price from database
            
            // First, send SOL to treasury
            const transferTransaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: treasuryPublicKey,
                    lamports: mintPrice * solanaWeb3.LAMPORTS_PER_SOL,
                })
            );
            
            console.log('💰 Sending SOL to treasury:', this.TREASURY_ADDRESS);
            const transferSignature = await this.wallet.sendTransaction(transferTransaction, this.metaplex.connection);
            await this.metaplex.connection.confirmTransaction(transferSignature);
            console.log('✅ SOL sent to treasury:', transferSignature);
            
            // Then create NFT
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
                transaction: nft.metadataAddress.toString(),
                solTransfer: {
                    signature: transferSignature,
                    amount: mintPrice,
                    to: this.TREASURY_ADDRESS
                }
            };
            
        } catch (error) {
            console.error('❌ Failed to mint NFT:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // Get current price from database
    async getCurrentPrice() {
        try {
            if (window.Database && window.Database.supabase) {
                const { data } = await window.Database.supabase
                    .from('game_settings')
                    .select('value')
                    .eq('key', 'nft_price')
                    .single();
                
                if (data) {
                    return parseFloat(data.value);
                }
            }
        } catch (error) {
            console.warn('Could not get price from database, using fallback');
        }
        
        // Fallback
        return 0.1;
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
    },
    
    // Проверить баланс treasury
    async getTreasuryBalance() {
        try {
            if (!this.metaplex) return 0;
            
            const treasuryPublicKey = new solanaWeb3.PublicKey(this.TREASURY_ADDRESS);
            const balance = await this.metaplex.connection.getBalance(treasuryPublicKey);
            
            return balance / solanaWeb3.LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('❌ Failed to get treasury balance:', error);
            return 0;
        }
    }
};

// Export
window.MetaplexMint = MetaplexMint;

console.log('✅ Metaplex Mint module loaded');
