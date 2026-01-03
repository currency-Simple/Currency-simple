// ==================== OBSTACLES.JS - العوائق ====================

// مصفوفة العوائق النشطة
let activeObstacles = [];
let lastObstacleTime = 0;
let obstacleIdCounter = 0;

// إعدادات العوائق
const OBSTACLE_TYPES = ['triangle', 'spike'];
const MIN_OBSTACLE_GAP = 150; // المسافة الدنيا بين العوائق (px)
const SPAWN_INTERVAL = 1500; // الفاصل الزمني لتوليد العوائق (ms)

// ==================== مسح جميع العوائق ====================
function clearObstacles() {
    const container = document.getElementById('obstaclesContainer');
    if (container) {
        container.innerHTML = '';
    }
    activeObstacles = [];
    lastObstacleTime = 0;
    obstacleIdCounter = 0;
    console.log('🧹 Obstacles cleared');
}

// ==================== توليد عوائق جديدة ====================
function generateObstacles() {
    const currentTime = Date.now();
    const adjustedInterval = SPAWN_INTERVAL / window.speed;
    
    // التحقق من الوقت المناسب لتوليد عائق جديد
    if (currentTime - lastObstacleTime < adjustedInterval) {
        return;
    }
    
    // التحقق من وجود مساحة كافية
    if (activeObstacles.length > 0) {
        const lastObstacle = activeObstacles[activeObstacles.length - 1];
        const lastObstacleElement = document.getElementById(lastObstacle.id);
        
        if (lastObstacleElement) {
            const rect = lastObstacleElement.getBoundingClientRect();
            const canvas = document.getElementById('gameCanvas').getBoundingClientRect();
            
            // إذا كان العائق الأخير قريباً جداً من الجانب الأيمن
            if (canvas.right - rect.right < MIN_OBSTACLE_GAP) {
                return;
            }
        }
    }
    
    // إنشاء عائق جديد
    createObstacle();
    lastObstacleTime = currentTime;
}

// ==================== إنشاء عائق ====================
function createObstacle() {
    const container = document.getElementById('obstaclesContainer');
    if (!container) return;
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const canvasHeight = canvas.clientHeight;
    
    // اختيار نوع العائق عشوائياً
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    
    // تحديد الموقع العمودي
    let topPosition;
    if (type === 'spike') {
        // الأشواك تكون على الأرض أو في الهواء
        topPosition = Math.random() > 0.5 ? canvasHeight * 0.8 : canvasHeight * (0.3 + Math.random() * 0.3);
    } else {
        // المثلثات في مواقع متنوعة
        topPosition = canvasHeight * (0.2 + Math.random() * 0.5);
    }
    
    // إنشاء العنصر
    const obstacle = document.createElement('div');
    obstacle.className = `obstacle ${type}`;
    obstacle.id = `obstacle-${obstacleIdCounter++}`;
    obstacle.style.left = '100%';
    obstacle.style.top = `${topPosition}px`;
    
    container.appendChild(obstacle);
    
    // إضافة إلى المصفوفة
    activeObstacles.push({
        id: obstacle.id,
        element: obstacle,
        type: type,
        x: container.clientWidth,
        y: topPosition
    });
    
    console.log(`🚧 Created ${type} obstacle #${obstacleIdCounter - 1}`);
}

// ==================== تحديث مواقع العوائق ====================
function updateObstacles() {
    const container = document.getElementById('obstaclesContainer');
    if (!container) return;
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // تحديث كل عائق
    activeObstacles.forEach((obstacle, index) => {
        const element = document.getElementById(obstacle.id);
        if (!element) {
            activeObstacles.splice(index, 1);
            return;
        }
        
        // تحريك العائق لليسار
        const currentLeft = parseFloat(element.style.left);
        const newLeft = currentLeft - window.obstacleSpeed;
        
        // تحديث الموقع
        element.style.left = `${newLeft}%`;
        obstacle.x = newLeft;
        
        // إزالة العائق إذا خرج من الشاشة
        if (newLeft < -10) {
            element.remove();
            activeObstacles.splice(index, 1);
            console.log(`🗑️ Removed obstacle #${obstacle.id}`);
        }
    });
}

// ==================== الحصول على العوائق النشطة ====================
function getActiveObstacles() {
    return activeObstacles;
}

// ==================== فحص اصطدام عائق محدد ====================
function checkObstacleCollision(obstacle, ballPosition) {
    const element = document.getElementById(obstacle.id);
    if (!element || !ballPosition) return false;
    
    const obstacleRect = element.getBoundingClientRect();
    const obstacleCenterX = obstacleRect.left + obstacleRect.width / 2;
    const obstacleCenterY = obstacleRect.top + obstacleRect.height / 2;
    
    // حساب المسافة
    const distance = Math.sqrt(
        Math.pow(ballPosition.x - obstacleCenterX, 2) +
        Math.pow(ballPosition.y - obstacleCenterY, 2)
    );
    
    // نصف قطر الاصطدام
    const collisionRadius = ballPosition.radius + (obstacleRect.width / 2) - 5;
    
    return distance < collisionRadius;
}

// ==================== إزالة عائق ====================
function removeObstacle(obstacleId) {
    const element = document.getElementById(obstacleId);
    if (element) {
        // تأثير الانفجار
        element.style.transition = 'transform 0.3s, opacity 0.3s';
        element.style.transform = 'scale(1.5)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.remove();
        }, 300);
    }
    
    // إزالة من المصفوفة
    activeObstacles = activeObstacles.filter(obs => obs.id !== obstacleId);
}

// ==================== الحصول على عدد العوائق ====================
function getObstacleCount() {
    return activeObstacles.length;
}

// ==================== تصدير الوظائف ====================
window.clearObstacles = clearObstacles;
window.generateObstacles = generateObstacles;
window.createObstacle = createObstacle;
window.updateObstacles = updateObstacles;
window.getActiveObstacles = getActiveObstacles;
window.checkObstacleCollision = checkObstacleCollision;
window.removeObstacle = removeObstacle;
window.getObstacleCount = getObstacleCount;

console.log('✅ Obstacles.js loaded successfully');
