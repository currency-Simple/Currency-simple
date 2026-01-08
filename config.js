// إعدادات Supabase
const SUPABASE_URL = 'https://byxbwljcwevywrgjuvkn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5eGJ3bGpjd2V2eXdyZ2p1dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjY0MDAsImV4cCI6MjA1MjU0MjQwMH0.zWY6EAOczT_nhiscFxqHQA_hboO8gpf';

// إعدادات اللعبة
const GAME_CONFIG = {
  // عدد المحاولات المسموح بها لكل مرحلة
  MAX_ATTEMPTS: 3,
  
  // مدة العرض للتلميحات (بالثواني)
  HINT_DURATION: 5,
  
  // النقاط المكتسبة
  POINTS: {
    FIRST_TRY: 100,
    SECOND_TRY: 50,
    THIRD_TRY: 25,
    HINT_PENALTY: -10
  },
  
  // عدد النجوم بناءً على الأداء
  STARS: {
    THREE_STARS: 1,  // المحاولة الأولى
    TWO_STARS: 2,    // المحاولة الثانية
    ONE_STAR: 3      // المحاولة الثالثة
  },
  
  // مدة الأنيميشن (بالميلي ثانية)
  ANIMATION: {
    CARD_FLIP: 300,
    SUCCESS: 1000,
    FAIL: 500,
    DRAG: 200
  },
  
  // إعدادات الصوت
  SOUND: {
    ENABLED: true,
    VOLUME: 0.5
  },
  
  // عدد المراحل الكلي
  TOTAL_LEVELS: 50,
  
  // عدد المراحل المفتوحة في البداية
  INITIAL_UNLOCKED_LEVELS: 1
};

// روابط OAuth
const OAUTH_REDIRECT_URL = window.location.origin;

// مسارات الملفات
const PATHS = {
  DATA: './data/',
  ASSETS: './assets/',
  IMAGES: './assets/images/',
  ICONS: './assets/icons/',
  SOUNDS: './assets/sounds/'
};

// رسائل الخطأ
const ERROR_MESSAGES = {
  AUTH_FAILED: 'فشل تسجيل الدخول. حاول مرة أخرى.',
  NETWORK_ERROR: 'خطأ في الاتصال بالإنترنت.',
  DATA_LOAD_FAILED: 'فشل تحميل البيانات.',
  SAVE_FAILED: 'فشل حفظ التقدم.',
  INVALID_LEVEL: 'مستوى غير صالح.'
};

// رسائل النجاح
const SUCCESS_MESSAGES = {
  LEVEL_COMPLETE: 'أحسنت! أكملت المرحلة',
  ACHIEVEMENT_UNLOCKED: 'إنجاز جديد!',
  PROGRESS_SAVED: 'تم حفظ التقدم'
};

// أنواع الإنجازات
const ACHIEVEMENT_TYPES = {
  LEVELS_COMPLETED: 'levels_completed',
  PERFECT_SCORE: 'perfect_score',
  SPEED_RUN: 'speed_run',
  NO_HINTS: 'no_hints'
};

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    GAME_CONFIG,
    OAUTH_REDIRECT_URL,
    PATHS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ACHIEVEMENT_TYPES
  };
}
