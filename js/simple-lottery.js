/**
 * 🎰 SIMPLE TAMA LOTTERY - Простая лотерея без Canvas
 * Лотерея с TAMA токенами! Покупай билеты и выигрывай призы!
 */

class SimpleTAMALottery {
    constructor() {
        this.playerTickets = [];
        this.winningNumbers = [];
        this.ticketPrice = 10; // TAMA за билет
        this.maxTickets = 5; // Максимум билетов за игру
        this.prizes = {
            '3': 50,    // 3 совпадения = 50 TAMA
            '4': 200,   // 4 совпадения = 200 TAMA  
            '5': 1000,  // 5 совпадений = 1000 TAMA
            '6': 5000   // 6 совпадений = 5000 TAMA (ДЖЕКПОТ!)
        };
        this.gameState = 'menu'; // menu, results
    }

    show() {
        // Создаем модальное окно для лотереи
        const modal = document.createElement('div');
        modal.id = 'simple-lottery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #1D3557;
            border: 3px solid #FFD700;
            border-radius: 15px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80%;
            overflow: auto;
            position: relative;
            color: white;
            font-family: Arial, sans-serif;
        `;

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '❌';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: #FF6B6B;
            border: none;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            color: white;
            font-size: 18px;
            cursor: pointer;
        `;
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(this.createLotteryContent());
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    createLotteryContent() {
        const content = document.createElement('div');
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #FFD700; font-size: 28px; margin-bottom: 10px;">🎰 TAMA LOTTERY</h1>
                <p style="color: #E0E0E0; font-size: 16px;">Купите билеты и выигрывайте TAMA!</p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #FFD700; margin-bottom: 15px;">📊 Информация</h3>
                <p><strong>Цена билета:</strong> ${this.ticketPrice} TAMA</p>
                <p><strong>Куплено билетов:</strong> <span id="tickets-count">${this.playerTickets.length}</span>/${this.maxTickets}</p>
                <p><strong>Ваш баланс:</strong> <span id="balance-display">Загрузка...</span> TAMA</p>
            </div>

            <div id="tickets-display" style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #FFD700; margin-bottom: 15px;">🎫 Ваши билеты</h3>
                <div id="tickets-list">
                    ${this.playerTickets.length === 0 ? '<p style="color: #999;">Пока нет билетов</p>' : ''}
                </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #FFD700; margin-bottom: 15px;">🏆 Призы</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background: rgba(0, 255, 0, 0.2); padding: 10px; border-radius: 5px;">
                        <strong>3 совпадения:</strong><br>50 TAMA
                    </div>
                    <div style="background: rgba(0, 255, 0, 0.2); padding: 10px; border-radius: 5px;">
                        <strong>4 совпадения:</strong><br>200 TAMA
                    </div>
                    <div style="background: rgba(255, 215, 0, 0.2); padding: 10px; border-radius: 5px;">
                        <strong>5 совпадений:</strong><br>1000 TAMA
                    </div>
                    <div style="background: rgba(255, 0, 0, 0.2); padding: 10px; border-radius: 5px;">
                        <strong>6 совпадений:</strong><br>5000 TAMA (ДЖЕКПОТ!)
                    </div>
                </div>
            </div>

            <div id="game-buttons" style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button id="buy-ticket-btn" style="
                    background: #4ECDC4;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    min-width: 120px;
                ">🎫 Купить билет</button>
                
                <button id="draw-btn" style="
                    background: #FF6B6B;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    min-width: 120px;
                ">🎰 Розыгрыш</button>
                
                <button id="reset-btn" style="
                    background: #95A5A6;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    min-width: 120px;
                ">🔄 Сброс</button>
            </div>

            <div id="results-display" style="display: none; background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #FFD700; margin-bottom: 15px;">🎉 Результаты</h3>
                <div id="results-content"></div>
            </div>
        `;

        this.setupEventListeners(content);
        this.updateBalance();
        
        return content;
    }

    setupEventListeners(content) {
        const buyBtn = content.querySelector('#buy-ticket-btn');
        const drawBtn = content.querySelector('#draw-btn');
        const resetBtn = content.querySelector('#reset-btn');

        buyBtn.addEventListener('click', () => this.buyTicket());
        drawBtn.addEventListener('click', () => this.drawNumbers());
        resetBtn.addEventListener('click', () => this.resetGame());
    }

    async updateBalance() {
        if (window.SimpleTAMASystem && window.WalletManager && window.WalletManager.publicKey) {
            try {
                const balance = await window.SimpleTAMASystem.getBalance(window.WalletManager.publicKey.toString());
                const balanceDisplay = document.querySelector('#balance-display');
                if (balanceDisplay) {
                    balanceDisplay.textContent = balance;
                }
            } catch (error) {
                console.error('Error updating balance:', error);
            }
        }
    }

    async buyTicket() {
        // Проверяем баланс TAMA
        if (!window.SimpleTAMASystem || !window.WalletManager || !window.WalletManager.publicKey) {
            this.showMessage('❌ Подключи кошелек для покупки билетов!', 'error');
            return;
        }

        // Проверяем лимит билетов
        if (this.playerTickets.length >= this.maxTickets) {
            this.showMessage(`❌ Максимум ${this.maxTickets} билетов за игру!`, 'error');
            return;
        }

        try {
            // Проверяем баланс
            const balance = await window.SimpleTAMASystem.getBalance(window.WalletManager.publicKey.toString());
            if (balance < this.ticketPrice) {
                this.showMessage(`❌ Недостаточно TAMA! Нужно: ${this.ticketPrice}, есть: ${balance}`, 'error');
                return;
            }

            // Списываем TAMA за билет
            await window.SimpleTAMASystem.spendTAMA(
                window.WalletManager.publicKey.toString(),
                this.ticketPrice,
                `Lottery Ticket #${this.playerTickets.length + 1}`
            );

            // Генерируем случайные числа для билета
            const ticketNumbers = this.generateTicketNumbers();
            this.playerTickets.push(ticketNumbers);
            
            this.updateDisplay();
            this.updateBalance();
            this.showMessage(`✅ Билет куплен! Номера: ${ticketNumbers.join(', ')}`, 'success');
            
        } catch (error) {
            console.error('Error buying ticket:', error);
            this.showMessage('❌ Ошибка при покупке билета!', 'error');
        }
    }

    generateTicketNumbers() {
        const numbers = [];
        while (numbers.length < 6) {
            const num = Math.floor(Math.random() * 49) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers.sort((a, b) => a - b);
    }

    async drawNumbers() {
        if (this.playerTickets.length === 0) {
            this.showMessage('❌ Купите хотя бы один билет!', 'error');
            return;
        }

        this.gameState = 'results';
        
        // Генерируем выигрышные номера
        this.winningNumbers = this.generateTicketNumbers();
        
        // Проверяем выигрыши
        let totalWinnings = 0;
        const results = [];

        this.playerTickets.forEach((ticket, index) => {
            const matches = this.countMatches(ticket, this.winningNumbers);
            let winnings = 0;
            
            if (matches >= 3) {
                winnings = this.prizes[matches.toString()] || 0;
                totalWinnings += winnings;
            }
            
            results.push({
                ticket: ticket,
                matches: matches,
                winnings: winnings
            });
        });

        // Выплачиваем выигрыши ИЗ TREASURY (фиксированный supply!)
        if (totalWinnings > 0 && window.SimpleTAMASystem && window.WalletManager.publicKey) {
            try {
                await window.SimpleTAMASystem.addTAMAFromTreasury(
                    window.WalletManager.publicKey.toString(),
                    totalWinnings,
                    `Lottery Winnings: ${totalWinnings} TAMA`
                );
                this.showMessage(`🎉 Выигрыш ${totalWinnings} TAMA зачислен!`, 'success');
            } catch (error) {
                console.error('Error adding winnings:', error);
                this.showMessage('❌ Ошибка при зачислении выигрыша!', 'error');
            }
        }

        this.showResults(results, totalWinnings);
        this.updateBalance();
    }

    countMatches(ticket, winning) {
        let matches = 0;
        ticket.forEach(num => {
            if (winning.includes(num)) {
                matches++;
            }
        });
        return matches;
    }

    showResults(results, totalWinnings) {
        const resultsDisplay = document.querySelector('#results-display');
        const resultsContent = document.querySelector('#results-content');
        
        if (!resultsDisplay || !resultsContent) return;

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h4 style="color: #FFD700;">Выигрышные номера: ${this.winningNumbers.join(', ')}</h4>
            </div>
        `;

        results.forEach((result, index) => {
            const matchColor = result.matches >= 3 ? '#00FF00' : '#FF6B6B';
            html += `
                <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Билет ${index + 1}:</strong> ${result.ticket.join(', ')}
                        </div>
                        <div style="color: ${matchColor}; font-weight: bold;">
                            ${result.matches} совпадений
                        </div>
                    </div>
                    ${result.winnings > 0 ? `<div style="color: #FFD700; font-weight: bold; margin-top: 5px;">💰 Выигрыш: ${result.winnings} TAMA</div>` : ''}
                </div>
            `;
        });

        if (totalWinnings > 0) {
            html += `
                <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(255, 215, 0, 0.2); border-radius: 8px;">
                    <h3 style="color: #FFD700;">🎉 ОБЩИЙ ВЫИГРЫШ: ${totalWinnings} TAMA!</h3>
                </div>
            `;
        } else {
            html += `
                <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(255, 107, 107, 0.2); border-radius: 8px;">
                    <h3 style="color: #FF6B6B;">😔 К сожалению, вы не выиграли</h3>
                </div>
            `;
        }

        resultsContent.innerHTML = html;
        resultsDisplay.style.display = 'block';
    }

    resetGame() {
        this.playerTickets = [];
        this.winningNumbers = [];
        this.gameState = 'menu';
        this.updateDisplay();
        
        const resultsDisplay = document.querySelector('#results-display');
        if (resultsDisplay) {
            resultsDisplay.style.display = 'none';
        }
    }

    updateDisplay() {
        const ticketsCount = document.querySelector('#tickets-count');
        const ticketsList = document.querySelector('#tickets-list');
        
        if (ticketsCount) {
            ticketsCount.textContent = this.playerTickets.length;
        }
        
        if (ticketsList) {
            if (this.playerTickets.length === 0) {
                ticketsList.innerHTML = '<p style="color: #999;">Пока нет билетов</p>';
            } else {
                let html = '';
                this.playerTickets.forEach((ticket, index) => {
                    html += `
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 8px;">
                            <strong>Билет ${index + 1}:</strong> ${ticket.join(', ')}
                        </div>
                    `;
                });
                ticketsList.innerHTML = html;
            }
        }
    }

    showMessage(message, type = 'info') {
        console.log(`🎰 Lottery: ${message}`);
        
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message);
        }
    }
}

// Экспортируем класс
window.SimpleTAMALottery = SimpleTAMALottery;
