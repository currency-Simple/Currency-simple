// ============================================
// STATISTICS SYSTEM (نظام الإحصائيات)
// ============================================

class StatsSystem {
    constructor() {
        this.stats = {
            totalGames: 0,
            totalScore: 0,
            highestScore: 0,
            totalObstaclesPassed: 0,
            totalCoinsCollected: 0,
            totalDistance: 0,
            totalPlayTime: 0, // بالثواني
            gamesWon: 0,
            gamesLost: 0,
            fastestSpeed: 0,
            longestStreak: 0,
            currentStreak: 0,
            achievements: []
        };
        
        this.currentGameStart = null;
        this.load();
    }

    // بدء لعبة جديدة
    startGame() {
        this.currentGameStart = Date.now();
        this.stats.totalGames++;
    }

    // إنهاء لعبة
    endGame(score, obstaclesPassed, coinsCollected, maxSpeed) {
        if (this.currentGameStart) {
            const playTime = Math.floor((Date.now() - this.currentGameStart) / 1000);
            this.stats.totalPlayTime += playTime;
            this.currentGameStart = null;
        }

        this.stats.totalScore += score;
        this.stats.totalObstaclesPassed += obstaclesPassed;
        this.stats.totalCoinsCollected += coinsCollected;
        this.stats.totalDistance += obstaclesPassed * 5; // تقريبي

        if (score > this.stats.highestScore) {
            this.stats.highestScore = score;
        }

        if (maxSpeed > this.stats.fastestSpeed) {
            this.stats.fastestSpeed = maxSpeed;
        }

        // الانتصارات (مثلاً النقاط أكثر من 100)
        if (score >= 100) {
            this.stats.gamesWon++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.longestStreak) {
                this.stats.longestStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.gamesLost++;
            this.stats.currentStreak = 0;
        }

        this.checkAchievements();
        this.save();
    }

    // التحقق من الإنجازات
    checkAchievements() {
        const achievements = [
            { id: 'first_game', name: 'اللعبة الأولى', condition: () => this.stats.totalGames >= 1 },
            { id: 'score_100', name: '100 نقطة', condition: () => this.stats.highestScore >= 100 },
            { id: 'score_500', name: '500 نقطة', condition: () => this.stats.highestScore >= 500 },
            { id: 'score_1000', name: '1000 نقطة', condition: () => this.stats.highestScore >= 1000 },
            { id: 'coins_100', name: 'جامع العملات', condition: () => this.stats.totalCoinsCollected >= 100 },
            { id: 'games_10', name: '10 ألعاب', condition: () => this.stats.totalGames >= 10 },
            { id: 'games_50', name: '50 لعبة', condition: () => this.stats.totalGames >= 50 },
            { id: 'games_100', name: '100 لعبة', condition: () => this.stats.totalGames >= 100 },
            { id: 'streak_5', name: 'سلسلة 5', condition: () => this.stats.longestStreak >= 5 },
            { id: 'speed_master', name: 'سيد السرعة', condition: () => this.stats.fastestSpeed >= 2.0 }
        ];

        achievements.forEach(achievement => {
            if (!this.stats.achievements.includes(achievement.id) && achievement.condition()) {
                this.stats.achievements.push(achievement.id);
                this.showAchievementNotification(achievement.name);
            }
        });
    }

    // عرض إشعار الإنجاز
    showAchievementNotification(name) {
        // يمكن تحسين هذا لاحقاً
        console.log(`🏆 إنجاز جديد: ${name}`);
    }

    // الحصول على متوسط النقاط
    getAverageScore() {
        return this.stats.totalGames > 0 
            ? Math.floor(this.stats.totalScore / this.stats.totalGames) 
            : 0;
    }

    // الحصول على نسبة الفوز
    getWinRate() {
        return this.stats.totalGames > 0 
            ? Math.floor((this.stats.gamesWon / this.stats.totalGames) * 100) 
            : 0;
    }

    // تنسيق وقت اللعب
    getFormattedPlayTime() {
        const hours = Math.floor(this.stats.totalPlayTime / 3600);
        const minutes = Math.floor((this.stats.totalPlayTime % 3600) / 60);
        const seconds = this.stats.totalPlayTime % 60;
        
        if (hours > 0) {
            return `${hours}س ${minutes}د`;
        } else if (minutes > 0) {
            return `${minutes}د ${seconds}ث`;
        } else {
            return `${seconds}ث`;
        }
    }

