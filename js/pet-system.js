// ============================================
// 🐾 PET SYSTEM MODULE - МОДУЛЬНАЯ СИСТЕМА ПИТОМЦЕВ
// ============================================

const PetSystem = {
    
    // 🎯 1. ТИПЫ ПИТОМЦЕВ С ПОЛНЫМИ ХАРАКТЕРИСТИКАМИ
    petTypes: {
        cat: {
            name: 'Cat',
            emoji: '🐱',
            description: 'Умный и независимый питомец с девятью жизнями',
            category: 'smart', // умный
            rarity: 'common',
            baseStats: {
                hunger: 80,
                energy: 90,
                happy: 85,
                health: 100,
                // Дополнительные характеристики
                intelligence: 90,
                strength: 60,
                speed: 85,
                magic: 50
            },
            abilities: ['nine_lives', 'stealth', 'agility'],
            tamaMultiplier: 1.0,
            evolutionPath: ['kitten', 'cat', 'wise_cat', 'cat_wizard', 'legendary_cat']
        },
        
        dog: {
            name: 'Dog',
            emoji: '🐶',
            description: 'Верный друг с высокой энергией и преданностью',
            category: 'friendly',
            rarity: 'common',
            baseStats: {
                hunger: 85,
                energy: 95,
                happy: 90,
                health: 100,
                intelligence: 70,
                strength: 80,
                speed: 90,
                magic: 30
            },
            abilities: ['loyalty', 'fetch', 'guard'],
            tamaMultiplier: 1.0,
            evolutionPath: ['puppy', 'dog', 'guard_dog', 'alpha_dog', 'legendary_hound']
        },
        
        dragon: {
            name: 'Dragon',
            emoji: '🐉',
            description: 'Мощный мифический зверь с огненным дыханием',
            category: 'mythical',
            rarity: 'legendary',
            baseStats: {
                hunger: 70,
                energy: 85,
                happy: 80,
                health: 100,
                intelligence: 85,
                strength: 95,
                speed: 75,
                magic: 100
            },
            abilities: ['fire_breath', 'flight', 'intimidate'],
            tamaMultiplier: 1.5, // Легендарные зарабатывают больше TAMA
            evolutionPath: ['drake', 'young_dragon', 'dragon', 'ancient_dragon', 'mythical_dragon']
        },
        
        fox: {
            name: 'Fox',
            emoji: '🦊',
            description: 'Хитрый и ловкий охотник',
            category: 'smart',
            rarity: 'rare',
            baseStats: {
                hunger: 75,
                energy: 88,
                happy: 82,
                health: 100,
                intelligence: 95,
                strength: 65,
                speed: 92,
                magic: 60
            },
            abilities: ['cunning', 'stealth', 'charm'],
            tamaMultiplier: 1.1,
            evolutionPath: ['fox_kit', 'fox', 'clever_fox', 'mystic_fox', 'nine_tail_fox']
        },
        
        bear: {
            name: 'Bear',
            emoji: '🐻',
            description: 'Могучий и сильный защитник леса',
            category: 'strong',
            rarity: 'common',
            baseStats: {
                hunger: 90,
                energy: 80,
                happy: 85,
                health: 100,
                intelligence: 60,
                strength: 100,
                speed: 60,
                magic: 40
            },
            abilities: ['roar', 'hibernate', 'crush'],
            tamaMultiplier: 1.0,
            evolutionPath: ['cub', 'bear', 'grizzly', 'berserker_bear', 'legendary_bear']
        },
        
        rabbit: {
            name: 'Rabbit',
            emoji: '🐰',
            description: 'Быстрый и милый прыгун',
            category: 'cute',
            rarity: 'common',
            baseStats: {
                hunger: 70,
                energy: 95,
                happy: 88,
                health: 100,
                intelligence: 75,
                strength: 50,
                speed: 100,
                magic: 55
            },
            abilities: ['jump', 'dash', 'luck'],
            tamaMultiplier: 1.0,
            evolutionPath: ['bunny', 'rabbit', 'hare', 'moon_rabbit', 'legendary_bunny']
        },
        
        panda: {
            name: 'Panda',
            emoji: '🐼',
            description: 'Спокойный и мудрый мастер бамбука',
            category: 'cute',
            rarity: 'rare',
            baseStats: {
                hunger: 85,
                energy: 75,
                happy: 92,
                health: 100,
                intelligence: 80,
                strength: 85,
                speed: 65,
                magic: 70
            },
            abilities: ['bamboo_feast', 'calm', 'zen'],
            tamaMultiplier: 1.1,
            evolutionPath: ['cub', 'panda', 'kung_fu_panda', 'master_panda', 'legendary_panda']
        },
        
        lion: {
            name: 'Lion',
            emoji: '🦁',
            description: 'Король зверей с гордым нравом',
            category: 'strong',
            rarity: 'epic',
            baseStats: {
                hunger: 88,
                energy: 85,
                happy: 80,
                health: 100,
                intelligence: 75,
                strength: 95,
                speed: 88,
                magic: 50
            },
            abilities: ['roar', 'leadership', 'pride'],
            tamaMultiplier: 1.3,
            evolutionPath: ['cub', 'lion', 'pride_leader', 'king_lion', 'legendary_beast']
        },
        
        unicorn: {
            name: 'Unicorn',
            emoji: '🦄',
            description: 'Магическое существо с целительными силами',
            category: 'mythical',
            rarity: 'epic',
            baseStats: {
                hunger: 65,
                energy: 90,
                happy: 95,
                health: 100,
                intelligence: 90,
                strength: 70,
                speed: 85,
                magic: 100
            },
            abilities: ['healing', 'magic_boost', 'purify'],
            tamaMultiplier: 1.3,
            evolutionPath: ['foal', 'unicorn', 'mystic_unicorn', 'celestial_unicorn', 'legendary_alicorn']
        },
        
        wolf: {
            name: 'Wolf',
            emoji: '🐺',
            description: 'Дикий охотник с инстинктом вожака',
            category: 'strong',
            rarity: 'epic',
            baseStats: {
                hunger: 82,
                energy: 92,
                happy: 78,
                health: 100,
                intelligence: 85,
                strength: 90,
                speed: 95,
                magic: 60
            },
            abilities: ['howl', 'pack_leader', 'hunt'],
            tamaMultiplier: 1.3,
            evolutionPath: ['pup', 'wolf', 'alpha_wolf', 'dire_wolf', 'legendary_fenrir']
        },
        
        griffin: {
            name: 'Griffin',
            emoji: '🦅',
            description: 'Благородное существо с телом льва и крыльями орла',
            category: 'mythical',
            rarity: 'legendary',
            baseStats: {
                hunger: 75,
                energy: 90,
                happy: 85,
                health: 100,
                intelligence: 90,
                strength: 90,
                speed: 95,
                magic: 85
            },
            abilities: ['sky_strike', 'noble_aura', 'swift_flight'],
            tamaMultiplier: 1.5,
            evolutionPath: ['hatchling', 'griffin', 'sky_guardian', 'royal_griffin', 'legendary_gryphon']
        }
    },
    
    // 🎯 2. СИСТЕМА СПОСОБНОСТЕЙ
    abilities: {
        // Способности котов
        nine_lives: {
            name: 'Nine Lives',
            emoji: '🐱',
            description: 'Автоматическое восстановление здоровья при критических условиях',
            effect: (pet) => {
                if (pet.stats.health < 20) {
                    pet.stats.health = Math.min(100, pet.stats.health + 30);
                    return { success: true, message: '🐱 Nine Lives activated! +30 health!' };
                }
                return { success: false };
            },
            cooldown: 3600000, // 1 час
            tamaBonus: 0
        },
        
        stealth: {
            name: 'Stealth',
            emoji: '🥷',
            description: 'Повышает шанс избежать негативных событий',
            effect: (pet) => {
                pet.stealth_active = true;
                return { success: true, message: '🥷 Stealth mode activated!' };
            },
            cooldown: 1800000, // 30 минут
            tamaBonus: 0
        },
        
        agility: {
            name: 'Agility',
            emoji: '⚡',
            description: '+15% к скорости заработка TAMA',
            effect: (pet) => {
                return { success: true, message: '⚡ Agility boost! +15% TAMA earning!', tamaMultiplier: 1.15 };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0.15
        },
        
        // Способности драконов
        fire_breath: {
            name: 'Fire Breath',
            emoji: '🔥',
            description: 'Мощная атака, которая дает +50 TAMA',
            effect: (pet) => {
                return { success: true, message: '🔥 Fire Breath! +50 TAMA!', tamaReward: 50 };
            },
            cooldown: 7200000, // 2 часа
            tamaBonus: 0
        },
        
        flight: {
            name: 'Flight',
            emoji: '✈️',
            description: 'Пассивный бонус +20% к энергии',
            effect: (pet) => {
                pet.stats.energy = Math.min(100, pet.stats.energy * 1.2);
                return { success: true, message: '✈️ Flight bonus! +20% energy!' };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0
        },
        
        intimidate: {
            name: 'Intimidate',
            emoji: '😈',
            description: 'Увеличивает награды за рефералов на 25%',
            effect: (pet) => {
                return { success: true, message: '😈 Intimidate! +25% referral bonus!', referralMultiplier: 1.25 };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0
        },
        
        // Способности волков
        howl: {
            name: 'Howl',
            emoji: '🌙',
            description: 'Призывает стаю, +30 TAMA за каждого реферала',
            effect: (pet, referralCount) => {
                const bonus = (referralCount || 0) * 30;
                return { success: true, message: `🌙 Howl! +${bonus} TAMA from pack!`, tamaReward: bonus };
            },
            cooldown: 3600000, // 1 час
            tamaBonus: 0
        },
        
        pack_leader: {
            name: 'Pack Leader',
            emoji: '👑',
            description: 'Пассивный бонус +50 TAMA за каждого Level 1 реферала',
            effect: (pet) => {
                return { success: true, message: '👑 Pack Leader active!', referralBonus: 50 };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0
        },
        
        // Способности единорога
        healing: {
            name: 'Healing',
            emoji: '💖',
            description: 'Восстанавливает все характеристики до 100%',
            effect: (pet) => {
                pet.stats.health = 100;
                pet.stats.hunger = 100;
                pet.stats.energy = 100;
                pet.stats.happy = 100;
                return { success: true, message: '💖 Full Healing! All stats restored!' };
            },
            cooldown: 7200000, // 2 часа
            tamaBonus: 0
        },
        
        magic_boost: {
            name: 'Magic Boost',
            emoji: '✨',
            description: '+15% к заработку TAMA',
            effect: (pet) => {
                return { success: true, message: '✨ Magic Boost! +15% TAMA!', tamaMultiplier: 1.15 };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0.15
        },
        
        // Способности лисы
        cunning: {
            name: 'Cunning',
            emoji: '🦊',
            description: 'Шанс удвоить награды за действия',
            effect: (pet) => {
                if (Math.random() < 0.2) { // 20% шанс
                    return { success: true, message: '🦊 Cunning! Rewards doubled!', rewardMultiplier: 2 };
                }
                return { success: false };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0
        },
        
        // Способности Griffin
        sky_strike: {
            name: 'Sky Strike',
            emoji: '⚡',
            description: 'Мощная атака с неба, +60 TAMA',
            effect: (pet) => {
                return { success: true, message: '⚡ Sky Strike! +60 TAMA!', tamaReward: 60 };
            },
            cooldown: 3600000, // 1 час
            tamaBonus: 0
        },
        
        noble_aura: {
            name: 'Noble Aura',
            emoji: '👑',
            description: 'Благородная аура, +20% к заработку TAMA и рефералам',
            effect: (pet) => {
                return { success: true, message: '👑 Noble Aura active! +20% TAMA & Referrals!', tamaMultiplier: 1.2, referralMultiplier: 1.2 };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0.2
        },
        
        swift_flight: {
            name: 'Swift Flight',
            emoji: '🦅',
            description: 'Быстрый полет, восстановление энергии и скорости',
            effect: (pet) => {
                pet.stats.energy = Math.min(100, pet.stats.energy + 50);
                return { success: true, message: '🦅 Swift Flight! +50 energy!' };
            },
            cooldown: 1800000, // 30 минут
            tamaBonus: 0
        },
        
        // Способности медведя
        roar: {
            name: 'Roar',
            emoji: '🐻',
            description: 'Устрашающий рев, +40 TAMA',
            effect: (pet) => {
                return { success: true, message: '🐻 Roar! +40 TAMA!', tamaReward: 40 };
            },
            cooldown: 3600000, // 1 час
            tamaBonus: 0
        },
        
        hibernate: {
            name: 'Hibernate',
            emoji: '😴',
            description: 'Замедляет деградацию характеристик на 50%',
            effect: (pet) => {
                pet.hibernate_active = true;
                return { success: true, message: '😴 Hibernating! Stats decay slower!' };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0
        },
        
        // Способности кролика
        luck: {
            name: 'Luck',
            emoji: '🍀',
            description: 'Шанс получить случайные бонусы TAMA (10-50)',
            effect: (pet) => {
                if (Math.random() < 0.3) { // 30% шанс
                    const bonus = Math.floor(Math.random() * 41) + 10; // 10-50 TAMA
                    return { success: true, message: `🍀 Lucky! +${bonus} TAMA!`, tamaReward: bonus };
                }
                return { success: false };
            },
            cooldown: 0, // Пассивная
            tamaBonus: 0
        }
    },
    
    // 🎯 3. СИСТЕМА ЭВОЛЮЦИИ
    evolutions: {
        // Формы эволюции с характеристиками
        0: { name: 'Baby', emoji: '🥚', statMultiplier: 0.8, description: 'Только родился' },
        1: { name: 'Young', emoji: '🐣', statMultiplier: 1.0, description: 'Молодой и энергичный' },
        2: { name: 'Adult', emoji: '💪', statMultiplier: 1.2, description: 'Взрослый и сильный' },
        3: { name: 'Wise', emoji: '🧙', statMultiplier: 1.5, description: 'Мудрый и опытный' },
        4: { name: 'Legendary', emoji: '👑', statMultiplier: 2.0, description: 'Легендарный герой' }
    },
    
    // Требования для эволюции
    evolutionRequirements: {
        1: { level: 5, xp: 500, tama: 100 },
        2: { level: 10, xp: 2000, tama: 300 },
        3: { level: 20, xp: 5000, tama: 1000 },
        4: { level: 30, xp: 10000, tama: 3000 }
    },
    
    // 🎯 4. СИСТЕМА РЕДКОСТИ
    raritySystem: {
        common: {
            name: 'Common',
            emoji: '💚',
            probability: 0.70, // 70%
            statBonus: 1.0,
            tamaMultiplier: 1.0,
            color: '#4CAF50',
            description: 'Обычный питомец'
        },
        rare: {
            name: 'Rare',
            emoji: '💙',
            probability: 0.20, // 20%
            statBonus: 1.1,
            tamaMultiplier: 1.1,
            color: '#2196F3',
            description: 'Редкий питомец с улучшенными характеристиками'
        },
        epic: {
            name: 'Epic',
            emoji: '💜',
            probability: 0.08, // 8%
            statBonus: 1.3,
            tamaMultiplier: 1.3,
            color: '#9C27B0',
            description: 'Эпический питомец с уникальными способностями'
        },
        legendary: {
            name: 'Legendary',
            emoji: '🧡',
            probability: 0.02, // 2%
            statBonus: 1.5,
            tamaMultiplier: 1.5,
            color: '#FF9800',
            description: 'Легендарный питомец с невероятной силой'
        }
    },
    
    // 🎯 ИНИЦИАЛИЗАЦИЯ
    init() {
        console.log('🐾 Pet System initialized!');
        this.setupAbilityCooldowns();
    },
    
    // 🎯 СОЗДАНИЕ ПИТОМЦА
    createPet(type, rarity, name = null) {
        const petType = this.petTypes[type];
        if (!petType) {
            console.error(`Pet type "${type}" not found!`);
            return null;
        }
        
        const rarityData = this.raritySystem[rarity] || this.raritySystem.common;
        
        const pet = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            name: name || `My ${petType.name}`,
            emoji: petType.emoji,
            category: petType.category,
            rarity: rarity,
            evolution: 0,
            level: 1,
            xp: 0,
            total_xp: 0,
            
            // Базовые характеристики
            stats: this.calculateStats(petType.baseStats, rarityData.statBonus, 0),
            
            // Дополнительные характеристики
            attributes: {
                intelligence: petType.baseStats.intelligence || 50,
                strength: petType.baseStats.strength || 50,
                speed: petType.baseStats.speed || 50,
                magic: petType.baseStats.magic || 50
            },
            
            // Способности
            abilities: petType.abilities || [],
            abilityCooldowns: {},
            
            // Множители
            tamaMultiplier: petType.tamaMultiplier * rarityData.tamaMultiplier,
            
            // Метаданные
            createdAt: Date.now(),
            lastUpdate: Date.now(),
            lastFed: Date.now(),
            lastPlayed: Date.now(),
            lastSlept: Date.now(),
            
            // Состояния
            isDead: false,
            isCritical: false,
            isHibernating: false,
            isStealthed: false
        };
        
        console.log(`🐾 Created ${rarityData.emoji} ${rarityData.name} ${petType.name}!`, pet);
        return pet;
    },
    
    // 🎯 РАСЧЕТ ХАРАКТЕРИСТИК
    calculateStats(baseStats, rarityBonus, evolutionLevel) {
        const evolutionData = this.evolutions[evolutionLevel] || this.evolutions[0];
        const multiplier = rarityBonus * evolutionData.statMultiplier;
        
        return {
            hunger: Math.min(100, Math.floor(baseStats.hunger * multiplier)),
            energy: Math.min(100, Math.floor(baseStats.energy * multiplier)),
            happy: Math.min(100, Math.floor(baseStats.happy * multiplier)),
            health: Math.min(100, Math.floor(baseStats.health * multiplier))
        };
    },
    
    // 🎯 ПРОВЕРКА ЭВОЛЮЦИИ
    canEvolve(pet) {
        if (pet.evolution >= 4) return false; // Максимальная эволюция
        
        const nextEvolution = pet.evolution + 1;
        const requirements = this.evolutionRequirements[nextEvolution];
        
        if (!requirements) return false;
        
        return pet.level >= requirements.level && 
               pet.total_xp >= requirements.xp;
    },
    
    // 🎯 ЭВОЛЮЦИЯ ПИТОМЦА
    async evolvePet(pet, walletAddress) {
        if (!this.canEvolve(pet)) {
            return { success: false, message: 'Not ready to evolve!' };
        }
        
        const nextEvolution = pet.evolution + 1;
        const requirements = this.evolutionRequirements[nextEvolution];
        
        // Проверка TAMA
        if (window.TAMAModule) {
            const balance = await window.TAMAModule.getBalance(walletAddress);
            if (balance < requirements.tama) {
                return { success: false, message: `Need ${requirements.tama} TAMA to evolve!` };
            }
            
            // Списываем TAMA
            await window.TAMAModule.spendTAMA(requirements.tama, 'evolution', 
                `Evolution to ${this.evolutions[nextEvolution].name}`);
        }
        
        // Эволюция
        pet.evolution = nextEvolution;
        const evolutionData = this.evolutions[nextEvolution];
        const petType = this.petTypes[pet.type];
        const rarityData = this.raritySystem[pet.rarity];
        
        // Обновление характеристик
        pet.stats = this.calculateStats(petType.baseStats, rarityData.statBonus, nextEvolution);
        pet.tamaMultiplier = petType.tamaMultiplier * rarityData.tamaMultiplier * evolutionData.statMultiplier;
        
        // Полное восстановление
        pet.stats.health = 100;
        pet.stats.hunger = 100;
        pet.stats.energy = 100;
        pet.stats.happy = 100;
        
        pet.lastUpdate = Date.now();
        
        // Сохраняем
        if (window.Database) {
            await window.Database.savePetData(walletAddress, pet);
        }
        
        console.log(`🎉 Pet evolved to ${evolutionData.name}!`, pet);
        return { 
            success: true, 
            message: `${evolutionData.emoji} Evolved to ${evolutionData.name}!`,
            pet: pet
        };
    },
    
    // 🎯 ИСПОЛЬЗОВАНИЕ СПОСОБНОСТИ
    async useAbility(pet, abilityName, walletAddress, extraData = {}) {
        const ability = this.abilities[abilityName];
        if (!ability) {
            return { success: false, message: 'Ability not found!' };
        }
        
        // Проверка, есть ли у питомца эта способность
        if (!pet.abilities.includes(abilityName)) {
            return { success: false, message: 'Pet does not have this ability!' };
        }
        
        // Проверка кулдауна
        const now = Date.now();
        const lastUsed = pet.abilityCooldowns[abilityName] || 0;
        if (now - lastUsed < ability.cooldown) {
            const remaining = Math.ceil((ability.cooldown - (now - lastUsed)) / 1000 / 60);
            return { success: false, message: `Cooldown: ${remaining} minutes remaining` };
        }
        
        // Используем способность
        const result = ability.effect(pet, extraData.referralCount);
        
        if (result.success) {
            // Обновляем кулдаун
            pet.abilityCooldowns[abilityName] = now;
            
            // Награждаем TAMA если есть
            if (result.tamaReward && window.TAMAModule) {
                await window.TAMAModule.earnTAMA(result.tamaReward, 'ability', 
                    `${ability.emoji} ${ability.name} used`);
            }
            
            // Сохраняем
            if (window.Database) {
                await window.Database.savePetData(walletAddress, pet);
            }
        }
        
        return result;
    },
    
    // 🎯 ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ПИТОМЦЕ
    getPetInfo(pet) {
        const petType = this.petTypes[pet.type];
        const rarityData = this.raritySystem[pet.rarity];
        const evolutionData = this.evolutions[pet.evolution];
        
        return {
            ...pet,
            typeInfo: petType,
            rarityInfo: rarityData,
            evolutionInfo: evolutionData,
            canEvolve: this.canEvolve(pet),
            nextEvolutionRequirements: this.evolutionRequirements[pet.evolution + 1]
        };
    },
    
    // 🎯 ПОЛУЧЕНИЕ ВСЕХ ДОСТУПНЫХ СПОСОБНОСТЕЙ
    getAvailableAbilities(pet) {
        return pet.abilities.map(abilityName => {
            const ability = this.abilities[abilityName];
            const lastUsed = pet.abilityCooldowns[abilityName] || 0;
            const now = Date.now();
            const isReady = (now - lastUsed) >= ability.cooldown;
            const cooldownRemaining = isReady ? 0 : Math.ceil((ability.cooldown - (now - lastUsed)) / 1000 / 60);
            
            return {
                name: abilityName,
                ...ability,
                isReady: isReady,
                cooldownRemaining: cooldownRemaining
            };
        });
    },
    
    // 🎯 РАСЧЕТ ИТОГОВОГО МНОЖИТЕЛЯ TAMA
    calculateTAMAMultiplier(pet) {
        let multiplier = pet.tamaMultiplier;
        
        // Добавляем бонусы от способностей
        pet.abilities.forEach(abilityName => {
            const ability = this.abilities[abilityName];
            if (ability && ability.tamaBonus > 0) {
                multiplier += ability.tamaBonus;
            }
        });
        
        return multiplier;
    },
    
    // 🎯 НАСТРОЙКА КУЛДАУНОВ
    setupAbilityCooldowns() {
        // Инициализация кулдаунов для всех способностей
        console.log('🎯 Ability cooldowns initialized');
    }
};

// Инициализация при загрузке
if (typeof window !== 'undefined') {
    window.PetSystem = PetSystem;
    console.log('✅ PetSystem loaded globally');
}

