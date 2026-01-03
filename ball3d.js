// نظام إدارة صور الكرات
class BallManager3D {
    constructor() {
        this.images = {};
        this.currentBallIndex = 0;
        this.ballTypes = [
            { name: 'EUR', path: 'images/Ball1-eur.png', color: '#3498db' },
            { name: 'CAD', path: 'images/Ball2-cad.png', color: '#2ecc71' },
            { name: 'DZ', path: 'images/Ball3-dz.png', color: '#e74c3c' }
        ];
    }

    async loadImages() {
        const promises = this.ballTypes.map(ball => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = ball.path;
                img.onload = () => {
                    this.images[ball.name] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.error('خطأ في تحميل:', ball.path);
                    resolve();
                };
            });
        });
        await Promise.all(promises);
    }

    getCurrentBall() {
        return this.ballTypes[this.currentBallIndex];
    }

    nextBall() {
        this.currentBallIndex = (this.currentBallIndex + 1) % this.ballTypes.length;
        return this.getCurrentBall();
    }

    getCurrentImage() {
        const current = this.getCurrentBall();
        return this.images[current.name];
    }
}

// الكرة الرئيسية للاعب
class PlayerBall3D {
    constructor(x, y, ballManager) {
        this.x = x;
        this.y = y;
        this.radius = 25;
        this.speed = 5;
        this.velocityX = 0;
        this.velocityY = 0;
        this.ballManager = ballManager;
        
        // تأثير 3D
        this.rotation = 0;
        this.depth = 15;
        this.highlight = {
            x: 0.7,
            y: 0.3,
            size: 0.3
        };
    }

    update(mouseX, mouseY, canvas) {
        // حركة نحو اللمس
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.velocityX = (dx / distance) * this.speed;
            this.velocityY = (dy / distance) * this.speed;
        } else {
            this.velocityX *= 0.9;
            this.velocityY *= 0.9;
        }
        
        // تحديث الموقع
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // البقاء داخل الشاشة
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        
        // دوران للحركة
        this.rotation += Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY) * 0.05;
    }

    draw(ctx) {
        const ballType = this.ballManager.getCurrentBall();
        const img = this.ballManager.getCurrentImage();
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (img && img.complete) {
            // رسم الصورة بشكل دائري مع تأثير 3D
            this.draw3DBall(ctx, img, ballType.color);
        } else {
            // رسم بديل إذا لم تحمل الصورة
            this.draw3DSphere(ctx, ballType.color);
        }
        
        ctx.restore();
    }

    draw3DBall(ctx, img, color) {
        // دائرة أساسية
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        
        // قص للشكل الدائري
        ctx.clip();
        
        // رسم الصورة
        ctx.drawImage(
            img,
            -this.radius,
            -this.radius,
            this.radius * 2,
            this.radius * 2
        );
        
        // تأثير 3D (ظل وبرّيق)
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        
        // تدرج لوني للعمق
        const gradient = ctx.createRadialGradient(
            0, 0, this.radius * 0.3,
            0, 0, this.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // بريق
        ctx.beginPath();
        ctx.arc(
            this.radius * 0.3,
            -this.radius * 0.3,
            this.radius * 0.2,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        
        // حدود
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    draw3DSphere(ctx, color) {
        // رسم كرة 3D بدون صورة
        const gradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, this.radius
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // بريق
        ctx.beginPath();
        ctx.arc(this.radius * 0.4, -this.radius * 0.4, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// المثلثات (العوائق)
class TriangleObstacle {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update(canvas) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // ارتداد من الحواف
        if (this.x < this.size || this.x > canvas.width - this.size) {
            this.speedX *= -1;
        }
        if (this.y < this.size || this.y > canvas.height - this.size) {
            this.speedY *= -1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // مثلث أحمر مع تأثير 3D
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.866, this.size * 0.5);
        ctx.lineTo(-this.size * 0.866, this.size * 0.5);
        ctx.closePath();
        
        // تدرج لوني
        const gradient = ctx.createLinearGradient(0, -this.size, 0, this.size);
        gradient.addColorStop(0, '#ff4757');
        gradient.addColorStop(1, '#ff3838');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // حدود متوهجة
        ctx.strokeStyle = '#ff6b81';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.restore();
    }

    checkCollision(ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + ball.radius);
    }
}

export { BallManager3D, PlayerBall3D, TriangleObstacle };
