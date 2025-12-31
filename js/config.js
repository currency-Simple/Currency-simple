// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
    // Game Settings
    GAME: {
        BASE_SPEED: 0.25,
        SPEED_INCREASE_INTERVAL: 15, // كل 15 مثلث
        SPEED_INCREASE_PERCENTAGE: 0.10, // 10% زيادة
        COIN_SPAWN_INTERVAL: 7,
        COIN_VALUE: 1,
        MAX_OBSTACLE_NUMBER: 1000,
        OBSTACLE_COLOR_CHANGE_INTERVAL: 9
    },

    // Camera Settings
    CAMERA: {
        FOV: 75,
        DISTANCE: 14,
        HEIGHT: 7,
        FOLLOW_SPEED: 0.13,
        LOOK_AHEAD: 9
    },

    // Road Settings
    ROAD: {
        WIDTH: 12,
        SEGMENT_LENGTH: 5,
        TOTAL_LENGTH: 300,
        LANE_POSITIONS: [-3, 3], // يسار ويمين
        PATTERN_DISTANCE: 40 // 10 أمتار (40 وحدة) قبل تغيير الاتجاه
    },

    // Road Patterns (12 اتجاه)
    ROAD_PATTERNS: [
        { type: 'up', angle: 0, xDir: 0, yDir: 1, icon: '⬆️' },
        { type: 'up_right', angle: 45, xDir: 1, yDir: 1, icon: '↗️' },
        { type: 'right', angle: 90, xDir: 1, yDir: 0, icon: '➡️' },
        { type: 'down_right', angle: 135, xDir: 1, yDir: -1, icon: '↘️' },
        { type: 'down', angle: 180, xDir: 0, yDir: -1, icon: '⬇️' },
        { type: 'down_left', angle: 225, xDir: -1, yDir: -1, icon: '↙️' },
        { type: 'left', angle: 270, xDir: -1, yDir: 0, icon: '⬅️' },
        { type: 'up_left', angle: 315, xDir: -1, yDir: 1, icon: '↖️' },
        { type: 'straight', angle: 0, xDir: 0, yDir: 0, icon: '⤴️' }
    ],

    // Obstacle Settings
    OBSTACLE: {
        BASE_SIZE: 2.5, // حجم ثابت من حافة إلى نصف الطريق
        HEIGHT: 2.5,
        SPAWN_INTERVAL: 70,
        MIN_SPAWN_INTERVAL: 50,
        COLORS: [
            0xffff00, // أصفر
            0xff6600, // برتقالي
            0xff0066, // وردي
            0x00ff66, // أخضر نيون
            0x0066ff, // أزرق
            0x6600ff, // بنفسجي
            0xff00ff, // أرجواني
            0x00ffff, // سيان
            0xff3300, // أحمر برتقالي
            0x33ff00, // أخضر فاتح
            0x0033ff, // أزرق غامق
            0xff0033  // أحمر
        ]
    },

    // Ball Settings
    BALL: {
        SIZE: 1.2,
        LANE_CHANGE_SPEED: 0.2,
        FIXED_HEIGHT: 1.2
    },

    // Coin Settings
    COIN: {
        SIZE: 0.5,
        HEIGHT: 2,
        GLOW_SIZE: 0.8
    },

    // Visual Effects
    EFFECTS: {
        PARTICLE_COUNT: 40,
        STAR_COUNT: 300,
        FOG_DENSITY: 0.013,
        ENABLE_BALL_GLOW: false
    },

    // Colors
    COLORS: {
        OBSTACLE: 0xffff00,
        COIN: 0xffd700,
        BACKGROUND: 0x0a0a0a
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
