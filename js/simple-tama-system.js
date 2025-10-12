// ============================================
// 💰 SIMPLE TAMA SYSTEM - БЕЗ СЛОЖНОСТЕЙ
// ============================================

const SimpleTAMASystem = {
    // Конфигурация
    CONFIG: {
        USE_DATABASE: true,
        FALLBACK_TO_LOCAL: true
    },

    // Инициализация
    init() {
        console.log('💰 Simple TAMA System initialized');
        return this;
    },

    // Получить баланс TAMA
    async getBalance(walletAddress) {
        try {
            if (!walletAddress) {
                console.warn('⚠️ No wallet address provided');
                return 0;
            }

            // СНАЧАЛА проверяем localStorage (более надежно)
            if (this.CONFIG.FALLBACK_TO_LOCAL) {
                const localBalance = localStorage.getItem(`tama_balance_${walletAddress}`);
                if (localBalance && parseFloat(localBalance) > 0) {
                    const balance = parseFloat(localBalance);
                    console.log(`💰 Balance from localStorage: ${balance} TAMA`);
                    return balance;
                }
            }

            // Потом пробуем получить из базы данных (кроме Treasury)
            if (this.CONFIG.USE_DATABASE && window.Database && window.Database.supabase && walletAddress !== 'TREASURY_MAIN_ACCOUNT') {
                const { data, error } = await window.Database.supabase
                    .from('leaderboard')
                    .select('tama')
                    .eq('wallet_address', walletAddress)
                    .single();

                if (!error && data && data.tama !== null && data.tama > 0) {
                    console.log(`💰 Balance from database: ${data.tama} TAMA`);
                    return data.tama || 0;
                } else {
                    console.log('⚠️ No valid database balance, using localStorage fallback');
                }
            }

            // Финальный fallback к localStorage
            if (this.CONFIG.FALLBACK_TO_LOCAL) {
                const localBalance = localStorage.getItem(`tama_balance_${walletAddress}`);
                const balance = localBalance ? parseFloat(localBalance) : 0;
                console.log(`💰 Final fallback from localStorage: ${balance} TAMA`);
                return balance;
            }

            return 0;
        } catch (error) {
            console.error('❌ Error getting TAMA balance:', error);
            return 0;
        }
    },

    // Добавить TAMA
    async addTAMA(walletAddress, amount, reason = 'Unknown') {
        try {
            if (!walletAddress || !amount || amount <= 0) {
                console.warn('⚠️ Invalid parameters for adding TAMA');
                return false;
            }

            console.log(`💰 Adding ${amount} TAMA for: ${reason} to wallet: ${walletAddress}`);

            // УМЕНЬШАЕМ TREASURY если это не Treasury сам себе
            if (walletAddress !== 'TREASURY_MAIN_ACCOUNT') {
                const treasuryBalance = parseInt(localStorage.getItem('tama_balance_TREASURY_MAIN_ACCOUNT') || '0');
                console.log(`🏦 Current Treasury balance: ${treasuryBalance} TAMA`);
                if (treasuryBalance >= amount) {
                    const newTreasuryBalance = treasuryBalance - amount;
                    localStorage.setItem('tama_balance_TREASURY_MAIN_ACCOUNT', newTreasuryBalance.toString());
                    console.log(`🏦 Treasury decreased: ${treasuryBalance} → ${newTreasuryBalance} TAMA`);
                    
                    // Синхронизируем Treasury в базе данных
                    if (this.CONFIG.USE_DATABASE && window.Database && window.Database.supabase) {
                        const { error } = await window.Database.supabase
                            .from('leaderboard')
                            .upsert({
                                wallet_address: 'TREASURY_MAIN_ACCOUNT',
                                pet_name: 'Treasury',
                                level: 1,
                                xp: 0,
                                tama: newTreasuryBalance,
                                pet_type: 'Treasury',
                                pet_rarity: 'legendary',
                                updated_at: new Date().toISOString()
                            }, {
                                onConflict: 'wallet_address'
                            });
                        
                        if (error) {
                            console.error('❌ Treasury sync error:', error);
                        } else {
                            console.log(`✅ Treasury synced to database: ${newTreasuryBalance} TAMA`);
                        }
                    }
                } else {
                    console.warn('⚠️ Treasury insufficient funds!');
                    return false;
                }
            }

            const currentBalance = await this.getBalance(walletAddress);
            const newBalance = currentBalance + amount;
            console.log(`💰 User balance: ${currentBalance} → ${newBalance} TAMA`);

            // Обновляем в базе данных
            if (this.CONFIG.USE_DATABASE && window.Database && window.Database.supabase) {
                // Сначала получаем текущие данные
                const { data: existingData, error: fetchError } = await window.Database.supabase
                    .from('leaderboard')
                    .select('*')
                    .eq('wallet_address', walletAddress)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
                    console.error('❌ Error fetching existing data:', fetchError);
                }

                // Подготавливаем данные для upsert (БЕЗ TAMA - только для создания записи)
                const upsertData = {
                    wallet_address: walletAddress,
                    updated_at: new Date().toISOString()
                };

                // Если запись существует, сохраняем остальные поля
                if (existingData) {
                    upsertData.pet_name = existingData.pet_name || 'Unknown';
                    upsertData.level = existingData.level || 1;
                    upsertData.xp = existingData.xp || 0;
                    upsertData.pet_type = existingData.pet_type || 'Unknown';
                    upsertData.pet_rarity = existingData.pet_rarity || 'common';
                    upsertData.created_at = existingData.created_at || new Date().toISOString();
                } else {
                    // Новая запись
                    upsertData.pet_name = 'Unknown';
                    upsertData.level = 1;
                    upsertData.xp = 0;
                    upsertData.pet_type = 'Unknown';
                    upsertData.pet_rarity = 'common';
                    upsertData.created_at = new Date().toISOString();
                }

                const { error } = await window.Database.supabase
                    .from('leaderboard')
                    .upsert(upsertData, {
                        onConflict: 'wallet_address'
                    });

                if (error) {
                    console.error('❌ Database error, using local storage:', error);
                } else {
                    console.log(`✅ Database updated (without TAMA field)`);
                }
                
                // ВСЕГДА обновляем localStorage
                localStorage.setItem(`tama_balance_${walletAddress}`, newBalance.toString());
                console.log(`✅ TAMA added via localStorage: ${newBalance}`);
            } else {
                // Используем localStorage
                localStorage.setItem(`tama_balance_${walletAddress}`, newBalance.toString());
                console.log(`✅ TAMA added via localStorage: ${newBalance}`);
            }

            // Обновляем UI
            this.updateUIBalance(newBalance);

            return true;
        } catch (error) {
            console.error('❌ Error adding TAMA:', error);
            return false;
        }
    },

    // Потратить TAMA
    async spendTAMA(walletAddress, amount, reason = 'Unknown') {
        try {
            if (!walletAddress || !amount || amount <= 0) {
                console.warn('⚠️ Invalid parameters for spending TAMA');
                return false;
            }

            const currentBalance = await this.getBalance(walletAddress);

            if (currentBalance < amount) {
                console.warn(`⚠️ Insufficient TAMA balance. Required: ${amount}, Available: ${currentBalance}`);
                return false;
            }

            console.log(`💰 Spending ${amount} TAMA for: ${reason}`);

            const newBalance = currentBalance - amount;

            // ВОЗВРАЩАЕМ TAMA В TREASURY при тратах
            const treasuryBalance = parseInt(localStorage.getItem('tama_balance_TREASURY_MAIN_ACCOUNT') || '0');
            const newTreasuryBalance = treasuryBalance + amount;
            localStorage.setItem('tama_balance_TREASURY_MAIN_ACCOUNT', newTreasuryBalance.toString());
            console.log(`🏦 Treasury increased: ${treasuryBalance} → ${newTreasuryBalance} TAMA (returned from spending)`);

            // Синхронизируем Treasury в базе данных
            if (this.CONFIG.USE_DATABASE && window.Database && window.Database.supabase) {
                const { error: treasuryError } = await window.Database.supabase
                    .from('leaderboard')
                    .upsert({
                        wallet_address: 'TREASURY_MAIN_ACCOUNT',
                        pet_name: 'Treasury',
                        level: 1,
                        xp: 0,
                        tama: newTreasuryBalance,
                        pet_type: 'Treasury',
                        pet_rarity: 'legendary',
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'wallet_address'
                    });
                
                if (treasuryError) {
                    console.error('❌ Treasury sync error:', treasuryError);
                } else {
                    console.log(`✅ Treasury synced to database: ${newTreasuryBalance} TAMA`);
                }
            }

            // Обновляем в базе данных (БЕЗ TAMA поля)
            if (this.CONFIG.USE_DATABASE && window.Database && window.Database.supabase) {
                const { error } = await window.Database.supabase
                    .from('leaderboard')
                    .upsert({
                        wallet_address: walletAddress,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'wallet_address'
                    });

                if (error) {
                    console.error('❌ Database error:', error);
                } else {
                    console.log(`✅ Database updated (without TAMA field)`);
                }
            }
            
            // ВСЕГДА обновляем localStorage
            localStorage.setItem(`tama_balance_${walletAddress}`, newBalance.toString());
            console.log(`✅ TAMA spent via localStorage: ${newBalance}`);

            // Обновляем UI
            this.updateUIBalance(newBalance);

            return true;
        } catch (error) {
            console.error('❌ Error spending TAMA:', error);
            return false;
        }
    },

    // Установить баланс TAMA
    async setBalance(walletAddress, amount) {
        try {
            if (!walletAddress || amount < 0) {
                console.warn('⚠️ Invalid parameters for setting TAMA balance');
                return false;
            }

            console.log(`💰 Setting TAMA balance to ${amount} for: ${walletAddress}`);

            // Обновляем в базе данных
            if (this.CONFIG.USE_DATABASE && window.Database && window.Database.supabase) {
                const { error } = await window.Database.supabase
                    .from('leaderboard')
                    .upsert({
                        wallet_address: walletAddress,
                        tama: amount,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'wallet_address'
                    });

                if (error) {
                    console.error('❌ Database error, using local storage:', error);
                    // Fallback к localStorage
                    localStorage.setItem(`tama_balance_${walletAddress}`, amount.toString());
                } else {
                    console.log(`✅ TAMA balance set via database: ${amount}`);
                }
            } else {
                // Используем localStorage
                localStorage.setItem(`tama_balance_${walletAddress}`, amount.toString());
                console.log(`✅ TAMA balance set via localStorage: ${amount}`);
            }

            // Обновляем UI
            this.updateUIBalance(amount);

            return true;
        } catch (error) {
            console.error('❌ Error setting TAMA balance:', error);
            return false;
        }
    },

    // Обновить UI баланса
    updateUIBalance(balance) {
        try {
            // Обновляем в хедере
            const balanceElement = document.querySelector('.balance-tama');
            if (balanceElement) {
                balanceElement.textContent = `${balance} TAMA`;
            }

            // Обновляем в магазине если открыт
            const shopBalanceElement = document.querySelector('.shop-balance');
            if (shopBalanceElement) {
                shopBalanceElement.textContent = `${balance} TAMA`;
            }

            console.log(`🎨 UI updated with balance: ${balance} TAMA`);
        } catch (error) {
            console.error('❌ Error updating UI balance:', error);
        }
    },

    // Sync Treasury balance to database
    async syncTreasuryToDatabase() {
        try {
            const treasuryBalance = parseInt(localStorage.getItem('tama_balance_TREASURY_MAIN_ACCOUNT') || '0');
            
            if (this.CONFIG.USE_DATABASE && window.Database && window.Database.supabase) {
                const { error } = await window.Database.supabase
                    .from('leaderboard')
                    .upsert({
                        wallet_address: 'TREASURY_MAIN_ACCOUNT',
                        pet_name: 'Treasury',
                        level: 1,
                        xp: 0,
                        tama: treasuryBalance,
                        pet_type: 'Treasury',
                        pet_rarity: 'legendary',
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'wallet_address'
                    });
                
                if (error) {
                    console.error('❌ Treasury sync error:', error);
                    return false;
                } else {
                    console.log(`✅ Treasury synced to database: ${treasuryBalance} TAMA`);
                    return true;
                }
            }
        } catch (error) {
            console.error('❌ Treasury sync error:', error);
            return false;
        }
    },

    // Проверить достаточность средств
    async canAfford(walletAddress, amount) {
        try {
            const balance = await this.getBalance(walletAddress);
            return balance >= amount;
        } catch (error) {
            console.error('❌ Error checking affordability:', error);
            return false;
        }
    },

    // Получить историю транзакций (упрощенная)
    async getTransactionHistory(walletAddress, limit = 50) {
        try {
            // Пока возвращаем пустой массив
            // В будущем можно добавить простую историю
            return [];
        } catch (error) {
            console.error('❌ Error getting transaction history:', error);
            return [];
        }
    },

    // Синхронизировать баланс
    async syncBalance(walletAddress) {
        try {
            const balance = await this.getBalance(walletAddress);
            this.updateUIBalance(balance);
            return balance;
        } catch (error) {
            console.error('❌ Error syncing balance:', error);
            return 0;
        }
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.SimpleTAMASystem = SimpleTAMASystem.init();
    console.log('💰 Simple TAMA System loaded globally');
});

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleTAMASystem;
}
