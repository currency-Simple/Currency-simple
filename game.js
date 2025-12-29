// ============================================
// RUSH 3D - PROFESSIONAL GAME ENGINE (IMPROVED)
// ============================================

// Game State Management
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: 0,
    speed: 0.25,
    baseSpeed: 0.25,
    difficulty: 1,
    soundEnabled: true,
    obstaclesPassed: 0
};

// Three.js Core Objects
let scene, camera, renderer;
let ball, ballGlow;
let road = [];
let obstacles = [];
let particles = [];
let stars = [];

// Game Mechanics
let roadCurve = 0;
let roadCurveSpeed = 0.02;
let roadCurveAmount = 4;
let roadVerticalCurve = 0;
let roadVerticalSpeed = 0.015;
let roadVerticalAmount = 3;
let targetLane = 0;
let currentLane = 0;
let obstacleSpawnTimer = 0;
let obstacleSpawnInterval = 80;
let lastObstacleNumber = 1;

// Camera Settings
const cameraSettings = {
    distance: 15,
    height: 8,
    followSpeed: 0.15,
    lookAheadDistance: 10
};

// Input Handling
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;
const swipeThreshold = 50;

// Lane Positions
const lanePositions = [-4, 0, 4];
const laneWidth = 4;

// Road dimensions
const ROAD_WIDTH = 13;

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('🎮 Initializing Rush 3D...');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.012);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, cameraSettings.height, cameraSettings.distance);

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
    loadHighScore();
    setupUIEvents();

    window.addEventListener('resize', onWindowResize);

    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 500);

    animate();
    
    console.log('✅ Game initialized successfully!');
}

// ============================================
// LIGHTING SETUP
// ============================================

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(5, 20, 5);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 2, 50);
    pointLight1.position.set(-10, 5, -10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0088, 2, 50);
    pointLight2.position.set(10, 5, -10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x00ddff, 2, 50);
    pointLight3.position.set(0, 5, -30);
    scene.add(pointLight3);

    const hemiLight = new THREE.HemisphereLight(0x00ddff, 0x1a1a2e, 0.6);
    scene.add(hemiLight);
}

// ============================================
// CREATE BALL (حجم نصف الطريق)
// ============================================

function createBall() {
    const ballRadius = ROAD_WIDTH / 6; // حجم كبير - نصف عرض المسار
    
    const geometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.7,
        shininess: 120,
        specular: 0xffffff
    });
    
    ball = new THREE.Mesh(geometry, material);
    ball.position.set(lanePositions[1], 2, 0);
    ball.castShadow = true;
    ball.receiveShadow = true;
    scene.add(ball);

    const glowGeometry = new THREE.SphereGeometry(ballRadius * 1.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide
    });
    ballGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    ball.add(ballGlow);

    const coreGeometry = new THREE.SphereGeometry(ballRadius * 0.3, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    ball.add(core);

    ball.userData.trail = [];
}

// ============================================
// CREATE ROAD (منحني في جميع الاتجاهات)
// ============================================

function createRoad() {
    const roadLength = 250;
    const segmentLength = 5;
    
    for (let i = 0; i < roadLength / segmentLength; i++) {
        const z = -i * segmentLength;
        
        const segmentGeometry = new THREE.PlaneGeometry(ROAD_WIDTH, segmentLength);
        const segmentMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
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
            createLaneDivider(-laneWidth / 1.5, z);
            createLaneDivider(laneWidth / 1.5, z);
        }

        createSideBarrier(-ROAD_WIDTH / 2, z, 0xff0088);
        createSideBarrier(ROAD_WIDTH / 2, z, 0x00ddff);
    }
}

function createLaneDivider(x, z) {
    const geometry = new THREE.BoxGeometry(0.2, 0.05, 2.5);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.5
    });
    
    const divider = new THREE.Mesh(geometry, material);
    divider.position.set(x, 0.05, z);
    scene.add(divider);
    road.push(divider);
}

