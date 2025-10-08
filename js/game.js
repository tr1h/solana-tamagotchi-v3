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
        console.log('🔍 Checking Database:', window.Database);
        console.log('🔍 Database.init:', window.Database ? window.Database.init : 'Database not found');
        
        if (window.Database && typeof window.Database.init === 'function') {
            await window.Database.init();
            console.log('✅ Database initialized successfully');
        } else {
            console.error('❌ Database not found or init method missing');
            console.log('Available Database methods:', window.Database ? Object.keys(window.Database) : 'none');
        }
        
        // Initialize wallet
        await WalletManager.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check for referral code (for bonuses)
        this.checkReferralCode();
        
        // Show appropriate page
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('fade-out');
            
            if (WalletManager.isConnected()) {
                this.showGame();
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
        
        // Create pet data
        const petData = this.generatePetData(type, name);
        
        // Send transaction
        const result = await WalletManager.createPet(petData);
        
        if (result.success) {
            this.pet = petData;
            this.savePetData();
            this.updatePetDisplay();
            this.startGameLoop();
            
            // Update leaderboard with new pet
            if (window.Database && WalletManager.isConnected()) {
                Database.updateLeaderboard(WalletManager.getAddress(), this.pet);
                
                // Process referral code if exists
                const referralCode = Utils.loadLocal('referralCode');
                if (referralCode) {
                    Database.addReferral(referralCode, WalletManager.getAddress());
                    Utils.deleteLocal('referralCode'); // Remove after use
                }
            }
            
            // Close modal
            document.getElementById('create-pet-modal').classList.add('hidden');
            
            // Reset modal
            document.querySelectorAll('.pet-type-btn').forEach(b => b.classList.remove('selected'));
            nameInput.value = '';
            document.getElementById('confirm-create-pet').disabled = true;
            
            // Check achievements
            if (window.Achievements) {
                Achievements.check('first_pet');
            }
        }
    },
    
    // Generate pet data
    generatePetData(type, name) {
        const rarity = this.rollRarity();
        
        return {
            id: Utils.generateId(),
            name,
            type,
            rarity,
            traits: {
                color: Utils.randomChoice(this.colors),
                pattern: Utils.randomChoice(this.patterns),
                size: Utils.randomChoice(this.sizes),
                personality: Utils.randomChoice(this.personalities),
                special: rarity === 'legendary' ? Utils.randomChoice(this.specialAbilities.slice(1)) : 'none',
                // New traits
                background: Utils.randomChoice(this.backgrounds),
                accessory: rarity === 'common' ? 'none' : Utils.randomChoice(this.accessories),
                effect: rarity === 'legendary' || rarity === 'epic' ? Utils.randomChoice(this.effects) : 'none'
            },
            stats: { ...this.petTypes[type].baseStats },
            level: 1,
            xp: 0,
            evolution: 1,
            createdAt: Date.now(),
            lastUpdate: Date.now(),
            isDead: false
        };
    },
    
    // Roll rarity
    rollRarity() {
        const rand = Math.random() * 100;
        if (rand < 1) return 'legendary'; // 1%
        if (rand < 10) return 'epic'; // 9%
        if (rand < 30) return 'rare'; // 20%
        return 'common'; // 70%
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
    
    // Feed pet
    feed() {
        if (!this.pet) {
            Utils.showNotification('❌ No active pet');
            return;
        }
        
        if (this.pet.stats.hunger >= 100) {
            Utils.showNotification('🍔 Pet is not hungry');
            return;
        }
        
        this.pet.stats.hunger = Math.min(100, this.pet.stats.hunger + 25);
        this.pet.stats.energy = Math.max(0, this.pet.stats.energy - 5);
        this.addXP(10);
        
        this.updatePetDisplay();
        this.savePetData();
        
        Utils.showNotification('🍔 Fed pet!');
        Utils.createParticle(this.canvas.offsetLeft + 75, this.canvas.offsetTop + 75, '🍔');
        this.animatePet('eating');
    },
    
    // Play with pet
    play() {
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
    
    // Heal pet
    async heal() {
        if (!this.pet) {
            Utils.showNotification('❌ No active pet');
            return;
        }
        
        if (this.pet.stats.health >= 100) {
            Utils.showNotification('❤️ Pet is healthy');
            return;
        }
        
        // Cost: 0.01 SOL or 10 TAMA
        const playerData = Utils.loadLocal('playerData');
        
        if (playerData && playerData.tama >= 10) {
            playerData.tama -= 10;
            Utils.saveLocal('playerData', playerData);
            
            this.pet.stats.health = 100;
            this.updatePetDisplay();
            this.savePetData();
            
            Utils.showNotification('💊 Pet healed with TAMA!');
            Utils.createParticle(this.canvas.offsetLeft + 75, this.canvas.offsetTop + 75, '💚', 'sparkle');
        } else {
            Utils.showNotification('❌ Need 10 TAMA to heal');
        }
    },
    
    // Add XP
    addXP(amount) {
        if (!this.pet) return;
        
        this.pet.xp += amount;
        
        const xpNeeded = Utils.getXPForLevel(this.pet.level);
        
        if (this.pet.xp >= xpNeeded) {
            this.levelUp();
        } else {
            // Update leaderboard even without level up
            if (window.Database && WalletManager.isConnected()) {
                Database.updateLeaderboard(WalletManager.getAddress(), this.pet);
            }
        }
        
        this.updateXPBar();
    },
    
    // Level up
    levelUp() {
        this.pet.level++;
        this.pet.xp = 0;
        
        // Increase stats slightly
        this.pet.stats.health = 100;
        this.pet.stats.hunger = Math.min(100, this.pet.stats.hunger + 10);
        this.pet.stats.energy = Math.min(100, this.pet.stats.energy + 10);
        this.pet.stats.happy = Math.min(100, this.pet.stats.happy + 10);
        
        Utils.showNotification(`🎉 Level Up! Now level ${this.pet.level}`);
        
        // Update leaderboard
        if (window.Database && WalletManager.isConnected()) {
            Database.updateLeaderboard(WalletManager.getAddress(), this.pet);
        }
        
        // Check for evolution
        if (this.pet.level % 10 === 0 && this.pet.evolution < 5) {
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
        if (!this.pet) return;
        
        // Update pet info
        document.getElementById('pet-name').textContent = this.pet.name;
        document.getElementById('pet-type').textContent = `${this.petTypes[this.pet.type].name} (${this.pet.rarity})`;
        document.getElementById('pet-level').textContent = `Level ${this.pet.level}`;
        
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
        
        // Draw pet emoji
        this.ctx.font = '80px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const emoji = Utils.getPetEmoji(this.pet.type, this.pet.evolution);
        
        if (this.pet.isCritical) {
            // Critical state - dim and add warning
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillText(emoji, 75, 75);
            this.ctx.globalAlpha = 1;
            this.ctx.font = '24px Arial';
            this.ctx.fillText('🆘', 75, 120);
        } else {
            this.ctx.fillText(emoji, 75, 75);
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
    claimDailyReward() {
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
        
        // Give reward
        const reward = 50;
        playerData.tama = (playerData.tama || 0) + reward;
        playerData.lastDaily = Date.now();
        
        Utils.saveLocal('playerData', playerData);
        WalletManager.updateBalanceDisplay();
        
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
        
        // Load from MySQL first
        if (window.Database && Database.useMySQL) {
            const dbPet = await Database.loadPlayerData(WalletManager.getAddress());
            if (dbPet && dbPet.pet) {
                this.pet = dbPet.pet;
                Utils.saveLocal('petData', this.pet);
            }
        }
        
        // Fallback to localStorage
        if (!this.pet) {
            this.pet = Utils.loadLocal('petData');
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

