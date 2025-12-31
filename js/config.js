// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
    // Game Settings
    GAME: {
        BASE_SPEED: 0.25,
        SPEED_INCREASE_INTERVAL: 15, // كل 15 مثلث
        SPEED_INCREASE_AMOUNT: 0.002, // 0.2% (0.002 = 0.2%)
        COIN_SPAWN_INTERVAL: 7, // نقطة كل 7 مثلثات
        COIN_VALUE: 1,
        MAX_OBSTACLE_NUMBER: 1000
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
        LANE_POSITIONS: [-4, 0, 4]
    },

    // Road Patterns (الأنماط المختلفة للطريق)
    ROAD_PATTERNS: [
        { type: 'up', yOffset: 3, length: 25, description: 'للأعلى' },
        { type: 'down', yOffset: -3, length: 25, description: 'للأسفل' },
        { type: 'left', xOffset: -4, length: 30, description: 'لليسار' },
        { type: 'right', xOffset: 4, length: 30, description: 'لليمين' },
        { type: 'straight', xOffset: 0, yOffset: 0, length: 35, description: 'مستقيم' }
    ],

    // Obstacle Settings
    OBSTACLE: {
        SIZE_RATIO: 1/3, // حجم المثلث بالنسبة لعرض الطريق
        SPAWN_INTERVAL: 70,
        MIN_SPAWN_INTERVAL: 50
    },

    // Ball Settings
    BALL: {
        SIZE_RATIO: 1/6, // حجم الكرة بالنسبة لعرض الطريق
        LANE_CHANGE_SPEED: 0.18
    },

    // Visual Effects
    EFFECTS: {
        PARTICLE_COUNT: 40,
        STAR_COUNT: 300,
        FOG_DENSITY: 0.013
    },

    // Colors
    COLORS: {
        OBSTACLE: 0xff3366,
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
