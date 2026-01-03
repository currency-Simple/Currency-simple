// ============================================
// SPEEDBALL 3D - CONFIGURATION FILE
// ============================================

const CONFIG = {
    // Game Settings
    GAME: {
        BASE_SPEED: 3,
        SPEED_MULTIPLIER: 3, // 300%
        SPEED_INCREMENT: 0.25, // 25% every 10 triangles
        SPEED_INCREMENT_INTERVAL: 10,
        CAMERA_Z: 10,
        CAMERA_FOV: 60
    },

    // Ball Settings
    BALL: {
        SIZE: 40,
        START_Y: -2,
        START_Z: 0,
        LANE_WIDTH: 2,
        MOVE_SPEED: 0.15,
        GLOW_INTENSITY: 2
    },

    // Road Settings
    ROAD: {
        WIDTH: 0.6,
        SEGMENT_LENGTH: 5,
        INITIAL_SEGMENTS: 30,
        LANES: 3,
        LANE_MARKER_OPACITY: 0.5
    },

    // Obstacle Settings
    OBSTACLES: {
        INITIAL_COUNT: 15,
        SPAWN_DISTANCE: 10,
        MIN_SIZE: 0.8,
        MAX_SIZE: 1.2,
        MIN_NUMBER: 1,
        MAX_NUMBER: 50,
        COLLISION_DISTANCE: 1.2,
        ROTATION_SPEED: 0.1
    },

    // Particle Settings
    PARTICLES: {
        COUNT_PER_HIT: 15,
        LIFE_DECAY: 0.02,
        VELOCITY_RANGE: 0.2,
        SIZE: 3
    },

    // Graphics Settings
    GRAPHICS: {
        QUALITY: 'medium', // low, medium, high, ultra
        PARTICLE_EFFECTS: true,
        GLOW_EFFECTS: true,
        SHADOWS: true,
        TRAIL_EFFECTS: true
    },

    // Audio Settings
    AUDIO: {
        MUSIC_VOLUME: 0.7,
        SFX_VOLUME: 0.8,
        ENABLED: true
    },

    // UI Settings
    UI: {
        SCORE_ANIMATION: true,
        SCREEN_SHAKE: true,
        COLOR_SHIFT: true
    }
};

// Color Schemes
const COLOR_SCHEMES = {
    neon: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        accent: '#00ff00',
        background: '#000000'
    },
    sunset: {
        primary: '#ff6b6b',
        secondary: '#ffd93d',
        accent: '#ff8c42',
        background: '#1a1a2e'
    },
    ocean: {
        primary: '#0077be',
        secondary: '#00d9ff',
        accent: '#00ffb3',
        background: '#001219'
    },
    forest: {
        primary: '#00ff00',
        secondary: '#7fff00',
        accent: '#00ff88',
        background: '#0a2f0a'
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, COLOR_SCHEMES };
}FOG_DENSITY: 0.013,
        ENABLE_BALL_GLOW: false
    },

    // Colors
    COLORS: {
        OBSTACLE: 0xffff00,
        COIN: 0xffd700,
        BACKGROUND: 0x0a0a0a,
        CENTER_LINE: 0xffffff // خط أبيض في الوسط
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