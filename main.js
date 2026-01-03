// ==================== MAIN.JS - مبسط ====================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 بدء اللعبة...');
    
    // تهيئة Supabase
    if (window.initSupabase) {
        await window.initSupabase();
    }
    
    // تهيئة الأحداث
    initEvents();
    
    // إخفاء شاشة التحميل بعد ثانيتين
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('gameContainer').classList.remove('hidden');
        console.log('✅ اللعبة جاهزة!');
    }, 2000);
});

function initEvents() {
    // حدث تبديل وضع المصادقة
    document.getElementById('toggleAuthMode').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.toggleAuthMode) window.toggleAuthMode();
    });
    
    // حدث إرسال نموذج المصادقة
    document.getElementById('authSubmitBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.signIn) window.signIn();
    });
    
    // السماح بالإرسال بـ Enter
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('authSubmitBtn').click();
        }
    });
}

// وظائف اللعبة الأساسية
function startGame() {
    console.log('🚀 بدء اللعبة');
    document.getElementById('menuScreen').classList.add('hidden');
    window.gameState = 'playing';
}

function showMenu() {
    document.getElementById('menuScreen').classList.remove('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
}

function showLeaderboard() {
    alert('قائمة المتصدرين قريباً!');
}

function showInstructions() {
    alert('انقر للقفز، تجنب العوائق!');
}

function toggleSound() {
    alert('الصوت قريباً!');
}

// تصدير
window.startGame = startGame;
window.showMenu = showMenu;
window.showLeaderboard = showLeaderboard;
window.showInstructions = showInstructions;
window.toggleSound = toggleSound;

console.log('✅ Main.js محمل');
