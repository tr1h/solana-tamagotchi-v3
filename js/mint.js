// ============================================
// NFT MINT PAGE LOGIC
// ============================================

const MintPage = {
    wallet: null,
    connection: null,
    publicKey: null,
    
    // Mint phases - will be updated from NetworkConfig
    // Early adopters get MORE TAMA bonus!
    phases: [
        { max: 100, price: 0.1, tamaBonus: 1000 },   // 🎁 Early Adopter Bonus!
        { max: 200, price: 0.2, tamaBonus: 750 },    // Standard Bonus
        { max: 500, price: 0.3, tamaBonus: 500 }     // Late Bonus
    ],
    
    maxSupply: 10000,  // Total NFT limit
    
    currentMinted: 0,
    
    // Update phases from NetworkConfig
    updatePhasesFromConfig() {
        if (window.NetworkConfig) {
            const networkInfo = window.NetworkConfig.getNetworkInfo();
            this.phases = [
                { max: networkInfo.limits.phase1, price: networkInfo.prices.phase1, tamaBonus: window.NetworkConfig.getTAMABonus(1) },
                { max: networkInfo.limits.phase2, price: networkInfo.prices.phase2, tamaBonus: window.NetworkConfig.getTAMABonus(2) },
                { max: networkInfo.limits.phase3, price: networkInfo.prices.phase3, tamaBonus: window.NetworkConfig.getTAMABonus(3) }
            ];
            console.log('🌐 Updated phases from NetworkConfig:', this.phases);
        }
    },
    
    async init() {
        // Update phases from NetworkConfig if available
        this.updatePhasesFromConfig();
        
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
        const connectBtn = document.getElementById('connect-wallet');
        const mintBtn = document.getElementById('mint-btn');
        const airdropBtn = document.getElementById('airdrop-btn');
        
        if (connectBtn) connectBtn.addEventListener('click', () => this.connectWallet());
        if (mintBtn) mintBtn.addEventListener('click', () => this.mintNFT());
        if (airdropBtn) airdropBtn.addEventListener('click', () => this.requestAirdrop());
        
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
        
        // Setup connection using NetworkConfig
        this.connection = new solanaWeb3.Connection(
            window.NetworkConfig ? window.NetworkConfig.getRpcEndpoint() : 'https://api.devnet.solana.com',
            'confirmed'
        );
        
        // Initialize SimpleNFTMint (using fallback mode for devnet)
        // Try to initialize UmiCandyMachine first
        if (window.UmiLoader) {
            console.log('🔄 Loading Umi SDK...');
            const umiLoaded = await window.UmiLoader.loadUmiSDK();
            
            if (umiLoaded && window.UmiCandyMachine) {
                console.log('🍬 Initializing UmiCandyMachine...');
                await window.UmiCandyMachine.init();
                console.log('✅ UmiCandyMachine ready for real minting');
                this.usingUmi = true;
            } else {
                console.warn('⚠️ Umi SDK failed to load, trying MetaplexMint');
                this.usingUmi = false;
            }
        }
        
        // Try to initialize MetaplexMint as backup
        if (!this.usingUmi && window.MetaplexMint) {
            console.log('🎨 Initializing MetaplexMint...');
            const metaplexLoaded = await window.MetaplexMint.init(this.wallet);
            
            if (metaplexLoaded) {
                console.log('✅ MetaplexMint ready for real minting');
                this.usingMetaplex = true;
            } else {
                console.warn('⚠️ MetaplexMint failed to load, trying SimpleRealMint');
                this.usingMetaplex = false;
            }
        }
        
        // Try to initialize SimpleRealMint as final backup
        if (!this.usingUmi && !this.usingMetaplex && window.SimpleRealMint) {
            console.log('🎨 Initializing SimpleRealMint...');
            const simpleRealLoaded = await window.SimpleRealMint.init(this.wallet);
            
            if (simpleRealLoaded) {
                console.log('✅ SimpleRealMint ready for real minting');
                this.usingSimpleReal = true;
            } else {
                console.warn('⚠️ SimpleRealMint failed to load, using demo mode');
                this.usingSimpleReal = false;
            }
        }
        
        // Fallback to SimpleNFTMint
        if (!this.usingUmi && window.SimpleNFTMint) {
            await window.SimpleNFTMint.init(this.wallet);
            console.log('✅ SimpleNFTMint ready for minting (demo mode)');
        }
        
        // Update UI
        const btn = document.getElementById('connect-wallet');
        btn.textContent = `${this.publicKey.toString().slice(0, 4)}...${this.publicKey.toString().slice(-4)}`;
        btn.style.background = 'linear-gradient(135deg, #8AC926, #6A994E)';
        
        // Show copy address button
        const copyBtn = document.getElementById('copy-address');
        if (copyBtn) {
            copyBtn.style.display = 'inline-block';
            copyBtn.onclick = () => this.copyAddress();
        }
        
        // Enable mint button
        const mintBtn = document.getElementById('mint-btn');
        mintBtn.disabled = false;
        mintBtn.querySelector('.btn-text').textContent = `MINT NOW - ${this.getCurrentPrice()} SOL`;
        
        // Show faucet link (devnet only)
        const faucetLink = document.getElementById('faucet-link');
        if (faucetLink) {
            faucetLink.classList.remove('hidden');
        }
        
        // Show pet name input
        const petNameInput = document.getElementById('pet-name-input');
        if (petNameInput) {
            petNameInput.style.display = 'block';
        }
    },
    
    async copyAddress() {
        if (!this.publicKey) {
            alert('❌ Wallet not connected!');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.publicKey.toString());
            
            // Show success feedback
            const copyBtn = document.getElementById('copy-address');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            copyBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
            
            console.log('📋 Address copied:', this.publicKey.toString());
            
        } catch (error) {
            console.error('❌ Failed to copy address:', error);
            alert('❌ Failed to copy address. Please copy manually:\n\n' + this.publicKey.toString());
        }
    },
    
    async requestAirdrop() {
        try {
            const airdropBtn = document.getElementById('airdrop-btn');
            airdropBtn.textContent = '⏳ Requesting 1 SOL...';
            airdropBtn.disabled = true;
            
            console.log('🚀 Requesting airdrop for:', this.publicKey.toString());
            
            const signature = await this.connection.requestAirdrop(
                this.publicKey,
                solanaWeb3.LAMPORTS_PER_SOL
            );
            
            console.log('📝 Airdrop signature:', signature);
            
            airdropBtn.textContent = '⏳ Confirming...';
            
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            console.log('✅ Airdrop confirmed!');
            
            // Update balance display
            const newBalance = await this.connection.getBalance(this.publicKey);
            console.log('💰 New balance:', newBalance / solanaWeb3.LAMPORTS_PER_SOL, 'SOL');
            
            alert(`✅ Successfully received 1 SOL!\n\nNew balance: ${(newBalance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(2)} SOL\n\nYou can now mint your NFT! 🎉`);
            
            airdropBtn.textContent = '💰 Get 1 SOL (Devnet)';
            airdropBtn.disabled = false;
            
        } catch (error) {
            console.error('❌ Airdrop failed:', error);
            
            // Check if rate limited
            if (error.message && error.message.includes('429')) {
                alert('⏰ Rate limit reached!\n\n💡 Try again in a few minutes or use:\nhttps://faucet.solana.com');
            } else if (error.message && error.message.includes('insufficient')) {
                alert('❌ Airdrop failed: Insufficient funds\n\n💡 Try: https://faucet.solana.com');
            } else {
                alert(`❌ Airdrop failed: ${error.message}\n\n💡 Try: https://faucet.solana.com`);
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
            
            // Check if insufficient balance
            if (balance < lamports) {
                alert(`❌ Insufficient SOL balance!\n\nCurrent: ${(balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(2)} SOL\nRequired: ${price} SOL\n\n💡 Click "Get Free SOL (Devnet Faucet)" link below to get free devnet SOL!\n\nOr visit: https://faucet.solana.com`);
                
                this.isMinting = false;
                mintBtn.disabled = false;
                mintBtn.querySelector('.btn-text').textContent = `MINT NOW - ${this.getCurrentPrice()} SOL`;
                return;
            }
            
            // ============================================
            // РЕАЛЬНЫЙ МИНТ ЧЕРЕЗ UMI CANDY MACHINE V3
            // ============================================
            
            console.log('🍬 Starting NFT mint...');
            
            mintBtn.querySelector('.btn-text').textContent = '🔄 MINTING NFT...';
            
            // Try UmiCandyMachine first
            if (window.UmiCandyMachine && window.UmiCandyMachine.umi) {
                console.log('🍬 Using UmiCandyMachine for real minting...');
                const result = await window.UmiCandyMachine.mintNFT();
                
                if (result.success) {
                    return result;
                } else {
                    console.warn('⚠️ UmiCandyMachine failed, trying MetaplexMint');
                }
            }
            
            // Try MetaplexMint as second option
            if (window.MetaplexMint) {
                console.log('🎨 Using MetaplexMint for real minting...');
                const result = await window.MetaplexMint.mintNFT();
                
                if (result.success) {
                    return result;
                } else {
                    console.warn('⚠️ MetaplexMint failed, trying SimpleRealMint');
                }
            }
            
            // Try SimpleRealMint as third option
            if (window.SimpleRealMint) {
                console.log('🎨 Using SimpleRealMint for real minting...');
                const result = await window.SimpleRealMint.mintNFT();
                
                if (result.success) {
                    return result;
                } else {
                    console.warn('⚠️ SimpleRealMint failed, falling back to SimpleNFTMint');
                }
            }
            
            // Fallback to SimpleNFTMint
            if (!window.SimpleNFTMint) {
                throw new Error('No minting system available');
            }
            
            console.log('🎨 Using SimpleNFTMint (demo mode)...');
            const result = await window.SimpleNFTMint.mintNFT();
            
            if (!result.success) {
                throw new Error(result.error || 'Mint failed');
            }
            
            console.log('✅ NFT MINTED!', result);
            
            // Создаём NFT объект для сохранения
            const nft = {
                mintAddress: result.mintAddress,
                signature: result.signature,
                type: result.metadata.gameData.type,
                emoji: result.metadata.gameData.emoji,
                rarity: result.metadata.gameData.rarity,
                tamaBonus: this.phases[this.getCurrentPhase()].tamaBonus,
                mintedAt: Date.now(),
                owner: this.publicKey.toString(),
                metadata: result.metadata
            };
            
            // Сохраняем NFT данные
            this.saveNFTData(nft);
            
            // Записываем минт в базу данных
            const phaseIndex = this.getCurrentPhase();
            if (window.Database && window.Database.recordMint) {
                await window.Database.recordMint(
                    this.publicKey.toString(),
                    nft,
                    price,
                    phaseIndex
                );
            }
            
            // Показываем success modal
            this.showSuccessModal(nft);
            
            // Clear pet name input
            const petNameInput = document.getElementById('pet-name');
            if (petNameInput) {
                petNameInput.value = '';
            }
            
            // Reload stats
            await this.loadMintStats();
            
            // Reset flag
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
                        total_xp: petData.total_xp || 0,
                        tama: this.phases[this.getCurrentPhase()].tamaBonus, // Bonus from mint
                        pet_data: petData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'wallet_address' });
                
                if (error) {
                    console.error('❌ Supabase error:', error);
                    throw error;
                }
                console.log('✅ Pet saved to Supabase successfully!', data);
                
                // Mint recording is handled in the main mintNFT function
                console.log('✅ Pet saved to leaderboard successfully');
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

