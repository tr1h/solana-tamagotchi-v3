// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    // Generate unique ID
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Format SOL amount
    formatSOL(amount) {
        return `${(amount / 1e9).toFixed(4)} SOL`;
    },

    // Format large numbers
    formatNumber(num) {
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toString();
    },

    // Shorten wallet address
    shortenAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    },

    // Show notification
    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notification-text');
        
        text.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hide');
            setTimeout(() => {
                notification.classList.add('hidden');
                notification.classList.remove('hide');
            }, 300);
        }, duration);
    },

    // Create particle effect
    createParticle(x, y, emoji, type = 'normal') {
        const container = document.getElementById('particles-container');
        const particle = document.createElement('div');
        particle.className = `particle ${type}`;
        particle.textContent = emoji;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        container.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 2000);
    },

    // Random number between min and max
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random choice from array
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Get timestamp
    getTimestamp() {
        return Date.now();
    },

    // Check if timestamp is older than hours
    isOlderThan(timestamp, hours) {
        const diff = Date.now() - timestamp;
        return diff > hours * 60 * 60 * 1000;
    },

    // Get time until next daily reward
    getTimeUntilDailyReset(lastClaim) {
        if (!lastClaim) return 'Available now';
        
        const nextClaim = lastClaim + (24 * 60 * 60 * 1000);
        const now = Date.now();
        
        if (now >= nextClaim) return 'Available now';
        
        const diff = nextClaim - now;
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        
        return `${hours}h ${minutes}m`;
    },

    // Calculate XP for next level
    getXPForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    // Get rarity color
    getRarityColor(rarity) {
        const colors = {
            common: '#FFFFFF',
            rare: '#1982C4',
            epic: '#6A4C93',
            legendary: '#FFD60A'
        };
        return colors[rarity] || colors.common;
    },

    // Get pet emoji
    getPetEmoji(type, evolution = 1) {
        const emojis = {
            cat: ['🐱', '😺', '😸', '😻', '🦁'],
            dog: ['🐶', '🐕', '🦮', '🐕‍🦺', '🐺'],
            dragon: ['🐉', '🐲', '🔥🐉', '⚡🐲', '🌟🐉'],
            fox: ['🦊', '🦊✨', '🦊🔥', '🦊⚡', '🦊🌟'],
            bear: ['🐻', '🐻‍❄️', '🧸', '🐻🔥', '🐻⚡'],
            panda: ['🐼', '🐼✨', '🐼🎋', '🐼⚡', '🐼🌟'],
            rabbit: ['🐰', '🐰✨', '🐰🥕', '🐰⚡', '🐰🌟'],
            lion: ['🦁', '🦁✨', '🦁🔥', '🦁⚡', '🦁🌟'],
            unicorn: ['🦄', '🦄✨', '🦄🌈', '🦄⚡', '🦄🌟'],
            wolf: ['🐺', '🐺✨', '🐺🌙', '🐺⚡', '🐺🌟'],
            alien: ['👽', '👽✨', '👽🛸', '👽⚡', '👽🌟'],
            tiger: ['🐯', '🐯✨', '🐯🔥', '🐯⚡', '🐯🌟'],
            // Add uppercase variants for NFT types
            Cat: ['🐱', '😺', '😸', '😻', '🦁'],
            Dog: ['🐶', '🐕', '🦮', '🐕‍🦺', '🐺'],
            Dragon: ['🐉', '🐲', '🔥🐉', '⚡🐲', '🌟🐉'],
            Fox: ['🦊', '🦊✨', '🦊🔥', '🦊⚡', '🦊🌟'],
            Bear: ['🐻', '🐻‍❄️', '🧸', '🐻🔥', '🐻⚡'],
            Panda: ['🐼', '🐼✨', '🐼🎋', '🐼⚡', '🐼🌟'],
            Rabbit: ['🐰', '🐰✨', '🐰🥕', '🐰⚡', '🐰🌟'],
            Lion: ['🦁', '🦁✨', '🦁🔥', '🦁⚡', '🦁🌟'],
            Unicorn: ['🦄', '🦄✨', '🦄🌈', '🦄⚡', '🦄🌟'],
            Wolf: ['🐺', '🐺✨', '🐺🌙', '🐺⚡', '🐺🌟'],
            Alien: ['👽', '👽✨', '👽🛸', '👽⚡', '👽🌟'],
            Tiger: ['🐯', '🐯✨', '🐯🔥', '🐯⚡', '🐯🌟'],
            Phoenix: ['🔥', '🔥✨', '🔥🌟', '🔥⚡', '🔥💫']
        };
        
        // Fix evolution index - ensure it's at least 0
        const evolutionIndex = Math.max(0, evolution - 1);
        return emojis[type]?.[evolutionIndex] || '🐾';
    },

    // Save to localStorage
    saveLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (err) {
            console.error('Failed to save to localStorage:', err);
            return false;
        }
    },

    // Load from localStorage
    loadLocal(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('Failed to load from localStorage:', err);
            return null;
        }
    },

    // Delete from localStorage
    deleteLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error('Failed to delete from localStorage:', err);
            return false;
        }
    },

    // Validate pet name
    validatePetName(name) {
        if (!name || name.trim().length === 0) {
            return { valid: false, error: 'Name cannot be empty' };
        }
        if (name.length > 20) {
            return { valid: false, error: 'Name too long (max 20 chars)' };
        }
        if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
            return { valid: false, error: 'Only letters, numbers and spaces allowed' };
        }
        return { valid: true };
    },

    // Generate referral code (base64 encoded wallet)
    generateReferralCode(walletAddress) {
        if (!walletAddress) return '';
        return btoa(walletAddress); // Base64 encode
    },

    // Check if connected
    isWalletConnected() {
        return window.solana && window.solana.isConnected;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Animation frame helper
    animateValue(start, end, duration, callback) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = start + (end - start) * progress;
            
            callback(value);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    },

    // Check if mobile device
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Check if touch device
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Get random color
    randomColor() {
        const colors = ['#FFCA3A', '#8AC926', '#1982C4', '#FF595E', '#6A4C93'];
        return this.randomChoice(colors);
    },

    // Play sound (placeholder for future implementation)
    playSound(soundName) {
        // TODO: Implement sound system
        console.log(`Playing sound: ${soundName}`);
    },

    // Vibrate device (if supported)
    vibrate(pattern = 100) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    // Request notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    },

    // Show desktop notification
    showDesktopNotification(title, options = {}) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                ...options
            });
        }
    },

    // Get network name
    getNetworkName(cluster) {
        const networks = {
            'mainnet-beta': 'Mainnet',
            'devnet': 'Devnet',
            'testnet': 'Testnet'
        };
        return networks[cluster] || cluster;
    },

    // Handle errors gracefully
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'An error occurred. Please try again.';
        
        if (error.message) {
            if (error.message.includes('User rejected')) {
                message = 'Transaction rejected by user';
            } else if (error.message.includes('insufficient')) {
                message = 'Insufficient balance';
            } else {
                message = error.message;
            }
        }
        
        this.showNotification(`❌ ${message}`, 4000);
    },

    // Format time ago
    timeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (let [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'just now';
    }
};

// Export for use in other files
window.Utils = Utils;

