// game.js - محرك اللعبة الرئيسي
class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.ball = null;
        this.road = null;
        
        this.score = 0;
        this.baseSpeed = 3.0; // 300%
        this.currentSpeed = this.baseSpeed;
        this.speedIncrement = 0.3; // 30%
        this.trianglesPassed = 0;
        
        this.isGameRunning = false;
        this.isGameOver = false;
        
        this.roadWidth = 4;
        this.roadPosition = 0;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupLights();
        this.setupCamera();
        this.setupRenderer();
        
        // إنشاء الطريق والكرة
        this.road = new Road(this.scene, this.roadWidth);
        this.ball = new Ball(this.scene, this.roadWidth);
        
        // بدء حلقة اللعبة
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // ضباب للعمق
        this.scene.fog = new THREE.Fog(0x000000, 20, 60);
    }

    setupLights() {
        // ضوء محيطي
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // ضوء اتجاهي
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // أضواء ملونة للجو
        const light1 = new THREE.PointLight(0xff0066, 0.5, 50);
        light1.position.set(-5, 5, -10);
        this.scene.add(light1);
        
        const light2 = new THREE.PointLight(0x00ff88, 0.5, 50);
        light2.position.set(5, 5, -20);
        this.scene.add(light2);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 4, 8);
        this.camera.lookAt(0, 0, -5);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);
        
        // التعامل مع تغيير حجم النافذة
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isGameRunning && !this.isGameOver) {
            this.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        // تحديث موقع الطريق
        this.roadPosition -= this.currentSpeed / 10;
        
        // تحديث الكرة
        this.ball.update(this.roadPosition);
        
        // تحديث الطريق والمثلثات
        this.road.update(this.currentSpeed, this.ball.getPosition());
        
        // فحص التصادم
        const collision = this.road.checkCollision(this.ball.getBoundingBox());
        
        if (collision === true) {
            this.gameOver();
        } else if (collision === 'passed') {
            this.trianglePassed();
        }
        
        // تحديث الكاميرا لتتبع الكرة
        this.updateCamera();
    }

    trianglePassed() {
        this.score++;
        this.trianglesPassed++;
        
        // زيادة السرعة كل 10 مثلثات
        if (this.trianglesPassed % 10 === 0) {
            this.currentSpeed += this.speedIncrement;
        }
        
        // تحديث واجهة المستخدم
        this.updateUI();
    }

    updateCamera() {
        const ballPos = this.ball.getPosition();
        
        // الكاميرا تتبع الكرة
        this.camera.position.x = ballPos.x * 0.3;
        this.camera.position.y = 4;
        this.camera.position.z = ballPos.z + 8;
        
        this.camera.lookAt(ballPos.x, 0, ballPos.z - 5);
    }

    updateUI() {
        const scoreElement = document.getElementById('score');
        const speedElement = document.getElementById('speed');
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        if (speedElement) {
            const speedPercent = Math.round((this.currentSpeed / this.baseSpeed) * 300);
            speedElement.textContent = speedPercent + '%';
        }
    }

    start() {
        this.isGameRunning = true;
        this.isGameOver = false;
        document.getElementById('start-screen').style.display = 'none';
    }

    gameOver() {
        this.isGameOver = true;
        this.isGameRunning = false;
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over-screen').style.display = 'flex';
    }

    reset() {
        this.score = 0;
        this.trianglesPassed = 0;
        this.currentSpeed = this.baseSpeed;
        this.roadPosition = 0;
        this.isGameOver = false;
        
        this.ball.reset();
        this.road.reset();
        this.updateUI();
        
        document.getElementById('game-over-screen').style.display = 'none';
        this.isGameRunning = true;
    }

    setSpeed(speed) {
        this.baseSpeed = speed / 100;
        this.currentSpeed = this.baseSpeed;
    }

    changeBallColor(color) {
        this.ball.changeColor(parseInt(color.replace('#', '0x')));
    }

    changeRoadType(type) {
        this.road.changeRoadType(type);
    }
}random() - 0.5) * 0.5,
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

        // Update speed every 10 triangles
        if (this.trianglesPassed >= this.lastSpeedIncrease + CONFIG.GAME.SPEED_INCREMENT_INTERVAL) {
            const increments = Math.floor(this.trianglesPassed / CONFIG.GAME.SPEED_INCREMENT_INTERVAL);
            this.currentSpeed = CONFIG.GAME.BASE_SPEED * 
                               (CONFIG.GAME.SPEED_MULTIPLIER + increments * CONFIG.GAME.SPEED_INCREMENT);
            this.lastSpeedIncrease = Math.floor(this.trianglesPassed / CONFIG.GAME.SPEED_INCREMENT_INTERVAL) * 
                                    CONFIG.GAME.SPEED_INCREMENT_INTERVAL;
        }

        // Update ball
        if (this.ballManager.currentBall) {
            this.ballManager.currentBall.update();
        }

        // Update road
        this.roadManager.update(this.currentSpeed);

        // Update obstacles
        this.updateObstacles();

        // Update particles
        this.updateParticles();

        // Update UI
        this.updateUI();
    }

    updateObstacles() {
        const ball = this.ballManager.currentBall;
        if (!ball) return;

        this.obstacles = this.obstacles.filter(obs => {
            obs.z += this.currentSpeed * 0.1;
            obs.rotation += obs.rotationSpeed;

            // Check collision
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
                    
                    // Save progress
                    this.gameData.addScore(obs.number);
                }
            }

            // Remove if passed
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

        // Clear with fade
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, w, h);

        // Render road
        this.roadManager.render(ctx, this.canvas);

        // Render obstacles
        this.renderObstacles();

        // Render ball
        if (this.ballManager.currentBall) {
            this.ballManager.currentBall.render(ctx, this.canvas);
        }

        // Render particles
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

            // Shadow
            if (CONFIG.GRAPHICS.SHADOWS) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.moveTo(0, -size + 5);
                ctx.lineTo(-size * 0.866 + 5, size * 0.5 + 5);
                ctx.lineTo(size * 0.866 + 5, size * 0.5 + 5);
                ctx.closePath();
                ctx.fill();
            }

            // Glow
            if (CONFIG.GRAPHICS.GLOW_EFFECTS) {
                const glowGradient = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 1.5);
                glowGradient.addColorStop(0, obs.color + '80');
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Triangle
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

            // Outline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Number
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
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('triangleCount').textContent = this.trianglesPassed;
        document.getElementById('speedValue').textContent = 
            Math.floor((this.currentSpeed / CONFIG.GAME.BASE_SPEED) * 100) + '%';
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.update();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    saveBestScore() {
        localStorage.setItem('speedballBestScore', this.bestScore.toString());
    }

    loadBestScore() {
        const saved = localStorage.getItem('speedballBestScore');
        this.bestScore = saved ? parseInt(saved) : 0;
    }

    showRoadModal() {
        openModal('roadModal');
        populateRoadList();
    }

    showSphereModal() {
        openModal('sphereModal');
        populateSphereGrid();
    }

    showStatsModal() {
        openModal('statsModal');
        updateStatsDisplay();
    }

    showSettingsModal() {
        openModal('settingsModal');
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new SpeedballGame();
});

