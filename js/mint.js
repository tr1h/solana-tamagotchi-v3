// ============================================
// NFT MINT PAGE LOGIC
// ============================================

const MintPage = {
    wallet: null,
    connection: null,
    publicKey: null,
    
    // Mint phases
    phases: [
        { max: 100, price: 0.3, tamaBonus: 600 },
        { max: 500, price: 0.5, tamaBonus: 500 },
        { max: 1000, price: 0.8, tamaBonus: 500 },
        { max: 10000, price: 1.0, tamaBonus: 500 }  // MAX 10,000 NFTs total
    ],
    
    maxSupply: 10000,  // Total NFT limit
    
    currentMinted: 0,
    
    async init() {
        // Initialize Database first
        if (window.Database && window.Database.init) {
            await window.Database.init();
            
            // Load mint stats
            const totalMinted = await window.Database.getMintStats();
            this.currentMinted = totalMinted || 0;
            console.log(`📊 Total minted: ${this.currentMinted}`);
            this.updateMintProgress();
        } else {
            // Fallback if DB not available
            this.currentMinted = 0;
            this.updateMintProgress();
        }
        
        // Setup wallet
        if (window.solana && window.solana.isPhantom) {
            this.wallet = window.solana;
            
            // Check if already connected
            if (this.wallet.isConnected) {
                await this.handleConnect();
            }
        }
        
        // Event listeners
        document.getElementById('connect-wallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('mint-btn').addEventListener('click', () => this.mintNFT());
        document.getElementById('airdrop-btn').addEventListener('click', () => this.requestAirdrop());
        
        // Load mint stats
        await this.loadMintStats();
        
        // Pet preview animation
        this.animatePreview();
    },
    
    async connectWallet() {
        try {
            const resp = await this.wallet.connect();
            await this.handleConnect();
        } catch (error) {
            console.error('Wallet connection failed:', error);
            alert('Failed to connect wallet!');
        }
    },
    
    async handleConnect() {
        this.publicKey = this.wallet.publicKey;
        
        // Setup connection
        this.connection = new solanaWeb3.Connection(
            'https://api.devnet.solana.com',
            'confirmed'
        );
        
        // Update UI
        const btn = document.getElementById('connect-wallet');
        btn.textContent = `${this.publicKey.toString().slice(0, 4)}...${this.publicKey.toString().slice(-4)}`;
        btn.style.background = 'linear-gradient(135deg, #8AC926, #6A994E)';
        
        // Enable mint button
        const mintBtn = document.getElementById('mint-btn');
        mintBtn.disabled = false;
        mintBtn.querySelector('.btn-text').textContent = `MINT NOW - ${this.getCurrentPrice()} SOL`;
        
        // Show airdrop button (devnet only)
        document.getElementById('airdrop-btn').classList.remove('hidden');
    },
    
    async requestAirdrop() {
        try {
            const airdropBtn = document.getElementById('airdrop-btn');
            airdropBtn.textContent = '⏳ Requesting...';
            airdropBtn.disabled = true;
            
            const signature = await this.connection.requestAirdrop(
                this.publicKey,
                solanaWeb3.LAMPORTS_PER_SOL
            );
            
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            alert('✅ Received 1 SOL! You can now mint your NFT!');
            
            airdropBtn.textContent = '💰 Get 1 SOL (Devnet)';
            airdropBtn.disabled = false;
        } catch (error) {
            console.error('Airdrop failed:', error);
            
            // Check if rate limited
            if (error.message && error.message.includes('429')) {
                alert('⏰ Rate limit reached!\n\n💡 Use web faucet: https://faucet.solana.com\nOr wait a few minutes and try again.');
            } else {
                alert('❌ Airdrop failed. Try: https://faucet.solana.com');
            }
            
            const airdropBtn = document.getElementById('airdrop-btn');
            airdropBtn.textContent = '💰 Get 1 SOL (Devnet)';
            airdropBtn.disabled = false;
        }
    },
    
    async loadMintStats() {
        // Load real mint count from database
        if (window.Database && window.Database.getMintStats) {
            this.currentMinted = await window.Database.getMintStats();
        }
        
        this.updateMintProgress();
    },
    
    getCurrentPrice() {
        for (let phase of this.phases) {
            if (this.currentMinted < phase.max) {
                return phase.price;
            }
        }
        return this.phases[this.phases.length - 1].price;
    },
    
    getCurrentPhase() {
        for (let i = 0; i < this.phases.length; i++) {
            if (this.currentMinted < this.phases[i].max) {
                return i;
            }
        }
        return this.phases.length - 1;
    },
    
    updateMintProgress() {
        const phaseIndex = this.getCurrentPhase();
        const phase = this.phases[phaseIndex];
        const prevMax = phaseIndex > 0 ? this.phases[phaseIndex - 1].max : 0;
        const progress = this.currentMinted - prevMax;
        const total = phase.max - prevMax;
        const percentage = (progress / total) * 100;
        
        // Update UI elements with correct IDs
        const progressBar = document.getElementById('mint-progress');
        const mintedCount = document.getElementById('minted-count');
        const mintPrice = document.getElementById('mint-price');
        
        console.log('🔍 Updating UI elements:', {
            progressBar: !!progressBar,
            mintedCount: !!mintedCount,
            mintPrice: !!mintPrice,
            currentMinted: this.currentMinted,
            percentage: percentage
        });
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            console.log('✅ Progress bar updated to:', `${percentage}%`);
        } else {
            console.warn('⚠️ Progress bar element not found');
        }
        
        if (mintedCount) {
            mintedCount.textContent = this.currentMinted;
            console.log('✅ Minted count updated to:', this.currentMinted);
        } else {
            console.warn('⚠️ Minted count element not found');
        }
        
        if (mintPrice) {
            mintPrice.textContent = `${phase.price} SOL`;
            console.log('✅ Mint price updated to:', `${phase.price} SOL`);
        } else {
            console.warn('⚠️ Mint price element not found');
        }
        
        console.log(`📊 Progress updated: ${this.currentMinted} minted, ${percentage.toFixed(1)}% of phase ${phaseIndex + 1}`);
    },
    
    async mintNFT() {
        if (!this.publicKey) {
            alert('Please connect wallet first!');
            return;
        }
        
        // Prevent double-click minting
        if (this.isMinting) {
            console.warn('⚠️ Minting already in progress');
            return;
        }
        
        // Check if sold out
        if (this.currentMinted >= this.maxSupply) {
            alert('🔥 SOLD OUT! All NFTs have been minted!');
            return;
        }
        
        this.isMinting = true;
        const mintBtn = document.getElementById('mint-btn');
        mintBtn.disabled = true;
        mintBtn.querySelector('.btn-text').textContent = 'MINTING...';
        
        try {
            // Check balance first
            const balance = await this.connection.getBalance(this.publicKey);
            const price = this.getCurrentPrice();
            const lamports = price * solanaWeb3.LAMPORTS_PER_SOL;
            
            // If insufficient balance, try demo mode (free mint)
            if (balance < lamports) {
                if (!confirm(`Insufficient balance (${(balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(2)} SOL).\n\nMint for FREE in DEMO mode?`)) {
                    mintBtn.disabled = false;
                    mintBtn.querySelector('.btn-text').textContent = `MINT NOW - ${this.getCurrentPrice()} SOL`;
                    return;
                }
                
                // Demo mode - free mint
                const nft = this.generateNFT();
                
                // Record mint in database
                const phaseIndex = this.getCurrentPhase();
                const currentPrice = this.getCurrentPrice();
                if (window.Database && window.Database.recordMint) {
                    await window.Database.recordMint(
                        this.publicKey.toString(),
                        nft,
                        0, // Free demo mint
                        phaseIndex
                    );
                }
                
                this.saveNFTData(nft);
                this.showSuccessModal(nft);
                
                // Reload mint stats
                await this.loadMintStats();
                
                this.isMinting = false;
                mintBtn.disabled = false;
                mintBtn.querySelector('.btn-text').textContent = `MINT NOW - ${this.getCurrentPrice()} SOL`;
                
                alert('🎉 FREE DEMO MINT! Get devnet SOL: solana airdrop 1');
                return;
            }
            
            // Treasury wallet (replace with yours)
            const treasuryWallet = '2eyQycA4d4zu3FbbwdvHuJ1fVDcfQsz78qGdKGYa8NXw';
            
            // Create transaction
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: this.publicKey,
                    toPubkey: new solanaWeb3.PublicKey(treasuryWallet),
                    lamports: lamports
                })
            );
            
            // Get recent blockhash with fresh commitment
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.publicKey;
            
            // Sign and send with retry logic
            const signed = await this.wallet.signTransaction(transaction);
            
            // Send with skipPreflight to avoid duplicate tx errors
            const signature = await this.connection.sendRawTransaction(signed.serialize(), {
                skipPreflight: false,
                maxRetries: 3
            });
            
            console.log('Transaction sent:', signature);
            
            // Confirm with proper error handling
            await this.connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');
            
            // Generate random NFT
            const nft = this.generateNFT();
            
            // Save NFT data
            this.saveNFTData(nft);
            
            // Record mint in database
            const phaseIndex = this.getCurrentPhase();
            const currentPrice = this.getCurrentPrice();
            await window.Database.recordMint(
                this.publicKey.toString(),
                nft,
                currentPrice,
                phaseIndex
            );
            
            // Show success modal
            this.showSuccessModal(nft);
            
            // Reload mint stats from database to get accurate count
            await this.loadMintStats();
            
            // Reset minting flag on success
            this.isMinting = false;
            mintBtn.disabled = false;
            mintBtn.querySelector('.btn-text').textContent = `MINT NOW - ${this.getCurrentPrice()} SOL`;
            
        } catch (error) {
            console.error('Mint failed:', error);
            
            // Check if duplicate transaction error
            if (error.message && error.message.includes('already been processed')) {
                alert('⚠️ Transaction already processed!\n\nYour NFT may have been minted. Check your wallet or refresh the page.');
                // Reload stats to check if mint was successful
                await this.loadMintStats();
            } else if (error.message && error.message.includes('insufficient')) {
                alert('❌ Insufficient SOL balance!\n\n💡 Get devnet SOL: https://faucet.solana.com');
            } else {
                alert('❌ Mint failed! ' + error.message);
            }
            
            this.isMinting = false;
            mintBtn.disabled = false;
            mintBtn.querySelector('.btn-text').textContent = `MINT NOW - ${this.getCurrentPrice()} SOL`;
        }
    },
    
    generateNFT() {
        const types = ['cat', 'dog', 'dragon', 'fox', 'bear', 'rabbit', 'panda', 'lion', 'unicorn', 'wolf'];
        const emojis = ['🐱', '🐶', '🐉', '🦊', '🐻', '🐰', '🐼', '🦁', '🦄', '🐺'];
        const rarities = ['common', 'rare', 'epic', 'legendary'];
        
        // Random rarity based on chances
        const rand = Math.random() * 100;
        let rarity;
        if (rand < 70) rarity = 'common';
        else if (rand < 90) rarity = 'rare';
        else if (rand < 98) rarity = 'epic';
        else rarity = 'legendary';
        
        // Random type
        const typeIndex = Math.floor(Math.random() * types.length);
        
        // TAMA bonus
        const phaseIndex = this.getCurrentPhase();
        const tamaBonus = this.phases[phaseIndex].tamaBonus;
        
        return {
            type: types[typeIndex],
            emoji: emojis[typeIndex],
            rarity: rarity,
            tamaBonus: tamaBonus,
            mintedAt: Date.now(),
            owner: this.publicKey.toString()
        };
    },
    
    saveNFTData(nft) {
        // Save to localStorage
        localStorage.setItem('nftData', JSON.stringify(nft));
        
        // Save TAMA bonus
        const playerData = JSON.parse(localStorage.getItem('playerData')) || { tama: 0 };
        playerData.tama = (playerData.tama || 0) + nft.tamaBonus;
        playerData.hasNFT = true;
        localStorage.setItem('playerData', JSON.stringify(playerData));
    },
    
    showSuccessModal(nft) {
        const modal = document.getElementById('success-modal');
        document.getElementById('minted-pet').textContent = nft.emoji;
        document.getElementById('minted-rarity').textContent = nft.rarity.toUpperCase();
        
        modal.classList.remove('hidden');
        
        // Auto-create pet in game after mint
        this.createPetAfterMint(nft);
        
        // Auto-redirect to game after 3 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    },
    
    createPetAfterMint(nft) {
        // Save pet data to localStorage for game to load
        const petData = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `My ${nft.type.charAt(0).toUpperCase() + nft.type.slice(1)}`,
            type: nft.type,
            rarity: nft.rarity,
            traits: nft.traits,
            stats: {
                hunger: 100,
                energy: 100,
                happy: 100,
                health: 100
            },
            level: 1,
            xp: 0,
            evolution: 0,
            createdAt: Date.now(),
            lastUpdate: Date.now(),
            isDead: false,
            isCritical: false
        };
        
        localStorage.setItem('currentPet', JSON.stringify(petData));
        localStorage.setItem('hasPetFromMint', 'true');
        
        // Save to database
        this.savePetToDB(petData);
    },
    
    async savePetToDB(petData) {
        if (!this.publicKey) {
            console.warn('⚠️ No wallet connected, cannot save pet');
            return;
        }
        
        try {
            console.log('💾 Attempting to save pet to Supabase...');
            console.log('Pet data:', petData);
            console.log('Wallet:', this.publicKey.toString());
            
            // Use Supabase directly instead of old API
            if (window.Database && window.Database.supabase) {
                console.log('✅ Database found, saving...');
                const { data, error } = await window.Database.supabase
                    .from('leaderboard')
                    .upsert({
                        wallet_address: this.publicKey.toString(),
                        pet_name: petData.name,
                        pet_type: petData.type,
                        pet_rarity: petData.rarity,
                        level: petData.level,
                        xp: petData.xp,
                        tama: 500, // Bonus from mint
                        pet_data: petData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'wallet_address' });
                
                if (error) {
                    console.error('❌ Supabase error:', error);
                    throw error;
                }
                console.log('✅ Pet saved to Supabase successfully!', data);
                
                // Record the mint in nft_mints table
                if (window.Database && window.Database.recordMint) {
                    console.log('🔍 Recording mint with:', {
                        wallet: this.publicKey.toString(),
                        price: this.currentPrice,
                        phase: this.currentPhase
                    });
                    await window.Database.recordMint(
                        this.publicKey.toString(),
                        petData,
                        this.currentPrice || 0.1,
                        this.currentPhase || 1
                    );
                    console.log('✅ Mint recorded in nft_mints table');
                    
                    // Reload mint stats to update UI
                    await this.loadMintStats();
                } else {
                    console.log('❌ recordMint not available:', {
                        Database: !!window.Database,
                        recordMint: !!(window.Database && window.Database.recordMint)
                    });
                }
            } else {
                console.error('❌ Database not initialized or Supabase not found');
                console.log('Database object:', window.Database);
            }
        } catch (error) {
            console.error('❌ Error saving pet to DB:', error);
        }
    },
    
    animatePreview() {
        const pets = ['🐱', '🐶', '🐉', '🦊', '🐻', '🐰', '🐼', '🦁', '🦄', '🐺'];
        const rarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
        const colors = [
            'linear-gradient(135deg, #8AC926, #6A994E)',
            'linear-gradient(135deg, #1982C4, #155A8A)',
            'linear-gradient(135deg, #6A4C93, #4A3068)',
            'linear-gradient(135deg, #FF8C42, #E07A3E)',
            'linear-gradient(135deg, #FFCA3A, #FF8C42)',
            'linear-gradient(135deg, #FF595E, #FF8C42)'
        ];
        
        let index = 0;
        setInterval(() => {
            const petPreview = document.querySelector('.pet-emoji');
            const rarityBadge = document.getElementById('rarity-badge');
            const nftImage = document.querySelector('.nft-image');
            
            index = (index + 1) % pets.length;
            petPreview.textContent = pets[index];
            rarityBadge.textContent = rarities[Math.floor(Math.random() * rarities.length)];
            nftImage.style.background = colors[Math.floor(Math.random() * colors.length)];
        }, 2000);
    }
};

function closeModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    MintPage.init();
});

