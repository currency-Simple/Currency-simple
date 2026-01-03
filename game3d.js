import { BallManager3D, PlayerBall3D, TriangleObstacle } from './ball3d.js';

class Game3D {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // إعداد الشاشة
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // عناصر واجهة المستخدم
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.ballNameElement = document.getElementById('ball-name');
        
        // أزرار التحكم
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.changeBallBtn = document.getElementById('change-ball');
        
        // حالة اللعبة
        this.score = 0;
        this.lives = 3;
        this.isPlaying = false;
        this.gameOver = false;
        
        // إدارة الكرات
        this.ballManager = new BallManager3D();
        this.playerBall = null;
        
        // العناصر
        this.triangles = [];
        this.stars = [];
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        
        // إعداد الأحداث
        this.setupEvents();
        
        // البدء
        this.init();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    async init() {
        // تحميل الصور
        await this.ballManager.loadImages();
        
        // إنشاء الكرة
        this.playerBall = new PlayerBall3D(
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.ballManager
        );
        
        // إنشاء المثلثات
        this.createTriangles(5);
        
        // تحديث اسم الكرة
        this.updateBallName();
        
        // بدء اللعبة
        this.gameLoop();
    }

    setupEvents() {
        // لمس الشاشة
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - this.canvas.getBoundingClientRect().left;
            this.mouseY = touch.clientY - this.canvas.getBoundingClientRect().top;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - this.canvas.getBoundingClientRect().left;
            this.mouseY = touch.clientY - this.canvas.getBoundingClientRect().top;
        });

        // زر البداية
        this.startBtn.addEventListener('click', () => {
            if (this.gameOver) {
                this.resetGame();
            }
            this.isPlaying = true;
            this.startBtn.textContent = 'إعادة التشغيل';
        });

        // زر الإيقاف
        this.pauseBtn.addEventListener('click', () => {
            this.isPlaying = !this.isPlaying;
            this.pauseBtn.textContent = this.isPlaying ? 'إيقاف' : 'متابعة';
        });

        // تغيير الكرة
        this.changeBallBtn.addEventListener('click', () => {
            this.ballManager.nextBall();
            this.updateBallName();
        });
    }

    createTriangles(count) {
        this.triangles = [];
        for (let i = 0; i < count; i++) {
            const size = 20 + Math.random() * 20;
            const x = Math.random() * (this.canvas.width - size * 2) + size;
            const y = Math.random() * (this.canvas.height - size * 2) + size;
            this.triangles.push(new TriangleObstacle(x, y, size));
        }
    }

    updateBallName() {
        const ball = this.ballManager.getCurrentBall();
        this.ballNameElement.textContent = ball.name;
    }

    update() {
        if (!this.isPlaying || this.gameOver) return;
        
        // تحديث الكرة
        this.playerBall.update(this.mouseX, this.mouseY, this.canvas);
        
        // تحديث المثلثات
        this.triangles.forEach(triangle => {
            triangle.update(this.canvas);
            
            // التحقق من التصادم
            if (triangle.checkCollision(this.playerBall)) {
                this.loseLife();
            }
        });
        
        // زيادة صعوبة اللعبة
        if (this.score > 0 && this.score % 100 === 0) {
            if (this.triangles.length < 15) {
                this.triangles.push(new TriangleObstacle(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    15 + Math.random() * 15
                ));
            }
        }
    }

    draw() {
        // خلفية
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // تأثير الشبكة
        this.drawGrid();
        
        // رسم المثلثات
        this.triangles.forEach(triangle => triangle.draw(this.ctx));
        
        // رسم الكرة
        this.playerBall.draw(this.ctx);
        
        // معلومات اللعبة
        this.drawHUD();
        
        // شاشة Game Over
        if (this.gameOver) {
            this.drawGameOver();
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // خطوط عمودية
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // خطوط أفقية
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawHUD() {
        // تحديث النقاط والأرواح
        this.scoreElement.textContent = `النقاط: ${this.score}`;
        this.livesElement.innerHTML = 'الأرواح: ' + '❤️'.repeat(this.lives);
        
        // زيادة النقاط مع الوقت
        if (this.isPlaying && !this.gameOver) {
            this.score += 1;
        }
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('انتهت اللعبة!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '30px Arial';
        this.ctx.fillText(`النتيجة النهائية: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('المس الشاشة لإعادة المحاولة', this.canvas.width / 2, this.canvas.height / 2 + 70);
    }

    loseLife() {
        this.lives--;
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.isPlaying = false;
        } else {
            // إعادة وضع الكرة
            this.playerBall.x = this.canvas.width / 2;
            this.playerBall.y = this.canvas.height / 2;
            
            // تأثير وميض
            this.flashEffect();
        }
    }

    flashEffect() {
        const originalFill = this.ctx.fillStyle;
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        setTimeout(() => {
            this.ctx.fillStyle = originalFill;
        }, 100);
    }

    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.triangles = [];
        this.createTriangles(5);
        
        this.playerBall.x = this.canvas.width / 2;
        this.playerBall.y = this.canvas.height / 2;
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    new Game3D();
});
