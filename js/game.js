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
        
        // Initialize wallet
        await WalletManager.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('fade-out');
            document.getElementById('app').classList.remove('hidden');
        }, 1000);
        
        // Check for referral code
        this.checkReferralCode();
    },
    
    // Setup event listeners
    setupEventListeners() {
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
        document.getElementById('create-pet-btn').addEventListener('click', () => this.showCreatePetModal());
        document.getElementById('evolve-pet-btn').addEventListener('click', () => this.evolvePet());
        document.getElementById('revive-pet-btn').addEventListener('click', () => this.revivePet());
        
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
                special: rarity === 'legendary' ? Utils.randomChoice(this.specialAbilities.slice(1)) : 'none'
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
        if (!this.pet || this.pet.isDead) {
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
        if (!this.pet || this.pet.isDead) {
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
        if (!this.pet || this.pet.isDead) {
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
        if (!this.pet || this.pet.isDead) {
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
        if (!this.pet || this.pet.isDead) {
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
    
    // Revive pet
    async revivePet() {
        if (!this.pet || !this.pet.isDead) return;
        
        const result = await WalletManager.revivePet(true);
        
        if (result.success) {
            this.pet.isDead = false;
            this.pet.stats = { ...this.petTypes[this.pet.type].baseStats };
            this.pet.stats.health = 50;
            
            this.updatePetDisplay();
            this.savePetData();
            this.startGameLoop();
            
            document.getElementById('revive-pet-btn').classList.add('hidden');
        }
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
        
        if (this.pet.isDead) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillText('💀', 75, 75);
            this.ctx.globalAlpha = 1;
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
        if (!this.pet || this.pet.isDead) return;
        
        // Decrease stats over time
        this.pet.stats.hunger = Math.max(0, this.pet.stats.hunger - 2);
        this.pet.stats.energy = Math.max(0, this.pet.stats.energy - 1);
        this.pet.stats.happy = Math.max(0, this.pet.stats.happy - 1);
        
        // Check if pet should lose health
        if (this.pet.stats.hunger < 20 || this.pet.stats.happy < 20) {
            this.pet.stats.health = Math.max(0, this.pet.stats.health - 5);
        }
        
        // Check if pet died
        if (this.pet.stats.health <= 0) {
            this.petDied();
        }
        
        this.pet.lastUpdate = Date.now();
        this.updatePetDisplay();
        this.savePetData();
    },
    
    // Pet died
    petDied() {
        this.pet.isDead = true;
        this.stopGameLoop();
        
        Utils.showNotification('💀 Your pet has died! Revive it to continue.');
        document.getElementById('revive-pet-btn').classList.remove('hidden');
        
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
            
            // Save to Firebase if available
            if (window.Database && WalletManager.isConnected()) {
                Database.savePetData(WalletManager.getAddress(), this.pet);
            }
        }
    },
    
    // Load pet data
    loadPetData() {
        this.pet = Utils.loadLocal('petData');
        
        if (this.pet) {
            this.updatePetDisplay();
            
            if (!this.pet.isDead) {
                this.startGameLoop();
            }
        }
    },
    
    // Auto-load pet on wallet connect
    autoLoadPet() {
        const savedPet = Utils.loadLocal('petData');
        if (savedPet && WalletManager.isConnected()) {
            this.pet = savedPet;
            this.updatePetDisplay();
            if (!this.pet.isDead) {
                this.startGameLoop();
            }
            Utils.showNotification('🐾 Pet loaded successfully!');
        }
    },
    
    // Check referral code
    checkReferralCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        
        if (ref) {
            Utils.saveLocal('referralCode', ref);
            Utils.showNotification('🎁 Referral bonus applied!');
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

