// ball.js - إدارة الكرة
class Ball {
    constructor(scene, roadWidth) {
        this.scene = scene;
        this.roadWidth = roadWidth;
        this.radius = roadWidth / 2; // حجم الكرة = نصف حجم الطريق
        this.position = { x: 0, y: this.radius, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.moveSpeed = 0.15;
        this.color = 0xff0066;
        
        this.createBall();
        this.setupControls();
    }

    createBall() {
        // إنشاء هندسة الكرة
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        
        // مادة الكرة مع تأثير لامع
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            emissive: this.color,
            emissiveIntensity: 0.3,
            shininess: 100,
            specular: 0xffffff
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        // إضافة ظل للكرة
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.scene.add(this.mesh);
        
        // إضافة ضوء نقطي للكرة
        this.light = new THREE.PointLight(this.color, 1, 10);
        this.light.position.copy(this.mesh.position);
        this.scene.add(this.light);
    }

    setupControls() {
        this.keys = {
            left: false,
            right: false
        };

        // التحكم بلوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
            }
        });

        // التحكم باللمس (للهواتف)
        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        document.addEventListener('touchmove', (e) => {
            const touchX = e.touches[0].clientX;
            const diff = touchX - touchStartX;
            
            if (diff > 10) {
                this.keys.right = true;
                this.keys.left = false;
            } else if (diff < -10) {
                this.keys.left = true;
                this.keys.right = false;
            }
            
            touchStartX = touchX;
        });

        document.addEventListener('touchend', () => {
            this.keys.left = false;
            this.keys.right = false;
        });
    }

    update(roadPosition) {
        // تحريك الكرة يميناً ويساراً
        if (this.keys.left) {
            this.position.x -= this.moveSpeed;
        }
        if (this.keys.right) {
            this.position.x += this.moveSpeed;
        }

        // تحديد حركة الكرة داخل الطريق
        const maxX = (this.roadWidth / 2) - this.radius;
        this.position.x = Math.max(-maxX, Math.min(maxX, this.position.x));

        // تحديث موقع الكرة
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = roadPosition + 5; // الكرة أمام الطريق قليلاً

        // تحديث موقع الضوء
        this.light.position.copy(this.mesh.position);

        // دوران الكرة للأمام
        this.mesh.rotation.x += 0.1;
    }

    changeColor(color) {
        this.color = color;
        this.mesh.material.color.setHex(color);
        this.mesh.material.emissive.setHex(color);
        this.light.color.setHex(color);
    }

    reset() {
        this.position.x = 0;
        this.mesh.position.x = 0;
    }

    getPosition() {
        return {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z
        };
    }

    getBoundingBox() {
        return {
            minX: this.position.x - this.radius,
            maxX: this.position.x + this.radius,
            minZ: this.mesh.position.z - this.radius,
            maxZ: this.mesh.position.z + this.radius
        };
    }
}           x - this.size * 0.3, y - this.size * 0.3, this.size * 0.1,
            x, y, this.size
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.type.color);
        gradient.addColorStop(1, this.type.color + '80');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    renderRainbowBall(ctx, x, y) {
        const gradient = ctx.createConicGradient(this.rotation, x, y);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.16, '#FF7F00');
        gradient.addColorStop(0.33, '#FFFF00');
        gradient.addColorStop(0.5, '#00FF00');
        gradient.addColorStop(0.66, '#0000FF');
        gradient.addColorStop(0.83, '#8B00FF');
        gradient.addColorStop(1, '#FF0000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    renderTrail(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;

        this.trail.forEach((point, i) => {
            const screenX = w / 2 + point.x * 100;
            const screenY = h * 0.7 + point.y * 50;
            const size = this.size * 0.5 * point.alpha;

            ctx.fillStyle = this.type.trailColor.slice(0, -2) + 
                           Math.floor(point.alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    getPosition() {
        return { x: this.x, y: this.y, z: this.z };
    }

    reset() {
        this.x = 0;
        this.y = CONFIG.BALL.START_Y;
        this.z = CONFIG.BALL.START_Z;
        this.targetLane = 1;
        this.currentLane = 1;
        this.trail = [];
    }
}

// Ball Manager
class BallManager {
    constructor() {
        this.availableBalls = BALL_TYPES;
        this.currentBall = null;
        this.loadProgress();
    }

    selectBall(ballId) {
        const ballType = this.availableBalls.find(b => b.id === ballId);
        if (ballType && ballType.unlocked) {
            this.currentBall = new Ball(ballType);
            this.saveProgress();
            return true;
        }
        return false;
    }

    unlockBall(ballId) {
        const ball = this.availableBalls.find(b => b.id === ballId);
        if (ball) {
            ball.unlocked = true;
            this.saveProgress();
        }
    }

    checkUnlocks(stats) {
        // Check unlock conditions
        this.availableBalls.forEach(ball => {
            if (!ball.unlocked && ball.unlockCondition) {
                if (ball.unlockCondition.includes('Score') && 
                    stats.highestScore >= parseInt(ball.unlockCondition.match(/\d+/)[0])) {
                    this.unlockBall(ball.id);
                } else if (ball.unlockCondition.includes('Play') && 
                          stats.totalGames >= parseInt(ball.unlockCondition.match(/\d+/)[0])) {
                    this.unlockBall(ball.id);
                }
            }
        });
    }

    saveProgress() {
        const progress = {
            unlockedBalls: this.availableBalls.filter(b => b.unlocked).map(b => b.id),
            currentBallId: this.currentBall?.type.id || 1
        };
        localStorage.setItem('ballProgress', JSON.stringify(progress));
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('ballProgress');
            if (saved) {
                const progress = JSON.parse(saved);
                progress.unlockedBalls.forEach(id => {
                    const ball = this.availableBalls.find(b => b.id === id);
                    if (ball) ball.unlocked = true;
                });
                this.selectBall(progress.currentBallId || 1);
            } else {
                this.selectBall(1);
            }
        } catch (e) {
            this.selectBall(1);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Ball, BallManager, BALL_TYPES };
}