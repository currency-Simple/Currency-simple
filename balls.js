const Balls = (function() {
    let color = "#ffffff";
    let lane = 0; // -1 يمين، 1 يسار (في الواقع -1 و 1)
    let visualX = 0;

    function reset() {
        lane = 0;
        visualX = 0;
    }

    function switchLane() {
        lane = -lane;
    }

    function update() {
        // حركة ناعمة
        const targetX = lane * 500; // عرض المسار (نصف الطريق 1000)
        visualX += (targetX - visualX) * 0.2;
    }

    function draw(ctx) {
        // نفس معادلة الإسقاط في Roads
        const w = window.innerWidth;
        const h = window.innerHeight;
        const camH = 1000;
        const camD = 0.8;
        const z = 100; // اللاعب أمام الكاميرا قليلاً

        const scale = camD / (z - 0);
        const x = (visualX - 0) * scale + w / 2;
        const y = (0 - camH) * scale + h / 2;
        const size = 1200 * scale;

        if (size < 1) return; // لا ترسم إذا كانت صغيرة جداً

        ctx.save();
        ctx.translate(x, y);

        // التوهج
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;

        // الكرة
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();

        // لمعان
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.arc(-size/4, -size/4, size/5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function setColor(c) { color = c; }
    function getPosition() { return { x: visualX, lane: lane }; }

    return { reset, switchLane, update, draw, setColor, getPosition };
})();
