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
        unlocked: true
    },
    {
        id: 2,
        name: 'Cyber Cyan',
        color: '#00FFFF',
        glowColor: '#00FFFF',
        trailColor: '#00FFFF80',
        unlocked: true
    },
    {
        id: 3,
        name: 'Electric Blue',
        color: '#0080FF',
        glowColor: '#0080FF',
        trailColor: '#0080FF80',
        unlocked: true
    },
    {
        id: 4,
        name: 'Plasma Pink',
        color: '#FF00FF',
        glowColor: '#FF00FF',
        trailColor: '#FF00FF80',
        unlocked: true
    },
    {
        id: 5,
        name: 'Magenta Storm',
        color: '#FF0080',
        glowColor: '#FF0080',
        trailColor: '#FF008080',
        unlocked: true
    }
];

class Ball {
    constructor(type) {
        this.type = type || BALL_TYPES[0];
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
        const targetX = (this.targetLane - 1) * CONFIG.BALL.LANE_WIDTH;
        this.x += (targetX - this.x) * CONFIG.BALL.MOVE_SPEED;
        this.rotation += 0.05;

        if (this.trail.length > 20) {
            this.trail.shift();
        }
        this.trail.push({ x: this.x, y: this.y, z: this.z, alpha: 1 });

        this.trail.forEach((point, i) => {
            point.alpha = i / this.trail.length;
        });
    }

    render(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;
        const screenX = w / 2 + this.x * 100;
        const screenY = h * 0.7 + this.y * 50;

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
        const gradient = ctx.createRadialGradient(
            screenX - this.size * 0.3, screenY - this.size * 0.3, this.size * 0.1,
            screenX, screenY, this.size
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.type.color);
        gradient.addColorStop(1, this.type.color + '80');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
        ctx.fill();

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

class BallManager {
    constructor() {
        this.availableBalls = BALL_TYPES;
        this.currentBall = new Ball(BALL_TYPES[0]);
    }

    selectBall(ballId) {
        const ballType = this.availableBalls.find(b => b.id === ballId);
        if (ballType && ballType.unlocked) {
            this.currentBall = new Ball(ballType);
            return true;
        }
        return false;
    }

    checkUnlocks(stats) {
        // Future implementation
    }
}

console.log('✅ BALLS loaded');
