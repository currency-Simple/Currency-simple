// ============================================
// SPEEDBALL 3D - BALLS SYSTEM
// ============================================

const BALL_TYPES = [
    {
        id: 1,
        name: 'Neon Green',
        color: '#00FF00',
        glowColor: '#00FF00',
        trailColor: '#00FF0080',
        rarity: 'common',
        unlocked: true,
        special: false
    },
    {
        id: 2,
        name: 'Cyber Cyan',
        color: '#00FFFF',
        glowColor: '#00FFFF',
        trailColor: '#00FFFF80',
        rarity: 'common',
        unlocked: true,
        special: false
    },
    {
        id: 3,
        name: 'Electric Blue',
        color: '#0080FF',
        glowColor: '#0080FF',
        trailColor: '#0080FF80',
        rarity: 'common',
        unlocked: true,
        special: false
    },
    {
        id: 4,
        name: 'Plasma Pink',
        color: '#FF00FF',
        glowColor: '#FF00FF',
        trailColor: '#FF00FF80',
        rarity: 'rare',
        unlocked: true,
        special: false
    },
    {
        id: 5,
        name: 'Magenta Storm',
        color: '#FF0080',
        glowColor: '#FF0080',
        trailColor: '#FF008080',
        rarity: 'rare',
        unlocked: true,
        special: false
    },
    {
        id: 6,
        name: 'Golden Sun',
        color: '#FFD700',
        glowColor: '#FFA500',
        trailColor: '#FFD70080',
        rarity: 'epic',
        unlocked: false,
        unlockCondition: 'Score 1000',
        special: true,
        effect: 'doubleScore'
    },
    {
        id: 7,
        name: 'Rainbow Orb',
        color: 'rainbow',
        glowColor: '#FFFFFF',
        trailColor: '#FFFFFF80',
        rarity: 'legendary',
        unlocked: false,
        unlockCondition: 'Score 5000',
        special: true,
        effect: 'rainbow'
    },
    {
        id: 8,
        name: 'Shadow Sphere',
        color: '#1a1a1a',
        glowColor: '#8B00FF',
        trailColor: '#8B00FF80',
        rarity: 'epic',
        unlocked: false,
        unlockCondition: 'Play 50 games',
        special: true,
        effect: 'stealth'
    }
];

class Ball {
    constructor(type = BALL_TYPES[0]) {
        this.type = type;
        this.x = 0;
        this.y = CONFIG.BALL.START_Y;
        this.z = CONFIG.BALL.START_Z;
        this.targetLane = 1;
        this.currentLane = 1;
        this.size = CONFIG.BALL.SIZE;
        this.rotation = 0;
        this.trail = [];
    }

    moveTo(lane) {
        if (lane < 0) lane = 0;
        if (lane > 2) lane = 2;
        this.targetLane = lane;
    }

    update() {
        // Smooth lane transition
        const targetX = (this.targetLane - 1) * CONFIG.BALL.LANE_WIDTH;
        this.x += (targetX - this.x) * CONFIG.BALL.MOVE_SPEED;

        // Update rotation
        this.rotation += 0.05;

        // Update trail
        if (this.trail.length > 20) {
            this.trail.shift();
        }
        this.trail.push({ x: this.x, y: this.y, z: this.z, alpha: 1 });

        // Fade trail
        this.trail.forEach((point, i) => {
            point.alpha = i / this.trail.length;
        });
    }

