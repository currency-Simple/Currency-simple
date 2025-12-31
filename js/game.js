// ============================================
// RUSH 3D - MAIN GAME ENGINE (COMPLETE)
// ============================================

// Game State
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    speed: CONFIG.GAME.BASE_SPEED,
    speedMultiplier: 1.0,
    obstaclesPassed: 0,
    coinsCollectedInGame: 0,
    maxSpeedReached: 1.0
};

// Three.js Objects
let scene, camera, renderer;
let ball, ballGlow;
let road = [];
let obstacles = [];
let particles = [];
let stars = [];

// Game Mechanics
let targetLane = 0;
let obstacleSpawnTimer = 0;
let lastObstacleNumber = 1;

// Road Pattern System
let currentPatternIndex = 0;
let patternProgress = 0;
let currentPattern = CONFIG.ROAD_PATTERNS[0];

// Input
let touchStartX = 0;
let isDragging = false;

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('🎮 Initializing Rush 3D...');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.COLORS.BACKGROUND);
    scene.fog = new THREE.FogExp2(CONFIG.COLORS.BACKGROUND, CONFIG.EFFECTS.FOG_DENSITY);

    camera = new THREE.PerspectiveCamera(
        CONFIG.CAMERA.FOV,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, CONFIG.CAMERA.HEIGHT, CONFIG.CAMERA.DISTANCE);

    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    setupLighting();
    createBall();
    createRoad();
    createStarfield();
    setupInput();
    settingsSystem.applySettings();

    window.addEventListener('resize', onWindowResize);
    uiSystem.hideLoadingScreen();

    animate();
    console.log('✅ Game initialized!');
}

// ============================================
// LIGHTING
// ============================================

function setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(5, 20, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 2, 50);
    pointLight1.position.set(-10, 5, -10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0088, 2, 50);
    pointLight2.position.set(10, 5, -10);
    scene.add(pointLight2);

    const hemiLight = new THREE.HemisphereLight(0x00ddff, 0x1a1a2e, 0.6);
    scene.add(hemiLight);
}

// ============================================
// CREATE BALL
// ============================================

function createBall() {
    const ballData = ballsSystem.getSelectedBall();
    const ballRadius = CONFIG.ROAD.WIDTH * CONFIG.BALL.SIZE_RATIO;
    
    const geometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: ballData.color,
        emissive: ballData.color,
        emissiveIntensity: 0.7,
        shininess: 120,
        specular: 0xffffff
    });
    
    ball = new THREE.Mesh(geometry, material);
    ball.position.set(CONFIG.ROAD.LANE_POSITIONS[1], 2, 0);
    ball.castShadow = true;
    scene.add(ball);

    const glowGeometry = new THREE.SphereGeometry(ballRadius * 1.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: ballData.color,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide
    });
    ballGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    ball.add(ballGlow);

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(ballRadius * 0.3, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    ball.add(core);
}

function updateBallColor() {
    if (!ball) return;
    const ballData = ballsSystem.getSelectedBall();
    ball.material.color.setHex(ballData.color);
    ball.material.emissive.setHex(ballData.color);
    if (ballGlow) ballGlow.material.color.setHex(ballData.color);
}

// ============================================
// CREATE ROAD
// ============================================

function createRoad() {
    const roadData = roadsSystem.getSelectedRoad();
    
    for (let i = 0; i < CONFIG.ROAD.TOTAL_LENGTH / CONFIG.ROAD.SEGMENT_LENGTH; i++) {
        const z = -i * CONFIG.ROAD.SEGMENT_LENGTH;
        
        const segmentGeometry = new THREE.PlaneGeometry(CONFIG.ROAD.WIDTH, CONFIG.ROAD.SEGMENT_LENGTH);
        const segmentMaterial = new THREE.MeshStandardMaterial({
            color: roadData.color,
            roughness: 0.85,
            metalness: 0.15
        });
        
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.rotation.x = -Math.PI / 2;
        segment.position.set(0, 0, z);
        segment.receiveShadow = true;
        scene.add(segment);
        road.push(segment);

        if (i % 3 === 0) {
            createLaneDivider(-4, z);
            createLaneDivider(4, z);
        }

        createSideBarrier(-CONFIG.ROAD.WIDTH / 2, z, 0xff0088);
        createSideBarrier(CONFIG.ROAD.WIDTH / 2, z, 0x00ddff);
    }
}

function createLaneDivider(x, z) {
    const geo = new THREE.BoxGeometry(0.2, 0.05, 2.5);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.5 });
    const divider = new THREE.Mesh(geo, mat);
    divider.position.set(x, 0.05, z);
    scene.add(divider);
    road.push(divider);
}

function createSideBarrier(x, z, color) {
    const geo = new THREE.BoxGeometry(0.4, 2.5, 5);
    const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.7
    });
    const barrier = new THREE.Mesh(geo, mat);
    barrier.position.set(x, 1.25, z);
    scene.add(barrier);
    road.push(barrier);
}

function updateRoadColor() {
    const roadData = roadsSystem.getSelectedRoad();
    road.forEach(segment => {
        if (segment.material.color) segment.material.color.setHex(roadData.color);
    });
}

