// ==================== GAME.JS - محرك اللعبة ====================

// متغيرات اللعبة
window.gameState = 'menu'; // menu, playing, paused, gameover
window.score = 0;
window.highScore = 0;
window.lives = 3;
window.speed = 1;
window.gameLoop = null;
window.obstacleSpeed = 5;

// ==================== بدء اللعبة ====================
function startGame() {
    console.log('🎮 Starting game...');
    
    // إعادة تعيين القيم
    window.gameState = 'playing';
    window.score = 0;
    window.lives = 3;
    window.speed = 1;
    window.obstacleSpeed = 5;
    
    // إخفاء شاشة القائمة
    document.getElementById('menuScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    
    // إعادة تعيين الكرة
    resetBall();
    
    // مسح العوائق القديمة
    clearObstacles();
    
    // تحديث واجهة المستخدم
    updateUI();
    
    // بدء حلقة اللعبة
    startGameLoop();
}

// ==================== إعادة تشغيل اللعبة ====================
function restartGame() {
    console.log('🔄 Restarting game...');
    hideGameOver();
    startGame();
}

// ==================== حلقة اللعبة الرئيسية ====================
function startGameLoop() {
    if (window.gameLoop) {
        clearInterval(window.gameLoop);
    }
    
    window.gameLoop = setInterval(() => {
        if (window.gameState === 'playing') {
            gameUpdate();
        }
    }, 1000 / 60); // 60 FPS
}

// ==================== تحديث اللعبة ====================
function gameUpdate() {
    // تحديث الكرة
    updateBall();
    
    // تحديث العوائق
    updateObstacles();
    
    // توليد عوائق جديدة
    generateObstacles();
    
    // فحص الاصطدامات
    checkCollisions();
    
    // تحديث النتيجة
    updateScore();
    
    // تحديث السرعة
    updateSpeed();
    
    // تحديث واجهة المستخدم
    updateUI();
}

// ==================== تحديث النتيجة ====================
function updateScore() {
    window.score += Math.floor(window.speed * 0.1);
    
    // تحديث أفضل نتيجة
    if (window.score > window.highScore) {
        window.highScore = window.score;
    }
}

// ==================== تحديث السرعة ====================
function updateSpeed() {
    // زيادة السرعة تدريجياً
    window.speed += 0.001;
    window.obstacleSpeed = 5 + (window.speed - 1) * 3;
    
    // الحد الأقصى للسرعة
    if (window.speed > 5) {
        window.speed = 5;
    }
    if (window.obstacleSpeed > 20) {
        window.obstacleSpeed = 20;
    }
}

// ==================== فحص الاصطدامات ====================
function checkCollisions() {
    const ball = document.getElementById('ball');
    if (!ball) return;
    
    const ballRect = ball.getBoundingClientRect();
    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;
    const ballRadius = ballRect.width / 2;
    
    const obstacles = document.querySelectorAll('.obstacle');
    
    obstacles.forEach(obstacle => {
        const obstacleRect = obstacle.getBoundingClientRect();
        const obstacleCenterX = obstacleRect.left + obstacleRect.width / 2;
        const obstacleCenterY = obstacleRect.top + obstacleRect.height / 2;
        const obstacleRadius = obstacleRect.width / 2;
        
        // حساب المسافة بين مراكز الكرة والعائق
        const distance = Math.sqrt(
            Math.pow(ballCenterX - obstacleCenterX, 2) +
            Math.pow(ballCenterY - obstacleCenterY, 2)
        );
        
        // فحص الاصطدام
        if (distance < ballRadius + obstacleRadius - 10) {
            handleCollision(obstacle);
        }
    });
}

// ==================== معالجة الاصطدام ====================
function handleCollision(obstacle) {
    console.log('💥 Collision detected!');
    
    // إزالة العائق
    obstacle.remove();
    
    // تقليل الأرواح
    window.lives -= 1;
    
    // تأثير الاهتزاز
    vibrate();
    
    // فحص انتهاء اللعبة
    if (window.lives <= 0) {
        gameOver();
    }
}

// ==================== انتهاء اللعبة ====================
function gameOver() {
    console.log('💀 Game Over!');
    
    window.gameState = 'gameover';
    
    // إيقاف حلقة اللعبة
    if (window.gameLoop) {
        clearInterval(window.gameLoop);
        window.gameLoop = null;
    }
    
    // حفظ النتيجة
    saveScore(window.score);
    
    // عرض شاشة انتهاء اللعبة
    setTimeout(() => {
        showGameOver();
    }, 500);
}

// ==================== تأثير الاهتزاز ====================
function vibrate() {
    if ('vibrate' in navigator && window.soundEnabled) {
        navigator.vibrate(200);
    }
    
    // تأثير بصري
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.filter = 'brightness(0.5)';
        setTimeout(() => {
            ball.style.filter = 'brightness(1)';
        }, 200);
    }
}

// ==================== مسح اللعبة ====================
function clearGame() {
    if (window.gameLoop) {
        clearInterval(window.gameLoop);
        window.gameLoop = null;
    }
    clearObstacles();
    resetBall();
}

// ==================== تصدير الوظائف ====================
window.startGame = startGame;
window.restartGame = restartGame;
window.gameUpdate = gameUpdate;
window.gameOver = gameOver;
window.clearGame = clearGame;

console.log('✅ Game.js loaded successfully');
