const Roads = (function() {
    let width, height;
    
    // إعدادات الرسم
    const CONFIG = {
        width: 2000,         // عرض الطريق في العالم الافتراضي
        segLen: 200,         // طول كل مقطع
        camH: 1000,          // ارتفاع الكاميرا
        camD: 0.8,           // عمق الرؤية (معدل تقريب الكاميرا)
        drawDist: 150        // عدد المقاطع المرسومة
    };

    let obstacles = [];
    let curve = 0;
    let targetCurve = 0;
    let score = 0;

    function resize(w, h) { width = w; height = h; }

    function reset() {
        obstacles = [];
        score = 0;
        curve = 0;
        // إضافة عقبات مبدئية
        spawn(2000);
        spawn(4000);
        spawn(7000);
    }

    function spawn(z) {
        obstacles.push({
            z: z,
            lane: Math.random() < 0.5 ? -1 : 1,
            color: ['#ff3333', '#33ff33', '#ff00de'][Math.floor(Math.random()*3)]
        });
    }

    function update(playerDist, speed) {
        // تغيير انحناء الطريق
        if (Math.random() < 0.02) targetCurve = (Math.random() - 0.5) * 4;
        curve += (targetCurve - curve) * 0.1;

        // إدارة العقبات
        // إزالة القديمة
        obstacles = obstacles.filter(o => o.z > playerDist - 500);

        // إضافة جديدة
        const lastZ = obstacles.length ? obstacles[obstacles.length-1].z : playerDist;
        if (lastZ < playerDist + 6000) {
            spawn(lastZ + 2000 + Math.random() * 3000);
        }

        // حساب النقاط
        obstacles.forEach(o => {
            if (!o.passed && o.z < playerDist) {
                o.passed = true;
                score++;
            }
        });
    }

    // دالة الإسقاط الثلاثي الأبعاد
    function project(x, y, z, camX, camY, camZ) {
        const scale = CONFIG.camD / (z - camZ); // كلما قل Z (اقترب) زاد المقياس
        return {
            x: (x - camX) * scale + width / 2,
            y: (y - camY) * scale + height / 2,
            w: CONFIG.width * scale
        };
    }

    function draw(ctx, playerDist) {
        let x = 0;
        let dx = 0;

        // رسم المقاطع
        for (let i = CONFIG.drawDist; i > 0; i--) {
            const z = playerDist + i * CONFIG.segLen;
            
            // حساب الانحناء التراكمي
            dx += curve;

            // إحداثيات الزاوية البعيدة للمقطع
            const p1 = project(x - CONFIG.width/2, 0, z, 0, CONFIG.camH, 0);
            const p2 = project(x + CONFIG.width/2, 0, z, 0, CONFIG.camH, 0);

            // إحداثيات الزاوية القريبة للمقطع
            const p3 = project(x + CONFIG.width/2 + dx * 50, 0, z - CONFIG.segLen, 0, CONFIG.camH, 0);
            const p4 = project(x - CONFIG.width/2 + dx * 50, 0, z - CONFIG.segLen, 0, CONFIG.camH, 0);

            // رسم الأرضية خارج الطريق
            ctx.fillStyle = "#001133";
            ctx.fillRect(0, p2.y, width, p4.y - p2.y + 2);

            // رسم الطريق
            ctx.fillStyle = "#222";
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.fill();

            // حدود الطريق (Pink)
            ctx.fillStyle = "#ff00de";
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p3.x - (p3.x-p2.x)*0.1, p3.y); ctx.lineTo(p2.x - (p2.x-p1.x)*0.1, p2.y);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(p4.x, p4.y); ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p1.x + (p2.x-p1.x)*0.1, p1.y); ctx.lineTo(p4.x + (p3.x-p4.x)*0.1, p4.y);
            ctx.fill();

            // الخطوط المتقطعة
            if (i % 2 === 0) {
                ctx.fillStyle = "#fff";
                const c1 = project(x, 0, z, 0, CONFIG.camH, 0);
                const c2 = project(x + dx * 50, 0, z - CONFIG.segLen, 0, CONFIG.camH, 0);
                ctx.fillRect(c1.x - 10 * c1.scale, c1.y, 20 * c1.scale, c2.y - c1.y);
            }
        }

        // رسم العقبات
        obstacles.forEach(o => {
            const distZ = o.z - playerDist;
            if (distZ > 0 && distZ < 5000) {
                const obsX = (o.lane * CONFIG.width/4) + (curve * distZ * 50);
                const p = project(obsX, 0, o.z, 0, CONFIG.camH, 0);
                
                if (p.scale > 0) {
                    const size = 800 * p.scale;
                    ctx.fillStyle = o.color;
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
        for (let o of obstacles) {
            const distZ = o.z - distance; // المسافة النسبية (سيتم تمريرها من game.js)
            // في هذا الكود نستخدم playerDist من دالة الـ draw/update
            // لكن للتبسيط: العقبة في o.z، اللاعب في المسافة الحالية المسماة distance في game.js
            // لكن لأننا لا نملك distance هنا مباشرة، سنفترض أن الاصطدام يكون عند Z تقريبي
            // الحل الأفضل: تمرير المسافة الحالية كباراميتر
        }
        return false; // سيتم التعامل معه في Game.js بشكل أفضل للإبساط
    }
    
    // دالة محسنة للتصادم تسمى من Game.js
    function checkCollisionWithDist(playerPos, currentDist) {
        for (let o of obstacles) {
            const zDiff = o.z - currentDist;
            // إذا كانت العقبة في نفس المستوى Z (بين -150 و +150) وفي نفس المسار
            if (zDiff > -100 && zDiff < 100) {
                const targetX = o.lane * (CONFIG.width / 4);
                // تحقق من بقاء اللاعب في المسار
                if (Math.abs(playerPos.x - targetX) < 400) {
                    return true;
                }
            }
        }
        return false;
    }

    return {
        resize, reset, update, draw, checkCollision: checkCollisionWithDist, getScore: () => score
    };
})();
