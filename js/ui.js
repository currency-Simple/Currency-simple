// ============================================
// UI SYSTEM (FINAL WORKING VERSION)
// ============================================

class UISystem {
    constructor() {
        this.currentPanel = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplays();
        console.log('✅ UI System initialized');
    }

    setupEventListeners() {
        // أزرار التنقل السفلية
        const ballsBtn = document.getElementById('balls-btn');
        const roadsBtn = document.getElementById('roads-btn');
        const statsBtn = document.getElementById('stats-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');

        if (ballsBtn) {
            ballsBtn.addEventListener('click', () => {
                this.openPanel('balls-panel');
                if (window.ballsSystem && ballsSystem.renderPanel) {
                    ballsSystem.renderPanel();
                }
            });
        }

        if (roadsBtn) {
            roadsBtn.addEventListener('click', () => {
                this.openPanel('roads-panel');
                if (window.roadsSystem && roadsSystem.renderPanel) {
                    roadsSystem.renderPanel();
                }
            });
        }

        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                this.openPanel('stats-panel');
                if (window.statsSystem && statsSystem.renderPanel) {
                    statsSystem.renderPanel();
                }
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openPanel('settings-panel');
                if (window.settingsSystem && settingsSystem.renderPanel) {
                    settingsSystem.renderPanel();
                }
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (typeof startGame === 'function') {
                    startGame();
                }
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (typeof togglePause === 'function') {
                    togglePause();
                }
            });
        }
    }

    openPanel(panelId) {
        if (this.currentPanel) {
            this.closePanel(this.currentPanel);
        }

        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.add('active');
            this.currentPanel = panelId;
        }
    }

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove('active');
            if (this.currentPanel === panelId) {
                this.currentPanel = null;
            }
        }
    }

    updateScoreDisplay(score) {
        const scoreEl = document.querySelector('.score-number');
        if (scoreEl) {
            scoreEl.textContent = score;
        }
    }

    updateCoinsDisplay() {
        const coinsValueEl = document.getElementById('coins-value');
        const menuCoinsEl = document.getElementById('menu-coins-value');
        
        if (coinsValueEl) {
            coinsValueEl.textContent = '0';
        }
        
        if (menuCoinsEl) {
            menuCoinsEl.textContent = '0';
        }
    }

    showMenu() {
        const menuScreen = document.getElementById('menu-screen');
        const gameoverScreen = document.getElementById('gameover-screen');
        const pauseScreen = document.getElementById('pause-screen');
        const scoreDisplay = document.getElementById('score-display');
        const gameControls = document.getElementById('game-controls');
        const bottomNav = document.getElementById('bottom-nav');

        if (menuScreen) menuScreen.classList.add('active');
        if (gameoverScreen) gameoverScreen.classList.remove('active');
        if (pauseScreen) pauseScreen.classList.remove('active');
        if (scoreDisplay) scoreDisplay.classList.remove('active');
        if (gameControls) gameControls.classList.remove('active');
        if (bottomNav) bottomNav.style.display = 'flex';
    }

    showGameplay() {
        const menuScreen = document.getElementById('menu-screen');
        const gameoverScreen = document.getElementById('gameover-screen');
        const pauseScreen = document.getElementById('pause-screen');
        const scoreDisplay = document.getElementById('score-display');
        const gameControls = document.getElementById('game-controls');
        const bottomNav = document.getElementById('bottom-nav');

        if (menuScreen) menuScreen.classList.remove('active');
        if (gameoverScreen) gameoverScreen.classList.remove('active');
        if (pauseScreen) pauseScreen.classList.remove('active');
        if (scoreDisplay) scoreDisplay.classList.add('active');
        if (gameControls) gameControls.classList.add('active');
        if (bottomNav) bottomNav.style.display = 'none';
        
        this.closeAllPanels();
    }

    showGameOver(score, coinsEarned) {
        const finalScoreEl = document.getElementById('final-score-value');
        const coinsEarnedEl = document.getElementById('coins-earned-value');
        const bestScoreEl = document.getElementById('best-score-value');
        const gameoverScreen = document.getElementById('gameover-screen');
        const scoreDisplay = document.getElementById('score-display');
        const gameControls = document.getElementById('game-controls');
        const bottomNav = document.getElementById('bottom-nav');

        if (finalScoreEl) finalScoreEl.textContent = score;
        if (coinsEarnedEl) coinsEarnedEl.textContent = coinsEarned;
        if (bestScoreEl) bestScoreEl.textContent = '0';

        setTimeout(() => {
            if (gameoverScreen) gameoverScreen.classList.add('active');
            if (scoreDisplay) scoreDisplay.classList.remove('active');
            if (gameControls) gameControls.classList.remove('active');
            if (bottomNav) bottomNav.style.display = 'flex';
        }, 500);
    }

    showPause() {
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) {
            pauseScreen.classList.add('active');
        }
    }

    hidePause() {
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) {
            pauseScreen.classList.remove('active');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    updateSpeedDisplay(speedMultiplier) {
        const speedPercent = Math.round(speedMultiplier * 100);
        console.log('Speed:', speedPercent + '%');
    }

    updateHighScoreDisplay() {
        const highScoreEl = document.getElementById('high-score-value');
        if (highScoreEl) {
            highScoreEl.textContent = '0';
        }
    }

    updateDisplays() {
        this.updateHighScoreDisplay();
        this.updateCoinsDisplay();
    }

    closeAllPanels() {
        document.querySelectorAll('.side-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        this.currentPanel = null;
    }
}

// إنشاء وتصدير النظام
window.uiSystem = new UISystem();

// وظائف مساعدة عامة
function openPanel(panelId) {
    if (window.uiSystem) {
        uiSystem.openPanel(panelId);
    }
}

function closePanel(panelId) {
    if (window.uiSystem) {
        uiSystem.closePanel(panelId);
    }
}

// إخفاء شاشة التحميل عند تحميل الصفحة
window.addEventListener('load', function() {
    setTimeout(function() {
        if (window.uiSystem && uiSystem.hideLoadingScreen) {
            uiSystem.hideLoadingScreen();
        }
    }, 1000);
});
