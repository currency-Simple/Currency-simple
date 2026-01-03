// ==================== SUPABASE-CLIENT.JS ====================
const SUPABASE_URL = 'https://byxbwljcwevywrgjuvkn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5eGJ3bGpjd2V2eXdyZ2p1dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMTI4MDAsImV4cCI6MjA1MTU4ODgwMH0.zWY6EAOczT_nhiscFxqHQA_hboO8gpf';

let supabaseClient = null;
let currentUser = null;

// تهيئة Supabase
async function initSupabase() {
    if (!window.supabase) {
        console.error('❌ مكتبة Supabase غير محملة');
        return false;
    }
    
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase جاهز');
        
        // التحقق من المستخدم الحالي
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('✅ مستخدم مسجل:', currentUser.email);
        }
        
        // مراقبة تغييرات المصادقة
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔐 تغيير حالة:', event);
            currentUser = session?.user || null;
            updateUserUI();
        });
        
        return true;
    } catch (error) {
        console.error('❌ خطأ في تهيئة Supabase:', error);
        return false;
    }
}

// الحصول على العميل
function getSupabaseClient() {
    return supabaseClient;
}

// الحصول على المستخدم الحالي
function getCurrentUser() {
    return currentUser;
}

// تحديث واجهة المستخدم
function updateUserUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    
    if (!loginBtn || !userProfile) return;
    
    if (currentUser) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        if (userName) {
            userName.textContent = currentUser.email.split('@')[0];
        }
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
}

// تصدير للاستخدام العام
window.initSupabase = initSupabase;
window.getSupabaseClient = getSupabaseClient;
window.getCurrentUser = getCurrentUser;
window.supabaseClient = () => supabaseClient;

console.log('✅ Supabase-client.js محمل');
