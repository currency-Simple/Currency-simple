// نظام المصادقة باستخدام Supabase

// انتظر حتى يتم تحميل Supabase SDK
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

async function initAuth() {
  try {
    // تحقق من أن Supabase محمل
    if (!window.supabase) {
      console.error('Supabase SDK not loaded!');
      await loadSupabaseSDK();
    }
    
    // تهيئة Supabase Client
    const { createClient } = window.supabase;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // تهيئة نظام المصادقة
    window.Auth = {
      supabase: supabase,
      currentUser: null,

      // تهيئة المصادقة
      async init() {
        try {
          // معالجة OAuth callback أولاً إذا كان موجوداً
          if (window.location.hash && window.location.hash.includes('access_token')) {
            await this.handleOAuthCallback();
          }

          // الحصول على الجلسة الحالية
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Get session error:', error);
            throw error;
          }
          
          if (session) {
            this.currentUser = session.user;
            console.log('User authenticated:', this.currentUser.email);
            return this.currentUser;
          }
          
          return null;
        } catch (error) {
          console.error('Error initializing auth:', error);
          return null;
        }
      },

      // معالجة OAuth callback
      async handleOAuthCallback() {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('OAuth callback error:', error);
            throw error;
          }
          
          if (data.session) {
            // تنظيف URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // إعادة التوجيه إلى لوحة التحكم بعد تأكيد الجلسة
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 100);
          }
        } catch (error) {
          console.error('OAuth callback processing failed:', error);
          throw error;
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
          this.showLoading();
          
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}${window.location.pathname}`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              }
            }
          });

          if (error) throw error;

        } catch (error) {
          console.error('Google sign in error:', error);
          this.hideLoading();
          this.showError('فشل تسجيل الدخول باستخدام Google');
        }
      },

      // تسجيل الدخول بـ Discord
      async signInWithDiscord() {
        try {
          this.showLoading();
          
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
              redirectTo: `${window.location.origin}${window.location.pathname}`,
              scopes: 'identify email'
            }
          });

          if (error) throw error;

        } catch (error) {
          console.error('Discord sign in error:', error);
          this.hideLoading();
          this.showError('فشل تسجيل الدخول باستخدام Discord');
        }
      },

      // اللعب كضيف
      continueAsGuest() {
        try {
          // تخزين حالة الضيف
          const guestData = {
            isGuest: true,
            id: this.generateUUID(),
            username: 'ضيف',
            email: null,
            created_at: new Date().toISOString()
          };
          
          localStorage.setItem('guest_user', JSON.stringify(guestData));
          this.currentUser = guestData;
          
          // الانتقال إلى لوحة التحكم
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 300);
        } catch (error) {
          console.error('Guest mode error:', error);
          this.showError('حدث خطأ في وضع الضيف');
        }
      },

      // تسجيل الخروج
      async signOut() {
        try {
          this.showLoading();
          
          // التحقق إذا كان ضيف
          const guestUser = localStorage.getItem('guest_user');
          
          if (guestUser) {
            // حذف بيانات الضيف
            localStorage.removeItem('guest_user');
            localStorage.removeItem('guest_progress');
            this.currentUser = null;
          } else {
            // تسجيل خروج Supabase
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            this.currentUser = null;
          }
          
          this.hideLoading();
          
          // العودة إلى صفحة تسجيل الدخول
          window.location.href = 'index.html';
        } catch (error) {
          console.error('Sign out error:', error);
          this.hideLoading();
          this.showError('فشل تسجيل الخروج');
        }
      },

      // تحديث أو إنشاء مستخدم في قاعدة البيانات
      async upsertUser(user) {
        try {
          const userData = {
            id: user.id,
            username: user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'مستخدم',
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture ||
                       user.user_metadata?.image_url,
            provider: user.app_metadata?.provider,
            updated_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('users')
            .upsert(userData, { onConflict: 'id' })
            .select()
            .single();

          if (error) {
            console.warn('Could not upsert user (table might not exist):', error);
            return user;
          }
          
          return data;
        } catch (error) {
          console.error('Error upserting user:', error);
          return user;
        }
      },

      // الحصول على بيانات المستخدم الحالي
      async getCurrentUser() {
        try {
          // التحقق من وضع الضيف
          const guestUser = localStorage.getItem('guest_user');
          if (guestUser) {
            return JSON.parse(guestUser);
          }

          // الحصول على المستخدم من Supabase
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) throw error;
          
          if (user) {
            // محاولة جلب البيانات الإضافية من قاعدة البيانات
            try {
              const { data: userData, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

              if (!dbError && userData) {
                return userData;
              }
            } catch (dbError) {
              console.warn('Using basic user data:', dbError);
            }

            return user;
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
          const guestUser = localStorage.getItem('guest_user');
          if (!guestUser) {
            window.location.href = 'index.html';
            return null;
          }
          return JSON.parse(guestUser);
        }
        
        return user;
      },

      // الاستماع لتغييرات المصادقة
      onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            this.currentUser = session?.user || null;
            if (this.currentUser) {
              this.upsertUser(this.currentUser);
            }
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
        return !!localStorage.getItem('guest_user');
      },

      // الحصول على ID المستخدم
      getUserId() {
        const guestUser = localStorage.getItem('guest_user');
        if (guestUser) {
          const parsed = JSON.parse(guestUser);
          return parsed.id;
        }
        return this.currentUser?.id || null;
      },

      // أدوات مساعدة
      showLoading() {
        if (window.Utils && window.Utils.showLoading) {
          window.Utils.showLoading();
        } else {
          // تنفيذ بسيط إذا لم يكن Utils موجوداً
          const loader = document.createElement('div');
          loader.id = 'auth-loader';
          loader.innerHTML = 'جاري التحميل...';
          document.body.appendChild(loader);
        }
      },

      hideLoading() {
        if (window.Utils && window.Utils.hideLoading) {
          window.Utils.hideLoading();
        } else {
          const loader = document.getElementById('auth-loader');
          if (loader) loader.remove();
        }
      },

      showError(message) {
        if (window.Utils && window.Utils.showError) {
          window.Utils.showError(message);
        } else {
          alert('خطأ: ' + message);
        }
      },

      generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    };

    // تشغيل الاستماع لتغييرات المصادقة
    Auth.onAuthStateChange((event, session) => {
      console.log('Auth event detected:', event);
    });

    // اختبار الاتصال بـ Supabase
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connected successfully');
      }
    } catch (error) {
      console.error('Supabase test error:', error);
    }

  } catch (error) {
    console.error('Failed to initialize auth system:', error);
  }
}

// دالة لتحميل Supabase SDK ديناميكياً
async function loadSupabaseSDK() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve(window.supabase);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = () => {
      console.log('Supabase SDK loaded');
      resolve(window.supabase);
    };
    script.onerror = () => {
      console.error('Failed to load Supabase SDK');
      reject(new Error('Failed to load Supabase SDK'));
    };
    
    document.head.appendChild(script);
  });
}

// تصدير للاستخدام في الوحدات
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initAuth };
}
