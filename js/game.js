// ============================================
// GAME LOGIC
// ============================================

const Game = {
    pet: null,
    playerData: null,
    gameLoop: null,
    canvas: null,
    ctx: null,
    
    // Pet types and their traits
    petTypes: {
        cat: { 
            name: 'Cat', 
            emoji: '🐱',
            baseStats: { hunger: 80, energy: 90, happy: 85, health: 100 }
        },
        dog: { 
            name: 'Dog', 
            emoji: '🐶',
            baseStats: { hunger: 85, energy: 95, happy: 90, health: 100 }
        },
        dragon: { 
            name: 'Dragon', 
            emoji: '🐉',
            baseStats: { hunger: 70, energy: 85, happy: 80, health: 100 }
        },
        fox: { 
            name: 'Fox', 
            emoji: '🦊',
            baseStats: { hunger: 75, energy: 88, happy: 82, health: 100 }
        },
        bear: { 
            name: 'Bear', 
            emoji: '🐻',
            baseStats: { hunger: 90, energy: 80, happy: 85, health: 100 }
        },
        rabbit: {
            name: 'Rabbit',
            emoji: '🐰',
            baseStats: { hunger: 70, energy: 95, happy: 88, health: 100 }
        },
        panda: {
            name: 'Panda',
            emoji: '🐼',
            baseStats: { hunger: 85, energy: 75, happy: 92, health: 100 }
        },
        lion: {
            name: 'Lion',
            emoji: '🦁',
            baseStats: { hunger: 88, energy: 85, happy: 80, health: 100 }
        },
        unicorn: {
            name: 'Unicorn',
            emoji: '🦄',
            baseStats: { hunger: 65, energy: 90, happy: 95, health: 100 }
        },
        wolf: {
            name: 'Wolf',
            emoji: '🐺',
            baseStats: { hunger: 82, energy: 92, happy: 78, health: 100 }
        }
    },
    
    // Evolution forms for each type
    evolutions: {
        1: { suffix: 'Baby', emoji: '🥚' },
        5: { suffix: '', emoji: '' },
        10: { suffix: 'Alpha', prefix: '⭐' },
        20: { suffix: 'Master', prefix: '💫' },
        30: { suffix: 'Legendary', prefix: '👑' }
    },
    
    // Traits system
    backgrounds: ['🌅', '🌲', '🌊', '🌌', '⛰️'],
    accessories: ['👑', '😎', '🧣', '🎩', '🪽'],
    effects: ['🔥', '❄️', '⚡', '🌈', '✨'],
    
    // Seasonal/Limited pets
    seasonalPets: {
        christmas: {
            reindeer: { name: 'Reindeer', emoji: '🦌', season: 'winter' },
            snowman: { name: 'Snowman', emoji: '⛄', season: 'winter' },
            elf: { name: 'Elf', emoji: '🧝', season: 'winter' }
        },
        halloween: {
            ghost: { name: 'Ghost', emoji: '👻', season: 'fall' },
            vampire: { name: 'Vampire', emoji: '🧛', season: 'fall' },
            witchcat: { name: 'Witch Cat', emoji: '🐈‍⬛', season: 'fall' }
        }
    },
    
    rarities: ['common', 'rare', 'epic', 'legendary'],
    colors: ['orange', 'brown', 'green', 'red', 'blue', 'purple', 'pink'],
    patterns: ['solid', 'striped', 'spotted', 'gradient'],
    sizes: ['small', 'medium', 'large'],
    personalities: ['playful', 'calm', 'energetic', 'lazy'],
    specialAbilities: ['none', 'fire', 'ice', 'electric', 'magic'],
    
    // Initialize game
    async init() {
        this.canvas = document.getElementById('pet-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 150;
        this.canvas.height = 150;
        
        // Initialize Database first
        if (window.Database && typeof window.Database.init === 'function') {
            await window.Database.init();
        }
        
        // Initialize wallet
        await WalletManager.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check for referral code (for bonuses)
        this.checkReferralCode();
        
        // Show appropriate page
        setTimeout(async () => {
            document.getElementById('loading-screen').classList.add('fade-out');
            
            if (WalletManager.isConnected()) {
                // Check if player has NFT (exists in database)
                await this.checkNFTOwnership();
            } else {
                this.showLanding();
            }
        }, 1000);
        
        // Update landing stats
        this.updateLandingStats();
    },
    
    // Show landing page
    showLanding() {
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
        
        // Hide network indicator on landing
        const networkStatus = document.getElementById('network-status');
        if (networkStatus && networkStatus.parentElement) {
            networkStatus.parentElement.style.display = 'none';
        }
    },
    
    // Show game
    showGame() {
        // Only show if wallet connected
        if (!WalletManager.isConnected()) {
            this.showLanding();
            return;
        }
        
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        // Show network indicator
        const networkStatus = document.getElementById('network-status');
        if (networkStatus && networkStatus.parentElement) {
            networkStatus.parentElement.style.display = 'block';
        }
    },
    
    // Update landing stats
    async updateLandingStats() {
        if (window.Database) {
            const count = await Database.getPlayerCount();
            const landingCounter = document.getElementById('landing-players');
            if (landingCounter) {
                landingCounter.textContent = count;
            }
        }
        // Update every 30 sec
        setTimeout(() => this.updateLandingStats(), 30000);
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Landing connect button
        document.getElementById('landing-connect-btn').addEventListener('click', async () => {
            await WalletManager.connect();
        });
        
        // Wallet button
        document.getElementById('wallet-btn').addEventListener('click', async () => {
            if (WalletManager.isConnected()) {
                await WalletManager.disconnect();
            } else {
                await WalletManager.connect();
            }
        });
        
        // Pet click for XP
        this.canvas.addEventListener('click', (e) => this.clickPet(e));
        this.canvas.style.cursor = 'pointer';
        
        // Pet actions
        document.getElementById('feed-btn').addEventListener('click', () => this.feed());
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('sleep-btn').addEventListener('click', () => this.sleep());
        document.getElementById('heal-btn').addEventListener('click', () => this.heal());
        
        // Pet management
        document.getElementById('evolve-pet-btn').addEventListener('click', () => this.evolvePet());
        
        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });
        
        // Pet type selection
        document.querySelectorAll('.pet-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.pet-type-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('confirm-create-pet').disabled = false;
            });
        });
        
        // Confirm create pet
        document.getElementById('confirm-create-pet').addEventListener('click', () => this.confirmCreatePet());
        
        // Copy referral
        document.getElementById('copy-referral-btn').addEventListener('click', async () => {
            const input = document.getElementById('referral-input');
            const success = await Utils.copyToClipboard(input.value);
            if (success) {
                Utils.showNotification('📋 Referral link copied!');
            }
        });
        
        // Daily reward
        document.getElementById('claim-daily-btn').addEventListener('click', () => this.claimDailyReward());
    },
    
    // Create new pet
    showCreatePetModal() {
        if (!WalletManager.isConnected()) {
            Utils.showNotification('❌ Please connect wallet first');
            return;
        }
        
        document.getElementById('create-pet-modal').classList.remove('hidden');
    },
    
    async confirmCreatePet() {
        const selectedType = document.querySelector('.pet-type-btn.selected');
        if (!selectedType) return;
        
        const type = selectedType.dataset.type;
        const nameInput = document.getElementById('pet-name-input');
        const name = nameInput.value.trim() || `My ${this.petTypes[type].name}`;
        
        // Validate name
        const validation = Utils.validatePetName(name);
        if (!validation.valid) {
            Utils.showNotification(`❌ ${validation.error}`);
            return;
        }
        
        // Redirect to mint page instead of creating pet directly
        Utils.showNotification('🎨 Redirecting to NFT mint page...');
        
        // Close modal
        document.getElementById('create-pet-modal').classList.add('hidden');
        
        // Reset modal
        document.querySelectorAll('.pet-type-btn').forEach(b => b.classList.remove('selected'));
        nameInput.value = '';
        document.getElementById('confirm-create-pet').disabled = true;
        
        // Redirect to mint page
        setTimeout(() => {
            window.location.href = 'mint.html';
        }, 1000);
    },
    
    // Generate pet data (deprecated - use NFT minting instead)
    generatePetData(type, name) {
        console.warn('⚠️ generatePetData is deprecated - use NFT minting instead');
        return null;
    },
    
    // Roll rarity (deprecated - use NFT minting instead)
    rollRarity() {
        console.warn('⚠️ rollRarity is deprecated - use NFT minting instead');
        return 'common';
    },
    
    // Click pet for XP
    clickPet(e) {
        if (!this.pet) {
            Utils.showNotification('❌ No active pet');
            return;
        }
        
        // Get click position
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Add XP for clicking
        this.addXP(1);
        
        // Random happy reaction
        if (Math.random() > 0.7) {
            this.pet.stats.happy = Math.min(100, this.pet.stats.happy + 2);
        }
        
        // Update clicks counter
        const playerData = Utils.loadLocal('playerData') || { petClicks: 0 };
        playerData.petClicks = (playerData.petClicks || 0) + 1;
        Utils.saveLocal('playerData', playerData);
        
        // Visual feedback
        Utils.createParticle(rect.left + x, rect.top + y, '+1 XP', 'sparkle');
        this.animatePet('happy');
        
        // Sound effect (if available)
        Utils.playSound('click');
        
        // Check click achievements
        if (window.Achievements) {
            if (playerData.petClicks === 1) Achievements.unlock('first_click');
            if (playerData.petClicks === 10) Achievements.unlock('click_master');
            if (playerData.petClicks === 100) Achievements.unlock('click_legend');
        }
        
        this.updatePetDisplay();
        this.savePetData();
    },
    
    // Feed pet (ПЛАТНОЕ!)
    async feed() {
        if (!this.pet) {
            Utils.showNotification('❌ No active pet');
            return;
        }
        
        if (this.pet.stats.hunger >= 100) {
            Utils.showNotification('🍔 Pet is not hungry');
            return;
        }
        
        // Проверяем подключение кошелька
        if (!WalletManager.isConnected()) {
            Utils.showNotification('❌ Connect wallet to feed pet!');
            return;
        }
        
        // Стоимость кормления
        const feedingCost = 10; // 10 TAMA за кормление
        
        // Проверяем баланс TAMA
        if (window.SimpleTAMASystem) {
            const balance = await window.SimpleTAMASystem.getBalance(WalletManager.getAddress());
            if (balance < feedingCost) {
                Utils.showNotification(`❌ Not enough TAMA! Need: ${feedingCost} TAMA`);
                return;
            }
        }
        
        try {
            // Списываем TAMA
            if (window.SimpleTAMASystem) {
                const success = await window.SimpleTAMASystem.spendTAMA(
                    WalletManager.getAddress(),
                    feedingCost,
                    'Pet Feeding'
                );
                if (!success) {
                    throw new Error('Failed to spend TAMA for feeding');
                }
            }
            
            this.pet.stats.hunger = Math.min(100, this.pet.stats.hunger + 25);
            this.pet.stats.energy = Math.max(0, this.pet.stats.energy - 5);
            this.addXP(10);
            
            this.updatePetDisplay();
            this.savePetData();
            
            Utils.showNotification(`🍔 Fed pet! (Cost: ${feedingCost} TAMA)`);
            Utils.createParticle(this.canvas.offsetLeft + 75, this.canvas.offsetTop + 75, '🍔');
            this.animatePet('eating');
            
            // Обновляем баланс
            if (window.WalletManager) {
                await window.WalletManager.updateBalanceDisplay();
            }
            
        } catch (error) {
            console.error('Error feeding pet:', error);
            Utils.showNotification('❌ Error feeding pet!');
        }
    },
    
    // Play with pet
    async play() {
        if (!this.pet) {
            Utils.showNotification('❌ No active pet');
            return;
        }
        
        if (this.pet.stats.energy < 20) {
            Utils.showNotification('😴 Pet is too tired');
            return;
        }
        
        this.pet.stats.happy = Math.min(100, this.pet.stats.happy + 20);
        this.pet.stats.energy = Math.max(0, this.pet.stats.energy - 15);
        this.pet.stats.hunger = Math.max(0, this.pet.stats.hunger - 10);
        this.addXP(15);
        
        // Award TAMA for playing
        if (window.SimpleTAMASystem && WalletManager.isConnected()) {
            await window.SimpleTAMASystem.addTAMA(WalletManager.getAddress(), 10, 'Playing with Pet');
        }
        
        this.updatePetDisplay();
        this.savePetData();
        
        Utils.showNotification('🎮 Played with pet!');
        Utils.createParticle(this.canvas.offsetLeft + 75, this.canvas.offsetTop + 75, '🎉', 'confetti');
        this.animatePet('happy');
    },
    
    // Pet sleep
    sleep() {
        if (!this.pet) {
            Utils.showNotification('❌ No active pet');
            return;
        }
        
        if (this.pet.stats.energy >= 100) {
            Utils.showNotification('⚡ Pet is not tired');
            return;
        }
        
        this.pet.stats.energy = Math.min(100, this.pet.stats.energy + 30);
        this.pet.stats.happy = Math.max(0, this.pet.stats.happy - 5);
        this.addXP(5);
        
        this.updatePetDisplay();
        this.savePetData();
        
        Utils.showNotification('😴 Pet is sleeping!');
        Utils.createParticle(this.canvas.offsetLeft + 75, this.canvas.offsetTop + 75, '💤');
        this.animatePet('sleeping');
    },
    
    // Heal pet (ПЛАТНОЕ!)
    async heal() {
        if (!this.pet) {
            Utils.showNotification('❌ No active pet');
            return;
        }
        
        if (this.pet.stats.health >= 100) {
            Utils.showNotification('❤️ Pet is healthy');
            return;
        }
        
        // Проверяем подключение кошелька
        if (!WalletManager.isConnected()) {
            Utils.showNotification('❌ Connect wallet to heal pet!');
            return;
        }
        
        // Стоимость лечения
        const healingCost = 15; // 15 TAMA за лечение
        
        // Проверяем баланс TAMA
        if (window.SimpleTAMASystem) {
            const balance = await window.SimpleTAMASystem.getBalance(WalletManager.getAddress());
            if (balance < healingCost) {
                Utils.showNotification(`❌ Not enough TAMA! Need: ${healingCost} TAMA`);
                return;
            }
        }
        
        try {
            // Списываем TAMA
            if (window.SimpleTAMASystem) {
                const success = await window.SimpleTAMASystem.spendTAMA(
                    WalletManager.getAddress(),
                    healingCost,
                    'Pet Healing'
                );
                if (!success) {
                    throw new Error('Failed to spend TAMA for healing');
                }
            }
            
            this.pet.stats.health = 100;
            this.updatePetDisplay();
            this.savePetData();
            
            Utils.showNotification(`💊 Pet healed! (Cost: ${healingCost} TAMA)`);
            Utils.createParticle(this.canvas.offsetLeft + 75, this.canvas.offsetTop + 75, '💚', 'sparkle');
            
            // Обновляем баланс
            if (window.WalletManager) {
                await window.WalletManager.updateBalanceDisplay();
            }
            
        } catch (error) {
            console.error('Error healing pet:', error);
            Utils.showNotification('❌ Error healing pet!');
        }
    },
    
    // Add XP
    addXP(amount) {
        if (!this.pet) return;
        
        // 🛡️ Anti-Cheat валидация
        if (window.AntiCheat && !window.AntiCheat.validateXPGain(amount, 'game_action')) {
            console.warn('🚨 XP gain blocked by anti-cheat');
            return;
        }
        
        this.pet.xp += amount;
        
        // Initialize total_xp if not exists
        if (!this.pet.total_xp) {
            this.pet.total_xp = 0;
        }
        this.pet.total_xp += amount;
        
        const xpNeeded = Utils.getXPForLevel(this.pet.level);
        
        if (this.pet.xp >= xpNeeded) {
            this.levelUp();
        } else {
            // Update leaderboard even without level up
            if (window.Database && WalletManager.isConnected()) {
                const playerData = {
                    pet_name: this.pet.name,
                    level: this.pet.level,
                    xp: this.pet.xp,
                    total_xp: this.pet.total_xp,
                    tama: this.pet.tama || 0,
                    pet_data: this.pet
                };
                
                Database.updatePlayerData(WalletManager.getAddress(), playerData);
                
                // Update ranking score
                if (window.RankingSystem) {
                    window.RankingSystem.updatePlayerRanking(WalletManager.getAddress(), playerData);
                }
            }
        }
        
        this.updateXPBar();
    },
    
    // Level up
    async levelUp() {
        // 🛡️ Anti-Cheat валидация
        if (window.AntiCheat && !window.AntiCheat.validateLevelUp(this.pet.level, this.pet.level + 1)) {
            console.warn('🚨 Level up blocked by anti-cheat');
            return;
        }
        
        this.pet.level++;
        this.pet.xp = 0; // Reset current level XP, but keep total_xp
        
        // Increase stats slightly
        this.pet.stats.health = 100;
        this.pet.stats.hunger = Math.min(100, this.pet.stats.hunger + 10);
        this.pet.stats.energy = Math.min(100, this.pet.stats.energy + 10);
        this.pet.stats.happy = Math.min(100, this.pet.stats.happy + 10);
        
        Utils.showNotification(`🎉 Level Up! Now level ${this.pet.level}`);
        
        // Award TAMA for level up
        if (window.SimpleTAMASystem && WalletManager.isConnected()) {
            await window.SimpleTAMASystem.addTAMA(WalletManager.getAddress(), 50, 'Level Up');
        }
        
        // Update leaderboard
        if (window.Database && WalletManager.isConnected()) {
            const playerData = {
                pet_name: this.pet.name,
                level: this.pet.level,
                xp: this.pet.xp,
                total_xp: this.pet.total_xp,
                tama: this.pet.tama || 0,
                pet_data: this.pet
            };
            
            Database.updatePlayerData(WalletManager.getAddress(), playerData);
            
            // Update ranking score
            if (window.RankingSystem) {
                window.RankingSystem.updatePlayerRanking(WalletManager.getAddress(), playerData);
            }
        }
        
        // Check for evolution (every 5 levels)
        if (this.pet.level % 5 === 0 && this.pet.evolution < 5) {
            this.pet.evolution++;
            this.showEvolutionModal();
        }
        
        // Check achievements
        if (window.Achievements) {
            Achievements.check('level_10', this.pet.level);
            Achievements.check('level_50', this.pet.level);
        }
        
        this.updatePetDisplay();
        this.savePetData();
    },
    
    // Evolve pet
    showEvolutionModal() {
        document.getElementById('evolution-modal').classList.remove('hidden');
        document.getElementById('old-pet-emoji').textContent = Utils.getPetEmoji(this.pet.type, this.pet.evolution);
        document.getElementById('new-pet-emoji').textContent = Utils.getPetEmoji(this.pet.type, this.pet.evolution + 1);
        document.getElementById('old-level').textContent = this.pet.evolution;
        document.getElementById('new-level').textContent = this.pet.evolution + 1;
    },
    
    async evolvePet() {
        if (!this.pet) return;
        
        const playerData = Utils.loadLocal('playerData');
        
        if (!playerData || playerData.tama < 50) {
            Utils.showNotification('❌ Need 50 TAMA to evolve');
            return;
        }
        
        playerData.tama -= 50;
        Utils.saveLocal('playerData', playerData);
        
        this.pet.evolution++;
        
        document.getElementById('evolution-modal').classList.add('hidden');
        
        Utils.showNotification(`✨ Pet evolved to stage ${this.pet.evolution}!`);
        this.animatePet('evolving');
        
        this.updatePetDisplay();
        this.savePetData();
    },
    
    // Update pet display
    updatePetDisplay() {
        if (!this.pet) {
            console.log('❌ No pet data available for display');
            return;
        }
        
        // Update pet info
        document.getElementById('pet-name').textContent = this.pet.name || 'Unknown Pet';
        const petTypeName = this.petTypes[this.pet.type]?.name || this.pet.type || 'Unknown';
        document.getElementById('pet-type').textContent = `${petTypeName} (${this.pet.rarity || 'common'})`;
        document.getElementById('pet-level').textContent = `Level ${this.pet.level || 1}`;
        
        // Update stats
        this.updateStatBar('hunger', this.pet.stats.hunger);
        this.updateStatBar('energy', this.pet.stats.energy);
        this.updateStatBar('happy', this.pet.stats.happy);
        this.updateStatBar('health', this.pet.stats.health);
        
        // Update XP
        this.updateXPBar();
        
        // Draw pet
        this.drawPet();
        
        // Update buttons
        document.getElementById('evolve-pet-btn').disabled = this.pet.level % 10 !== 0 || this.pet.evolution >= 5;
    },
    
    // Update stat bar
    updateStatBar(stat, value) {
        const bar = document.getElementById(`${stat}-bar`);
        const valueSpan = document.getElementById(`${stat}-value`);
        
        bar.style.width = `${value}%`;
        valueSpan.textContent = Math.floor(value);
        
        // Add warning class if low
        if (value < 30) {
            bar.classList.add('warning');
        } else {
            bar.classList.remove('warning');
        }
    },
    
    // Update XP bar
    updateXPBar() {
        if (!this.pet) return;
        
        const xpNeeded = Utils.getXPForLevel(this.pet.level);
        const percentage = (this.pet.xp / xpNeeded) * 100;
        
        document.getElementById('xp-bar').style.width = `${percentage}%`;
        document.getElementById('xp-text').textContent = `${this.pet.xp} / ${xpNeeded} XP`;
    },
    
    // Draw pet on canvas
    drawPet() {
        if (!this.ctx || !this.pet) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get pet emoji with animation
        const emoji = this.getAnimatedPetEmoji();
        
        // Draw pet emoji with animation
        this.ctx.font = '60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (this.pet.isCritical) {
            // Critical state - dim and add warning
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillText(emoji, 60, 60);
            this.ctx.globalAlpha = 1;
            this.ctx.font = '20px Arial';
            this.ctx.fillText('🆘', 60, 100);
        } else {
            this.ctx.fillText(emoji, 60, 60);
        }
        
        // Add floating particles for happy pets
        if (this.pet.stats.happy > 80 && Math.random() > 0.95) {
            this.addFloatingParticle();
        }
    },
    
    // Get animated pet emoji based on state
    getAnimatedPetEmoji() {
        if (!this.pet) return '🐾'; // Fallback to paws if no pet
        
        // Получаем эмодзи питомца с учетом эволюции
        const emoji = Utils.getPetEmoji(this.pet.type, this.pet.evolution + 1);
        
        // Добавляем анимацию в зависимости от состояния
        if (this.pet.isDead) {
            return '💀';
        } else if (this.pet.isCritical) {
            return '🆘' + emoji;
        } else if (this.pet.stats.happy > 80) {
            return emoji + '✨';
        } else if (this.pet.stats.hunger < 30) {
            return emoji + '😢';
        } else if (this.pet.stats.energy < 30) {
            return emoji + '😴';
        } else {
            return emoji;
        }
    },
    
    // Add floating particle effect
    addFloatingParticle() {
        const particles = ['✨', '💫', '⭐', '🌟'];
        const particle = particles[Math.floor(Math.random() * particles.length)];
        
        // Create temporary particle element
        const particleEl = document.createElement('div');
        particleEl.textContent = particle;
        particleEl.style.position = 'absolute';
        particleEl.style.fontSize = '20px';
        particleEl.style.pointerEvents = 'none';
        particleEl.style.zIndex = '1000';
        particleEl.style.left = (75 + Math.random() * 20 - 10) + 'px';
        particleEl.style.top = (75 + Math.random() * 20 - 10) + 'px';
        particleEl.style.animation = 'floatUp 2s ease-out forwards';
        
        // Add to canvas container
        const canvasContainer = this.canvas.parentElement;
        if (canvasContainer) {
            canvasContainer.appendChild(particleEl);
            
            // Remove after animation
            setTimeout(() => {
                if (particleEl.parentElement) {
                    particleEl.parentElement.removeChild(particleEl);
                }
            }, 2000);
        }
    },
    
    // Animate pet
    animatePet(animation) {
        this.canvas.classList.remove('idle', 'happy', 'sad', 'sleeping', 'eating', 'evolving');
        this.canvas.classList.add(animation);
        
        setTimeout(() => {
            this.canvas.classList.remove(animation);
            this.canvas.classList.add('idle');
        }, 1000);
    },
    
    // Start game loop
    startGameLoop() {
        this.stopGameLoop();
        
        this.gameLoop = setInterval(() => {
            this.updatePetStats();
        }, 60000); // Every minute
    },
    
    // Stop game loop
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    },
    
    // Update pet stats over time
    updatePetStats() {
        if (!this.pet) return;
        
        // Decrease stats over time
        this.pet.stats.hunger = Math.max(0, this.pet.stats.hunger - 2);
        this.pet.stats.energy = Math.max(0, this.pet.stats.energy - 1);
        this.pet.stats.happy = Math.max(0, this.pet.stats.happy - 1);
        
        // Check if pet should lose health
        if (this.pet.stats.hunger < 20 || this.pet.stats.happy < 20) {
            this.pet.stats.health = Math.max(5, this.pet.stats.health - 5); // Min 5% health
        }
        
        // Check if pet is critical
        if (this.pet.stats.health <= 10 && !this.pet.isCritical) {
            this.petCritical();
        } else if (this.pet.stats.health > 30 && this.pet.isCritical) {
            this.pet.isCritical = false;
            Utils.showNotification('💚 Pet recovered from critical state!');
        }
        
        this.pet.lastUpdate = Date.now();
        this.updatePetDisplay();
        this.savePetData();
    },
    
    // Pet critical state
    petCritical() {
        this.pet.isCritical = true;
        
        Utils.showNotification('🆘 CRITICAL! Your pet needs immediate care!');
        Utils.createParticle(window.innerWidth / 2, window.innerHeight / 2, '🆘', 'critical');
        
        this.drawPet();
    },
    
    // Claim daily reward
    async claimDailyReward() {
        if (!WalletManager.isConnected()) {
            Utils.showNotification('❌ Connect wallet first');
            return;
        }
        
        const playerData = Utils.loadLocal('playerData') || { tama: 0, lastDaily: 0 };
        
        if (playerData.lastDaily && !Utils.isOlderThan(playerData.lastDaily, 24)) {
            const timeLeft = Utils.getTimeUntilDailyReset(playerData.lastDaily);
            Utils.showNotification(`⏰ Next reward in ${timeLeft}`);
            return;
        }
        
        // Award TAMA for daily login
        if (window.SimpleTAMASystem && WalletManager.isConnected()) {
            await window.SimpleTAMASystem.addTAMA(WalletManager.getAddress(), 25, 'Daily Login');
        }
        
        // Give reward through unified TAMA system
        const reward = 50;
        playerData.lastDaily = Date.now();
        
        Utils.saveLocal('playerData', playerData);
        
        // Use unified TAMA system
        if (window.TreasurySystem && WalletManager.isConnected()) {
            await window.TreasurySystem.awardDailyReward(WalletManager.getAddress());
        } else if (window.SimpleTAMASystem && WalletManager.isConnected()) {
            await window.SimpleTAMASystem.addTAMA(WalletManager.getAddress(), reward, 'Daily Login');
        }
        
        await WalletManager.updateBalanceDisplay();
        
        // Reward referrers
        if (window.Database && WalletManager.isConnected()) {
            Database.rewardReferrers(WalletManager.getAddress(), reward);
        }
        
        Utils.showNotification(`🎁 Claimed ${reward} TAMA!`);
        Utils.createParticle(window.innerWidth / 2, window.innerHeight / 2, '🎁', 'sparkle');
        
        // Update timer
        this.updateDailyTimer();
    },
    
    // Update daily timer
    updateDailyTimer() {
        const playerData = Utils.loadLocal('playerData');
        const timerText = document.getElementById('daily-timer');
        
        if (!playerData || !playerData.lastDaily) {
            timerText.textContent = 'Available now!';
            document.getElementById('claim-daily-btn').disabled = false;
        } else {
            const timeLeft = Utils.getTimeUntilDailyReset(playerData.lastDaily);
            timerText.textContent = timeLeft === 'Available now' ? timeLeft : `Next: ${timeLeft}`;
            document.getElementById('claim-daily-btn').disabled = timeLeft !== 'Available now';
        }
    },
    
    // Save pet data
    savePetData() {
        if (this.pet) {
            Utils.saveLocal('petData', this.pet);
            
            // Save to Supabase if available
            if (window.Database && WalletManager.isConnected()) {
                Database.updatePlayerData(WalletManager.getAddress(), {
                    pet_name: this.pet.name,
                    pet_type: this.pet.type,
                    pet_rarity: this.pet.rarity,
                    level: this.pet.level,
                    xp: this.pet.xp,
                    tama: this.pet.tama || 0,
                    pet_data: this.pet
                });
            }
        }
    },
    
    // Load pet data
    loadPetData() {
        this.pet = Utils.loadLocal('petData');
        
        if (this.pet) {
            this.updatePetDisplay();
            this.startGameLoop();
        }
    },
    
    // Auto-load pet on wallet connect
    async autoLoadPet() {
        if (!WalletManager.isConnected()) return;
        
        // ИСПРАВЛЕНО: Загружаем питомца из nft_mints таблицы
        if (window.Database && window.Database.supabase) {
            try {
                const { data } = await window.Database.supabase
                    .from('nft_mints')
                    .select('*')
                    .eq('wallet_address', WalletManager.getAddress())
                    .eq('status', 'minted')
                    .single();
                
                if (data) {
                    // Преобразуем данные из базы в формат питомца
                    this.pet = {
                        id: data.id,
                        name: data.pet_name,
                        type: data.pet_type,
                        rarity: data.pet_traits?.rarity || 'common',
                        traits: data.pet_traits || {},
                        stats: data.stats || {
                            hunger: 100,
                            energy: 100,
                            happy: 100,
                            health: 100
                        },
                        level: data.level || 1,
                        xp: data.xp || 0,
                        evolution: data.evolution || 0,
                        abilities: data.abilities || [],
                        abilityCooldowns: data.ability_cooldowns || {},
                        attributes: data.attributes || {},
                        tamaMultiplier: data.tama_multiplier || 1.0,
                        mintAddress: data.mint_address,
                        createdAt: new Date(data.created_at).getTime(),
                        lastUpdate: new Date(data.updated_at).getTime(),
                        lastFed: new Date(data.last_fed).getTime(),
                        lastPlayed: new Date(data.last_played).getTime(),
                        lastSlept: new Date(data.last_slept).getTime(),
                        isDead: data.is_dead || false,
                        isCritical: data.is_critical || false,
                        isHibernating: data.is_hibernating || false,
                        isStealthed: data.is_stealthed || false
                    };
                    
                    Utils.saveLocal('petData', this.pet);
                    console.log('✅ Pet loaded from nft_mints database');
                }
            } catch (error) {
                console.error('❌ Error loading pet from database:', error);
            }
        }
        
        // Fallback to localStorage if database fails
        if (!this.pet) {
            const localPet = Utils.loadLocal('petData');
            if (localPet) {
                this.pet = localPet;
                console.log('✅ Pet loaded from localStorage');
            } else {
                console.log('❌ No pet data found - NFT required');
                return;
            }
        }
        
        if (this.pet) {
            // Check time since last update
            const timeSinceUpdate = Date.now() - (this.pet.lastUpdate || Date.now());
            const minutesPassed = Math.floor(timeSinceUpdate / 60000);
            
            // Apply gradual stat decrease (but keep minimum values)
            if (minutesPassed > 0) {
                this.pet.stats.hunger = Math.max(20, this.pet.stats.hunger - (minutesPassed * 2));
                this.pet.stats.energy = Math.max(20, this.pet.stats.energy - minutesPassed);
                this.pet.stats.happy = Math.max(20, this.pet.stats.happy - minutesPassed);
                this.pet.stats.health = Math.max(30, this.pet.stats.health - Math.floor(minutesPassed / 5));
                this.pet.lastUpdate = Date.now();
                this.savePetData();
            }
            
            this.updatePetDisplay();
            this.startGameLoop();
            Utils.showNotification('🐾 Pet loaded!');
        }
    },
    
    // Check referral code
    // Check if player owns NFT (database + blockchain verification)
    async checkNFTOwnership() {
        try {
            console.log('🔍 Checking NFT ownership...');
            
            const walletAddress = WalletManager.getAddress();
            if (!walletAddress) {
                console.error('❌ No wallet connected');
                this.showMintRequired();
                return;
            }
            
            // ✅ STEP 1: Проверка в таблице nft_mints (быстро)
            if (window.Database && window.Database.supabase) {
                const { data, error } = await window.Database.supabase
                    .from('nft_mints')
                    .select('*')
                    .eq('wallet_address', walletAddress)
                    .order('mint_timestamp', { ascending: false })
                    .limit(1);
                
                if (error) {
                    console.error('❌ Error checking NFT ownership:', error);
                } else if (data && data.length > 0) {
                    const nft = data[0];
                    console.log('✅ NFT found in nft_mints table:', nft);
                    
                    // Создаём pet из NFT данных
                    const petData = {
                        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: nft.pet_name || 'My Pet',
                        type: nft.pet_type,
                        rarity: nft.pet_traits?.rarity || 'Common',
                        level: nft.level || 1,
                        xp: nft.xp || 0,
                        total_xp: nft.total_xp || 0,
                        evolution: nft.evolution || 0,
                        stats: nft.stats || {
                            hunger: 100,
                            energy: 100,
                            happy: 100,
                            health: 100
                        },
                        attributes: nft.attributes || {
                            intelligence: 50,
                            strength: 50,
                            speed: 50,
                            magic: 50
                        },
                        abilities: nft.abilities || [],
                        abilityCooldowns: nft.ability_cooldowns || {},
                        tamaMultiplier: nft.tama_multiplier || 1.0,
                        mintAddress: nft.mint_address,
                        createdAt: new Date(nft.mint_timestamp).getTime(),
                        lastFed: nft.last_fed ? new Date(nft.last_fed).getTime() : Date.now(),
                        lastPlayed: nft.last_played ? new Date(nft.last_played).getTime() : Date.now(),
                        lastSlept: nft.last_slept ? new Date(nft.last_slept).getTime() : Date.now()
                    };
                    
                    this.pet = petData;
                    Utils.saveLocal('petData', this.pet);
                    
                    this.showGame();
                    this.updatePetDisplay();
                    this.startGameLoop();
                    
                    // ✅ STEP 2: Verify on-chain в фоне (опционально)
                    this.verifyNFTOnChain(walletAddress, nft.mint_address);
                    return;
                }
            }
            
            // ✅ STEP 1.5: Fallback - проверка в players таблице
            if (window.Database && window.Database.loadPlayerData) {
                const playerData = await window.Database.loadPlayerData(walletAddress);
                console.log('🔍 Player data from database:', playerData);
                
                if (playerData && playerData.pet_data && playerData.pet_data.name) {
                    console.log('✅ NFT found in database, showing game');
                    
                    // Set pet data for the game
                    this.pet = playerData.pet_data;
                    Utils.saveLocal('petData', this.pet);
                    
                    this.showGame();
                    this.updatePetDisplay();
                    this.startGameLoop();
                    
                    // ✅ STEP 2: Verify on-chain в фоне (опционально)
                    this.verifyNFTOnChain(walletAddress, playerData.nft_mint_address);
                    return;
                } else if (playerData && playerData.nft_mint_address && (playerData.pet_name || playerData.pet_type)) {
                    // Create pet from NFT data if no pet_data
                    console.log('🔄 Creating pet from NFT data...');
                    const petData = await this.createPetFromNFTData(playerData);
                    this.pet = petData;
                    Utils.saveLocal('petData', this.pet);
                    
                    this.showGame();
                    this.updatePetDisplay();
                    this.startGameLoop();
                    return;
                }
            }
            
            // ✅ STEP 3: Если нет в базе - проверяем blockchain напрямую
            console.log('🔍 No data in database, checking blockchain...');
            
            if (window.UmiCandyMachine && window.UmiCandyMachine.umi) {
                const ownership = await window.UmiCandyMachine.checkNFTOwnership(walletAddress);
                
                if (ownership && ownership.hasNFT && ownership.nfts.length > 0) {
                    console.log('✅ NFT found on blockchain!', ownership);
                    
                    // Создаём pet из NFT данных
                    const nft = ownership.nfts[0];
                    const petData = await this.createPetFromNFT(nft);
                    
                    this.pet = petData;
                    Utils.saveLocal('petData', this.pet);
                    
                    // Сохраняем в базу данных
                    if (window.Database) {
                        await window.Database.updatePlayerData(walletAddress, {
                            nft_mint_address: nft.publicKey,
                            pet_name: petData.name,
                            pet_type: petData.type,
                            pet_rarity: petData.rarity,
                            pet_data: petData
                        });
                    }
                    
                    this.showGame();
                    return;
                }
            }
            
            // ❌ NFT не найден ни в базе, ни на blockchain
            console.log('❌ No NFT found, redirecting to mint');
            // Не показываем модалку сразу - даём время на обновление базы
            setTimeout(() => {
                this.showMintRequired();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error checking NFT ownership:', error);
            this.showMintRequired();
        }
    },
    
    // Verify NFT on blockchain (background check)
    async verifyNFTOnChain(walletAddress, expectedMintAddress) {
        try {
            if (!window.UmiCandyMachine || !window.UmiCandyMachine.umi) return;
            
            const ownership = await window.UmiCandyMachine.checkNFTOwnership(walletAddress);
            
            if (ownership && ownership.hasNFT) {
                const ownedMints = ownership.nfts.map(nft => nft.publicKey);
                
                if (expectedMintAddress && !ownedMints.includes(expectedMintAddress)) {
                    console.warn('⚠️ NFT mismatch! Database says one thing, blockchain says another');
                    // Could show warning to user
                }
                
                console.log('✅ Blockchain verification passed');
            } else {
                console.warn('⚠️ NFT not found on blockchain but exists in database');
            }
        } catch (error) {
            console.warn('⚠️ Blockchain verification failed:', error);
        }
    },
    
    // Create pet data from NFT metadata
    async createPetFromNFT(nft) {
        // Если есть metadata с gameData - используем её
        if (nft.metadata && nft.metadata.gameData) {
            return {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: `My ${nft.metadata.gameData.type.charAt(0).toUpperCase() + nft.metadata.gameData.type.slice(1)}`,
                type: nft.metadata.gameData.type,
                rarity: nft.metadata.gameData.rarity,
                stats: {
                    hunger: 100,
                    energy: 100,
                    happy: 100,
                    health: 100
                },
                level: nft.metadata.gameData.level || 1,
                xp: nft.metadata.gameData.xp || 0,
                total_xp: nft.metadata.gameData.total_xp || ((nft.metadata.gameData.level || 1) - 1) * 100 + (nft.metadata.gameData.xp || 0),
                evolution: Math.floor((nft.metadata.gameData.level || 1) / 5) + 1, // Calculate evolution from level
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                isDead: false,
                isCritical: false
            };
        }
        
        // Fallback: генерируем случайного питомца
        const types = ['cat', 'dog', 'dragon', 'fox', 'bear', 'rabbit', 'panda', 'lion', 'unicorn', 'wolf'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        return {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `My ${randomType.charAt(0).toUpperCase() + randomType.slice(1)}`,
            type: randomType,
            rarity: 'common',
            stats: {
                hunger: 100,
                energy: 100,
                happy: 100,
                health: 100
            },
            level: 1,
            xp: 0,
            total_xp: 0,
            evolution: 1,
            createdAt: Date.now(),
            lastUpdate: Date.now(),
            isDead: false,
            isCritical: false
        };
    },
    
    // Create pet from NFT data in database
    async createPetFromNFTData(playerData) {
        try {
            console.log('🎨 Creating pet from NFT data:', playerData);
            
            const petData = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: playerData.pet_name || 'My Pet',
                type: playerData.pet_type || 'cat',
                rarity: playerData.pet_rarity || 'common',
                stats: {
                    hunger: 100,
                    energy: 100,
                    happy: 100,
                    health: 100
                },
                level: playerData.level || 1,
                xp: playerData.xp || 0,
                total_xp: playerData.total_xp || ((playerData.level || 1) - 1) * 100 + (playerData.xp || 0),
                evolution: Math.floor((playerData.level || 1) / 5) + 1, // Calculate evolution from level
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                isDead: false,
                isCritical: false
            };
            
            console.log('✅ Pet created from NFT data:', petData);
            return petData;
            
        } catch (error) {
            console.error('❌ Error creating pet from NFT data:', error);
            return null;
        }
    },
    
    // Show mint required modal
    showMintRequired() {
        // Show NFT required modal
        const modal = document.getElementById('nft-required-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            console.error('❌ NFT Required modal not found');
        }
    },

    checkReferralCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        
        if (ref) {
            Utils.saveLocal('referralCode', ref);
            Utils.showNotification('🎁 Referral bonus activated! Mint NFT to get +25 TAMA!');
        }
    },
    
    // Reset game
    reset() {
        this.pet = null;
        this.stopGameLoop();
        
        document.getElementById('pet-name').textContent = 'No Pet';
        document.getElementById('pet-type').textContent = 'Select or create a pet';
        document.getElementById('pet-level').textContent = 'Level 1';
        
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateStatBar('hunger', 100);
        this.updateStatBar('energy', 100);
        this.updateStatBar('happy', 100);
        this.updateStatBar('health', 100);
        
        document.getElementById('xp-bar').style.width = '0%';
        document.getElementById('xp-text').textContent = '0 / 100 XP';
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

// Export for use in other files
window.Game = Game;

