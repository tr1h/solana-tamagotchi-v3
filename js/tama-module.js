// ============================================
// TAMA TOKEN MODULE - ПРОЗРАЧНАЯ СИСТЕМА
// ============================================

const TAMAModule = {
    // Конфигурация
    CONFIG: {
        SYMBOL: 'TAMA',
        DECIMALS: 9,
        USE_DATABASE: true,
        USE_SPL_TOKEN: false // Пока используем базу данных
    },
    
    // Экономика TAMA
    ECONOMICS: {
        // ЗАРАБОТОК TAMA
        EARN: {
            MINT_NFT: 500,           // Минт NFT
            DAILY_LOGIN: 25,         // Ежедневный вход
            FEED_PET: 5,             // Кормление питомца
            PLAY_WITH_PET: 10,       // Игра с питомцем
            TRAIN_PET: 15,           // Тренировка питомца
            LEVEL_UP: 50,            // Повышение уровня
            EVOLUTION: 100,          // Эволюция
            ACHIEVEMENT_BRONZE: 10,  // Бронзовое достижение
            ACHIEVEMENT_SILVER: 25,  // Серебряное достижение
            ACHIEVEMENT_GOLD: 50,    // Золотое достижение
            ACHIEVEMENT_PLATINUM: 100, // Платиновое достижение
            REFERRAL_L1: 100,        // Реферал 1 уровня
            REFERRAL_L2: 50          // Реферал 2 уровня
        },
        
        // ТРАТЫ TAMA
        SPEND: {
            BUY_FOOD: 20,            // Покупка еды
            BUY_TOY: 30,             // Покупка игрушки
            HEAL_PET: 10,            // Лечение питомца
            EVOLVE_PET: 50,          // Эволюция питомца
            BUY_ACCESSORY: 50,       // Покупка аксессуара
            SPECIAL_ITEM: 100        // Особые предметы
        },
        
        // Лимиты (УБРАНЫ!)
        DAILY_EARN_LIMIT: null,      // БЕЗ ЛИМИТОВ! 🚀
        MIN_BALANCE: 0               // Минимальный баланс
    },
    
    // Инициализация
    async init() {
        console.log('🪙 Initializing TAMA Module...');
        
        if (this.CONFIG.USE_DATABASE && window.Database) {
            console.log('✅ TAMA Module ready (database mode)');
            return true;
        }
        
        console.error('❌ TAMA Module initialization failed');
        return false;
    },
    
    // Получить баланс TAMA
    async getBalance(walletAddress) {
        try {
            if (!walletAddress) {
                console.warn('⚠️ No wallet address provided');
                return 0;
            }
            
            if (this.CONFIG.USE_DATABASE && window.Database) {
                // ИСПРАВЛЕНО: Используем правильное поле 'tama' из leaderboard
                const { data } = await window.Database.supabase
                    .from('leaderboard')
                    .select('tama')
                    .eq('wallet_address', walletAddress)
                    .single();
                
                return data?.tama || 0;
            }
            
            return 0;
        } catch (error) {
            console.error('❌ Error getting TAMA balance:', error);
            return 0;
        }
    },
    
    // Заработать TAMA (через новую систему учета)
    async earnTAMA(walletAddress, amount, reason, details = '') {
        try {
            if (!walletAddress || !amount || amount <= 0) {
                console.warn('⚠️ Invalid parameters for earning TAMA');
                return false;
            }
            
            // 🛡️ Anti-Cheat валидация - ОТКЛЮЧЕНО ДЛЯ КОМФОРТНОЙ ИГРЫ! 🎮
            // НЕ БЛОКИРУЕМ ПОЛУЧЕНИЕ TAMA - ИГРАЕМ БЕЗ ОГРАНИЧЕНИЙ!
            console.log('🛡️ TAMA gain allowed (anti-cheat disabled):', amount, 'for:', reason);
            
            console.log(`💰 Earning ${amount} TAMA for: ${reason}`);
            
            // Используем новую систему учета, если доступна
            if (window.TAMAAccounting) {
                await window.TAMAAccounting.earnTAMA(walletAddress, amount, reason, { details });
                console.log(`✅ TAMA: Earned ${amount} TAMA for ${reason} (accounting system)`);
                return true;
            }
            
            if (this.CONFIG.USE_DATABASE && window.Database) {
                // 🚀 БЕЗ ЛИМИТОВ! Зарабатывай сколько хочешь!
                console.log('🚀 Unlimited TAMA earning mode!');
                
                // Обновляем баланс
                const currentBalance = await this.getBalance(walletAddress);
                const newBalance = currentBalance + amount;
                
                await window.Database.updateTAMA(walletAddress, amount, reason, details);
                
                // Записываем в историю
                await this.recordTransaction(walletAddress, amount, 'earn', reason, details);
                
                // Обновляем UI
                this.updateUIBalance(newBalance);
                
                // Показываем уведомление
                this.showEarnNotification(amount, reason);
                
                console.log(`✅ Earned ${amount} TAMA. New balance: ${newBalance}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error earning TAMA:', error);
            return false;
        }
    },
    
    // Потратить TAMA (через новую систему учета)
    async spendTAMA(walletAddress, amount, reason, details = '') {
        try {
            if (!walletAddress || !amount || amount <= 0) {
                console.warn('⚠️ Invalid parameters for spending TAMA');
                return false;
            }
            
            console.log(`💰 Spending ${amount} TAMA for: ${reason}`);
            
            // Используем новую систему учета, если доступна
            if (window.TAMAAccounting) {
                await window.TAMAAccounting.spendTAMA(
                    walletAddress,
                    amount,
                    reason,
                    window.TAMAAccounting.OPERATION_TYPES.SHOP_PURCHASE,
                    { details }
                );
                console.log(`✅ TAMA: Spent ${amount} TAMA for ${reason} (accounting system)`);
                return true;
            }
            
            // Fallback к старой системе
            if (this.CONFIG.USE_DATABASE && window.Database) {
                const currentBalance = await this.getBalance(walletAddress);
                
                if (currentBalance < amount) {
                    console.warn(`⚠️ Insufficient TAMA balance. Required: ${amount}, Available: ${currentBalance}`);
                    return false;
                }
                
                const newBalance = currentBalance - amount;
                
                await window.Database.updateTAMA(walletAddress, -amount, reason, details);
                
                // Записываем в историю
                await this.recordTransaction(walletAddress, -amount, 'spend', reason, details);
                
                // Обновляем UI
                this.updateUIBalance(newBalance);
                
                console.log(`✅ Spent ${amount} TAMA. New balance: ${newBalance}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error spending TAMA:', error);
            return false;
        }
    },
    
    // Получить историю транзакций
    async getTransactionHistory(walletAddress, limit = 50) {
        try {
            if (!walletAddress) return [];
            
            if (this.CONFIG.USE_DATABASE && window.Database) {
                // Получаем историю из базы данных
                const history = await window.Database.getTAMAHistory(walletAddress, limit);
                return history || [];
            }
            
            return [];
        } catch (error) {
            console.error('❌ Error getting TAMA history:', error);
            return [];
        }
    },
    
    // Получить дневной заработок (теперь просто для статистики)
    async getDailyEarned(walletAddress) {
        try {
            const today = new Date().toDateString();
            const history = await this.getTransactionHistory(walletAddress, 100);
            
            const todayEarned = history
                .filter(tx => 
                    tx.type === 'earn' && 
                    new Date(tx.created_at).toDateString() === today
                )
                .reduce((sum, tx) => sum + tx.amount, 0);
            
            return todayEarned;
        } catch (error) {
            console.error('❌ Error getting daily earned:', error);
            return 0;
        }
    },
    
    // Записать транзакцию в историю
    async recordTransaction(walletAddress, amount, type, reason, details = '') {
        try {
            if (this.CONFIG.USE_DATABASE && window.Database) {
                await window.Database.recordTAMATransaction({
                    wallet_address: walletAddress,
                    amount: amount,
                    type: type, // 'earn' or 'spend'
                    reason: reason,
                    details: details,
                    created_at: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('❌ Error recording TAMA transaction:', error);
        }
    },
    
    // Обновить UI баланса
    updateUIBalance(balance) {
        try {
            // Обновляем в хедере
            const balanceElement = document.querySelector('.tama-balance');
            if (balanceElement) {
                balanceElement.textContent = `${balance} TAMA`;
            }
            
            // Обновляем в других местах
            const allBalanceElements = document.querySelectorAll('[data-tama-balance]');
            allBalanceElements.forEach(el => {
                el.textContent = `${balance} TAMA`;
            });
        } catch (error) {
            console.error('❌ Error updating UI balance:', error);
        }
    },
    
    // Показать уведомление о заработке
    showEarnNotification(amount, reason) {
        try {
            if (window.Utils && window.Utils.showNotification) {
                window.Utils.showNotification(`💰 +${amount} TAMA - ${reason}`);
            }
        } catch (error) {
            console.error('❌ Error showing earn notification:', error);
        }
    },
    
    // Показать уведомление о трате
    showSpendNotification(amount, reason) {
        try {
            if (window.Utils && window.Utils.showNotification) {
                window.Utils.showNotification(`💸 -${amount} TAMA - ${reason}`);
            }
        } catch (error) {
            console.error('❌ Error showing spend notification:', error);
        }
    },
    
    // Показать уведомление о недостатке средств
    showInsufficientBalanceNotification() {
        try {
            if (window.Utils && window.Utils.showNotification) {
                window.Utils.showNotification('❌ Недостаточно TAMA! Заработайте больше играя с питомцем!');
            }
        } catch (error) {
            console.error('❌ Error showing insufficient balance notification:', error);
        }
    },
    
    // Показать детальную информацию о TAMA (для hover)
    showTAMADetails(walletAddress) {
        try {
            // Создаем модальное окно с деталями
            const modal = document.createElement('div');
            modal.className = 'tama-details-modal';
            modal.innerHTML = `
                <div class="tama-details-content">
                    <h3>🪙 TAMA Token Details</h3>
                    <div class="tama-info">
                        <p><strong>Balance:</strong> <span id="tama-detail-balance">Loading...</span></p>
                        <p><strong>Daily Earned:</strong> <span id="tama-daily-earned">Loading...</span></p>
                        <p><strong>Daily Limit:</strong> <span style="color: #00ff00; font-weight: bold;">UNLIMITED! 🚀</span></p>
                    </div>
                    <div class="tama-economics">
                        <h4>💰 How to Earn TAMA:</h4>
                        <ul>
                            <li>Feed Pet: +${this.ECONOMICS.EARN.FEED_PET} TAMA</li>
                            <li>Play with Pet: +${this.ECONOMICS.EARN.PLAY_WITH_PET} TAMA</li>
                            <li>Train Pet: +${this.ECONOMICS.EARN.TRAIN_PET} TAMA</li>
                            <li>Level Up: +${this.ECONOMICS.EARN.LEVEL_UP} TAMA</li>
                            <li>Daily Login: +${this.ECONOMICS.EARN.DAILY_LOGIN} TAMA</li>
                        </ul>
                        <h4>💸 How to Spend TAMA:</h4>
                        <ul>
                            <li>Buy Food: -${this.ECONOMICS.SPEND.BUY_FOOD} TAMA</li>
                            <li>Buy Toy: -${this.ECONOMICS.SPEND.BUY_TOY} TAMA</li>
                            <li>Heal Pet: -${this.ECONOMICS.SPEND.HEAL_PET} TAMA</li>
                            <li>Evolve Pet: -${this.ECONOMICS.SPEND.EVOLVE_PET} TAMA</li>
                        </ul>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Загружаем данные
            this.loadTAMADetails(walletAddress);
        } catch (error) {
            console.error('❌ Error showing TAMA details:', error);
        }
    },
    
    // Загрузить детали TAMA
    async loadTAMADetails(walletAddress) {
        try {
            const balance = await this.getBalance(walletAddress);
            const dailyEarned = await this.getDailyEarned(walletAddress);
            
            const balanceElement = document.getElementById('tama-detail-balance');
            const dailyElement = document.getElementById('tama-daily-earned');
            
            if (balanceElement) balanceElement.textContent = `${balance} TAMA`;
            if (dailyElement) dailyElement.textContent = `${dailyEarned} TAMA`;
        } catch (error) {
            console.error('❌ Error loading TAMA details:', error);
        }
    }
};

// Экспорт для глобального использования
window.TAMAModule = TAMAModule;

console.log('✅ TAMA Module loaded v2');

