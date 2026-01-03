// ==================== PROFILE.JS - إدارة ملف اللاعب ====================

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.userStats = {
            gamesPlayed: 0,
            totalScore: 0,
            highScore: 0,
            totalPlayTime: 0,
            achievements: [],
            lastPlayed: null
        };
        
        this.loadUserStats();
    }
    
    // ==================== تحميل إحصائيات المستخدم ====================
    loadUserStats() {
        const savedStats = LocalStorage.get(STORAGE_KEYS.STATS);
        if (savedStats) {
            this.userStats = { ...this.userStats, ...savedStats };
            console.log('✅ User stats loaded from localStorage');
        }
    }
    
    // ==================== حفظ إحصائيات المستخدم ====================
    saveUserStats() {
        LocalStorage.set(STORAGE_KEYS.STATS, this.userStats);
        console.log('💾 User stats saved');
    }
    
    // ==================== تحديث الإحصائيات بعد اللعبة ====================
    updateStatsAfterGame(score, playTime) {
        this.userStats.gamesPlayed++;
        this.userStats.totalScore += score;
        this.userStats.totalPlayTime += playTime;
        this.userStats.lastPlayed = new Date().toISOString();
        
        if (score > this.userStats.highScore) {
            this.userStats.highScore = score;
            this.onNewHighScore(score);
        }
        
        this.saveUserStats();
        this.checkAchievements();
        
        console.log('📊 Stats updated:', this.userStats);
    }
    
    // ==================== عند تحقيق رقم قياسي جديد ====================
    onNewHighScore(score) {
        console.log(`🎉 New high score: ${score}`);
        
        if (window.gameUI) {
            window.gameUI.showMessage(
                `🎉 ${MESSAGES.GAME.NEW_HIGH_SCORE} ${StringUtils.formatNumber(score)}`,
                3000,
                'success'
            );
        }
        
        // حفظ في Supabase إذا كان المستخدم مسجل دخول
        if (this.currentUser && window.saveScore) {
            window.saveScore(score);
        }
    }
    
    // ==================== فحص الإنجازات ====================
    checkAchievements() {
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            if (achievement.condition(this.userStats)) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    // ==================== فتح إنجاز ====================
    unlockAchievement(achievement) {
        // التحقق إذا كان الإنجاز محققاً بالفعل
        if (this.userStats.achievements.includes(achievement.id)) {
            return;
        }
        
        this.userStats.achievements.push(achievement.id);
        this.saveUserStats();
        
        console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        
        this.showAchievementNotification(achievement);
    }
    
    // ==================== عرض إشعار الإنجاز ====================
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 20px 30px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.5);
            animation: achievementSlide 4s ease-in-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px;">${achievement.icon}</div>
            <div>
                <div style="font-size: 20px; font-weight: bold;">إنجاز جديد!</div>
                <div style="font-size: 16px; margin-top: 5px;">${achievement.name}</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 3px;">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // صوت الإنجاز
        this.playAchievementSound();
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    // ==================== صوت الإنجاز ====================
    playAchievementSound() {
        if (!window.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // نغمة صاعدة
            [400, 500, 600, 800].forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = audioContext.currentTime + (index * 0.1);
                gainNode.gain.setValueAtTime(0.2, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.3);
            });
        } catch (error) {
            console.warn('⚠️ Audio not supported:', error);
        }
    }
    
    // ==================== الحصول على الإحصائيات ====================
    getStats() {
        return {
            ...this.userStats,
            averageScore: this.userStats.gamesPlayed > 0 
                ? Math.floor(this.userStats.totalScore / this.userStats.gamesPlayed) 
                : 0,
            averagePlayTime: this.userStats.gamesPlayed > 0
                ? Math.floor(this.userStats.totalPlayTime / this.userStats.gamesPlayed)
                : 0
        };
    }
    
    // ==================== عرض ملف اللاعب ====================
    showProfile() {
        const stats = this.getStats();
        const user = this.currentUser || { email: 'ضيف', user_metadata: { username: 'ضيف' } };
        
        const content = `
            <div style="text-align: right;">
                <h3 style="color: ${COLORS.UI.PRIMARY}; margin-bottom: 20px;">
                    <i class="fas fa-user-circle"></i> ${user.user_metadata?.username || user.email}
                </h3>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <h4 style="color: ${COLORS.UI.PRIMARY}; margin-bottom: 10px;">📊 الإحصائيات</h4>
                    <p>🎮 الألعاب: ${stats.gamesPlayed}</p>
                    <p>⭐ أفضل نتيجة: ${StringUtils.formatNumber(stats.highScore)}</p>
                    <p>📈 متوسط النتيجة: ${StringUtils.formatNumber(stats.averageScore)}</p>
                    <p>⏱️ وقت اللعب: ${TimeUtils.formatTime(stats.totalPlayTime)}</p>
                    ${stats.lastPlayed ? `<p>📅 آخر لعبة: ${TimeUtils.timeAgo(stats.lastPlayed)}</p>` : ''}
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                    <h4 style="color: ${COLORS.UI.PRIMARY}; margin-bottom: 10px;">🏆 الإنجازات (${stats.achievements.length})</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                        ${this.renderAchievements()}
                    </div>
                </div>
            </div>
        `;
        
        if (window.uiManager) {
            window.uiManager.showModal('ملف اللاعب', content, [
                { text: 'إغلاق', type: 'btn-secondary' }
            ]);
        }
    }
    
    // ==================== عرض الإنجازات ====================
    renderAchievements() {
        let html = '';
        
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            const unlocked = this.userStats.achievements.includes(achievement.id);
            
            html += `
                <div style="
                    background: ${unlocked ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
                    padding: 10px;
                    border-radius: 10px;
                    text-align: center;
                    min-width: 80px;
                    border: 2px solid ${unlocked ? COLORS.UI.PRIMARY : 'transparent'};
                    opacity: ${unlocked ? '1' : '0.5'};
                " title="${achievement.description}">
                    <div style="font-size: 32px; margin-bottom: 5px;">${achievement.icon}</div>
                    <div style="font-size: 10px;">${achievement.name}</div>
                </div>
            `;
        });
        
        return html || '<p style="opacity: 0.5;">لا توجد إنجازات بعد</p>';
    }
    
    // ==================== تعيين المستخدم الحالي ====================
    setCurrentUser(user) {
        this.currentUser = user;
        
        if (user) {
            console.log(`👤 Current user set: ${user.email}`);
            this.syncWithSupabase();
        }
    }
    
    // ==================== مزامنة مع Supabase ====================
    async syncWithSupabase() {
        if (!this.currentUser) return;
        
        try {
            const playerData = await loadPlayerData(this.currentUser.id);
            
            if (playerData && playerData.high_score > this.userStats.highScore) {
                this.userStats.highScore = playerData.high_score;
                window.highScore = playerData.high_score;
                this.saveUserStats();
                
                console.log('✅ Stats synced with Supabase');
            }
        } catch (error) {
            console.error('❌ Error syncing with Supabase:', error);
        }
    }
    
    // ==================== إعادة تعيين الإحصائيات ====================
    resetStats() {
        if (window.uiManager) {
            window.uiManager.showConfirm(
                'هل أنت متأكد من إعادة تعيين جميع الإحصائيات؟ لا يمكن التراجع عن هذا الإجراء!',
                () => {
                    this.userStats = {
                        gamesPlayed: 0,
                        totalScore: 0,
                        highScore: 0,
                        totalPlayTime: 0,
                        achievements: [],
                        lastPlayed: null
                    };
                    
                    this.saveUserStats();
                    console.log('🔄 Stats reset');
                    
                    if (window.uiManager) {
                        window.uiManager.showAlert('تم إعادة تعيين الإحصائيات', 'success');
                    }
                }
            );
        }
    }
    
    // ==================== تصدير الملف ====================
    exportProfile() {
        const profile = {
            user: this.currentUser?.email || 'Guest',
            stats: this.getStats(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(profile, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `speedball_profile_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ Profile exported');
    }
}

// ==================== إضافة أنيميشن CSS ====================
const profileStyles = document.createElement('style');
profileStyles.textContent = `
    @keyframes achievementSlide {
        0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
        10% { transform: translateX(-50%) translateY(0); opacity: 1; }
        90% { transform: translateX(-50%) translateY(0); opacity: 1; }
        100% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
    }
`;
document.head.appendChild(profileStyles);

// ==================== إنشاء نسخة عامة ====================
const profileManager = new ProfileManager();

// ==================== تصدير ====================
window.ProfileManager = ProfileManager;
window.profileManager = profileManager;

console.log('✅ Profile.js loaded successfully');
