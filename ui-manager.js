// ==================== UI-MANAGER.JS - إدارة واجهة المستخدم ====================

class UIManager {
    constructor() {
        this.screens = {
            menu: document.getElementById('menuScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            instructions: document.getElementById('instructionsScreen'),
            leaderboard: document.getElementById('leaderboardScreen'),
            loading: document.getElementById('loadingScreen')
        };
        
        this.buttons = {
            pause: document.getElementById('pauseBtn'),
            sound: document.getElementById('soundBtn')
        };
        
        this.currentScreen = 'menu';
        this.previousScreen = null;
    }
    
    // ==================== عرض شاشة ====================
    showScreen(screenName, hideOthers = true) {
        if (!this.screens[screenName]) {
            console.warn(`⚠️ Screen '${screenName}' not found`);
            return false;
        }
        
        // إخفاء جميع الشاشات الأخرى
        if (hideOthers) {
            Object.keys(this.screens).forEach(key => {
                if (this.screens[key] && key !== screenName) {
                    this.screens[key].classList.add('hidden');
                }
            });
        }
        
        // عرض الشاشة المطلوبة
        this.screens[screenName].classList.remove('hidden');
        
        this.previousScreen = this.currentScreen;
        this.currentScreen = screenName;
        
        console.log(`📺 Showing screen: ${screenName}`);
        
        // تنفيذ إجراءات خاصة بالشاشة
        this.onScreenShow(screenName);
        
        return true;
    }
    
    // ==================== إخفاء شاشة ====================
    hideScreen(screenName) {
        if (!this.screens[screenName]) return false;
        
        this.screens[screenName].classList.add('hidden');
        return true;
    }
    
    // ==================== التبديل بين شاشتين ====================
    switchScreen(from, to) {
        this.hideScreen(from);
        this.showScreen(to, false);
    }
    
    // ==================== العودة للشاشة السابقة ====================
    goBack() {
        if (this.previousScreen) {
            this.showScreen(this.previousScreen);
        }
    }
    
    // ==================== إجراءات عند عرض الشاشة ====================
    onScreenShow(screenName) {
        switch(screenName) {
            case 'menu':
                this.onMenuShow();
                break;
            case 'gameOver':
                this.onGameOverShow();
                break;
            case 'leaderboard':
                this.onLeaderboardShow();
                break;
            case 'instructions':
                this.onInstructionsShow();
                break;
        }
    }
    
    // ==================== عند عرض القائمة ====================
    onMenuShow() {
        // إخفاء زر الإيقاف
        if (this.buttons.pause) {
            this.buttons.pause.classList.add('hidden');
        }
        
        // تحديث أفضل نتيجة في القائمة
        this.updateMenuHighScore();
    }
    
    // ==================== عند عرض شاشة Game Over ====================
    onGameOverShow() {
        // تحديث النتائج النهائية
        const finalScore = document.getElementById('finalScore');
        const finalHighScore = document.getElementById('finalHighScore');
        
        if (finalScore) {
            finalScore.textContent = StringUtils.formatNumber(window.score || 0);
            
            // تأثير خاص للنتيجة
            AnimationUtils.fadeIn(finalScore.parentElement, 500);
        }
        
        if (finalHighScore) {
            finalHighScore.textContent = StringUtils.formatNumber(window.highScore || 0);
        }
        
        // إخفاء زر الإيقاف
        if (this.buttons.pause) {
            this.buttons.pause.classList.add('hidden');
        }
    }
    
    // ==================== عند عرض المتصدرين ====================
    onLeaderboardShow() {
        // تحميل المتصدرين
        if (window.leaderboardManager) {
            window.leaderboardManager.load();
        }
    }
    
    // ==================== عند عرض التعليمات ====================
    onInstructionsShow() {
        // يمكن إضافة رسوم متحركة توضيحية هنا
    }
    
    // ==================== تحديث أفضل نتيجة في القائمة ====================
    updateMenuHighScore() {
        const menuHighScore = document.querySelector('#menuScreen .high-score-display');
        if (menuHighScore && window.highScore) {
            menuHighScore.textContent = `أفضل نتيجة: ${StringUtils.formatNumber(window.highScore)}`;
        }
    }
    
    // ==================== تبديل حالة الإيقاف المؤقت ====================
    togglePauseButton(isPaused) {
        if (!this.buttons.pause) return;
        
        if (isPaused) {
            this.buttons.pause.innerHTML = '<i class="fas fa-play"></i>';
            this.buttons.pause.title = 'متابعة';
        } else {
            this.buttons.pause.innerHTML = '<i class="fas fa-pause"></i>';
            this.buttons.pause.title = 'إيقاف مؤقت';
        }
    }
    
    // ==================== تبديل حالة الصوت ====================
    toggleSoundButton(isEnabled) {
        if (!this.buttons.sound) return;
        
        if (isEnabled) {
            this.buttons.sound.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.buttons.sound.title = 'إيقاف الصوت';
        } else {
            this.buttons.sound.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.buttons.sound.title = 'تشغيل الصوت';
        }
    }
    
    // ==================== عرض نافذة منبثقة ====================
    showModal(title, content, buttons = []) {
        // إنشاء النافذة المنبثقة
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content-custom';
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #1e1e2e, #2d2d44);
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            border: 2px solid ${COLORS.UI.PRIMARY};
            box-shadow: 0 20px 60px rgba(0, 255, 136, 0.3);
            animation: scaleIn 0.3s ease-out;
        `;
        
        // العنوان
        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: ${COLORS.UI.PRIMARY};
            margin-bottom: 20px;
            font-size: 24px;
            text-align: center;
        `;
        modalContent.appendChild(titleEl);
        
        // المحتوى
        const contentEl = document.createElement('div');
        contentEl.innerHTML = content;
        contentEl.style.cssText = `
            color: #fff;
            margin-bottom: 20px;
            text-align: center;
            line-height: 1.6;
        `;
        modalContent.appendChild(contentEl);
        
        // الأزرار
        if (buttons.length > 0) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = `
                display: flex;
                gap: 10px;
                justify-content: center;
            `;
            
            buttons.forEach(btn => {
                const button = document.createElement('button');
                button.textContent = btn.text;
                button.className = `btn ${btn.type || 'btn-secondary'}`;
                button.onclick = () => {
                    modal.remove();
                    if (btn.onClick) btn.onClick();
                };
                buttonsContainer.appendChild(button);
            });
            
            modalContent.appendChild(buttonsContainer);
        }
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // إغلاق عند النقر على الخلفية
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }
    
