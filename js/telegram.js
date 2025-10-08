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
        // Try WebApp first, then URL params
        return this.getTelegramDataFromWebApp() || this.getTelegramDataFromURL();
    },

    // Link wallet to Telegram account
    async linkWalletToTelegram(walletAddress) {
        const telegramData = this.getTelegramData();
        
        if (!telegramData) {
            console.log('No Telegram data available');
            return { success: false, message: 'Not opened from Telegram' };
        }

        try {
            const response = await fetch('https://tr1h.github.io/solana-tamagotchi-v3/api/link_telegram.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'link',
                    wallet_address: walletAddress,
                    telegram_id: telegramData.id,
                    telegram_username: telegramData.username
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Telegram linked:', telegramData);
                // Store in localStorage for future use
                localStorage.setItem('telegram_id', telegramData.id);
                localStorage.setItem('telegram_username', telegramData.username);
            }
            
            return data;
        } catch (error) {
            console.error('Error linking Telegram:', error);
            return { success: false, message: error.message };
        }
    },

    // Get wallet by Telegram ID
    async getWalletByTelegramId(telegramId) {
        try {
            const response = await fetch('https://tr1h.github.io/solana-tamagotchi-v3/api/link_telegram.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_wallet',
                    telegram_id: telegramId
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Error getting wallet:', error);
            return { success: false, message: error.message };
        }
    },

    // Get Telegram ID by wallet
    async getTelegramByWallet(walletAddress) {
        try {
            const response = await fetch('https://tr1h.github.io/solana-tamagotchi-v3/api/link_telegram.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_telegram',
                    wallet_address: walletAddress
                })
            });

            return await response.json();
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

