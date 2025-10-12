/**
 * 🎰 TAMA LOTTERY - Mini Game
 * Лотерея с TAMA токенами! Покупай билеты и выигрывай призы!
 */

class TAMALottery {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.tickets = [];
        this.winningNumbers = [];
        this.playerTickets = [];
        this.ticketPrice = 10; // TAMA за билет
        this.maxTickets = 10; // Максимум билетов за игру
        this.prizes = {
            '3': 50,    // 3 совпадения = 50 TAMA
            '4': 200,   // 4 совпадения = 200 TAMA  
            '5': 1000,  // 5 совпадений = 1000 TAMA
            '6': 5000   // 6 совпадений = 5000 TAMA (ДЖЕКПОТ!)
        };
        
        this.init();
    }

    init() {
        // Создаем canvas для лотереи
        this.canvas = document.createElement('canvas');
        this.canvas.width = 500;
        this.canvas.height = 600;
        this.canvas.style.cssText = `
            border: 3px solid #FFD700;
            border-radius: 15px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            display: block;
            margin: 20px auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Клик по canvas для покупки билетов
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameRunning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Проверяем клик по кнопкам
            if (this.isPointInButton(x, y, 50, 450, 100, 40)) {
                this.buyTicket();
            } else if (this.isPointInButton(x, y, 200, 450, 100, 40)) {
                this.drawNumbers();
            } else if (this.isPointInButton(x, y, 350, 450, 100, 40)) {
                this.resetGame();
            }
        });
    }

    isPointInButton(x, y, bx, by, bw, bh) {
        return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
    }

    start() {
        this.gameRunning = true;
        this.tickets = [];
        this.winningNumbers = [];
        this.playerTickets = [];
        
        this.gameLoop();
    }

    buyTicket() {
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

        // Проверяем баланс
        window.SimpleTAMASystem.getBalance(window.WalletManager.publicKey.toString()).then(balance => {
            if (balance < this.ticketPrice) {
                this.showMessage(`❌ Недостаточно TAMA! Нужно: ${this.ticketPrice}, есть: ${balance}`, 'error');
                return;
            }

            // Списываем TAMA за билет
            window.SimpleTAMASystem.spendTAMA(
                window.WalletManager.publicKey.toString(),
                this.ticketPrice,
                `Lottery Ticket #${this.playerTickets.length + 1}`
            ).then(() => {
                // Генерируем случайные числа для билета
                const ticketNumbers = this.generateTicketNumbers();
                this.playerTickets.push(ticketNumbers);
                
                this.showMessage(`✅ Билет куплен! Номера: ${ticketNumbers.join(', ')}`, 'success');
                this.updateDisplay();
            }).catch(error => {
                console.error('Error buying ticket:', error);
                this.showMessage('❌ Ошибка при покупке билета!', 'error');
            });
        });
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

    drawNumbers() {
        if (this.playerTickets.length === 0) {
            this.showMessage('❌ Купите хотя бы один билет!', 'error');
            return;
        }

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
            window.SimpleTAMASystem.addTAMAFromTreasury(
                window.WalletManager.publicKey.toString(),
                totalWinnings,
                `Lottery Winnings: ${totalWinnings} TAMA`
            );
        }

        this.showResults(results, totalWinnings);
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
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎰 РЕЗУЛЬТАТЫ ЛОТЕРЕИ', this.canvas.width / 2, 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText(`Выигрышные номера: ${this.winningNumbers.join(', ')}`, this.canvas.width / 2, 100);
        
        let y = 150;
        results.forEach((result, index) => {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Билет ${index + 1}: ${result.ticket.join(', ')}`, 50, y);
            
            this.ctx.fillStyle = result.matches >= 3 ? '#00FF00' : '#FF0000';
            this.ctx.fillText(`Совпадений: ${result.matches}`, 50, y + 20);
            
            if (result.winnings > 0) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillText(`💰 Выигрыш: ${result.winnings} TAMA`, 50, y + 40);
            }
            
            y += 80;
        });
        
        if (totalWinnings > 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`🎉 ОБЩИЙ ВЫИГРЫШ: ${totalWinnings} TAMA!`, this.canvas.width / 2, y + 20);
        } else {
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('😔 К сожалению, вы не выиграли', this.canvas.width / 2, y + 20);
        }
        
        // Кнопка "Новая игра"
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fillRect(200, y + 60, 100, 40);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Новая игра', 250, y + 85);
    }

    resetGame() {
        this.tickets = [];
        this.winningNumbers = [];
        this.playerTickets = [];
        this.updateDisplay();
    }

    showMessage(message, type = 'info') {
        // Показываем сообщение в консоли и на экране
        console.log(`🎰 Lottery: ${message}`);
        
        // Можно добавить визуальное уведомление
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message);
        }
    }

    updateDisplay() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Заголовок
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎰 TAMA LOTTERY', this.canvas.width / 2, 40);
        
        // Информация о билетах
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Цена билета: ${this.ticketPrice} TAMA`, 20, 80);
        this.ctx.fillText(`Куплено билетов: ${this.playerTickets.length}/${this.maxTickets}`, 20, 110);
        
        // Показываем купленные билеты
        if (this.playerTickets.length > 0) {
            this.ctx.fillText('Ваши билеты:', 20, 150);
            let y = 180;
            this.playerTickets.forEach((ticket, index) => {
                this.ctx.fillStyle = '#E0E0E0';
                this.ctx.font = '14px Arial';
                this.ctx.fillText(`Билет ${index + 1}: ${ticket.join(', ')}`, 30, y);
                y += 25;
            });
        }
        
        // Призы
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Призы:', 20, 350);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('3 совпадения: 50 TAMA', 30, 375);
        this.ctx.fillText('4 совпадения: 200 TAMA', 30, 395);
        this.ctx.fillText('5 совпадений: 1000 TAMA', 30, 415);
        this.ctx.fillText('6 совпадений: 5000 TAMA (ДЖЕКПОТ!)', 30, 435);
        
        // Кнопки
        this.drawButton(50, 450, 100, 40, '#4ECDC4', 'Купить билет');
        this.drawButton(200, 450, 100, 40, '#FF6B6B', 'Розыгрыш');
        this.drawButton(350, 450, 100, 40, '#95A5A6', 'Сброс');
    }

    drawButton(x, y, width, height, color, text) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x + width / 2, y + height / 2 + 5);
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updateDisplay();
        requestAnimationFrame(() => this.gameLoop());
    }

    end() {
        this.gameRunning = false;
    }

    getCanvas() {
        return this.canvas;
    }

    show() {
        // Создаем модальное окно для лотереи
        const modal = document.createElement('div');
        modal.id = 'lottery-modal';
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
            padding: 20px;
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
            position: relative;
        `;

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '❌';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #FF6B6B;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            color: white;
            font-size: 16px;
            cursor: pointer;
        `;
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.end();
        });

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(this.canvas);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Запускаем лотерею
        this.start();
    }
}

// Экспортируем класс
window.TAMALottery = TAMALottery;