function createSideBarrier(x, z, color) {
    const geometry = new THREE.BoxGeometry(0.4, 2.5, 5);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.7
    });
    
    const barrier = new THREE.Mesh(geometry, material);
    barrier.position.set(x, 1.25, z);
    scene.add(barrier);
    road.push(barrier);
}

// ============================================
// CREATE STARFIELD
// ============================================

function createStarfield() {
    const starGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i < 300; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
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
// CREATE OBSTACLE (حجم نصف الطريق)
// ============================================

function createObstacle(lane, number) {
    const group = new THREE.Group();
    
    const obstacleSize = ROAD_WIDTH / 3; // حجم كبير - نصف عرض المسار
    
    const geometry = new THREE.ConeGeometry(obstacleSize, obstacleSize * 2, 3);
    const material = new THREE.MeshPhongMaterial({
        color: 0xff3366,
        emissive: 0xff3366,
        emissiveIntensity: 0.6,
        shininess: 100,
        flatShading: true
    });
    
    const pyramid = new THREE.Mesh(geometry, material);
    pyramid.rotation.y = Math.PI / 6;
    pyramid.castShadow = true;
    pyramid.receiveShadow = true;
    group.add(pyramid);

    const glowGeometry = new THREE.ConeGeometry(obstacleSize * 1.3, obstacleSize * 2.3, 3);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3366,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.y = Math.PI / 6;
    group.add(glow);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    context.shadowColor = 'rgba(0, 0, 0, 0.9)';
    context.shadowBlur = 15;
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;
    
    context.fillStyle = '#ffffff';
    context.font = 'bold 160px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(number.toString(), 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2.5, 2.5, 1);
    sprite.position.y = obstacleSize * 1.5;
    group.add(sprite);

    group.position.set(lanePositions[lane], obstacleSize, -70);
    group.userData.lane = lane;
    group.userData.number = number;
    group.userData.rotationSpeed = 0.04 + Math.random() * 0.03;

    scene.add(group);
    obstacles.push(group);
}

// ============================================
// PARTICLE SYSTEM
// ============================================

function createParticleExplosion(x, y, z, color, count = 40) {
    for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true
        });
        const particle = new THREE.Mesh(geometry, material);
        
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

function createTrailParticle(x, y, z) {
    const geometry = new THREE.SphereGeometry(0.4, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.7
    });
    const particle = new THREE.Mesh(geometry, material);
    
    particle.position.set(x, y, z);
    particle.userData.life = 1.0;
    particle.userData.isTrail = true;
    
    scene.add(particle);
    particles.push(particle);
}

// ============================================
// INPUT HANDLING (النقر في أي مكان)
// ============================================

function setupInput() {
    const canvas = renderer.domElement;
    
    // Touch Events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse Events (النقر في أي مكان)
    canvas.addEventListener('mousedown', handleMouseDown);
    
    // Keyboard Events
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
    
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    
    if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && targetLane < 1) {
            changeLane(1);
        } else if (deltaX < 0 && targetLane > -1) {
            changeLane(-1);
        }
        touchStartX = touchX;
    }
}

function handleTouchEnd(e) {
    isDragging = false;
}

function handleMouseDown(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // النقر في النصف الأيمن = تحرك يمين، النقر في النصف الأيسر = تحرك يسار
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    
    if (clickX > screenWidth / 2 && targetLane < 1) {
        changeLane(1);
    } else if (clickX < screenWidth / 2 && targetLane > -1) {
        changeLane(-1);
    }
}

function handleKeyDown(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (targetLane > -1) changeLane(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (targetLane < 1) changeLane(1);
    }
}

function changeLane(direction) {
    targetLane += direction;
    targetLane = Math.max(-1, Math.min(1, targetLane));
    createTrailParticle(ball.position.x, ball.position.y, ball.position.z);
}

// ============================================
// COLLISION DETECTION
// ============================================

