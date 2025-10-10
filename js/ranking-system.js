// 🏆 ADVANCED RANKING SYSTEM
// Like top NFT projects (Axie, Sandbox, Decentraland)

class RankingSystem {
    constructor() {
        this.rarityMultipliers = {
            'common': 0,
            'rare': 1,
            'epic': 2,
            'legendary': 3,
            'mythic': 5
        };
        
        this.activityThresholds = {
            daily: 30,    // 30 minutes = daily bonus
            weekly: 180,  // 3 hours = weekly bonus
            monthly: 720  // 12 hours = monthly bonus
        };
    }
    
    // Calculate comprehensive player score
    calculatePlayerScore(player) {
        const totalXP = player.total_xp || 0;
        const level = player.level || 1;
        const tama = player.tama || 0;
        const rarity = player.pet_rarity || 'common';
        const playtime = player.total_playtime || 0;
        const lastActivity = new Date(player.last_activity || player.updated_at);
        const now = new Date();
        
        // Base score from XP and level
        const baseScore = totalXP + (level * 100);
        
        // TAMA economic activity (0.1 multiplier)
        const tamaScore = tama * 0.1;
        
        // Rarity bonus (like NFT value)
        const rarityBonus = this.rarityMultipliers[rarity] * 50;
        
        // Activity bonus (time-based)
        const activityBonus = this.calculateActivityBonus(playtime, lastActivity, now);
        
        // Final score
        const finalScore = Math.round(baseScore + tamaScore + rarityBonus + activityBonus);
        
        return {
            score: finalScore,
            breakdown: {
                baseScore,
                tamaScore,
                rarityBonus,
                activityBonus,
                total: finalScore
            }
        };
    }
    
    // Calculate activity bonus based on playtime and recency
    calculateActivityBonus(playtime, lastActivity, now) {
        let bonus = 0;
        
        // Playtime bonus
        if (playtime >= this.activityThresholds.monthly) {
            bonus += 50; // Monthly active player
        } else if (playtime >= this.activityThresholds.weekly) {
            bonus += 30; // Weekly active player
        } else if (playtime >= this.activityThresholds.daily) {
            bonus += 10; // Daily active player
        }
        
        // Recency bonus (recent activity gets bonus)
        const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);
        if (hoursSinceActivity < 24) {
            bonus += 20; // Active in last 24h
        } else if (hoursSinceActivity < 168) { // 7 days
            bonus += 10; // Active in last week
        }
        
        return bonus;
    }
    
    // Get rarity tier name
    getRarityTier(rarity) {
        const tiers = {
            'common': '🥉 Common',
            'rare': '🥈 Rare', 
            'epic': '🥇 Epic',
            'legendary': '💎 Legendary',
            'mythic': '👑 Mythic'
        };
        return tiers[rarity] || '🥉 Common';
    }
    
    // Get activity status
    getActivityStatus(lastActivity) {
        const now = new Date();
        const hoursSinceActivity = (now - new Date(lastActivity)) / (1000 * 60 * 60);
        
        if (hoursSinceActivity < 1) {
            return '🟢 Online';
        } else if (hoursSinceActivity < 24) {
            return '🟡 Active';
        } else if (hoursSinceActivity < 168) { // 7 days
            return '🟠 Away';
        } else {
            return '🔴 Offline';
        }
    }
    
    // Format playtime
    formatPlaytime(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        } else if (minutes < 1440) { // 24 hours
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        } else {
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return `${days}d ${hours}h`;
        }
    }
    
    // Update player ranking score
    async updatePlayerRanking(walletAddress, playerData) {
        if (!window.Database || !window.Database.supabase) {
            console.error('❌ Database not available for ranking update');
            return false;
        }
        
        try {
            const ranking = this.calculatePlayerScore(playerData);
            
            const { error } = await window.Database.supabase
                .from('leaderboard')
                .update({
                    ranking_score: ranking.score,
                    total_xp: playerData.total_xp || 0,
                    last_activity: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('wallet_address', walletAddress);
            
            if (error) throw error;
            
            console.log(`🏆 Updated ranking for ${walletAddress}: ${ranking.score} points`);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to update ranking:', error);
            return false;
        }
    }
    
    // Get leaderboard with advanced ranking
    async getAdvancedLeaderboard(limit = 50) {
        if (!window.Database || !window.Database.supabase) {
            console.error('❌ Database not available for leaderboard');
            return [];
        }
        
        try {
            const { data: players, error } = await window.Database.supabase
                .from('leaderboard')
                .select('*')
                .order('ranking_score', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            
            // Add calculated fields
            return players.map((player, index) => ({
                ...player,
                rank: index + 1,
                rarityTier: this.getRarityTier(player.pet_rarity),
                activityStatus: this.getActivityStatus(player.last_activity),
                playtimeFormatted: this.formatPlaytime(player.total_playtime || 0),
                scoreBreakdown: this.calculatePlayerScore(player).breakdown
            }));
            
        } catch (error) {
            console.error('❌ Failed to get leaderboard:', error);
            return [];
        }
    }
}

// Initialize global ranking system
window.RankingSystem = new RankingSystem();

console.log('🏆 Advanced Ranking System loaded!');

