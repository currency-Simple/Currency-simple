// ============================================
// BALLS SYSTEM (نظام الكرات)
// ============================================

class BallsSystem {
    constructor() {
        this.balls = [
            {
                id: 'ball_default',
                name: 'الكرة الافتراضية',
                icon: '🟢',
                color: 0x00ff88,
                price: 0,
                unlocked: true
            },
            {
                id: 'ball_fire',
                name: 'كرة النار',
                icon: '🔥',
                color: 0xff4400,
                price: 50,
                unlocked: false
            },
            {
                id: 'ball_ice',
                name: 'كرة الجليد',
                icon: '❄️',
                color: 0x00ddff,
                price: 75,
                unlocked: false
            },
            {
                id: 'ball_gold',
                name: 'الكرة الذهبية',
                icon: '🟡',
                color: 0xffd700,
                price: 100,
                unlocked: false
            },
            {
                id: 'ball_purple',
                name: 'الكرة البنفسجية',
                icon: '🟣',
                color: 0x9933ff,
                price: 125,
                unlocked: false
            },
            {
                id: 'ball_rainbow',
                name: 'كرة قوس القزح',
                icon: '🌈',
                color: 0xff00ff,
                price: 200,
                unlocked: false
            },
            {
                id: 'ball_metal',
                name: 'الكرة المعدنية',
                icon: '⚙️',
                color: 0xaaaaaa,
                price: 150,
                unlocked: false
            },
            {
                id: 'ball_plasma',
                name: 'كرة البلازما',
                icon: '⚡',
                color: 0xff00ff,
                price: 250,
                unlocked: false
            },
            {
                id: 'ball_emerald',
                name: 'الكرة الزمردية',
                icon: '💎',
                color: 0x00ff66,
                price: 175,
                unlocked: false
            },
            {
                id: 'ball_ruby',
                name: 'كرة الياقوت',
                icon: '💍',
                color: 0xff0066,
                price: 200,
                unlocked: false
            }
        ];
        
        this.selectedBall = 'ball_default';
        this.load();
    }

    // الحصول على بيانات كرة معينة
    getBall(id) {
        return this.balls.find(ball => ball.id === id);
    }

    // الحصول على الكرة المحددة حالياً
    getSelectedBall() {
        return this.getBall(this.selectedBall);
    }

    // فتح كرة جديدة
    unlockBall(ballId) {
        const ball = this.getBall(ballId);
        if (!ball || ball.unlocked) return false;
        
        if (coinsSystem.spendCoins(ball.price)) {
            ball.unlocked = true;
            this.save();
            this.renderPanel();
            return true;
        }
        return false;
    }

    // اختيار كرة
    selectBall(ballId) {
        const ball = this.getBall(ballId);
        if (ball && ball.unlocked) {
            this.selectedBall = ballId;
            this.save();
            this.renderPanel();
            
            // تحديث لون الكرة في اللعبة
            if (typeof updateBallColor === 'function') {
                updateBallColor();
            }
            return true;
        }
        return false;
    }

    // عرض الواجهة
    renderPanel() {
        const panel = document.getElementById('balls-panel');
        if (!panel) return;
        
        panel.innerHTML = `
            <div class="panel-header">
                <h3>⚽ الكرات</h3>
                <button class="close-panel" onclick="closePanel('balls-panel')">✕</button>
            </div>
            <div class="panel-content">
                <div class="coins-info">
                    <span class="coins-icon">💰</span>
                    <span class="coins-amount">${coinsSystem.getTotalCoins()}</span>
                    <span class="coins-text">عملة</span>
                </div>
                <div class="items-grid" id="balls-grid">
                    ${this.balls.map(ball => this.createBallCard(ball)).join('')}
                </div>
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        this.balls.forEach(ball => {
            const card = document.getElementById(`ball-card-${ball.id}`);
            if (card) {
                card.addEventListener('click', () => this.handleBallClick(ball));
            }
        });
    }

    // إنشاء بطاقة الكرة
    createBallCard(ball) {
        const isSelected = ball.id === this.selectedBall;
        const isLocked = !ball.unlocked;
        
        return `
            <div id="ball-card-${ball.id}" 
                 class="item-card ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}">
                ${isSelected ? '<span class="selected-badge">✓</span>' : ''}
                ${isLocked ? '<span class="lock-icon">🔒</span>' : ''}
                <div class="item-icon" style="filter: ${isLocked ? 'grayscale(1) opacity(0.5)' : 'none'}">${ball.icon}</div>
                <div class="item-name">${ball.name}</div>
                ${isLocked ? `<div class="item-price">${ball.price} 💰</div>` : ''}
                ${isLocked ? `<button class="buy-btn">شراء</button>` : ''}
            </div>
        `;
    }

    // معالجة النقر على الكرة
    handleBallClick(ball) {
        if (ball.unlocked) {
            this.selectBall(ball.id);
        } else {
            const totalCoins = coinsSystem.getTotalCoins();
            if (totalCoins >= ball.price) {
                if (confirm(`هل تريد شراء ${ball.name} مقابل ${ball.price} عملة؟`)) {
                    if (this.unlockBall(ball.id)) {
                        this.selectBall(ball.id);
                        alert('تم الشراء بنجاح! ✅');
                    }
                }
            } else {
                alert(`تحتاج إلى ${ball.price - totalCoins} عملة إضافية! 💰`);
            }
        }
    }

    // حفظ البيانات
    save() {
        try {
            const data = {
                balls: this.balls,
                selectedBall: this.selectedBall
            };
            localStorage.setItem('rushBalls', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save balls data');
        }
    }

    // تحميل البيانات
    load() {
        try {
            const saved = localStorage.getItem('rushBalls');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.balls) {
                    data.balls.forEach((savedBall, index) => {
                        if (this.balls[index]) {
                            this.balls[index].unlocked = savedBall.unlocked;
                        }
                    });
                }
                if (data.selectedBall) {
                    this.selectedBall = data.selectedBall;
                }
            }
        } catch (e) {
            console.warn('Could not load balls data');
        }
    }

    // إضافة كرة جديدة (للتطوير المستقبلي)
    addNewBall(ballData) {
        this.balls.push({
            id: ballData.id || `ball_${Date.now()}`,
            name: ballData.name,
            icon: ballData.icon,
            color: ballData.color,
            price: ballData.price,
            unlocked: false
        });
        this.save();
        this.renderPanel();
    }
}

// إنشاء نسخة عامة
const ballsSystem = new BallsSystem();