// 🌐 NETWORK CONFIGURATION
// Переключение между Devnet и Mainnet одним рычагом!

const NetworkConfig = {
    // 🔧 РЫЧАГ ПЕРЕКЛЮЧЕНИЯ
    // Измени на 'mainnet' когда будешь готов к запуску!
    NETWORK: 'devnet', // 'devnet' | 'mainnet'
    
    // 📡 RPC ENDPOINTS
    RPC_ENDPOINTS: {
        devnet: 'https://api.devnet.solana.com',
        mainnet: 'https://api.mainnet-beta.solana.com'
    },
    
    // 💰 ЦЕНЫ ПО ФАЗАМ
    PRICES: {
        devnet: {
            phase1: 0.1, // SOL
            phase2: 0.2,
            phase3: 0.3
        },
        mainnet: {
            phase1: 0.1, // SOL (можно изменить)
            phase2: 0.2,
            phase3: 0.3
        }
    },
    
    // 🎯 КОЛИЧЕСТВО МИНТОВ
    MINT_LIMITS: {
        devnet: {
            phase1: 100,
            phase2: 200,
            phase3: 500
        },
        mainnet: {
            phase1: 1000, // Больше для Mainnet
            phase2: 2000,
            phase3: 5000
        }
    },
    
    // 💰 TAMA БОНУСЫ ПО ФАЗАМ (Early Adopter = больше!)
    TAMA_BONUS: {
        devnet: {
            phase1: 1000,  // 🎁 Early Adopter Bonus!
            phase2: 750,   // Standard
            phase3: 500    // Late
        },
        mainnet: {
            phase1: 1000,  // 🎁 Early Adopter Bonus!
            phase2: 750,   // Standard
            phase3: 500    // Late
        }
    },
    
    // 🏦 TREASURY WALLET
    TREASURY: {
        devnet: 'FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb',
        mainnet: 'FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb' // Замени на свой Mainnet wallet!
    },
    
    // 🎮 ИГРОВЫЕ НАСТРОЙКИ
    GAME_SETTINGS: {
        devnet: {
            xpMultiplier: 1.0,
            tamaMultiplier: 1.0
        },
        mainnet: {
            xpMultiplier: 1.0,
            tamaMultiplier: 1.0
        }
    },
    
    // 🔧 МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ ТЕКУЩИХ НАСТРОЕК
    getCurrentNetwork() {
        return this.NETWORK;
    },
    
    getRpcEndpoint() {
        return this.RPC_ENDPOINTS[this.NETWORK];
    },
    
    getCurrentPrice(phase = 1) {
        return this.PRICES[this.NETWORK][`phase${phase}`];
    },
    
    getMintLimit(phase = 1) {
        return this.MINT_LIMITS[this.NETWORK][`phase${phase}`];
    },
    
    getTAMABonus(phase = 1) {
        return this.TAMA_BONUS[this.NETWORK][`phase${phase}`];
    },
    
    getTreasuryWallet() {
        return this.TREASURY[this.NETWORK];
    },
    
    getGameMultiplier(type = 'xp') {
        return this.GAME_SETTINGS[this.NETWORK][`${type}Multiplier`];
    },
    
    // 🚀 ПЕРЕКЛЮЧЕНИЕ НА MAINNET
    switchToMainnet() {
        console.log('🚀 SWITCHING TO MAINNET...');
        this.NETWORK = 'mainnet';
        console.log('✅ Now using Mainnet RPC:', this.getRpcEndpoint());
        console.log('💰 Mainnet prices:', this.PRICES.mainnet);
        console.log('🎯 Mainnet limits:', this.MINT_LIMITS.mainnet);
        return true;
    },
    
    // 🔧 ПЕРЕКЛЮЧЕНИЕ НА DEVNET
    switchToDevnet() {
        console.log('🔧 SWITCHING TO DEVNET...');
        this.NETWORK = 'devnet';
        console.log('✅ Now using Devnet RPC:', this.getRpcEndpoint());
        return true;
    },
    
    // 📊 ИНФОРМАЦИЯ О ТЕКУЩЕЙ СЕТИ
    getNetworkInfo() {
        return {
            network: this.NETWORK,
            rpc: this.getRpcEndpoint(),
            isMainnet: this.NETWORK === 'mainnet',
            isDevnet: this.NETWORK === 'devnet',
            prices: this.PRICES[this.NETWORK],
            limits: this.MINT_LIMITS[this.NETWORK],
            treasury: this.getTreasuryWallet()
        };
    }
};

// 🌍 ГЛОБАЛЬНЫЙ ДОСТУП
window.NetworkConfig = NetworkConfig;

// 📝 ЛОГИРОВАНИЕ ПРИ ЗАГРУЗКЕ
console.log('🌐 Network Config loaded!');
console.log('📍 Current network:', NetworkConfig.getCurrentNetwork());
console.log('🔗 RPC endpoint:', NetworkConfig.getRpcEndpoint());
console.log('💰 Current prices:', NetworkConfig.PRICES[NetworkConfig.getCurrentNetwork()]);

// 🚀 ЭКСПОРТ ДЛЯ МОДУЛЕЙ
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkConfig;
}