function checkCollision() {
    for (let obstacle of obstacles) {
        if (obstacle.position.z > ball.position.z - 3 && 
            obstacle.position.z < ball.position.z + 3) {
            
            const distance = Math.abs(ball.position.x - obstacle.position.x);
            
            if (distance < 2.5) {
                return true;
            }
        }
    }
    return false;
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================

function startGame() {
    console.log('🎮 Starting game...');
    
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.speed = gameState.baseSpeed;
    gameState.difficulty = 1;
    gameState.obstaclesPassed = 0;
    
    targetLane = 0;
    currentLane = 0;
    obstacleSpawnTimer = 0;
    lastObstacleNumber = 1;
    
    ball.position.set(lanePositions[1], 2, 0);
    
    obstacles.forEach(obs => scene.remove(obs));
    obstacles = [];
    particles.forEach(p => scene.remove(p));
    particles = [];
    
    updateScoreDisplay();
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('gameover-screen').classList.remove('active');
    document.getElementById('pause-screen').classList.remove('active');
    document.getElementById('score-display').classList.add('active');
    document.getElementById('game-controls').classList.add('active');
}

function gameOver() {
    console.log('💥 Game Over! Score:', gameState.score);
    
    gameState.isPlaying = false;
    
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore();
    }
    
    createParticleExplosion(ball.position.x, ball.position.y, ball.position.z, 0xff3366, 60);
    
    document.getElementById('final-score-value').textContent = gameState.score;
    document.getElementById('best-score-value').textContent = gameState.highScore;
    
    setTimeout(() => {
        document.getElementById('gameover-screen').classList.add('active');
        document.getElementById('score-display').classList.remove('active');
        document.getElementById('game-controls').classList.remove('active');
    }, 500);
}

function togglePause() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        document.getElementById('pause-screen').classList.add('active');
        document.getElementById('pause-btn').querySelector('.btn-icon').textContent = '▶';
    } else {
        document.getElementById('pause-screen').classList.remove('active');
        document.getElementById('pause-btn').querySelector('.btn-icon').textContent = '⏸';
    }
}

function updateScoreDisplay() {
    document.querySelector('.score-number').textContent = gameState.score;
}

function addScore(points = 1) {
    gameState.score += points;
    gameState.obstaclesPassed += points;
    updateScoreDisplay();
    
    // زيادة السرعة كل 10 مثلثات
    if (gameState.obstaclesPassed % 10 === 0) {
        gameState.speed = Math.min(0.5, gameState.speed + 0.03);
        console.log('⚡ Speed increased to:', gameState.speed);
    }
    
    gameState.difficulty = 1 + gameState.score * 0.01;
    obstacleSpawnInterval = Math.max(60, 80 - gameState.score * 0.4);
}

// ============================================
// GAME UPDATE LOOP
// ============================================

