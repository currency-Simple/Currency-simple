// ============================================
// RUSH 3D - MAIN GAME ENGINE (FINAL WORKING VERSION)
// ============================================

// Game State
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    speed: CONFIG.GAME.BASE_SPEED,
    speedMultiplier: 1.0,
    obstaclesPassed: 0,
    coinsCollectedInGame: 0,
    maxSpeedReached: 1.0,
    currentObstacleColor: 0,
    obstaclesSinceColorChange: 0,
    roadPreviewVisible: true
};

// Three.js Objects
let scene, camera, renderer;
let ball;
let road = [];
let obstacles = [];
let particles = [];
let stars = [];
let roadPreview = [];

// Game Mechanics
let targetLane = 0;
let obstacleSpawnTimer = 0;
let lastObstacleNumber = 1;

// Road Direction System
let currentPatternIndex = 0;
let patternDuration = 0;
let currentRoadOffset = { x: 0, y: 0 };
let targetRoadOffset = { x: 0, y: 0 };

// Input
let touchStartX = 0;
let isDragging = false;

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('🎮 Initializing Rush 3D...');
    
    try {
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
            alpha: false
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            canvasContainer.appendChild(renderer.domElement);
        } else {
            console.error('Canvas container not found');
            return;
        }

        setupLighting();
        createBall();
        createRoad();
        createStarfield();
        setupInput();

        window.addEventListener('resize', onWindowResize);
        
        if (window.uiSystem && typeof uiSystem.hideLoadingScreen === 'function') {
            uiSystem.hideLoadingScreen();
        }

        animate();
        console.log('✅ Game initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing game:', error);
    }
}

// ============================================
// LIGHTING
// ============================================

function setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 20, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    scene.add(mainLight);
}

// ============================================
// CREATE BALL
// ============================================

function createBall() {
    let ballColor = 0x00ff88;
    
    const geometry = new THREE.SphereGeometry(CONFIG.BALL.SIZE, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: ballColor,
        emissive: ballColor,
        emissiveIntensity: 0.6,
        shininess: 150
    });
    
    ball = new THREE.Mesh(geometry, material);
    ball.position.set(CONFIG.ROAD.LANE_POSITIONS[0], CONFIG.BALL.FIXED_HEIGHT, 0);
    ball.castShadow = true;
    ball.receiveShadow = true;
    
    scene.add(ball);
}

// ============================================
// CREATE ROAD
// ============================================

function createRoad() {
    const roadColor = 0x1a1a1a;
    
    for (let i = 0; i < CONFIG.ROAD.TOTAL_LENGTH / CONFIG.ROAD.SEGMENT_LENGTH; i++) {
        const z = -i * CONFIG.ROAD.SEGMENT_LENGTH;
        
        const segmentGeometry = new THREE.PlaneGeometry(CONFIG.ROAD.WIDTH, CONFIG.ROAD.SEGMENT_LENGTH);
        const segmentMaterial = new THREE.MeshStandardMaterial({
            color: roadColor,
            roughness: 0.85,
            metalness: 0.15
        });
        
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.rotation.x = -Math.PI / 2;
        segment.position.set(0, 0, z);
        segment.receiveShadow = true;
        scene.add(segment);
        road.push(segment);
    }
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
    
    const currentColor = CONFIG.OBSTACLE.COLORS[gameState.currentObstacleColor];
    
    const geometry = new THREE.ConeGeometry(CONFIG.OBSTACLE.BASE_SIZE, CONFIG.OBSTACLE.HEIGHT, 3);
    const material = new THREE.MeshPhongMaterial({
        color: currentColor,
        emissive: currentColor,
        emissiveIntensity: 0.6,
        shininess: 100,
        flatShading: true
    });
    
    const pyramid = new THREE.Mesh(geometry, material);
    pyramid.rotation.y = Math.PI / 6;
    pyramid.castShadow = true;
    group.add(pyramid);

    group.position.set(
        CONFIG.ROAD.LANE_POSITIONS[lane], 
        CONFIG.OBSTACLE.HEIGHT / 2, 
        -70
    );
    group.userData.lane = lane;
    group.userData.number = number;

    scene.add(group);
    obstacles.push(group);
}

// ============================================
// PARTICLES
// ============================================

