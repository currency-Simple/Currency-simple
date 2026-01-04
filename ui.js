/**
 * ملف ui.js
 * المسؤول عن: إدارة القوائم، الأزرار، والتفاعل مع المستخدم.
 */

const UI = (function() {
    
    function openModal(type) {
        const overlay = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        overlay.classList.remove('hidden');
        body.innerHTML = ''; // تنظيف المحتوى القديم

        if (type === 'roads') {
            title.innerText = "اختر الطريق";
            body.innerHTML = generateRoadGrid();
        } else if (type === 'balls') {
            title.innerText = "اختر الكرة";
            body.innerHTML = generateBallGrid();
        } else if (type === 'leaderboard') {
            title.innerText = "المتصدرين";
            body.innerHTML = `
                <div style="text-align:right; line-height:2;">
                    <div>1. Ahmed - 500</div>
                    <div>2. You - 0</div>
                    <div>3. Guest - 120</div>
                </div>`;
        } else if (type === 'settings') {
            title.innerText = "الإعدادات";
            body.innerHTML = `
                <label><input type="checkbox" checked> موسيقى</label><br><br>
                <label><input type="checkbox" checked> صوت</label>`;
        }
    }

    function closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }

    function updateScore(score, speed) {
        document.getElementById('score').innerText = score;
        document.getElementById('speed').innerText = Math.floor(speed);
    }

    function showGameOver(score) {
        const overlay = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.innerText = "انتهت اللعبة!";
        title.style.color = "red";
        body.innerHTML = `
            <h3>النتيجة: ${score}</h3>
            <p>اضغط إغلاق للعودة للقائمة</p>
            <button onclick="UI.closeModal(); Game.reset();" class="close-btn" style="margin-top:10px;">إعادة اللعب</button>
        `;
        overlay.classList.remove('hidden');
    }

    // توليد شبكة الطرق (محاكاة 25 طريق)
    function generateRoadGrid() {
        let html = '<div class="grid-options">';
        for(let i=0; i<25; i++) {
            const hue = (i * 15) % 360;
            const color = `hsl(${hue}, 70%, 50%)`;
            html += `<div class="option-item" style="background:${color}" onclick="selectRoad(this, '${color}')"></div>`;
        }
        html += '</div>';
        return html;
    }

    window.selectRoad = function(el, color) {
        document.querySelectorAll('.option-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        // تغيير لون حدود الطريق هنا (يمكن ربطه بـ Roads إذا أردنا تعقيداً أكثر)
    };

    // توليد شبكة الكرات (محاكاة 50 كرة)
    function generateBallGrid() {
        let html = '<div class="grid-options" style="grid-template-columns: repeat(5, 1fr);">';
        for(let i=0; i<50; i++) {
            const hue = (i * 8) % 360;
            const color = `hsl(${hue}, 80%, 60%)`;
            html += `<div class="option-item" style="background:${color}" onclick="selectBall(this, '${color}')"></div>`;
        }
        html += '</div>';
        return html;
    }

    window.selectBall = function(el, color) {
        document.querySelectorAll('.option-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        Balls.setColor(color);
    };

    return {
        openModal,
        closeModal,
        updateScore,
        showGameOver
    };
})();
