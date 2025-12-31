// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
    // Game Settings
    GAME: {
        BASE_SPEED: 0.25,
        SPEED_INCREASE_INTERVAL: 15,
        SPEED_INCREASE_AMOUNT: 0.002,
        COIN_SPAWN_INTERVAL: 7,
        COIN_VALUE: 1,
        MAX_OBSTACLE_NUMBER: 1000,
        OBSTACLE_COLOR_CHANGE_INTERVAL: 9 // تغيير اللون كل 9 مثلثات
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
        LANE_POSITIONS: [-4, 4] // فقط يسار ويمين (بدون وسط)
    },

    // Road Patterns (أنماط دائرية متقدمة)
    ROAD_PATTERNS: [
        { 
            type: 'up_curve', 
            curve: 'up', 
            intensity: 4, 
            length: 30, 
            description: 'منحنى للأعلى' 
        },
        { 
            type: 'right_curve', 
            curve: 'right', 
            intensity: 5, 
            length: 25, 
            description: 'منحنى لليمين' 
        },
        { 
            type: 'left_curve', 
            curve: 'left', 
            intensity: 5, 
            length: 25, 
            description: 'منحنى لليسار' 
        },
        { 
            type: 'down_curve', 
            curve: 'down', 
            intensity: 4, 
            length: 30, 
            description: 'منحنى للأسفل' 
        },
        { 
            type: 'straight', 
            curve: 'none', 
            intensity: 0, 
            length: 35, 
            description: 'مستقيم' 
        }
    ],

    // Obstacle Settings
    OBSTACLE: {
        SIZE_RATIO: 0.4, // نصف الطريق تقريباً
        SPAWN_INTERVAL: 70,
        MIN_SPAWN_INTERVAL: 50,
        COLORS: [ // ألوان متعددة للمثلثات
            0xff3366, // أحمر وردي
            0xff6633, // برتقالي
            0xffaa00, // برتقالي ذهبي
            0xffff00, // أصفر
            0x66ff33, // أخضر فاتح
            0x33ff66, // أخضر نيون
            0x00ffcc, // سيان
            0x00ccff, // أزرق فاتح
            0x3366ff, // أزرق
            0x6633ff, // بنفسجي
            0xcc00ff, // أرجواني
            0xff00cc  // وردي غامق
        ]
    },

    // Ball Settings
    BALL: {
        SIZE_RATIO: 1/6,
        LANE_CHANGE_SPEED: 0.18,
        FIXED_HEIGHT: 2 // ارتفاع ثابت للكرة
    },

    // Visual Effects
    EFFECTS: {
        PARTICLE_COUNT: 40,
        STAR_COUNT: 300,
        FOG_DENSITY: 0.013,
        ENABLE_BALL_GLOW: false // تعطيل توهج الكرة
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
