// ==================== GAME-UI.JS - واجهة المستخدم أثناء اللعب ====================

// ==================== تحديث إحصائيات اللعبة ====================
class GameUI {
    constructor() {
        this.elements = {
            score: document.getElementById('score'),
            highScore: document.getElementById('highScore'),
            lives: document.getElementById('lives'),
            speed: document.getElementById('speed')
        };
        
        this.lastScore = 0;
        this.animationQueue = [];
    }
    
    // ==================== تحديث النتيجة ====================
    updateScore(score) {
        if (!this.elements.score) return;
        
        const scoreValue = Math.floor(score);
        
        // تحديث النص
        this.elements.score.textContent = StringUtils.formatNumber(scoreValue);
        
        // تأثير بصري عند زيادة النتيجة
        if (scoreValue > this.lastScore) {
            this.animateScoreIncrease();
            this.checkMilestones(scoreValue);
        }
        
        this.lastScore = scoreValue;
    }
    
    // ==================== تأثير زيادة النتيجة ====================
    animateScoreIncrease() {
        const element = this.elements.score;
        if (!element) return;
        
        element.style.transform = 'scale(1.2)';
        element.style.color = COLORS.UI.PRIMARY;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 200);
    }
    
    // ==================== فحص نقاط التحقق ====================
    checkMilestones(score) {
        MILESTONES.forEach(milestone => {
            if (score === milestone.score) {
                this.showMilestone(milestone.message);
                this.playMilestoneSound();
            }
        });
    }
    
    // ==================== عرض نقطة التحقق ====================
    showMilestone(message) {
        const milestoneEl = document.createElement('div');
        milestoneEl.className = 'milestone-message';
        milestoneEl.textContent = message;
        milestoneEl.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translateX(-50%) scale(0);
            background: linear-gradient(135deg, ${COLORS.UI.PRIMARY}, ${COLORS.UI.SECONDARY});
            color: #000;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 10px 40px rgba(0, 255, 136, 0.5);
            animation: milestonePopup 2s ease-in-out forwards;
        `;
        
        document.body.appendChild(milestoneEl);
        
        setTimeout(() => {
            milestoneEl.remove();
        }, 2000);
    }
    
    // ==================== تحديث أفضل نتيجة ====================
    updateHighScore(highScore) {
        if (!this.elements.highScore) return;
        
        this.elements.highScore.textContent = StringUtils.formatNumber(Math.floor(highScore));
        
        // تأثير خاص للرقم القياسي الجديد
        if (window.score > highScore - 1) {
            this.showNewHighScore();
        }
    }
    
    // ==================== عرض رقم قياسي جديد ====================
    showNewHighScore() {
        const element = this.elements.highScore?.parentElement;
        if (!element) return;
        
        element.style.animation = 'pulse 1s infinite';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 3000);
    }
    
    // ==================== تحديث الأرواح ====================
    updateLives(lives) {
        if (!this.elements.lives) return;
        
        // عرض قلوب بدلاً من الأرقام
        let heartsHTML = '';
        for (let i = 0; i < GAME_CONFIG.MAX_LIVES; i++) {
            if (i < lives) {
                heartsHTML += '<i class="fas fa-heart" style="color: #ff4444;"></i> ';
            } else {
                heartsHTML += '<i class="far fa-heart" style="color: rgba(255, 68, 68, 0.3);"></i> ';
            }
        }
        
        this.elements.lives.innerHTML = heartsHTML;
        
        // تأثير عند فقدان حياة
        if (lives < GAME_CONFIG.INITIAL_LIVES) {
            this.animateLivesDecrease();
        }
    }
    
    // ==================== تأثير فقدان حياة ====================
    animateLivesDecrease() {
        const element = this.elements.lives?.parentElement;
        if (!element) return;
        
        AnimationUtils.shake(element, 10, 500);
        
        element.style.color = COLORS.UI.DANGER;
        setTimeout(() => {
            element.style.color = '';
        }, 500);
    }
    
    // ==================== تحديث السرعة ====================
    updateSpeed(speed) {
        if (!this.elements.speed) return;
        
        const speedValue = MathUtils.round(speed, 1);
        this.elements.speed.textContent = `${speedValue}x`;
        
        // تغيير اللون بناءً على السرعة
        if (speedValue >= 4) {
            this.elements.speed.style.color = COLORS.UI.DANGER;
        } else if (speedValue >= 2.5) {
            this.elements.speed.style.color = COLORS.UI.WARNING;
        } else {
            this.elements.speed.style.color = COLORS.UI.PRIMARY;
        }
    }
    
    // ==================== عرض رسالة ====================
    showMessage(message, duration = 2000, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `game-message game-message-${type}`;
        messageEl.textContent = message;
        
        const colors = {
            info: COLORS.UI.PRIMARY,
            warning: COLORS.UI.WARNING,
            danger: COLORS.UI.DANGER,
            success: COLORS.UI.PRIMARY
        };
        
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: ${colors[type] || colors.info};
            color: ${type === 'info' || type === 'success' ? '#000' : '#fff'};
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
            animation: messagePopup 0.3s ease-out forwards;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'messageFadeOut 0.3s ease-in forwards';
            setTimeout(() => messageEl.remove(), 300);
        }, duration);
    }
    
    // ==================== عرض شريط تقدم ====================
    showProgressBar(current, total, label = '') {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            z-index: 1000;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.cssText = `
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            overflow: hidden;
        `;
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        const percentage = (current / total) * 100;
        progressFill.style.cssText = `
            width: ${percentage}%;
            height: 100%;
            background: linear-gradient(90deg, ${COLORS.UI.PRIMARY}, ${COLORS.UI.SECONDARY});
            transition: width 0.3s ease;
        `;
        
        const progressLabel = document.createElement('div');
        progressLabel.textContent = label || `${Math.floor(percentage)}%`;
        progressLabel.style.cssText = `
            text-align: center;
            margin-top: 5px;
            font-size: 14px;
            color: #fff;
        `;
        
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressLabel);
        document.body.appendChild(progressContainer);
        
        return progressContainer;
    }
    
    // ==================== عرض نصائح ====================
    showTip(tip) {
        const tipEl = document.createElement('div');
        tipEl.className = 'game-tip';
        tipEl.innerHTML = `<i class="fas fa-lightbulb"></i> ${tip}`;
        tipEl.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: ${COLORS.UI.PRIMARY};
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            border: 2px solid ${COLORS.UI.PRIMARY};
            animation: tipSlideUp 0.5s ease-out;
        `;
        
        document.body.appendChild(tipEl);
        
        setTimeout(() => {
            tipEl.style.animation = 'tipSlideDown 0.5s ease-in forwards';
            setTimeout(() => tipEl.remove(), 500);
        }, 4000);
    }
    
    // ==================== عرض كومبو ====================
    showCombo(count) {
        const comboEl = document.createElement('div');
        comboEl.className = 'combo-indicator';
        comboEl.innerHTML = `
            <div style="font-size: 48px; font-weight: bold;">x${count}</div>
            <div style="font-size: 20px;">COMBO!</div>
        `;
        comboEl.style.cssText = `
            position: fixed;
            top: 40%;
            right: 50px;
            background: linear-gradient(135deg, ${COLORS.UI.WARNING}, ${COLORS.UI.DANGER});
            color: #fff;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            z-index: 1000;
            box-shadow: 0 0 30px ${COLORS.UI.WARNING};
            animation: comboScale 0.5s ease-out;
        `;
        
        document.body.appendChild(comboEl);
        
        setTimeout(() => {
            comboEl.remove();
        }, 1000);
    }
    
    // ==================== صوت نقطة التحقق ====================
    playMilestoneSound() {
        if (!window.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = AUDIO.FREQUENCIES.SCORE_MILESTONE;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('⚠️ Audio not supported:', error);
        }
    }
    
    // ==================== تحديث كل العناصر ====================
    updateAll(gameData) {
        this.updateScore(gameData.score || 0);
        this.updateHighScore(gameData.highScore || 0);
        this.updateLives(gameData.lives || 0);
        this.updateSpeed(gameData.speed || 1);
    }
}

// ==================== إضافة أنيميشن CSS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes milestonePopup {
        0% { transform: translateX(-50%) scale(0); }
        50% { transform: translateX(-50%) scale(1.2); }
        100% { transform: translateX(-50%) scale(1); }
    }
    
    @keyframes messagePopup {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    @keyframes messageFadeOut {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    
    @keyframes tipSlideUp {
        from { transform: translateX(-50%) translateY(50px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes tipSlideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(50px); opacity: 0; }
    }
    
    @keyframes comboScale {
        0% { transform: scale(0) rotate(-10deg); }
        50% { transform: scale(1.2) rotate(5deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
`;
document.head.appendChild(style);

// ==================== إنشاء نسخة عامة ====================
window.gameUI = new GameUI();

// ==================== تصدير ====================
window.GameUI = GameUI;

console.log('✅ Game-ui.js loaded successfully');
