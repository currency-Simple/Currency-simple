// ============================================
// GAME CONFIGURATION (OPTIMIZED)
// ============================================

const CONFIG = {
    // Game Settings
    GAME: {
        BASE_SPEED: 0.25,
        SPEED_INCREASE_INTERVAL: 15,
        SPEED_INCREASE_PERCENTAGE: 0.10,
        COIN_SPAWN_INTERVAL: 7,
        COIN_VALUE: 1,
        MAX_OBSTACLE_NUMBER: 1000,
        OBSTACLE_COLOR_CHANGE_INTERVAL: 9
    },

    // Camera Settings (محسّن)
    CAMERA: {
        FOV: 75,
        DISTANCE: 16,
        HEIGHT: 9,
        FOLLOW_SPEED: 0.15,
        LOOK_AHEAD: 10,
        HORIZONTAL_FOLLOW: 0.25
    },

    // Road Settings
    ROAD: {
        WIDTH: 12,
        SEGMENT_LENGTH: 5,
        TOTAL_LENGTH: 300,
        LANE_POSITIONS: [-3, 3],
        PATTERN_DISTANCE: 40
    },

    // Road Patterns
    ROAD_PATTERNS: [
        { type: 'straight', xDir: 0, yDir: 0, icon: '⤴️' },
        { type: 'up', xDir: 0, yDir: 0.5, icon: '⬆️' },
        { type: 'right', xDir: 0.5, yDir: 0, icon: '➡️' },
        { type: 'down', xDir: 0, yDir: -0.5, icon: '⬇️' },
        { type: 'left', xDir: -0.5, yDir: 0, icon: '⬅️' }
    ],

    // Obstacle Settings (مثلثات ثابتة)
    OBSTACLE: {
        BASE_SIZE: 2.5,
        HEIGHT: 4.0,
        SPAWN_INTERVAL: 70,
        MIN_SPAWN_INTERVAL: 50,
        FIXED_POSITION: true, // ثابتة في مكانها
        COLORS: [
            0xffff00, 0xff6600, 0xff0066, 0x00ff66,
            0x0066ff, 0x6600ff, 0xff00ff, 0x00ffff,
            0xff3300, 0x33ff00, 0x0033ff, 0xff0033
        ]
    },

    // Ball Settings (كرة أصغر قليلاً)
    BALL: {
        SIZE: 1.8, // أصغر من 3.0
        LANE_CHANGE_SPEED: 0.22,
        FIXED_HEIGHT: 1.8,
        GRAVITY: 0,
        STAY_IN_LANE: true // تبقى في المسار
    },

    // Coin Settings
    COIN: {
        SIZE: 0.5,
        HEIGHT: 2,
        GLOW_SIZE: 0.8
    },

    // Visual Effects (جودة عالية)
    EFFECTS: {
        PARTICLE_COUNT: 50,
        STAR_COUNT: 400,
        FOG_DENSITY: 0.012,
        ENABLE_BALL_GLOW: false,
        SHADOW_MAP_SIZE: 2048,
        ANTIALIASING: true,
        PIXEL_RATIO: 2
    },

    // Colors
    COLORS: {
        OBSTACLE: 0xffff00,
        COIN: 0xffd700,
        BACKGROUND: 0x0a0a0a,
        CENTER_LINE: 0xffffff
    },

    // Input
    INPUT: {
        SWIPE_THRESHOLD: 45
    },

    // Storage Keys
    STORAGE: {
        HIGH_SCORE: 'rushHighScore',
        GAME_DATA: 'rushGameData',
        STATS: 'rushStats'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}