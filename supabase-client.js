// ==================== SUPABASE-CLIENT.JS - الاتصال بـ Supabase ====================

// بيانات الاتصال
const SUPABASE_URL = 'https://byxbwljcwevywrgjuvkn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5eGJ3bGpjd2V2eXdyZ2p1dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMTI4MDAsImV4cCI6MjA1MTU4ODgwMH0.zWY6EAOczT_nhiscFxqHQA_hboO8gpf';

// عميل Supabase
let supabaseClient = null;
let currentUser = null;

// ==================== تهيئة Supabase ====================
async function initSupabase() {
    try {
        // التحقق من توفر Supabase في window
        if (!window.supabase) {
            throw new Error('Supabase library not loaded');
        }
        
        // إنشاء عميل Supabase
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase client initialized');
        
        // التحقق من المستخدم الحالي
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('✅ User session found:', currentUser.email);
        }
        
        // الاستماع لتغييرات المصادقة
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth state changed:', event);
            
            if (session) {
                currentUser = session.user;
                updateUserUI(currentUser);
            } else {
                currentUser = null;
                updateUserUI(null);
            }
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return false;
    }
}

// ==================== الحصول على عميل Supabase ====================
function getSupabaseClient() {
    if (!supabaseClient) {
        console.warn('⚠️ Supabase client not initialized');
    }
    return supabaseClient;
}

// ==================== الحصول على المستخدم الحالي ====================
function getCurrentUser() {
    return currentUser;
}

// ==================== حفظ بيانات اللاعب ====================
async function savePlayerData(userId, username, email) {
    if (!supabaseClient) {
        console.error('❌ Supabase not initialized');
        return false;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('players')
            .upsert({
                user_id: userId,
                username: username,
                email: email,
                high_score: 0,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });
        
        if (error) throw error;
        
        console.log('✅ Player data saved');
        return true;
    } catch (error) {
        console.error('❌ Error saving player data:', error);
        return false;
    }
}

// ==================== جلب بيانات اللاعب ====================
async function loadPlayerData(userId) {
    if (!supabaseClient) {
        console.error('❌ Supabase not initialized');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('players')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            console.log('✅ Player data loaded:', data);
            window.highScore = data.high_score || 0;
            updateUI();
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error loading player data:', error);
        return null;
    }
}

// ==================== حفظ النتيجة ====================
async function saveScore(score) {
    if (!supabaseClient || !currentUser) {
        console.warn('⚠️ Cannot save score: User not logged in');
        return false;
    }
    
    try {
        // حفظ النتيجة في جدول scores
        const { error: scoreError } = await supabaseClient
            .from('scores')
            .insert({
                user_id: currentUser.id,
                score: score,
                level: Math.floor(score / 100),
                created_at: new Date().toISOString()
            });
        
        if (scoreError) throw scoreError;
        
        // تحديث أفضل نتيجة إذا لزم الأمر
        if (score > window.highScore) {
            const { error: updateError } = await supabaseClient
                .from('players')
                .update({
                    high_score: score,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUser.id);
            
            if (updateError) throw updateError;
            
            window.highScore = score;
            console.log('✅ New high score saved:', score);
        }
        
        console.log('✅ Score saved successfully');
        
        // تحديث المتصدرين
        await loadLeaderboard();
        
        return true;
    } catch (error) {
        console.error('❌ Error saving score:', error);
        return false;
    }
}

// ==================== جلب المتصدرين ====================
async function loadLeaderboard() {
    if (!supabaseClient) {
        console.error('❌ Supabase not initialized');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('players')
            .select('username, high_score')
            .order('high_score', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        console.log('✅ Leaderboard loaded:', data);
        displayLeaderboard(data);
        
        return data;
    } catch (error) {
        console.error('❌ Error loading leaderboard:', error);
        return [];
    }
}

// ==================== عرض المتصدرين ====================
function displayLeaderboard(data) {
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="loading">لا توجد نتائج بعد</p>';
        return;
    }
    
    let html = '';
    data.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        html += `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">${medal || (index + 1)}</div>
                <div class="leaderboard-name">${player.username}</div>
                <div class="leaderboard-score">${player.high_score}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==================== تحديث واجهة المستخدم ====================
function updateUserUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    
    if (user) {
        // إخفاء زر تسجيل الدخول
        if (loginBtn) loginBtn.classList.add('hidden');
        
        // عرض معلومات المستخدم
        if (userProfile) userProfile.classList.remove('hidden');
        if (userName) {
            userName.textContent = user.user_metadata?.username || 
                                   user.email.split('@')[0];
        }
        
        // تحميل بيانات اللاعب
        loadPlayerData(user.id);
    } else {
        // عرض زر تسجيل الدخول
        if (loginBtn) loginBtn.classList.remove('hidden');
        
        // إخفاء معلومات المستخدم
        if (userProfile) userProfile.classList.add('hidden');
        
        // إعادة تعيين أفضل نتيجة
        window.highScore = 0;
        updateUI();
    }
}

// ==================== التحقق من المستخدم ====================
async function checkUser() {
    if (!supabaseClient) {
        await initSupabase();
    }
    
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
            currentUser = user;
            updateUserUI(user);
            console.log('✅ User authenticated:', user.email);
        } else {
            console.log('ℹ️ No user authenticated');
        }
        
        return user;
    } catch (error) {
        console.error('❌ Error checking user:', error);
        return null;
    }
}

// ==================== تصدير الوظائف ====================
window.initSupabase = initSupabase;
window.getSupabaseClient = getSupabaseClient;
window.getCurrentUser = getCurrentUser;
window.savePlayerData = savePlayerData;
window.loadPlayerData = loadPlayerData;
window.saveScore = saveScore;
window.loadLeaderboard = loadLeaderboard;
window.checkUser = checkUser;
window.updateUserUI = updateUserUI;

console.log('✅ Supabase-client.js loaded successfully');
