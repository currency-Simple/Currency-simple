// ============================================
// COINS SYSTEM (نظام النقاط والعملات)
// ============================================

class CoinsSystem {
    constructor() {
        this.totalCoins = 0;
        this.coinsInGame = 0;
        this.obstacleCounter = 0;
        this.activeCoins = []; // النقاط الموجودة على الطريق
        this.load();
    }

    // إنشاء نقطة ذهبية على الطريق
    createCoin(scene, lane) {
        const group = new THREE.Group();
        
        // النقطة الذهبية
        const geometry = new THREE.SphereGeometry(0.6, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.COLORS.COIN,
            emissive: CONFIG.COLORS.COIN,
            emissiveIntensity: 0.8,
            shininess: 150
        });
        
        const coin = new THREE.Mesh(geometry, material);
        coin.castShadow = true;
        group.add(coin);

        // توهج
        const glowGeometry = new THREE.SphereGeometry(0.9, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.COLORS.COIN,
            transparent: true,
            opacity: 0.5,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);

        // الموضع
        group.position.set(CONFIG.ROAD.LANE_POSITIONS[lane], 2, -70);
        group.userData.isCoin = true;
        group.userData.lane = lane;
        group.userData.collected = false;

        scene.add(group);
        this.activeCoins.push(group);
        
        return group;
    }

    // التحقق من التقاط النقطة
    checkCoinCollection(ball) {
        this.activeCoins.forEach((coin, index) => {
            if (!coin.userData.collected && 
                coin.position.z > ball.position.z - 2 && 
                coin.position.z < ball.position.z + 2) {
                
                const distance = Math.abs(ball.position.x - coin.position.x);
                
                if (distance < 2) {
                    this.collectCoin(coin, index);
                }
            }
        });
    }

    // جمع النقطة
    collectCoin(coin, index) {
        coin.userData.collected = true;
        this.coinsInGame++;
        this.updateDisplay();
        
        // تأثير بصري
        if (typeof createParticleExplosion === 'function') {
            createParticleExplosion(
                coin.position.x, 
                coin.position.y, 
                coin.position.z, 
                CONFIG.COLORS.COIN, 
                20
            );
        }
        
        // إزالة النقطة
        setTimeout(() => {
            if (coin.parent) {
                coin.parent.remove(coin);
            }
            this.activeCoins.splice(index, 1);
        }, 100);
    }

    // تحديث العداد عند تجاوز مثلث
    onObstaclePassed() {
        this.obstacleCounter++;
        
        // إنشاء نقطة كل 7 مثلثات
        if (this.obstacleCounter % CONFIG.GAME.COIN_SPAWN_INTERVAL === 0) {
            return true; // إشارة لإنشاء نقطة
        }
        return false;
    }

    // إضافة عملات
    addCoins(amount) {
        this.totalCoins += amount;
        this.save();
        this.updateDisplay();
    }

    // إنفاق عملات
    spendCoins(amount) {
        if (this.totalCoins >= amount) {
            this.totalCoins -= amount;
            this.save();
            this.updateDisplay();
            return true;
        }
        return false;
    }

    // الحصول على إجمالي العملات
    getTotalCoins() {
        return this.totalCoins;
    }

    // إنهاء اللعبة - تحويل النقاط المجموعة إلى عملات
    endGame() {
        const coinsEarned = this.coinsInGame;
        this.totalCoins += coinsEarned;
        this.save();
        return coinsEarned;
    }

    // إعادة تعيين اللعبة
    resetGame() {
        this.coinsInGame = 0;
        this.obstacleCounter = 0;
        this.activeCoins = [];
        this.updateDisplay();
    }

    // تحديث العرض
    updateDisplay() {
        const coinsValueEl = document.getElementById('coins-value');
        const menuCoinsEl = document.getElementById('menu-coins-value');
        
        if (coinsValueEl) {
            coinsValueEl.textContent = this.coinsInGame;
        }
        if (menuCoinsEl) {
            menuCoinsEl.textContent = this.totalCoins;
        }
    }

    // حفظ البيانات
    save() {
        try {
            localStorage.setItem('rushCoins', this.totalCoins.toString());
        } catch (e) {
            console.warn('Could not save coins');
        }
    }

    // تحميل البيانات
    load() {
        try {
            const saved = localStorage.getItem('rushCoins');
            if (saved) {
                this.totalCoins = parseInt(saved) || 0;
                this.updateDisplay();
            }
        } catch (e) {
            console.warn('Could not load coins');
        }
    }

    // تحديث موضع النقاط (يستدعى في حلقة اللعبة)
    updateCoins(speed, roadPattern, patternProgress) {
        this.activeCoins.forEach((coin, index) => {
            if (coin.userData.collected) return;
            
            coin.position.z += speed * 2.5;
            
            // تطبيق نفس نمط الطريق
            if (roadPattern) {
                const progress = Math.min(1, patternProgress / roadPattern.length);
                coin.position.x = CONFIG.ROAD.LANE_POSITIONS[coin.userData.lane] + 
                                 (roadPattern.xOffset || 0) * progress;
                coin.position.y = 2 + (roadPattern.yOffset || 0) * Math.sin(progress * Math.PI);
            }
            
            // دوران النقطة
            coin.rotation.y += 0.05;
            
            // إزالة النقاط البعيدة
            if (coin.position.z > 10) {
                if (coin.parent) coin.parent.remove(coin);
                this.activeCoins.splice(index, 1);
            }
        });
    }
}

// إنشاء نسخة عامة
const coinsSystem = new CoinsSystem();