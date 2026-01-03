// ==================== MAIN.JS - بداية التشغيل ====================

// متغيرات عامة
let soundEnabled = true;

// ==================== تحميل الصفحة ====================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 SpeedBall 3D - Loading...');
    
    try {
        // تهيئة Supabase
        await initSupabase();
        console.log('✅ Supabase initialized');
        
        // التحقق من المستخدم
        await checkUser();
        console.log('✅ User checked');
        
        // تحميل المتصدرين
        await loadLeaderboard();
        console.log('✅ Leaderboard loaded');
        
        // إخفاء شاشة التحميل
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            console.log('✅ Game ready!');
        }, 1500);
        
        // تهيئة الأحداث
        initializeEvents();
        console.log('✅ Events initialized');
        
    } catch (error) {
        console.error('❌ Error loading game:', error);
        alert('حدث خطأ أثناء تحميل اللعبة. يرجى إعادة تحميل الصفحة.');
    }
});

// ==================== تهيئة الأحداث ====================
function initializeEvents() {
    // حدث النقر على Canvas للقفز
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.addEventListener('click', (e) => {
        // تجنب القفز عند النقر على الأزرار أو الشاشات
        if (e.target.closest('.game-screen, .btn')) return;
        
        if (window.gameState === 'playing') {
            jump();
        }
    });
    
    // حدث لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        if (window.gameState === 'playing') {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
            if (e.code === 'KeyP') {
                togglePause();
            }
        }
    });
    
    // حدث تغيير وضع المصادقة
    document.getElementById('toggleAuthMode').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });
    
    // حدث إرسال نموذج المصادقة
    document.getElementById('authSubmitBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const isSignUp = document.getElementById('username').classList.contains('hidden') === false;
        
        if (isSignUp) {
            signUp();
        } else {
            signIn();
        }
    });
    
    // السماح بالإرسال عند الضغط على Enter
    ['username', 'email', 'password'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('authSubmitBtn').click();
                }
            });
        }
    });
}

// ==================== وظائف شاشة المصادقة ====================
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function toggleAuthMode() {
    const usernameInput = document.getElementById('username');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const toggleLink = document.getElementById('toggleAuthMode');
    
    const isSignUp = usernameInput.classList.contains('hidden');
    
    if (isSignUp) {
        // التبديل إلى وضع التسجيل
        usernameInput.classList.remove('hidden');
        authTitle.textContent = 'إنشاء حساب جديد';
        authSubmitBtn.innerHTML = '<i class="fas fa-user-plus"></i> تسجيل';
        toggleLink.textContent = 'لديك حساب؟ سجل دخول';
    } else {
        // التبديل إلى وضع تسجيل الدخول
        usernameInput.classList.add('hidden');
        authTitle.textContent = 'تسجيل الدخول';
        authSubmitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
        toggleLink.textContent = 'ليس لديك حساب؟ سجل الآن';
    }
}

// ==================== وظائف القائمة ====================
function showMenu() {
    document.getElementById('menuScreen').classList.remove('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('instructionsScreen').classList.add('hidden');
    document.getElementById('leaderboardScreen').classList.add('hidden');
}

function showInstructions() {
    document.getElementById('instructionsScreen').classList.remove('hidden');
    document.getElementById('menuScreen').classList.add('hidden');
}

function hideInstructions() {
    document.getElementById('instructionsScreen').classList.add('hidden');
    document.getElementById('menuScreen').classList.remove('hidden');
}

function showLeaderboard() {
    document.getElementById('leaderboardScreen').classList.remove('hidden');
    document.getElementById('menuScreen').classList.add('hidden');
    loadLeaderboard();
}

function hideLeaderboard() {
    document.getElementById('leaderboardScreen').classList.add('hidden');
    document.getElementById('menuScreen').classList.remove('hidden');
}

// ==================== وظائف التحكم ====================
function togglePause() {
    if (window.gameState === 'playing') {
        window.gameState = 'paused';
        if (window.gameLoop) {
            clearInterval(window.gameLoop);
        }
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    } else if (window.gameState === 'paused') {
        window.gameState = 'playing';
        startGameLoop();
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('soundBtn');
    
    if (soundEnabled) {
        soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

// ==================== وظائف مساعدة ====================
function updateUI() {
    // تحديث النتيجة
    document.getElementById('score').textContent = window.score || 0;
    document.getElementById('highScore').textContent = window.highScore || 0;
    document.getElementById('lives').textContent = window.lives || 3;
    document.getElementById('speed').textContent = `${(window.speed || 1).toFixed(1)}x`;
}

function showGameOver() {
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = window.score || 0;
    document.getElementById('finalHighScore').textContent = window.highScore || 0;
    document.getElementById('pauseBtn').classList.add('hidden');
}

function hideGameOver() {
    document.getElementById('gameOverScreen').classList.add('hidden');
}

// ==================== تصدير الوظائف للاستخدام العام ====================
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.toggleAuthMode = toggleAuthMode;
window.showMenu = showMenu;
window.showInstructions = showInstructions;
window.hideInstructions = hideInstructions;
window.showLeaderboard = showLeaderboard;
window.hideLeaderboard = hideLeaderboard;
window.togglePause = togglePause;
window.toggleSound = toggleSound;
window.updateUI = updateUI;
window.showGameOver = showGameOver;
window.hideGameOver = hideGameOver;
window.soundEnabled = soundEnabled;

console.log('✅ Main.js loaded successfully');