// ============================================
// CREATE STARFIELD
// ============================================

function createStarfield() {
    const geo = new THREE.SphereGeometry(0.15, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i < CONFIG.EFFECTS.STAR_COUNT; i++) {
        const star = new THREE.Mesh(geo, mat);
        star.position.set(
            (Math.random() - 0.5) * 150,
            Math.random() * 60 + 15,
            (Math.random() - 0.5) * 300 - 50
        );
        scene.add(star);
        stars.push(star);
    }
}

// ============================================
// CREATE OBSTACLE
// ============================================

function createObstacle(lane, number) {
    const group = new THREE.Group();
    const obstacleSize = CONFIG.ROAD.WIDTH * CONFIG.OBSTACLE.SIZE_RATIO;
    
    const geometry = new THREE.ConeGeometry(obstacleSize, obstacleSize * 2, 3);
    const material = new THREE.MeshPhongMaterial({
        color: CONFIG.COLORS.OBSTACLE,
        emissive: CONFIG.COLORS.OBSTACLE,
        emissiveIntensity: 0.6,
        shininess: 100,
        flatShading: true
    });
    
    const pyramid = new THREE.Mesh(geometry, material);
    pyramid.rotation.y = Math.PI / 6;
    pyramid.castShadow = true;
    group.add(pyramid);

    if (settingsSystem.get('effectsEnabled')) {
        const glowGeometry = new THREE.ConeGeometry(obstacleSize * 1.3, obstacleSize * 2.3, 3);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.COLORS.OBSTACLE,
            transparent: true,
            opacity: 0.4,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.y = Math.PI / 6;
        group.add(glow);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 140px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(2.5, 2.5, 1);
    sprite.position.y = obstacleSize * 1.5;
    group.add(sprite);

    group.position.set(CONFIG.ROAD.LANE_POSITIONS[lane], obstacleSize, -70);
    group.userData.lane = lane;
    group.userData.number = number;

    scene.add(group);
    obstacles.push(group);
}

// ============================================
// PARTICLES
// ============================================

function createParticleExplosion(x, y, z, color, count = 40) {
    if (!settingsSystem.get('particlesEnabled')) return;
    
    for (let i = 0; i < count; i++) {
        const geo = new THREE.SphereGeometry(0.2, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true });
        const particle = new THREE.Mesh(geo, mat);
        
        particle.position.set(x, y, z);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 0.5 + 0.3,
            (Math.random() - 0.5) * 0.5
        );
        particle.userData.life = 1.0;
        particle.userData.decay = 0.015 + Math.random() * 0.015;
        
        scene.add(particle);
        particles.push(particle);
    }
}

// ============================================
// INPUT
// ============================================

function setupInput() {
    const canvas = renderer.domElement;
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', () => isDragging = false, { passive: false });
    
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
}

function handleTouchStart(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    e.preventDefault();
    isDragging = true;
    touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    if (!gameState.isPlaying || gameState.isPaused || !isDragging) return;
    e.preventDefault();
    
    const deltaX = e.touches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > CONFIG.INPUT.SWIPE_THRESHOLD) {
        changeLane(deltaX > 0 ? 1 : -1);
        touchStartX = e.touches[0].clientX;
    }
}

function handleMouseDown(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    const halfWidth = window.innerWidth / 2;
    changeLane(e.clientX > halfWidth ? 1 : -1);
}

function handleKeyDown(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    if ((e.key === 'ArrowLeft' || e.key === 'a') && targetLane > -1) changeLane(-1);
    if ((e.key === 'ArrowRight' || e.key === 'd') && targetLane < 1) changeLane(1);
}

function changeLane(direction) {
    targetLane += direction;
    targetLane = Math.max(-1, Math.min(1, targetLane));
}

// ============================================
// COLLISION
// ============================================

function checkCollision() {
    for (let obstacle of obstacles) {
        if (obstacle.position.z > ball.position.z - 3 && 
            obstacle.position.z < ball.position.z + 3) {
            const distance = Math.abs(ball.position.x - obstacle.position.x);
            if (distance < 2.5) return true;
        }
    }
    return false;
}

// ============================================
// GAME STATE
// ============================================

function startGame() {
    console.log('🎮 Starting game...');
    
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.speed = CONFIG.GAME.BASE_SPEED;
    gameState.speedMultiplier = 1.0;
    gameState.obstaclesPassed = 0;
    gameState.coinsCollectedInGame = 0;
    gameState.maxSpeedReached = 1.0;
    
    targetLane = 0;
    obstacleSpawnTimer = 0;
    lastObstacleNumber = 1;
    currentPatternIndex = 0;
    patternProgress = 0;
    
    ball.position.set(CONFIG.ROAD.LANE_POSITIONS[1], 2, 0);
    
    obstacles.forEach(obs => scene.remove(obs));
    obstacles = [];
    particles.forEach(p => scene.remove(p));
    particles = [];
    
    coinsSystem.resetGame();
    statsSystem.startGame();
    
    uiSystem.updateScoreDisplay(0);
    uiSystem.showGameplay();
}

