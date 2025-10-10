// Telegram integration for wallet linking

const TelegramIntegration = {
    // Check if opened from Telegram
    isTelegramWebApp() {
        return window.Telegram && window.Telegram.WebApp;
    },

    // Get Telegram user data from URL parameters
    getTelegramDataFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const telegramId = urlParams.get('tg_id');
        const telegramUsername = urlParams.get('tg_username');
        
        if (telegramId) {
            return {
                id: telegramId,
                username: telegramUsername || 'Unknown'
            };
        }
        return null;
    },

    // Get Telegram user data from Web App
    getTelegramDataFromWebApp() {
        if (this.isTelegramWebApp()) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user) {
                return {
                    id: user.id.toString(),
                    username: user.username || user.first_name || 'Unknown'
                };
            }
        }
        return null;
    },

    // Get Telegram user data (any method)
    getTelegramData() {
        // Try WebApp first, then URL params, then localStorage
        return this.getTelegramDataFromWebApp() || this.getTelegramDataFromURL() || this.getTelegramDataFromStorage();
    },
    
    // Get Telegram data from localStorage
    getTelegramDataFromStorage() {
        const storedId = localStorage.getItem('telegram_id');
        const storedUsername = localStorage.getItem('telegram_username');
        
        if (storedId && storedUsername) {
            return {
                id: parseInt(storedId),
                username: storedUsername,
                first_name: storedUsername
            };
        }
        
        return null;
    },

    // Link wallet to Telegram account
    async linkWalletToTelegram(walletAddress) {
        const telegramData = this.getTelegramData();
        
        if (!telegramData) {
            console.log('ℹ️ No Telegram data available (opened directly, not from bot)');
            return { success: false, message: 'Not opened from Telegram' };
        }

        try {
            // Use Database (Supabase) to link
            if (!window.Database || !window.Database.supabase) {
                console.error('❌ Database not initialized');
                return { success: false, message: 'Database not initialized' };
            }

            // Update leaderboard with Telegram info
            const { data, error } = await window.Database.supabase
                .from('leaderboard')
                .update({
                    telegram_id: telegramData.id,
                    telegram_username: telegramData.username
                })
                .eq('wallet_address', walletAddress)
                .select();

            if (error) {
                console.error('❌ Telegram link error:', error);
                return { success: false, message: error.message };
            }

            console.log('✅ Telegram linked:', telegramData);
            
            // Store in localStorage for future use
            localStorage.setItem('telegram_id', telegramData.id);
            localStorage.setItem('telegram_username', telegramData.username);
            
            // Show notification
            if (window.Utils && window.Utils.showNotification) {
                window.Utils.showNotification(`✅ Telegram linked: @${telegramData.username}`);
            }
            
            return { success: true, data: data };
        } catch (error) {
            console.error('❌ Error linking Telegram:', error);
            return { success: false, message: error.message };
        }
    },

    // Get wallet by Telegram ID
    async getWalletByTelegramId(telegramId) {
        try {
            if (!window.Database || !window.Database.supabase) {
                return { success: false, message: 'Database not initialized' };
            }

            const { data, error } = await window.Database.supabase
                .from('leaderboard')
                .select('wallet_address')
                .eq('telegram_id', telegramId)
                .single();

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, wallet_address: data?.wallet_address };
        } catch (error) {
            console.error('Error getting wallet:', error);
            return { success: false, message: error.message };
        }
    },

    // Get Telegram ID by wallet
    async getTelegramByWallet(walletAddress) {
        try {
            if (!window.Database || !window.Database.supabase) {
                return { success: false, message: 'Database not initialized' };
            }

            const { data, error } = await window.Database.supabase
                .from('leaderboard')
                .select('telegram_id, telegram_username')
                .eq('wallet_address', walletAddress)
                .single();

            if (error) {
                return { success: false, message: error.message };
            }

            return { 
                success: true, 
                telegram_id: data?.telegram_id,
                telegram_username: data?.telegram_username
            };
        } catch (error) {
            console.error('Error getting Telegram:', error);
            return { success: false, message: error.message };
        }
    },

    // Show Telegram user info in UI
    showTelegramInfo() {
        const telegramData = this.getTelegramData();
        
        if (telegramData) {
            const telegramInfo = document.createElement('div');
            telegramInfo.className = 'telegram-info';
            telegramInfo.innerHTML = `
                <div class="telegram-badge">
                    <span>📱 Telegram: @${telegramData.username}</span>
                </div>
            `;
            document.body.appendChild(telegramInfo);
        }
    }
};

// Auto-link on wallet connect
window.addEventListener('walletConnected', (event) => {
    const walletAddress = event.detail.walletAddress;
    TelegramIntegration.linkWalletToTelegram(walletAddress);
});

// Export for use in other scripts
window.TelegramIntegration = TelegramIntegration;

