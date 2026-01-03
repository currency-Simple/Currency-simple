// نظام قاعدة البيانات والمتصدرين
class DatabaseSystem {
    constructor() {
        this.supabase = supabase;
        
        this.bindEvents();
        this.setupDatabase();
    }
    
    bindEvents() {
        // زر المتصدرين في القائمة السفلية
        document.querySelector('[data-screen="leaderboard"]').addEventListener('click', () => {
            this.openLeaderboard();
        });
        
        // أزرار نافذة المتصدرين
        document.getElementById('close-leaderboard').addEventListener('click', () => this.closeLeaderboard());
        
        // تبويبات المتصدرين
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.loadLeaderboard(type);
            });
        });
    }
    
    async setupDatabase() {
        try {
            // جلب البيانات للتأكد من الاتصال
            const { data, error } = await this.supabase
                .from('players')
                .select('count')
                .limit(1);
            
            if (error) throw error;
            
            console.log('✅ Database connection successful');
            
        } catch (error) {
            console.error('Database connection error:', error);
            
            // إذا لم تكن الجداول موجودة، إنشائها
            this.createTablesIfNeeded();
        }
    }
    
    async createTablesIfNeeded() {
        console.log('⚠️ Creating tables if needed...');
        
        // هذه مجرد محاكاة، في الواقع يجب إنشاء الجداول من Supabase Dashboard
        const tables = [
            {
                name: 'players',
                columns: [
                    'id UUID PRIMARY KEY REFERENCES auth.users(id)',
                    'username VARCHAR(50)',
                    'email VARCHAR(100)',
                    'best_score INTEGER DEFAULT 0',
                    'total_games INTEGER DEFAULT 0',
                    'total_time INTEGER DEFAULT 0',
                    'created_at TIMESTAMP DEFAULT NOW()'
                ]
            },
            {
                name: 'scores',
                columns: [
                    'id SERIAL PRIMARY KEY',
                    'player_id UUID REFERENCES players(id)',
                    'score INTEGER',
                    'time INTEGER',
                    'level INTEGER DEFAULT 1',
                    'created_at TIMESTAMP DEFAULT NOW()'
                ]
            }
        ];
        
        console.log('📋 Tables structure (to create in Supabase Dashboard):');
        tables.forEach(table => {
            console.log(`CREATE TABLE ${table.name} (${table.columns.join(', ')});`);
        });
    }
    
    async openLeaderboard() {
        try {
            // عرض نافذة المتصدرين
            document.getElementById('leaderboard-modal').style.display = 'flex';
            
            // تحميل المتصدرين (الافتراضي: اليوم)
            await this.loadLeaderboard('daily');
            
        } catch (error) {
            console.error('Error opening leaderboard:', error);
        }
    }
    
    async loadLeaderboard(type = 'daily') {
        try {
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = '<div class="loading">جاري تحميل المتصدرين...</div>';
            
            // تحديث التبويبات النشطة
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === type) {
                    btn.classList.add('active');
                }
            });
            
            let query;
            
            switch(type) {
                case 'daily':
                    // نتائج اليوم
                    query = this.supabase
                        .from('scores')
                        .select(`
                            score,
                            time,
                            created_at,
                            players (username, best_score)
                        `)
                        .gte('created_at', this.getTodayDate())
                        .order('score', { ascending: false })
                        .limit(100);
                    break;
                    
                case 'weekly':
                    // نتائج الأسبوع
                    query = this.supabase
                        .from('scores')
                        .select(`
                            score,
                            time,
                            created_at,
                            players (username, best_score)
                        `)
                        .gte('created_at', this.getWeekAgoDate())
                        .order('score', { ascending: false })
                        .limit(100);
                    break;
                    
                case 'alltime':
                default:
                    // أفضل النتائج على الإطلاق
                    query = this.supabase
                        .from('players')
                        .select('username, best_score, total_games')
                        .order('best_score', { ascending: false })
                        .limit(100);
                    break;
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            // عرض النتائج
            this.displayLeaderboard(data, type);
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            document.getElementById('leaderboard-list').innerHTML = 
                '<div class="error">حدث خطأ في تحميل المتصدرين</div>';
        }
    }
    
    displayLeaderboard(data, type) {
        const leaderboardList = document.getElementById('leaderboard-list');
        
        if (!data || data.length === 0) {
            leaderboardList.innerHTML = '<div class="empty">لا توجد نتائج بعد</div>';
            return;
        }
        
        let html = '';
        
        if (type === 'alltime') {
            // عرض أفضل اللاعبين
            data.forEach((player, index) => {
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
                
                html += `
                    <div class="leaderboard-item ${index < 3 ? 'top-three' : ''}">
                        <div class="rank">${medal}</div>
                        <div class="player-info">
                            <div class="player-name">${player.username || 'مجهول'}</div>
                            <div class="player-stats">
                                <span class="games">${player.total_games || 0} لعبة</span>
                            </div>
                        </div>
                        <div class="score">${player.best_score || 0}</div>
                    </div>
                `;
            });
        } else {
            // عرض النتائج
            data.forEach((score, index) => {
                const player = score.players || {};
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
                const time = this.formatTime(score.time);
                const date = this.formatDate(score.created_at);
                
                html += `
                    <div class="leaderboard-item ${index < 3 ? 'top-three' : ''}">
                        <div class="rank">${medal}</div>
                        <div class="player-info">
                            <div class="player-name">${player.username || 'مجهول'}</div>
                            <div class="player-stats">
                                <span class="time">${time}</span>
                                <span class="date">${date}</span>
                            </div>
                        </div>
                        <div class="score">${score.score || 0}</div>
                    </div>
                `;
            });
        }
        
        leaderboardList.innerHTML = html;
    }
    
    getTodayDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString();
    }
    
    getWeekAgoDate() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return weekAgo.toISOString();
    }
    
    formatTime(seconds) {
        if (!seconds) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }
    
    closeLeaderboard() {
        document.getElementById('leaderboard-modal').style.display = 'none';
    }
}

// بدء نظام قاعدة البيانات
document.addEventListener('DOMContentLoaded', () => {
    window.databaseSystem = new DatabaseSystem();
});
