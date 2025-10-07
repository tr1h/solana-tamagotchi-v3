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
        { max: 99999, price: 1.0, tamaBonus: 500 }
    ],
    
    currentMinted: 0,
    
    async init() {
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
    },
    
    async loadMintStats() {
        // TODO: Load from blockchain
        // For now, simulate
        this.currentMinted = Math.floor(Math.random() * 50);
        
        document.getElementById('minted-count').textContent = this.currentMinted;
        document.getElementById('mint-progress').style.width = `${(this.currentMinted / 100) * 100}%`;
        
        // Update price
        const currentPrice = this.getCurrentPrice();
        document.getElementById('mint-price').textContent = `${currentPrice} SOL`;
        
        // Update USD (rough estimate)
        const solPrice = 150; // $150 per SOL
        document.getElementById('price-usd').textContent = `≈ $${(currentPrice * solPrice).toFixed(0)} USD`;
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
    
    async mintNFT() {
        if (!this.publicKey) {
            alert('Please connect wallet first!');
            return;
        }
        
        const mintBtn = document.getElementById('mint-btn');
        mintBtn.disabled = true;
        mintBtn.querySelector('.btn-text').textContent = 'MINTING...';
        
        try {
            // Get current price
            const price = this.getCurrentPrice();
            const lamports = price * solanaWeb3.LAMPORTS_PER_SOL;
            
            // Treasury wallet (replace with yours)
            const treasuryWallet = 'GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump';
            
            // Create transaction
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: this.publicKey,
                    toPubkey: new solanaWeb3.PublicKey(treasuryWallet),
                    lamports: lamports
                })
            );
            
            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.publicKey;
            
            // Sign and send
            const signed = await this.wallet.signTransaction(transaction);
            const signature = await this.connection.sendRawTransaction(signed.serialize());
            
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            // Generate random NFT
            const nft = this.generateNFT();
            
            // Save NFT data
            this.saveNFTData(nft);
            
            // Show success modal
            this.showSuccessModal(nft);
            
            // Update stats
            this.currentMinted++;
            await this.loadMintStats();
            
        } catch (error) {
            console.error('Mint failed:', error);
            alert('Mint failed! ' + error.message);
            
            mintBtn.disabled = false;
            mintBtn.querySelector('.btn-text').textContent = `MINT NOW - ${this.getCurrentPrice()} SOL`;
        }
    },
    
    generateNFT() {
        const types = ['cat', 'dog', 'dragon', 'fox', 'bear'];
        const emojis = ['🐱', '🐶', '🐉', '🦊', '🐻'];
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
    },
    
    animatePreview() {
        const pets = ['🐱', '🐶', '🐉', '🦊', '🐻'];
        const rarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
        const colors = [
            'linear-gradient(135deg, #8AC926, #6A994E)',
            'linear-gradient(135deg, #1982C4, #155A8A)',
            'linear-gradient(135deg, #6A4C93, #4A3068)',
            'linear-gradient(135deg, #FF8C42, #E07A3E)'
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