function createParticleExplosion(x, y, z, color, count = 40) {
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
        particle.userData.decay = 0.015;
        
        scene.add(particle);
        particles.push(particle);
    }
}

// ============================================
// INPUT
// ============================================

function setupInput() {
    const canvas = renderer.domElement;
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', () => isDragging = false);
    
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
    if ((e.key === 'ArrowLeft' || e.key === 'a') && targetLane > 0) changeLane(-1);
    if ((e.key === 'ArrowRight' || e.key === 'd') && targetLane < 1) changeLane(1);
}

function changeLane(direction) {
    targetLane += direction;
    targetLane = Math.max(0, Math.min(1, targetLane));
}

// ============================================
// COLLISION
// ============================================

function checkCollision() {
    for (let obstacle of obstacles) {
        if (obstacle.position.z > ball.position.z - 4 && 
            obstacle.position.z < ball.position.z + 4) {
            
            const distance = Math.abs(ball.position.x - obstacle.position.x);
            if (distance < 2.5) {
                return true;
            }
        }
    }
    return false;
}

// ============================================
// GAME STATE FUNCTIONS
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
    gameState.currentObstacleColor = 0;
    gameState.obstaclesSinceColorChange = 0;
    
    targetLane = 0;
    obstacleSpawnTimer = 0;
    lastObstacleNumber = 1;
    currentPatternIndex = 0;
    patternDuration = 60;
    currentRoadOffset = { x: 0, y: 0 };
    targetRoadOffset = { x: 0, y: 0 };
    
    ball.position.set(CONFIG.ROAD.LANE_POSITIONS[0], CONFIG.BALL.FIXED_HEIGHT, 0);
    
    obstacles.forEach(obs => scene.remove(obs));
    obstacles = [];
    particles.forEach(p => scene.remove(p));
    particles = [];
    
    if (window.uiSystem && typeof uiSystem.updateScoreDisplay === 'function') {
        uiSystem.updateScoreDisplay(0);
        uiSystem.showGameplay();
    }
}

function gameOver() {
    console.log('💥 Game Over! Score:', gameState.score);
    
    gameState.isPlaying = false;
    
    createParticleExplosion(ball.position.x, ball.position.y, ball.position.z, 0xff3366, 60);
    
    if (window.uiSystem && typeof uiSystem.showGameOver === 'function') {
        uiSystem.showGameOver(gameState.score, 0);
    }
}

function togglePause() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (window.uiSystem) {
        if (gameState.isPaused) {
            uiSystem.showPause();
        } else {
            uiSystem.hidePause();
        }
    }
}

function addScore(points = 1) {
    gameState.score += points;
    gameState.obstaclesPassed += points;
    gameState.obstaclesSinceColorChange += points;
    
    if (window.uiSystem && typeof uiSystem.updateScoreDisplay === 'function') {
        uiSystem.updateScoreDisplay(gameState.score);
    }
    
    if (gameState.obstaclesSinceColorChange >= CONFIG.GAME.OBSTACLE_COLOR_CHANGE_INTERVAL) {
        gameState.currentObstacleColor = (gameState.currentObstacleColor + 1) % CONFIG.OBSTACLE.COLORS.length;
        gameState.obstaclesSinceColorChange = 0;
    }
    
    if (gameState.obstaclesPassed % CONFIG.GAME.SPEED_INCREASE_INTERVAL === 0) {
        gameState.speedMultiplier += CONFIG.GAME.SPEED_INCREASE_PERCENTAGE;
        gameState.speed = CONFIG.GAME.BASE_SPEED * gameState.speedMultiplier;
        
        if (gameState.speedMultiplier > gameState.maxSpeedReached) {
            gameState.maxSpeedReached = gameState.speedMultiplier;
        }
        
        if (window.uiSystem && typeof uiSystem.updateSpeedDisplay === 'function') {
            uiSystem.updateSpeedDisplay(gameState.speedMultiplier);
        }
    }
}

// ============================================
// GAME UPDATE LOOP
// ============================================

