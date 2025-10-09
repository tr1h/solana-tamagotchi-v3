// ============================================
// UI MANAGER
// ============================================

const UI = {
    leaderboard: [],
    
    // Initialize UI
    init() {
        this.setupLeaderboard();
        this.updatePlayerCount();
        
        // Update every 30 seconds
        setInterval(() => {
            this.updateLeaderboard();
            this.updatePlayerCount();
        }, 30000);
    },
    
    // Setup leaderboard
    async setupLeaderboard() {
        if (window.Database) {
            this.leaderboard = await Database.getLeaderboard();
            this.updateLeaderboardDisplay();
        }
    },
    
    // Update leaderboard
    async updateLeaderboard() {
        if (window.Database) {
            this.leaderboard = await Database.getLeaderboard();
            this.updateLeaderboardDisplay();
        }
    },
    
    // Update leaderboard display
    updateLeaderboardDisplay() {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            container.innerHTML = '<p class="empty-state">No players yet. Be the first!</p>';
            return;
        }
        
        this.leaderboard.slice(0, 10).forEach((player, index) => {
            const div = document.createElement('div');
            div.className = `leaderboard-item ${index < 3 ? 'top-3' : ''}`;
            
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            div.innerHTML = `
                <span class="leaderboard-rank">${emoji}${index + 1}</span>
                <div class="leaderboard-info">
                    <p class="leaderboard-name">${Utils.shortenAddress(player.wallet)}</p>
                    <p class="leaderboard-pet">${player.pet_name || 'No pet'} (${player.pet_rarity || 'common'})</p>
                </div>
                <div class="leaderboard-stats">
                    <span class="leaderboard-level">Lv.${player.level}</span>
                    <span class="leaderboard-xp">${(player.xp || 0).toLocaleString()} XP</span>
                    ${player.ranking_score ? `<span class="leaderboard-score">${player.ranking_score.toLocaleString()}</span>` : ''}
                </div>
            `;
            
            container.appendChild(div);
        });
    },
    
    // Update player count
    async updatePlayerCount() {
        const countElement = document.getElementById('player-count');
        if (!countElement) return;
        
        if (window.Database) {
            const count = await Database.getPlayerCount();
            countElement.textContent = `${count} players`;
        }
    },
    
    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    // Update stat display
    updateStat(statName, value, max = 100) {
        const bar = document.getElementById(`${statName}-bar`);
        const text = document.getElementById(`${statName}-value`);
        
        if (bar) {
            const percentage = (value / max) * 100;
            bar.style.width = `${percentage}%`;
            
            // Add warning class if low
            if (percentage < 30) {
                bar.classList.add('warning');
            } else {
                bar.classList.remove('warning');
            }
        }
        
        if (text) {
            text.textContent = Math.floor(value);
        }
    },
    
    // Animate stat change
    animateStatChange(statName, oldValue, newValue, duration = 500) {
        Utils.animateValue(oldValue, newValue, duration, (value) => {
            this.updateStat(statName, value);
        });
    },
    
    // Show tooltip
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '8px';
        tooltip.style.fontSize = '0.8rem';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '10000';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        
        setTimeout(() => tooltip.remove(), 3000);
    },
    
    // Create floating text
    createFloatingText(x, y, text, color = '#FFCA3A') {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.position = 'fixed';
        floatingText.style.left = `${x}px`;
        floatingText.style.top = `${y}px`;
        floatingText.style.color = color;
        floatingText.style.fontFamily = "'Press Start 2P', cursive";
        floatingText.style.fontSize = '1.2rem';
        floatingText.style.fontWeight = 'bold';
        floatingText.style.pointerEvents = 'none';
        floatingText.style.zIndex = '9999';
        floatingText.style.animation = 'floatUp 2s ease-out forwards';
        
        document.body.appendChild(floatingText);
        
        setTimeout(() => floatingText.remove(), 2000);
    },
    
    // Update button state
    updateButton(buttonId, options = {}) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (options.disabled !== undefined) {
            button.disabled = options.disabled;
        }
        
        if (options.text) {
            button.querySelector('span').textContent = options.text;
        }
        
        if (options.loading) {
            button.classList.add('loading');
        } else {
            button.classList.remove('loading');
        }
        
        if (options.success) {
            button.classList.add('success');
            setTimeout(() => button.classList.remove('success'), 1000);
        }
        
        if (options.error) {
            button.classList.add('error');
            setTimeout(() => button.classList.remove('error'), 1000);
        }
    },
    
    // Confirm dialog
    async confirm(message) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'modal';
            dialog.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h2>Confirm</h2>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom: 20px;">${message}</p>
                        <div style="display: flex; gap: 10px;">
                            <button class="action-btn primary confirm-yes" style="flex: 1;">Yes</button>
                            <button class="action-btn danger confirm-no" style="flex: 1;">No</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            dialog.querySelector('.confirm-yes').addEventListener('click', () => {
                dialog.remove();
                resolve(true);
            });
            
            dialog.querySelector('.confirm-no').addEventListener('click', () => {
                dialog.remove();
                resolve(false);
            });
            
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.remove();
                    resolve(false);
                }
            });
        });
    },
    
    // Loading overlay
    showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.background = 'rgba(0,0,0,0.8)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '10000';
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div class="pixel-loader"></div>
                <p style="color: #FFCA3A; margin-top: 20px; font-family: 'Press Start 2P', cursive; font-size: 0.8rem;">${message}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    // Update referral stats
    updateReferralStats(count, earned) {
        const countEl = document.getElementById('referral-count');
        const earnedEl = document.getElementById('referral-earned');
        
        if (countEl) countEl.textContent = count;
        if (earnedEl) earnedEl.textContent = `${earned} TAMA`;
    },
    
    // Add visual feedback
    addFeedback(element, type = 'success') {
        element.classList.add(type);
        setTimeout(() => element.classList.remove(type), 500);
    },
    
    // Shake element
    shake(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    },
    
    // Bounce element
    bounce(element) {
        element.classList.add('bounce');
        setTimeout(() => element.classList.remove('bounce'), 500);
    },
    
    // Create confetti
    createConfetti() {
        const colors = ['#FFCA3A', '#8AC926', '#1982C4', '#FF595E', '#6A4C93'];
        const emojis = ['🎉', '🎊', '⭐', '✨', '🌟'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const emoji = Utils.randomChoice(emojis);
                const x = Math.random() * window.innerWidth;
                const y = -50;
                
                Utils.createParticle(x, y, emoji, 'confetti');
            }, i * 100);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        UI.init();
    }, 500);
});

// Export
window.UI = UI;







