// ============================================
// SPEEDBALL 3D - USER INTERFACE MANAGER
// ============================================

// Populate Sphere Selection Grid
function populateSphereGrid() {
    const grid = document.getElementById('sphereGrid');
    if (!grid) return;

    grid.innerHTML = '';

    BALL_TYPES.forEach(ball => {
        const option = document.createElement('div');
        option.className = 'sphere-option';
        option.style.background = ball.color === 'rainbow' 
            ? 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)'
            : ball.color;
        option.style.boxShadow = `0 0 20px ${ball.glowColor}`;

        // Check if selected
        if (game && game.ballManager.currentBall && 
            game.ballManager.currentBall.type.id === ball.id) {
            option.classList.add('selected');
        }

        // Check if unlocked
        if (!ball.unlocked) {
            option.style.filter = 'grayscale(100%) brightness(0.3)';
            option.style.cursor = 'not-allowed';
            option.title = `Locked: ${ball.unlockCondition}`;
        } else {
            option.addEventListener('click', () => {
                if (game && game.ballManager.selectBall(ball.id)) {
                    // Update selection
                    document.querySelectorAll('.sphere-option').forEach(el => {
                        el.classList.remove('selected');
                    });
                    option.classList.add('selected');
                }
            });
        }

        grid.appendChild(option);
    });
}

// Populate Road Pattern List
function populateRoadList() {
    const list = document.getElementById('roadList');
    if (!list) return;

    list.innerHTML = '';

    ROAD_PATTERNS.forEach(pattern => {
        const option = document.createElement('div');
        option.className = 'road-option';
        
        // Check if active
        if (game && game.roadManager.currentPattern && 
            game.roadManager.currentPattern.id === pattern.id) {
            option.classList.add('active');
        }

        option.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
                        ${pattern.name}
                    </div>
                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">
                        ${pattern.description} • ${pattern.difficulty}
                    </div>
                </div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${pattern.color}; 
                            box-shadow: 0 0 10px ${pattern.color};"></div>
            </div>
        `;

        option.addEventListener('click', () => {
            if (game) {
                game.roadManager.setPattern(pattern.id);
                // Update selection
                document.querySelectorAll('.road-option').forEach(el => {
                    el.classList.remove('active');
                });
                option.classList.add('active');
            }
        });

        list.appendChild(option);
    });
}

// Toast Notifications
class ToastManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            border-left: 4px solid ${this.getColor(type)};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
            pointer-events: all;
        `;
        toast.textContent = message;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                this.container.removeChild(toast);
            }, 300);
        }, duration);
    }

    getColor(type) {
        const colors = {
            info: '#00ffff',
            success: '#00ff00',
            warning: '#ffff00',
            error: '#ff0000'
        };
        return colors[type] || colors.info;
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
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