function updateGame() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    patternDuration--;
    if (patternDuration <= 0) {
        currentPatternIndex = Math.floor(Math.random() * CONFIG.ROAD_PATTERNS.length);
        patternDuration = 60 + Math.random() * 60;
    }
    
    const currentPattern = CONFIG.ROAD_PATTERNS[currentPatternIndex];
    
    targetRoadOffset.x += currentPattern.xDir * CONFIG.ROAD.CURVE_INTENSITY;
    targetRoadOffset.y += currentPattern.yDir * CONFIG.ROAD.CURVE_INTENSITY * 0.5;
    
    const maxOffset = 15;
    targetRoadOffset.x = Math.max(-maxOffset, Math.min(maxOffset, targetRoadOffset.x));
    targetRoadOffset.y = Math.max(-maxOffset * 0.5, Math.min(maxOffset * 0.5, targetRoadOffset.y));
    
    currentRoadOffset.x += (targetRoadOffset.x - currentRoadOffset.x) * 0.05;
    currentRoadOffset.y += (targetRoadOffset.y - currentRoadOffset.y) * 0.05;
    
    road.forEach(segment => {
        segment.position.z += gameState.speed * 2.5;
        segment.position.x = currentRoadOffset.x;
        segment.position.y = currentRoadOffset.y;
        
        if (segment.position.z > 15) {
            segment.position.z -= CONFIG.ROAD.TOTAL_LENGTH;
        }
    });
    
    const targetX = CONFIG.ROAD.LANE_POSITIONS[targetLane] + currentRoadOffset.x;
    const targetY = CONFIG.BALL.FIXED_HEIGHT + currentRoadOffset.y;
    
    ball.position.x += (targetX - ball.position.x) * CONFIG.BALL.LANE_CHANGE_SPEED;
    ball.position.y += (targetY - ball.position.y) * CONFIG.BALL.LANE_CHANGE_SPEED;
    
    ball.rotation.x += gameState.speed * 0.15;
    ball.rotation.z += gameState.speed * 0.08;
    
    obstacleSpawnTimer++;
    if (obstacleSpawnTimer > CONFIG.OBSTACLE.SPAWN_INTERVAL) {
        const lane = Math.floor(Math.random() * 2);
        createObstacle(lane, lastObstacleNumber);
        lastObstacleNumber = lastObstacleNumber >= CONFIG.GAME.MAX_OBSTACLE_NUMBER ? 1 : lastObstacleNumber + 1;
        obstacleSpawnTimer = 0;
    }
    
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += gameState.speed * 2.5;
        obstacle.position.x = CONFIG.ROAD.LANE_POSITIONS[obstacle.userData.lane] + currentRoadOffset.x;
        obstacle.position.y = CONFIG.OBSTACLE.HEIGHT / 2 + currentRoadOffset.y;
        
        obstacle.rotation.y += 0.02;
        
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
        
        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particles.splice(index, 1);
        }
    });
    
    stars.forEach(star => {
        star.position.z += gameState.speed * 0.8;
        star.position.x += currentPattern.xDir * 0.1;
        star.position.y += currentPattern.yDir * 0.05;
        
        if (star.position.z > 15) star.position.z -= 300;
    });
    
    const cameraTargetX = ball.position.x * CONFIG.CAMERA.HORIZONTAL_FOLLOW;
    const cameraTargetZ = ball.position.z + CONFIG.CAMERA.DISTANCE;
    const cameraTargetY = CONFIG.CAMERA.HEIGHT + currentRoadOffset.y;
    
    camera.position.x += (cameraTargetX - camera.position.x) * CONFIG.CAMERA.FOLLOW_SPEED;
    camera.position.z += (cameraTargetZ - camera.position.z) * CONFIG.CAMERA.FOLLOW_SPEED;
    camera.position.y += (cameraTargetY - camera.position.y) * CONFIG.CAMERA.FOLLOW_SPEED;
    
    camera.lookAt(
        ball.position.x,
        ball.position.y + 2,
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

// ============================================
// ROAD PREVIEW FUNCTIONS (OPTIONAL)
// ============================================

function toggleRoadPreview() {
    gameState.roadPreviewVisible = !gameState.roadPreviewVisible;
    console.log('Road preview:', gameState.roadPreviewVisible ? 'ON' : 'OFF');
    return gameState.roadPreviewVisible;
}

// ============================================
// START GAME
// ============================================

window.addEventListener('load', init);
