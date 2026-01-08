// نظام المصادقة باستخدام Supabase

// تهيئة Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Auth = {
  currentUser: null,

  // تهيئة المصادقة
  async init() {
    try {
      // الحصول على الجلسة الحالية
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        this.currentUser = session.user;
        return this.currentUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return null;
    }
  },

  // التحقق من حالة المصادقة
  async checkAuth() {
    try {
      const user = await this.init();
      
      if (user) {
        // تحديث أو إنشاء سجل المستخدم في قاعدة البيانات
        await this.upsertUser(user);
      }
      
      return user;
    } catch (error) {
      console.error('Error checking auth:', error);
      return null;
    }
  },

  // تسجيل الدخول بـ Google
  async signInWithGoogle() {
    try {
      Utils.showLoading();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard.html`
        }
      });

      if (error) throw error;

      // سيتم إعادة التوجيه تلقائياً
    } catch (error) {
      console.error('Google sign in error:', error);
      Utils.hideLoading();
      Utils.showError(ERROR_MESSAGES.AUTH_FAILED);
    }
  },

  // تسجيل الدخول بـ Discord
  async signInWithDiscord() {
    try {
      Utils.showLoading();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/dashboard.html`
        }
      });

      if (error) throw error;

      // سيتم إعادة التوجيه تلقائياً
    } catch (error) {
      console.error('Discord sign in error:', error);
      Utils.hideLoading();
      Utils.showError(ERROR_MESSAGES.AUTH_FAILED);
    }
  },

  // اللعب كضيف
  continueAsGuest() {
    try {
      // تخزين حالة الضيف
      const guestData = {
        isGuest: true,
        id: Utils.generateUUID(),
        username: 'ضيف',
        created_at: new Date().toISOString()
      };
      
      Utils.setLocalStorage('guest_user', guestData);
      this.currentUser = guestData;
      
      // الانتقال إلى لوحة التحكم
      window.location.href = 'dashboard.html';
    } catch (error) {
      console.error('Guest mode error:', error);
      Utils.showError('حدث خطأ. حاول مرة أخرى.');
    }
  },

  // تسجيل الخروج
  async signOut() {
    try {
      Utils.showLoading();
      
      // التحقق إذا كان ضيف
      const guestUser = Utils.getLocalStorage('guest_user');
      
      if (guestUser) {
        // حذف بيانات الضيف
        Utils.removeLocalStorage('guest_user');
        Utils.removeLocalStorage('guest_progress');
      } else {
        // تسجيل خروج Supabase
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }

      this.currentUser = null;
      
      // العودة إلى صفحة تسجيل الدخول
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Sign out error:', error);
      Utils.hideLoading();
      Utils.showError('فشل تسجيل الخروج');
    }
  },

  // تحديث أو إنشاء مستخدم في قاعدة البيانات
  async upsertUser(user) {
    try {
      const userData = {
        id: user.id,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم',
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  },

  // الحصول على بيانات المستخدم الحالي
  async getCurrentUser() {
    try {
      // التحقق من وضع الضيف
      const guestUser = Utils.getLocalStorage('guest_user');
      if (guestUser) {
        return guestUser;
      }

      // الحصول على المستخدم من Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        // جلب البيانات الإضافية من قاعدة البيانات
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (dbError) {
          console.error('Error fetching user data:', dbError);
          return user;
        }

        return userData || user;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // التحقق من الجلسة والتوجيه
  async requireAuth() {
    const user = await this.checkAuth();
    
    if (!user) {
      // التحقق من وضع الضيف
      const guestUser = Utils.getLocalStorage('guest_user');
      if (!guestUser) {
        window.location.href = 'index.html';
        return null;
      }
      return guestUser;
    }
    
    return user;
  },

  // الاستماع لتغييرات المصادقة
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN') {
        this.currentUser = session.user;
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      }
      
      if (callback) {
        callback(event, session);
      }
    });
  },

  // التحقق من وضع الضيف
  isGuest() {
    return !!Utils.getLocalStorage('guest_user');
  },

  // الحصول على ID المستخدم
  getUserId() {
    const guestUser = Utils.getLocalStorage('guest_user');
    if (guestUser) {
      return guestUser.id;
    }
    return this.currentUser?.id || null;
  }
};

// معالجة إعادة التوجيه بعد OAuth
if (window.location.hash && window.location.hash.includes('access_token')) {
  (async () => {
    try {
      Utils.showLoading();
      
      // Supabase سيعالج التوكن تلقائياً
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        // تنظيف الـ URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // إعادة التوجيه إلى لوحة التحكم
        window.location.href = 'dashboard.html';
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      Utils.hideLoading();
      Utils.showError(ERROR_MESSAGES.AUTH_FAILED);
    }
  })();
}

// تصدير
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}