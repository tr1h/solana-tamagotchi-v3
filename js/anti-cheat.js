// ============================================
// 🛡️ ANTI-CHEAT SYSTEM - ЗАЩИТА ОТ ЧИТЕРОВ
// ============================================

const AntiCheat = {
    
    // Конфигурация - ОЧЕНЬ МЯГКО ДЛЯ КОМФОРТНОЙ ИГРЫ! 🎮
    CONFIG: {
        MAX_XP_PER_ACTION: 200,          // Максимум XP за одно действие (в 4 раза больше!)
        MAX_TAMA_PER_ACTION: 5000,       // Максимум TAMA за одно действие (в 5 раз больше!)
        MIN_ACTION_INTERVAL: 10,         // Минимум 0.01 секунды между действиями (в 5 раз быстрее!)
        MAX_LEVEL_PER_SESSION: 50,       // Максимум 50 левелов за сессию (в 5 раз больше!)
        SESSION_DURATION: 3600000,       // 1 час = 1 сессия
        MAX_ABILITY_USES_PER_HOUR: 200,  // Максимум 200 использований способностей в час (в 4 раза больше!)
        HASH_SALT: 'SOLANA_TAMA_2024'    // Соль для хеширования
    },
    
    // Хранилище для отслеживания
    sessionData: {
        startTime: Date.now(),
        actionsCount: 0,
        lastActionTime: 0,
        xpEarned: 0,
        tamaEarned: 0,
        levelsGained: 0,
        abilityUses: {},
        suspiciousActivity: []
    },
    
    // Инициализация
    init() {
        console.log('🛡️ Anti-Cheat System initialized');
        this.loadSessionData();
        this.setupMonitoring();
        this.checkSessionReset();
    },
    
    // Загрузка данных сессии
    loadSessionData() {
        const saved = localStorage.getItem('ac_session');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                // Проверка на валидность
                if (this.verifySessionData(data)) {
                    this.sessionData = data;
                } else {
                    console.warn('⚠️ Invalid session data, resetting...');
                    this.resetSession();
                }
            } catch (e) {
                this.resetSession();
            }
        }
    },
    
    // Сохранение данных сессии
    saveSessionData() {
        const dataWithHash = {
            ...this.sessionData,
            hash: this.generateHash(this.sessionData)
        };
        localStorage.setItem('ac_session', JSON.stringify(dataWithHash));
    },
    
    // Генерация хеша для проверки
    generateHash(data) {
        const str = JSON.stringify({
            startTime: data.startTime,
            xpEarned: data.xpEarned,
            tamaEarned: data.tamaEarned,
            levelsGained: data.levelsGained
        }) + this.CONFIG.HASH_SALT;
        
        // Простой хеш (для production использовать crypto.subtle)
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash.toString(36);
    },
    
    // Проверка валидности данных
    verifySessionData(data) {
        if (!data.hash) return false;
        
        const expectedHash = this.generateHash(data);
        return data.hash === expectedHash;
    },
    
    // Сброс сессии
    resetSession() {
        this.sessionData = {
            startTime: Date.now(),
            actionsCount: 0,
            lastActionTime: 0,
            xpEarned: 0,
            tamaEarned: 0,
            levelsGained: 0,
            abilityUses: {},
            suspiciousActivity: []
        };
        this.saveSessionData();
    },
    
    // Проверка на сброс сессии (каждый час)
    checkSessionReset() {
        const now = Date.now();
        const sessionAge = now - this.sessionData.startTime;
        
        if (sessionAge > this.CONFIG.SESSION_DURATION) {
            console.log('🔄 Session expired, resetting...');
            this.resetSession();
        }
    },
    
    // 🎯 ВАЛИДАЦИЯ XP
    validateXPGain(amount, reason) {
        // Проверка максимума
        if (amount > this.CONFIG.MAX_XP_PER_ACTION) {
            this.reportSuspiciousActivity('xp_too_high', { amount, reason });
            return false;
        }
        
        // Проверка интервала между действиями
        const now = Date.now();
        if (now - this.sessionData.lastActionTime < this.CONFIG.MIN_ACTION_INTERVAL) {
            this.reportSuspiciousActivity('action_too_fast', { timeDiff: now - this.sessionData.lastActionTime });
            return false;
        }
        
        // Обновление счетчиков
        this.sessionData.xpEarned += amount;
        this.sessionData.actionsCount++;
        this.sessionData.lastActionTime = now;
        this.saveSessionData();
        
        return true;
    },
    
    // 💰 ВАЛИДАЦИЯ TAMA
    validateTAMAGain(amount, reason) {
        // Проверка максимума
        if (amount > this.CONFIG.MAX_TAMA_PER_ACTION) {
            this.reportSuspiciousActivity('tama_too_high', { amount, reason });
            return false;
        }
        
        // Проверка интервала
        const now = Date.now();
        if (now - this.sessionData.lastActionTime < this.CONFIG.MIN_ACTION_INTERVAL) {
            this.reportSuspiciousActivity('action_too_fast', { timeDiff: now - this.sessionData.lastActionTime });
            return false;
        }
        
        // Обновление счетчиков
        this.sessionData.tamaEarned += amount;
        this.sessionData.actionsCount++;
        this.sessionData.lastActionTime = now;
        this.saveSessionData();
        
        return true;
    },
    
    // 📊 ВАЛИДАЦИЯ LEVEL UP
    validateLevelUp(currentLevel, newLevel) {
        // Проверка прыжка уровня
        if (newLevel - currentLevel > 1) {
            this.reportSuspiciousActivity('level_skip', { from: currentLevel, to: newLevel });
            return false;
        }
        
        // Проверка максимума левелов за сессию
        this.sessionData.levelsGained++;
        if (this.sessionData.levelsGained > this.CONFIG.MAX_LEVEL_PER_SESSION) {
            this.reportSuspiciousActivity('too_many_levels', { count: this.sessionData.levelsGained });
            return false;
        }
        
        this.saveSessionData();
        return true;
    },
    
    // ⚡ ВАЛИДАЦИЯ СПОСОБНОСТЕЙ
    validateAbilityUse(abilityName, cooldown) {
        const now = Date.now();
        const lastUsed = this.sessionData.abilityUses[abilityName] || 0;
        
        // Проверка кулдауна
        if (now - lastUsed < cooldown) {
            this.reportSuspiciousActivity('cooldown_bypass', { 
                ability: abilityName, 
                timeLeft: cooldown - (now - lastUsed) 
            });
            return false;
        }
        
        // Подсчет использований за час
        const oneHourAgo = now - 3600000;
        const usesInLastHour = Object.values(this.sessionData.abilityUses)
            .filter(time => time > oneHourAgo).length;
        
        if (usesInLastHour > this.CONFIG.MAX_ABILITY_USES_PER_HOUR) {
            this.reportSuspiciousActivity('ability_spam', { count: usesInLastHour });
            return false;
        }
        
        // Обновление
        this.sessionData.abilityUses[abilityName] = now;
        this.saveSessionData();
        
        return true;
    },
    
    // 🔒 ВАЛИДАЦИЯ ДАННЫХ ПИТОМЦА
    validatePetData(pet, previousPet) {
        if (!previousPet) return true;
        
        const issues = [];
        
        // Проверка левела
        if (pet.level < previousPet.level) {
            issues.push('level_decreased');
        }
        
        if (pet.level > previousPet.level + 10) {
            issues.push('level_jump_too_high');
        }
        
        // Проверка XP
        if (pet.total_xp < previousPet.total_xp) {
            issues.push('xp_decreased');
        }
        
        // Проверка эволюции
        if (pet.evolution > previousPet.evolution + 1) {
            issues.push('evolution_skip');
        }
        
        // Проверка статов (не должны превышать 100)
        Object.entries(pet.stats || {}).forEach(([stat, value]) => {
            if (value > 100) {
                issues.push(`${stat}_too_high`);
            }
        });
        
        if (issues.length > 0) {
            this.reportSuspiciousActivity('pet_data_tampered', { issues });
            return false;
        }
        
        return true;
    },
    
    // 📝 РЕПОРТ ПОДОЗРИТЕЛЬНОЙ АКТИВНОСТИ
    reportSuspiciousActivity(type, details) {
        const report = {
            type: type,
            details: details,
            timestamp: Date.now(),
            wallet: window.WalletManager?.publicKey?.toString() || 'unknown'
        };
        
        console.warn('🚨 Suspicious activity detected:', report);
        
        this.sessionData.suspiciousActivity.push(report);
        this.saveSessionData();
        
        // Отправка на сервер (если есть)
        if (window.Database && window.Database.supabase) {
            this.reportToServer(report);
        }
        
        // Показать предупреждение пользователю
        this.showWarning(type);
    },
    
    // Отправка на сервер
    async reportToServer(report) {
        try {
            await window.Database.supabase
                .from('anti_cheat_logs')
                .insert({
                    wallet_address: report.wallet,
                    activity_type: report.type,
                    details: report.details,
                    timestamp: new Date(report.timestamp).toISOString()
                });
        } catch (error) {
            console.error('Failed to report to server:', error);
        }
    },
    
    // Показать предупреждение
    showWarning(type) {
        const messages = {
            xp_too_high: '⚠️ Подозрительная активность: слишком много XP за одно действие',
            tama_too_high: '⚠️ Подозрительная активность: слишком много TAMA за одно действие',
            action_too_fast: '⚠️ Подождите немного между действиями',
            level_skip: '⚠️ Недопустимый прыжок уровня',
            too_many_levels: '⚠️ Слишком много повышений уровня за короткое время',
            cooldown_bypass: '⚠️ Способность еще на кулдауне',
            ability_spam: '⚠️ Слишком много использований способностей',
            pet_data_tampered: '⚠️ Обнаружено изменение данных питомца'
        };
        
        const message = messages[type] || '⚠️ Подозрительная активность';
        
        if (window.UI && window.UI.showNotification) {
            window.UI.showNotification(message, 'error');
        } else {
            alert(message);
        }
    },
    
    // 🔍 МОНИТОРИНГ
    setupMonitoring() {
        // Мониторинг изменений localStorage
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key === 'petData' && window.AntiCheat) {
                try {
                    const newData = JSON.parse(value);
                    const oldData = localStorage.getItem('petData') ? 
                        JSON.parse(localStorage.getItem('petData')) : null;
                    
                    if (!window.AntiCheat.validatePetData(newData, oldData)) {
                        console.error('🚨 Pet data validation failed!');
                        return; // Не сохраняем поддельные данные
                    }
                } catch (e) {
                    console.error('Error validating pet data:', e);
                }
            }
            originalSetItem.call(this, key, value);
        };
        
        // Проверка консольных команд
        this.protectGameFunctions();
    },
    
    // Защита игровых функций
    protectGameFunctions() {
        // Защита Game.levelUp()
        if (window.Game && window.Game.levelUp) {
            const originalLevelUp = window.Game.levelUp;
            window.Game.levelUp = async function() {
                const currentLevel = this.pet?.level || 1;
                const newLevel = currentLevel + 1;
                
                if (!window.AntiCheat.validateLevelUp(currentLevel, newLevel)) {
                    console.error('🚨 Level up blocked by anti-cheat');
                    return;
                }
                
                return originalLevelUp.call(this);
            };
        }
        
        // Защита Game.addXP()
        if (window.Game && window.Game.addXP) {
            const originalAddXP = window.Game.addXP;
            window.Game.addXP = function(amount) {
                if (!window.AntiCheat.validateXPGain(amount, 'game_action')) {
                    console.error('🚨 XP gain blocked by anti-cheat');
                    return;
                }
                
                return originalAddXP.call(this, amount);
            };
        }
    },
    
    // Получить статистику сессии
    getSessionStats() {
        return {
            ...this.sessionData,
            sessionDuration: Date.now() - this.sessionData.startTime,
            actionsPerMinute: this.sessionData.actionsCount / 
                ((Date.now() - this.sessionData.startTime) / 60000),
            suspiciousActivities: this.sessionData.suspiciousActivity.length
        };
    },
    
    // Проверка на бан
    shouldBan() {
        return this.sessionData.suspiciousActivity.length > 5;
    }
};

// Инициализация при загрузке
if (typeof window !== 'undefined') {
    window.AntiCheat = AntiCheat;
    console.log('✅ AntiCheat loaded globally');
}