function gameOver() {
    console.log('💥 Game Over! Score:', gameState.score);
    
    gameState.isPlaying = false;
    
    const coinsEarned = coinsSystem.endGame();
    statsSystem.endGame(
        gameState.score, 
        gameState.obstaclesPassed, 
        gameState.coinsCollectedInGame,
        gameState.maxSpeedReached
    );
    
    createParticleExplosion(ball.position.x, ball.position.y, ball.position.z, 0xff3366, 60);
    
    uiSystem.showGameOver(gameState.score, coinsEarned);
}

function togglePause() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        uiSystem.showPause();
        document.getElementById('pause-btn').querySelector('.btn-icon').textContent = '▶';
    } else {
        uiSystem.hidePause();
        document.getElementById('pause-btn').querySelector('.btn-icon').textContent = '⏸';
    }
}

function addScore(points = 1) {
    gameState.score += points;
    gameState.obstaclesPassed += points;
    uiSystem.updateScoreDisplay(gameState.score);
    
    // زيادة السرعة كل 15 مثلث بنسبة 0.2%
    if (gameState.obstaclesPassed % CONFIG.GAME.SPEED_INCREASE_INTERVAL === 0) {
        gameState.speedMultiplier += CONFIG.GAME.SPEED_INCREASE_AMOUNT;
        gameState.speed = CONFIG.GAME.BASE_SPEED * gameState.speedMultiplier;
        
        if (gameState.speedMultiplier > gameState.maxSpeedReached) {
            gameState.maxSpeedReached = gameState.speedMultiplier;
        }
        
        uiSystem.updateSpeedDisplay(gameState.speedMultiplier);
        console.log('⚡ Speed:', (gameState.speedMultiplier * 100).toFixed(1) + '%');
    }
    
    // التحقق من إنشاء نقطة
    if (coinsSystem.onObstaclePassed()) {
        const lane = Math.floor(Math.random() * 3);
        coinsSystem.createCoin(scene, lane);
    }
}

// ============================================
// GAME UPDATE LOOP
// ============================================

function updateGame() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // تحديث نمط الطريق
    patternProgress += gameState.speed * 2.5;
    currentPattern = CONFIG.ROAD_PATTERNS[currentPatternIndex];
    
    if (patternProgress >= currentPattern.length) {
        currentPatternIndex = (currentPatternIndex + 1) % CONFIG.ROAD_PATTERNS.length;
        patternProgress = 0;
    }
    
    const progress = Math.min(1, patternProgress / currentPattern.length);
    const xOffset = (currentPattern.xOffset || 0) * progress;
    const yOffset = (currentPattern.yOffset || 0) * Math.sin(progress * Math.PI);
    
    // تحديث الطريق
    road.forEach(segment => {
        segment.position.z += gameState.speed * 2.5;
        segment.position.x = xOffset;
        segment.position.y = yOffset;
        
        if (segment.position.z > 15) {
            segment.position.z -= CONFIG.ROAD.TOTAL_LENGTH;
        }
    });
    
    // تحريك الكرة
    const targetX = CONFIG.ROAD.LANE_POSITIONS[targetLane + 1];
    ball.position.x += (targetX - ball.position.x) * CONFIG.BALL.LANE_CHANGE_SPEED;
    
    ball.rotation.x += 0.1;
    ball.rotation.z += 0.05;
    
    if (ballGlow) {
        const pulse = Math.sin(Date.now() * 0.006) * 0.15 + 0.9;
        ballGlow.scale.set(pulse, pulse, pulse);
    }
    
    // إنشاء مثلثات
    obstacleSpawnTimer++;
    if (obstacleSpawnTimer > CONFIG.OBSTACLE.SPAWN_INTERVAL) {
        const lane = Math.floor(Math.random() * 3);
        createObstacle(lane, lastObstacleNumber);
        lastObstacleNumber = lastObstacleNumber >= CONFIG.GAME.MAX_OBSTACLE_NUMBER ? 1 : lastObstacleNumber + 1;
        obstacleSpawnTimer = 0;
    }
    
    // تحديث المثلثات
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += gameState.speed * 2.5;
        obstacle.position.x = CONFIG.ROAD.LANE_POSITIONS[obstacle.userData.lane] + xOffset;
        obstacle.position.y = obstacle.userData.number / 10 + yOffset;
        
        if (obstacle.position.z > 8) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
            addScore(1);
        }
    });
    
    // تحديث النقاط الذهبية
    coinsSystem.updateCoins(gameState.speed, currentPattern, patternProgress);
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
    
    // تحديث الكاميرا
    const cameraTargetX = ball.position.x * 0.35;
    const cameraTargetZ = ball.position.z + CONFIG.CAMERA.DISTANCE;
    
    camera.position.x += (cameraTargetX - camera.position.x) * CONFIG.CAMERA.FOLLOW_SPEED;
    camera.position.z += (cameraTargetZ - camera.position.z) * CONFIG.CAMERA.FOLLOW_SPEED;
    
    camera.lookAt(
        ball.position.x * 0.6,
        ball.position.y + 1,
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
