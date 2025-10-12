// ============================================
// SIMPLE REAL MINT (SOLANA WEB3.JS ONLY)
// ============================================

const SimpleRealMint = {
    TREASURY_ADDRESS: '2eyQycA4d4zu3FbbwdvHuJ1fVDcfQsz78qGdKGYa8NXw',
    
    connection: null,
    wallet: null,
    
    async init(wallet) {
        try {
            console.log('🎨 Initializing Simple Real Mint...');
            
            this.wallet = wallet;
            this.connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
            
            // Test wallet connection
            if (!this.wallet || !this.wallet.publicKey) {
                throw new Error('Wallet not connected');
            }
            
            console.log('✅ Simple Real Mint initialized with wallet:', this.wallet.publicKey.toString());
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Simple Real Mint:', error);
            return false;
        }
    },
    
    async mintNFT() {
        try {
            console.log('🎨 Starting simple real NFT mint...');
            
            // Get pet name
            const petNameInput = document.getElementById('pet-name-input-field');
            const customName = petNameInput && petNameInput.value ? petNameInput.value.trim() : '';
            
            // Generate NFT data
            const nftData = this.generateNFTData(customName);
            
            // 1. Send SOL to treasury
            const treasuryPublicKey = new solanaWeb3.PublicKey(this.TREASURY_ADDRESS);
            const mintPrice = await this.getCurrentPrice(); // Get price from database
            
            const transferTransaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: treasuryPublicKey,
                    lamports: mintPrice * solanaWeb3.LAMPORTS_PER_SOL,
                })
            );
            
            console.log('💰 Sending SOL to treasury:', this.TREASURY_ADDRESS);
            
            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transferTransaction.recentBlockhash = blockhash;
            transferTransaction.feePayer = this.wallet.publicKey;
            
            // Try different methods depending on wallet
            let transferSignature;
            
            if (this.wallet.signAndSendTransaction) {
                // Solflare, etc.
                console.log('📝 Using signAndSendTransaction...');
                const signed = await this.wallet.signAndSendTransaction(transferTransaction);
                transferSignature = signed.signature || signed;
            } else if (this.wallet.signTransaction) {
                // Phantom uses this
                console.log('📝 Using signTransaction...');
                const signedTransaction = await this.wallet.signTransaction(transferTransaction);
                transferSignature = await this.connection.sendRawTransaction(signedTransaction.serialize());
            } else {
                throw new Error('Wallet does not support transaction signing');
            }
            
            console.log('⏳ Confirming transaction...');
            await this.connection.confirmTransaction(transferSignature);
            console.log('✅ SOL sent to treasury:', transferSignature);
            
            // 2. Generate NFT mint address (for database)
            const mintKeypair = solanaWeb3.Keypair.generate();
            const mintAddress = mintKeypair.publicKey.toString();
            
            console.log('🔑 Generated NFT Mint:', mintAddress);
            console.log('✅ Real transaction completed!', transferSignature);
            
            // Return result in the same format as other mint modules
            const result = {
                success: true,
                mintAddress: mintAddress,
                nftData: nftData,
                transaction: transferSignature,
                signature: transferSignature, // Добавляем signature для совместимости
                solTransfer: {
                    signature: transferSignature,
                    amount: mintPrice,
                    to: this.TREASURY_ADDRESS
                }
            };
            
            console.log('📤 Returning result:', result);
            return result;
            
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
    
    async createMetadata(mintAddress, nftData) {
        try {
            // Create metadata JSON
            const metadata = {
                name: nftData.name,
                symbol: "TAMA",
                description: nftData.description,
                image: nftData.image,
                attributes: nftData.attributes,
                properties: {
                    files: [
                        {
                            uri: nftData.image,
                            type: "image/png"
                        }
                    ],
                    category: "image",
                    creators: [
                        {
                            address: this.TREASURY_ADDRESS,
                            share: 100
                        }
                    ]
                }
            };
            
            // Upload metadata to IPFS or Arweave (simplified - using GitHub as storage)
            const metadataUri = `https://tr1h.github.io/solana-tamagotchi-v3/metadata/${mintAddress.toString()}.json`;
            
            // For now, we'll store metadata locally and reference it
            // In production, you'd upload to IPFS/Arweave
            console.log('📝 Metadata JSON:', JSON.stringify(metadata, null, 2));
            console.log('🔗 Metadata URI:', metadataUri);
            
            return {
                uri: metadataUri,
                data: metadata
            };
            
        } catch (error) {
            console.error('❌ Failed to create metadata:', error);
            return null;
        }
    }
};

// Export
window.SimpleRealMint = SimpleRealMint;

console.log('✅ Simple Real Mint module loaded');
