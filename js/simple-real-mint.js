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
            
            console.log('✅ Simple Real Mint initialized');
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
            const petNameInput = document.getElementById('pet-name');
            const customName = petNameInput && petNameInput.value ? petNameInput.value.trim() : '';
            
            // Generate NFT data
            const nftData = this.generateNFTData(customName);
            
            // 1. Send SOL to treasury
            const treasuryPublicKey = new solanaWeb3.PublicKey(this.TREASURY_ADDRESS);
            const mintPrice = 0.1; // 0.1 SOL
            
            const transferTransaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: treasuryPublicKey,
                    lamports: mintPrice * solanaWeb3.LAMPORTS_PER_SOL,
                })
            );
            
            console.log('💰 Sending SOL to treasury:', this.TREASURY_ADDRESS);
            const transferSignature = await this.wallet.sendTransaction(transferTransaction, this.connection);
            await this.connection.confirmTransaction(transferSignature);
            console.log('✅ SOL sent to treasury:', transferSignature);
            
            // 2. Create NFT mint account
            const mintKeypair = solanaWeb3.Keypair.generate();
            const mintAddress = mintKeypair.publicKey.toString();
            
            console.log('🔑 Generated NFT Mint:', mintAddress);
            
            // 3. Create mint account transaction
            const mintTransaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.createAccount({
                    fromPubkey: this.wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    lamports: await this.connection.getMinimumBalanceForRentExemption(
                        solanaWeb3.MINT_SIZE
                    ),
                    space: solanaWeb3.MINT_SIZE,
                    programId: solanaWeb3.TOKEN_PROGRAM_ID,
                }),
                solanaWeb3.createInitializeMintInstruction(
                    mintKeypair.publicKey,
                    0, // decimals
                    this.wallet.publicKey, // mint authority
                    this.wallet.publicKey  // freeze authority
                )
            );
            
            // 4. Create associated token account
            const associatedTokenAccount = await solanaWeb3.getAssociatedTokenAddress(
                mintKeypair.publicKey,
                this.wallet.publicKey
            );
            
            mintTransaction.add(
                solanaWeb3.createAssociatedTokenAccountInstruction(
                    this.wallet.publicKey, // payer
                    associatedTokenAccount, // associated token account
                    this.wallet.publicKey, // owner
                    mintKeypair.publicKey // mint
                ),
                solanaWeb3.createMintToInstruction(
                    mintKeypair.publicKey,
                    associatedTokenAccount,
                    this.wallet.publicKey,
                    1 // amount
                )
            );
            
            // 5. Sign and send transaction
            mintTransaction.partialSign(mintKeypair);
            const mintSignature = await this.wallet.sendTransaction(mintTransaction, this.connection);
            await this.connection.confirmTransaction(mintSignature);
            
            console.log('✅ Real NFT minted!', mintAddress);
            
            return {
                success: true,
                mintAddress: mintAddress,
                nftData: nftData,
                transaction: mintSignature,
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
window.SimpleRealMint = SimpleRealMint;

console.log('✅ Simple Real Mint module loaded');