function updateGame() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // منحنيات أفقية (يمين/يسار)
    roadCurve += roadCurveSpeed * gameState.speed * 10;
    const curveOffsetX = Math.sin(roadCurve) * roadCurveAmount;
    
    // منحنيات عمودية (أعلى/أسفل)
    roadVerticalCurve += roadVerticalSpeed * gameState.speed * 10;
    const curveOffsetY = Math.sin(roadVerticalCurve) * roadVerticalAmount;
    
    road.forEach((segment) => {
        segment.position.z += gameState.speed * 2.5;
        
        const distanceFromBall = segment.position.z - ball.position.z;
        const curveFactor = Math.min(1, Math.abs(distanceFromBall) / 40);
        
        segment.position.x = curveOffsetX * curveFactor;
        segment.position.y = curveOffsetY * curveFactor;
        
        if (segment.position.z > 15) {
            segment.position.z -= 250;
        }
    });
    
    const targetX = lanePositions[targetLane + 1];
    ball.position.x += (targetX - ball.position.x) * 0.18;
    
    ball.rotation.x += 0.1;
    ball.rotation.z += 0.05;
    
    if (ballGlow) {
        const pulse = Math.sin(Date.now() * 0.006) * 0.15 + 0.9;
        ballGlow.scale.set(pulse, pulse, pulse);
    }
    
    // إنشاء مثلثات لا نهائية
    obstacleSpawnTimer++;
    if (obstacleSpawnTimer > obstacleSpawnInterval) {
        const lane = Math.floor(Math.random() * 3);
        lastObstacleNumber = (lastObstacleNumber % 99) + 1;
        createObstacle(lane, lastObstacleNumber);
        obstacleSpawnTimer = 0;
    }
    
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += gameState.speed * 2.5;
        
        const distanceFromBall = obstacle.position.z - ball.position.z;
        const curveFactor = Math.min(1, Math.abs(distanceFromBall) / 40);
        const baseLaneX = lanePositions[obstacle.userData.lane];
        obstacle.position.x = baseLaneX + curveOffsetX * curveFactor;
        obstacle.position.y = curveOffsetY * curveFactor;
        
        obstacle.rotation.y += obstacle.userData.rotationSpeed;
        
        if (obstacle.position.z > 8) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
            addScore(1);
        }
    });
    
    particles.forEach((particle, index) => {
        if (particle.userData.velocity) {
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.y -= 0.02;
        }
        
        particle.userData.life -= particle.userData.decay || 0.025;
        particle.material.opacity = particle.userData.life;
        
        if (particle.userData.isTrail) {
            particle.scale.multiplyScalar(0.93);
        }
        
        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particles.splice(index, 1);
        }
    });
    
    stars.forEach(star => {
        star.position.z += gameState.speed * 0.6;
        if (star.position.z > 15) {
            star.position.z -= 300;
        }
    });
    
    const cameraTargetX = ball.position.x * 0.35;
    const cameraTargetZ = ball.position.z + cameraSettings.distance;
    
    camera.position.x += (cameraTargetX - camera.position.x) * cameraSettings.followSpeed;
    camera.position.z += (cameraTargetZ - camera.position.z) * cameraSettings.followSpeed;
    
    const lookAtPoint = new THREE.Vector3(
        ball.position.x * 0.6,
        ball.position.y + 1,
        ball.position.z - cameraSettings.lookAheadDistance
    );
    camera.lookAt(lookAtPoint);
    
    if (gameState.speed > 0.35) {
        camera.position.y = cameraSettings.height + Math.sin(Date.now() * 0.012) * 0.15;
    }
    
    if (checkCollision()) {
        gameOver();
    }
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
// UI EVENT HANDLERS
// ============================================

function setupUIEvents() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('retry-btn').addEventListener('click', startGame);
    
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.getElementById('gameover-screen').classList.remove('active');
            document.getElementById('menu-screen').classList.add('active');
        });
    }
    
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', togglePause);
    }
    
    const quitBtn = document.getElementById('quit-btn');
    if (quitBtn) {
        quitBtn.addEventListener('click', () => {
            gameState.isPlaying = false;
            document.getElementById('pause-screen').classList.remove('active');
            document.getElementById('menu-screen').classList.add('active');
            document.getElementById('score-display').classList.remove('active');
            document.getElementById('game-controls').classList.remove('active');
        });
    }
    
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            gameState.soundEnabled = !gameState.soundEnabled;
            const icon = soundBtn.querySelector('.btn-icon');
            icon.textContent = gameState.soundEnabled ? '🔊' : '🔇';
        });
    }
}

// ============================================
// WINDOW RESIZE
// ============================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// SAVE/LOAD
// ============================================

function saveHighScore() {
    try {
        localStorage.setItem('rushHighScore', gameState.highScore.toString());
        console.log('💾 High score saved:', gameState.highScore);
    } catch (e) {
        console.warn('Could not save high score');
    }
}

function loadHighScore() {
    try {
        const saved = localStorage.getItem('rushHighScore');
        if (saved) {
            gameState.highScore = parseInt(saved);
            document.getElementById('high-score-value').textContent = gameState.highScore;
            console.log('📂 High score loaded:', gameState.highScore);
        }
    } catch (e) {
        console.warn('Could not load high score');
    }
}

// ============================================
// START GAME
// ============================================

window.addEventListener('load', init);
console.log('🚀 Rush 3D - Ready to start!');
