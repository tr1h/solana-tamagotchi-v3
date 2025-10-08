// ============================================
// SUPABASE DATABASE INTEGRATION
// ============================================

const Database = {
    supabase: null,
    initialized: false,
    
    // Initialize Supabase
    async init() {
        try {
            if (typeof supabase === 'undefined') {
                console.error('❌ Supabase library not loaded!');
                return false;
            }
            
            const { createClient } = supabase;
            this.supabase = createClient(
                'https://zfrazyupameidxpjihrh.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmcmF6eXVwYW1laWR4cGppaHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Mzc1NTAsImV4cCI6MjA3NTUxMzU1MH0.1EkMDqCNJoAjcJDh3Dd3yPfus-JpdcwE--z2dhjh7wU'
            );
            this.initialized = true;
            console.log('✅ Supabase initialized successfully');
            console.log('✅ Supabase URL:', 'https://zfrazyupameidxpjihrh.supabase.co');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            return false;
        }
    },
    
    // Save pet data
    async savePetData(walletAddress, petData) {
        if (!walletAddress) return Utils.saveLocal('petData', petData);
        
        try {
            const { error } = await this.supabase
                .from('leaderboard')
                .upsert({
                    wallet_address: walletAddress,
                    pet_name: petData.name,
                    pet_type: petData.type,
                    pet_rarity: petData.rarity,
                    level: petData.level,
                    xp: petData.xp,
                    pet_data: petData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'wallet_address' });
            
            if (error) throw error;
            Utils.saveLocal('petData', petData);
        } catch (error) {
            console.error('Failed to save pet data:', error);
            Utils.saveLocal('petData', petData);
        }
    },
    
    // Load player data
    async loadPlayerData(walletAddress) {
        if (!walletAddress) return Utils.getLocal('playerData');
        
        try {
            const { data, error } = await this.supabase
                .from('leaderboard')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                Utils.saveLocal('playerData', data);
                return data;
            }
            return Utils.getLocal('playerData');
        } catch (error) {
            console.error('Failed to load player data:', error);
            return Utils.getLocal('playerData');
        }
    },
    
    // Get leaderboard
    async getLeaderboard(limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('leaderboard')
                .select('*')
                .order('xp', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get leaderboard:', error);
            return [];
        }
    },
    
    // Update player data
    async updatePlayerData(walletAddress, updates) {
        if (!walletAddress) {
            console.warn('⚠️ No wallet address provided to updatePlayerData');
            return false;
        }
        
        if (!this.initialized || !this.supabase) {
            console.error('❌ Database not initialized in updatePlayerData');
            return false;
        }
        
        try {
            console.log('💾 Saving to Supabase:', walletAddress, updates);
            const { data, error } = await this.supabase
                .from('leaderboard')
                .upsert({
                    wallet_address: walletAddress,
                    ...updates,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'wallet_address' });
            
            if (error) throw error;
            console.log('✅ Data saved to Supabase successfully!', data);
            return true;
        } catch (error) {
            console.error('❌ Failed to update player data:', error);
            return false;
        }
    },
    
    // Add referral
    async addReferral(referralCode, newPlayerWallet) {
        if (!referralCode || !newPlayerWallet) return false;
        
        try {
            // Decode referral code to get referrer wallet
            const referrerWallet = atob(referralCode);
            
            // Add Level 1 referral
            const { error: refError } = await this.supabase
                .from('referrals')
                .insert({
                    referrer_address: referrerWallet,
                    referred_address: newPlayerWallet,
                    referral_code: referralCode,
                    level: 1,
                    signup_reward: 25
                });
            
            if (refError) throw refError;
            
            // Update referrer's TAMA
            await this.updateTAMA(referrerWallet, 25);
            
            // Check for Level 2
            const { data: level2Data } = await this.supabase
                .from('referrals')
                .select('referrer_address')
                .eq('referred_address', referrerWallet)
                .eq('level', 1)
                .single();
            
            if (level2Data) {
                await this.supabase.from('referrals').insert({
                    referrer_address: level2Data.referrer_address,
                    referred_address: newPlayerWallet,
                    referral_code: referralCode,
                    level: 2,
                    signup_reward: 12
                });
                
                await this.updateTAMA(level2Data.referrer_address, 12);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to add referral:', error);
            return false;
        }
    },
    
    // Update TAMA balance
    async updateTAMA(walletAddress, amount) {
        try {
            const { data } = await this.supabase
                .from('leaderboard')
                .select('tama')
                .eq('wallet_address', walletAddress)
                .single();
            
            const newTAMA = (data?.tama || 0) + amount;
            
            await this.supabase
                .from('leaderboard')
                .update({ tama: newTAMA })
                .eq('wallet_address', walletAddress);
        } catch (error) {
            console.error('Failed to update TAMA:', error);
        }
    },
    
    // Get referral stats
    async getReferralStats(wallet) {
        if (!wallet) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('referrals')
                .select('*')
                .eq('referrer_address', wallet);
            
            if (error) throw error;
            
            const level1 = data.filter(r => r.level === 1);
            const level2 = data.filter(r => r.level === 2);
            
            return {
                referralCount: data.length,
                totalEarnings: data.reduce((sum, r) => sum + (r.signup_reward || 0), 0),
                level1Count: level1.length,
                level2Count: level2.length
            };
        } catch (error) {
            console.error('Failed to get referral stats:', error);
            return null;
        }
    },
    
    // Link Telegram to wallet
    async linkTelegramToWallet(walletAddress, telegramId, telegramUsername) {
        try {
            const { error } = await this.supabase
                .from('leaderboard')
                .upsert({
                    wallet_address: walletAddress,
                    telegram_id: telegramId,
                    telegram_username: telegramUsername
                }, { onConflict: 'wallet_address' });
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to link Telegram:', error);
            return false;
        }
    },
    
    // Get player count (stub for compatibility)
    async getPlayerCount() {
        try {
            const { count } = await this.supabase
                .from('leaderboard')
                .select('*', { count: 'exact', head: true });
            return count || 0;
        } catch (error) {
            return 0;
        }
    },
    
    // Stub for compatibility
    async updatePlayerStatus() { return true; },
    async rewardReferrers() { return true; }
};

// Export to window for global access
window.Database = Database;

// Don't auto-init - let game.js control initialization
console.log('✅ Database module loaded');

