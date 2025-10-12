// ============================================
// 💰 TAMA DOUBLE-ENTRY ACCOUNTING SYSTEM
// ============================================

const TAMAAccounting = {
    
    // Конфигурация
    CONFIG: {
        USE_DATABASE: true,
        DEBIT: 'DEBIT',      // Приход (увеличение TAMA)
        CREDIT: 'CREDIT'     // Расход (уменьшение TAMA)
    },
    
    // Типы операций
    OPERATION_TYPES: {
        // Приходы (DEBIT)
        MINT_REWARD: 'MINT_REWARD',           // Награда за минт NFT
        DAILY_LOGIN: 'DAILY_LOGIN',           // Ежедневная награда
        PET_CLICK: 'PET_CLICK',               // Клик по питомцу
        MINIGAME_WIN: 'MINIGAME_WIN',         // Победа в мини-игре
        REFERRAL_REWARD: 'REFERRAL_REWARD',   // Реферальная награда
        ACHIEVEMENT_REWARD: 'ACHIEVEMENT_REWARD', // Награда за достижение
        ADMIN_BONUS: 'ADMIN_BONUS',           // Бонус от админа
        
        // Расходы (CREDIT)
        SHOP_PURCHASE: 'SHOP_PURCHASE',       // Покупка в магазине
        FEEDING_COST: 'FEEDING_COST',         // Стоимость кормления
        HEALING_COST: 'HEALING_COST',         // Стоимость лечения
        EVOLUTION_COST: 'EVOLUTION_COST',     // Стоимость эволюции
        ADMIN_PENALTY: 'ADMIN_PENALTY'        // Штраф от админа
    },
    
    // Инициализация
    init() {
        console.log('💰 TAMA Double-Entry Accounting System initialized');
    },
    
    // Создать запись в журнале операций
    async createTransaction(walletAddress, operationType, amount, description, metadata = {}) {
        if (!walletAddress || !operationType || !amount || !description) {
            throw new Error('Missing required parameters for TAMA transaction');
        }
        
        // Определяем тип операции (DEBIT или CREDIT)
        const isDebit = this.isDebitOperation(operationType);
        const actualAmount = isDebit ? Math.abs(amount) : -Math.abs(amount);
        
        const transaction = {
            id: this.generateTransactionId(),
            wallet_address: walletAddress,
            operation_type: operationType,
            amount: actualAmount,
            balance_before: await this.getCurrentBalance(walletAddress),
            balance_after: 0, // Будет рассчитано после обновления
            description: description,
            metadata: metadata,
            created_at: new Date().toISOString(),
            entry_type: isDebit ? this.CONFIG.DEBIT : this.CONFIG.CREDIT
        };
        
        // Обновляем баланс
        const newBalance = await this.updateBalance(walletAddress, actualAmount);
        transaction.balance_after = newBalance;
        
        // Сохраняем транзакцию в базе данных
        if (this.CONFIG.USE_DATABASE && window.Database) {
            await this.saveTransactionToDatabase(transaction);
        }
        
        // Сохраняем в localStorage для офлайн режима
        this.saveTransactionToLocal(transaction);
        
        console.log(`💰 TAMA Transaction: ${operationType} ${actualAmount} TAMA (${transaction.entry_type})`);
        console.log(`💰 Balance: ${transaction.balance_before} → ${transaction.balance_after}`);
        
        return transaction;
    },
    
    // Проверить, является ли операция приходом (DEBIT)
    isDebitOperation(operationType) {
        const debitOperations = [
            this.OPERATION_TYPES.MINT_REWARD,
            this.OPERATION_TYPES.DAILY_LOGIN,
            this.OPERATION_TYPES.PET_CLICK,
            this.OPERATION_TYPES.MINIGAME_WIN,
            this.OPERATION_TYPES.REFERRAL_REWARD,
            this.OPERATION_TYPES.ACHIEVEMENT_REWARD,
            this.OPERATION_TYPES.ADMIN_BONUS
        ];
        return debitOperations.includes(operationType);
    },
    
    // Получить текущий баланс
    async getCurrentBalance(walletAddress) {
        if (this.CONFIG.USE_DATABASE && window.Database) {
            try {
                const { data } = await window.Database.supabase
                    .from('leaderboard')
                    .select('tama')
                    .eq('wallet_address', walletAddress)
                    .single();
                
                return data?.tama || 0;
            } catch (error) {
                console.error('Error getting balance from database:', error);
                return this.getBalanceFromLocal(walletAddress);
            }
        }
        return this.getBalanceFromLocal(walletAddress);
    },
    
    // Обновить баланс
    async updateBalance(walletAddress, amount) {
        if (this.CONFIG.USE_DATABASE && window.Database) {
            try {
                // Получаем текущий баланс
                const currentBalance = await this.getCurrentBalance(walletAddress);
                const newBalance = Math.max(0, currentBalance + amount); // Не может быть отрицательным
                
                // Обновляем в базе данных
                const { error } = await window.Database.supabase
                    .from('leaderboard')
                    .upsert({
                        wallet_address: walletAddress,
                        tama: newBalance,
                        updated_at: new Date().toISOString()
                    });
                
                if (error) {
                    console.error('Error updating balance in database:', error);
                    throw error;
                }
                
                return newBalance;
            } catch (error) {
                console.error('Error updating balance:', error);
                return this.updateBalanceLocal(walletAddress, amount);
            }
        }
        return this.updateBalanceLocal(walletAddress, amount);
    },
    
    // Сохранить транзакцию в базе данных
    async saveTransactionToDatabase(transaction) {
        try {
            const { error } = await window.Database.supabase
                .from('tama_transactions')
                .insert([transaction]);
            
            if (error) {
                console.error('Error saving transaction to database:', error);
                throw error;
            }
        } catch (error) {
            console.error('Failed to save transaction to database:', error);
        }
    },
    
    // Сохранить транзакцию локально
    saveTransactionToLocal(transaction) {
        try {
            const key = `tama_transactions_${transaction.wallet_address}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(transaction);
            
            // Ограничиваем количество локальных транзакций
            if (existing.length > 100) {
                existing.splice(0, existing.length - 100);
            }
            
            localStorage.setItem(key, JSON.stringify(existing));
        } catch (error) {
            console.error('Error saving transaction locally:', error);
        }
    },
    
    // Получить баланс из localStorage
    getBalanceFromLocal(walletAddress) {
        try {
            const key = `tama_balance_${walletAddress}`;
            return parseFloat(localStorage.getItem(key) || '0');
        } catch (error) {
            console.error('Error getting balance from local storage:', error);
            return 0;
        }
    },
    
    // Обновить баланс в localStorage
    updateBalanceLocal(walletAddress, amount) {
        try {
            const key = `tama_balance_${walletAddress}`;
            const currentBalance = this.getBalanceFromLocal(walletAddress);
            const newBalance = Math.max(0, currentBalance + amount);
            localStorage.setItem(key, newBalance.toString());
            return newBalance;
        } catch (error) {
            console.error('Error updating balance in local storage:', error);
            return 0;
        }
    },
    
    // Получить историю транзакций
    async getTransactionHistory(walletAddress, limit = 50) {
        if (this.CONFIG.USE_DATABASE && window.Database) {
            try {
                const { data, error } = await window.Database.supabase
                    .from('tama_transactions')
                    .select('*')
                    .eq('wallet_address', walletAddress)
                    .order('created_at', { ascending: false })
                    .limit(limit);
                
                if (error) {
                    console.error('Error getting transaction history from database:', error);
                    return this.getTransactionHistoryLocal(walletAddress, limit);
                }
                
                return data || [];
            } catch (error) {
                console.error('Error getting transaction history:', error);
                return this.getTransactionHistoryLocal(walletAddress, limit);
            }
        }
        return this.getTransactionHistoryLocal(walletAddress, limit);
    },
    
    // Получить историю транзакций из localStorage
    getTransactionHistoryLocal(walletAddress, limit = 50) {
        try {
            const key = `tama_transactions_${walletAddress}`;
            const transactions = JSON.parse(localStorage.getItem(key) || '[]');
            return transactions.slice(-limit).reverse();
        } catch (error) {
            console.error('Error getting transaction history from local storage:', error);
            return [];
        }
    },
    
    // Генерировать ID транзакции
    generateTransactionId() {
        return `tama_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Получить статистику по операциям
    async getOperationStats(walletAddress, period = 'all') {
        const transactions = await this.getTransactionHistory(walletAddress, 1000);
        
        const stats = {
            total_earned: 0,
            total_spent: 0,
            net_balance: 0,
            operations_count: {
                earned: 0,
                spent: 0
            },
            by_type: {}
        };
        
        transactions.forEach(transaction => {
            const amount = Math.abs(transaction.amount);
            
            if (transaction.entry_type === this.CONFIG.DEBIT) {
                stats.total_earned += amount;
                stats.operations_count.earned++;
            } else {
                stats.total_spent += amount;
                stats.operations_count.spent++;
            }
            
            if (!stats.by_type[transaction.operation_type]) {
                stats.by_type[transaction.operation_type] = {
                    count: 0,
                    total_amount: 0
                };
            }
            
            stats.by_type[transaction.operation_type].count++;
            stats.by_type[transaction.operation_type].total_amount += amount;
        });
        
        stats.net_balance = stats.total_earned - stats.total_spent;
        
        return stats;
    },
    
    // Проверить, достаточно ли TAMA для операции
    async canAfford(walletAddress, amount) {
        const balance = await this.getCurrentBalance(walletAddress);
        return balance >= amount;
    },
    
    // Утилиты для быстрого создания транзакций
    async earnTAMA(walletAddress, amount, reason, metadata = {}) {
        return await this.createTransaction(
            walletAddress,
            this.OPERATION_TYPES.PET_CLICK,
            amount,
            `Earned ${amount} TAMA: ${reason}`,
            metadata
        );
    },
    
    async spendTAMA(walletAddress, amount, reason, operationType, metadata = {}) {
        if (!(await this.canAfford(walletAddress, amount))) {
            throw new Error(`Insufficient TAMA balance. Required: ${amount}, Available: ${await this.getCurrentBalance(walletAddress)}`);
        }
        
        return await this.createTransaction(
            walletAddress,
            operationType,
            amount,
            `Spent ${amount} TAMA: ${reason}`,
            metadata
        );
    }
};

// Экспорт
window.TAMAAccounting = TAMAAccounting;

// Автоинициализация
document.addEventListener('DOMContentLoaded', () => {
    TAMAAccounting.init();
});

console.log('💰 TAMA Double-Entry Accounting System loaded');
