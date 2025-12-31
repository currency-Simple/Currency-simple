// ============================================
// UI SYSTEM (نظام واجهة المستخدم - كامل)
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

        // النقر على شاشة نهاية اللعبة لإعادة المحاولة
        document.getElementById('gameover-screen').addEventListener('click', (e) => {
            if (e.target.id === 'gameover-screen' || e.target.closest('.gameover-content')) {
                // يمكن إضافة زر إعادة المحاولة هنا
            }
        });

        // إضافة زر تبديل مسار الطريق
        this.addRoadPreviewToggle();
    }

    // إضافة زر تبديل مسار الطريق
    addRoadPreviewToggle() {
        const controls = document.getElementById('game-controls');
        if (controls && !document.getElementById('road-preview-btn')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'road-preview-btn';
            toggleBtn.className = 'control-btn';
            toggleBtn.innerHTML = '<span class="btn-icon">🛣️</span>';
            toggleBtn.title = 'إظهار/إخفاء مسار الطريق المستقبلي';
            toggleBtn.addEventListener('click', () => {
                if (typeof toggleRoadPreview === 'function') {
                    const isVisible = toggleRoadPreview();
                    toggleBtn.querySelector('.btn-icon').textContent = isVisible ? '🛣️' : '🚫';
                    
                    // إشعار بسيط
                    this.showNotification(isVisible ? 'مسار الطريق: مرئي' : 'مسار الطريق: مخفي', 'info');
                }
            });
            controls.appendChild(toggleBtn);
        }
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
            
            // إخفاء اللوحة بعد 30 ثانية من عدم التفاعل
            setTimeout(() => {
                if (this.currentPanel === panelId) {
                    this.closePanel(panelId);
                }
            }, 30000);
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
            
            // تأثير عند تغيير النقاط
            scoreEl.style.transform = 'scale(1.2)';
            setTimeout(() => {
                scoreEl.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // تحديث عرض العملات
    updateCoinsDisplay(coins) {
        const coinsEl = document.getElementById('coins-value');
        const menuCoinsEl = document.getElementById('menu-coins-value');
        
        if (coinsEl) {
            coinsEl.textContent = coins;
            
            // تأثير عند جمع عملات
            if (parseInt(coinsEl.textContent) < coins) {
                coinsEl.style.color = '#ffd700';
                setTimeout(() => {
                    coinsEl.style.color = '';
                }, 500);
            }
        }
        
        if (menuCoinsEl) {
            menuCoinsEl.textContent = coinsSystem.getTotalCoins();
        }
    }

    // عرض شاشة القائمة
    showMenu() {
        document.getElementById('menu-screen').classList.add('active');
        document.getElementById('gameover-screen').classList.remove('active');
        document.getElementById('pause-screen').classList.remove('active');
        document.getElementById('score-display').classList.remove('active');
        document.getElementById('game-controls').classList.remove('active');
        document.getElementById('bottom-nav').style.display = 'flex';
        
        // تحديث الإحصائيات في القائمة
        this.updateHighScoreDisplay();
        this.updateCoinsDisplay(coinsSystem.getTotalCoins());
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
        
        // إظهار زر مسار الطريق
        const previewBtn = document.getElementById('road-preview-btn');
        if (previewBtn) {
            previewBtn.style.display = 'block';
        }
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
            
            // إخفاء زر مسار الطريق
            const previewBtn = document.getElementById('road-preview-btn');
            if (previewBtn) {
                previewBtn.style.display = 'none';
            }
            
            // تأثيرات
            document.querySelector('.gameover-title').style.animation = 'bounce 0.5s';
            setTimeout(() => {
                document.querySelector('.gameover-title').style.animation = '';
            }, 500);
        }, 500);
    }

    // عرض شاشة الإيقاف المؤقت
    showPause() {
        document.getElementById('pause-screen').classList.add('active');
        
        // إخفاء زر مسار الطريق مؤقتاً
        const previewBtn = document.getElementById('road-preview-btn');
        if (previewBtn) {
            previewBtn.style.opacity = '0.5';
        }
    }

    // إخفاء شاشة الإيقاف المؤقت
    hidePause() {
        document.getElementById('pause-screen').classList.remove('active');
        
        // إعادة إظهار زر مسار الطريق
        const previewBtn = document.getElementById('road-preview-btn');
        if (previewBtn) {
            previewBtn.style.opacity = '1';
        }
    }

    // إخفاء شاشة التحميل
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 500);
    }

    // عرض إشعار
    showNotification(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'info' ? 'ℹ️' : type === 'success' ? '✅' : '⚠️'}</span>
            <span class="notification-text">${message}</span>
        `;
        
        // إضافة الأنماط
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            padding: 12px 24px;
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 9999;
            opacity: 0;
            transition: all 0.3s ease;
            white-space: nowrap;
        `;
        
        document.body.appendChild(notification);
        
        // عرض
