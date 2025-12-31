const CONFIG = {
    // Game Settings
    GAME: {
        BASE_SPEED: 0.5, // 200% من الأصل (0.25 × 2 = 0.5)
        SPEED_INCREASE_INTERVAL: 15,
        SPEED_INCREASE_PERCENTAGE: 0.20,
        COIN_SPAWN_INTERVAL: 7,
        COIN_VALUE: 1,
        MAX_OBSTACLE_NUMBER: 1000,
        OBSTACLE_COLOR_CHANGE_INTERVAL: 9
    },

    // Camera Settings
    CAMERA: {
        FOV: 75,
        DISTANCE: 16,
        HEIGHT: 8,
        FOLLOW_SPEED: 0.15,
        LOOK_AHEAD: 10,
        HORIZONTAL_FOLLOW: 0.3
    },

    // Road Settings
    ROAD: {
        WIDTH: 12,
        SEGMENT_LENGTH: 5,
        TOTAL_LENGTH: 300,
        LANE_POSITIONS: [-3, 3],
        PATTERN_DISTANCE: 40,
        CURVE_INTENSITY: 0.25 // شدة الانحناء
    },

    // Road Patterns (متعرجة مثل لعبة Rush)
    ROAD_PATTERNS: [
        { type: 'straight', xDir: 0, yDir: 0, duration: 2 },
        { type: 'right', xDir: 0.25, yDir: 0, duration: 3 },
        { type: 'left', xDir: -0.25, yDir: 0, duration: 3 },
        { type: 'up', xDir: 0, yDir: 0.15, duration: 2 },
        { type: 'down', xDir: 0, yDir: -0.15, duration: 2 },
        { type: 'curve_right_up', xDir: 0.15, yDir: 0.15, duration: 2 },
        { type: 'curve_right_down', xDir: 0.15, yDir: -0.15, duration: 2 },
        { type: 'curve_left_up', xDir: -0.15, yDir: 0.15, duration: 2 },
        { type: 'curve_left_down', xDir: -0.15, yDir: -0.15, duration: 2 }
    ],

    // Obstacle Settings
    OBSTACLE: {
        BASE_SIZE: 2.5,
        HEIGHT: 4.0,
        SPAWN_INTERVAL: 70,
        MIN_SPAWN_INTERVAL: 50,
        COLORS: [
            0xffff00, 0xff6600, 0xff0066, 0x00ff66,
            0x0066ff, 0x6600ff, 0xff00ff, 0x00ffff,
            0xff3300, 0x33ff00, 0x0033ff, 0xff0033
        ]
    },

    // Ball Settings (كرة متوسطة الحجم مرتفعة عن الأرض)
    BALL: {
        SIZE: 2.5, // حجم متوسط مثل الصورة
        LANE_CHANGE_SPEED: 0.2,
        FIXED_HEIGHT: 2.0, // مرتفعة عن الأرض
        GRAVITY: 0
    },

    // Coin Settings
    COIN: {
        SIZE: 0.5,
        HEIGHT: 2.5,
        GLOW_SIZE: 0.8
    },

    // Visual Effects
    EFFECTS: {
        PARTICLE_COUNT: 40,
        STAR_COUNT: 300,
        FOG_DENSITY: 0.013,
        ENABLE_BALL_GLOW: true
    },

    // Colors
    COLORS: {
        OBSTACLE: 0xffff00,
        COIN: 0xffd700,
        BACKGROUND: 0x0a0a0a,
        CENTER_LINE: 0xffffff,
        ROAD_PREVIEW: 0x00ff88 // لون مسار الطريق المستقبلي
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
