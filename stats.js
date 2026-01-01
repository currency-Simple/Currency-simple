// ============================================
// SPEEDBALL 3D - STATISTICS MANAGER
// ============================================

class StatsManager {
    constructor() {
        this.stats = {
            totalGames: 0,
            highestScore: 0,
            totalTriangles: 0,
            totalScore: 0,
            totalPlaytime: 0, // seconds
            averageSpeed: 300,
            gamesWon: 0,
            gamesLost: 0,
            perfectRuns: 0, // Games with no missed triangles
            comboRecord: 0,
            longestStreak: 0
        };
        this.load();
    }

    addGame(score, triangles, duration = 0) {
        this.stats.totalGames++;
        this.stats.totalScore += score;
        this.stats.totalTriangles += triangles;
        this.stats.totalPlaytime += duration;

        if (score > this.stats.highestScore) {
            this.stats.highestScore = score;
        }

        this.save();
    }

    updateSpeed(speed) {
        // Calculate running average
        const totalSpeed = this.stats.averageSpeed * this.stats.totalGames + speed;
        this.stats.averageSpeed = Math.floor(totalSpeed / (this.stats.totalGames + 1));
    }

    recordCombo(combo) {
        if (combo > this.stats.comboRecord) {
            this.stats.comboRecord = combo;
            this.save();
        }
    }

    recordStreak(streak) {
        if (streak > this.stats.longestStreak) {
            this.stats.longestStreak = streak;
            this.save();
        }
    }

    recordPerfectRun() {
        this.stats.perfectRuns++;
        this.save();
    }

    getStats() {
        return { ...this.stats };
    }

    getFormattedStats() {
        const hours = Math.floor(this.stats.totalPlaytime / 3600);
        const minutes = Math.floor((this.stats.totalPlaytime % 3600) / 60);
        const seconds = this.stats.totalPlaytime % 60;

        return {
            totalGames: this.stats.totalGames.toLocaleString(),
            highestScore: this.stats.highestScore.toLocaleString(),
            totalTriangles: this.stats.totalTriangles.toLocaleString(),
            totalScore: this.stats.totalScore.toLocaleString(),
            playtime: `${hours}h ${minutes}m ${seconds}s`,
            avgSpeed: `${this.stats.averageSpeed}%`,
            avgScore: this.stats.totalGames > 0 ? 
                     Math.floor(this.stats.totalScore / this.stats.totalGames).toLocaleString() : 0,
            avgTriangles: this.stats.totalGames > 0 ?
                         Math.floor(this.stats.totalTriangles / this.stats.totalGames).toLocaleString() : 0,
            perfectRuns: this.stats.perfectRuns,
            comboRecord: this.stats.comboRecord,
            longestStreak: this.stats.longestStreak
        };
    }

    getLeaderboardData() {
        return {
            rank: 1, // Would be from server
            score: this.stats.highestScore,
            percentile: 95, // Would be from server
            nearbyPlayers: [] // Would be from server
        };
    }

    save() {
        try {
            localStorage.setItem('speedballStats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Failed to save stats:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('speedballStats');
            if (saved) {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load stats:', e);
        }
    }

    reset() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone!')) {
            this.stats = {
                totalGames: 0,
                highestScore: 0,
                totalTriangles: 0,
                totalScore: 0,
                totalPlaytime: 0,
                averageSpeed: 300,
                gamesWon: 0,
                gamesLost: 0,
                perfectRuns: 0,
                comboRecord: 0,
                longestStreak: 0
            };
            this.save();
            return true;
        }
        return false;
    }

    export() {
        return JSON.stringify(this.stats, null, 2);
    }

    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.stats = { ...this.stats, ...imported };
            this.save();
            return true;
        } catch (e) {
            console.error('Failed to import stats:', e);
            return false;
        }
    }
}

// Stats Display Functions
function updateStatsDisplay() {
    if (!game || !game.statsManager) return;

    const formatted = game.statsManager.getFormattedStats();

    document.getElementById('totalGames').textContent = formatted.totalGames;
    document.getElementById('highestScore').textContent = formatted.highestScore;
    document.getElementById('totalTriangles').textContent = formatted.totalTriangles;
    document.getElementById('avgSpeed').textContent = formatted.avgSpeed;

    // Additional stats if elements exist
    const avgScoreEl = document.getElementById('avgScore');
    const avgTrianglesEl = document.getElementById('avgTriangles');
    const playtimeEl = document.getElementById('playtime');
    const perfectRunsEl = document.getElementById('perfectRuns');

    if (avgScoreEl) avgScoreEl.textContent = formatted.avgScore;
    if (avgTrianglesEl) avgTrianglesEl.textContent = formatted.avgTriangles;
    if (playtimeEl) playtimeEl.textContent = formatted.playtime;
    if (perfectRunsEl) perfectRunsEl.textContent = formatted.perfectRuns;
}

function resetStats() {
    if (game && game.statsManager) {
        if (game.statsManager.reset()) {
            updateStatsDisplay();
            alert('Statistics have been reset!');
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StatsManager, updateStatsDisplay, resetStats };
}                 ${this.createStatCard('⚡', 'أقصى سرعة', (this.stats.fastestSpeed * 100).toFixed(0) + '%')}
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