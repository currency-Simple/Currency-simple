// ============================================
// GAME CONFIGURATION (UPDATED)
// ============================================

const CONFIG = {
    // Game Settings
    GAME: {
        BASE_SPEED: 1.0, // 400% زيادة من السرعة الأصلية (من 0.25 إلى 1.0)
        SPEED_INCREASE_INTERVAL: 15, // كل 15 مثلث
        SPEED_INCREASE_PERCENTAGE: 0.20, // زيادة 20% كل مرة
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
        PATTERN_DISTANCE: 40
    },

    // Road Patterns (طريق متعرج مثل لعبة Rush)
    ROAD_PATTERNS: [
        { type: 'straight', xDir: 0, yDir: 0, icon: '⤴️', duration: 3 },
        { type: 'up', xDir: 0, yDir: 0.3, icon: '⬆️', duration: 2 },
        { type: 'right', xDir: 0.3, yDir: 0, icon: '➡️', duration: 2 },
        { type: 'down', xDir: 0, yDir: -0.3, icon: '⬇️', duration: 2 },
        { type: 'left', xDir: -0.3, yDir: 0, icon: '⬅️', duration: 2 },
        { type: 'curve_right_up', xDir: 0.2, yDir: 0.2, icon: '↗️', duration: 2 },
        { type: 'curve_right_down', xDir: 0.2, yDir: -0.2, icon: '↘️', duration: 2 },
        { type: 'curve_left_up', xDir: -0.2, yDir: 0.2, icon: '↖️', duration: 2 },
        { type: 'curve_left_down', xDir: -0.2, yDir: -0.2, icon: '↙️', duration: 2 }
    ],

    // Obstacle Settings (مثلث كبير جداً)
    OBSTACLE: {
        BASE_SIZE: 4.0, // حجم كبير جداً
        HEIGHT: 5.0,
        SPAWN_INTERVAL: 70,
        MIN_SPAWN_INTERVAL: 50,
        COLORS: [
            0xffff00, // أصفر
            0xff6600, // برتقالي
            0xff0066, // وردي
            0x00ff66, // أخضر
            0x0066ff, // أزرق
            0x6600ff, // بنفسجي
            0xff00ff, // أرجواني
            0x00ffff, // سيان
            0xff3300, // أحمر
            0x33ff00, // أخضر فاتح
            0x0033ff, // أزرق غامق
            0xff0033  // أحمر وردي
        ]
    },

    // Ball Settings (كرة صغيرة ملتصقة بالأرض)
    BALL: {
        SIZE: 1.5, // تصغير 50% (من 3.0 إلى 1.5)
        LANE_CHANGE_SPEED: 0.3, // زيادة سرعة تحريك الكرة
        FIXED_HEIGHT: 0.75, // ملتصقة بالأرض (نصف الحجم)
        GRAVITY: 0
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
