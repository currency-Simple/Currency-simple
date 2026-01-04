/**
 * ملف balls.js
 * المسؤول عن: رسم اللاعب، تحريكه بين المسارات، وحفظ الألوان المختارة.
 */

const Balls = (function() {
    let currentColor = "#ffffff";
    let currentLane = 0; // -1 يسار، 1 يمين
    let visualX = 0; // الموقع الفعلي للرسم (للحركة الناعمة)
    
    // إعدادات الكاميرا/الإسقاط (نفس إعدادات الطرق)
    const CONFIG = {
        roadWidth: 2000,
        cameraHeight: 1000,
        cameraDepth: 0.84
    };

    function reset() {
        currentLane = 0;
        visualX = 0;
    }

    function switchLane() {
        currentLane = -currentLane; // عكس المسار
    }

    function update(dt) {
        // حركة ناعمة (Lerp) للانتقال بين المسارين
        const targetX = currentLane * (CONFIG.roadWidth / 4);
        visualX += (targetX - visualX) * 10 * dt;
    }

    function draw(ctx) {
        // حساب موقع اللاعب على الشاشة
        // اللاعب دائماً عند Z=100 قليلاً أمام الكاميرا لكي نراه
        const p = project(visualX, 0, 100, 0, CONFIG.cameraHeight, 0);
        const size = p.scale * 1200;

        ctx.save();
        ctx.translate(p.x, p.y);

        // التوهج
        ctx.shadowBlur = 20;
        ctx.shadowColor = currentColor;

        // جسم الكرة
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fillStyle = currentColor;
        ctx.fill();

        // اللمعة
        ctx.beginPath();
        ctx.arc(-size/4, -size/4, size/6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();

        ctx.restore();
    }

    // دالة مساعدة للإسقاط (نسخة مبسطة من roads.js)
    function project(x, y, z, cameraX, cameraY, cameraZ) {
        const scale = CONFIG.cameraDepth / (z - cameraZ);
        return {
            x: (x - cameraX) * scale + window.innerWidth / 2,
            y: (y - cameraY) * scale + window.innerHeight / 2,
            scale: scale
        };
    }

    function setColor(color) {
        currentColor = color;
    }

    function getState() {
        return { lane: currentLane, visualX: visualX };
    }

    return {
        reset,
        switchLane,
        update,
        draw,
        setColor,
        getState
    };
})();
