// ============================================
// SPEEDBALL 3D - COINS & REWARDS SYSTEM
// ============================================

class Coin {
    constructor(x, y, z, value = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.value = value;
        this.rotation = 0;
        this.collected = false;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        // Coin types based on value
        this.type = this.getCoinType(value);
    }

    getCoinType(value) {
        if (value >= 10) {
            return { name: 'diamond', color: '#00FFFF', size: 1.5, rarity: 'legendary' };
        } else if (value >= 5) {
            return { name: 'gold', color: '#FFD700', size: 1.2, rarity: 'rare' };
        } else {
            return { name: 'silver', color: '#C0C0C0', size: 1.0, rarity: 'common' };
        }
    }

    update(speed) {
        this.z += speed * 0.1;
        this.rotation += 0.05;
        this.pulsePhase += 0.1;
    }

    render(ctx, canvas) {
        if (this.collected) return;

        const w = canvas.width;
        const h = canvas.height;
        const perspective = 1 / (1 + this.z * 0.1);
        const screenX = w / 2 + this.x * 100 * perspective;
        const screenY = h * 0.7 + this.y * 50 * perspective;
        const baseSize = 30 * this.type.size * perspective;
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
        const size = baseSize * pulse;

        // Glow effect
        const glowGradient = ctx.createRadialGradient(
            screenX, screenY, size * 0.3,
            screenX, screenY, size * 1.5
        );
        glowGradient.addColorStop(0, this.type.color + 'FF');
        glowGradient.addColorStop(0.5, this.type.color + '40');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Coin face
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(this.rotation);
        
        // Outer circle
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, this.type.color);
        gradient.addColorStop(0.7, this.type.color);
        gradient.addColorStop(1, this.getDarkerColor(this.type.color));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.strokeStyle = this.getDarkerColor(this.type.color);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
        ctx.stroke();

        // Value text
        ctx.fillStyle = '#000';
        ctx.font = `bold ${size * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.value, 0, 0);

        ctx.restore();

        // Shine effect
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-size * 0.3, -size * 0.3, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    getDarkerColor(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r * 0.6}, ${g * 0.6}, ${b * 0.6})`;
    }

    checkCollision(ballPos, collisionDistance = 1.0) {
        if (this.collected) return false;

        const dist = Math.sqrt(
            Math.pow(this.x - ballPos.x, 2) +
            Math.pow(this.z - ballPos.z, 2)
        );

        return dist < collisionDistance;
    }

    collect() {
        this.collected = true;
    }

    isOffScreen() {
        return this.z > 15;
    }
}

class CoinManager {
    constructor() {
        this.coins = [];
        this.totalCoins = 0;
        this.sessionCoins = 0;
        this.spawnInterval = 20;
        this.lastSpawnZ = 0;
        this.loadTotalCoins();
    }

    initialize() {
        this.coins = [];
        this.sessionCoins = 0;
        this.lastSpawnZ = 0;
    }

    update(speed, ballPos) {
        // Update existing coins
        this.coins.forEach(coin => {
            coin.update(speed);

            // Check collision
            if (coin.checkCollision(ballPos)) {
                coin.collect();
                this.collectCoin(coin.value);
            }
        });

        // Remove off-screen coins
        this.coins = this.coins.filter(coin => !coin.isOffScreen());

        // Spawn new coins
        if (this.coins.length === 0 || Math.abs(this.coins[this.coins.length - 1].z) > this.spawnInterval) {
            this.spawnCoin();
        }
    }

    spawnCoin() {
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const x = lane * 2;
        const y = -0.5;
        const z = this.lastSpawnZ - this.spawnInterval;

        // Determine coin value based on rarity
        let value = 1;
        const roll = Math.random();
        if (roll < 0.05) { // 5% chance
            value = 10; // Diamond
        } else if (roll < 0.20) { // 15% chance
            value = 5; // Gold
        } else {
            value = 1; // Silver
        }

        const coin = new Coin(x, y, z, value);
        this.coins.push(coin);
        this.lastSpawnZ = z;
    }

    collectCoin(value) {
        this.sessionCoins += value;
        this.totalCoins += value;
        this.saveTotalCoins();

        // Play sound effect (if implemented)
        // playSound('coin');
    }

    render(ctx, canvas) {
        this.coins.forEach(coin => coin.render(ctx, canvas));
    }

    getSessionCoins() {
        return this.sessionCoins;
    }

    getTotalCoins() {
        return this.totalCoins;
    }

    saveTotalCoins() {
        localStorage.setItem('speedballTotalCoins', this.totalCoins.toString());
    }

    loadTotalCoins() {
        const saved = localStorage.getItem('speedballTotalCoins');
        this.totalCoins = saved ? parseInt(saved) : 0;
    }

    spendCoins(amount) {
        if (this.totalCoins >= amount) {
            this.totalCoins -= amount;
            this.saveTotalCoins();
            return true;
        }
        return false;
    }

    reset() {
        this.initialize();
    }
}

// Rewards and Achievements
const REWARDS = [
    {
        id: 1,
        name: 'Speed Demon',
        description: 'Reach 500% speed',
        coins: 100,
        requirement: { type: 'speed', value: 500 }
    },
    {
        id: 2,
        name: 'Triangle Master',
        description: 'Collect 100 triangles in one game',
        coins: 150,
        requirement: { type: 'triangles', value: 100 }
    },
    {
        id: 3,
        name: 'High Scorer',
        description: 'Score 5000 points',
        coins: 200,
        requirement: { type: 'score', value: 5000 }
    },
    {
        id: 4,
        name: 'Coin Collector',
        description: 'Collect 1000 coins total',
        coins: 250,
        requirement: { type: 'totalCoins', value: 1000 }
    },
    {
        id: 5,
        name: 'Marathon Runner',
        description: 'Play for 10 minutes straight',
        coins: 300,
        requirement: { type: 'playtime', value: 600 }
    }
];

class RewardsManager {
    constructor() {
        this.completedRewards = [];
        this.loadProgress();
    }

    checkReward(rewardId, currentValue) {
        const reward = REWARDS.find(r => r.id === rewardId);
        if (!reward || this.completedRewards.includes(rewardId)) {
            return null;
        }

        if (currentValue >= reward.requirement.value) {
            this.completeReward(rewardId);
            return reward;
        }

        return null;
    }

    completeReward(rewardId) {
        if (!this.completedRewards.includes(rewardId)) {
            this.completedRewards.push(rewardId);
            this.saveProgress();
            
            const reward = REWARDS.find(r => r.id === rewardId);
            if (reward) {
                // Award coins (would integrate with CoinManager)
                return reward.coins;
            }
        }
        return 0;
    }

    getProgress() {
        return {
            completed: this.completedRewards.length,
            total: REWARDS.length,
            rewards: REWARDS.map(r => ({
                ...r,
                completed: this.completedRewards.includes(r.id)
            }))
        };
    }

    saveProgress() {
        localStorage.setItem('speedballRewards', JSON.stringify(this.completedRewards));
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('speedballRewards');
            this.completedRewards = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.completedRewards = [];
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Coin, CoinManager, RewardsManager, REWARDS };
}
