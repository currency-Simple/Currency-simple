// ============================================
// SPEEDBALL 3D - ROADS SYSTEM
// ============================================

const ROAD_PATTERNS = [
    {
        id: 1,
        name: 'Straight Highway',
        type: 'straight',
        color: '#00ffff',
        generate: function(z, offset) {
            return {
                leftBoundary: -3,
                rightBoundary: 3,
                centerLine: 0,
                lanes: [
                    { x: -2, active: true },
                    { x: 0, active: true },
                    { x: 2, active: true }
                ]
            };
        }
    },
    {
        id: 2,
        name: 'Wave Road',
        type: 'wave',
        color: '#00ff88',
        generate: function(z, offset) {
            const wave = Math.sin(z * 0.1 + offset) * 1.5;
            return {
                leftBoundary: -3 + wave,
                rightBoundary: 3 + wave,
                centerLine: wave,
                lanes: [
                    { x: -2 + wave, active: true },
                    { x: 0 + wave, active: true },
                    { x: 2 + wave, active: true }
                ]
            };
        }
    },
    {
        id: 3,
        name: 'Zigzag Path',
        type: 'zigzag',
        color: '#ff00ff',
        generate: function(z, offset) {
            const zigzag = Math.floor((z + offset) / 10) % 2 === 0 ? -1 : 1;
            return {
                leftBoundary: -3 + zigzag,
                rightBoundary: 3 + zigzag,
                centerLine: zigzag,
                lanes: [
                    { x: -2 + zigzag, active: true },
                    { x: 0 + zigzag, active: true },
                    { x: 2 + zigzag, active: true }
                ]
            };
        }
    }
];

class RoadSegment {
    constructor(z, pattern) {
        this.z = z;
        this.pattern = pattern;
        this.offset = Math.random() * Math.PI * 2;
        this.data = pattern.generate(0, this.offset);
    }

    update(speed) {
        this.z += speed * 0.1;
        this.data = this.pattern.generate(Math.abs(this.z), this.offset);
    }

    render(ctx, canvas) {
        if (this.z > 15) return;

        const w = canvas.width;
        const h = canvas.height;
        const perspective = 1 / (1 + this.z * 0.1);
        const roadY = h * 0.7;

        const leftX = w / 2 + (this.data.leftBoundary * 100 * perspective);
        const rightX = w / 2 + (this.data.rightBoundary * 100 * perspective);
        const segmentWidth = rightX - leftX;
        
        // Road base
        ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
        ctx.fillRect(leftX, roadY - 100 * perspective, segmentWidth, 200 * perspective);

        // Lane markers
        ctx.strokeStyle = `rgba(100, 100, 100, ${CONFIG.ROAD.LANE_MARKER_OPACITY * perspective})`;
        ctx.lineWidth = 2 * perspective;
        
        this.data.lanes.forEach((lane, i) => {
            if (i > 0 && lane.active) {
                const laneX = w / 2 + lane.x * 100 * perspective;
                ctx.beginPath();
                ctx.moveTo(laneX, roadY - 100 * perspective);
                ctx.lineTo(laneX, roadY + 100 * perspective);
                ctx.stroke();
            }
        });

        // Road glow
        if (CONFIG.GRAPHICS.GLOW_EFFECTS) {
            const gradient = ctx.createLinearGradient(leftX, roadY, rightX, roadY);
            const glowColor = this.pattern.color || '#00ffff';
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, glowColor + '1A');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(leftX, roadY - 100 * perspective, segmentWidth, 200 * perspective);
        }
    }

    isOffScreen() {
        return this.z > 15;
    }
}

class RoadManager {
    constructor() {
        this.segments = [];
        this.patterns = ROAD_PATTERNS;
        this.currentPattern = this.patterns[0];
        this.nextPatternZ = 50;
    }

    initialize() {
        this.segments = [];
        for (let i = 0; i < CONFIG.ROAD.INITIAL_SEGMENTS; i++) {
            this.addSegment(-i * CONFIG.ROAD.SEGMENT_LENGTH);
        }
    }

    addSegment(z) {
        if (z < this.nextPatternZ - 200) {
            this.currentPattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
            this.nextPatternZ = z - 50;
        }

        const segment = new RoadSegment(z, this.currentPattern);
        this.segments.push(segment);
    }

    update(speed) {
        this.segments.forEach(seg => seg.update(speed));
        this.segments = this.segments.filter(seg => !seg.isOffScreen());

        if (this.segments.length < CONFIG.ROAD.INITIAL_SEGMENTS) {
            const lastZ = Math.min(...this.segments.map(s => s.z));
            this.addSegment(lastZ - CONFIG.ROAD.SEGMENT_LENGTH);
        }
    }

    render(ctx, canvas) {
        const sorted = [...this.segments].sort((a, b) => a.z - b.z);
        sorted.forEach(seg => seg.render(ctx, canvas));
    }

    setPattern(patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (pattern) {
            this.currentPattern = pattern;
        }
    }

    reset() {
        this.initialize();
        this.nextPatternZ = 50;
    }
}

console.log('✅ ROADS loaded');
