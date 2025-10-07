// ============================================
// PHANTOM WALLET INTEGRATION
// ============================================

const WalletManager = {
    wallet: null,
    connection: null,
    publicKey: null,
    balance: 0,
    network: 'devnet', // or 'mainnet-beta'
    
    // Initialize wallet connection
    async init() {
        try {
            // Check if Phantom is installed
            if (!window.solana || !window.solana.isPhantom) {
                throw new Error('Phantom wallet not found! Please install it from phantom.app');
            }
            
            this.wallet = window.solana;
            
            // Set up connection to Solana using CORS-friendly endpoints
            const endpoint = this.network === 'mainnet-beta' 
                ? 'https://solana-mainnet.g.alchemy.com/v2/demo'  // Alchemy public endpoint
                : 'https://api.devnet.solana.com';  // For devnet we'll use direct approach
            
            this.connection = new solanaWeb3.Connection(endpoint, 'confirmed');
            
            // Check if already connected
            if (this.wallet.isConnected) {
                await this.handleConnect();
            }
            
            // Listen for account changes
            this.wallet.on('connect', () => this.handleConnect());
            this.wallet.on('disconnect', () => this.handleDisconnect());
            this.wallet.on('accountChanged', (publicKey) => {
                if (publicKey) {
                    this.handleConnect();
                } else {
                    this.handleDisconnect();
                }
            });
            
            return true;
        } catch (error) {
            Utils.handleError(error, 'Wallet Init');
            return false;
        }
    },
    
    // Connect wallet
    async connect() {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }
            
            const resp = await this.wallet.connect();
            this.publicKey = resp.publicKey;
            
            await this.handleConnect();
            
            Utils.showNotification('✅ Wallet connected successfully!');
            return true;
        } catch (error) {
            if (error.message.includes('User rejected')) {
                Utils.showNotification('❌ Connection rejected');
            } else {
                Utils.handleError(error, 'Wallet Connect');
            }
            return false;
        }
    },
    
    // Disconnect wallet
    async disconnect() {
        try {
            if (this.wallet && this.wallet.isConnected) {
                await this.wallet.disconnect();
            }
            this.handleDisconnect();
            Utils.showNotification('👋 Wallet disconnected');
            return true;
        } catch (error) {
            Utils.handleError(error, 'Wallet Disconnect');
            return false;
        }
    },
    
    // Handle successful connection
    async handleConnect() {
        try {
            this.publicKey = this.wallet.publicKey;
            
            // Update UI
            this.updateWalletUI(true);
            
            // Fetch balance
            await this.fetchBalance();
            
            // Load player data
            if (window.Database) {
                await Database.loadPlayerData(this.publicKey.toString());
            }
            
            // Auto-load pet if exists
            if (window.Game) {
                Game.autoLoadPet();
            }
            
            // Update online status
            if (window.Database) {
                Database.updatePlayerStatus(this.publicKey.toString(), 'connect');
            }
            
            // Show game interface
            if (window.Game) {
                Game.showGame();
            }
            
            // Start auto-refresh balance
            this.startBalanceRefresh();
            
        } catch (error) {
            Utils.handleError(error, 'Handle Connect');
        }
    },
    
    // Handle disconnect
    handleDisconnect() {
        // Update online status before disconnect
        if (this.publicKey && window.Database) {
            Database.updatePlayerStatus(this.publicKey.toString(), 'disconnect');
        }
        
        this.publicKey = null;
        this.balance = 0;
        
        // Update UI
        this.updateWalletUI(false);
        
        // Stop balance refresh
        this.stopBalanceRefresh();
        
        // Show landing page
        if (window.Game) {
            Game.showLanding();
        }
        
        // Don't reset game state - keep pet loaded
        // if (window.Game) {
        //     Game.reset();
        // }
    },
    
    // Fetch SOL balance
    async fetchBalance() {
        try {
            if (!this.publicKey || !this.connection) return 0;
            
            const balance = await this.connection.getBalance(this.publicKey);
            this.balance = balance; // Keep in lamports for consistency
            
            // Update UI
            this.updateBalanceDisplay();
            
            return balance;
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            // Set balance to 0 if can't fetch (CORS or network issue)
            this.balance = 0;
            this.updateBalanceDisplay();
            return 0;
        }
    },
    
    // Send SOL transaction
    async sendSOL(recipientAddress, amount) {
        try {
            if (!this.publicKey || !this.connection) {
                throw new Error('Wallet not connected');
            }
            
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: this.publicKey,
                    toPubkey: new solanaWeb3.PublicKey(recipientAddress),
                    lamports: amount
                })
            );
            
            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.publicKey;
            
            // Sign and send transaction
            const signed = await this.wallet.signTransaction(transaction);
            const signature = await this.connection.sendRawTransaction(signed.serialize());
            
            // Confirm transaction
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            // Update balance
            await this.fetchBalance();
            
            return signature;
        } catch (error) {
            Utils.handleError(error, 'Send Transaction');
            throw error;
        }
    },
    
    // Create new pet (costs 0.1 SOL or FREE in demo mode)
    async createPet(petData) {
        try {
            const cost = 0.1 * solanaWeb3.LAMPORTS_PER_SOL; // 0.1 SOL
            
            // If balance is 0 due to CORS or network issues, allow free pet creation (demo mode)
            if (this.balance === 0) {
                Utils.showNotification('⚠️ Running in DEMO mode - Pet created for FREE');
                Utils.showNotification('💡 To use blockchain features, make sure you have SOL in your wallet');
                
                return {
                    success: true,
                    demo: true,
                    petData
                };
            }
            
            if (this.balance < cost) {
                throw new Error('Insufficient balance. Need 0.1 SOL');
            }
            
            // In production, this would be a smart contract call
            // For now, we'll simulate it with a transfer to a treasury wallet
            const treasuryWallet = 'GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump'; // Example address
            
            Utils.showNotification('⏳ Creating pet...');
            
            const signature = await this.sendSOL(treasuryWallet, cost);
            
            Utils.showNotification('✅ Pet created successfully!');
            
            return {
                success: true,
                signature,
                petData
            };
        } catch (error) {
            Utils.handleError(error, 'Create Pet');
            return { success: false };
        }
    },
    
    // Revive pet (costs 0.05 SOL or 100 TAMA or FREE in demo mode)
    async revivePet(useSOL = true) {
        try {
            if (useSOL) {
                const cost = 0.05 * solanaWeb3.LAMPORTS_PER_SOL; // 0.05 SOL
                
                // Demo mode - allow free revival
                if (this.balance === 0) {
                    Utils.showNotification('⚠️ DEMO mode - Pet revived for FREE');
                    return { success: true, demo: true };
                }
                
                if (this.balance < cost) {
                    throw new Error('Insufficient balance. Need 0.05 SOL');
                }
                
                const treasuryWallet = 'GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump';
                
                Utils.showNotification('⏳ Reviving pet...');
                
                const signature = await this.sendSOL(treasuryWallet, cost);
                
                Utils.showNotification('✅ Pet revived with SOL!');
                
                return { success: true, signature };
            } else {
                // Use TAMA tokens
                const playerData = Utils.loadLocal('playerData');
                
                if (!playerData || playerData.tama < 100) {
                    throw new Error('Insufficient TAMA. Need 100 TAMA');
                }
                
                playerData.tama -= 100;
                Utils.saveLocal('playerData', playerData);
                
                Utils.showNotification('✅ Pet revived with TAMA!');
                
                return { success: true };
            }
        } catch (error) {
            Utils.handleError(error, 'Revive Pet');
            return { success: false };
        }
    },
    
    // Update wallet UI
    updateWalletUI(connected) {
        const walletBtn = document.getElementById('wallet-btn');
        const balanceDisplay = document.getElementById('balance-display');
        const networkStatus = document.getElementById('network-status');
        const walletText = walletBtn.querySelector('.wallet-text');
        
        if (connected) {
            walletBtn.classList.add('connected');
            walletText.textContent = Utils.shortenAddress(this.publicKey.toString());
            balanceDisplay.classList.remove('hidden');
            networkStatus.textContent = `Connected to ${Utils.getNetworkName(this.network)}`;
            networkStatus.classList.add('connected');
            
            // Update referral code
            const referralInput = document.getElementById('referral-input');
            const copyBtn = document.getElementById('copy-referral-btn');
            const referralCode = Utils.generateReferralCode(this.publicKey.toString());
            referralInput.value = `${window.location.origin}?ref=${referralCode}`;
            copyBtn.disabled = false;
        } else {
            walletBtn.classList.remove('connected');
            walletText.textContent = 'Connect Wallet';
            balanceDisplay.classList.add('hidden');
            networkStatus.textContent = 'Disconnected';
            networkStatus.classList.remove('connected');
            
            // Reset referral
            const referralInput = document.getElementById('referral-input');
            const copyBtn = document.getElementById('copy-referral-btn');
            referralInput.value = '';
            copyBtn.disabled = true;
        }
    },
    
    // Update balance display
    updateBalanceDisplay() {
        const balanceSol = document.querySelector('.balance-sol');
        const balanceTama = document.querySelector('.balance-tama');
        
        if (balanceSol) {
            balanceSol.textContent = Utils.formatSOL(this.balance);
        }
        
        if (balanceTama) {
            const playerData = Utils.loadLocal('playerData');
            const tama = playerData?.tama || 0;
            balanceTama.textContent = `${tama} TAMA`;
        }
    },
    
    // Start auto-refresh balance
    startBalanceRefresh() {
        this.stopBalanceRefresh();
        this.balanceInterval = setInterval(() => {
            this.fetchBalance();
        }, 30000); // Every 30 seconds
    },
    
    // Stop auto-refresh balance
    stopBalanceRefresh() {
        if (this.balanceInterval) {
            clearInterval(this.balanceInterval);
            this.balanceInterval = null;
        }
    },
    
    // Check if wallet is connected
    isConnected() {
        return this.wallet && this.wallet.isConnected && this.publicKey;
    },
    
    // Get wallet address
    getAddress() {
        return this.publicKey ? this.publicKey.toString() : null;
    },
    
    // Get balance in SOL
    getBalanceSOL() {
        return this.balance / solanaWeb3.LAMPORTS_PER_SOL;
    },
    
    // Switch network (for testing)
    async switchNetwork(network) {
        this.network = network;
        
        const endpoint = network === 'mainnet-beta' 
            ? 'https://api.mainnet-beta.solana.com'
            : 'https://api.devnet.solana.com';
        
        this.connection = new solanaWeb3.Connection(endpoint, 'confirmed');
        
        if (this.isConnected()) {
            await this.fetchBalance();
        }
        
        Utils.showNotification(`🔄 Switched to ${Utils.getNetworkName(network)}`);
    },
    
    // Request airdrop (devnet only)
    async requestAirdrop(amount = 1) {
        try {
            if (this.network !== 'devnet') {
                throw new Error('Airdrops only available on devnet');
            }
            
            if (!this.publicKey) {
                throw new Error('Wallet not connected');
            }
            
            Utils.showNotification('⏳ Requesting airdrop...');
            
            const signature = await this.connection.requestAirdrop(
                this.publicKey,
                amount * solanaWeb3.LAMPORTS_PER_SOL
            );
            
            await this.connection.confirmTransaction(signature, 'confirmed');
            await this.fetchBalance();
            
            Utils.showNotification(`✅ Received ${amount} SOL airdrop!`);
            
            return true;
        } catch (error) {
            Utils.handleError(error, 'Request Airdrop');
            return false;
        }
    }
};

// Export for use in other files
window.WalletManager = WalletManager;

