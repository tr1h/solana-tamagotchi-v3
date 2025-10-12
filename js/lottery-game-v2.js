/**
 * 🎰 TAMA LOTTERY V2 - Улучшенная лотерея
 * Лотерея с TAMA токенами! Покупай билеты и выигрывай призы!
 */

class TAMALotteryV2 {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
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
        this.gameState = 'menu'; // menu, playing, results
        this.animationFrame = null;
        this.lastClickTime = 0;
        
        this.init();
    }

    init() {
        // Создаем canvas для лотереи
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 700;
        this.canvas.style.cssText = `
            border: 3px solid #FFD700;
            border-radius: 15px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            display: block;
            margin: 20px auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            cursor: pointer;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Клик по canvas
        this.canvas.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - this.lastClickTime < 300) return; // Защита от двойных кликов
            this.lastClickTime = now;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleClick(x, y);
        });
    }

    handleClick(x, y) {
        if (this.gameState === 'menu') {
            // Кнопки в меню
            if (this.isPointInButton(x, y, 50, 500, 120, 50)) {
                this.buyTicket();
            } else if (this.isPointInButton(x, y, 200, 500, 120, 50)) {
                this.drawNumbers();
            } else if (this.isPointInButton(x, y, 350, 500, 120, 50)) {
                this.resetGame();
            }
        } else if (this.gameState === 'results') {
            // Кнопка "Новая игра" в результатах
            if (this.isPointInButton(x, y, 200, 600, 120, 50)) {
                this.resetGame();
            }
        }
    }

    isPointInButton(x, y, bx, by, bw, bh) {
        return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
    }

    start() {
        this.gameRunning = true;
        this.gameState = 'menu';
        this.playerTickets = [];
        this.winningNumbers = [];
        this.gameLoop();
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
        
        // Анимация розыгрыша
        await this.animateDraw();
        
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
    }

    async animateDraw() {
        // Простая анимация розыгрыша
        for (let i = 0; i < 20; i++) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBackground();
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🎰 РОЗЫГРЫШ...', this.canvas.width / 2, 300);
            
            // Показываем случайные числа
            const tempNumbers = this.generateTicketNumbers();
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(tempNumbers.join(' - '), this.canvas.width / 2, 350);
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
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
        this.drawButton(200, 600, 120, 50, '#4ECDC4', 'Новая игра');
    }

    resetGame() {
        this.playerTickets = [];
        this.winningNumbers = [];
        this.gameState = 'menu';
    }

    showMessage(message, type = 'info') {
        console.log(`🎰 Lottery: ${message}`);
        
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message);
        }
    }

    drawBackground() {
        // Градиентный фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(1, '#2a5298');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateDisplay() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
        if (this.gameState === 'menu') {
            this.drawMenu();
        }
    }

    drawMenu() {
        // Заголовок
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎰 TAMA LOTTERY', this.canvas.width / 2, 50);
        
        // Информация о билетах
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Цена билета: ${this.ticketPrice} TAMA`, 30, 100);
        this.ctx.fillText(`Куплено билетов: ${this.playerTickets.length}/${this.maxTickets}`, 30, 130);
        
        // Показываем купленные билеты
        if (this.playerTickets.length > 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText('Ваши билеты:', 30, 170);
            
            let y = 200;
            this.playerTickets.forEach((ticket, index) => {
                this.ctx.fillStyle = '#E0E0E0';
                this.ctx.font = '16px Arial';
                this.ctx.fillText(`Билет ${index + 1}: ${ticket.join(', ')}`, 40, y);
                y += 30;
            });
        }
        
        // Призы
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('Призы:', 30, 400);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('3 совпадения: 50 TAMA', 40, 425);
        this.ctx.fillText('4 совпадения: 200 TAMA', 40, 445);
        this.ctx.fillText('5 совпадений: 1000 TAMA', 40, 465);
        this.ctx.fillText('6 совпадений: 5000 TAMA (ДЖЕКПОТ!)', 40, 485);
        
        // Кнопки
        this.drawButton(50, 500, 120, 50, '#4ECDC4', 'Купить билет');
        this.drawButton(200, 500, 120, 50, '#FF6B6B', 'Розыгрыш');
        this.drawButton(350, 500, 120, 50, '#95A5A6', 'Сброс');
    }

    drawButton(x, y, width, height, color, text) {
        // Тень кнопки
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x + 2, y + 2, width, height);
        
        // Кнопка
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        
        // Граница кнопки
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Текст кнопки
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x + width / 2, y + height / 2 + 5);
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updateDisplay();
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }

    end() {
        this.gameRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    getCanvas() {
        return this.canvas;
    }

    show() {
        // Создаем модальное окно для лотереи
        const modal = document.createElement('div');
        modal.id = 'lottery-modal-v2';
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
window.TAMALotteryV2 = TAMALotteryV2;
