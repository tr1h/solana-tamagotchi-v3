// ============================================
// TAMA TOKEN SYSTEM
// ============================================

const TAMASystem = {
    // Use new token system
    get token() {
        return window.TAMAToken;
    },
    
    // TAMA награды (kept for backward compatibility)
    get REWARDS() {
        return this.token?.ECONOMICS.EARN_RATES || {};
    },
    
    // Daily earnings cap
    get DAILY_CAP() {
        return this.token?.ECONOMICS.DAILY_LIMITS.TOTAL_EARN || 150;
    },
    
    // Award TAMA with reason tracking (now uses TAMAToken)
    async awardTAMA(walletAddress, amount, reason) {
        if (!walletAddress) return false;
        
        try {
            console.log(`💰 Awarding ${amount} TAMA for: ${reason}`);
            
            // Use new token system
            if (window.TAMAToken) {
                return await window.TAMAToken.award(walletAddress, amount, reason);
            }
            
            // Fallback to old system
            if (window.Database) {
                await window.Database.updateTAMA(walletAddress, amount, reason);
                
                if (window.Utils && window.Utils.showNotification) {
                    window.Utils.showNotification(`+${amount} TAMA - ${reason}`);
                }
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to award TAMA:', error);
            return false;
        }
    },
    
    // Check daily login
    async checkDailyLogin(walletAddress) {
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('lastLogin');
        
        if (lastLogin !== today) {
            localStorage.setItem('lastLogin', today);
            await this.awardTAMA(walletAddress, this.REWARDS.DAILY_LOGIN || 25, 'Daily Login');
            return true;
        }
        return false;
    },
    
    // Award for feeding pet
    async awardFeeding(walletAddress) {
        const dailyEarnings = this.getTodayEarnings();
        
        if (dailyEarnings >= this.DAILY_CAP) {
            if (window.Utils) {
                Utils.showNotification('⚠️ Daily TAMA cap reached!');
            }
            return false;
        }
        
        await this.awardTAMA(walletAddress, this.REWARDS.FEED_PET || 5, 'Feeding Pet');
        this.updateTodayEarnings(this.REWARDS.FEED_PET);
        return true;
    },
    
    // Award for playing with pet
    async awardPlaying(walletAddress) {
        const dailyEarnings = this.getTodayEarnings();
        
        if (dailyEarnings >= this.DAILY_CAP) {
            if (window.Utils) {
                Utils.showNotification('⚠️ Daily TAMA cap reached!');
            }
            return false;
        }
        
        await this.awardTAMA(walletAddress, this.REWARDS.PLAY_WITH_PET || 10, 'Playing with Pet');
        this.updateTodayEarnings(this.REWARDS.PLAY_WITH_PET);
        return true;
    },
    
    // Award for training
    async awardTraining(walletAddress) {
        const dailyEarnings = this.getTodayEarnings();
        
        if (dailyEarnings >= this.DAILY_CAP) {
            if (window.Utils) {
                Utils.showNotification('⚠️ Daily TAMA cap reached!');
            }
            return false;
        }
        
        await this.awardTAMA(walletAddress, this.REWARDS.TRAIN_PET || 15, 'Training Pet');
        this.updateTodayEarnings(this.REWARDS.TRAIN_PET);
        return true;
    },
    
    // Award for level up
    async awardLevelUp(walletAddress, newLevel) {
        const bonus = this.REWARDS.LEVEL_UP * newLevel; // Больше за высокие уровни
        await this.awardTAMA(walletAddress, bonus, `Level ${newLevel} Reached!`);
        return true;
    },
    
    // Award for evolution
    async awardEvolution(walletAddress, evolutionStage) {
        const bonus = this.REWARDS.EVOLUTION * evolutionStage;
        await this.awardTAMA(walletAddress, bonus, `Evolution Stage ${evolutionStage}!`);
        return true;
    },
    
    // Award for achievement
    async awardAchievement(walletAddress, achievementType) {
        const amount = this.REWARDS.ACHIEVEMENT[achievementType] || this.REWARDS.ACHIEVEMENT.BRONZE;
        await this.awardTAMA(walletAddress, amount, `Achievement Unlocked!`);
        return true;
    },
    
    // Process referral rewards
    async processReferralReward(referrerWallet, newPlayerWallet, level) {
        if (!referrerWallet || !newPlayerWallet) return;
        
        try {
            const reward = level === 1 ? this.REWARDS.REFERRAL.LEVEL_1 : this.REWARDS.REFERRAL.LEVEL_2;
            
            await this.awardTAMA(referrerWallet, reward, `Referral Level ${level}`);
            
            // Save to database
            if (window.Database && window.Database.supabase) {
                await window.Database.supabase
                    .from('referrals')
                    .insert({
                        referrer_address: referrerWallet,
                        referred_address: newPlayerWallet,
                        level: level,
                        signup_reward: reward,
                        created_at: new Date().toISOString()
                    });
            }
            
            // Check milestone rewards
            if (window.Database && window.Database.checkMilestoneRewards) {
                await window.Database.checkMilestoneRewards(referrerWallet);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to process referral:', error);
            return false;
        }
    },
    
    // Award percentage from earnings (referral passive income)
    async awardReferralPercentage(referrerWallet, earnedAmount, level) {
        const percentage = level === 1 ? this.REWARDS.REFERRAL.PERCENT_L1 : this.REWARDS.REFERRAL.PERCENT_L2;
        const reward = Math.floor(earnedAmount * percentage);
        
        if (reward > 0) {
            await this.awardTAMA(referrerWallet, reward, `Referral Bonus (${percentage * 100}%)`);
        }
    },
    
    // Get today's earnings (for daily cap)
    getTodayEarnings() {
        const today = new Date().toDateString();
        const data = JSON.parse(localStorage.getItem('dailyEarnings') || '{}');
        
        if (data.date !== today) {
            return 0;
        }
        
        return data.amount || 0;
    },
    
    // Update today's earnings
    updateTodayEarnings(amount) {
        const today = new Date().toDateString();
        const data = JSON.parse(localStorage.getItem('dailyEarnings') || '{}');
        
        localStorage.setItem('dailyEarnings', JSON.stringify({
            date: today,
            amount: (data.date === today ? data.amount || 0 : 0) + amount
        }));
    },
    
    // Get TAMA balance
    async getBalance(walletAddress) {
        if (!window.Database || !walletAddress) return 0;
        
        try {
            const { data } = await window.Database.supabase
                .from('leaderboard')
                .select('tama')
                .eq('wallet_address', walletAddress)
                .single();
            
            return data?.tama || 0;
        } catch (error) {
            console.error('Failed to get TAMA balance:', error);
            return 0;
        }
    },
    
    // Spend TAMA (for shop purchases)
    async spendTAMA(walletAddress, amount, item) {
        if (!window.Database || !walletAddress) return false;
        
        try {
            const balance = await this.getBalance(walletAddress);
            
            if (balance < amount) {
                if (window.Utils) {
                    Utils.showNotification('❌ Insufficient TAMA balance!');
                }
                return false;
            }
            
            // Update TAMA with reason for history
            await window.Database.updateTAMA(walletAddress, -amount, item);
            
            if (window.Utils) {
                Utils.showNotification(`✅ Purchased ${item} for ${amount} TAMA!`);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to spend TAMA:', error);
            return false;
        }
    }
};

// Export
window.TAMASystem = TAMASystem;



