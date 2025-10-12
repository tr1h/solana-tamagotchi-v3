/**
 * 🎮 TAMA CATCH V2 - Улучшенная мини-игра
 * Лови падающие TAMA токены и зарабатывай очки!
 */

class TAMACatchGameV2 {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.score = 0;
        this.timeLeft = 60; // Увеличили время до 60 секунд
        this.tamaTokens = [];
        this.bombs = []; // Добавили бомбы
        this.powerUps = []; // Добавили бонусы
        this.player = { x: 0, y: 0, width: 60, height: 60 };
        this.keys = {};
        this.lastSpawn = 0;
        this.spawnRate = 800; // Ускорили спавн
        this.gravity = 2.5;
        this.speed = 4;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.animationFrame = null;
        this.timerInterval = null;
        this.lastClickTime = 0;
        
        this.init();
    }

    init() {
        // Создаем canvas для игры
        this.canvas = document.createElement('canvas');
        this.canvas.width = 500;
        this.canvas.height = 600;
        this.canvas.style.cssText = `
            border: 3px solid #FFD700;
            border-radius: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: block;
            margin: 20px auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            cursor: pointer;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Управление клавиатурой
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                this.keys[e.code] = true;
                
                // Пауза на пробел
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.togglePause();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Управление мышью/тач
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                this.player.x = e.clientX - rect.left - this.player.width / 2;
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.player.x = touch.clientX - rect.left - this.player.width / 2;
            }
        });

        // Клики по canvas для кнопок
        this.canvas.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - this.lastClickTime < 300) return;
            this.lastClickTime = now;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleClick(x, y);
        });
    }

    handleClick(x, y) {
        if (this.gameState === 'menu') {
            // Кнопка "Начать игру"
            if (this.isPointInButton(x, y, 150, 400, 200, 50)) {
                this.startGame();
            }
        } else if (this.gameState === 'paused') {
            // Кнопка "Продолжить"
            if (this.isPointInButton(x, y, 150, 350, 200, 50)) {
                this.resumeGame();
            }
            // Кнопка "Выход"
            if (this.isPointInButton(x, y, 150, 420, 200, 50)) {
                this.endGame();
            }
        } else if (this.gameState === 'gameOver') {
            // Кнопка "Играть снова"
            if (this.isPointInButton(x, y, 150, 450, 200, 50)) {
                this.resetGame();
            }
            // Кнопка "Выход"
            if (this.isPointInButton(x, y, 150, 520, 200, 50)) {
                this.closeGame();
            }
        }
    }

    isPointInButton(x, y, bx, by, bw, bh) {
        return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
    }

    startGame() {
        this.gameState = 'playing';
        this.gameRunning = true;
        this.score = 0;
        this.timeLeft = 60;
        this.tamaTokens = [];
        this.bombs = [];
        this.powerUps = [];
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 20;
        
        this.gameLoop();
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.timerInterval);
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    resumeGame() {
        this.gameState = 'playing';
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.gameState = 'gameOver';
        this.gameRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Награждаем TAMA за игру ИЗ TREASURY
        const earnedTAMA = this.calculateTAMAReward();
        
        if (earnedTAMA > 0 && window.SimpleTAMASystem && window.WalletManager && window.WalletManager.publicKey) {
            window.SimpleTAMASystem.addTAMAFromTreasury(
                window.WalletManager.publicKey.toString(),
                earnedTAMA,
                `TAMA Catch Game: ${this.score} points, Level ${this.level}, Max Combo ${this.maxCombo}`
            ).then(() => {
                console.log(`✅ ${earnedTAMA} TAMA awarded from Treasury for TAMA Catch game`);
            }).catch(error => {
                console.error('Error awarding TAMA:', error);
            });
        }
        
        this.showGameOver(earnedTAMA);
    }

    calculateTAMAReward() {
        // Более сложная формула награды
        let baseReward = Math.floor(this.score / 10); // 1 TAMA за 10 очков
        let levelBonus = this.level * 2; // Бонус за уровень
        let comboBonus = Math.floor(this.maxCombo / 5); // Бонус за комбо
        let timeBonus = Math.floor((60 - this.timeLeft) / 10); // Бонус за время
        
        let totalReward = baseReward + levelBonus + comboBonus + timeBonus;
        
        // Максимум 100 TAMA за игру
        return Math.min(totalReward, 100);
    }

    showGameOver(earnedTAMA) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎮 ИГРА ОКОНЧЕНА!', this.canvas.width / 2, 80);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Очки: ${this.score}`, this.canvas.width / 2, 130);
        this.ctx.fillText(`Уровень: ${this.level}`, this.canvas.width / 2, 160);
        this.ctx.fillText(`Макс. комбо: ${this.maxCombo}`, this.canvas.width / 2, 190);
        
        if (earnedTAMA > 0) {
            this.ctx.fillStyle = '#00FF00';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(`💰 Заработано: ${earnedTAMA} TAMA!`, this.canvas.width / 2, 240);
        }
        
        // Кнопки
        this.drawButton(150, 450, 200, 50, '#4ECDC4', '🎮 Играть снова');
        this.drawButton(150, 520, 200, 50, '#FF6B6B', '❌ Выход');
    }

    showMenu() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎮 TAMA CATCH', this.canvas.width / 2, 100);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Ловите падающие TAMA токены!', this.canvas.width / 2, 140);
        this.ctx.fillText('Избегайте бомб!', this.canvas.width / 2, 170);
        this.ctx.fillText('Собирайте бонусы!', this.canvas.width / 2, 200);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Управление:', this.canvas.width / 2, 250);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Мышь/Тач - движение', this.canvas.width / 2, 280);
        this.ctx.fillText('Пробел - пауза', this.canvas.width / 2, 300);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Награды:', this.canvas.width / 2, 340);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('1 TAMA за 10 очков + бонусы', this.canvas.width / 2, 370);
        
        // Кнопка "Начать игру"
        this.drawButton(150, 400, 200, 50, '#4ECDC4', '🚀 Начать игру');
    }

    showPause() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⏸️ ПАУЗА', this.canvas.width / 2, 200);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Очки: ${this.score}`, this.canvas.width / 2, 250);
        this.ctx.fillText(`Время: ${this.timeLeft}с`, this.canvas.width / 2, 280);
        this.ctx.fillText(`Уровень: ${this.level}`, this.canvas.width / 2, 310);
        
        // Кнопки
        this.drawButton(150, 350, 200, 50, '#4ECDC4', '▶️ Продолжить');
        this.drawButton(150, 420, 200, 50, '#FF6B6B', '❌ Выход');
    }

    drawBackground() {
        // Градиентный фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        if (this.gameState === 'playing') {
            this.update();
            this.draw();
        } else if (this.gameState === 'paused') {
            this.showPause();
        }
        
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Обновляем уровень
        this.level = Math.floor(this.score / 100) + 1;
        
        // Увеличиваем сложность с уровнем
        this.spawnRate = Math.max(300, 800 - (this.level * 50));
        this.gravity = Math.min(5, 2.5 + (this.level * 0.2));
        
        // Спавн объектов
        const now = Date.now();
        if (now - this.lastSpawn > this.spawnRate) {
            this.spawnObject();
            this.lastSpawn = now;
        }
        
        // Обновляем TAMA токены
        this.tamaTokens = this.tamaTokens.filter(token => {
            token.y += this.gravity;
            return token.y < this.canvas.height;
        });
        
        // Обновляем бомбы
        this.bombs = this.bombs.filter(bomb => {
            bomb.y += this.gravity * 1.2;
            return bomb.y < this.canvas.height;
        });
        
        // Обновляем бонусы
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += this.gravity * 0.8;
            return powerUp.y < this.canvas.height;
        });
        
        // Проверяем коллизии
        this.checkCollisions();
        
        // Управление клавиатурой
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.speed;
        }
    }

    spawnObject() {
        const rand = Math.random();
        
        if (rand < 0.6) {
            // TAMA токен (60% вероятность)
            this.tamaTokens.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                value: Math.floor(Math.random() * 3) + 1, // 1-3 очка
                type: 'tama'
            });
        } else if (rand < 0.8) {
            // Бомба (20% вероятность)
            this.bombs.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                type: 'bomb'
            });
        } else {
            // Бонус (20% вероятность)
            this.powerUps.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                type: Math.random() < 0.5 ? 'multiplier' : 'time',
                value: Math.random() < 0.5 ? 2 : 10 // x2 множитель или +10 секунд
            });
        }
    }

    checkCollisions() {
        // Проверяем коллизии с TAMA токенами
        this.tamaTokens.forEach((token, index) => {
            if (this.isColliding(this.player, token)) {
                this.score += token.value;
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                this.tamaTokens.splice(index, 1);
            }
        });
        
        // Проверяем коллизии с бомбами
        this.bombs.forEach((bomb, index) => {
            if (this.isColliding(this.player, bomb)) {
                this.combo = 0; // Сбрасываем комбо
                this.timeLeft = Math.max(0, this.timeLeft - 5); // -5 секунд
                this.bombs.splice(index, 1);
            }
        });
        
        // Проверяем коллизии с бонусами
        this.powerUps.forEach((powerUp, index) => {
            if (this.isColliding(this.player, powerUp)) {
                if (powerUp.type === 'multiplier') {
                    this.score += 10; // Бонус за множитель
                } else if (powerUp.type === 'time') {
                    this.timeLeft += powerUp.value; // +10 секунд
                }
                this.powerUps.splice(index, 1);
            }
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
        // Рисуем TAMA токены
        this.tamaTokens.forEach(token => {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(token.x, token.y, token.width, token.height);
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('💰', token.x + token.width/2, token.y + token.height/2 + 5);
        });
        
        // Рисуем бомбы
        this.bombs.forEach(bomb => {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('💣', bomb.x + bomb.width/2, bomb.y + bomb.height/2 + 5);
        });
        
        // Рисуем бонусы
        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = powerUp.type === 'multiplier' ? '#00FF00' : '#00BFFF';
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(powerUp.type === 'multiplier' ? '⚡' : '⏰', powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2 + 5);
        });
        
        // Рисуем игрока
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🐾', this.player.x + this.player.width/2, this.player.y + this.player.height/2 + 7);
        
        // Рисуем UI
        this.drawUI();
    }

    drawUI() {
        // Фон для UI
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, 60);
        
        // Очки
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Очки: ${this.score}`, 10, 25);
        
        // Время
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillText(`Время: ${this.timeLeft}с`, 10, 50);
        
        // Уровень
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Уровень: ${this.level}`, this.canvas.width - 10, 25);
        
        // Комбо
        this.ctx.fillStyle = '#FF00FF';
        this.ctx.fillText(`Комбо: ${this.combo}`, this.canvas.width - 10, 50);
        
        // Кнопка паузы
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(this.canvas.width - 60, 5, 50, 20);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⏸️', this.canvas.width - 35, 18);
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
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x + width / 2, y + height / 2 + 5);
    }

    resetGame() {
        this.gameState = 'menu';
        this.showMenu();
    }

    closeGame() {
        this.gameRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Удаляем модальное окно
        const modal = document.getElementById('tama-catch-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }

    getCanvas() {
        return this.canvas;
    }

    show() {
        // Создаем модальное окно для игры
        const modal = document.createElement('div');
        modal.id = 'tama-catch-modal';
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
            this.closeGame();
        });

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(this.canvas);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Показываем меню
        this.gameState = 'menu';
        this.showMenu();
    }
}

// Экспортируем класс
window.TAMACatchGameV2 = TAMACatchGameV2;
