// ============================================
// SPEEDBALL 3D - MAIN GAME ENGINE
// ============================================

class SpeedballGame {
    constructor() {
        console.log('🎮 Creating game...');
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.gameState = 'menu';
        this.score = 0;
        this.trianglesPassed = 0;
        this.bestScore = 0;
        this.currentSpeed = CONFIG.GAME.BASE_SPEED * CONFIG.GAME.SPEED_MULTIPLIER;
        this.lastSpeedIncrease = 0;
        
        this.ballManager = new BallManager();
        this.roadManager = new RoadManager();
        this.gameData = new GameData();
        this.statsManager = new StatsManager();
        this.settingsManager = new SettingsManager();
        
        this.obstacles = [];
        this.particles = [];
        this.animationId = null;
        
        this.initialize();
    }

    initialize() {
        console.log('🔧 Initializing game...');
        this.setupCanvas();
        this.setupControls();
        this.loadBestScore();
        this.roadManager.initialize();
        
        for (let i = 0; i < CONFIG.OBSTACLES.INITIAL_COUNT; i++) {
            this.addObstacle(-i * CONFIG.OBSTACLES.SPAWN_DISTANCE - 20);
        }
        
        this.render();
        console.log('✅ Game initialized!');
    }

    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
    }

    setupControls() {
        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleInput(e), { passive: false });

        const btnPlay = document.getElementById('btnPlay');
        const btnRoad = document.getElementById('btnRoad');
        const btnSphere = document.getElementById('btnSphere');
        const btnStats = document.getElementById('btnStats');
        const btnSettings = document.getElementById('btnSettings');

        if (btnPlay) btnPlay.addEventListener('click', () => this.togglePlay());
        if (btnRoad) btnRoad.addEventListener('click', () => this.showRoadModal());
        if (btnSphere) btnSphere.addEventListener('click', () => this.showSphereModal());
        if (btnStats) btnStats.addEventListener('click', () => this.showStatsModal());
        if (btnSettings) btnSettings.addEventListener('click', () => this.showSettingsModal());
    }

    handleInput(e) {
        if (this.gameState !== 'playing') return;
        
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        
        const third = this.canvas.width / 3;
        let lane;
        if (x < third) {
            lane = 0;
        } else if (x > third * 2) {
            lane = 2;
        } else {
            lane = 1;
        }
        
        if (this.ballManager.currentBall) {
            this.ballManager.currentBall.moveTo(lane);
        }
    }

    togglePlay() {
        console.log('🎯 Toggle play:', this.gameState);
        if (this.gameState === 'menu' || this.gameState === 'gameover') {
            this.startGame();
        } else if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    startGame() {
        console.log('🚀 Starting game...');
        
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
        
        this.gameState = 'playing';
        this.score = 0;
        this.trianglesPassed = 0;
        this.currentSpeed = CONFIG.GAME.BASE_SPEED * CONFIG.GAME.SPEED_MULTIPLIER;
        this.lastSpeedIncrease = 0;
        
        this.obstacles = [];
        this.particles = [];
        
        if (this.ballManager.currentBall) {
            this.ballManager.currentBall.reset();
        }
        
        this.roadManager.reset();
        
        for (let i = 0; i < CONFIG.OBSTACLES.INITIAL_COUNT; i++) {
            this.addObstacle(-i * CONFIG.OBSTACLES.SPAWN_DISTANCE - 20);
        }
        
        this.updateUI();
        this.gameLoop();
        
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        
        console.log('✅ Game started!');
    }

    pauseGame() {
        this.gameState = 'paused';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    }

    resumeGame() {
        this.gameState = 'playing';
        this.gameLoop();
        
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
    }

    addObstacle(z) {
        const lane = Math.floor(Math.random() * 3) - 1;
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
            color: this.ballManager.currentBall?.type.color || '#00FF00'
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

        if (this.trianglesPassed >= this.lastSpeedIncrease + CONFIG.GAME.SPEED_INCREMENT_INTERVAL) {
            const increments = Math.floor(this.trianglesPassed / CONFIG.GAME.SPEED_INCREMENT_INTERVAL);
            this.currentSpeed = CONFIG.GAME.BASE_SPEED * 
                               (CONFIG.GAME.SPEED_MULTIPLIER + increments * CONFIG.GAME.SPEED_INCREMENT);
            this.lastSpeedIncrease = Math.floor(this.trianglesPassed / CONFIG.GAME.SPEED_INCREMENT_INTERVAL) * 
                                    CONFIG.GAME.SPEED_INCREMENT_INTERVAL;
        }

        if (this.ballManager.currentBall) {
            this.ballManager.currentBall.update();
        }

        this.roadManager.update(this.currentSpeed);
        this.updateObstacles();
        this.updateParticles();
        this.updateUI();
    }

    updateObstacles() {
        const ball = this.ballManager.currentBall;
        if (!ball) return;

        this.obstacles = this.obstacles.filter(obs => {
            obs.z += this.currentSpeed * 0.1;
            obs.rotation += obs.rotationSpeed;

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
                    this.gameData.addScore(obs.number);
                }
            }

            if (obs.z > 15) {
                const lastZ = Math.min(...this.obstacles.map(o => o.z));
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

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, w, h);

        this.roadManager.render(ctx, this.canvas);
        this.renderObstacles();

        if (this.ballManager.currentBall) {
            this.ballManager.currentBall.render(ctx, this.canvas);
        }

        this.renderParticles();
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

            if (CONFIG.GRAPHICS.GLOW_EFFECTS) {
                const glowGradient = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 1.5);
                glowGradient.addColorStop(0, obs.color + '80');
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

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

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

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

    updateUI() {
        const scoreEl = document.getElementById('currentScore');
        const bestEl = document.getElementById('bestScore');
        const triangleEl = document.getElementById('triangleCount');
        const speedEl = document.getElementById('speedValue');

        if (scoreEl) scoreEl.textContent = this.score;
        if (bestEl) bestEl.textContent = this.bestScore;
        if (triangleEl) triangleEl.textContent = this.trianglesPassed;
        if (speedEl) {
            speedEl.textContent = Math.floor((this.currentSpeed / CONFIG.GAME.BASE_SPEED) * 100) + '%';
        }
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.update();
        this.render();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    saveBestScore() {
        try {
            localStorage.setItem('speedballBestScore', this.bestScore.toString());
        } catch (e) {}
    }

    loadBestScore() {
        try {
            const saved = localStorage.getItem('speedballBestScore');
            this.bestScore = saved ? parseInt(saved) : 0;
        } catch (e) {
            this.bestScore = 0;
        }
    }

    showRoadModal() {
        openModal('roadModal');
        if (typeof populateRoadList === 'function') {
            populateRoadList();
        }
    }

    showSphereModal() {
        openModal('sphereModal');
        if (typeof populateSphereGrid === 'function') {
            populateSphereGrid();
        }
    }

    showStatsModal() {
        openModal('statsModal');
        if (typeof updateStatsDisplay === 'function') {
            updateStatsDisplay();
        }
    }

    showSettingsModal() {
        openModal('settingsModal');
    }
}

// Initialize
let game;
window.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded');
    try {
        game = new SpeedballGame();
        window.game = game;
        console.log('✅ Game ready!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
});

// Global functions
function startGame() {
    console.log('🎮 startGame called');
    if (window.game) {
        window.game.startGame();
    } else {
        console.error('❌ Game not found!');
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

console.log('✅ GAME loaded');
