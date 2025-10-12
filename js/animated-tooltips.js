// ============================================
// 🎨 ANIMATED TOOLTIPS SYSTEM
// ============================================

const AnimatedTooltips = {
    
    // Конфигурация
    CONFIG: {
        DEFAULT_DELAY: 500,        // Задержка перед показом (мс)
        DEFAULT_DURATION: 300,     // Длительность анимации (мс)
        MAX_WIDTH: 300,            // Максимальная ширина тултипа
        Z_INDEX: 10000,            // Z-index для тултипов
        OFFSET: 10                 // Отступ от элемента
    },
    
    // Стили анимаций
    ANIMATIONS: {
        fadeIn: {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
        },
        slideUp: {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
        },
        slideDown: {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
        },
        scaleIn: {
            from: { opacity: 0, transform: 'scale(0.8)' },
            to: { opacity: 1, transform: 'scale(1)' }
        },
        bounce: {
            from: { opacity: 0, transform: 'scale(0.3)' },
            to: { opacity: 1, transform: 'scale(1)' },
            keyframes: [
                { offset: 0, transform: 'scale(0.3)', opacity: 0 },
                { offset: 0.5, transform: 'scale(1.1)', opacity: 1 },
                { offset: 0.7, transform: 'scale(0.9)', opacity: 1 },
                { offset: 1, transform: 'scale(1)', opacity: 1 }
            ]
        },
        pulse: {
            from: { opacity: 0, transform: 'scale(1)' },
            to: { opacity: 1, transform: 'scale(1)' },
            keyframes: [
                { offset: 0, opacity: 0, transform: 'scale(1)' },
                { offset: 0.5, opacity: 1, transform: 'scale(1.05)' },
                { offset: 1, opacity: 1, transform: 'scale(1)' }
            ]
        }
    },
    
    // Активные тултипы
    activeTooltips: new Map(),
    
    // Инициализация
    init() {
        console.log('🎨 Animated Tooltips System initialized (DISABLED)');
        // this.setupGlobalStyles(); // ОТКЛЮЧЕНО - слишком много подсказок
        // this.setupEventListeners(); // ОТКЛЮЧЕНО - слишком много подсказок
    },
    
    // Настройка глобальных стилей
    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .animated-tooltip {
                position: absolute;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: #fff;
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                max-width: ${this.CONFIG.MAX_WIDTH}px;
                word-wrap: break-word;
                z-index: ${this.CONFIG.Z_INDEX};
                pointer-events: none;
                opacity: 0;
                transform: translateY(10px);
                transition: all ${this.CONFIG.DEFAULT_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .animated-tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .animated-tooltip::before {
                content: '';
                position: absolute;
                width: 0;
                height: 0;
                border: 6px solid transparent;
            }
            
            .animated-tooltip.top::before {
                bottom: -12px;
                left: 50%;
                transform: translateX(-50%);
                border-top-color: #1a1a2e;
            }
            
            .animated-tooltip.bottom::before {
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                border-bottom-color: #1a1a2e;
            }
            
            .animated-tooltip.left::before {
                right: -12px;
                top: 50%;
                transform: translateY(-50%);
                border-left-color: #1a1a2e;
            }
            
            .animated-tooltip.right::before {
                left: -12px;
                top: 50%;
                transform: translateY(-50%);
                border-right-color: #1a1a2e;
            }
            
            /* Анимации */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes bounceIn {
                0% {
                    opacity: 0;
                    transform: scale(0.3);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.1);
                }
                70% {
                    transform: scale(0.9);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes pulseIn {
                0% {
                    opacity: 0;
                    transform: scale(1);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.05);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* Специальные стили для разных типов */
            .animated-tooltip.success {
                background: linear-gradient(135deg, #2d5a27, #1e3a1a);
                border-color: rgba(76, 175, 80, 0.3);
            }
            
            .animated-tooltip.error {
                background: linear-gradient(135deg, #5a2727, #3a1a1a);
                border-color: rgba(244, 67, 54, 0.3);
            }
            
            .animated-tooltip.warning {
                background: linear-gradient(135deg, #5a4a27, #3a2e1a);
                border-color: rgba(255, 193, 7, 0.3);
            }
            
            .animated-tooltip.info {
                background: linear-gradient(135deg, #274a5a, #1a2e3a);
                border-color: rgba(33, 150, 243, 0.3);
            }
        `;
        document.head.appendChild(style);
    },
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.updateAllTooltips();
        });
        
        // Обработка скролла
        window.addEventListener('scroll', () => {
            this.updateAllTooltips();
        });
    },
    
    // Показать тултип
    show(element, text, options = {}) {
        const config = {
            delay: options.delay || this.CONFIG.DEFAULT_DELAY,
            duration: options.duration || this.CONFIG.DEFAULT_DURATION,
            position: options.position || 'top',
            animation: options.animation || 'fadeIn',
            type: options.type || 'default',
            html: options.html || false,
            ...options
        };
        
        // Удаляем существующий тултип для этого элемента
        this.hide(element);
        
        // Создаем новый тултип
        const tooltip = document.createElement('div');
        tooltip.className = `animated-tooltip ${config.position} ${config.type}`;
        
        if (config.html) {
            tooltip.innerHTML = text;
        } else {
            tooltip.textContent = text;
        }
        
        // Добавляем в DOM
        document.body.appendChild(tooltip);
        
        // Позиционируем
        this.positionTooltip(tooltip, element, config.position);
        
        // Применяем анимацию
        this.applyAnimation(tooltip, config.animation, config.duration);
        
        // Сохраняем ссылку
        this.activeTooltips.set(element, {
            tooltip,
            config,
            timeout: null
        });
        
        // Показываем с задержкой
        if (config.delay > 0) {
            const timeout = setTimeout(() => {
                tooltip.classList.add('show');
            }, config.delay);
            
            this.activeTooltips.get(element).timeout = timeout;
        } else {
            tooltip.classList.add('show');
        }
        
        return tooltip;
    },
    
    // Скрыть тултип
    hide(element) {
        const tooltipData = this.activeTooltips.get(element);
        if (tooltipData) {
            // Очищаем таймаут
            if (tooltipData.timeout) {
                clearTimeout(tooltipData.timeout);
            }
            
            // Анимация исчезновения
            tooltipData.tooltip.classList.remove('show');
            
            // Удаляем из DOM через время анимации
            setTimeout(() => {
                if (tooltipData.tooltip.parentNode) {
                    tooltipData.tooltip.parentNode.removeChild(tooltipData.tooltip);
                }
            }, tooltipData.config.duration);
            
            // Удаляем из активных
            this.activeTooltips.delete(element);
        }
    },
    
    // Позиционирование тултипа
    positionTooltip(tooltip, element, position) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        let left, top;
        
        switch (position) {
            case 'top':
                left = elementRect.left + scrollX + (elementRect.width / 2) - (tooltipRect.width / 2);
                top = elementRect.top + scrollY - tooltipRect.height - this.CONFIG.OFFSET;
                break;
            case 'bottom':
                left = elementRect.left + scrollX + (elementRect.width / 2) - (tooltipRect.width / 2);
                top = elementRect.bottom + scrollY + this.CONFIG.OFFSET;
                break;
            case 'left':
                left = elementRect.left + scrollX - tooltipRect.width - this.CONFIG.OFFSET;
                top = elementRect.top + scrollY + (elementRect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                left = elementRect.right + scrollX + this.CONFIG.OFFSET;
                top = elementRect.top + scrollY + (elementRect.height / 2) - (tooltipRect.height / 2);
                break;
        }
        
        // Проверяем границы экрана
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Горизонтальная коррекция
        if (left < 0) {
            left = 10;
        } else if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        // Вертикальная коррекция
        if (top < 0) {
            top = 10;
        } else if (top + tooltipRect.height > viewportHeight) {
            top = viewportHeight - tooltipRect.height - 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    },
    
    // Применение анимации
    applyAnimation(tooltip, animationName, duration) {
        const animation = this.ANIMATIONS[animationName];
        if (!animation) return;
        
        if (animation.keyframes) {
            // Создаем keyframes анимацию
            const keyframes = animation.keyframes.map(kf => ({
                ...kf,
                offset: kf.offset
            }));
            
            tooltip.animate(keyframes, {
                duration: duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });
        } else {
            // Применяем CSS анимацию
            tooltip.style.animation = `${animationName} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`;
        }
    },
    
    // Обновить все тултипы
    updateAllTooltips() {
        this.activeTooltips.forEach((tooltipData, element) => {
            this.positionTooltip(tooltipData.tooltip, element, tooltipData.config.position);
        });
    },
    
    // Утилиты для быстрого создания тултипов
    success(element, text, options = {}) {
        return this.show(element, text, { ...options, type: 'success', animation: 'bounce' });
    },
    
    error(element, text, options = {}) {
        return this.show(element, text, { ...options, type: 'error', animation: 'pulse' });
    },
    
    warning(element, text, options = {}) {
        return this.show(element, text, { ...options, type: 'warning', animation: 'scaleIn' });
    },
    
    info(element, text, options = {}) {
        return this.show(element, text, { ...options, type: 'info', animation: 'slideUp' });
    },
    
    // Автоматические тултипы для элементов с data-tooltip
    setupAutoTooltips() {
        document.addEventListener('mouseenter', (e) => {
            const element = e.target;
            if (element && element.getAttribute) {
                const tooltipText = element.getAttribute('data-tooltip');
                
                if (tooltipText) {
                    const position = element.getAttribute('data-tooltip-position') || 'top';
                    const animation = element.getAttribute('data-tooltip-animation') || 'fadeIn';
                    const type = element.getAttribute('data-tooltip-type') || 'default';
                    
                    this.show(element, tooltipText, { position, animation, type });
                }
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            const element = e.target;
            if (element && element.getAttribute && element.getAttribute('data-tooltip')) {
                this.hide(element);
            }
        }, true);
    },
    
    // Очистить все тултипы
    clearAll() {
        this.activeTooltips.forEach((tooltipData, element) => {
            this.hide(element);
        });
    }
};

// Экспорт
window.AnimatedTooltips = AnimatedTooltips;

// Автоинициализация
document.addEventListener('DOMContentLoaded', () => {
    AnimatedTooltips.init();
    // AnimatedTooltips.setupAutoTooltips(); // ОТКЛЮЧЕНО - слишком много подсказок
});

console.log('🎨 Animated Tooltips System loaded');
