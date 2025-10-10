// ============================================
// TAMA TOKEN SYSTEM
// Architecture ready for SPL Token integration
// ============================================

const TAMAToken = {
    // Token Configuration
    CONFIG: {
        // Future SPL Token Address (будет заполнено после деплоя токена)
        TOKEN_MINT: null, // 'ваш_токен_адрес_здесь'
        DECIMALS: 9, // Standard for Solana tokens
        SYMBOL: 'TAMA',
        NAME: 'Tamagotchi Token',
        
        // Temporary: Use database-backed balance tracking
        USE_DATABASE: true,
        USE_SPL_TOKEN: false // Switch to true when token is deployed
    },
    
    // Token Economics (готово для Mainnet)
    ECONOMICS: {
        // Initial mint for treasury
        INITIAL_SUPPLY: 1_000_000_000, // 1 billion TAMA
        
        // Distribution
        TREASURY: 0.30,        // 30% - Treasury for rewards
        TEAM: 0.15,            // 15% - Team (vested)
        LIQUIDITY: 0.20,       // 20% - Liquidity pools
        NFT_HOLDERS: 0.25,     // 25% - NFT holder rewards
        MARKETING: 0.10,       // 10% - Marketing & partnerships
        
        // Earning rates (per action)
        EARN_RATES: {
            MINT_NFT: 500,
            DAILY_LOGIN: 25,
            FEED_PET: 5,
            PLAY_WITH_PET: 10,
            TRAIN_PET: 15,
            LEVEL_UP: 50,
            EVOLUTION: 100,
            ACHIEVEMENT_BRONZE: 10,
            ACHIEVEMENT_SILVER: 25,
            ACHIEVEMENT_GOLD: 50,
            ACHIEVEMENT_PLATINUM: 100,
            REFERRAL_L1: 25,
            REFERRAL_L2: 12
        },
        
        // Spending costs
        COSTS: {
            EVOLVE_PET: 50,
            HEAL_PET: 10,
            SPECIAL_ITEMS: {
                RARE_FOOD: 20,
                SPECIAL_TOY: 30,
                PET_ACCESSORY: 50
            }
        },
        
        // Daily caps to prevent abuse
        DAILY_LIMITS: {
            TOTAL_EARN: 150,
            FEED_COUNT: 10,
            PLAY_COUNT: 10
        }
    },
    
    initialized: false,
    
    // Initialize token system
    async init() {
        console.log('🪙 Initializing TAMA Token System...');
        
        if (this.CONFIG.USE_SPL_TOKEN && this.CONFIG.TOKEN_MINT) {
            // Future: Initialize SPL Token integration
            await this.initSPLToken();
        } else {
            // Current: Use database-backed system
            console.log('💾 Using database-backed token system');
        }
        
        this.initialized = true;
        console.log('✅ TAMA Token System ready');
        return true;
    },
    
    // Future: Initialize SPL Token
    async initSPLToken() {
        console.log('🔗 Initializing SPL Token integration...');
        
        // TODO: Add SPL Token program integration
        // const token = await Token.getAssociatedTokenAddress(...)
        
        console.log('✅ SPL Token integration ready');
    },
    
    // Get token balance
    async getBalance(walletAddress) {
        if (!walletAddress) return 0;
        
        try {
            if (this.CONFIG.USE_SPL_TOKEN) {
                // Future: Get balance from SPL Token account
                return await this.getSPLBalance(walletAddress);
            } else {
                // Current: Get balance from database
                return await this.getDatabaseBalance(walletAddress);
            }
        } catch (error) {
            console.error('Failed to get TAMA balance:', error);
            return 0;
        }
    },
    
    // Get balance from database
    async getDatabaseBalance(walletAddress) {
        if (!window.Database) return 0;
        
        try {
            const { data } = await window.Database.supabase
                .from('leaderboard')
                .select('tama')
                .eq('wallet_address', walletAddress)
                .single();
            
            return data?.tama || 0;
        } catch (error) {
            // If player doesn't exist, return 0
            console.log('Player not found in database, returning 0 TAMA');
            return 0;
        }
    },
    
    // Future: Get balance from SPL Token account
    async getSPLBalance(walletAddress) {
        // TODO: Implement SPL Token balance check
        console.log('🔗 Getting SPL Token balance for:', walletAddress);
        return 0;
    },
    
    // Award tokens (with history tracking)
    async award(walletAddress, amount, reason) {
        if (!walletAddress || amount <= 0) {
            console.warn('Invalid award parameters');
            return false;
        }
        
        try {
            console.log(`💰 Awarding ${amount} TAMA to ${walletAddress.slice(0, 8)}... for: ${reason}`);
            
            if (this.CONFIG.USE_SPL_TOKEN) {
                // Future: Transfer SPL tokens
                return await this.transferSPL(walletAddress, amount, reason);
            } else {
                // Current: Update database balance
                return await this.updateDatabaseBalance(walletAddress, amount, reason);
            }
        } catch (error) {
            console.error('Failed to award TAMA:', error);
            return false;
        }
    },
    
    // Update database balance
    async updateDatabaseBalance(walletAddress, amount, reason) {
        if (!window.Database) return false;
        
        try {
            // Get current balance
            const { data } = await window.Database.supabase
                .from('leaderboard')
                .select('tama')
                .eq('wallet_address', walletAddress)
                .single();
            
            const balanceBefore = data?.tama || 0;
            const balanceAfter = balanceBefore + amount;
            
            // Update balance in leaderboard
            await window.Database.supabase
                .from('leaderboard')
                .update({ 
                    tama: balanceAfter, 
                    updated_at: new Date().toISOString() 
                })
                .eq('wallet_address', walletAddress);
            
            // Save transaction history
            await window.Database.supabase
                .from('tama_transactions')
                .insert({
                    wallet_address: walletAddress,
                    amount: amount,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter,
                    type: amount > 0 ? 'earn' : 'spend',
                    reason: reason
                });
            
            // Update UI
            if (window.WalletManager) {
                window.WalletManager.updateBalanceDisplay();
            }
            
            // Show notification
            if (window.Utils && window.Utils.showNotification) {
                const emoji = amount > 0 ? '💰' : '💸';
                window.Utils.showNotification(`${emoji} ${amount > 0 ? '+' : ''}${amount} TAMA - ${reason}`);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to update database balance:', error);
            return false;
        }
    },
    
    // Future: Transfer SPL tokens
    async transferSPL(walletAddress, amount, reason) {
        // TODO: Implement SPL Token transfer
        console.log('🔗 Transferring SPL tokens:', { walletAddress, amount, reason });
        return false;
    },
    
    // Spend tokens
    async spend(walletAddress, amount, reason) {
        if (!walletAddress || amount <= 0) return false;
        
        // Check balance first
        const balance = await this.getBalance(walletAddress);
        if (balance < amount) {
            if (window.Utils && window.Utils.showNotification) {
                window.Utils.showNotification(`❌ Insufficient TAMA. Need ${amount}, have ${balance}`);
            }
            return false;
        }
        
        // Award negative amount (spend)
        return await this.award(walletAddress, -amount, reason);
    },
    
    // Get transaction history
    async getHistory(walletAddress, limit = 50) {
        if (!walletAddress || !window.Database) return [];
        
        try {
            const { data, error } = await window.Database.supabase
                .from('tama_transactions')
                .select('*')
                .eq('wallet_address', walletAddress)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get transaction history:', error);
            return [];
        }
    },
    
    // Check daily earning limits
    async checkDailyLimit(walletAddress, actionType) {
        // TODO: Implement daily limit checking
        return true;
    },
    
    // Format token amount with decimals
    formatAmount(amount) {
        return (amount / Math.pow(10, this.CONFIG.DECIMALS)).toFixed(2);
    },
    
    // Get token info (for future token integration)
    getTokenInfo() {
        return {
            mint: this.CONFIG.TOKEN_MINT,
            symbol: this.CONFIG.SYMBOL,
            name: this.CONFIG.NAME,
            decimals: this.CONFIG.DECIMALS,
            supply: this.ECONOMICS.INITIAL_SUPPLY
        };
    }
};

// Export for global access
window.TAMAToken = TAMAToken;

// Auto-initialize when loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🪙 Initializing TAMA Token system...');
    await TAMAToken.init();
});

console.log('🪙 TAMA Token module loaded');