    // ==================== عرض تنبيه ====================
    showAlert(message, type = 'info') {
        const colors = {
            info: COLORS.UI.PRIMARY,
            success: COLORS.UI.PRIMARY,
            warning: COLORS.UI.WARNING,
            error: COLORS.UI.DANGER
        };
        
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        
        const alert = document.createElement('div');
        alert.className = 'custom-alert';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: ${type === 'info' || type === 'success' ? '#000' : '#fff'};
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
            animation: slideInRight 0.3s ease-out;
        `;
        
        alert.innerHTML = `
            <i class="fas ${icons[type]}" style="font-size: 20px;"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
    
    // ==================== عرض تأكيد ====================
    showConfirm(message, onConfirm, onCancel) {
        return this.showModal(
            'تأكيد',
            `<p>${message}</p>`,
            [
                {
                    text: 'نعم',
                    type: 'btn-primary',
                    onClick: onConfirm
                },
                {
                    text: 'لا',
                    type: 'btn-secondary',
                    onClick: onCancel
                }
            ]
        );
    }
    
    // ==================== إضافة تلميح ====================
    addTooltip(element, text) {
        element.title = text;
        element.style.cursor = 'help';
    }
    
    // ==================== تحديث شريط التقدم ====================
    updateProgressBar(progressBarId, current, total) {
        const progressBar = document.getElementById(progressBarId);
        if (!progressBar) return;
        
        const percentage = (current / total) * 100;
        const fill = progressBar.querySelector('.progress-fill');
        
        if (fill) {
            fill.style.width = `${percentage}%`;
        }
    }
}

// ==================== إضافة أنيميشن CSS ====================
const uiStyles = document.createElement('style');
uiStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(uiStyles);

// ==================== إنشاء نسخة عامة ====================
const uiManager = new UIManager();

// ==================== تصدير ====================
window.UIManager = UIManager;
window.uiManager = uiManager;

console.log('✅ Ui-manager.js loaded successfully');
