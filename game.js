/**
 * ملف game.js
 * المسؤول عن: إدارة حلقة اللعبة (Loop)، حساب الوقت، التعامل مع الاصطدامات، والنقاط.
 */

const Game = (function() {
    let canvas, ctx;
    let lastTime = 0;
    let isRunning = false;
    
    // إحصائيات اللعبة
    let stats = {
        score: 0,
        obstaclesPassed: 0,
        baseSpeed: 300,
        currentSpeed: 300,
        distance: 0
    };

    // كائنات خارجية سيتم ربطها
    let roads = null;
    let balls = null;

    function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        
        // ضبط الحجم
        resize();
        window.addEventListener('resize', resize);

        // ربط الأحداث
        canvas.addEventListener('mousedown', handleInput);
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); }, {passive: false});
        window.addEventListener('keydown', (e) => { if(e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'ArrowLeft') handleInput(); });

        // بدء حلقة الرسم
        requestAnimationFrame(loop);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if(roads) roads.resize(canvas.width, canvas.height);
    }

    function handleInput() {
        if (!isRunning) return;
        // طلب من ملف الكرات تحريك اللاعب
        if (balls) balls.switchLane();
    }

    function toggle() {
        isRunning = !isRunning;
        const btn = document.querySelector('.main-play');
        const tutorial = document.getElementById('tutorial');
        
        if (isRunning) {
            btn.innerHTML = '⏸️';
            tutorial.style.display = 'none';
        } else {
            btn.innerHTML = '▶️';
            tutorial.style.display = 'block';
            if(stats.score === 0) tutorial.innerText = "اضغط للبدء";
            else tutorial.innerText = "إيقاف مؤقت";
        }
    }

    function reset() {
        stats.score = 0;
        stats.obstaclesPassed = 0;
        stats.currentSpeed = stats.baseSpeed;
        stats.distance = 0;
        if (roads) roads.reset();
        if (balls) balls.reset();
        UI.updateScore(0, stats.currentSpeed);
    }

    function loop(timestamp) {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (isRunning) {
            update(dt);
            draw();
        } else if (stats.score === 0) {
            // شاشة المينا (خلفية متحركة)
            draw();
        }

        requestAnimationFrame(loop);
    }

    function update(dt) {
        // تحديث المسافة
        stats.distance += stats.currentSpeed * dt;

        // تحديث الطريق والعقبات
        if (roads) {
            roads.update(dt, stats.distance, stats.currentSpeed);
            
            // فحص الاصطدام
            const playerState = balls ? balls.getState() : {lane: 0, visualX: 0};
            const collision = roads.checkCollision(playerState);
            
            if (collision) {
                gameOver();
            } else {
                // احتساب النقاط
                const points = roads.getPoints();
                if (points > stats.score) {
                    stats.score = points;
                    stats.obstaclesPassed++;
                    // زيادة السرعة كل 15 عقبة
                    if (stats.obstaclesPassed % 15 === 0) {
                        stats.currentSpeed += stats.currentSpeed * 0.15;
                        // تأثير بصري بسيط
                        document.querySelector('.speed-box').style.color = '#fff';
                        setTimeout(() => document.querySelector('.speed-box').style.color = '#ffcc00', 200);
                    }
                    UI.updateScore(stats.score, stats.currentSpeed);
                }
            }
        }

        // تحديث حركة اللاعب
        if (balls) balls.update(dt);
    }

    function draw() {
        // مسح الشاشة
        ctx.fillStyle = "#001133";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // رسم الطريق
        if (roads) roads.draw(ctx, stats.distance);

        // رسم اللاعب
        if (balls) balls.draw(ctx);
    }

    function gameOver() {
        isRunning = false;
        UI.showGameOver(stats.score);
        document.querySelector('.main-play').innerHTML = '▶️';
    }

    return {
        init,
        toggle,
        reset,
        getSpeed: () => stats.currentSpeed
    };
})();
