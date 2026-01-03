// ==================== BALL.JS - حركة الكرة ====================

// متغيرات الكرة
let ballY = 50; // نسبة مئوية من الأعلى
let ballVelocity = 0; // السرعة العمودية
let isJumping = false;
let isFalling = false;

// ثوابت الفيزياء
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MAX_FALL_SPEED = 20;
const GROUND_LEVEL = 85; // نسبة مئوية من الأعلى
const CEILING_LEVEL = 5;

// ==================== تهيئة الكرة ====================
function resetBall() {
    ballY = 50;
    ballVelocity = 0;
    isJumping = false;
    isFalling = false;
    
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.top = `${ballY}%`;
    }
}

// ==================== القفز ====================
function jump() {
    if (window.gameState !== 'playing') return;
    
    // السماح بالقفز المتعدد (يمكن تعطيله بإضافة شرط)
    ballVelocity = JUMP_FORCE;
    isJumping = true;
    isFalling = false;
    
    // تأثير صوتي (اختياري)
    playJumpSound();
    
    console.log('🦘 Jump!');
}

// ==================== تحديث موقع الكرة ====================
function updateBall() {
    const ball = document.getElementById('ball');
    if (!ball) return;
    
    // تطبيق الجاذبية
    ballVelocity += GRAVITY;
    
    // الحد الأقصى لسرعة السقوط
    if (ballVelocity > MAX_FALL_SPEED) {
        ballVelocity = MAX_FALL_SPEED;
    }
    
    // تحديث موقع الكرة
    ballY += ballVelocity;
    
    // فحص الحدود
    checkBounds();
    
    // تطبيق الموقع الجديد
    ball.style.top = `${ballY}%`;
    
    // تحديث حالة القفز
    if (ballVelocity > 0) {
        isFalling = true;
        isJumping = false;
    }
}

// ==================== فحص حدود الشاشة ====================
function checkBounds() {
    // الأرض
    if (ballY >= GROUND_LEVEL) {
        ballY = GROUND_LEVEL;
        ballVelocity = 0;
        isJumping = false;
        isFalling = false;
    }
    
    // السقف
    if (ballY <= CEILING_LEVEL) {
        ballY = CEILING_LEVEL;
        ballVelocity = 0;
    }
}

// ==================== الحصول على موقع الكرة ====================
function getBallPosition() {
    const ball = document.getElementById('ball');
    if (!ball) return null;
    
    const rect = ball.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: rect.width / 2,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right
    };
}

// ==================== تأثير القفز الصوتي ====================
function playJumpSound() {
    if (!window.soundEnabled) return;
    
    try {
        // يمكن إضافة Web Audio API هنا للأصوات
        // مثال بسيط:
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 400;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.warn('⚠️ Audio not supported:', error);
    }
}

// ==================== تأثير بصري للقفز ====================
function animateJump() {
    const ball = document.getElementById('ball');
    if (!ball) return;
    
    // تأثير التكبير عند القفز
    ball.style.transform = 'translateX(-50%) scale(1.2)';
    
    setTimeout(() => {
        ball.style.transform = 'translateX(-50%) scale(1)';
    }, 100);
}

// ==================== تصدير الوظائف ====================
window.jump = jump;
window.resetBall = resetBall;
window.updateBall = updateBall;
window.getBallPosition = getBallPosition;
window.ballY = ballY;
window.ballVelocity = ballVelocity;

console.log('✅ Ball.js loaded successfully');
