// ============================================
// RUSH 3D - COMPLETE GAME ENGINE
// ============================================

// Game State
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: 0,
    speed: 1.0,
    baseSpeed: 1.0,
    speedMultiplier: 1.0,
    obstaclesPassed: 0,
    soundEnabled: true,
    effectsEnabled: true,
    speedDisplayEnabled: true
};

// Three.js Objects
let scene, camera, renderer;
let ball, ballGlow;
let road = [];
let obstacles = [];
let particles = [];
let stars = [];

// Road Pattern System
let roadSegmentIndex = 0;
const roadPatterns = [
    { type: 'up', angle: 30, length: 20 },
    { type: 'down', angle: -30, length: 20 },
    { type: 'left', angle: 0, curve: -2, length: 25 },
    { type: 'right', angle: 0, curve: 2, length: 25 },
    { type: 'straight', angle: 0, length: 30 }
];
let currentPatternIndex = 0;
let patternProgress = 0;

// Game Settings
let targetLane = 0;
let obstacleSpawnTimer = 0;
let obstacleSpawnInterval = 70;
let lastObstacleNumber = 1;

const cameraSettings = {
    distance: 14,
    height: 7,
    followSpeed: 0.13,
    lookAhead: 9
};

// Input
let touchStartX = 0;
let isDragging = false;
const swipeThreshold = 45;
const lanePositions = [-4, 0, 4];
const ROAD_WIDTH = 12;

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('🎮 Initializing Rush 3D...');
    
    loadGameData();
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.013);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, cameraSettings.height, cameraSettings.distance);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
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
    setupUI();
    loadHighScore();

    window.addEventListener('resize', onWindowResize);

    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 500);

    animate();
    console.log('✅ Game ready!');
}

// ============================================
// LIGHTING
// ============================================

function setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const main = new THREE.DirectionalLight(0xffffff, 0.9);
    main.position.set(5, 20, 5);
    main.castShadow = true;
    main.shadow.mapSize.set(2048, 2048);
    scene.add(main);

    const p1 = new THREE.PointLight(0x00ff88, 2, 50);
    p1.position.set(-10, 5, -10);
    scene.add(p1);

    const p2 = new THREE.PointLight(0xff0088, 2, 50);
    p2.position.set(10, 5, -10);
    scene.add(p2);

    const hemi = new THREE.HemisphereLight(0x00ddff, 0x1a1a2e, 0.6);
    scene.add(hemi);
}

// ============================================
// CREATE BALL (مع نظام الكرات المختلفة)
// ============================================

function createBall() {
    const ballData = getBallData(selectedBall);
    const ballRadius = ROAD_WIDTH / 6;
    
    const geometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: ballData.color,
        emissive: ballData.color,
        emissiveIntensity: 0.7,
        shininess: 120,
        specular: 0xffffff
    });
    
    ball = new THREE.Mesh(geometry, material);
    ball.position.set(lanePositions[1], 2, 0);
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
    const ballData = getBallData(selectedBall);
    ball.material.color.setHex(ballData.color);
    ball.material.emissive.setHex(ballData.color);
    ballGlow.material.color.setHex(ballData.color);
}

// ============================================
// CREATE ROAD (مع نظام الطرقات + الزوايا الثابتة)
// ============================================

