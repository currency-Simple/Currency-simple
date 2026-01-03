// ==================== AUTH.JS - مبسط ====================
function getSupabaseClient() {
    return window.getSupabaseClient ? window.getSupabaseClient() : null;
}

// تسجيل الدخول بالمزود
async function signInWithProvider(provider) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        alert('❌ خطأ في الاتصال');
        return;
    }
    
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/callback.html'
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error(`❌ خطأ في ${provider}:`, error);
        alert(`خطأ في تسجيل الدخول بـ ${provider}`);
    }
}

// تسجيل الدخول بالإيميل
async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('⚠️ املأ جميع الحقول');
        return;
    }
    
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        closeAuthModal();
        alert('✅ مرحباً بك!');
    } catch (error) {
        alert('❌ خطأ في تسجيل الدخول: ' + error.message);
    }
}

// إنشاء حساب
async function signUp() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!username || !email || !password) {
        alert('⚠️ املأ جميع الحقول');
        return;
    }
    
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    try {
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { username: username }
            }
        });
        
        if (error) throw error;
        
        closeAuthModal();
        alert('✅ تم إنشاء الحساب! تحقق من بريدك.');
    } catch (error) {
        alert('❌ خطأ في التسجيل: ' + error.message);
    }
}

// تسجيل الخروج
async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        alert('✅ تم تسجيل الخروج');
        window.location.reload();
    } catch (error) {
        alert('❌ خطأ في تسجيل الخروج');
    }
}

// وظائف مساعدة للواجهة
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function toggleAuthMode() {
    const username = document.getElementById('username');
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authSubmitBtn');
    const link = document.getElementById('toggleAuthMode');
    
    if (username.classList.contains('hidden')) {
        username.classList.remove('hidden');
        title.textContent = 'إنشاء حساب';
        btn.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
        link.textContent = 'لديك حساب؟ سجل دخول';
        btn.onclick = signUp;
    } else {
        username.classList.add('hidden');
        title.textContent = 'تسجيل الدخول';
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
        link.textContent = 'ليس لديك حساب؟ سجل الآن';
        btn.onclick = signIn;
    }
}

// تصدير
window.signInWithProvider = signInWithProvider;
window.signIn = signIn;
window.signUp = signUp;
window.signOut = signOut;
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.toggleAuthMode = toggleAuthMode;

console.log('✅ Auth.js محمل');
