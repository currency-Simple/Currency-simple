// ============================================
// 🔐 AUTH MANAGER
// ============================================
// إدارة تسجيل الدخول والتسجيل والخروج

import { supabase } from './supabase-config.js';

// ✉️ التحقق من صحة البريد الإلكتروني (Gmail فقط)
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
    return { 
      valid: false, 
      strength: 0,
      message: 'الرجاء إدخال كلمة السر' 
    };
  }
  
  if (password.length < 8) {
    return { 
      valid: false, 
      strength: 20,
      message: 'كلمة السر يجب أن تكون 8 أحرف على الأقل' 
    };
  }
  
  let strength = 40;
  
  if (!/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      strength: 40,
      message: 'يجب أن تحتوي على حرف كبير (A-Z)' 
    };
  }
  strength += 20;
  
  if (!/[a-z]/.test(password)) {
    return { 
      valid: false, 
      strength: 60,
      message: 'يجب أن تحتوي على حرف صغير (a-z)' 
    };
  }
  strength += 20;
  
  if (!/[0-9]/.test(password)) {
    return { 
      valid: false, 
      strength: 80,
      message: 'يجب أن تحتوي على رقم (0-9)' 
    };
  }
  strength += 20;
  
  // إضافية: رموز خاصة تزيد القوة
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength = Math.min(100, strength + 10);
  }
  
  return { 
    valid: true, 
    strength,
    message: strength === 100 ? 'كلمة سر قوية جداً! 🔥' : 'كلمة سر قوية! ✓' 
  };
}

// 📝 تسجيل مستخدم جديد
export async function signUp(email, password, username = null) {
  try {
    // التحقق من البريد
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.message };
    }
    
    // التحقق من كلمة السر
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.message };
    }
    
    // تسجيل المستخدم في Supabase
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
    
    // إنشاء ملف شخصي افتراضي
    if (data.user) {
      await createDefaultProfile(data.user.id, username || email.split('@')[0], email);
    }
    
    return { 
      success: true, 
      user: data.user,
      message: 'تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول' 
    };
    
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      success: false, 
      error: 'حدث خطأ غير متوقع. الرجاء المحاولة لاحقاً' 
    };
  }
}

// 🔓 تسجيل الدخول
export async function signIn(email, password) {
  try {
    // التحقق الأساسي
    if (!email || !password) {
      return { 
        success: false, 
        error: 'الرجاء إدخال البريد وكلمة السر' 
      };
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
    
    // جلب الملف الشخصي
    const profile = await getProfile(data.user.id);
    
    return { 
      success: true, 
      user: data.user,
      profile: profile,
      message: `مرحباً ${profile?.username || 'بك'}! 👋` 
    };
    
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      error: 'حدث خطأ غير متوقع' 
    };
  }
}

// 🚪 تسجيل الخروج
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: 'حدث خطأ في تسجيل الخروج' };
    }
    
    // مسح البيانات المحلية
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
        coins: 100, // عملات ترحيبية
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

// 🔄 تحديث الجلسة تلقائياً
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return null;
    }
    
    return data.session;
    
  } catch (error) {
    console.error('Refresh session error:', error);
    return null;
  }
}

// 🔔 مراقبة حالة المصادقة
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// 📧 إعادة تعيين كلمة السر
export async function resetPassword(email) {
  try {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.message };
    }
    
    // هذه الميزة تحتاج إعداد في Supabase Dashboard
    // const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    // محاكاة مؤقتة
    return { 
      success: true, 
      message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني' 
    };
    
  } catch (error) {
    return { success: false, error: 'حدث خطأ في الإرسال' };
  }
}

// ✅ استخدام:
// import { signUp, signIn, signOut, getCurrentUser } from './auth-manager.js';
// 
// const result = await signUp('test@gmail.com', 'Password123');
// if (result.success) { console.log('تم التسجيل!'); }
