// ============================================
// SPEEDBALL 3D - USER INTERFACE
// ============================================

function populateSphereGrid() {
    const grid = document.getElementById('sphereGrid');
    if (!grid) return;

    grid.innerHTML = '';

    BALL_TYPES.forEach(ball => {
        const option = document.createElement('div');
        option.className = 'sphere-option';
        option.style.background = ball.color;
        option.style.boxShadow = `0 0 20px ${ball.glowColor}`;

        if (window.game && window.game.ballManager.currentBall && 
            window.game.ballManager.currentBall.type.id === ball.id) {
            option.classList.add('selected');
        }

        if (ball.unlocked) {
            option.addEventListener('click', () => {
                if (window.game && window.game.ballManager.selectBall(ball.id)) {
                    document.querySelectorAll('.sphere-option').forEach(el => {
                        el.classList.remove('selected');
                    });
                    option.classList.add('selected');
                }
            });
        }

        grid.appendChild(option);
    });
}

function populateRoadList() {
    const list = document.getElementById('roadList');
    if (!list) return;

    list.innerHTML = '';

    ROAD_PATTERNS.forEach(pattern => {
        const option = document.createElement('div');
        option.className = 'road-option';
        
        if (window.game && window.game.roadManager.currentPattern && 
            window.game.roadManager.currentPattern.id === pattern.id) {
            option.classList.add('active');
        }

        option.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
                        ${pattern.name}
                    </div>
                </div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${pattern.color}; 
                            box-shadow: 0 0 10px ${pattern.color};"></div>
            </div>
        `;

        option.addEventListener('click', () => {
            if (window.game) {
                window.game.roadManager.setPattern(pattern.id);
                document.querySelectorAll('.road-option').forEach(el => {
                    el.classList.remove('active');
                });
                option.classList.add('active');
            }
        });

        list.appendChild(option);
    });
}

console.log('✅ UI loaded');
