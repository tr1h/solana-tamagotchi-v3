// ============================================
// TAMA SHOP SYSTEM
// ============================================

const TAMAShop = {
    // Товары магазина
    SHOP_ITEMS: {
        // Категория: Еда
        food: [
            {
                id: 'apple',
                name: 'Яблоко',
                emoji: '🍎',
                price: 10,
                description: 'Обычное яблоко',
                effect: { hunger: 20 }
            },
            {
                id: 'steak',
                name: 'Стейк',
                emoji: '🍖',
                price: 20,
                description: 'Сочный стейк',
                effect: { hunger: 40 }
            },
            {
                id: 'cake',
                name: 'Торт',
                emoji: '🍰',
                price: 30,
                description: 'Вкусный торт',
                effect: { hunger: 60, happiness: 10 }
            },
            {
                id: 'pizza',
                name: 'Пицца',
                emoji: '🍕',
                price: 40,
                description: 'Большая пицца',
                effect: { hunger: 80, happiness: 20 }
            },
            {
                id: 'birthday_cake',
                name: 'Праздничный торт',
                emoji: '🎂',
                price: 50,
                description: 'Особый торт для особых случаев',
                effect: { hunger: 100, happiness: 30 }
            }
        ],
        
        // Категория: Игрушки
        toys: [
            {
                id: 'ball',
                name: 'Мяч',
                emoji: '⚽',
                price: 15,
                description: 'Обычный мяч',
                effect: { happiness: 20 }
            },
            {
                id: 'console',
                name: 'Игровая консоль',
                emoji: '🎮',
                price: 25,
                description: 'Для виртуальных игр',
                effect: { happiness: 40 }
            },
            {
                id: 'teddy',
                name: 'Плюшевый мишка',
                emoji: '🧸',
                price: 35,
                description: 'Мягкий и уютный',
                effect: { happiness: 60 }
            },
            {
                id: 'circus',
                name: 'Цирковой набор',
                emoji: '🎪',
                price: 45,
                description: 'Целый цирк!',
                effect: { happiness: 80 }
            }
        ],
        
        // Категория: Медицина
        medicine: [
            {
                id: 'pill',
                name: 'Таблетка',
                emoji: '💊',
                price: 10,
                description: 'От всех болезней',
                effect: { health: 20 }
            },
            {
                id: 'injection',
                name: 'Инъекция',
                emoji: '💉',
                price: 20,
                description: 'Быстрое восстановление',
                effect: { health: 40 }
            },
            {
                id: 'medkit',
                name: 'Лечебный набор',
                emoji: '🏥',
                price: 50,
                description: 'Полное восстановление',
                effect: { health: 100 }
            }
        ],
        
        // Категория: Энергетики
        energy: [
            {
                id: 'coffee',
                name: 'Кофе',
                emoji: '☕',
                price: 10,
                description: 'Бодрящий напиток',
                effect: { energy: 20 }
            },
            {
                id: 'energy_drink',
                name: 'Энергетик',
                emoji: '🥤',
                price: 20,
                description: 'Мощный заряд',
                effect: { energy: 40 }
            },
            {
                id: 'super_energy',
                name: 'Супер-энергия',
                emoji: '⚡',
                price: 30,
                description: 'Максимальная мощь',
                effect: { energy: 60 }
            }
        ],
        
        // Категория: Косметика
        cosmetics: [
            {
                id: 'hat',
                name: 'Шляпа',
                emoji: '🎩',
                price: 100,
                description: 'Стильная шляпа',
                effect: { visual: 'hat' }
            },
            {
                id: 'crown',
                name: 'Корона',
                emoji: '👑',
                price: 200,
                description: 'Для настоящих королей',
                effect: { visual: 'crown' }
            },
            {
                id: 'wings',
                name: 'Крылья',
                emoji: '🦋',
                price: 150,
                description: 'Красивые крылья',
                effect: { visual: 'wings' }
            },
            {
                id: 'sparkle',
                name: 'Сияние',
                emoji: '✨',
                price: 250,
                description: 'Волшебное сияние',
                effect: { visual: 'sparkle' }
            }
        ],
        
        // Категория: Бусты
        boosts: [
            {
                id: 'xp_boost',
                name: '2x XP (1 час)',
                emoji: '📈',
                price: 100,
                description: 'Удвоенный опыт на 1 час',
                effect: { boost: 'xp', duration: 3600 }
            },
            {
                id: 'tama_boost',
                name: '2x TAMA (1 час)',
                emoji: '💰',
                price: 150,
                description: 'Удвоенный TAMA на 1 час',
                effect: { boost: 'tama', duration: 3600 }
            },
            {
                id: 'hunger_protection',
                name: 'Защита от голода (24 часа)',
                emoji: '🛡️',
                price: 200,
                description: 'Голод не уменьшается 24 часа',
                effect: { boost: 'hunger_protection', duration: 86400 }
            },
            {
                id: 'lucky_buff',
                name: 'Lucky Buff (1 час)',
                emoji: '🎯',
                price: 300,
                description: 'Увеличенный шанс редких наград',
                effect: { boost: 'lucky', duration: 3600 }
            }
        ]
    },
    
    // Инициализация магазина
    init() {
        console.log('🛒 Initializing TAMA Shop...');
        this.setupShopUI();
        console.log('✅ TAMA Shop ready');
    },
    
    // Настройка UI магазина
    setupShopUI() {
        // Добавляем кнопку открытия магазина
        const shopBtn = document.getElementById('shop-btn');
        if (shopBtn) {
            shopBtn.addEventListener('click', () => this.openShop());
        }
    },
    
    // Открыть магазин
    openShop() {
        console.log('🛒 Opening TAMA Shop...');
        
        // Создаем модальное окно магазина
        this.createShopModal();
        
        // Загружаем баланс и товары
        this.loadShopBalance();
        this.loadShopItems('food');
        
        // Обновляем баланс каждые 2 секунды
        this.balanceInterval = setInterval(() => {
            this.refreshBalance();
        }, 2000);
    },
    
    // Создать модальное окно магазина
    createShopModal() {
        // Удаляем старое окно если есть
        const oldModal = document.getElementById('shop-modal');
        if (oldModal) oldModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'shop-modal';
        modal.className = 'shop-modal';
        modal.innerHTML = `
            <div class="shop-modal-content">
                <div class="shop-header">
                    <h2>🛒 TAMA SHOP</h2>
                    <span class="shop-close" onclick="window.TAMAShop.closeShop()">&times;</span>
                </div>
                
                <div class="shop-balance">
                    <span>💰 Your Balance:</span>
                    <span id="shop-balance" class="shop-balance-amount">Loading...</span>
                </div>
                
                <div class="shop-tabs">
                    <button class="shop-tab active" data-category="food">🍎 Еда</button>
                    <button class="shop-tab" data-category="toys">🎾 Игрушки</button>
                    <button class="shop-tab" data-category="medicine">💊 Медицина</button>
                    <button class="shop-tab" data-category="energy">⚡ Энергия</button>
                    <button class="shop-tab" data-category="cosmetics">🎨 Косметика</button>
                    <button class="shop-tab" data-category="boosts">🚀 Бусты</button>
                </div>
                
                <div class="shop-items" id="shop-items">
                    <!-- Items will be loaded here -->
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Загружаем баланс
        this.loadShopBalance();
        
        // Загружаем товары (по умолчанию - еда)
        this.loadShopItems('food');
        
        // Добавляем обработчики для табов
        const tabs = modal.querySelectorAll('.shop-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadShopItems(tab.dataset.category);
            });
        });
    },
    
    // Загрузить баланс
    async loadShopBalance() {
        try {
            if (!window.WalletManager || !window.WalletManager.publicKey) {
                return;
            }
            
            let balance = 0;
            
            // Получаем баланс из TAMA Module или Database
            const walletAddress = window.WalletManager?.publicKey?.toString();
            
        if (window.SimpleTAMASystem) {
            balance = await window.SimpleTAMASystem.getBalance(walletAddress);
        } else if (window.TAMAModule) {
            balance = await window.TAMAModule.getBalance(walletAddress);
        } else if (window.Database) {
            // Получаем баланс из leaderboard таблицы
            const { data } = await window.Database.supabase
                .from('leaderboard')
                .select('tama')
                .eq('wallet_address', walletAddress)
                .single();
            
            balance = data?.tama || 0;
        }
            
            const balanceElement = document.getElementById('shop-balance');
            if (balanceElement) {
                balanceElement.textContent = `${balance} TAMA`;
            }
            
            console.log('🛒 Shop balance loaded:', balance, 'TAMA');
        } catch (error) {
            console.error('❌ Error loading shop balance:', error);
        }
    },
    
    // Обновить баланс в реальном времени
    async refreshBalance() {
        await this.loadShopBalance();
    },
    
    // Закрыть магазин
    closeShop() {
        // Очищаем интервал обновления баланса
        if (this.balanceInterval) {
            clearInterval(this.balanceInterval);
            this.balanceInterval = null;
        }
        
        // Удаляем модальное окно
        const modal = document.getElementById('shop-modal');
        if (modal) {
            modal.remove();
        }
    },
    
    // Загрузить товары категории
    loadShopItems(category) {
        const itemsContainer = document.getElementById('shop-items');
        if (!itemsContainer) return;
        
        const items = this.SHOP_ITEMS[category] || [];
        
        itemsContainer.innerHTML = items.map(item => `
            <div class="shop-item">
                <div class="shop-item-emoji">${item.emoji}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-description">${item.description}</div>
                    <div class="shop-item-effect">${this.formatEffect(item.effect)}</div>
                </div>
                <div class="shop-item-actions">
                    <div class="shop-item-price">${item.price} TAMA</div>
                    <button class="shop-item-buy" onclick="window.TAMAShop.buyItem('${category}', '${item.id}')">
                        Купить
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Форматировать эффект товара
    formatEffect(effect) {
        const parts = [];
        
        if (effect.hunger) parts.push(`+${effect.hunger} Голод`);
        if (effect.happiness) parts.push(`+${effect.happiness} Счастье`);
        if (effect.health) parts.push(`+${effect.health} Здоровье`);
        if (effect.energy) parts.push(`+${effect.energy} Энергия`);
        if (effect.visual) parts.push(`Визуал: ${effect.visual}`);
        if (effect.boost) {
            const duration = effect.duration / 3600;
            parts.push(`Буст: ${effect.boost} (${duration}ч)`);
        }
        
        return parts.join(', ');
    },
    
    // Купить товар
    async buyItem(category, itemId) {
        try {
            if (!window.WalletManager || !window.WalletManager.publicKey) {
                alert('Подключите кошелек!');
                return;
            }
            
            // Находим товар
            const item = this.SHOP_ITEMS[category].find(i => i.id === itemId);
            if (!item) {
                alert('Товар не найден!');
                return;
            }
            
            // Проверяем баланс
            let balance = 0;
            const walletAddress = window.WalletManager.publicKey.toString();
            
        if (window.SimpleTAMASystem) {
            balance = await window.SimpleTAMASystem.getBalance(walletAddress);
        } else if (window.TAMAModule) {
            balance = await window.TAMAModule.getBalance(walletAddress);
        } else if (window.Database) {
            // Получаем баланс из leaderboard таблицы
            const { data } = await window.Database.supabase
                .from('leaderboard')
                .select('tama')
                .eq('wallet_address', walletAddress)
                .single();
            
            balance = data?.tama || 0;
        }
            
            if (balance < item.price) {
                alert(`Недостаточно TAMA! У вас: ${balance} TAMA, нужно: ${item.price} TAMA`);
                return;
            }
            
            // Тратим TAMA через SimpleTAMASystem
            let spent = false;
            if (window.SimpleTAMASystem) {
                spent = await window.SimpleTAMASystem.spendTAMA(
                    window.WalletManager.publicKey.toString(),
                    item.price,
                    `Shop: ${item.name}`
                );
            } else if (window.TAMAModule) {
                spent = await window.TAMAModule.spendTAMA(
                    window.WalletManager.publicKey.toString(),
                    item.price,
                    `Shop: ${item.name}`,
                    `Bought ${item.name} from shop`
                );
            } else if (window.Database) {
                await window.Database.updateTAMA(window.WalletManager.publicKey.toString(), -item.price, `Shop: ${item.name}`);
                spent = true;
            }
            
            if (!spent) {
                alert('Ошибка при покупке!');
                return;
            }
            
            // Применяем эффект
            await this.applyItemEffect(item);
            
            // Обновляем баланс
            await this.loadShopBalance();
            
            // Показываем уведомление
            if (window.Utils && window.Utils.showNotification) {
                window.Utils.showNotification(`✅ Куплено: ${item.emoji} ${item.name} за ${item.price} TAMA!`);
            }
            
            console.log(`✅ Bought ${item.name} for ${item.price} TAMA`);
            
        } catch (error) {
            console.error('❌ Error buying item:', error);
            alert('Ошибка при покупке товара!');
        }
    },
    
    // Применить эффект товара
    async applyItemEffect(item) {
        try {
            if (!window.Game || !window.Game.pet) {
                console.warn('⚠️ No pet to apply effect to');
                return;
            }
            
            const effect = item.effect;
            
            // Применяем эффекты на характеристики
            if (effect.hunger) {
                window.Game.pet.hunger = Math.min(100, window.Game.pet.hunger + effect.hunger);
            }
            if (effect.happiness) {
                window.Game.pet.happiness = Math.min(100, window.Game.pet.happiness + effect.happiness);
            }
            if (effect.health) {
                window.Game.pet.health = Math.min(100, window.Game.pet.health + effect.health);
            }
            if (effect.energy) {
                window.Game.pet.energy = Math.min(100, window.Game.pet.energy + effect.energy);
            }
            
            // Применяем визуальные эффекты
            if (effect.visual) {
                window.Game.pet.cosmetic = effect.visual;
            }
            
            // Применяем бусты
            if (effect.boost) {
                if (!window.Game.pet.boosts) window.Game.pet.boosts = {};
                window.Game.pet.boosts[effect.boost] = Date.now() + (effect.duration * 1000);
            }
            
            // Сохраняем изменения
            if (window.Utils) {
                window.Utils.saveLocal('petData', window.Game.pet);
            }
            
            // Сохраняем в базу данных (обновляем hunger, happiness, health, energy)
            if (window.Database && window.Database.supabase && window.WalletManager && window.WalletManager.publicKey) {
                try {
                    const { error } = await window.Database.supabase
                        .from('nft_mints')
                        .update({
                            hunger: window.Game.pet.hunger || 100,
                            happiness: window.Game.pet.happiness || 100,
                            health: window.Game.pet.health || 100,
                            energy: window.Game.pet.energy || 100,
                            updated_at: new Date().toISOString()
                        })
                        .eq('wallet_address', window.WalletManager.publicKey.toString());
                    
                    if (error) {
                        console.error('❌ Error saving pet stats to database:', error);
                    } else {
                        console.log('✅ Pet stats saved to database after shop purchase');
                    }
                } catch (error) {
                    console.error('❌ Error updating pet stats:', error);
                }
            }
            
            // Обновляем UI питомца
            if (window.Game && window.Game.updatePetDisplay) {
                window.Game.updatePetDisplay();
            }
            
            console.log('✅ Item effect applied:', effect);
            
        } catch (error) {
            console.error('❌ Error applying item effect:', error);
        }
    }
};

// Экспорт для глобального использования
window.TAMAShop = TAMAShop;

console.log('✅ TAMA Shop loaded');