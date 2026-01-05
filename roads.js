// ============================================
// ROADS SYSTEM (نظام الطرقات)
// ============================================

class RoadsSystem {
    constructor() {
        this.roads = [
            {
                id: 'road_default',
                name: 'الطريق الافتراضي',
                icon: '🛣️',
                color: 0x1a1a1a,
                price: 0,
                unlocked: true
            },
            {
                id: 'road_neon',
                name: 'طريق النيون',
                icon: '✨',
                color: 0x000033,
                price: 60,
                unlocked: false
            },
            {
                id: 'road_space',
                name: 'طريق الفضاء',
                icon: '🌌',
                color: 0x0a0a1a,
                price: 100,
                unlocked: false
            },
            {
                id: 'road_desert',
                name: 'طريق الصحراء',
                icon: '🏜️',
                color: 0x8b7355,
                price: 80,
                unlocked: false
            },
            {
                id: 'road_ocean',
                name: 'طريق المحيط',
                icon: '🌊',
                color: 0x004466,
                price: 120,
                unlocked: false
            },
            {
                id: 'road_lava',
                name: 'طريق الحمم',
                icon: '🌋',
                color: 0x330000,
                price: 150,
                unlocked: false
            },
            {
                id: 'road_cyber',
                name: 'طريق السايبر',
                icon: '💻',
                color: 0x001a1a,
                price: 180,
                unlocked: false
            },
            {
                id: 'road_rainbow',
                name: 'طريق قوس القزح',
                icon: '🌈',
                color: 0x2a2a2a,
                price: 200,
                unlocked: false
            },
            {
                id: 'road_galaxy',
                name: 'طريق المجرة',
                icon: '🌠',
                color: 0x1a0033,
                price: 220,
                unlocked: false
            },
            {
                id: 'road_matrix',
                name: 'طريق ماتريكس',
                icon: '🟢',
                color: 0x001100,
                price: 250,
                unlocked: false
            }
        ];
        
        this.selectedRoad = 'road_default';
        this.load();
    }

    // الحصول على بيانات طريق معين
    getRoad(id) {
        return this.roads.find(road => road.id === id);
    }

    // الحصول على الطريق المحدد حالياً
    getSelectedRoad() {
        return this.getRoad(this.selectedRoad);
    }

    // فتح طريق جديد
    unlockRoad(roadId) {
        const road = this.getRoad(roadId);
        if (!road || road.unlocked) return false;
        
        if (coinsSystem.spendCoins(road.price)) {
            road.unlocked = true;
            this.save();
            this.renderPanel();
            return true;
        }
        return false;
    }

    // اختيار طريق
    selectRoad(roadId) {
        const road = this.getRoad(roadId);
        if (road && road.unlocked) {
            this.selectedRoad = roadId;
            this.save();
            this.renderPanel();
            
            // تحديث لون الطريق في اللعبة
            if (typeof updateRoadColor === 'function') {
                updateRoadColor();
            }
            return true;
        }
        return false;
    }

    // عرض الواجهة
    renderPanel() {
        const panel = document.getElementById('roads-panel');
        if (!panel) return;
        
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🛣️ الطرقات</h3>
                <button class="close-panel" onclick="closePanel('roads-panel')">✕</button>
            </div>
            <div class="panel-content">
                <div class="coins-info">
                    <span class="coins-icon">💰</span>
                    <span class="coins-amount">${coinsSystem.getTotalCoins()}</span>
                    <span class="coins-text">عملة</span>
                </div>
                <div class="items-grid" id="roads-grid">
                    ${this.roads.map(road => this.createRoadCard(road)).join('')}
                </div>
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        this.roads.forEach(road => {
            const card = document.getElementById(`road-card-${road.id}`);
            if (card) {
                card.addEventListener('click', () => this.handleRoadClick(road));
            }
        });
    }

    // إنشاء بطاقة الطريق
    createRoadCard(road) {
        const isSelected = road.id === this.selectedRoad;
        const isLocked = !road.unlocked;
        
        return `
            <div id="road-card-${road.id}" 
                 class="item-card ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}">
                ${isSelected ? '<span class="selected-badge">✓</span>' : ''}
                ${isLocked ? '<span class="lock-icon">🔒</span>' : ''}
                <div class="item-icon" style="filter: ${isLocked ? 'grayscale(1) opacity(0.5)' : 'none'}">${road.icon}</div>
                <div class="item-name">${road.name}</div>
                ${isLocked ? `<div class="item-price">${road.price} 💰</div>` : ''}
                ${isLocked ? `<button class="buy-btn">شراء</button>` : ''}
            </div>
        `;
    }

    // معالجة النقر على الطريق
    handleRoadClick(road) {
        if (road.unlocked) {
            this.selectRoad(road.id);
        } else {
            const totalCoins = coinsSystem.getTotalCoins();
            if (totalCoins >= road.price) {
                if (confirm(`هل تريد شراء ${road.name} مقابل ${road.price} عملة؟`)) {
                    if (this.unlockRoad(road.id)) {
                        this.selectRoad(road.id);
                        alert('تم الشراء بنجاح! ✅');
                    }
                }
            } else {
                alert(`تحتاج إلى ${road.price - totalCoins} عملة إضافية! 💰`);
            }
        }
    }

    // حفظ البيانات
    save() {
        try {
            const data = {
                roads: this.roads,
                selectedRoad: this.selectedRoad
            };
            localStorage.setItem('rushRoads', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save roads data');
        }
    }

    // تحميل البيانات
    load() {
        try {
            const saved = localStorage.getItem('rushRoads');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.roads) {
                    data.roads.forEach((savedRoad, index) => {
                        if (this.roads[index]) {
                            this.roads[index].unlocked = savedRoad.unlocked;
                        }
                    });
                }
                if (data.selectedRoad) {
                    this.selectedRoad = data.selectedRoad;
                }
            }
        } catch (e) {
            console.warn('Could not load roads data');
        }
    }

    // إضافة طريق جديد (للتطوير المستقبلي)
    addNewRoad(roadData) {
        this.roads.push({
            id: roadData.id || `road_${Date.now()}`,
            name: roadData.name,
            icon: roadData.icon,
            color: roadData.color,
            price: roadData.price,
            unlocked: false
        });
        this.save();
        this.renderPanel();
    }
}

// إنشاء نسخة عامة
const roadsSystem = new RoadsSystem();