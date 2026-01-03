// ==================== LEADERBOARD.JS - إدارة المتصدرين ====================

class LeaderboardManager {
    constructor() {
        this.leaderboardData = [];
        this.isLoading = false;
        this.lastUpdate = null;
        this.refreshInterval = null;
        this.container = document.getElementById('leaderboardList');
    }
    
    // ==================== تحميل المتصدرين ====================
    async load(forceRefresh = false) {
        // تجنب التحميل المتكرر
        if (this.isLoading) {
            console.log('⏳ Leaderboard already loading...');
            return this.leaderboardData;
        }
        
        // التحقق من الحاجة للتحديث
        if (!forceRefresh && this.lastUpdate) {
            const timeSinceUpdate = Date.now() - this.lastUpdate;
            if (timeSinceUpdate < LEADERBOARD.REFRESH_INTERVAL) {
                console.log('✅ Using cached leaderboard data');
                return this.leaderboardData;
            }
        }
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const supabase = getSupabaseClient();
            if (!supabase) {
                throw new Error('Supabase not initialized');
            }
            
            console.log('📊 Loading leaderboard from Supabase...');
            
            const { data, error } = await supabase
                .from(SUPABASE.TABLES.PLAYERS)
                .select('username, high_score, updated_at')
                .order('high_score', { ascending: false })
                .limit(LEADERBOARD.MAX_ENTRIES);
            
            if (error) throw error;
            
            this.leaderboardData = data || [];
            this.lastUpdate = Date.now();
            
            console.log(`✅ Loaded ${this.leaderboardData.length} leaderboard entries`);
            
            this.render();
            
            return this.leaderboardData;
        } catch (error) {
            console.error('❌ Error loading leaderboard:', error);
            this.showError();
            return [];
        } finally {
            this.isLoading = false;
        }
    }
    
    // ==================== عرض المتصدرين ====================
    render() {
        if (!this.container) {
            console.warn('⚠️ Leaderboard container not found');
            return;
        }
        
        if (!this.leaderboardData || this.leaderboardData.length === 0) {
            this.showEmpty();
            return;
        }
        
        const currentUser = getCurrentUser();
        let html = '';
        
        this.leaderboardData.forEach((player, index) => {
            const rank = index + 1;
            const medal = LEADERBOARD.MEDALS[index] || '';
            const isCurrentUser = currentUser && player.username === currentUser.user_metadata?.username;
            
            html += `
                <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}" 
                     data-rank="${rank}">
                    <div class="leaderboard-rank">${medal || rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">
                            ${player.username}
                            ${isCurrentUser ? '<span class="you-badge">أنت</span>' : ''}
                        </div>
                        <div class="leaderboard-time">
                            ${TimeUtils.timeAgo(player.updated_at)}
                        </div>
                    </div>
                    <div class="leaderboard-score">
                        ${StringUtils.formatNumber(player.high_score)}
                    </div>
                </div>
            `;
        });
        
        this.container.innerHTML = html;
        
        // تمييز اللاعب الحالي
        if (currentUser) {
            this.highlightCurrentUser();
        }
    }
    
    // ==================== إضافة أنماط CSS للمتصدرين ====================
    addStyles() {
        if (document.getElementById('leaderboard-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'leaderboard-styles';
        style.textContent = `
            .leaderboard-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                margin: 10px 0;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }
            
            .leaderboard-item:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateX(-5px);
            }
            
            .leaderboard-item.current-user {
                background: rgba(0, 255, 136, 0.1);
                border-color: ${COLORS.UI.PRIMARY};
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
            }
            
            .leaderboard-rank {
                font-size: 24px;
                font-weight: bold;
                color: ${COLORS.UI.PRIMARY};
                min-width: 50px;
                text-align: center;
            }
            
            .leaderboard-info {
                flex: 1;
                text-align: right;
            }
            
            .leaderboard-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
                display: flex;
                align-items: center;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .leaderboard-time {
                font-size: 12px;
                color: ${COLORS.UI.TEXT_SECONDARY};
            }
            
            .leaderboard-score {
                font-size: 22px;
                font-weight: bold;
                color: ${COLORS.UI.WARNING};
                min-width: 100px;
                text-align: left;
            }
            
            .you-badge {
                background: ${COLORS.UI.PRIMARY};
                color: #000;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .leaderboard-loading {
                text-align: center;
                padding: 40px;
                color: ${COLORS.UI.TEXT_SECONDARY};
            }
            
            .leaderboard-empty {
                text-align: center;
                padding: 40px;
                color: ${COLORS.UI.TEXT_SECONDARY};
            }
            
            .leaderboard-error {
                text-align: center;
                padding: 40px;
                color: ${COLORS.UI.DANGER};
            }
            
            @keyframes highlightPulse {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.2); }
                50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.5); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ==================== تمييز اللاعب الحالي ====================
    highlightCurrentUser() {
        const currentUserItem = this.container.querySelector('.current-user');
        if (currentUserItem) {
            currentUserItem.style.animation = 'highlightPulse 2s ease-in-out 3';
            
            setTimeout(() => {
                currentUserItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }
    
    // ==================== عرض شاشة التحميل ====================
    showLoading() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="leaderboard-loading">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 15px;"></i>
                <p>جاري تحميل المتصدرين...</p>
            </div>
        `;
    }
    
    // ==================== عرض شاشة فارغة ====================
    showEmpty() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="leaderboard-empty">
                <i class="fas fa-trophy" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>لا توجد نتائج بعد</p>
                <p style="font-size: 14px; margin-top: 10px;">كن أول من يسجل نتيجة!</p>
            </div>
        `;
    }
    
    // ==================== عرض شاشة الخطأ ====================
    showError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="leaderboard-error">
                <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 15px;"></i>
                <p>حدث خطأ أثناء تحميل المتصدرين</p>
                <button class="btn btn-secondary" onclick="leaderboardManager.load(true)" 
                        style="margin-top: 15px;">
                    <i class="fas fa-redo"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
    
    // ==================== البحث عن ترتيب اللاعب ====================
    findPlayerRank(username) {
        const index = this.leaderboardData.findIndex(p => p.username === username);
        return index !== -1 ? index + 1 : null;
    }
    
    // ==================== الحصول على أفضل نتيجة ====================
    getTopScore() {
        return this.leaderboardData.length > 0 ? this.leaderboardData[0].high_score : 0;
    }
    
    // ==================== التحديث التلقائي ====================
    startAutoRefresh() {
        this.stopAutoRefresh();
        
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing leaderboard...');
            this.load(true);
        }, LEADERBOARD.REFRESH_INTERVAL);
    }
    
    // ==================== إيقاف التحديث التلقائي ====================
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    // ==================== تصدير البيانات ====================
    async exportData() {
        try {
            const csv = this.convertToCSV();
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `speedball_leaderboard_${new Date().toISOString()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            
            console.log('✅ Leaderboard exported');
        } catch (error) {
            console.error('❌ Error exporting leaderboard:', error);
        }
    }
    
    // ==================== تحويل إلى CSV ====================
    convertToCSV() {
        const headers = ['الترتيب', 'اسم المستخدم', 'أفضل نتيجة', 'التاريخ'];
        const rows = this.leaderboardData.map((player, index) => [
            index + 1,
            player.username,
            player.high_score,
            TimeUtils.formatDate(player.updated_at)
        ]);
        
        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }
    
    // ==================== إحصائيات المتصدرين ====================
    getStats() {
        if (this.leaderboardData.length === 0) {
            return {
                totalPlayers: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0
            };
        }
        
        const scores = this.leaderboardData.map(p => p.high_score);
        const total = scores.reduce((a, b) => a + b, 0);
        
        return {
            totalPlayers: this.leaderboardData.length,
            averageScore: Math.floor(total / this.leaderboardData.length),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores)
        };
    }
}

// ==================== إنشاء نسخة عامة ====================
const leaderboardManager = new LeaderboardManager();
leaderboardManager.addStyles();

// ==================== تصدير ====================
window.LeaderboardManager = LeaderboardManager;
window.leaderboardManager = leaderboardManager;

console.log('✅ Leaderboard.js loaded successfully');
