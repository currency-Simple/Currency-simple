// نظام الملف الشخصي
class ProfileSystem {
    constructor() {
        this.supabase = supabase;
        this.playerStats = null;
        
        this.bindEvents();
        this.setupProfileModal();
    }
    
    bindEvents() {
        // زر الملف الشخصي في القائمة السفلية
        document.querySelector('[data-screen="profile"]').addEventListener('click', () => {
            this.openProfileModal();
        });
        
        // أزرار نافذة الملف الشخصي
        document.getElementById('edit-profile').addEventListener('click', () => this.editProfile());
        document.getElementById('close-profile').addEventListener('click', () => this.closeProfileModal());
    }
    
    async openProfileModal() {
        try {
            // جلب بيانات اللاعب الحالي
            const { data: { user }, error: userError } = await this.supabase.auth.getUser();
            
            if (userError) throw userError;
            
            if (!user) {
                alert('يجب تسجيل الدخول أولاً');
                return;
            }
            
            // جلب إحصائيات اللاعب
            await this.loadPlayerStats(user.id);
            
            // عرض نافذة الملف الشخصي
            document.getElementById('profile-modal').style.display = 'flex';
            
            // تحديث البيانات في النافذة
            this.updateProfileDisplay(user);
            
        } catch (error) {
            console.error('Error opening profile:', error);
            alert('حدث خطأ في تحميل الملف الشخصي');
        }
    }
    
    async loadPlayerStats(userId) {
        try {
            // جلب بيانات اللاعب
            const { data: playerData, error: playerError } = await this.supabase
                .from('players')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (playerError) throw playerError;
            
            // جلب إحصائيات النتائج
            const { data: scoresData, error: scoresError } = await this.supabase
                .from('scores')
                .select('*')
                .eq('player_id', userId);
            
            if (scoresError) throw scoresError;
            
            // حساب الإحصائيات
            this.playerStats = {
                ...playerData,
                totalGames: scoresData.length,
                totalPlayTime: scoresData.reduce((sum, score) => sum + (score.time || 0), 0),
                averageScore: scoresData.length > 0 ? 
                    Math.round(scoresData.reduce((sum, score) => sum + score.score, 0) / scoresData.length) : 0,
                scoresHistory: scoresData
            };
            
        } catch (error) {
            console.error('Error loading player stats:', error);
        }
    }
    
    updateProfileDisplay(user) {
        if (!user || !this.playerStats) return;
        
        // المعلومات الأساسية
        document.getElementById('profile-username').textContent = 
            this.playerStats.username || user.email.split('@')[0];
        
        document.getElementById('profile-email').textContent = user.email;
        
        // الإحصائيات
        document.getElementById('profile-best-score').textContent = 
            this.playerStats.best_score || 0;
        
        document.getElementById('profile-games-played').textContent = 
            this.playerStats.totalGames || 0;
        
        // حساب الوقت الكلي
        const totalMinutes = Math.floor((this.playerStats.totalPlayTime || 0) / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        document.getElementById('profile-total-time').textContent = 
            `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
        
        // تحديث صورة الملف الشخصي
        this.updateProfileAvatar(user);
        
        // تحديث الترتيب العالمي
        this.updateGlobalRank(user.id);
    }
    
    async updateGlobalRank(userId) {
        try {
            // جلب أفضل 100 لاعب
            const { data: topPlayers, error } = await this.supabase
                .from('players')
                .select('id, best_score')
                .order('best_score', { ascending: false })
                .limit(100);
            
            if (error) throw error;
            
            // البحث عن ترتيب اللاعب
            const playerIndex = topPlayers.findIndex(player => player.id === userId);
            const rank = playerIndex !== -1 ? playerIndex + 1 : '-';
            
            document.getElementById('profile-global-rank').textContent = `#${rank}`;
            
        } catch (error) {
            console.error('Error updating global rank:', error);
            document.getElementById('profile-global-rank').textContent = '#-';
        }
    }
    
    updateProfileAvatar(user) {
        const avatar = document.getElementById('profile-avatar');
        
        // استخدام صورة جوجل إذا كانت موجودة
        if (user.user_metadata?.avatar_url) {
            avatar.innerHTML = `<img src="${user.user_metadata.avatar_url}" alt="الصورة الشخصية">`;
            avatar.style.backgroundImage = `url(${user.user_metadata.avatar_url})`;
            avatar.style.backgroundSize = 'cover';
        } else {
            // استخدام الأحرف الأولى من الاسم
            const initials = this.getInitials(user.email || 'اللاعب');
            avatar.innerHTML = `<span>${initials}</span>`;
            avatar.style.background = this.getRandomGradient();
        }
    }
    
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    
    getRandomGradient() {
        const gradients = [
            'linear-gradient(45deg, #FF5722, #FF9800)',
            'linear-gradient(45deg, #2196F3, #03A9F4)',
            'linear-gradient(45deg, #4CAF50, #8BC34A)',
            'linear-gradient(45deg, #9C27B0, #E91E63)',
            'linear-gradient(45deg, #00BCD4, #0097A7)'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    }
    
    async editProfile() {
        const newUsername = prompt('أدخل اسم المستخدم الجديد:', this.playerStats?.username || '');
        
        if (!newUsername || newUsername.trim() === '') {
            return;
        }
        
        try {
            const { data: { user }, error: userError } = await this.supabase.auth.getUser();
            
            if (userError) throw userError;
            
            // تحديث اسم المستخدم في جدول players
            const { error: updateError } = await this.supabase
                .from('players')
                .update({ username: newUsername.trim() })
                .eq('id', user.id);
            
            if (updateError) throw updateError;
            
            // تحديث البيانات المحلية
            this.playerStats.username = newUsername.trim();
            
            // إعادة تحميل البيانات
            this.updateProfileDisplay(user);
            
            // تحديث الاسم في الشريط العلوي
            document.getElementById('player-name').textContent = newUsername.trim();
            
            alert('تم تحديث الملف الشخصي بنجاح!');
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('حدث خطأ في تحديث الملف الشخصي');
        }
    }
    
    closeProfileModal() {
        document.getElementById('profile-modal').style.display = 'none';
    }
    
    setupProfileModal() {
        // إغلاق النافذة عند النقر خارجها
        document.getElementById('profile-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('profile-modal')) {
                this.closeProfileModal();
            }
        });
    }
}

// بدء نظام الملف الشخصي
document.addEventListener('DOMContentLoaded', () => {
    window.profileSystem = new ProfileSystem();
});