// Global functions for buttons
function startGame() {
    if (game) {
        game.startGame();
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
} gameState.maxSpeedReached = gameState.speedMultiplier;
        }
        
        uiSystem.updateSpeedDisplay(gameState.speedMultiplier);
    }
    
    if (coinsSystem.onObstaclePassed()) {
        const lane = Math.floor(Math.random() * 2);
        coinsSystem.createCoin(scene, lane);
    }
}

// ============================================
// GAME UPDATE LOOP
// ============================================

function updateGame() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    patternProgress += gameState.speed * 2.5;
    
    if (patternProgress >= CONFIG.ROAD.PATTERN_DISTANCE) {
        currentPatternIndex = (currentPatternIndex + 1) % CONFIG.ROAD_PATTERNS.length;
        patternProgress = 0;
    }
    
    const currentPattern = CONFIG.ROAD_PATTERNS[currentPatternIndex];
    
    if (currentPattern.xDir !== 0 || currentPattern.yDir !== 0) {
        const moveSpeed = 0.02;
        currentRoadOffset.x += currentPattern.xDir * moveSpeed;
        currentRoadOffset.y += currentPattern.yDir * moveSpeed;
    }
    
    // تحديث الطريق
    road.forEach(segment => {
        segment.position.z += gameState.speed * 2.5;
        segment.position.x = currentRoadOffset.x;
        segment.position.y = currentRoadOffset.y;
        
        if (segment.position.z > 15) {
            segment.position.z -= CONFIG.ROAD.TOTAL_LENGTH;
        }
    });
    
    // تحريك الكرة (ثابتة في الارتفاع، بدون جاذبية)
    const targetX = CONFIG.ROAD.LANE_POSITIONS[targetLane];
    ball.position.x += (targetX - ball.position.x) * CONFIG.BALL.LANE_CHANGE_SPEED;
    ball.position.y = CONFIG.BALL.FIXED_HEIGHT + CONFIG.BALL.SIZE; // ثابتة تماماً
    
    ball.rotation.x += 0.1;
    ball.rotation.z += 0.05;
    
    // إنشاء مثلثات
    obstacleSpawnTimer++;
    if (obstacleSpawnTimer > CONFIG.OBSTACLE.SPAWN_INTERVAL) {
        const lane = Math.floor(Math.random() * 2);
        createObstacle(lane, lastObstacleNumber);
        lastObstacleNumber = lastObstacleNumber >= CONFIG.GAME.MAX_OBSTACLE_NUMBER ? 1 : lastObstacleNumber + 1;
        obstacleSpawnTimer = 0;
    }
    
    // تحديث المثلثات
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += gameState.speed * 2.5;
        obstacle.position.x = CONFIG.ROAD.LANE_POSITIONS[obstacle.userData.lane] + currentRoadOffset.x;
        obstacle.position.y = CONFIG.OBSTACLE.HEIGHT / 2 + currentRoadOffset.y;
        
        if (obstacle.position.z > 8) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
            addScore(1);
        }
    });
    
    // تحديث النقاط
    coinsSystem.activeCoins.forEach((coin, index) => {
        if (coin.userData.collected) return;
        
        coin.position.z += gameState.speed * 2.5;
        coin.position.x = CONFIG.ROAD.LANE_POSITIONS[coin.userData.lane] + currentRoadOffset.x;
        coin.position.y = CONFIG.COIN.HEIGHT + currentRoadOffset.y;
        
        coin.rotation.y += 0.05;
        
        if (coin.position.z > 10) {
            if (coin.parent) coin.parent.remove(coin);
            coinsSystem.activeCoins.splice(index, 1);
        }
    });
    
    coinsSystem.checkCoinCollection(ball);
    
    // تحديث الجزيئات
    particles.forEach((particle, index) => {
        if (particle.userData.velocity) {
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.y -= 0.02;
        }
        
        particle.userData.life -= particle.userData.decay || 0.025;
        particle.material.opacity = particle.userData.life;
        
        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particles.splice(index, 1);
        }
    });
    
    // تحديث النجوم
    stars.forEach(star => {
        star.position.z += gameState.speed * 0.6;
        if (star.position.z > 15) star.position.z -= 300;
    });
    
    // تحديث الكاميرا (تتبع الكرة يمين/يسار)
    const cameraTargetX = ball.position.x * CONFIG.CAMERA.HORIZONTAL_FOLLOW;
    const cameraTargetZ = ball.position.z + CONFIG.CAMERA.DISTANCE;
    
    camera.position.x += (cameraTargetX - camera.position.x) * CONFIG.CAMERA.FOLLOW_SPEED;
    camera.position.z += (cameraTargetZ - camera.position.z) * CONFIG.CAMERA.FOLLOW_SPEED;
    camera.position.y = CONFIG.CAMERA.HEIGHT;
    
    camera.lookAt(
        ball.position.x,
        ball.position.y,
        ball.position.z - CONFIG.CAMERA.LOOK_AHEAD
    );
    
    if (checkCollision()) gameOver();
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);
    updateGame();
    renderer.render(scene, camera);
}

// ============================================
// UTILITIES
// ============================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function applyGraphicsSettings(quality) {
    const pixelRatios = { low: 1, medium: 1.5, high: 2 };
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatios[quality] || 2));
}

// ============================================
// START
// ============================================

window.addEventListener('load', init);