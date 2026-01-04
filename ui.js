const UI = (function() {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');

    function openModal(type) {
        modal.classList.remove('hidden');
        content.innerHTML = '';

        if (type === 'roads') {
            title.innerText = "الطرقات";
            let html = '<div class="grid">';
            for(let i=0; i<25; i++) {
                const c = `hsl(${i*15}, 60%, 50%)`;
                html += `<div class="item" style="background:${c}" onclick="UI.setRoad(this)"></div>`;
            }
            html += '</div>';
            content.innerHTML = html;
        } else if (type === 'balls') {
            title.innerText = "الكرات";
            let html = '<div class="grid">';
            for(let i=0; i<50; i++) {
                const c = `hsl(${i*8}, 80%, 60%)`;
                html += `<div class="item" style="background:${c}" onclick="UI.setBall(this, '${c}')"></div>`;
            }
            html += '</div>';
            content.innerHTML = html;
        } else if (type === 'leaderboard') {
            title.innerText = "المتصدرين";
            content.innerHTML = `<div style="text-align:right; padding:10px;">1. أحمد - 500<br>2. سارة - 300<br>...</div>`;
        } else if (type === 'settings') {
            title.innerText = "الإعدادات";
            content.innerHTML = `<label><input type="checkbox" checked> صوت</label><br><br><label><input type="checkbox" checked> موسيقى</label>`;
        }
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    function showGameOver(score) {
        title.innerText = "خسرت!";
        title.style.color = "red";
        content.innerHTML = `<h3>النتيجة: ${score}</h3><button onclick="Game.reset(); UI.closeModal()" class="close-btn" style="display:block; margin: 10px auto;">إعادة</button>`;
        modal.classList.remove('hidden');
    }

    // دوال مساعدة للنقر من HTML
    function setRoad(el) {
        document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        // Roads.setColor(...) // يمكن إضافة منطق هنا
    }
    
    function setBall(el, color) {
        document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        if(window.Balls) window.Balls.setColor(color);
    }

    return {
        openModal,
        closeModal,
        showGameOver,
        setRoad,
        setBall
    };
})();
