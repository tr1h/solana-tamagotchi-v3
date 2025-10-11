/**
 * TAMA CATCH - Mini Game
 * Лови падающие TAMA токены и зарабатывай очки!
 */

class TAMACatchGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.score = 0;
        this.timeLeft = 30;
        this.tamaTokens = [];
        this.player = { x: 0, y: 0, width: 60, height: 60 };
        this.keys = {};
        this.lastSpawn = 0;
        this.spawnRate = 1000; // 1 секунда
        this.gravity = 2;
        this.speed = 3;
        
        this.init();
    }

    init() {
        // Создаем canvas для игры
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 500;
        this.canvas.style.cssText = `
            border: 3px solid #FFD700;
            border-radius: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: block;
            margin: 20px auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Управление клавиатурой
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Управление мышью/тач
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.x = e.clientX - rect.left - this.player.width / 2;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.player.x = touch.clientX - rect.left - this.player.width / 2;
        });
    }

    start() {
        this.gameRunning = true;
        this.score = 0;
        this.timeLeft = 30;
        this.tamaTokens = [];
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

    endGame() {
        this.gameRunning = false;
        clearInterval(this.timerInterval);
        
        // Награждаем TAMA за игру (БОЛЬШЕ TAMA!)
        const earnedTAMA = Math.floor(this.score / 5); // 1 TAMA за 5 очков (в 2 раза больше!)
        
        if (earnedTAMA > 0 && window.TAMAModule) {
            window.TAMAModule.earnTAMA(earnedTAMA, 'minigame', `TAMA Catch: ${this.score} points`);
        }
        
        this.showGameOver(earnedTAMA);
    }

    showGameOver(earnedTAMA) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎮 GAME OVER! 🎮', this.canvas.width / 2, 150);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, 200);
        this.ctx.fillText(`TAMA Earned: ${earnedTAMA}`, this.canvas.width / 2, 230);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click to play again!', this.canvas.width / 2, 280);
        
        // Добавляем обработчик клика для перезапуска
        this.canvas.onclick = () => {
            this.canvas.onclick = null;
            this.start();
        };
    }

    spawnTamaToken() {
        const now = Date.now();
        if (now - this.lastSpawn > this.spawnRate) {
            this.tamaTokens.push({
                x: Math.random() * (this.canvas.width - 40),
                y: -40,
                width: 40,
                height: 40,
                value: Math.random() > 0.8 ? 5 : 1, // 20% шанс на золотой токен
                speed: this.speed + Math.random() * 2,
                rotation: 0
            });
            this.lastSpawn = now;
        }
    }

    update() {
        if (!this.gameRunning) return;

        // Движение игрока
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= 5;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += 5;
        }

        // Ограничиваем игрока в пределах экрана
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));

        // Обновляем TAMA токены
        for (let i = this.tamaTokens.length - 1; i >= 0; i--) {
            const token = this.tamaTokens[i];
            token.y += token.speed;
            token.rotation += 0.1;

            // Проверяем столкновение с игроком
            if (this.checkCollision(this.player, token)) {
                this.score += token.value;
                this.tamaTokens.splice(i, 1);
                
                // Эффект сбора
                this.showCollectEffect(token.x, token.y, token.value);
            }
            // Удаляем токены, упавшие за экран
            else if (token.y > this.canvas.height) {
                this.tamaTokens.splice(i, 1);
            }
        }

        // Спавним новые токены
        this.spawnTamaToken();
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    showCollectEffect(x, y, value) {
        // Создаем временный элемент для эффекта
        const effect = document.createElement('div');
        effect.textContent = `+${value}`;
        effect.style.cssText = `
            position: fixed;
            left: ${x + this.canvas.offsetLeft}px;
            top: ${y + this.canvas.offsetTop}px;
            color: #FFD700;
            font-weight: bold;
            font-size: 20px;
            pointer-events: none;
            z-index: 1000;
            animation: tamaCollect 1s ease-out forwards;
        `;
        
        // Добавляем CSS анимацию
        if (!document.getElementById('tama-collect-animation')) {
            const style = document.createElement('style');
            style.id = 'tama-collect-animation';
            style.textContent = `
                @keyframes tamaCollect {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-50px) scale(1.5); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 1000);
    }

    render() {
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем игрока (корзину)
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);
        
        // Рисуем ручки корзины
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(-this.player.width / 2, -this.player.height / 2, 10, 0, Math.PI);
        this.ctx.arc(this.player.width / 2, -this.player.height / 2, 10, 0, Math.PI);
        this.ctx.stroke();
        this.ctx.restore();

        // Рисуем TAMA токены
        this.tamaTokens.forEach(token => {
            this.ctx.save();
            this.ctx.translate(token.x + token.width / 2, token.y + token.height / 2);
            this.ctx.rotate(token.rotation);
            
            // Цвет токена зависит от значения
            if (token.value === 5) {
                this.ctx.fillStyle = '#FFD700'; // Золотой
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 10;
            } else {
                this.ctx.fillStyle = '#FF6B6B'; // Красный
            }
            
            this.ctx.fillRect(-token.width / 2, -token.height / 2, token.width, token.height);
            
            // Рисуем символ TAMA
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('T', 0, 5);
            this.ctx.restore();
        });

        // Рисуем UI
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 80);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 35);
        this.ctx.fillText(`Time: ${this.timeLeft}s`, 20, 55);
        this.ctx.fillText('Use ← → or mouse', 20, 75);

        // Рисуем инструкции
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, this.canvas.height - 40, this.canvas.width - 20, 30);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Catch TAMA tokens! Red = 1 point, Gold = 5 points', this.canvas.width / 2, this.canvas.height - 20);
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    show() {
        // Показываем игру в модальном окне
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 20px;
            text-align: center;
            max-width: 500px;
        `;

        const title = document.createElement('h2');
        title.textContent = '🎮 TAMA CATCH 🎮';
        title.style.cssText = 'color: #FFD700; margin-bottom: 20px;';

        const instructions = document.createElement('p');
        instructions.innerHTML = `
            <strong>How to play:</strong><br>
            • Move with ← → keys or mouse<br>
            • Catch falling TAMA tokens<br>
            • Red tokens = 1 point<br>
            • Gold tokens = 5 points<br>
            • Earn TAMA: 1 TAMA per 5 points!<br>
            • <span style="color: #00ff00; font-weight: bold;">UNLIMITED TAMA! 🚀</span>
        `;
        instructions.style.cssText = 'margin-bottom: 20px; color: #333;';

        const startBtn = document.createElement('button');
        startBtn.textContent = '🚀 START GAME';
        startBtn.style.cssText = `
            background: #FFD700;
            color: #000;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            margin-bottom: 20px;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '❌ Close';
        closeBtn.style.cssText = `
            background: #e74c3c;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        `;

        startBtn.onclick = () => {
            content.removeChild(title);
            content.removeChild(instructions);
            content.removeChild(startBtn);
            content.removeChild(closeBtn);
            content.appendChild(this.canvas);
            this.start();
        };

        closeBtn.onclick = () => {
            modal.remove();
        };

        content.appendChild(title);
        content.appendChild(instructions);
        content.appendChild(startBtn);
        content.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
}

// Инициализируем игру
window.TAMACatchGame = TAMACatchGame;
