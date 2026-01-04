const Game = (function() {
    let canvas, ctx;
    let isPlaying = false;
    let animationId;
    
    // ربط الأنظمة الفرعية
    let roads, balls;
    
    // بيانات اللعبة
    let speed = 300;
    let score = 0;
    let distance = 0;

    function init() {
        // ربط الملفات الخارجية (الربط الحرج)
        roads = window.Roads;
        balls = window.Balls;
        UI = window.UI;

        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        
        resize();
        window.addEventListener('resize', resize);
        
        // تفعيل اللمس والضغط
        canvas.addEventListener('mousedown', handleInput);
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); }, {passive: false});
        window.addEventListener('keydown', (e) => { if(e.code === 'Space') handleInput(); });

        // بدء حلقة الرسم حتى لو لم نلعب (للخلفية)
        reset();
        loop();
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if(roads) roads.resize(canvas.width, canvas.height);
    }

    function handleInput() {
        if (isPlaying && balls) balls.switchLane();
    }

    function toggle() {
        isPlaying = !isPlaying;
        const btn = document.querySelector('.main-btn');
        const txt = document.getElementById('tutorial-text');
        
        if (isPlaying) {
            btn.innerHTML = '⏸️';
            txt.style.display = 'none';
        } else {
            btn.innerHTML = '▶️';
            txt.style.display = 'block';
            if(score === 0) txt.innerText = "اضغط البداية ▶️";
            else txt.innerText = "إيقاف مؤقت";
        }
    }

    function reset() {
        score = 0;
        distance = 0;
        speed = 300;
        document.getElementById('score').innerText = score;
        document.getElementById('speed').innerText = "200%";
        if (roads) roads.reset();
        if (balls) balls.reset();
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    function update() {
        if (!isPlaying) return;

        distance += speed * 0.016; // dt تقريبي

        if (roads) roads.update(distance, speed);
        if (balls) balls.update();

        // التحقق من الاصطدام
        if (roads && balls) {
            const playerPos = balls.getPosition();
            if (roads.checkCollision(playerPos)) {
                gameOver();
            } else {
                // تحديث النقاط
                const currentScore = roads.getScore();
                if (currentScore > score) {
                    score = currentScore;
                    // زيادة السرعة
                    if (score % 15 === 0) speed += 30;
                    
                    document.getElementById('score').innerText = score;
                    document.getElementById('speed').innerText = Math.floor(speed) + "%";
                }
            }
        }
    }

    function draw() {
        // مسح الشاشة
        ctx.fillStyle = "#000510";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (roads) roads.draw(ctx, distance);
        if (balls) balls.draw(ctx);
    }

    function gameOver() {
        isPlaying = false;
        document.querySelector('.main-btn').innerHTML = '▶️';
        UI.showGameOver(score);
    }

    return {
        init,
        toggle,
        reset
    };
})();

// تشغيل اللعبة عند التحميل
window.onload = function() {
    Game.init();
};
