// ============================================
// REFERRAL SYSTEM MODULE
// ============================================

const ReferralSystem = {
    // Конфигурация
    CONFIG: {
        LEVEL_1_REWARD: 100,     // TAMA за реферала 1 уровня
        LEVEL_2_REWARD: 50,      // TAMA за реферала 2 уровня
        PASSIVE_INCOME_PERCENT: 15, // % от заработка рефералов
        MILESTONE_BONUSES: {
            5: 1000,     // 5 рефералов = 1000 TAMA
            10: 3000,    // 10 рефералов = 3000 TAMA
            25: 10000,   // 25 рефералов = 10000 TAMA
            50: 30000,   // 50 рефералов = 30000 TAMA
            100: 100000  // 100 рефералов = 100000 TAMA + Badge
        }
    },
    
    // Инициализация
    init() {
        console.log('🔗 Initializing Referral System...');
        this.setupReferralLinks();
        this.checkReferralFromURL();
        console.log('✅ Referral System ready');
    },
    
    // Настройка реферальных ссылок
    setupReferralLinks() {
        // Добавляем кнопку реферальной ссылки
        const refBtn = document.getElementById('referral-btn');
        if (refBtn) {
            refBtn.addEventListener('click', () => this.showReferralModal());
        }
        
        // Добавляем кнопку в хедер
        this.addReferralButtonToHeader();
    },
    
    // Добавить кнопку рефералов в хедер
    addReferralButtonToHeader() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        const refButton = document.createElement('button');
        refButton.id = 'header-referral-btn';
        refButton.className = 'header-btn';
        refButton.innerHTML = '🔗 Referrals';
        refButton.addEventListener('click', () => this.showReferralModal());
        
        // Добавляем после кнопки TAMA
        const tamaBtn = document.querySelector('.balance-tama');
        if (tamaBtn && tamaBtn.parentNode) {
            tamaBtn.parentNode.insertBefore(refButton, tamaBtn.nextSibling);
        }
    },
    
    // Проверить реферальную ссылку из URL
    checkReferralFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        const tgId = urlParams.get('tg_id');
        const tgUsername = urlParams.get('tg_username');
        
        if (refCode) {
            console.log('🔗 Referral link detected:', { refCode, tgId, tgUsername });
            this.processReferralLink(refCode, tgId, tgUsername);
        }
    },
    
    // Обработать реферальную ссылку
    async processReferralLink(refCode, tgId, tgUsername) {
        try {
            // Сохраняем реферальную информацию
            const referralData = {
                refCode: refCode,
                tgId: tgId,
                tgUsername: tgUsername,
                timestamp: Date.now(),
                processed: false
            };
            
            // Сохраняем в localStorage
            Utils.saveLocal('pendingReferral', referralData);
            
            // Показываем уведомление
            if (window.Utils && window.Utils.showNotification) {
                window.Utils.showNotification('🔗 Referral link detected! Connect wallet to claim rewards!');
            }
            
            console.log('✅ Referral data saved:', referralData);
            
        } catch (error) {
            console.error('❌ Error processing referral link:', error);
        }
    },
    
    // Показать модальное окно рефералов
    showReferralModal() {
        // Удаляем старое окно если есть
        const oldModal = document.getElementById('referral-modal');
        if (oldModal) oldModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'referral-modal';
        modal.className = 'referral-modal';
        modal.innerHTML = `
            <div class="referral-modal-content">
                <div class="referral-header">
                    <h2>🔗 Referral System</h2>
                    <span class="referral-close" onclick="document.getElementById('referral-modal').remove()">&times;</span>
                </div>
                
                <div class="referral-stats" id="referral-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Referrals:</span>
                        <span class="stat-value" id="total-referrals">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Level 1:</span>
                        <span class="stat-value" id="level1-referrals">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Level 2:</span>
                        <span class="stat-value" id="level2-referrals">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Earned:</span>
                        <span class="stat-value" id="referral-earnings">0 TAMA</span>
                    </div>
                </div>
                
                <div class="referral-link-section">
                    <h3>🎯 Your Referral Link</h3>
                    <div class="referral-link-container">
                        <input type="text" id="referral-link" readonly class="referral-link-input">
                        <button class="copy-link-btn" onclick="window.ReferralSystem.copyReferralLink()">📋 Copy</button>
                    </div>
                </div>
                
                <div class="referral-rewards">
                    <h3>💰 Rewards</h3>
                    <div class="reward-item">
                        <span>Level 1 Referral:</span>
                        <span class="reward-amount">${this.CONFIG.LEVEL_1_REWARD} TAMA</span>
                    </div>
                    <div class="reward-item">
                        <span>Level 2 Referral:</span>
                        <span class="reward-amount">${this.CONFIG.LEVEL_2_REWARD} TAMA</span>
                    </div>
                    <div class="reward-item">
                        <span>Passive Income:</span>
                        <span class="reward-amount">${this.CONFIG.PASSIVE_INCOME_PERCENT}% of earnings</span>
                    </div>
                </div>
                
                <div class="referral-milestones">
                    <h3>🏆 Milestone Bonuses</h3>
                    <div class="milestone-list" id="milestone-list">
                        <!-- Milestones will be loaded here -->
                    </div>
                </div>
                
                <div class="referral-actions">
                    <button class="referral-btn primary" onclick="window.ReferralSystem.shareReferralLink()">
                        📤 Share Link
                    </button>
                    <button class="referral-btn secondary" onclick="window.ReferralSystem.viewReferralHistory()">
                        📊 View History
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Загружаем данные
        this.loadReferralData();
        this.generateReferralLink();
        this.loadMilestones();
    },
    
    // Загрузить данные рефералов
    async loadReferralData() {
        try {
            if (!window.WalletManager || !window.WalletManager.publicKey) {
                console.warn('⚠️ No wallet connected');
                return;
            }
            
            const walletAddress = window.WalletManager.publicKey.toString();
            
            // Получаем статистику рефералов
            if (window.Database && window.Database.supabase) {
                const { data: referrals, error } = await window.Database.supabase
                    .from('referrals')
                    .select('*')
                    .eq('referrer_address', walletAddress);
                
                if (error) {
                    console.error('❌ Error loading referrals:', error);
                    return;
                }
                
                const level1Count = referrals.filter(r => r.level === 1).length;
                const level2Count = referrals.filter(r => r.level === 2).length;
                const totalEarnings = referrals.reduce((sum, r) => sum + (r.signup_reward || 0), 0);
                
                // Обновляем UI
                document.getElementById('total-referrals').textContent = level1Count + level2Count;
                document.getElementById('level1-referrals').textContent = level1Count;
                document.getElementById('level2-referrals').textContent = level2Count;
                document.getElementById('referral-earnings').textContent = `${totalEarnings} TAMA`;
            }
            
        } catch (error) {
            console.error('❌ Error loading referral data:', error);
        }
    },
    
    // Генерировать реферальную ссылку
    generateReferralLink() {
        try {
            if (!window.WalletManager || !window.WalletManager.publicKey) {
                console.warn('⚠️ No wallet connected');
                return;
            }
            
            const walletAddress = window.WalletManager.publicKey.toString();
            const baseUrl = window.location.origin + window.location.pathname;
            const referralLink = `${baseUrl}?ref=${walletAddress}`;
            
            const linkInput = document.getElementById('referral-link');
            if (linkInput) {
                linkInput.value = referralLink;
            }
            
            console.log('🔗 Generated referral link:', referralLink);
            
        } catch (error) {
            console.error('❌ Error generating referral link:', error);
        }
    },
    
    // Копировать реферальную ссылку
    copyReferralLink() {
        const linkInput = document.getElementById('referral-link');
        if (linkInput) {
            linkInput.select();
            document.execCommand('copy');
            
            if (window.Utils && window.Utils.showNotification) {
                window.Utils.showNotification('📋 Referral link copied to clipboard!');
            }
        }
    },
    
    // Поделиться реферальной ссылкой
    shareReferralLink() {
        const linkInput = document.getElementById('referral-link');
        if (linkInput && linkInput.value) {
            const shareText = `🎮 Join me in Solana Tamagotchi! Earn TAMA tokens and play with NFT pets! ${linkInput.value}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Solana Tamagotchi',
                    text: shareText,
                    url: linkInput.value
                });
            } else {
                // Fallback - копируем в буфер
                navigator.clipboard.writeText(shareText).then(() => {
                    if (window.Utils && window.Utils.showNotification) {
                        window.Utils.showNotification('📤 Share text copied to clipboard!');
                    }
                });
            }
        }
    },
    
    // Загрузить milestone бонусы
    loadMilestones() {
        const milestoneList = document.getElementById('milestone-list');
        if (!milestoneList) return;
        
        milestoneList.innerHTML = Object.entries(this.CONFIG.MILESTONE_BONUSES)
            .map(([count, reward]) => `
                <div class="milestone-item">
                    <span class="milestone-count">${count} referrals</span>
                    <span class="milestone-reward">+${reward} TAMA</span>
                </div>
            `).join('');
    },
    
    // Показать историю рефералов
    viewReferralHistory() {
        // TODO: Implement referral history modal
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification('📊 Referral history coming soon!');
        }
    },
    
    // Обработать нового реферала
    async processNewReferral(newPlayerWallet) {
        try {
            const pendingReferral = Utils.loadLocal('pendingReferral');
            if (!pendingReferral || pendingReferral.processed) {
                return false;
            }
            
            const referrerWallet = pendingReferral.refCode;
            
            // Проверяем что это не сам реферал
            if (referrerWallet === newPlayerWallet) {
                console.log('⚠️ Self-referral detected, ignoring');
                return false;
            }
            
            // Добавляем реферала в базу данных
            if (window.Database && window.Database.addReferral) {
                const success = await window.Database.addReferral(
                    btoa(referrerWallet), // Кодируем в base64
                    newPlayerWallet
                );
                
                if (success) {
                    // Отмечаем как обработанный
                    pendingReferral.processed = true;
                    Utils.saveLocal('pendingReferral', pendingReferral);
                    
                    // Показываем уведомление
                    if (window.Utils && window.Utils.showNotification) {
                        window.Utils.showNotification('🎉 Referral processed! You earned TAMA rewards!');
                    }
                    
                    console.log('✅ Referral processed successfully');
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error processing referral:', error);
            return false;
        }
    },
    
    // Получить статистику рефералов
    async getReferralStats(walletAddress) {
        try {
            if (!window.Database || !window.Database.supabase) {
                return null;
            }
            
            const { data: referrals, error } = await window.Database.supabase
                .from('referrals')
                .select('*')
                .eq('referrer_address', walletAddress);
            
            if (error) {
                console.error('❌ Error getting referral stats:', error);
                return null;
            }
            
            const level1Count = referrals.filter(r => r.level === 1).length;
            const level2Count = referrals.filter(r => r.level === 2).length;
            const totalEarnings = referrals.reduce((sum, r) => sum + (r.signup_reward || 0), 0);
            
            return {
                totalReferrals: level1Count + level2Count,
                level1Referrals: level1Count,
                level2Referrals: level2Count,
                totalEarnings: totalEarnings,
                referrals: referrals
            };
            
        } catch (error) {
            console.error('❌ Error getting referral stats:', error);
            return null;
        }
    }
};

// Экспорт для глобального использования
window.ReferralSystem = ReferralSystem;

console.log('✅ Referral System module loaded');
