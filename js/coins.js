// ============================================
// COINS SYSTEM (مع إصلاح الموضع)
// ============================================

class CoinsSystem {
    constructor() {
        this.totalCoins = 0;
        this.coinsInGame = 0;
        this.obstacleCounter = 0;
        this.activeCoins = [];
        this.load();
    }

    // إنشاء نقطة ذهبية
    createCoin(scene, lane) {
        const group = new THREE.Group();
        
        // النقطة الذهبية
        const geometry = new THREE.SphereGeometry(CONFIG.COIN.SIZE, 16, 16);
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
        const glowGeometry = new THREE.SphereGeometry(CONFIG.COIN.GLOW_SIZE, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.COLORS.COIN,
            transparent: true,
            opacity: 0.5,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);

        // الموضع: في مسار الكرة مباشرة
        group.position.set(
            CONFIG.ROAD.LANE_POSITIONS[lane], 
            CONFIG.COIN.HEIGHT, 
            -60
        );
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
            if (coin.userData.collected) return;
            
            // مسافة أكبر للتقاط
            if (coin.position.z > ball.position.z - 3 && 
                coin.position.z < ball.position.z + 3) {
                
                const distance = Math.sqrt(
                    Math.pow(ball.position.x - coin.position.x, 2) +
                    Math.pow(ball.position.y - coin.position.y, 2)
                );
                
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

    // تحديث العداد
    onObstaclePassed() {
        this.obstacleCounter++;
        
        if (this.obstacleCounter % CONFIG.GAME.COIN_SPAWN_INTERVAL === 0) {
            return true;
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

    // الحصول على العملات
    getTotalCoins() {
        return this.totalCoins;
    }

    // إنهاء اللعبة
    endGame() {
        const coinsEarned = this.coinsInGame;
        this.totalCoins += coinsEarned;
        this.save();
        return coinsEarned;
    }

    // إعادة تعيين
    resetGame() {
        this.coinsInGame = 0;
        this.obstacleCounter = 0;
        this.activeCoins.forEach(coin => {
            if (coin.parent) coin.parent.remove(coin);
        });
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

    // حفظ
    save() {
        try {
            localStorage.setItem('rushCoins', this.totalCoins.toString());
        } catch (e) {
            console.warn('Could not save coins');
        }
    }

    // تحميل
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
}

// إنشاء نسخة عامة
const coinsSystem = new CoinsSystem();