function createRoad() {
    const roadData = getRoadData(selectedRoad);
    const roadLength = 300;
    const segmentLength = 5;
    
    for (let i = 0; i < roadLength / segmentLength; i++) {
        const z = -i * segmentLength;
        
        const segmentGeometry = new THREE.PlaneGeometry(ROAD_WIDTH, segmentLength);
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

        createSideBarrier(-ROAD_WIDTH / 2, z, 0xff0088);
        createSideBarrier(ROAD_WIDTH / 2, z, 0x00ddff);
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

function updateRoadColors() {
    const roadData = getRoadData(selectedRoad);
    road.forEach(segment => {
        if (segment.material.color) {
            segment.material.color.setHex(roadData.color);
        }
    });
}

// ============================================
// CREATE STARFIELD
// ============================================

function createStarfield() {
    const geo = new THREE.SphereGeometry(0.15, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i < 300; i++) {
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
// CREATE OBSTACLE (مثلثات ثابتة بأرقام حتى 1000)
// ============================================

function createObstacle(lane, number) {
    const group = new THREE.Group();
    const obstacleSize = ROAD_WIDTH / 3;
    
    // مثلث ثابت (بدون دوران)
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

    // رقم على المثلث
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

    group.position.set(lanePositions[lane], obstacleSize, -70);
    group.userData.lane = lane;
    group.userData.number = number;

    scene.add(group);
    obstacles.push(group);
}

// ============================================
// PARTICLES
// ============================================

function createParticleExplosion(x, y, z, color, count = 40) {
    if (!gameState.effectsEnabled) return;
    
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

function createTrailParticle(x, y, z) {
    if (!gameState.effectsEnabled) return;
    
    const geo = new THREE.SphereGeometry(0.4, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.7 });
    const particle = new THREE.Mesh(geo, mat);
    
    particle.position.set(x, y, z);
    particle.userData.life = 1.0;
    particle.userData.isTrail = true;
    
    scene.add(particle);
    particles.push(particle);
}

// ============================================
// INPUT HANDLING
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
    if (Math.abs(deltaX) > swipeThreshold) {
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
    gameState.speed = gameState.baseSpeed;
    gameState.speedMultiplier = 1.0;
    gameState.obstaclesPassed = 0;
    
    targetLane = 0;
    obstacleSpawnTimer = 0;
    lastObstacleNumber = 1;
    roadSegmentIndex = 0;
    currentPatternIndex = 0;
    patternProgress = 0;
    
    ball.position.set(lanePositions[1], 2, 0);
    
    obstacles.forEach(obs => scene.remove(obs));
    obstacles = [];
    particles.forEach(p => scene.remove(p));
    particles = [];
    
    updateScoreDisplay();
    updateSpeedDisplay();
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('gameover-screen').classList.remove('active');
    document.getElementById('pause-screen').classList.remove('active');
    document.getElementById('score-display').classList.add('active');
    document.getElementById('game-controls').classList.add('active');
    document.getElementById('bottom-nav').style.display = 'none';
}

function gameOver() {
    console.log('💥 Game Over! Score:', gameState.score);
    
    gameState.isPlaying = false;
    
    // إضافة عملات بناءً على النقاط
    const coinsEarned = Math.floor(gameState.score / 5);
    addCoins(coinsEarned);
    
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
        document.getElementById('bottom-nav').style.display = 'flex';
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

function updateSpeedDisplay() {
    if (gameState.speedDisplayEnabled) {
        const speedPercent = Math.round(gameState.speedMultiplier * 100);
        document.getElementById('speed-value').textContent = speedPercent + '%';
    }
}

function addScore(points = 1) {
    gameState.score += points;
    gameState.obstaclesPassed += points;
    updateScoreDisplay();
    
    // زيادة السرعة كل 15 مثلث بنسبة 0.5%
    if (gameState.obstaclesPassed % 15 === 0) {
        gameState.speedMultiplier += 0.005;
        gameState.speed = gameState.baseSpeed * gameState.speedMultiplier;
        updateSpeedDisplay();
        console.log('⚡ Speed:', (gameState.speedMultiplier * 100).toFixed(1) + '%');
    }
    
    obstacleSpawnInterval = Math.max(50, 70 - gameState.score * 0.3);
}

// ============================================
// GAME UPDATE LOOP (مع نظام الطريق بزوايا ثابتة 30°)
// ============================================

function updateGame() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // نظام الطريق بالزوايا الثابتة 30°
    const pattern = roadPatterns[currentPatternIndex];
    patternProgress += gameState.speed * 2.5;
    
    if (patternProgress >= pattern.length) {
        currentPatternIndex = (currentPatternIndex + 1) % roadPatterns.length;
        patternProgress = 0;
    }
    
    // تطبيق الزوايا والمنحنيات
    const angleRad = (pattern.angle || 0) * Math.PI / 180;
    const curveOffset = (pattern.curve || 0) * Math.sin(roadSegmentIndex * 0.05);
    
    road.forEach((segment, index) => {
        segment.position.z += gameState.speed * 2.5;
        
        // تطبيق الزاوية
        if (pattern.type === 'up') {
            segment.position.y = Math.sin(segment.position.z * 0.05) * 2;
        } else if (pattern.type === 'down') {
            segment.position.y = -Math.sin(segment.position.z * 0.05) * 2;
        }
        
        // تطبيق المنحنى الأفقي
        segment.position.x = curveOffset * (Math.abs(segment.position.z) / 30);
        
        if (segment.position.z > 15) {
            segment.position.z -= 300;
            roadSegmentIndex++;
        }
    });
    
    // تحريك الكرة
    const targetX = lanePositions[targetLane + 1];
    ball.position.x += (targetX - ball.position.x) * 0.18;
    
    ball.rotation.x += 0.1;
    ball.rotation.z += 0.05;
    
    if (ballGlow) {
        const pulse = Math.sin(Date.now() * 0.006) * 0.15 + 0.9;
        ballGlow.scale.set(pulse, pulse, pulse);
    }
    
    // إنشاء مثلثات (أرقام حتى 1000)
    obstacleSpawnTimer++;
    if (obstacleSpawnTimer > obstacleSpawnInterval) {
        const lane = Math.floor(Math.random() * 3);
        createObstacle(lane, lastObstacleNumber);
        lastObstacleNumber = lastObstacleNumber >= 1000 ? 1 : lastObstacleNumber + 1;
        obstacleSpawnTimer = 0;
    }
    
    // تحريك المثلثات (بدون دوران)
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += gameState.speed * 2.5;
        
        // تطبيق نفس منحنى الطريق
        obstacle.position.x = lanePositions[obstacle.userData.lane] + curveOffset * (Math.abs(obstacle.position.z) / 30);
        
        if (pattern.type === 'up') {
            obstacle.position.y = Math.sin(obstacle.position.z * 0.05) * 2 + 2;
        } else if (pattern.type === 'down') {
            obstacle.position.y = -Math.sin(obstacle.position.z * 0.05) * 2 + 2;
        }
        
        if (obstacle.position.z > 8) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
            addScore(1);
        }
    });
    
    // تحديث الجزيئات
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
    
    // تحريك النجوم
    stars.forEach(star => {
        star.position.z += gameState.speed * 0.6;
        if (star.position.z > 15) star.position.z -= 300;
    });
    
    // تحديث الكاميرا
    const cameraTargetX = ball.position.x * 0.35;
    const cameraTargetZ = ball.position.z + cameraSettings.distance;
    
    camera.position.x += (cameraTargetX - camera.position.x) * cameraSettings.followSpeed;
    camera.position.z += (cameraTargetZ - camera.position.z) * cameraSettings.followSpeed;
    
    camera.lookAt(
        ball.position.x * 0.6,
        ball.position.y + 1,
        ball.position.z - cameraSettings.lookAhead
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
// UI SETUP
// ============================================

function setupUI() {
    // Play Button
    document.getElementById('play-btn').addEventListener('click', () => {
        if (gameState.isPlaying) {
            togglePause();
        } else {
            startGame();
        }
    });
    
    // Pause Button
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    // Settings
    document.getElementById('toggle-sound').addEventListener('click', function() {
        gameState.soundEnabled = !gameState.soundEnabled;
        this.textContent = gameState.soundEnabled ? 'تشغيل' : 'إيقاف';
        this.classList.toggle('active');
    });
    
    document.getElementById('toggle-speed-display').addEventListener('click', function() {
        gameState.speedDisplayEnabled = !gameState.speedDisplayEnabled;
        this.textContent = gameState.speedDisplayEnabled ? 'تشغيل' : 'إيقاف';
        this.classList.toggle('active');
        document.querySelector('.speed-indicator').style.display = 
            gameState.speedDisplayEnabled ? 'inline-block' : 'none';
    });
    
    document.getElementById('toggle-effects').addEventListener('click', function() {
        gameState.effectsEnabled = !gameState.effectsEnabled;
        this.textContent = gameState.effectsEnabled ? 'تشغيل' : 'إيقاف';
        this.classList.toggle('active');
    });
    
    // Initialize Balls Grid
    initializeBallsGrid();
    initializeRoadsGrid();
}

function initializeBallsGrid() {
    const grid = document.getElementById('balls-grid');
    grid.innerHTML = '';
    
    BALLS_DATA.forEach(ball => {
        const card = document.createElement('div');
        card.className = 'item-card' + (ball.unlocked ? '' : ' locked') + 
                        (ball.id === selectedBall ? ' selected' : '');
        
        card.innerHTML = `
            ${ball.id === selectedBall ? '<span class="selected-badge">✓</span>' : ''}
            ${!ball.unlocked ? '<span class="lock-icon">🔒</span>' : ''}
            <div class="item-icon">${ball.icon}</div>
            <div class="item-name">${ball.name}</div>
            ${!ball.unlocked ? `<div class="item-price">${ball.price} 💰</div>` : ''}
        `;
        
        card.addEventListener('click', () => {
            if (ball.unlocked) {
                selectBall(ball.id);
                updateBallColor();
                initializeBallsGrid();
            } else if (playerCoins >= ball.price) {
                if (unlockItem(ball.id, BALLS_DATA)) {
                    selectBall(ball.id);
                    updateBallColor();
                    initializeBallsGrid();
                }
            } else {
                alert('ليس لديك عملات كافية!');
            }
        });
        
        grid.appendChild(card);
    });
}

function initializeRoadsGrid() {
    const grid = document.getElementById('roads-grid');
    grid.innerHTML = '';
    
    ROADS_DATA.forEach(road => {
        const card = document.createElement('div');
        card.className = 'item-card' + (road.unlocked ? '' : ' locked') + 
                        (road.id === selectedRoad ? ' selected' : '');
        
        card.innerHTML = `
            ${road.id === selectedRoad ? '<span class="selected-badge">✓</span>' : ''}
            ${!road.unlocked ? '<span class="lock-icon">🔒</span>' : ''}
            <div class="item-icon">${road.icon}</div>
            <div class="item-name">${road.name}</div>
            ${!road.unlocked ? `<div class="item-price">${road.price} 💰</div>` : ''}
        `;
        
        card.addEventListener('click', () => {
            if (road.unlocked) {
                selectRoad(road.id);
                updateRoadColors();
                initializeRoadsGrid();
            } else if (playerCoins >= road.price) {
                if (unlockItem(road.id, ROADS_DATA)) {
                    selectRoad(road.id);
                    updateRoadColors();
                    initializeRoadsGrid();
                }
            } else {
                alert('ليس لديك عملات كافية!');
            }
        });
        
        grid.appendChild(card);
    });
}

// ============================================
// PANEL MANAGEMENT
// ============================================

function openPanel(panelId) {
    document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
}

function closePanel(panelId) {
    document.getElementById(panelId).classList.remove('active');
}

window.openPanel = openPanel;
window.closePanel = closePanel;

// ============================================
// UTILITIES
// ============================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function saveHighScore() {
    try {
        localStorage.setItem('rushHighScore', gameState.highScore.toString());
    } catch (e) {}
}

function loadHighScore() {
    try {
        const saved = localStorage.getItem('rushHighScore');
        if (saved) {
            gameState.highScore = parseInt(saved);
            document.getElementById('high-score-value').textContent = gameState.highScore;
        }
    } catch (e) {}
}

// ============================================
// START
// ============================================

window.addEventListener('load', init);
