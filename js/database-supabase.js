// ============================================
// SUPABASE DATABASE INTEGRATION
// ============================================

// Database module for Supabase integration

const Database = {
    supabase: null,
    initialized: false,
    
    // Initialize Supabase
    async init() {
        try {
            // Check if Supabase library is loaded
            if (typeof window.supabase === 'undefined') {
                console.error('❌ Supabase library not loaded! window.supabase is undefined');
                return false;
            }
            
            // Use environment variables for Supabase configuration
            const supabaseUrl = window.SUPABASE_URL || 'https://your-project.supabase.co';
            const supabaseKey = window.SUPABASE_KEY || 'your-anon-key-here';
            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            
            if (!this.supabase) {
                console.error('❌ Failed to create Supabase client');
                return false;
            }
            
            this.initialized = true;
            console.log('✅ Supabase ready');
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
            // Обновляем в leaderboard
            const { error: leaderboardError } = await this.supabase
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
            
            if (leaderboardError) throw leaderboardError;
            
            // Обновляем в nft_mints (если есть mintAddress)
            if (petData.mintAddress) {
                const { error: nftError } = await this.supabase
                    .from('nft_mints')
                    .update({
                        pet_name: petData.name,
                        evolution: petData.evolution || 0,
                        level: petData.level || 1,
                        xp: petData.xp || 0,
                        total_xp: petData.total_xp || petData.xp || 0,
                        abilities: petData.abilities || [],
                        ability_cooldowns: petData.abilityCooldowns || {},
                        attributes: petData.attributes || {},
                        stats: petData.stats || {},
                        tama_multiplier: petData.tamaMultiplier || 1.0,
                        last_fed: petData.lastFed ? new Date(petData.lastFed).toISOString() : new Date().toISOString(),
                        last_played: petData.lastPlayed ? new Date(petData.lastPlayed).toISOString() : new Date().toISOString(),
                        last_slept: petData.lastSlept ? new Date(petData.lastSlept).toISOString() : new Date().toISOString(),
                        is_dead: petData.isDead || false,
                        is_critical: petData.isCritical || false,
                        is_hibernating: petData.isHibernating || false,
                        is_stealthed: petData.isStealthed || false
                    })
                    .eq('mint_address', petData.mintAddress);
                
                if (nftError) {
                    console.warn('⚠️ Could not update nft_mints:', nftError);
                }
            }
            
            Utils.saveLocal('petData', petData);
        } catch (error) {
            console.error('Failed to save pet data:', error);
            Utils.saveLocal('petData', petData);
        }
    },
    
    // Load player data
    async loadPlayerData(walletAddress) {
        if (!walletAddress) return Utils.loadLocal('playerData');
        
        try {
            const { data, error } = await this.supabase
                .from('leaderboard')
                .select('*')
                .eq('wallet_address', walletAddress);
            
            if (error) {
                console.warn('⚠️ Supabase query error:', error);
                return Utils.loadLocal('playerData');
            }
            
            if (data && data.length > 0) {
                const playerData = data[0];
                Utils.saveLocal('playerData', playerData);
                return playerData;
            }
            
            // No data in database - return null (no NFT)
            console.log('❌ No player data found in database for wallet:', walletAddress);
            return null;
        } catch (error) {
            console.error('❌ Failed to load player data:', error);
            // On error, return null to block access
            return null;
        }
    },
    
    // Get leaderboard
    async getLeaderboard(limit = 10) {
        try {
            if (!this.supabase) {
                console.error('❌ Supabase not initialized');
                return [];
            }
            
            // Use advanced ranking system if available
            if (window.RankingSystem) {
                const players = await window.RankingSystem.getAdvancedLeaderboard(limit);
                return players.map(player => ({
                    wallet: player.wallet_address,
                    level: player.level,
                    xp: player.total_xp, // Use total_xp instead of current xp
                    tama: player.tama,
                    pet_name: player.pet_name,
                    pet_type: player.pet_type,
                    pet_rarity: player.pet_rarity,
                    ranking_score: player.ranking_score
                }));
            }
            
            // Fallback to old system
            const { data, error } = await this.supabase
                .from('leaderboard')
                .select('*')
                .order('total_xp', { ascending: false }) // Use total_xp instead of xp
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
            const { data, error } = await this.supabase
                .from('leaderboard')
                .upsert({
                    wallet_address: walletAddress,
                    ...updates,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'wallet_address' });
            
            if (error) throw error;
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
                    signup_reward: 100
                });
            
            if (refError) throw refError;
            
            // Update referrer's TAMA
            await this.updateTAMA(referrerWallet, 100);
            
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
                    signup_reward: 50
                });
                
                await this.updateTAMA(level2Data.referrer_address, 50);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to add referral:', error);
            return false;
        }
    },
    
    // Update TAMA balance with history tracking
    async updateTAMA(walletAddress, amount, reason = 'Unknown') {
        try {
            // Get current balance or create new player
            let { data } = await this.supabase
                .from('leaderboard')
                .select('tama')
                .eq('wallet_address', walletAddress)
                .single();
            
            // If player doesn't exist, create them
            if (!data) {
                const { error } = await this.supabase
                    .from('leaderboard')
                    .insert({
                        wallet_address: walletAddress,
                        tama: 0,
                        level: 1,
                        xp: 0,
                        total_xp: 0,
                        ranking_score: 0
                    });
                
                if (error) throw error;
                data = { tama: 0 };
            }
            
            const balanceBefore = data?.tama || 0;
            const balanceAfter = balanceBefore + amount;
            
            // Update balance
            await this.supabase
                .from('leaderboard')
                .update({ tama: balanceAfter, updated_at: new Date().toISOString() })
                .eq('wallet_address', walletAddress);
            
            // Save transaction history
            await this.supabase
                .from('tama_transactions')
                .insert({
                    wallet_address: walletAddress,
                    amount: amount,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter,
                    type: amount > 0 ? 'earn' : 'spend',
                    reason: reason
                });
            
            console.log(`💰 TAMA ${amount > 0 ? '+' : ''}${amount} | ${reason} | Balance: ${balanceAfter}`);
        } catch (error) {
            console.error('Failed to update TAMA:', error);
        }
    },
    
    // Get TAMA transaction history
    async getTAMAHistory(walletAddress, limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('tama_transactions')
                .select('*')
                .eq('wallet_address', walletAddress)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get TAMA history:', error);
            return [];
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
            
            const totalReferrals = level1.length;
            
            return {
                referralCount: data.length,
                totalEarnings: data.reduce((sum, r) => sum + (r.signup_reward || 0), 0),
                level1Count: level1.length,
                level2Count: level2.length,
                totalReferrals: totalReferrals
            };
        } catch (error) {
            console.error('Failed to get referral stats:', error);
            return null;
        }
    },
    
    // Check and award milestone rewards
    async checkMilestoneRewards(wallet) {
        if (!this.initialized || !this.supabase) return;
        
        try {
            const stats = await this.getReferralStats(wallet);
            if (!stats) return;
            
            const milestones = [
                { count: 5, reward: 500, badge: 'Recruiter' },
                { count: 10, reward: 1500, badge: 'Influencer' },
                { count: 25, reward: 5000, badge: 'Ambassador' },
                { count: 50, reward: 15000, badge: 'Legend' },
                { count: 100, reward: 50000, badge: 'Legendary Master' }
            ];
            
            // Get player data to check claimed milestones
            const { data: playerData } = await this.supabase
                .from('leaderboard')
                .select('pet_data')
                .eq('wallet_address', wallet)
                .single();
            
            const claimedMilestones = playerData?.pet_data?.claimedMilestones || [];
            
            for (const milestone of milestones) {
                if (stats.totalReferrals >= milestone.count && !claimedMilestones.includes(milestone.count)) {
                    console.log(`🎉 Milestone reached: ${milestone.count} referrals!`);
                    
                    // Award TAMA
                    await this.updateTAMA(wallet, milestone.reward);
                    
                    // Mark as claimed
                    claimedMilestones.push(milestone.count);
                    
                    await this.supabase
                        .from('leaderboard')
                        .update({ 
                            pet_data: { 
                                ...playerData.pet_data, 
                                claimedMilestones,
                                badge: milestone.badge
                            }
                        })
                        .eq('wallet_address', wallet);
                    
                    // Show notification
                    if (window.Utils && window.Utils.showNotification) {
                        Utils.showNotification(`🎉 Milestone! ${milestone.count} referrals → +${milestone.reward} TAMA + ${milestone.badge} Badge!`);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to check milestone rewards:', error);
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
    
    // Get mint stats (total NFTs minted)
    async getMintStats() {
        if (!this.initialized || !this.supabase) {
            console.warn('⚠️ Database not initialized for getMintStats');
            return 0;
        }
        
        try {
            console.log('📊 Fetching mint stats from Supabase...');
            
            const { count, error } = await this.supabase
                .from('nft_mints')
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Supabase error in getMintStats:', error);
                return 0;
            }
            
            const totalMints = count || 0;
            console.log(`✅ Mint stats loaded: ${totalMints} total NFTs minted`);
            return totalMints;
        } catch (error) {
            console.error('❌ Failed to get mint stats:', error);
            return 0;
        }
    },
    
    // Record NFT mint
    async recordMint(walletAddress, nftData, price, phase) {
        if (!this.initialized || !this.supabase) {
            console.error('❌ Database not initialized for recordMint');
            return false;
        }
        
        try {
            console.log('💾 Recording NFT mint to database...', {
                wallet: walletAddress,
                mintAddress: nftData.mintAddress,
                type: nftData.type,
                rarity: nftData.rarity,
                price: price,
                phase: phase
            });
            
            // Создаем полный объект питомца с помощью PetSystem
            let fullPetData = null;
            if (window.PetSystem) {
                fullPetData = window.PetSystem.createPet(
                    nftData.type, 
                    nftData.rarity, 
                    nftData.petName || nftData.name || 'My Pet'
                );
            }
            
            const { data, error } = await this.supabase
                .from('nft_mints')
                .insert({
                    wallet_address: walletAddress,
                    mint_address: nftData.mintAddress,
                    pet_name: nftData.petName || nftData.name || 'My Pet',
                    pet_type: nftData.type,
                    pet_traits: {
                        rarity: nftData.rarity,
                        name: nftData.name || 'My Pet',
                        phase: phase
                    },
                    mint_price: price,
                    mint_timestamp: new Date().toISOString(),
                    transaction_signature: nftData.signature,
                    status: 'minted',
                    // Новые поля для Pet System
                    evolution: fullPetData?.evolution || 0,
                    level: fullPetData?.level || 1,
                    xp: fullPetData?.xp || 0,
                    total_xp: fullPetData?.total_xp || 0,
                    abilities: fullPetData?.abilities || [],
                    ability_cooldowns: fullPetData?.abilityCooldowns || {},
                    attributes: fullPetData?.attributes || {
                        intelligence: 50,
                        strength: 50,
                        speed: 50,
                        magic: 50
                    },
                    stats: fullPetData?.stats || {
                        hunger: 100,
                        energy: 100,
                        happy: 100,
                        health: 100
                    },
                    tama_multiplier: fullPetData?.tamaMultiplier || 1.0,
                    category: fullPetData?.category || 'common',
                    last_fed: new Date().toISOString(),
                    last_played: new Date().toISOString(),
                    last_slept: new Date().toISOString(),
                    is_dead: false,
                    is_critical: false
                })
                .select();
            
            if (error) {
                console.error('❌ Supabase error in recordMint:', error);
                throw error;
            }
            
            console.log('✅ NFT mint recorded successfully!', data);
            
            // ✅ Также обновляем leaderboard с nft_mint_address и TAMA
            // Получаем TAMA бонус из фазы
            const phaseBonuses = { 1: 500, 2: 500, 3: 500, 4: 500 }; // TAMA bonuses per phase
            const tamaBonus = phaseBonuses[phase] || 500;
            
            console.log('🔄 Updating leaderboard with:', {
                wallet: walletAddress,
                mintAddress: nftData.mintAddress,
                name: nftData.name,
                type: nftData.type,
                rarity: nftData.rarity,
                tama: tamaBonus
            });
            
            const updateResult = await this.updatePlayerData(walletAddress, {
                nft_mint_address: nftData.mintAddress,
                pet_name: nftData.name,
                pet_type: nftData.type,
                pet_rarity: nftData.rarity,
                level: nftData.level || 1,
                xp: nftData.xp || 0,
                total_xp: nftData.total_xp || 0,
                tama: tamaBonus, // Use phase-based TAMA bonus
                pet_data: nftData
            });
            
            console.log('✅ Leaderboard update result:', updateResult);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to record mint:', error);
            return false;
        }
    },
    
    // Stub for compatibility
    async updatePlayerStatus() { return true; },
    async rewardReferrers() { return true; }
};

// Export to window for global access
window.Database = Database;

