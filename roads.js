/**
 * ملف roads.js
 * المسؤول عن: رسم الطريق ثلاثي الأبعاد، توليد العقبات، وحساب التصادم.
 */

const Roads = (function() {
    let width, height;
    
    // إعدادات الطريق
    const CONFIG = {
        roadWidth: 2000,
        segmentLength: 200,
        cameraHeight: 1000,
        cameraDepth: 0.84,
        drawDistance: 100 // عدد القطع
    };

    let obstacles = []; // مصفوفة العقبات
    let currentCurve = 0;
    let targetCurve = 0;
    let scoreCount = 0;

    function resize(w, h) {
        width = w;
        height = h;
    }

    function reset() {
        obstacles = [];
        currentCurve = 0;
        targetCurve = 0;
        scoreCount = 0;
        spawnInitialObstacles();
    }

    function spawnInitialObstacles() {
        // توليد عقبات مبدئية
        let z = 2000; // ابدأ بعيداً قليلاً
        for (let i = 0; i < 30; i++) {
            z += CONFIG.segmentLength * (2 + Math.random() * 3);
            spawnObstacle(z);
        }
    }

    function spawnObstacle(z) {
        const lane = Math.random() < 0.5 ? -1 : 1;
        const types = ['#ff3333', '#33ff33', '#ff00de'];
        const color = types[Math.floor(Math.random() * types.length)];
        obstacles.push({ z: z, lane: lane, color: color, passed: false });
    }

    function update(dt, playerDistance, speed) {
        // تغيير انحناء الطريق عشوائياً
        if (Math.random() < 0.01) {
            targetCurve = (Math.random() - 0.5) * 4; // منحنى بين -2 و 2
        }
        currentCurve += (targetCurve - currentCurve) * dt * 2;

        // إدارة العقبات
        // إزالة القديمة
        obstacles = obstacles.filter(obs => obs.z > playerDistance - 500);

        // إضافة جديدة
        const lastZ = obstacles.length > 0 ? obstacles[obstacles.length - 1].z : playerDistance;
        if (lastZ < playerDistance + 8000) {
            const nextZ = lastZ + CONFIG.segmentLength * (2 + Math.random() * 3);
            spawnObstacle(nextZ);
        }
        
        // تحديث حالة مرور العقبات
        obstacles.forEach(obs => {
            if (!obs.passed && obs.z < playerDistance) {
                obs.passed = true;
                scoreCount++;
            }
        });
    }

    // دالة الإسقاط (تحويل 3D إلى 2D)
    function project(x, y, z, cameraX, cameraY, cameraZ) {
        const scale = CONFIG.cameraDepth / (z - cameraZ);
        return {
            x: (x - cameraX) * scale + width / 2,
            y: (y - cameraY) * scale + height / 2,
            w: CONFIG.roadWidth * scale,
            scale: scale
        };
    }

    function draw(ctx, playerDist) {
        let curve = 0;
        let x = 0;

        // رسم القطاعات من الأبعد للأقرب
        for (let n = CONFIG.drawDistance; n > 0; n--) {
            const segmentZ = playerDist + n * CONFIG.segmentLength;
            curve += currentCurve;
            
            const p1 = project(x - CONFIG.roadWidth/2, 0, segmentZ, 0, CONFIG.cameraHeight, 0);
            const p2 = project(x + CONFIG.roadWidth/2, 0, segmentZ, 0, CONFIG.cameraHeight, 0);
            const p3 = project(x + CONFIG.roadWidth/2 + curve * 50, 0, segmentZ - CONFIG.segmentLength, 0, CONFIG.cameraHeight, 0);
            const p4 = project(x - CONFIG.roadWidth/2 + curve * 50, 0, segmentZ - CONFIG.segmentLength, 0, CONFIG.cameraHeight, 0);

            // خلفية (عشب)
            ctx.fillStyle = (n % 2 === 0) ? "#001a40" : "#001133";
            ctx.fillRect(0, p2.y, width, p4.y - p2.y + 1);

            // الطريق
            ctx.fillStyle = "#222";
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.fill();

            // حدود الطريق
            ctx.fillStyle = "#ff00de"; // لون الحدود من UI
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p3.x - (p3.x-p2.x)*0.1, p3.y); ctx.lineTo(p2.x - (p2.x-p1.x)*0.1, p2.y);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(p4.x, p4.y); ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p1.x + (p2.x-p1.x)*0.1, p1.y); ctx.lineTo(p4.x + (p3.x-p4.x)*0.1, p4.y);
            ctx.fill();

            // خطوط الطريق
            if (n % 2 === 0) {
                ctx.fillStyle = "rgba(255,255,255,0.3)";
                const c1 = project(x, 0, segmentZ, 0, CONFIG.cameraHeight, 0);
                const c2 = project(x + curve * 50, 0, segmentZ - CONFIG.segmentLength, 0, CONFIG.cameraHeight, 0);
                ctx.fillRect(c1.x - c1.scale * 10, c1.y, c1.scale * 20, c2.y - c1.y);
            }
        }

        // رسم العقبات
        obstacles.forEach(obs => {
            const distZ = obs.z - playerDist;
            if (distZ > 0 && distZ < 5000) {
                const obsWorldX = (obs.lane * (CONFIG.roadWidth / 4)) + (curve * distZ * 50);
                const p = project(obsWorldX, 0, obs.z, 0, CONFIG.cameraHeight, 0);
                
                if (p.scale > 0) {
                    const size = p.scale * 1000;
                    ctx.fillStyle = obs.color;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y - size);
                    ctx.lineTo(p.x + size/1.5, p.y + size);
                    ctx.lineTo(p.x - size/1.5, p.y + size);
                    ctx.fill();
                }
            }
        });
    }

    function checkCollision(player) {
        // منطق تصادم مبسط بناءً على المسافة والمسار
        for (let obs of obstacles) {
            const distZ = obs.z - window.Game ? 0 : 0; // سيتم تمرير المسافة
            // نستخدم متغير عام من game.js لتسهيل الوصول أو نمرره كباراميتر
            // هنا سنفترض أن اللاعب في Z=0 نسبياً
            if (distZ > -150 && distZ < 150) {
                if (obs.lane === player.lane) {
                    // تحقق من بقاء اللاعب في المنتقل أم وصل المسار
                    // إذا كان الفرق بين موقع اللاعب البصري وموقع المسار كبيراً فهو في حركة (آمن)
                    // إذا كان اللاعب تقريباً في نفس X للمسار (اصطدام)
                    const targetX = player.lane * (CONFIG.roadWidth / 4);
                    if (Math.abs(player.visualX - targetX) < CONFIG.roadWidth / 6) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function getPoints() {
        return scoreCount;
    }

    return {
        resize,
        reset,
        update,
        draw,
        checkCollision,
        getPoints
    };
})();
