// ============================================
// SPEEDBALL 3D - MAIN GAME ENGINE
// ============================================

class SpeedballGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.trianglesPassed = 0;
        this.bestScore = 0;
        this.currentSpeed = CONFIG.GAME.BASE_SPEED * CONFIG.GAME.SPEED_MULTIPLIER;
        this.lastSpeedIncrease = 0;
        
        this.ballManager = null;
        this.roadManager = null;
        this.gameData = null;
        this.statsManager = null;
        this.coinManager = null;
        this.settingsManager = null;
        
        this.obstacles = [];
        this.particles = [];
        
        this.animationFrameId = null;
        this.lastTimestamp = 0;
        
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;
        
        console.log('Initializing Speedball Game...');
        
        this.setupCanvas();
        
        // تهيئة المانجرز
        this.ballManager = new BallManager();
        this.roadManager = new RoadManager();
        this.gameData = new GameData();
        this.statsManager = new StatsManager();
        this.coinManager = new CoinManager();
        this.settingsManager = new SettingsManager();
        
        this.loadBestScore();
        this.roadManager.initialize();
        
        // Generate initial obstacles
        for (let i = 0; i < CONFIG.OBSTACLES.INITIAL_COUNT; i++) {
            this.addObstacle(-i * CONFIG.OBSTACLES.SPAWN_DISTANCE - 20);
        }
        
        this.setupControls();
        
        // عرض الشاشة الترحيبية
        this.showWelcomeScreen();
        
        // بدء حلقة التصيير
        this.render();
        
        this.isInitialized = true;
        console.log('Game initialized successfully');
    }

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
        }
    }

    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height}`);
        };
        
        resize();
        window.addEventListener('resize', resize);
    }

    setupControls() {
        // زر PLAY
        const playBtn = document.getElementById('btnPlay');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }
        
        // زر START من الشاشة الترحيبية
        const startBtn = document.querySelector('.btn-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        // الأزرار الأخرى
        const roadBtn = document.getElementById('btnRoad');
        const sphereBtn = document.getElementById('btnSphere');
        const statsBtn = document.getElementById('btnStats');
        const settingsBtn = document.getElementById('btnSettings');
        
        if (roadBtn) roadBtn.addEventListener('click', () => this.showRoadModal());
        if (sphereBtn) sphereBtn.addEventListener('click', () => this.showSphereModal());
        if (statsBtn) statsBtn.addEventListener('click', () => this.showStatsModal());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.showSettingsModal());
        
        // التحكم باللمس/ماوس
        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleInput(e));
        
        // أزرار إغلاق المودال
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    handleInput(e) {
        if (this.gameState !== 'playing') return;
        
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        
        // Determine lane (0 = left, 1 = center, 2 = right)
        const third = this.canvas.width / 3;
        let lane;
        if (x < third) {
            lane = 0;
        } else if (x > third * 2) {
            lane = 2;
        } else {
            lane = 1;
        }
        
        if (this.ballManager && this.ballManager.currentBall) {
            this.ballManager.currentBall.moveTo(lane);
        }
    }

    togglePlay() {
        if (this.gameState === 'menu' || this.gameState === 'gameover') {
            this.startGame();
        } else if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    startGame() {
        console.log('Starting game...');
        
        // إخفاء الشاشة الترحيبية
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
        
        // إعادة تعيين حالة اللعبة
        this.gameState = 'playing';
        this.score = 0;
        this.trianglesPassed = 0;
        this.currentSpeed = CONFIG.GAME.BASE_SPEED * CONFIG.GAME.SPEED_MULTIPLIER;
        this.lastSpeedIncrease = 0;
        
        this.obstacles = [];
        this.particles = [];
        
        if (this.coinManager) {
            this.coinManager.initialize();
        }
        
        if (this.ballManager && this.ballManager.currentBall) {
            this.ballManager.currentBall.reset();
        }
        
        if (this.roadManager) {
            this.roadManager.reset();
        }
        
        // إنشاء العقبات الأولية
        for (let i = 0; i < CONFIG.OBSTACLES.INITIAL_COUNT; i++) {
            this.addObstacle(-i * CONFIG.OBSTACLES.SPAWN_DISTANCE - 20);
        }
        
        // تحديث واجهة المستخدم
        this.updateUI();
        
        // تغيير زر التشغيل
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        
        // بدء حلقة اللعبة
        this.gameLoop();
    }

    pauseGame() {
        this.gameState = 'paused';
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resumeGame() {
        this.gameState = 'playing';
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        
        this.gameLoop();
    }

    gameOver() {
        this.gameState = 'gameover';
        
        // تحديث الإحصائيات
        if (this.statsManager) {
            this.statsManager.addGame(this.score, this.trianglesPassed);
        }
        
        if (this.gameData) {
            this.gameData.save();
        }
        
        // التحقق من أعلى نتيجة
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
        
        // التحقق من فتح الكرات
        if (this.ballManager && this.statsManager) {
            this.ballManager.checkUnlocks(this.statsManager.getStats());
        }
        
        // تغيير زر التشغيل
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        
        // عرض نتيجة اللعبة
        setTimeout(() => {
            alert(`🎮 Game Over!\n🏆 Score: ${this.score}\n🔺 Triangles: ${this.trianglesPassed}`);
        }, 500);
    }

    addObstacle(z) {
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const size = CONFIG.OBSTACLES.MIN_SIZE + 
                    Math.random() * (CONFIG.OBSTACLES.MAX_SIZE - CONFIG.OBSTACLES.MIN_SIZE);
        
        this.obstacles.push({
            x: lane * CONFIG.BALL.LANE_WIDTH,
            y: -1.5,
            z: z,
            size: size,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * CONFIG.OBSTACLES.ROTATION_SPEED,
            number: Math.floor(Math.random() * 
                   (CONFIG.OBSTACLES.MAX_NUMBER - CONFIG.OBSTACLES.MIN_NUMBER + 1)) + 
                   CONFIG.OBSTACLES.MIN_NUMBER,
            hit: false,
            color: (this.ballManager && this.ballManager.currentBall) ? 
                   this.ballManager.currentBall.type.color : '#00FF00'
        });
    }

    createParticles(x, y, z, color) {
        if (!CONFIG.GRAPHICS.PARTICLE_EFFECTS) return;
        
        for (let i = 0; i < CONFIG.PARTICLES.COUNT_PER_HIT; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 0.5,
                y: y + (Math.random() - 0.5) * 0.5,
                z: z + (Math.random() - 0.5) * 0.5,
                vx: (Math.random() - 0.5) * CONFIG.PARTICLES.VELOCITY_RANGE,
                vy: (Math.random() - 0.5) * CONFIG.PARTICLES.VELOCITY_RANGE,
                vz: (Math.random() - 0.5) * CONFIG.PARTICLES.VELOCITY_RANGE,
                life: 1,
                color: color
            });
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        // تحديث السرعة كل 10 مثلثات
        if (this.trianglesPassed >= this.lastSpeedIncrease + CONFIG.GAME.SPEED_INCREMENT_INTERVAL) {
            const increments = Math.floor(this.trianglesPassed / CONFIG.GAME.SPEED_INCREMENT_INTERVAL);
            this.currentSpeed = CONFIG.GAME.BASE_SPEED * 
                               (CONFIG.GAME.SPEED_MULTIPLIER + increments * CONFIG.GAME.SPEED_INCREMENT);
            this.lastSpeedIncrease = Math.floor(this.trianglesPassed / CONFIG.GAME.SPEED_INCREMENT_INTERVAL) * 
                                    CONFIG.GAME.SPEED_INCREMENT_INTERVAL;
        }

        // تحديث الكرة
        if (this.ballManager && this.ballManager.currentBall) {
            this.ballManager.currentBall.update();
        }

        // تحديث الطريق
        if (this.roadManager) {
            this.roadManager.update(this.currentSpeed);
        }

        // تحديث العملات
        if (this.coinManager && this.ballManager && this.ballManager.currentBall) {
            const ballPos = this.ballManager.currentBall.getPosition();
            this.coinManager.update(this.currentSpeed, ballPos);
        }

        // تحديث العقبات
        this.updateObstacles();

        // تحديث الجزيئات
        this.updateParticles();

        // تحديث واجهة المستخدم
        this.updateUI();
    }

    updateObstacles() {
        const ball = this.ballManager ? this.ballManager.currentBall : null;
        if (!ball) return;

        this.obstacles = this.obstacles.filter(obs => {
            obs.z += this.currentSpeed * 0.1;
            obs.rotation += obs.rotationSpeed;

            // التحقق من الاصطدام
            if (!obs.hit && obs.z > -1 && obs.z < 1) {
                const dist = Math.sqrt(
                    Math.pow(obs.x - ball.x, 2) + 
                    Math.pow(obs.z - ball.z, 2)
                );

                if (dist < CONFIG.OBSTACLES.COLLISION_DISTANCE) {
                    obs.hit = true;
                    this.trianglesPassed++;
                    this.score += obs.number;
                    this.createParticles(obs.x, obs.y, obs.z, obs.color);
                    
                    // حفظ التقدم
                    if (this.gameData) {
                        this.gameData.addScore(obs.number);
                    }
                }
            }

            // إزالة إذا تجاوزت
            if (obs.z > 15) {
                const lastZ = this.obstacles.length > 0 ? 
                    Math.min(...this.obstacles.map(o => o.z)) : 0;
                this.addObstacle(lastZ - CONFIG.OBSTACLES.SPAWN_DISTANCE);
                return false;
            }

            return true;
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life -= CONFIG.PARTICLES.LIFE_DECAY;
            return p.life > 0;
        });
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // مسح الشاشة مع تأثير التلاشي
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, w, h);

        // تصيير الطريق
        if (this.roadManager) {
            this.roadManager.render(ctx, this.canvas);
        }

        // تصيير العقبات
        this.renderObstacles();

        // تصيير العملات
        if (this.coinManager) {
            this.coinManager.render(ctx, this.canvas);
        }

        // تصيير الكرة
        if (this.ballManager && this.ballManager.currentBall) {
            this.ballManager.currentBall.render(ctx, this.canvas);
        }

        // تصيير الجزيئات
        this.renderParticles();
        
        // طلب الإطار التالي للتصيير
        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    renderObstacles() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.obstacles.forEach(obs => {
            if (obs.hit) return;

            const perspective = 1 / (1 + obs.z * 0.1);
            const screenX = w / 2 + obs.x * 100 * perspective;
            const screenY = h * 0.7 + obs.y * 50 * perspective;
            const size = obs.size * 60 * perspective;

            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(obs.rotation);

            // الظل
            if (CONFIG.GRAPHICS.SHADOWS) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.moveTo(0, -size + 5);
                ctx.lineTo(-size * 0.866 + 5, size * 0.5 + 5);
                ctx.lineTo(size * 0.866 + 5, size * 0.5 + 5);
                ctx.closePath();
                ctx.fill();
            }

            // التوهج
            if (CONFIG.GRAPHICS.GLOW_EFFECTS) {
                const glowGradient = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 1.5);
                glowGradient.addColorStop(0, obs.color + '80');
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // المثلث
            const gradient = ctx.createLinearGradient(0, -size, 0, size);
            gradient.addColorStop(0, obs.color);
            gradient.addColorStop(1, obs.color + '80');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(-size * 0.866, size * 0.5);
            ctx.lineTo(size * 0.866, size * 0.5);
            ctx.closePath();
            ctx.fill();

            // الحدود
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // الرقم
            ctx.fillStyle = '#000';
            ctx.font = `bold ${size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obs.number, 0, size * 0.1);

            ctx.restore();
        });
    }

    renderParticles() {
        if (!CONFIG.GRAPHICS.PARTICLE_EFFECTS) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.particles.forEach(p => {
            const perspective = 1 / (1 + p.z * 0.1);
            const screenX = w / 2 + p.x * 100 * perspective;
            const screenY = h * 0.7 + p.y * 50 * perspective;

            ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(screenX, screenY, CONFIG.PARTICLES.SIZE * perspective * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.update();
        
        // طلب الإطار التالي
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    updateUI() {
        const currentScoreEl = document.getElementById('currentScore');
        const bestScoreEl = document.getElementById('bestScore');
        const triangleCountEl = document.getElementById('triangleCount');
        const speedValueEl = document.getElementById('speedValue');
        
        if (currentScoreEl) currentScoreEl.textContent = this.score;
        if (bestScoreEl) bestScoreEl.textContent = this.bestScore;
        if (triangleCountEl) triangleCountEl.textContent = this.trianglesPassed;
        if (speedValueEl) {
            speedValueEl.textContent = Math.floor((this.currentSpeed / CONFIG.GAME.BASE_SPEED) * 100) + '%';
        }
    }

    saveBestScore() {
        localStorage.setItem('speedballBestScore', this.bestScore.toString());
    }

    loadBestScore() {
        const saved = localStorage.getItem('speedballBestScore');
        this.bestScore = saved ? parseInt(saved) : 0;
    }

    showRoadModal() {
        this.openModal('roadModal');
        if (typeof populateRoadList === 'function') {
            populateRoadList();
        }
    }

    showSphereModal() {
        this.openModal('sphereModal');
        if (typeof populateSphereGrid === 'function') {
            populateSphereGrid();
        }
    }

    showStatsModal() {
        this.openModal('statsModal');
        if (typeof updateStatsDisplay === 'function') {
            updateStatsDisplay();
        }
    }

    showSettingsModal() {
        this.openModal('settingsModal');
        if (typeof initializeSettingsUI === 'function') {
            initializeSettingsUI();
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// تهيئة اللعبة عند تحميل الصفحة
let game = null;

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    
    // إنشاء مثيل اللعبة
    game = new SpeedballGame();
    
    // تهيئة اللعبة بعد تحميل جميع الموارد
    setTimeout(() => {
        if (game && typeof game.initialize === 'function') {
            game.initialize();
        }
    }, 100);
});

// الدوال العامة للأزرار
function startGame() {
    if (game && typeof game.startGame === 'function') {
        game.startGame();
    }
}

function openModal(modalId) {
    if (game && typeof game.openModal === 'function') {
        game.openModal(modalId);
    }
}

function closeModal(modalId) {
    if (game && typeof game.closeModal === 'function') {
        game.closeModal(modalId);
    }
}
