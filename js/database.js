// ============================================
// FIREBASE DATABASE INTEGRATION
// ============================================

const Database = {
    db: null,
    initialized: false,
    useSupabase: true, // Use Supabase instead of MySQL/Firebase
    supabaseUrl: window.SUPABASE_URL || 'https://your-project.supabase.co',
    supabaseKey: window.SUPABASE_KEY || 'your-anon-key-here',
    apiURL: 'https://nitric-ara-unsuperlative.ngrok-free.dev/solana-tamagotchi/api',
    
    // Initialize Firebase
    init() {
        try {
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.warn('Firebase not loaded, using local storage only');
                return false;
            }
            
            // Initialize Firebase app
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            
            // Get Firestore instance
            this.db = firebase.firestore();
            this.initialized = true;
            
            console.log('✅ Firebase initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            console.warn('Falling back to local storage only');
            return false;
        }
    },
    
    // Save player data
    async savePlayerData(walletAddress, data) {
        if (!this.initialized || !walletAddress) {
            return Utils.saveLocal('playerData', data);
        }
        
        try {
            await this.db.collection('players').doc(walletAddress).set({
                ...data,
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            return true;
        } catch (error) {
            console.error('Failed to save player data:', error);
            return Utils.saveLocal('playerData', data);
        }
    },
    
    // Load player data
    async loadPlayerData(walletAddress) {
        if (!this.initialized || !walletAddress) {
            return Utils.loadLocal('playerData');
        }
        
        try {
            const doc = await this.db.collection('players').doc(walletAddress).get();
            
            if (doc.exists) {
                const data = doc.data();
                Utils.saveLocal('playerData', data);
                return data;
            }
            
            // Create new player data
            const newPlayerData = {
                wallet: walletAddress,
                tama: 0,
                totalXP: 0,
                gamesPlayed: 0,
                referrals: 0,
                referralEarnings: 0,
                totalSpent: 0,
                dailyStreak: 0,
                lastDaily: 0,
                happyCount: 0,
                createdAt: Date.now()
            };
            
            await this.savePlayerData(walletAddress, newPlayerData);
            return newPlayerData;
        } catch (error) {
            console.error('Failed to load player data:', error);
            return Utils.loadLocal('playerData') || {};
        }
    },
    
    // Save pet data
    async savePetData(walletAddress, petData) {
        if (!walletAddress) return Utils.saveLocal('petData', petData);
        
        try {
            if (this.useMySQL) {
                await fetch(`${this.apiURL}/pet.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wallet: walletAddress, pet: petData })
                });
            } else if (this.initialized) {
                await this.db.collection('players').doc(walletAddress).collection('pets').doc(petData.id).set({
                    ...petData,
                    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update player stats
                await this.db.collection('players').doc(walletAddress).update({
                    currentPet: petData.id,
                    currentLevel: petData.level,
                    currentXP: petData.xp
                });
            }
            
            return true;
        } catch (error) {
            console.error('Failed to save pet data:', error);
            return Utils.saveLocal('petData', petData);
        }
    },
    
    // Load pet data
    async loadPetData(walletAddress, petId) {
        if (!this.initialized || !walletAddress) {
            return Utils.loadLocal('petData');
        }
        
        try {
            const doc = await this.db.collection('players').doc(walletAddress).collection('pets').doc(petId).get();
            
            if (doc.exists) {
                const data = doc.data();
                Utils.saveLocal('petData', data);
                return data;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to load pet data:', error);
            return Utils.loadLocal('petData');
        }
    },
    
    // Get all pets for a player
    async getPlayerPets(walletAddress) {
        if (!this.initialized || !walletAddress) {
            return [];
        }
        
        try {
            const snapshot = await this.db.collection('players').doc(walletAddress).collection('pets').get();
            
            const pets = [];
            snapshot.forEach(doc => {
                pets.push({ id: doc.id, ...doc.data() });
            });
            
            return pets;
        } catch (error) {
            console.error('Failed to get player pets:', error);
            return [];
        }
    },
    
    // Save achievement
    async saveAchievement(walletAddress, achievementId) {
        if (!this.initialized || !walletAddress) {
            return false;
        }
        
        try {
            await this.db.collection('players').doc(walletAddress).collection('achievements').doc(achievementId).set({
                unlockedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return true;
        } catch (error) {
            console.error('Failed to save achievement:', error);
            return false;
        }
    },
    
    // Get leaderboard
    async getLeaderboard(limit = 10) {
        if (this.useMySQL) {
            try {
                const response = await fetch(`${this.apiURL}/leaderboard.php?limit=${limit}`);
                const result = await response.json();
                return result.success ? result.data : [];
            } catch (error) {
                console.error('Failed to get leaderboard:', error);
                return [];
            }
        }
        
        if (!this.initialized) {
            return [];
        }
        
        try {
            const snapshot = await this.db.collection('players')
                .orderBy('currentXP', 'desc')
                .limit(limit)
                .get();
            
            const leaderboard = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                leaderboard.push({
                    wallet: doc.id,
                    level: data.currentLevel || 1,
                    xp: data.currentXP || 0,
                    petName: data.currentPetName || 'Unknown'
                });
            });
            
            return leaderboard;
        } catch (error) {
            console.error('Failed to get leaderboard:', error);
            return [];
        }
    },
    
    // Update leaderboard (MySQL)
    async updateLeaderboard(wallet, petData) {
        if (!this.useMySQL) return false;
        
        try {
            // Calculate total XP (current level XP + accumulated)
            const totalXP = petData.xp + this.calculateTotalXP(petData.level);
            
            const response = await fetch(`${this.apiURL}/leaderboard.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet,
                    petName: petData.name,
                    level: petData.level,
                    xp: totalXP, // Send total XP, not current level XP
                    tama: Utils.loadLocal('playerData')?.tama || 0,
                    petType: petData.type,
                    rarity: petData.rarity
                })
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Failed to update leaderboard:', error);
            return false;
        }
    },
    
    // Calculate total XP for all previous levels
    calculateTotalXP(currentLevel) {
        let total = 0;
        for (let i = 1; i < currentLevel; i++) {
            total += Utils.getXPForLevel(i);
        }
        return total;
    },
    
    // Get player count (online players)
    async getPlayerCount() {
        if (this.useMySQL) {
            try {
                const response = await fetch(`${this.apiURL}/players.php`);
                const result = await response.json();
                return result.success ? result.data.online : 0;
            } catch (error) {
                console.error('Failed to get player count:', error);
                return 0;
            }
        }
        
        if (!this.initialized) {
            return 0;
        }
        
        try {
            // In production, use a counter document for better performance
            const snapshot = await this.db.collection('players').get();
            return snapshot.size;
        } catch (error) {
            console.error('Failed to get player count:', error);
            return 0;
        }
    },
    
    // Update player online status (MySQL)
    async updatePlayerStatus(wallet, action = 'ping') {
        if (!this.useMySQL) return false;
        
        try {
            const response = await fetch(`${this.apiURL}/players.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet, action })
            });
            const result = await response.json();
            
            if (result.success && result.data.online !== undefined) {
                // Update online counter in UI
                const playerCountEl = document.getElementById('player-count');
                if (playerCountEl) {
                    playerCountEl.textContent = `${result.data.online} player${result.data.online !== 1 ? 's' : ''}`;
                }
            }
            
            return result.success;
        } catch (error) {
            console.error('Failed to update player status:', error);
            return false;
        }
    },
    
    // Check admin status
    async checkAdmin(wallet) {
        if (!this.useMySQL) return false;
        
        try {
            const response = await fetch(`${this.apiURL}/admin.php?action=check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet })
            });
            const result = await response.json();
            return result.success ? result.data.isAdmin : false;
        } catch (error) {
            console.error('Failed to check admin:', error);
            return false;
        }
    },
    
    // Get admin stats
    async getAdminStats(wallet) {
        if (!this.useMySQL) return null;
        
        try {
            const response = await fetch(`${this.apiURL}/admin.php?action=stats&wallet=${encodeURIComponent(wallet)}`);
            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Failed to get admin stats:', error);
            return null;
        }
    },
    
    // Add referral
    async addReferral(referralCode, newPlayerAddress) {
        if (!referralCode || !newPlayerAddress) {
            return false;
        }
        
        try {
            if (this.useMySQL) {
                // MySQL API
                const response = await fetch(`${this.apiURL}/referrals.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        referralCode,
                        newPlayerWallet: newPlayerAddress
                    })
                });
                const result = await response.json();
                
                if (result.success) {
                    Utils.showNotification(`🎁 Referrer earned ${result.data.reward} TAMA!`);
                    return true;
                }
                return false;
            } else {
                // Firebase
                const referrerAddress = atob(referralCode); // Decode base64
                
                // Add to referrer's referrals
                await this.db.collection('players').doc(referrerAddress).update({
                    referrals: firebase.firestore.FieldValue.increment(1),
                    referralEarnings: firebase.firestore.FieldValue.increment(100)
                });
                
                // Update referrer's local data
                const playerData = Utils.loadLocal('playerData') || {};
                playerData.referrals = (playerData.referrals || 0) + 1;
                playerData.tama = (playerData.tama || 0) + 100;
                Utils.saveLocal('playerData', playerData);
                
                // Save referral record
                await this.db.collection('referrals').add({
                    referrer: referrerAddress,
                    referred: newPlayerAddress,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    rewardClaimed: true
                });
                
                return true;
            }
        } catch (error) {
            console.error('Failed to add referral:', error);
            return false;
        }
    },
    
    // Get referral stats (MySQL)
    async getReferralStats(wallet) {
        if (!this.useMySQL || !wallet) return null;
        
        try {
            const response = await fetch(`${this.apiURL}/referrals.php?wallet=${wallet}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Failed to get referral stats:', error);
            return null;
        }
    },
    
    // Reward referrers when player earns TAMA
    async rewardReferrers(wallet, tamaEarned) {
        if (!this.useMySQL || !wallet || tamaEarned <= 0) return false;
        
        try {
            const response = await fetch(`${this.apiURL}/reward_referrers.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet,
                    tama: tamaEarned
                })
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Failed to reward referrers:', error);
            return false;
        }
    },
    
    // Update daily streak
    async updateDailyStreak(walletAddress) {
        if (!this.initialized || !walletAddress) {
            return false;
        }
        
        try {
            const doc = await this.db.collection('players').doc(walletAddress).get();
            const data = doc.data();
            
            const lastDaily = data.lastDaily?.toMillis() || 0;
            const now = Date.now();
            const oneDayMs = 24 * 60 * 60 * 1000;
            
            let newStreak = 1;
            
            if (lastDaily && (now - lastDaily) < (oneDayMs * 2)) {
                // Continuing streak
                newStreak = (data.dailyStreak || 0) + 1;
            }
            
            await this.db.collection('players').doc(walletAddress).update({
                dailyStreak: newStreak,
                lastDaily: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return newStreak;
        } catch (error) {
            console.error('Failed to update daily streak:', error);
            return 1;
        }
    },
    
    // Record transaction
    async recordTransaction(walletAddress, type, amount, signature) {
        if (!this.initialized || !walletAddress) {
            return false;
        }
        
        try {
            await this.db.collection('transactions').add({
                wallet: walletAddress,
                type,
                amount,
                signature,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update total spent
            if (type === 'create_pet') {
                await this.db.collection('players').doc(walletAddress).update({
                    totalSpent: firebase.firestore.FieldValue.increment(amount)
                });
            }
            
            return true;
        } catch (error) {
            console.error('Failed to record transaction:', error);
            return false;
        }
    },
    
    // Get player transactions
    async getPlayerTransactions(walletAddress, limit = 10) {
        if (!this.initialized || !walletAddress) {
            return [];
        }
        
        try {
            const snapshot = await this.db.collection('transactions')
                .where('wallet', '==', walletAddress)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            const transactions = [];
            snapshot.forEach(doc => {
                transactions.push({ id: doc.id, ...doc.data() });
            });
            
            return transactions;
        } catch (error) {
            console.error('Failed to get transactions:', error);
            return [];
        }
    },
    
    // Get global statistics
    async getGlobalStats() {
        if (!this.initialized) {
            return null;
        }
        
        try {
            const doc = await this.db.collection('statistics').doc('global').get();
            
            if (doc.exists) {
                return doc.data();
            }
            
            return {
                totalPlayers: 0,
                totalPets: 0,
                totalTransactions: 0,
                totalVolume: 0
            };
        } catch (error) {
            console.error('Failed to get global stats:', error);
            return null;
        }
    },
    
    // Update global statistics
    async updateGlobalStats(updates) {
        if (!this.initialized) {
            return false;
        }
        
        try {
            await this.db.collection('statistics').doc('global').set(updates, { merge: true });
            return true;
        } catch (error) {
            console.error('Failed to update global stats:', error);
            return false;
        }
    },
    
    // Real-time listener for leaderboard
    listenToLeaderboard(callback, limit = 10) {
        if (!this.initialized) {
            return null;
        }
        
        return this.db.collection('players')
            .orderBy('currentXP', 'desc')
            .limit(limit)
            .onSnapshot(snapshot => {
                const leaderboard = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    leaderboard.push({
                        wallet: doc.id,
                        level: data.currentLevel || 1,
                        xp: data.currentXP || 0,
                        petName: data.currentPetName || 'Unknown'
                    });
                });
                callback(leaderboard);
            });
    },
    
    // Clean up old data
    async cleanupOldData(daysOld = 90) {
        if (!this.initialized) {
            return false;
        }
        
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const snapshot = await this.db.collection('players')
                .where('lastUpdate', '<', cutoffDate)
                .get();
            
            const batch = this.db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            console.log(`Cleaned up ${snapshot.size} old player records`);
            return true;
        } catch (error) {
            console.error('Failed to cleanup old data:', error);
            return false;
        }
    }
};

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Database.init();
});

// Export
window.Database = Database;

