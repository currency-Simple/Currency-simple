// ============================================
// UI SYSTEM (نظام واجهة المستخدم)
// ============================================

class UISystem {
    constructor() {
        this.currentPanel = null;
        this.setupEventListeners();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // أزرار التنقل السفلية
        document.getElementById('balls-btn').addEventListener('click', () => {
            this.openPanel('balls-panel');
            ballsSystem.renderPanel();
        });

        document.getElementById('roads-btn').addEventListener('click', () => {
            this.openPanel('roads-panel');
            roadsSystem.renderPanel();
        });

        document.getElementById('stats-btn').addEventListener('click', () => {
            this.openPanel('stats-panel');
            statsSystem.renderPanel();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openPanel('settings-panel');
            settingsSystem.renderPanel();
        });

        // زر اللعب
        document.getElementById('play-btn').addEventListener('click', () => {
            if (typeof gameState !== 'undefined') {
                if (gameState.isPlaying) {
                    togglePause();
                } else {
                    startGame();
                }
            }
        });

        // زر الإيقاف المؤقت
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (typeof togglePause === 'function') {
                    togglePause();
                }
            });
        }

        // النقر على الشاشة لإعادة المحاولة
        document.getElementById('gameover-screen').addEventListener('click', (e) => {
            if (e.target.id === 'gameover-screen' || e.target.closest('.gameover-content')) {
                // يمكن إضافة زر إعادة المحاولة هنا
            }
        });
    }

    // فتح لوحة جانبية
    openPanel(panelId) {
        // إغلاق اللوحة الحالية
        if (this.currentPanel) {
            document.getElementById(this.currentPanel).classList.remove('active');
        }

        // فتح اللوحة الجديدة
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.add('active');
            this.currentPanel = panelId;
        }
    }

    // إغلاق لوحة
    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove('active');
            if (this.currentPanel === panelId) {
                this.currentPanel = null;
            }
        }
    }

    // إغلاق جميع اللوحات
    closeAllPanels() {
        document.querySelectorAll('.side-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        this.currentPanel = null;
    }

    // تحديث عرض النقاط
    updateScoreDisplay(score) {
        const scoreEl = document.querySelector('.score-number');
        if (scoreEl) {
            scoreEl.textContent = score;
        }
    }

    // تحديث عرض العملات
    updateCoinsDisplay(coins) {
        const coinsEl = document.getElementById('coins-value');
        const menuCoinsEl = document.getElementById('menu-coins-value');
        
        if (coinsEl) coinsEl.textContent = coins;
        if (menuCoinsEl) menuCoinsEl.textContent = coinsSystem.getTotalCoins();
    }

    // عرض شاشة القائمة
    showMenu() {
        document.getElementById('menu-screen').classList.add('active');
        document.getElementById('gameover-screen').classList.remove('active');
        document.getElementById('pause-screen').classList.remove('active');
        document.getElementById('score-display').classList.remove('active');
        document.getElementById('game-controls').classList.remove('active');
        document.getElementById('bottom-nav').style.display = 'flex';
    }

    // عرض شاشة اللعب
    showGameplay() {
        document.getElementById('menu-screen').classList.remove('active');
        document.getElementById('gameover-screen').classList.remove('active');
        document.getElementById('pause-screen').classList.remove('active');
        document.getElementById('score-display').classList.add('active');
        document.getElementById('game-controls').classList.add('active');
        document.getElementById('bottom-nav').style.display = 'none';
        this.closeAllPanels();
    }

    // عرض شاشة نهاية اللعبة
    showGameOver(score, coinsEarned) {
        document.getElementById('final-score-value').textContent = score;
        document.getElementById('coins-earned-value').textContent = coinsEarned;
        document.getElementById('best-score-value').textContent = statsSystem.stats.highestScore;
        
        setTimeout(() => {
            document.getElementById('gameover-screen').classList.add('active');
            document.getElementById('score-display').classList.remove('active');
            document.getElementById('game-controls').classList.remove('active');
            document.getElementById('bottom-nav').style.display = 'flex';
        }, 500);
    }

    // عرض شاشة الإيقاف المؤقت
    showPause() {
        document.getElementById('pause-screen').classList.add('active');
    }

    // إخفاء شاشة الإيقاف المؤقت
    hidePause() {
        document.getElementById('pause-screen').classList.remove('active');
    }

    // إخفاء شاشة التحميل
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 500);
    }

    // عرض إشعار
    showNotification(message, type = 'info') {
        // يمكن تحسين هذا لاحقاً بإضافة نظام إشعارات جميل
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    // تحديث عرض السرعة
    updateSpeedDisplay(speedMultiplier) {
        const speedValue = document.getElementById('speed-value');
        if (speedValue && settingsSystem.get('speedDisplay')) {
            const speedPercent = Math.round(speedMultiplier * 100);
            speedValue.textContent = speedPercent + '%';
            
            // تغيير اللون حسب السرعة
            if (speedPercent >= 150) {
                speedValue.style.color = '#ff3366';
            } else if (speedPercent >= 125) {
                speedValue.style.color = '#ffaa00';
            } else {
                speedValue.style.color = '#00ff88';
            }
        }
    }

    // تحديث النقاط العالية في القائمة
    updateHighScoreDisplay() {
        const highScoreEl = document.getElementById('high-score-value');
        if (highScoreEl) {
            highScoreEl.textContent = statsSystem.stats.highestScore;
        }
    }
}

// إنشاء نسخة عامة
const uiSystem = new UISystem();

// وظائف عامة للوصول السريع
function openPanel(panelId) {
    uiSystem.openPanel(panelId);
}

function closePanel(panelId) {
    uiSystem.closePanel(panelId);
}

// تحديث العروض عند تحميل الصفحة
window.addEventListener('load', () => {
    coinsSystem.updateDisplay();
    uiSystem.updateHighScoreDisplay();
});