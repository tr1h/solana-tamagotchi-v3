// ============================================
// 🏦 TREASURY SYSTEM - ГЛАВНЫЙ СЧЕТ TAMA
// ============================================

const TreasurySystem = {
    // Конфигурация
    CONFIG: {
        TREASURY_WALLET: 'TREASURY_MAIN_ACCOUNT',
        INITIAL_SUPPLY: 1000000000, // 1 миллиард TAMA
        NEW_USER_BONUS: 1000, // 1000 TAMA новым пользователям
        MINT_BONUS: 1000, // 1000 TAMA за минт NFT
        DAILY_BONUS: 50, // 50 TAMA ежедневно
    },

    // Инициализация
    async init() {
        console.log('🏦 Initializing Treasury System...');
        
        // Создаем Treasury кошелек если не существует
        await this.ensureTreasuryExists();
        
        console.log('🏦 Treasury System initialized');
        return this;
    },

    // Убедиться что Treasury существует (ТОЛЬКО 1 РАЗ!)
    async ensureTreasuryExists() {
        try {
            if (window.SimpleTAMASystem) {
                // Проверяем существует ли Treasury в базе данных
                const treasuryExists = await this.checkTreasuryExists();
                
                if (!treasuryExists) {
                    console.log('🏦 Creating Treasury with initial supply (FIRST TIME ONLY)...');
                    // Создаем Treasury через localStorage (без Supabase)
                    localStorage.setItem(`tama_balance_${this.CONFIG.TREASURY_WALLET}`, this.CONFIG.INITIAL_SUPPLY.toString());
                    console.log(`✅ Treasury created ONCE with ${this.CONFIG.INITIAL_SUPPLY} TAMA`);
                } else {
                    const treasuryBalance = await window.SimpleTAMASystem.getBalance(this.CONFIG.TREASURY_WALLET);
                    console.log(`🏦 Treasury already exists with ${treasuryBalance} TAMA`);
                }
            }
        } catch (error) {
            console.error('❌ Error ensuring treasury exists:', error);
        }
    },

    // Проверить существует ли Treasury в базе данных
    async checkTreasuryExists() {
        try {
            if (window.Database && window.Database.supabase) {
                const { data, error } = await window.Database.supabase
                    .from('leaderboard')
                    .select('wallet_address')
                    .eq('wallet_address', this.CONFIG.TREASURY_WALLET)
                    .single();
                
                return !error && data !== null;
            }
            return false;
        } catch (error) {
            console.error('❌ Error checking treasury existence:', error);
            return false;
        }
    },

    // Получить баланс Treasury
    async getTreasuryBalance() {
        try {
            if (window.SimpleTAMASystem) {
                return await window.SimpleTAMASystem.getBalance(this.CONFIG.TREASURY_WALLET);
            }
            return 0;
        } catch (error) {
            console.error('❌ Error getting treasury balance:', error);
            return 0;
        }
    },

    // Начислить TAMA новому пользователю
    async awardNewUser(walletAddress) {
        try {
            if (!walletAddress) {
                console.warn('⚠️ No wallet address provided for new user award');
                return false;
            }

            console.log(`🏦 Awarding new user bonus to ${walletAddress}`);

            // Проверяем что пользователь новый (нет записей в leaderboard)
            if (window.Database) {
                const { data } = await window.Database.supabase
                    .from('leaderboard')
                    .select('wallet_address')
                    .eq('wallet_address', walletAddress)
                    .single();

                if (data) {
                    console.log('👤 User already exists, skipping new user bonus');
                    return false;
                }
            }

            // Проверяем что Treasury может начислить
            const canAward = await this.canAward(this.CONFIG.NEW_USER_BONUS);
            if (!canAward) {
                console.warn('⚠️ Treasury insufficient funds for new user bonus');
                return false;
            }

            // Начисляем бонус новому пользователю
            if (window.SimpleTAMASystem) {
                const success = await window.SimpleTAMASystem.addTAMA(
                    walletAddress, 
                    this.CONFIG.NEW_USER_BONUS, 
                    'New User Welcome Bonus'
                );
                
                if (success) {
                    console.log(`✅ New user bonus awarded: ${this.CONFIG.NEW_USER_BONUS} TAMA`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Error awarding new user:', error);
            return false;
        }
    },

    // Начислить TAMA за минт NFT
    async awardMintReward(walletAddress) {
        try {
            if (!walletAddress) {
                console.warn('⚠️ No wallet address provided for mint reward');
                return false;
            }

            console.log(`🏦 Awarding mint reward to ${walletAddress}`);

            if (window.SimpleTAMASystem) {
                const success = await window.SimpleTAMASystem.addTAMA(
                    walletAddress, 
                    this.CONFIG.MINT_BONUS, 
                    'NFT Mint Reward'
                );
                
                if (success) {
                    console.log(`✅ Mint reward awarded: ${this.CONFIG.MINT_BONUS} TAMA`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Error awarding mint reward:', error);
            return false;
        }
    },

    // Начислить ежедневную награду
    async awardDailyReward(walletAddress) {
        try {
            if (!walletAddress) {
                console.warn('⚠️ No wallet address provided for daily reward');
                return false;
            }

            console.log(`🏦 Awarding daily reward to ${walletAddress}`);

            if (window.SimpleTAMASystem) {
                const success = await window.SimpleTAMASystem.addTAMA(
                    walletAddress, 
                    this.CONFIG.DAILY_BONUS, 
                    'Daily Login Reward'
                );
                
                if (success) {
                    console.log(`✅ Daily reward awarded: ${this.CONFIG.DAILY_BONUS} TAMA`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Error awarding daily reward:', error);
            return false;
        }
    },

    // Пополнить Treasury (админ функция)
    async refillTreasury(amount) {
        try {
            if (!amount || amount <= 0) {
                console.warn('⚠️ Invalid amount for treasury refill');
                return false;
            }

            console.log(`🏦 Refilling treasury with ${amount} TAMA`);

            if (window.SimpleTAMASystem) {
                const currentBalance = await this.getTreasuryBalance();
                const newBalance = currentBalance + amount;
                
                const success = await window.SimpleTAMASystem.setBalance(
                    this.CONFIG.TREASURY_WALLET, 
                    newBalance
                );
                
                if (success) {
                    console.log(`✅ Treasury refilled: ${currentBalance} → ${newBalance} TAMA`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Error refilling treasury:', error);
            return false;
        }
    },

    // Получить статистику Treasury
    async getTreasuryStats() {
        try {
            const treasuryBalance = await this.getTreasuryBalance();
            const totalSupply = this.CONFIG.INITIAL_SUPPLY;
            const distributed = totalSupply - treasuryBalance;
            const distributionPercent = (distributed / totalSupply) * 100;

            return {
                treasuryBalance,
                totalSupply,
                distributed,
                distributionPercent: distributionPercent.toFixed(2),
                newUserBonus: this.CONFIG.NEW_USER_BONUS,
                mintBonus: this.CONFIG.MINT_BONUS,
                dailyBonus: this.CONFIG.DAILY_BONUS
            };
        } catch (error) {
            console.error('❌ Error getting treasury stats:', error);
            return null;
        }
    },

    // Проверить может ли Treasury начислить награду
    async canAward(amount) {
        try {
            const treasuryBalance = await this.getTreasuryBalance();
            return treasuryBalance >= amount;
        } catch (error) {
            console.error('❌ Error checking treasury capacity:', error);
            return false;
        }
    },

    // Получить историю наград Treasury
    async getTreasuryHistory(limit = 50) {
        try {
            // Пока возвращаем пустой массив
            // В будущем можно добавить таблицу treasury_transactions
            return [];
        } catch (error) {
            console.error('❌ Error getting treasury history:', error);
            return [];
        }
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    window.TreasurySystem = await TreasurySystem.init();
    console.log('🏦 Treasury System loaded globally');
});

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreasurySystem;
}
