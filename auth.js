// ==================== AUTH.JS - المصادقة ====================

// ==================== التسجيل (Sign Up) ====================
async function signUp() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // التحقق من البيانات
    if (!username || !email || !password) {
        alert('⚠️ يرجى ملء جميع الحقول');
        return;
    }
    
    if (password.length < 6) {
        alert('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
    }
    
    const supabase = getSupabaseClient();
    if (!supabase) {
        alert('❌ خطأ في الاتصال بالخادم');
        return;
    }
    
    try {
        console.log('📝 Signing up user:', email);
        
        // إنشاء حساب جديد
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });
        
        if (error) throw error;
        
        if (data.user) {
            console.log('✅ User signed up:', data.user.email);
            
            // حفظ بيانات اللاعب
            await savePlayerData(data.user.id, username, email);
            
            // إغلاق نافذة المصادقة
            closeAuthModal();
            
            alert('✅ تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.');
        }
    } catch (error) {
        console.error('❌ Sign up error:', error);
        
        if (error.message.includes('already registered')) {
            alert('⚠️ البريد الإلكتروني مسجل بالفعل');
        } else {
            alert('❌ خطأ في التسجيل: ' + error.message);
        }
    }
}

// ==================== تسجيل الدخول (Sign In) ====================
async function signIn() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // التحقق من البيانات
    if (!email || !password) {
        alert('⚠️ يرجى ملء جميع الحقول');
        return;
    }
    
    const supabase = getSupabaseClient();
    if (!supabase) {
        alert('❌ خطأ في الاتصال بالخادم');
        return;
    }
    
    try {
        console.log('🔐 Signing in user:', email);
        
        // تسجيل الدخول
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        if (data.user) {
            console.log('✅ User signed in:', data.user.email);
            
            // تحميل بيانات اللاعب
            await loadPlayerData(data.user.id);
            
            // إغلاق نافذة المصادقة
            closeAuthModal();
            
            alert('✅ مرحباً بك!');
        }
    } catch (error) {
        console.error('❌ Sign in error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
            alert('⚠️ البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else {
            alert('❌ خطأ في تسجيل الدخول: ' + error.message);
        }
    }
}

// ==================== تسجيل الدخول بمقدمي الخدمة ====================
async function signInWithProvider(provider) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        alert('❌ خطأ في الاتصال بالخادم');
        return;
    }
    
    try {
        console.log(`🔐 Signing in with ${provider}`);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        
        console.log(`✅ Redirecting to ${provider} authentication...`);
    } catch (error) {
        console.error(`❌ ${provider} sign in error:`, error);
        alert(`❌ خطأ في تسجيل الدخول بواسطة ${provider}: ` + error.message);
    }
}

// ==================== تسجيل الخروج (Sign Out) ====================
async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) {
        alert('❌ خطأ في الاتصال بالخادم');
        return;
    }
    
    try {
        console.log('🚪 Signing out user...');
        
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        console.log('✅ User signed out');
        
        // إعادة تعيين البيانات
        window.highScore = 0;
        updateUI();
        
        alert('✅ تم تسجيل الخروج بنجاح');
        
        // العودة إلى القائمة
        if (window.gameState !== 'menu') {
            showMenu();
        }
    } catch (error) {
        console.error('❌ Sign out error:', error);
        alert('❌ خطأ في تسجيل الخروج: ' + error.message);
    }
}

// ==================== إعادة تعيين كلمة المرور ====================
async function resetPassword(email) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        alert('❌ خطأ في الاتصال بالخادم');
        return;
    }
    
    try {
        console.log('🔑 Requesting password reset for:', email);
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        });
        
        if (error) throw error;
        
        alert('✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (error) {
        console.error('❌ Password reset error:', error);
        alert('❌ خطأ في إعادة تعيين كلمة المرور: ' + error.message);
    }
}

// ==================== التحقق من البريد الإلكتروني ====================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==================== التحقق من قوة كلمة المرور ====================
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
}

// ==================== عرض قوة كلمة المرور ====================
function displayPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);
    
    let message = '';
    let color = '';
    
    if (password.length === 0) {
        return;
    } else if (strength <= 2) {
        message = '⚠️ ضعيفة';
        color = '#ff4444';
    } else if (strength <= 4) {
        message = '⚡ متوسطة';
        color = '#ffaa00';
    } else {
        message = '✅ قوية';
        color = '#00ff88';
    }
    
    // يمكن إضافة عنصر لعرض قوة كلمة المرور
    console.log(`Password strength: ${message}`);
}

// ==================== إضافة مستمعات الأحداث ====================
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', displayPasswordStrength);
    }
});

// ==================== تصدير الوظائف ====================
window.signUp = signUp;
window.signIn = signIn;
window.signInWithProvider = signInWithProvider;
window.signOut = signOut;
window.resetPassword = resetPassword;
window.isValidEmail = isValidEmail;
window.checkPasswordStrength = checkPasswordStrength;

console.log('✅ Auth.js loaded successfully');
