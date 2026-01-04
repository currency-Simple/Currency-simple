// ui.js - إدارة واجهة المستخدم
class UI {
    constructor(game) {
        this.game = game;
        this.setupButtons();
        this.setupModals();
        this.setupSettings();
    }

    setupButtons() {
        // زر الإعدادات
        const settingsBtn = document.getElementById('btn-settings');
        settingsBtn.addEventListener('click', () => {
            this.openModal('settings');
        });

        // زر الكرات
        const ballsBtn = document.getElementById('btn-balls');
        ballsBtn.addEventListener('click', () => {
            this.openModal('balls');
        });

        // زر الطرقات
        const roadsBtn = document.getElementById('btn-roads');
        roadsBtn.addEventListener('click', () => {
            this.openModal('roads');
        });

        // زر البدء
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            this.game.start();
        });

        // زر إعادة اللعب
        const restartBtn = document.getElementById('restart-btn');
        restartBtn.addEventListener('click', () => {
            this.game.reset();
        });

        // زر إعادة تشغيل اللعبة من الإعدادات
        const resetBtn = document.getElementById('reset-game');
        resetBtn.addEventListener('click', () => {
            this.closeAllModals();
            this.game.reset();
        });
    }

    setupModals() {
        // أزرار الإغلاق
        const closeBtns = document.querySelectorAll('.close-btn');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalName = e.target.getAttribute('data-modal');
                this.closeModal(modalName);
            });
        });

        // الإغلاق عند النقر خارج النافذة
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // خيارات الكرات
        const ballOptions = document.querySelectorAll('.ball-option');
        ballOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const color = option.getAttribute('data-color');
                this.game.changeBallColor(color);
                
                // تحديد الخيار المختار
                ballOptions.forEach(opt => opt.style.borderColor = 'transparent');
                option.style.borderColor = '#ff0066';
                
                this.closeModal('balls');
            });
        });

        // خيارات الطرقات
        const roadOptions = document.querySelectorAll('.road-option');
        roadOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const type = option.getAttribute('data-type');
                this.game.changeRoadType(type);
                
                // تحديد الخيار المختار
                roadOptions.forEach(opt => opt.style.borderColor = 'transparent');
                option.style.borderColor = '#ff0066';
                
                this.closeModal('roads');
            });
        });
    }

    setupSettings() {
        // شريط السرعة
        const speedSlider = document.getElementById('initial-speed');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', (e) => {
            const speed = e.target.value;
            speedValue.textContent = speed + '%';
            this.game.setSpeed(parseInt(speed));
        });

        // مفتاح الصوت
        const soundToggle = document.getElementById('sound-toggle');
        soundToggle.addEventListener('change', (e) => {
            // يمكن إضافة وظيفة الصوت هنا لاحقاً
            console.log('Sound:', e.target.checked);
        });
    }

    openModal(modalName) {
        const modal = document.getElementById(modalName + '-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalName) {
        const modal = document.getElementById(modalName + '-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    updateScore(score) {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }

    updateSpeed(speed) {
        const speedElement = document.getElementById('speed');
        if (speedElement) {
            speedElement.textContent = speed + '%';
        }
    }

    showGameOver(score) {
        document.getElementById('final-score').textContent = score;
        document.getElementById('game-over-screen').style.display = 'flex';
    }

    hideGameOver() {
        document.getElementById('game-over-screen').style.display = 'none';
    }

    showStartScreen() {
        document.getElementById('start-screen').style.display = 'flex';
    }

    hideStartScreen() {
        document.getElementById('start-screen').style.display = 'none';
    }
}      opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Global toast instance
const toast = new ToastManager();

// Score Animation
function animateScore(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = (newValue - currentValue) / 20;
    let current = currentValue;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= newValue) || 
            (increment < 0 && current <= newValue)) {
            current = newValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 50);
}

// Progress Bar
class ProgressBar {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            color: config.color || '#00ffff',
            backgroundColor: config.backgroundColor || 'rgba(255, 255, 255, 0.1)',
            height: config.height || '6px',
            borderRadius: config.borderRadius || '3px'
        };
        this.create();
    }

    create() {
        this.bar = document.createElement('div');
        this.bar.style.cssText = `
            width: 100%;
            height: ${this.config.height};
            background: ${this.config.backgroundColor};
            border-radius: ${this.config.borderRadius};
            overflow: hidden;
        `;

        this.fill = document.createElement('div');
        this.fill.style.cssText = `
            width: 0%;
            height: 100%;
            background: ${this.config.color};
            transition: width 0.3s ease;
            box-shadow: 0 0 10px ${this.config.color};
        `;

        this.bar.appendChild(this.fill);
        this.container.appendChild(this.bar);
    }

    setProgress(percent) {
        this.fill.style.width = Math.min(100, Math.max(0, percent)) + '%';
    }

    setColor(color) {
        this.fill.style.background = color;
        this.fill.style.boxShadow = `0 0 10px ${color}`;
    }
}

// Screen Shake Effect
function screenShake(intensity = 10, duration = 200) {
    if (!CONFIG.UI.SCREEN_SHAKE) return;

    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const originalTransform = canvas.style.transform;
    const startTime = Date.now();

    function shake() {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            canvas.style.transform = originalTransform;
            return;
        }

        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);

        const x = (Math.random() - 0.5) * currentIntensity;
        const y = (Math.random() - 0.5) * currentIntensity;

        canvas.style.transform = `translate(${x}px, ${y}px)`;

        requestAnimationFrame(shake);
    }

    shake();
}

// Combo Display
class ComboDisplay {
    constructor() {
        this.element = this.create();
        this.currentCombo = 0;
        this.timer = null;
    }

    create() {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            font-weight: bold;
            color: #00ffff;
            text-shadow: 0 0 20px #00ffff;
            opacity: 0;
            pointer-events: none;
            z-index: 50;
            transition: opacity 0.3s ease, transform 0.3s ease;
        `;
        document.body.appendChild(div);
        return div;
    }

    show(combo) {
        this.currentCombo = combo;
        this.element.textContent = `${combo}x COMBO!`;
        this.element.style.opacity = '1';
        this.element.style.transform = 'translate(-50%, -50%) scale(1.2)';

        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.hide();
        }, 1500);
    }

    hide() {
        this.element.style.opacity = '0';
        this.element.style.transform = 'translate(-50%, -50%) scale(1)';
    }
}

// Initialize UI components
let comboDisplay;
window.addEventListener('DOMContentLoaded', () => {
    comboDisplay = new ComboDisplay();
});

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        populateSphereGrid,
        populateRoadList,
        ToastManager,
        ProgressBar,
        ComboDisplay,
        screenShake,
        animateScore,
        formatNumber,
        formatTime
    };
}