// ============================================
// 🐾 PET UI MODULE - ИНТЕРФЕЙС ДЛЯ ПИТОМЦЕВ
// ============================================

const PetUI = {
    
    // 🎯 ПОКАЗАТЬ ИНФОРМАЦИЮ О ПИТОМЦЕ
    showPetInfo(pet) {
        if (!pet || !window.PetSystem) return;
        
        const petInfo = window.PetSystem.getPetInfo(pet);
        
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'pet-info-modal';
        modal.id = 'pet-info-modal';
        modal.innerHTML = `
            <div class="pet-info-content">
                <button class="close-btn" onclick="PetUI.closePetInfo()">✖</button>
                
                <div class="pet-info-header">
                    <div class="pet-main-icon">${pet.emoji}</div>
                    <h2>${pet.name}</h2>
                    <div class="pet-rarity" style="color: ${petInfo.rarityInfo.color}">
                        ${petInfo.rarityInfo.emoji} ${petInfo.rarityInfo.name}
                    </div>
                </div>
                
                <div class="pet-info-tabs">
                    <button class="pet-tab active" onclick="PetUI.switchTab('stats')">📊 Stats</button>
                    <button class="pet-tab" onclick="PetUI.switchTab('abilities')">⚡ Abilities</button>
                    <button class="pet-tab" onclick="PetUI.switchTab('evolution')">🔄 Evolution</button>
                </div>
                
                <div class="pet-info-body">
                    <!-- STATS TAB -->
                    <div class="pet-tab-content active" id="stats-tab">
                        <div class="pet-description">
                            <p>${petInfo.typeInfo.description}</p>
                        </div>
                        
                        <div class="pet-evolution-status">
                            <h3>${petInfo.evolutionInfo.emoji} ${petInfo.evolutionInfo.name} Form</h3>
                            <p>${petInfo.evolutionInfo.description}</p>
                        </div>
                        
                        <div class="pet-stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">🍖 Hunger:</span>
                                <div class="stat-bar">
                                    <div class="stat-fill" style="width: ${pet.stats.hunger}%"></div>
                                </div>
                                <span class="stat-value">${pet.stats.hunger}%</span>
                            </div>
                            
                            <div class="stat-item">
                                <span class="stat-label">⚡ Energy:</span>
                                <div class="stat-bar">
                                    <div class="stat-fill" style="width: ${pet.stats.energy}%"></div>
                                </div>
                                <span class="stat-value">${pet.stats.energy}%</span>
                            </div>
                            
                            <div class="stat-item">
                                <span class="stat-label">😊 Happy:</span>
                                <div class="stat-bar">
                                    <div class="stat-fill" style="width: ${pet.stats.happy}%"></div>
                                </div>
                                <span class="stat-value">${pet.stats.happy}%</span>
                            </div>
                            
                            <div class="stat-item">
                                <span class="stat-label">❤️ Health:</span>
                                <div class="stat-bar">
                                    <div class="stat-fill" style="width: ${pet.stats.health}%"></div>
                                </div>
                                <span class="stat-value">${pet.stats.health}%</span>
                            </div>
                        </div>
                        
                        <div class="pet-attributes">
                            <h3>🎯 Attributes</h3>
                            <div class="attributes-grid">
                                <div class="attribute-item">
                                    <span class="attr-icon">🧠</span>
                                    <span class="attr-name">Intelligence</span>
                                    <span class="attr-value">${pet.attributes.intelligence}</span>
                                </div>
                                <div class="attribute-item">
                                    <span class="attr-icon">💪</span>
                                    <span class="attr-name">Strength</span>
                                    <span class="attr-value">${pet.attributes.strength}</span>
                                </div>
                                <div class="attribute-item">
                                    <span class="attr-icon">⚡</span>
                                    <span class="attr-name">Speed</span>
                                    <span class="attr-value">${pet.attributes.speed}</span>
                                </div>
                                <div class="attribute-item">
                                    <span class="attr-icon">✨</span>
                                    <span class="attr-name">Magic</span>
                                    <span class="attr-value">${pet.attributes.magic}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="pet-multipliers">
                            <div class="multiplier-item">
                                <span>💰 TAMA Multiplier:</span>
                                <strong>×${pet.tamaMultiplier.toFixed(2)}</strong>
                            </div>
                            <div class="multiplier-item">
                                <span>📊 Level:</span>
                                <strong>${pet.level}</strong>
                            </div>
                            <div class="multiplier-item">
                                <span>⭐ Total XP:</span>
                                <strong>${pet.total_xp || pet.xp}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <!-- ABILITIES TAB -->
                    <div class="pet-tab-content" id="abilities-tab">
                        ${this.renderAbilities(pet)}
                    </div>
                    
                    <!-- EVOLUTION TAB -->
                    <div class="pet-tab-content" id="evolution-tab">
                        ${this.renderEvolution(petInfo)}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    },
    
    // 🎯 РЕНДЕР СПОСОБНОСТЕЙ
    renderAbilities(pet) {
        const abilities = window.PetSystem.getAvailableAbilities(pet);
        
        if (!abilities || abilities.length === 0) {
            return '<p style="text-align: center; color: #888;">No abilities yet</p>';
        }
        
        return `
            <div class="abilities-list">
                ${abilities.map(ability => `
                    <div class="ability-card ${ability.isReady ? 'ready' : 'cooldown'}">
                        <div class="ability-header">
                            <span class="ability-icon">${ability.emoji}</span>
                            <h3>${ability.name}</h3>
                            ${ability.isReady ? 
                                '<span class="ability-status ready">✅ Ready</span>' : 
                                `<span class="ability-status cooldown">⏳ ${ability.cooldownRemaining}m</span>`
                            }
                        </div>
                        <p class="ability-description">${ability.description}</p>
                        ${ability.tamaBonus > 0 ? 
                            `<div class="ability-bonus">💰 +${(ability.tamaBonus * 100).toFixed(0)}% TAMA</div>` : 
                            ''
                        }
                        <button class="ability-btn ${ability.isReady ? '' : 'disabled'}" 
                                onclick="PetUI.useAbility('${ability.name}')"
                                ${!ability.isReady ? 'disabled' : ''}>
                            ${ability.isReady ? '🚀 Use Ability' : '⏳ On Cooldown'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    // 🎯 РЕНДЕР ЭВОЛЮЦИИ
    renderEvolution(petInfo) {
        const { pet, canEvolve, nextEvolutionRequirements, evolutionInfo } = petInfo;
        
        return `
            <div class="evolution-container">
                <div class="current-evolution">
                    <h3>🐾 Current Form</h3>
                    <div class="evolution-display">
                        <div class="evo-icon">${evolutionInfo.emoji}</div>
                        <div class="evo-name">${evolutionInfo.name}</div>
                        <div class="evo-desc">${evolutionInfo.description}</div>
                        <div class="evo-multiplier">Stats: ×${evolutionInfo.statMultiplier.toFixed(1)}</div>
                    </div>
                </div>
                
                ${pet.evolution < 4 ? `
                    <div class="evolution-arrow">⬇️</div>
                    
                    <div class="next-evolution">
                        <h3>🌟 Next Evolution</h3>
                        ${nextEvolutionRequirements ? `
                            <div class="evolution-requirements">
                                <div class="req-item ${pet.level >= nextEvolutionRequirements.level ? 'met' : ''}">
                                    <span>📊 Level:</span>
                                    <span>${pet.level} / ${nextEvolutionRequirements.level}</span>
                                </div>
                                <div class="req-item ${(pet.total_xp || pet.xp) >= nextEvolutionRequirements.xp ? 'met' : ''}">
                                    <span>⭐ XP:</span>
                                    <span>${pet.total_xp || pet.xp} / ${nextEvolutionRequirements.xp}</span>
                                </div>
                                <div class="req-item" id="tama-requirement">
                                    <span>💰 TAMA:</span>
                                    <span>${nextEvolutionRequirements.tama} required</span>
                                </div>
                            </div>
                            
                            <button class="evolve-btn ${canEvolve ? '' : 'disabled'}" 
                                    onclick="PetUI.evolvePet()"
                                    ${!canEvolve ? 'disabled' : ''}>
                                ${canEvolve ? '🚀 EVOLVE NOW!' : '🔒 Requirements not met'}
                            </button>
                        ` : '<p>Maximum evolution reached!</p>'}
                    </div>
                ` : `
                    <div class="max-evolution">
                        <h3>👑 MAXIMUM EVOLUTION ACHIEVED!</h3>
                        <p>Your pet has reached its ultimate form!</p>
                    </div>
                `}
            </div>
        `;
    },
    
    // 🎯 ИСПОЛЬЗОВАТЬ СПОСОБНОСТЬ
    async useAbility(abilityName) {
        if (!window.Game || !window.Game.pet) {
            alert('No pet found!');
            return;
        }
        
        if (!window.WalletManager || !window.WalletManager.publicKey) {
            alert('Please connect wallet!');
            return;
        }
        
        const walletAddress = window.WalletManager.publicKey.toString();
        
        // Получаем количество рефералов для способностей вроде "Howl"
        let referralCount = 0;
        if (window.Database && window.Database.supabase) {
            const { data } = await window.Database.supabase
                .from('referrals')
                .select('*')
                .eq('referrer_wallet', walletAddress);
            referralCount = data ? data.length : 0;
        }
        
        const result = await window.PetSystem.useAbility(
            window.Game.pet, 
            abilityName, 
            walletAddress,
            { referralCount }
        );
        
        if (result.success) {
            // Обновляем UI
            this.closePetInfo();
            this.showPetInfo(window.Game.pet);
            
            // Показываем уведомление
            if (window.UI && window.UI.showNotification) {
                window.UI.showNotification(result.message, 'success');
            } else {
                alert(result.message);
            }
            
            // Обновляем pet display
            if (window.Game.updatePetDisplay) {
                window.Game.updatePetDisplay();
            }
        } else {
            alert(result.message);
        }
    },
    
    // 🎯 ЭВОЛЮЦИЯ ПИТОМЦА
    async evolvePet() {
        if (!window.Game || !window.Game.pet) {
            alert('No pet found!');
            return;
        }
        
        if (!window.WalletManager || !window.WalletManager.publicKey) {
            alert('Please connect wallet!');
            return;
        }
        
        const confirmed = confirm('Are you sure you want to evolve your pet? This will cost TAMA!');
        if (!confirmed) return;
        
        const walletAddress = window.WalletManager.publicKey.toString();
        const result = await window.PetSystem.evolvePet(window.Game.pet, walletAddress);
        
        if (result.success) {
            // Обновляем pet в игре
            window.Game.pet = result.pet;
            
            // Закрываем и открываем заново модальное окно
            this.closePetInfo();
            
            // Показываем уведомление
            if (window.UI && window.UI.showNotification) {
                window.UI.showNotification(result.message, 'success');
            } else {
                alert(result.message);
            }
            
            // Обновляем pet display
            if (window.Game.updatePetDisplay) {
                window.Game.updatePetDisplay();
            }
            
            // Показываем обновленную информацию
            setTimeout(() => {
                this.showPetInfo(window.Game.pet);
            }, 500);
        } else {
            alert(result.message);
        }
    },
    
    // 🎯 ЗАКРЫТЬ МОДАЛЬНОЕ ОКНО
    closePetInfo() {
        const modal = document.getElementById('pet-info-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    },
    
    // 🎯 ПЕРЕКЛЮЧЕНИЕ ТАБОВ
    switchTab(tabName) {
        // Убираем активный класс со всех табов
        document.querySelectorAll('.pet-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.pet-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Добавляем активный класс на нужный таб
        event.target.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    },
    
    // 🎯 ДОБАВИТЬ КНОПКУ В UI
    addPetInfoButton() {
        // Ищем место для кнопки (например, в Pet Management секции)
        const petManagement = document.querySelector('.pet-management');
        if (!petManagement) return;
        
        const existingBtn = document.getElementById('pet-info-btn');
        if (existingBtn) return; // Кнопка уже существует
        
        const btn = document.createElement('button');
        btn.id = 'pet-info-btn';
        btn.className = 'action-btn primary';
        btn.style.width = '100%';
        btn.style.marginTop = '10px';
        btn.innerHTML = `
            🐾 PET INFO
            <small>Stats, abilities & evolution</small>
        `;
        btn.onclick = () => {
            if (window.Game && window.Game.pet) {
                this.showPetInfo(window.Game.pet);
            } else {
                alert('No pet found! Mint an NFT first.');
            }
        };
        
        petManagement.appendChild(btn);
    }
};

// Инициализация при загрузке
if (typeof window !== 'undefined') {
    window.PetUI = PetUI;
    console.log('✅ PetUI loaded globally');
    
    // Добавляем кнопку при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            PetUI.addPetInfoButton();
        });
    } else {
        PetUI.addPetInfoButton();
    }
}

