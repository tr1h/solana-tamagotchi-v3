// ============================================
// IN-GAME SHOP SYSTEM
// ============================================

const Shop = {
    // Shop items
    ITEMS: {
        SKINS: [
            { id: 'skin_cool', name: 'Cool Sunglasses', price: 500, rarity: 'common', emoji: '😎' },
            { id: 'skin_party', name: 'Party Hat', price: 500, rarity: 'common', emoji: '🥳' },
            { id: 'skin_ninja', name: 'Ninja Mask', price: 1500, rarity: 'rare', emoji: '🥷' },
            { id: 'skin_crown', name: 'Royal Crown', price: 5000, rarity: 'epic', emoji: '👑' },
            { id: 'skin_halo', name: 'Angel Halo', price: 10000, rarity: 'legendary', emoji: '😇' }
        ],
        BOOSTERS: [
            { id: 'boost_xp_1h', name: '2x XP (1 hour)', price: 100, duration: 3600, effect: 'xp', multiplier: 2 },
            { id: 'boost_earn_1h', name: '2x Earnings (1 hour)', price: 200, duration: 3600, effect: 'tama', multiplier: 2 },
            { id: 'boost_autofeed', name: 'Auto-Feed (24 hours)', price: 500, duration: 86400, effect: 'autofeed', multiplier: 1 }
        ],
        SPECIAL: [
            { id: 'evolution_boost', name: 'Instant Evolution', price: 1000, effect: 'evolution' },
            { id: 'rename_pet', name: 'Rename Pet', price: 1000, effect: 'rename' },
            { id: 'new_slot', name: 'New Pet Slot', price: 10000, effect: 'slot' }
        ]
    },
    
    // Initialize shop
    init() {
        console.log('🏪 Shop initialized');
        this.renderShop();
    },
    
    // Render shop UI
    renderShop() {
        const shopContainer = document.getElementById('shop-items');
        if (!shopContainer) return;
        
        let html = '';
        
        // Skins section
        html += '<div class="shop-section">';
        html += '<h3>🎨 Skins</h3>';
        html += '<div class="shop-grid">';
        this.ITEMS.SKINS.forEach(item => {
            html += this.renderShopItem(item, 'skin');
        });
        html += '</div></div>';
        
        // Boosters section
        html += '<div class="shop-section">';
        html += '<h3>⚡ Boosters</h3>';
        html += '<div class="shop-grid">';
        this.ITEMS.BOOSTERS.forEach(item => {
            html += this.renderShopItem(item, 'booster');
        });
        html += '</div></div>';
        
        // Special items section
        html += '<div class="shop-section">';
        html += '<h3>✨ Special Items</h3>';
        html += '<div class="shop-grid">';
        this.ITEMS.SPECIAL.forEach(item => {
            html += this.renderShopItem(item, 'special');
        });
        html += '</div></div>';
        
        shopContainer.innerHTML = html;
        
        // Add event listeners
        this.attachEventListeners();
    },
    
    // Render single shop item
    renderShopItem(item, category) {
        const rarityClass = item.rarity ? `rarity-${item.rarity}` : '';
        
        return `
            <div class="shop-item ${rarityClass}" data-id="${item.id}" data-category="${category}">
                <div class="shop-item-icon">${item.emoji || '🎁'}</div>
                <div class="shop-item-name">${item.name}</div>
                ${item.rarity ? `<div class="shop-item-rarity">${item.rarity.toUpperCase()}</div>` : ''}
                ${item.duration ? `<div class="shop-item-duration">${this.formatDuration(item.duration)}</div>` : ''}
                <div class="shop-item-price">${item.price} TAMA</div>
                <button class="shop-buy-btn" onclick="Shop.buyItem('${item.id}', '${category}')">Buy</button>
            </div>
        `;
    },
    
    // Format duration
    formatDuration(seconds) {
        if (seconds >= 86400) return `${seconds / 86400} days`;
        if (seconds >= 3600) return `${seconds / 3600} hours`;
        if (seconds >= 60) return `${seconds / 60} minutes`;
        return `${seconds} seconds`;
    },
    
    // Attach event listeners
    attachEventListeners() {
        // Event listeners are handled via onclick in HTML
    },
    
    // Buy item
    async buyItem(itemId, category) {
        const walletAddress = window.WalletManager?.publicKey?.toString();
        if (!walletAddress) {
            if (window.Utils) {
                Utils.showNotification('❌ Connect wallet first!');
            }
            return;
        }
        
        // Find item
        let item = null;
        if (category === 'skin') {
            item = this.ITEMS.SKINS.find(i => i.id === itemId);
        } else if (category === 'booster') {
            item = this.ITEMS.BOOSTERS.find(i => i.id === itemId);
        } else if (category === 'special') {
            item = this.ITEMS.SPECIAL.find(i => i.id === itemId);
        }
        
        if (!item) {
            console.error('Item not found:', itemId);
            return;
        }
        
        // Confirm purchase
        if (!confirm(`Buy ${item.name} for ${item.price} TAMA?`)) {
            return;
        }
        
        // Spend TAMA
        if (window.TAMASystem) {
            const success = await TAMASystem.spendTAMA(walletAddress, item.price, item.name);
            
            if (success) {
                // Apply item effect
                await this.applyItem(item, category, walletAddress);
                
                // Update UI
                if (window.Game && window.Game.updateUI) {
                    Game.updateUI();
                }
            }
        }
    },
    
    // Apply item effect
    async applyItem(item, category, walletAddress) {
        try {
            if (category === 'skin') {
                // Apply skin
                await this.applySkin(item, walletAddress);
            } else if (category === 'booster') {
                // Activate booster
                await this.activateBooster(item, walletAddress);
            } else if (category === 'special') {
                // Apply special effect
                await this.applySpecial(item, walletAddress);
            }
        } catch (error) {
            console.error('Failed to apply item:', error);
        }
    },
    
    // Apply skin
    async applySkin(skin, walletAddress) {
        // Save to database
        if (window.Database && window.Database.supabase) {
            const { data } = await Database.supabase
                .from('leaderboard')
                .select('pet_data')
                .eq('wallet_address', walletAddress)
                .single();
            
            const petData = data?.pet_data || {};
            petData.skins = petData.skins || [];
            
            if (!petData.skins.includes(skin.id)) {
                petData.skins.push(skin.id);
            }
            
            petData.currentSkin = skin.id;
            
            await Database.supabase
                .from('leaderboard')
                .update({ pet_data: petData })
                .eq('wallet_address', walletAddress);
            
            if (window.Utils) {
                Utils.showNotification(`🎨 Skin equipped: ${skin.name}`);
            }
        }
    },
    
    // Activate booster
    async activateBooster(booster, walletAddress) {
        const endTime = Date.now() + (booster.duration * 1000);
        
        // Save active booster
        const activeBoosters = JSON.parse(localStorage.getItem('activeBoosters') || '{}');
        activeBoosters[booster.effect] = {
            id: booster.id,
            multiplier: booster.multiplier,
            endTime: endTime
        };
        localStorage.setItem('activeBoosters', JSON.stringify(activeBoosters));
        
        if (window.Utils) {
            Utils.showNotification(`⚡ Booster activated: ${booster.name}`);
        }
        
        // Start auto-feed if applicable
        if (booster.effect === 'autofeed') {
            this.startAutoFeed(endTime);
        }
    },
    
    // Apply special item
    async applySpecial(item, walletAddress) {
        if (item.effect === 'evolution') {
            // Instant evolution
            if (window.Game && window.Game.pet) {
                Game.pet.evolution = Math.min((Game.pet.evolution || 0) + 1, 5);
                Game.saveProgress();
                
                if (window.Utils) {
                    Utils.showNotification(`✨ Pet evolved to stage ${Game.pet.evolution}!`);
                }
            }
        } else if (item.effect === 'rename') {
            // Rename pet
            const newName = prompt('Enter new name for your pet:');
            if (newName && window.Game && window.Game.pet) {
                Game.pet.name = newName;
                Game.saveProgress();
                
                if (window.Utils) {
                    Utils.showNotification(`✏️ Pet renamed to ${newName}!`);
                }
            }
        } else if (item.effect === 'slot') {
            // New pet slot (for future multi-pet feature)
            if (window.Utils) {
                Utils.showNotification('🎁 New pet slot unlocked! (Coming soon)');
            }
        }
    },
    
    // Start auto-feed
    startAutoFeed(endTime) {
        const autoFeedInterval = setInterval(() => {
            if (Date.now() > endTime) {
                clearInterval(autoFeedInterval);
                if (window.Utils) {
                    Utils.showNotification('Auto-feed expired');
                }
                return;
            }
            
            // Feed pet if hungry
            if (window.Game && window.Game.pet && Game.pet.hunger < 80) {
                Game.feedPet();
            }
        }, 60000); // Check every minute
    },
    
    // Check active boosters
    getActiveBooster(effect) {
        const activeBoosters = JSON.parse(localStorage.getItem('activeBoosters') || '{}');
        const booster = activeBoosters[effect];
        
        if (booster && Date.now() < booster.endTime) {
            return booster;
        }
        
        // Expired, remove it
        if (booster) {
            delete activeBoosters[effect];
            localStorage.setItem('activeBoosters', JSON.stringify(activeBoosters));
        }
        
        return null;
    }
};

// Export
window.Shop = Shop;


