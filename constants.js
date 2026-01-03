// ==================== CONSTANTS.JS - الثوابت العامة ====================

// ==================== إعدادات Supabase ====================
const SUPABASE = {
    URL: 'https://byxbwljcwevywrgjuvkn.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5eGJ3bGpjd2V2eXdyZ2p1dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMTI4MDAsImV4cCI6MjA1MTU4ODgwMH0.zWY6EAOczT_nhiscFxqHQA_hboO8gpf',
    TABLES: {
        PLAYERS: 'players',
        SCORES: 'scores'
    }
};

// ==================== إعدادات اللعبة ====================
const GAME_CONFIG = {
    // السرعة والحركة
    INITIAL_SPEED: 1,
    MAX_SPEED: 5,
    SPEED_INCREMENT: 0.001,
    OBSTACLE_BASE_SPEED: 5,
    OBSTACLE_SPEED_MULTIPLIER: 3,
    
    // اللاعب
    INITIAL_LIVES: 3,
    MAX_LIVES: 5,
    
    // النتائج
    SCORE_PER_FRAME: 0.1,
    LEVEL_SCORE_THRESHOLD: 100,
    
    // معدل الإطارات
    FPS: 60,
    FRAME_TIME: 1000 / 60
};

// ==================== إعدادات الفيزياء ====================
const PHYSICS = {
    // الجاذبية
    GRAVITY: 0.8,
    JUMP_FORCE: -15,
    MAX_FALL_SPEED: 20,
    
    // الحدود
    GROUND_LEVEL: 85, // نسبة مئوية من الأعلى
    CEILING_LEVEL: 5,
    
    // الاصطدام
    COLLISION_RADIUS_OFFSET: -10,
    BALL_RADIUS: 25
};

// ==================== إعدادات العوائق ====================
const OBSTACLES = {
    TYPES: ['triangle', 'spike', 'square', 'circle'],
    
    // المسافات والتوقيت
    MIN_GAP: 150, // بكسل
    BASE_SPAWN_INTERVAL: 1500, // ميلي ثانية
    
    // الأحجام
    MIN_SIZE: 30,
    MAX_SIZE: 50,
    
    // المواقع العمودية
    MIN_Y_POSITION: 0.2, // نسبة مئوية
    MAX_Y_POSITION: 0.7,
    
    // الاحتمالات
    GROUND_OBSTACLE_CHANCE: 0.5,
    FLYING_OBSTACLE_CHANCE: 0.5
};

// ==================== ألوان اللعبة ====================
const COLORS = {
    // الخلفية
    BACKGROUND: {
        PRIMARY: '#0f172a',
        SECONDARY: '#1e293b',
        TERTIARY: '#334155'
    },
    
    // الكرة
    BALL: {
        PRIMARY: '#00ff88',
        SECONDARY: '#00cc6a',
        TERTIARY: '#008844',
        GLOW: 'rgba(0, 255, 136, 0.5)'
    },
    
    // العوائق
    OBSTACLES: {
        DANGER: '#ff4444',
        WARNING: '#ffaa00',
        GLOW: 'rgba(255, 68, 68, 0.5)'
    },
    
    // واجهة المستخدم
    UI: {
        PRIMARY: '#00ff88',
        SECONDARY: '#4488ff',
        WARNING: '#ffaa00',
        DANGER: '#ff4444',
        TEXT: '#ffffff',
        TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)'
    }
};