    render(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;
        
        const screenX = w / 2 + this.x * 100;
        const screenY = h * 0.7 + this.y * 50;

        // Draw trail
        if (CONFIG.GRAPHICS.TRAIL_EFFECTS) {
            this.renderTrail(ctx, canvas);
        }

        // Draw glow
        if (CONFIG.GRAPHICS.GLOW_EFFECTS) {
            const glowGradient = ctx.createRadialGradient(
                screenX, screenY, this.size * 0.5,
                screenX, screenY, this.size * CONFIG.BALL.GLOW_INTENSITY
            );
            glowGradient.addColorStop(0, this.type.glowColor + 'FF');
            glowGradient.addColorStop(0.5, this.type.glowColor + '40');
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.size * CONFIG.BALL.GLOW_INTENSITY, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw ball
        if (this.type.color === 'rainbow') {
            this.renderRainbowBall(ctx, screenX, screenY);
        } else {
            this.renderNormalBall(ctx, screenX, screenY);
        }

        // Draw shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(
            screenX - this.size * 0.3,
            screenY - this.size * 0.3,
            this.size * 0.3,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    renderNormalBall(ctx, x, y) {
        const gradient = ctx.createRadialGradient(
            x - this.size * 0.3, y - this.size * 0.3, this.size * 0.1,
            x, y, this.size
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.type.color);
        gradient.addColorStop(1, this.type.color + '80');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    renderRainbowBall(ctx, x, y) {
        const gradient = ctx.createConicGradient(this.rotation, x, y);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.16, '#FF7F00');
        gradient.addColorStop(0.33, '#FFFF00');
        gradient.addColorStop(0.5, '#00FF00');
        gradient.addColorStop(0.66, '#0000FF');
        gradient.addColorStop(0.83, '#8B00FF');
        gradient.addColorStop(1, '#FF0000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    renderTrail(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;

        this.trail.forEach((point, i) => {
            const screenX = w / 2 + point.x * 100;
            const screenY = h * 0.7 + point.y * 50;
            const size = this.size * 0.5 * point.alpha;

            ctx.fillStyle = this.type.trailColor.slice(0, -2) + 
                           Math.floor(point.alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    getPosition() {
        return { x: this.x, y: this.y, z: this.z };
    }

    reset() {
        this.x = 0;
        this.y = CONFIG.BALL.START_Y;
        this.z = CONFIG.BALL.START_Z;
        this.targetLane = 1;
        this.currentLane = 1;
        this.trail = [];
    }
}

// Ball Manager
class BallManager {
    constructor() {
        this.availableBalls = BALL_TYPES;
        this.currentBall = null;
        this.loadProgress();
    }

    selectBall(ballId) {
        const ballType = this.availableBalls.find(b => b.id === ballId);
        if (ballType && ballType.unlocked) {
            this.currentBall = new Ball(ballType);
            this.saveProgress();
            return true;
        }
        return false;
    }

    unlockBall(ballId) {
        const ball = this.availableBalls.find(b => b.id === ballId);
        if (ball) {
            ball.unlocked = true;
            this.saveProgress();
        }
    }

    checkUnlocks(stats) {
        // Check unlock conditions
        this.availableBalls.forEach(ball => {
            if (!ball.unlocked && ball.unlockCondition) {
                if (ball.unlockCondition.includes('Score') && 
                    stats.highestScore >= parseInt(ball.unlockCondition.match(/\d+/)[0])) {
                    this.unlockBall(ball.id);
                } else if (ball.unlockCondition.includes('Play') && 
                          stats.totalGames >= parseInt(ball.unlockCondition.match(/\d+/)[0])) {
                    this.unlockBall(ball.id);
                }
            }
        });
    }

    saveProgress() {
        const progress = {
            unlockedBalls: this.availableBalls.filter(b => b.unlocked).map(b => b.id),
            currentBallId: this.currentBall?.type.id || 1
        };
        localStorage.setItem('ballProgress', JSON.stringify(progress));
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('ballProgress');
            if (saved) {
                const progress = JSON.parse(saved);
                progress.unlockedBalls.forEach(id => {
                    const ball = this.availableBalls.find(b => b.id === id);
                    if (ball) ball.unlocked = true;
                });
                this.selectBall(progress.currentBallId || 1);
            } else {
                this.selectBall(1);
            }
        } catch (e) {
            this.selectBall(1);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Ball, BallManager, BALL_TYPES };
}