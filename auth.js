// نظام المصادقة - تسجيل دخول وتسجيل وجوجل وديسكورد
class AuthSystem {
    constructor() {
        this.supabase = supabase;
        this.currentUser = null;
        
        this.bindEvents();
        this.checkAuth();
    }
    
    bindEvents() {
        // أزرار التسجيل والدخول
        document.getElementById('login-btn').addEventListener('click', () => this.login());
        document.getElementById('signup-btn').addEventListener('click', () => this.signup());
        document.getElementById('google-login-btn').addEventListener('click', () => this.loginWithGoogle());
        document.getElementById('discord-login-btn').addEventListener('click', () => this.loginWithDiscord());
        document.getElementById('show-signup').addEventListener('click', (e) => this.showSignupForm(e));
        document.getElementById('show-login').addEventListener('click', (e) => this.showLoginForm(e));
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }
    
    async checkAuth() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (error) throw error;
            
            if (user) {
                this.currentUser = user;
                await this.loadPlayerData(user);
                this.showGameScreen();
            } else {
                this.showAuthScreen();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.showAuthScreen();
        }
    }
    
    async loadPlayerData(user) {
        try {
            // التحقق إذا كان اللاعب موجود في جدول players
            const { data: existingPlayer, error: fetchError } = await this.supabase
                .from('players')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (fetchError && fetchError.code === 'PGRST116') {
                // اللاعب غير موجود، إنشاء حساب جديد
                const { data: newPlayer, error: insertError } = await this.supabase
                    .from('players')
                    .insert({
                        id: user.id,
                        email: user.email,
                        username: user.email.split('@')[0] || 'player',
                        best_score: 0,
                        total_games: 0,
                        total_time: 0
                    })
                    .select()
                    .single();
                    
                if (insertError) throw insertError;
                window.game.setPlayerData(newPlayer);
            } else if (existingPlayer) {
                window.game.setPlayerData(existingPlayer);
            }
        } catch (error) {
            console.error('Error loading player data:', error);
        }
    }
    
    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            this.showError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }
        
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            this.currentUser = data.user;
            await this.loadPlayerData(data.user);
            this.showGameScreen();
            this.showSuccess('تم تسجيل الدخول بنجاح!');
            
        } catch (error) {
            this.showError('خطأ في تسجيل الدخول: ' + error.message);
        }
    }
    
    async signup() {
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        if (!username || !email || !password) {
            this.showError('يرجى ملء جميع الحقول');
            return;
        }
        
        if (password.length < 6) {
            this.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        
        try {
            // تسجيل المستخدم في نظام المصادقة
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            });
            
            if (error) throw error;
            
            // إنشاء حساب في جدول players
            const { error: dbError } = await this.supabase
                .from('players')
                .insert({
                    id: data.user.id,
                    email: data.user.email,
                    username: username,
                    best_score: 0,
                    total_games: 0,
                    total_time: 0
                });
            
            if (dbError) throw dbError;
            
            this.showSuccess('تم إنشاء الحساب بنجاح! تم إرسال بريد التفعيل');
            
            // الانتقال إلى شاشة تسجيل الدخول
            this.showLoginForm();
            
        } catch (error) {
            this.showError('خطأ في التسجيل: ' + error.message);
        }
    }
    
    async loginWithGoogle() {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            
            if (error) throw error;
            
        } catch (error) {
            this.showError('خطأ في تسجيل الدخول بجوجل: ' + error.message);
        }
    }
    
    async loginWithDiscord() {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: window.location.origin
                }
            });
            
            if (error) throw error;
            
        } catch (error) {
            this.showError('خطأ في تسجيل الدخول بديسكورد: ' + error.message);
        }
    }
    
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            this.showAuthScreen();
            this.showSuccess('تم تسجيل الخروج بنجاح');
            
        } catch (error) {
            this.showError('خطأ في تسجيل الخروج: ' + error.message);
        }
    }
    
    showLoginForm(e) {
        if (e) e.preventDefault();
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
        this.clearError();
    }
    
    showSignupForm(e) {
        if (e) e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        this.clearError();
    }
    
    showGameScreen() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'flex';
        document.getElementById('loading-screen').style.display = 'none';
        
        // تحديث بيانات الملف الشخصي
        this.updateProfileInfo();
    }
    
    showAuthScreen() {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'none';
    }
    
    updateProfileInfo() {
        if (!this.currentUser) return;
        
        document.getElementById('player-name').textContent = 
            this.currentUser.user_metadata?.username || 
            this.currentUser.email?.split('@')[0] || 
            'اللاعب';
    }
    
    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
    
    showSuccess(message) {
        alert(message); // يمكن استبدالها بنافذة جميلة
    }
    
    clearError() {
        document.getElementById('auth-error').style.display = 'none';
    }
}

// بدء نظام المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});
