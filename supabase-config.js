// ============================================
// 🔧 SUPABASE CONFIG (مع OAuth)
// ============================================

// ⚠️ ضع مفاتيحك هنا
const SUPABASE_URL = 'https://byxbwljcwevywrgjuvkn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zWY6EAOczT_nhiscFxqHQA_hboO8gpf';

// التحقق من المفاتيح
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Supabase keys are missing!');
    alert('خطأ: مفاتيح Supabase غير موجودة. يرجى التحديث في supabase-config.js');
}

// إنشاء Supabase Client
let supabaseClient = null;

try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                flowType: 'pkce',
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: localStorage
            }
        });
        console.log('✅ Supabase client created successfully');
    } else {
        console.error('❌ Supabase library not loaded');
    }
} catch (error) {
    console.error('❌ Error creating Supabase client:', error);
}

// تصدير
window.supabaseClient = supabaseClient;
window.SUPABASE_URL = SUPABASE_URL;

// دالة لفحص حالة OAuth عند التحميل
function checkOAuthState() {
    if (window.supabaseClient) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('✅ User is already logged in via OAuth');
                document.getElementById('auth-screen')?.classList.remove('active');
                document.getElementById('menu-screen')?.classList.add('active');
            }
        });
    }
}

// تشغيل فحص OAuth عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkOAuthState);
} else {
    checkOAuthState();
}

console.log('✅ Supabase config loaded');