    // عرض الواجهة
    renderPanel() {
        const panel = document.getElementById('stats-panel');
        if (!panel) return;
        
        panel.innerHTML = `
            <div class="panel-header">
                <h3>📊 الإحصائيات</h3>
                <button class="close-panel" onclick="closePanel('stats-panel')">✕</button>
            </div>
            <div class="panel-content">
                <div class="stats-grid">
                    ${this.createStatCard('🎮', 'إجمالي الألعاب', this.stats.totalGames)}
                    ${this.createStatCard('🏆', 'أعلى نقاط', this.stats.highestScore)}
                    ${this.createStatCard('📈', 'متوسط النقاط', this.getAverageScore())}
                    ${this.createStatCard('💰', 'إجمالي العملات', this.stats.totalCoinsCollected)}
                    ${this.createStatCard('🎯', 'المثلثات المتجاوزة', this.stats.totalObstaclesPassed)}
                    ${this.createStatCard('📏', 'المسافة (م)', this.stats.totalDistance)}
                    ${this.createStatCard('⏱️', 'وقت اللعب', this.getFormattedPlayTime())}
                    ${this.createStatCard('⚡', 'أقصى سرعة', (this.stats.fastestSpeed * 100).toFixed(0) + '%')}
                    ${this.createStatCard('✅', 'انتصارات', this.stats.gamesWon)}
                    ${this.createStatCard('❌', 'خسائر', this.stats.gamesLost)}
                    ${this.createStatCard('📊', 'نسبة الفوز', this.getWinRate() + '%')}
                    ${this.createStatCard('🔥', 'أطول سلسلة', this.stats.longestStreak)}
                </div>

                <div class="achievements-section">
                    <h4>🏅 الإنجازات (${this.stats.achievements.length}/10)</h4>
                    <div class="achievements-list">
                        ${this.renderAchievements()}
                    </div>
                </div>

                <div class="setting-section">
                    <button class="reset-btn" id="reset-stats-btn">
                        🔄 إعادة تعيين الإحصائيات
                    </button>
                </div>
            </div>
        `;

        // إضافة مستمع للزر
        const resetBtn = document.getElementById('reset-stats-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('هل تريد إعادة تعيين جميع الإحصائيات؟')) {
                    this.reset();
                    this.renderPanel();
                    alert('تم إعادة تعيين الإحصائيات! ✅');
                }
            });
        }
    }

    // إنشاء بطاقة إحصائية
    createStatCard(icon, label, value) {
        return `
            <div class="stat-card">
                <div class="stat-icon">${icon}</div>
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
            </div>
        `;
    }

    // عرض الإنجازات
    renderAchievements() {
        const allAchievements = [
            { id: 'first_game', name: 'اللعبة الأولى', icon: '🎮' },
            { id: 'score_100', name: '100 نقطة', icon: '🥉' },
            { id: 'score_500', name: '500 نقطة', icon: '🥈' },
            { id: 'score_1000', name: '1000 نقطة', icon: '🥇' },
            { id: 'coins_100', name: 'جامع العملات', icon: '💰' },
            { id: 'games_10', name: '10 ألعاب', icon: '🎯' },
            { id: 'games_50', name: '50 لعبة', icon: '🎪' },
            { id: 'games_100', name: '100 لعبة', icon: '🎭' },
            { id: 'streak_5', name: 'سلسلة 5', icon: '🔥' },
            { id: 'speed_master', name: 'سيد السرعة', icon: '⚡' }
        ];

        return allAchievements.map(achievement => {
            const unlocked = this.stats.achievements.includes(achievement.id);
            return `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <span class="achievement-name">${achievement.name}</span>
                    ${unlocked ? '<span class="achievement-check">✓</span>' : '<span class="achievement-lock">🔒</span>'}
                </div>
            `;
        }).join('');
    }

    // إعادة تعيين الإحصائيات
    reset() {
        this.stats = {
            totalGames: 0,
            totalScore: 0,
            highestScore: 0,
            totalObstaclesPassed: 0,
            totalCoinsCollected: 0,
            totalDistance: 0,
            totalPlayTime: 0,
            gamesWon: 0,
            gamesLost: 0,
            fastestSpeed: 0,
            longestStreak: 0,
            currentStreak: 0,
            achievements: []
        };
        this.save();
    }

    // حفظ البيانات
    save() {
        try {
            localStorage.setItem('rushStats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats');
        }
    }

    // تحميل البيانات
    load() {
        try {
            const saved = localStorage.getItem('rushStats');
            if (saved) {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load stats');
        }
    }
}

// إنشاء نسخة عامة
const statsSystem = new StatsSystem();
