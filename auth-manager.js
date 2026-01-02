// ============================================
// 🔐 AUTH MANAGER (مع OAuth)
// ============================================

// استخدام Supabase Client العام
const getSupabase = () => window.supabaseClient;

// ✉️ التحقق من صحة البريد الإلكتروني
export function validateEmail(email) {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  
  if (!email) {
    return { valid: false, message: 'الرجاء إدخال البريد الإلكتروني' };
  }
  
  if (!gmailRegex.test(email)) {
    return { valid: false, message: 'يجب استخدام بريد Gmail فقط (@gmail.com)' };
  }
  
  return { valid: true, message: 'بريد صالح ✓' };
}

// 🔒 التحقق من قوة كلمة السر
export function validatePassword(password) {
  if (!password) {
    return { valid: false, strength: 0, message: 'الرجاء إدخال كلمة السر' };
  }
  
  if (password.length < 8) {
    return { valid: false, strength: 20, message: 'كلمة السر يجب أن تكون 8 أحرف على الأقل' };
  }
  
  let strength = 40;
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, strength: 40, message: 'يجب أن تحتوي على حرف كبير (A-Z)' };
  }
  strength += 20;
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, strength: 60, message: 'يجب أن تحتوي على حرف صغير (a-z)' };
  }
  strength += 20;
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, strength: 80, message: 'يجب أن تحتوي على رقم (0-9)' };
  }
  strength += 20;
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength = Math.min(100, strength + 10);
  }
  
  return { 
    valid: true, 
    strength,
    message: strength === 100 ? 'كلمة سر قوية جداً! 🔥' : 'كلمة سر قوية! ✓' 
  };
}

// 📝 تسجيل مستخدم جديد (Email/Password)
export async function signUp(email, password, username = null) {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase غير متصل' };

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.message };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.message };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          created_at: new Date().toISOString()
        }
      }
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message === 'User already registered' 
          ? 'هذا البريد مسجل مسبقاً' 
          : 'حدث خطأ في التسجيل' 
      };
    }
    
    if (data.user) {
      await createDefaultProfile(data.user.id, username || email.split('@')[0], email);
    }
    
    return { 
      success: true, 
      user: data.user,
      message: 'تم التسجيل بنجاح! ✅' 
    };
    
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// 🔓 تسجيل الدخول (Email/Password)
export async function signIn(email, password) {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase غير متصل' };

    if (!email || !password) {
      return { success: false, error: 'الرجاء إدخال البريد وكلمة السر' };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message === 'Invalid login credentials' 
          ? 'بيانات الدخول غير صحيحة' 
          : 'حدث خطأ في تسجيل الدخول' 
      };
    }
    
    const profile = await getProfile(data.user.id);
    
    return { 
      success: true, 
      user: data.user,
      profile: profile,
      message: `مرحباً ${profile?.username || 'بك'}! 👋` 
    };
    
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// 🔐 تسجيل الدخول عبر Google
export async function signInWithGoogle() {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase غير متصل' };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: 'فشل تسجيل الدخول عبر Google' };
    }
    
    return { success: true, message: 'جاري التحويل إلى Google...' };
    
  } catch (error) {
    console.error('Google sign in error:', error);
    return { success: false, error: 'حدث خطأ في تسجيل الدخول' };
  }
}

// 🐙 تسجيل الدخول عبر GitHub
export async function signInWithGithub() {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase غير متصل' };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error('GitHub sign in error:', error);
      return { success: false, error: 'فشل تسجيل الدخول عبر GitHub' };
    }
    
    return { success: true, message: 'جاري التحويل إلى GitHub...' };
    
  } catch (error) {
    console.error('GitHub sign in error:', error);
    return { success: false, error: 'حدث خطأ في تسجيل الدخول' };
  }
}

// 💬 تسجيل الدخول عبر Discord
export async function signInWithDiscord() {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase غير متصل' };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error('Discord sign in error:', error);
      return { success: false, error: 'فشل تسجيل الدخول عبر Discord' };
    }
    
    return { success: true, message: 'جاري التحويل إلى Discord...' };
    
  } catch (error) {
    console.error('Discord sign in error:', error);
    return { success: false, error: 'حدث خطأ في تسجيل الدخول' };
  }
}

// 🚪 تسجيل الخروج
export async function signOut() {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase غير متصل' };

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: 'حدث خطأ في تسجيل الخروج' };
    }
    
    localStorage.removeItem('game_cache');
    
    return { success: true, message: 'تم تسجيل الخروج بنجاح' };
    
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// 👤 الحصول على المستخدم الحالي
export async function getCurrentUser() {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }
    
    return data.user;
    
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// 🔍 جلب الملف الشخصي
async function getProfile(userId) {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Get profile error:', error);
      return null;
    }
    
    return data;
    
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

// 🆕 إنشاء ملف شخصي افتراضي
async function createDefaultProfile(userId, username, email) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        username: username,
        email: email,
        avatar_url: null,
        country_code: null,
        level: 1,
        total_score: 0,
        total_games: 0,
        best_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Create profile error:', error);
    }
    
  } catch (error) {
    console.error('Create profile error:', error);
  }
}

// 🔔 معالجة OAuth Callback
export async function handleOAuthCallback() {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false };

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { success: false, error: 'فشل التحقق من المستخدم' };
    }

    // التحقق من وجود ملف شخصي
    const profile = await getProfile(user.id);
    
    if (!profile) {
      // إنشاء ملف شخصي جديد
      const username = user.user_metadata?.full_name || 
                      user.user_metadata?.user_name || 
                      user.email?.split('@')[0] || 
                      'Player';
      
      await createDefaultProfile(user.id, username, user.email);
    }
    
    return { 
      success: true, 
      user,
      message: 'تم تسجيل الدخول بنجاح! ✅'
    };
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return { success: false, error: 'حدث خطأ' };
  }
}

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
  window.authManager = {
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signInWithDiscord,
    signOut,
    getCurrentUser,
    handleOAuthCallback,
    validateEmail,
    validatePassword
  };
}

console.log('✅ Auth Manager loaded with OAuth support');