// ==================== النصوص والرسائل ====================
const MESSAGES = {
    // المصادقة
    AUTH: {
        SIGN_UP_SUCCESS: '✅ تم إنشاء الحساب بنجاح!',
        SIGN_IN_SUCCESS: '✅ مرحباً بك!',
        SIGN_OUT_SUCCESS: '✅ تم تسجيل الخروج بنجاح',
        EMAIL_ALREADY_EXISTS: '⚠️ البريد الإلكتروني مسجل بالفعل',
        INVALID_CREDENTIALS: '⚠️ البريد الإلكتروني أو كلمة المرور غير صحيحة',
        FILL_ALL_FIELDS: '⚠️ يرجى ملء جميع الحقول',
        PASSWORD_TOO_SHORT: '⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    },
    
    // اللعبة
    GAME: {
        GAME_OVER: 'انتهت اللعبة!',
        NEW_HIGH_SCORE: '🎉 رقم قياسي جديد!',
        PAUSED: 'موقف مؤقتاً',
        READY: 'استعد...',
        GO: 'ابدأ!',
        COLLISION: '💥 اصطدام!'
    },
    
    // الأخطاء
    ERRORS: {
        CONNECTION_ERROR: '❌ خطأ في الاتصال بالخادم',
        SAVE_ERROR: '❌ خطأ في حفظ البيانات',
        LOAD_ERROR: '❌ خطأ في تحميل البيانات',
        UNKNOWN_ERROR: '❌ حدث خطأ غير متوقع'
    }
};

// ==================== مفاتيح التحكم ====================
const CONTROLS = {
    JUMP: ['Space', 'ArrowUp', 'KeyW'],
    PAUSE: ['KeyP', 'Escape'],
    RESTART: ['KeyR']
};

// ==================== الإنجازات ====================
const ACHIEVEMENTS = {
    FIRST_GAME: {
        id: 'first_game',
        name: 'اللعبة الأولى',
        description: 'أكمل لعبتك الأولى',
        icon: '🎮',
        condition: (stats) => stats.gamesPlayed >= 1
    },
    SCORE_100: {
        id: 'score_100',
        name: 'البداية',
        description: 'احصل على 100 نقطة',
        icon: '⭐',
        condition: (stats) => stats.highScore >= 100
    },
    SCORE_500: {
        id: 'score_500',
        name: 'محترف',
        description: 'احصل على 500 نقطة',
        icon: '🌟',
        condition: (stats) => stats.highScore >= 500
    },
    SCORE_1000: {
        id: 'score_1000',
        name: 'أسطورة',
        description: 'احصل على 1000 نقطة',
        icon: '💫',
        condition: (stats) => stats.highScore >= 1000
    },
    NO_COLLISION_100: {
        id: 'no_collision_100',
        name: 'مراوغ ماهر',
        description: 'احصل على 100 نقطة دون اصطدام',
        icon: '🎯',
        condition: (stats) => stats.bestStreak >= 100
    }
};

// ==================== إعدادات الصوت ====================
const AUDIO = {
    ENABLED: true,
    VOLUMES: {
        MASTER: 0.5,
        MUSIC: 0.3,
        SFX: 0.7
    },
    FREQUENCIES: {
        JUMP: 400,
        COLLISION: 200,
        SCORE_MILESTONE: 800,
        GAME_OVER: 150
    }
};

// ==================== إعدادات الرسوم المتحركة ====================
const ANIMATIONS = {
    DURATION: {
        SHORT: 200,
        MEDIUM: 300,
        LONG: 500
    },
    EASING: {
        LINEAR: 'linear',
        EASE_IN: 'ease-in',
        EASE_OUT: 'ease-out',
        EASE_IN_OUT: 'ease-in-out',
        BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
};

// ==================== إعدادات المتصدرين ====================
const LEADERBOARD = {
    MAX_ENTRIES: 10,
    REFRESH_INTERVAL: 30000, // 30 ثانية
    HIGHLIGHT_DURATION: 2000,
    MEDALS: ['🥇', '🥈', '🥉']
};

// ==================== إعدادات التخزين المحلي ====================
const STORAGE_KEYS = {
    SETTINGS: 'speedball_settings',
    STATS: 'speedball_stats',
    ACHIEVEMENTS: 'speedball_achievements',
    SOUND_ENABLED: 'speedball_sound',
    HIGH_SCORE: 'speedball_high_score'
};

// ==================== حالات اللعبة ====================
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover',
    LOADING: 'loading'
};

// ==================== نقاط التحقق ====================
const MILESTONES = [
    { score: 100, message: '💯 رائع! 100 نقطة!' },
    { score: 250, message: '🔥 مذهل! 250 نقطة!' },
    { score: 500, message: '⚡ أسطوري! 500 نقطة!' },
    { score: 750, message: '🌟 خارق! 750 نقطة!' },
    { score: 1000, message: '👑 ملك اللعبة! 1000 نقطة!' }
];

// ==================== OAuth Providers ====================
const OAUTH_PROVIDERS = {
    GITHUB: {
        name: 'GitHub',
        icon: 'fab fa-github',
        color: '#333333'
    },
    GOOGLE: {
        name: 'Google',
        icon: 'fab fa-google',
        color: '#db4437'
    },
    DISCORD: {
        name: 'Discord',
        icon: 'fab fa-discord',
        color: '#5865f2'
    }
};

// ==================== إعدادات الأداء ====================
const PERFORMANCE = {
    MAX_OBSTACLES_ON_SCREEN: 5,
    GARBAGE_COLLECTION_THRESHOLD: 10,
    ENABLE_PARTICLES: true,
    ENABLE_SHADOWS: true,
    ENABLE_GLOW: true
};

// ==================== روابط مفيدة ====================
const LINKS = {
    GITHUB: 'https://github.com/yourusername/speedball-3d',
    SUPPORT: 'mailto:support@speedball3d.com',
    PRIVACY: '/privacy-policy.html',
    TERMS: '/terms-of-service.html'
};

// ==================== تصدير الثوابت ====================
window.SUPABASE = SUPABASE;
window.GAME_CONFIG = GAME_CONFIG;
window.PHYSICS = PHYSICS;
window.OBSTACLES = OBSTACLES;
window.COLORS = COLORS;
window.MESSAGES = MESSAGES;
window.CONTROLS = CONTROLS;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.AUDIO = AUDIO;
window.ANIMATIONS = ANIMATIONS;
window.LEADERBOARD = LEADERBOARD;
window.STORAGE_KEYS = STORAGE_KEYS;
window.GAME_STATES = GAME_STATES;
window.MILESTONES = MILESTONES;
window.OAUTH_PROVIDERS = OAUTH_PROVIDERS;
window.PERFORMANCE = PERFORMANCE;
window.LINKS = LINKS;

console.log('✅ Constants.js loaded successfully');
