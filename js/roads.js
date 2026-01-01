// ============================================
// SPEEDBALL 3D - ROADS SYSTEM
// ============================================

const ROAD_PATTERNS = [
    {
        id: 1,
        name: 'Straight Highway',
        type: 'straight',
        lanes: 3,
        difficulty: 'easy',
        description: 'Classic straight road with 3 lanes',
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
        lanes: 3,
        difficulty: 'medium',
        description: 'Sinusoidal wave pattern',
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
        lanes: 3,
        difficulty: 'hard',
        description: 'Sharp zigzag turns',
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
    },
    {
        id: 4,
        name: 'Split Left',
        type: 'split_left',
        lanes: 3,
        difficulty: 'medium',
        description: 'Road splits to the left',
        color: '#ffd700',
        generate: function(z, offset) {
            const split = Math.max(-2, -2 + (z + offset) * 0.05);
            return {
                leftBoundary: -4 + split,
                rightBoundary: 3,
                centerLine: split * 0.5,
                lanes: [
                    { x: -3 + split, active: true },
                    { x: -1 + split * 0.5, active: true },
                    { x: 1, active: true }
                ]
            };
        }
    },
    {
        id: 5,
        name: 'Split Right',
        type: 'split_right',
        lanes: 3,
        difficulty: 'medium',
        description: 'Road splits to the right',
        color: '#ff8c00',
        generate: function(z, offset) {
            const split = Math.min(2, -2 + (z + offset) * 0.05);
            return {
                leftBoundary: -3,
                rightBoundary: 4 + split,
                centerLine: split * 0.5,
                lanes: [
                    { x: -1, active: true },
                    { x: 1 + split * 0.5, active: true },
                    { x: 3 + split, active: true }
                ]
            };
        }
    },
    {
        id: 6,
        name: 'Merge Point',
        type: 'merge',
        lanes: 2,
        difficulty: 'hard',
        description: 'Two lanes merge into one',
        color: '#ff0080',
        generate: function(z, offset) {
            const merge = Math.max(0, 2 - (z + offset) * 0.1);
            return {
                leftBoundary: -2 - merge,
                rightBoundary: 2 + merge,
                centerLine: 0,
                lanes: [
                    { x: -1 - merge * 0.5, active: merge > 0 },
                    { x: 1 + merge * 0.5, active: merge > 0 }
                ]
            };
        }
    },
    {
        id: 7,
        name: 'Spiral Road',
        type: 'spiral',
        lanes: 3,
        difficulty: 'expert',
        description: 'Spiral pattern road',
        color: '#8b00ff',
        generate: function(z, offset) {
            const angle = (z + offset) * 0.2;
            const radius = 1.5;
            const spiralX = Math.cos(angle) * radius;
            return {
                leftBoundary: -3 + spiralX,
                rightBoundary: 3 + spiralX,
                centerLine: spiralX,
                lanes: [
                    { x: -2 + spiralX, active: true },
                    { x: 0 + spiralX, active: true },
                    { x: 2 + spiralX, active: true }
                ]
            };
        }
    },
    {
        id: 8,
        name: 'Double Wave',
        type: 'double_wave',
        lanes: 3,
        difficulty: 'expert',
        description: 'Two overlapping wave patterns',
        color: '#00ffff',
        generate: function(z, offset) {
            const wave1 = Math.sin(z * 0.15 + offset) * 1.2;
            const wave2 = Math.cos(z * 0.08 + offset) * 0.8;
            const combined = wave1 + wave2;
            return {
                leftBoundary: -3 + combined,
                rightBoundary: 3 + combined,
                centerLine: combined,
                lanes: [
                    { x: -2 + combined, active: true },
                    { x: 0 + combined, active: true },
                    { x: 2 + combined, active: true }
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
        const roadWidth = w * CONFIG.ROAD.WIDTH * perspective;

        // Road base
        ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
        const leftX = w / 2 + (this.data.leftBoundary * 100 * perspective);
        const rightX = w / 2 + (this.data.rightBoundary * 100 * perspective);
        const segmentWidth = rightX - leftX;
        
        ctx.fillRect(leftX, roadY - 100 * perspective, segmentWidth, 200 * perspective);

        // Lane markers
        if (CONFIG.GRAPHICS.QUALITY !== 'low') {
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
        }

        // Road glow
        if (CONFIG.GRAPHICS.GLOW_EFFECTS) {
            const gradient = ctx.createLinearGradient(leftX, roadY, rightX, roadY);
            const glowColor = this.pattern.color || '#00ffff';
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, glowColor + Math.floor(0.1 * perspective * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(leftX, roadY - 100 * perspective, segmentWidth, 200 * perspective);
        }

        // Road edges
        ctx.strokeStyle = this.pattern.color + '80';
        ctx.lineWidth = 3 * perspective;
        ctx.beginPath();
        ctx.moveTo(leftX, roadY - 100 * perspective);
        ctx.lineTo(leftX, roadY + 100 * perspective);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightX, roadY - 100 * perspective);
        ctx.lineTo(rightX, roadY + 100 * perspective);
        ctx.stroke();
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
        // Change pattern occasionally
        if (z < this.nextPatternZ - 200) {
            this.currentPattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
            this.nextPatternZ = z - 50;
        }

        const segment = new RoadSegment(z, this.currentPattern);
        this.segments.push(segment);
    }

    update(speed) {
        // Update all segments
        this.segments.forEach(seg => seg.update(speed));

        // Remove off-screen segments
        this.segments = this.segments.filter(seg => !seg.isOffScreen());

        // Add new segments
        if (this.segments.length < CONFIG.ROAD.INITIAL_SEGMENTS) {
            const lastZ = Math.min(...this.segments.map(s => s.z));
            this.addSegment(lastZ - CONFIG.ROAD.SEGMENT_LENGTH);
        }
    }

    render(ctx, canvas) {
        // Sort by distance for proper rendering
        const sorted = [...this.segments].sort((a, b) => a.z - b.z);
        sorted.forEach(seg => seg.render(ctx, canvas));
    }

    setPattern(patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (pattern) {
            this.currentPattern = pattern;
        }
    }

    getAvailablePatterns() {
        return this.patterns;
    }

    reset() {
        this.initialize();
        this.nextPatternZ = 50;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RoadManager, RoadSegment, ROAD_PATTERNS };
}
