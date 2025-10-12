// ============================================
// ACHIEVEMENTS SYSTEM
// ============================================

const Achievements = {
    achievements: {
        first_click: {
            id: 'first_click',
            name: 'First Click',
            description: 'Click your pet for the first time',
            icon: '👆',
            reward: { xp: 10, tama: 5 },
            unlocked: false,
            condition: () => true
        },
        click_master: {
            id: 'click_master',
            name: 'Click Master',
            description: 'Click your pet 10 times',
            icon: '👆',
            reward: { xp: 50, tama: 25 },
            unlocked: false,
            condition: () => {
                const playerData = Utils.loadLocal('playerData');
                return playerData && (playerData.petClicks || 0) >= 10;
            }
        },
        click_legend: {
            id: 'click_legend',
            name: 'Click Legend',
            description: 'Click your pet 100 times',
            icon: '👑',
            reward: { xp: 200, tama: 100 },
            unlocked: false,
            condition: () => {
                const playerData = Utils.loadLocal('playerData');
                return playerData && (playerData.petClicks || 0) >= 100;
            }
        },
        first_pet: {
            id: 'first_pet',
            name: 'First Pet',
            description: 'Create your first pet',
            icon: '🥇',
            reward: { xp: 100, tama: 50 },
            unlocked: false,
            condition: () => true
        },
        level_10: {
            id: 'level_10',
            name: 'Level 10',
            description: 'Reach level 10 with your pet',
            icon: '⭐',
            reward: { xp: 500, tama: 100 },
            unlocked: false,
            condition: (level) => level >= 10
        },
        level_50: {
            id: 'level_50',
            name: 'Level 50',
            description: 'Reach level 50 with your pet',
            icon: '🌟',
            reward: { xp: 2000, tama: 500 },
            unlocked: false,
            condition: (level) => level >= 50
        },
        perfect_care: {
            id: 'perfect_care',
            name: 'Perfect Care',
            description: 'Keep all stats above 80 for 24 hours',
            icon: '💯',
            reward: { xp: 200, tama: 75 },
            unlocked: false,
            condition: () => {
                const pet = Game.pet;
                if (!pet) return false;
                return pet.stats.hunger >= 80 && 
                       pet.stats.energy >= 80 && 
                       pet.stats.happy >= 80 && 
                       pet.stats.health >= 80;
            }
        },
        evolution_master: {
            id: 'evolution_master',
            name: 'Evolution Master',
            description: 'Evolve pet to max stage',
            icon: '✨',
            reward: { xp: 1000, tama: 300 },
            unlocked: false,
            condition: () => {
                const pet = Game.pet;
                return pet && pet.evolution >= 5;
            }
        },
        collector: {
            id: 'collector',
            name: 'Collector',
            description: 'Own 5 different pets',
            icon: '🎨',
            reward: { xp: 500, tama: 200 },
            unlocked: false,
            condition: () => {
                const history = Utils.loadLocal('petHistory') || [];
                return history.length >= 5;
            }
        },
        legendary_pet: {
            id: 'legendary_pet',
            name: 'Legendary Pet',
            description: 'Get a legendary rarity pet',
            icon: '👑',
            reward: { xp: 1500, tama: 400 },
            unlocked: false,
            condition: () => {
                const pet = Game.pet;
                return pet && pet.rarity === 'legendary';
            }
        },
        daily_player: {
            id: 'daily_player',
            name: 'Daily Player',
            description: 'Claim daily reward 7 days in a row',
            icon: '📅',
            reward: { xp: 300, tama: 150 },
            unlocked: false,
            condition: () => {
                const playerData = Utils.loadLocal('playerData');
                return playerData && (playerData.dailyStreak || 0) >= 7;
            }
        },
        referral_master: {
            id: 'referral_master',
            name: 'Referral Master',
            description: 'Refer 10 players',
            icon: '🎁',
            reward: { xp: 1000, tama: 500 },
            unlocked: false,
            condition: () => {
                const playerData = Utils.loadLocal('playerData');
                return playerData && (playerData.referrals || 0) >= 10;
            }
        },
        big_spender: {
            id: 'big_spender',
            name: 'Big Spender',
            description: 'Spend 1 SOL in the game',
            icon: '💰',
            reward: { xp: 800, tama: 400 },
            unlocked: false,
            condition: () => {
                const playerData = Utils.loadLocal('playerData');
                return playerData && (playerData.totalSpent || 0) >= 1;
            }
        },
        survivor: {
            id: 'survivor',
            name: 'Survivor',
            description: 'Keep pet alive for 30 days',
            icon: '🏆',
            reward: { xp: 2000, tama: 1000 },
            unlocked: false,
            condition: () => {
                const pet = Game.pet;
                if (!pet || pet.isDead) return false;
                const daysSinceCreation = (Date.now() - pet.createdAt) / (1000 * 60 * 60 * 24);
                return daysSinceCreation >= 30;
            }
        },
        speed_runner: {
            id: 'speed_runner',
            name: 'Speed Runner',
            description: 'Reach level 20 in 24 hours',
            icon: '⚡',
            reward: { xp: 1000, tama: 300 },
            unlocked: false,
            condition: () => {
                const pet = Game.pet;
                if (!pet || pet.level < 20) return false;
                const hoursSinceCreation = (Date.now() - pet.createdAt) / (1000 * 60 * 60);
                return hoursSinceCreation <= 24;
            }
        },
        happy_pet: {
            id: 'happy_pet',
            name: 'Happy Pet',
            description: 'Max out happiness 50 times',
            icon: '😊',
            reward: { xp: 500, tama: 200 },
            unlocked: false,
            condition: () => {
                const playerData = Utils.loadLocal('playerData');
                return playerData && (playerData.happyCount || 0) >= 50;
            }
        },
        night_owl: {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Play between 12 AM - 4 AM',
            icon: '🦉',
            reward: { xp: 200, tama: 100 },
            unlocked: false,
            condition: () => {
                const hour = new Date().getHours();
                return hour >= 0 && hour < 4;
            }
        },
        early_bird: {
            id: 'early_bird',
            name: 'Early Bird',
            description: 'Play between 5 AM - 7 AM',
            icon: '🐦',
            reward: { xp: 200, tama: 100 },
            unlocked: false,
            condition: () => {
                const hour = new Date().getHours();
                return hour >= 5 && hour < 7;
            }
        }
    },
    
    // Initialize achievements
    init() {
        this.loadAchievements();
        this.updateAchievementsDisplay();
    },
    
    // Load achievements from storage
    loadAchievements() {
        const saved = Utils.loadLocal('achievements');
        if (saved) {
            Object.keys(saved).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].unlocked = saved[key].unlocked || false;
                }
            });
        }
    },
    
    // Save achievements to storage
    saveAchievements() {
        const toSave = {};
        Object.keys(this.achievements).forEach(key => {
            toSave[key] = {
                unlocked: this.achievements[key].unlocked
            };
        });
        Utils.saveLocal('achievements', toSave);
    },
    
    // Check achievement
    check(achievementId, ...args) {
        const achievement = this.achievements[achievementId];
        
        if (!achievement || achievement.unlocked) return false;
        
        if (achievement.condition(...args)) {
            this.unlock(achievementId);
            return true;
        }
        
        return false;
    },
    
    // Unlock achievement
    async unlock(achievementId) {
        const achievement = this.achievements[achievementId];
        
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        this.saveAchievements();
        
        // Give rewards
        if (achievement.reward) {
            const playerData = Utils.loadLocal('playerData') || { tama: 0 };
            
            if (achievement.reward.tama) {
                playerData.tama = (playerData.tama || 0) + achievement.reward.tama;
                
                // Reward referrers
                if (window.Database && window.WalletManager && WalletManager.isConnected()) {
                    Database.rewardReferrers(WalletManager.getAddress(), achievement.reward.tama);
                }
            }
            
            Utils.saveLocal('playerData', playerData);
            await WalletManager.updateBalanceDisplay();
            
            if (achievement.reward.xp && Game.pet) {
                Game.addXP(achievement.reward.xp);
            }
        }
        
        // Show notification
        this.showAchievementUnlock(achievement);
        
        // Update display
        this.updateAchievementsDisplay();
        
        // Save to database
        if (window.Database && WalletManager.isConnected()) {
            // Save achievement to database (optional - can be added later)
            // Database.saveAchievement(WalletManager.getAddress(), achievementId);
        }
    },
    
    // Show achievement unlock notification
    showAchievementUnlock(achievement) {
        Utils.showNotification(
            `🏆 Achievement Unlocked: ${achievement.name}! +${achievement.reward.tama} TAMA`,
            5000
        );
        
        // Create particle effect
        Utils.createParticle(
            window.innerWidth / 2,
            window.innerHeight / 3,
            achievement.icon,
            'sparkle'
        );
    },
    
    // Update achievements display
    updateAchievementsDisplay() {
        const container = document.getElementById('achievements-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Sort: unlocked first, then by reward amount
        const sorted = Object.values(this.achievements).sort((a, b) => {
            if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
            return (b.reward.tama || 0) - (a.reward.tama || 0);
        });
        
        // Show top 5
        sorted.slice(0, 5).forEach(achievement => {
            const div = document.createElement('div');
            div.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            div.innerHTML = `
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-info">
                    <p class="achievement-name">${achievement.name}</p>
                    <p class="achievement-desc">${achievement.description}</p>
                </div>
            `;
            
            if (achievement.unlocked) {
                div.classList.add('unlocking');
            }
            
            container.appendChild(div);
        });
    },
    
    // Check all achievements
    checkAll() {
        Object.keys(this.achievements).forEach(key => {
            this.check(key);
        });
    },
    
    // Get progress
    getProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = Object.values(this.achievements).filter(a => a.unlocked).length;
        return { unlocked, total, percentage: (unlocked / total) * 100 };
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        Achievements.init();
        
        // Check achievements periodically
        setInterval(() => {
            Achievements.checkAll();
        }, 60000); // Every minute
    }, 1000);
});

// Export
window.Achievements = Achievements;

