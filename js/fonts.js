// قائمة الخطوط العربية والإنجليزية
const ARABIC_FONTS = [
    {
        name: "محمد",
        family: "'Amiri', serif",
        demo: "جمال",
        preload: true
    },
    {
        name: "Lateef",
        family: "'Lateef', serif",
        demo: "مرحبا",
        preload: true
    },
    {
        name: "Noto Kufi Arabic",
        family: "'Noto Kufi Arabic', sans-serif",
        demo: "شكرا",
        preload: true
    },
    {
        name: "Cairo",
        family: "'Cairo', sans-serif",
        demo: "أهلا",
        preload: true
    },
    {
        name: "Tajawal",
        family: "'Tajawal', sans-serif",
        demo: "صباح",
        preload: true
    }
];

const ENGLISH_FONTS = [
    {
        name: "Arial",
        family: "Arial, sans-serif",
        demo: "Hello",
        preload: false
    },
    {
        name: "Times New Roman",
        family: "'Times New Roman', serif",
        demo: "World",
        preload: false
    },
    {
        name: "Courier New",
        family: "'Courier New', monospace",
        demo: "Code",
        preload: false
    },
    {
        name: "Georgia",
        family: "Georgia, serif",
        demo: "Text",
        preload: false
    },
    {
        name: "Verdana",
        family: "Verdana, sans-serif",
        demo: "Test",
        preload: false
    }
];

// ذاكرة مؤقتة للخطوط المحملة
const loadedFonts = new Set();

// تهيئة قائمة الخطوط
function initializeFonts() {
    console.log('Fonts system initialized');
    // الخطوط يتم اختيارها الآن من اللوحة الأفقية
    preloadFonts();
}

// تحميل الخطوط مسبقاً
function preloadFonts() {
    console.log('Preloading fonts...');
    
    // إنشاء عناصر نص مخفية لتحميل الخطوط
    const fontLoader = document.createElement('div');
    fontLoader.style.position = 'absolute';
    fontLoader.style.left = '-9999px';
    fontLoader.style.top = '-9999px';
    fontLoader.style.opacity = '0';
    
    // إضافة عينات من كل خط عربي
    ARABIC_FONTS.forEach(font => {
        if (font.preload) {
            const sample = document.createElement('div');
            sample.style.fontFamily = font.family;
            sample.style.fontSize = '1px';
            sample.textContent = font.demo;
            fontLoader.appendChild(sample);
        }
    });
    
    document.body.appendChild(fontLoader);
    
    // إزالة المحمل بعد وقت قصير
    setTimeout(() => {
        if (fontLoader.parentNode) {
            document.body.removeChild(fontLoader);
        }
    }, 1000);
    
    console.log('Fonts preloaded');
}

// إضافة روابط الخطوط إلى HTML
function loadFonts() {
    console.log('Loading fonts dynamically...');
    
    // فقط أضف روابط الخطوط إذا لم تكن محملة مسبقاً
    const existingLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    if (existingLinks.length === 0) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Amiri&family=Lateef&family=Noto+Kufi+Arabic:wght@400;700&family=Cairo:wght@400;700&family=Tajawal:wght@400;700&display=swap';
        link.onload = () => {
            console.log('Google Fonts loaded');
            // إعادة تحميل الخطوط في المحرر بعد تحميل الخطوط
            if (typeof updateTextOnCanvas === 'function') {
                setTimeout(() => updateTextOnCanvas(), 100);
            }
        };
        document.head.appendChild(link);
    } else {
        console.log('Fonts already loaded');
    }
}

// تحميل الخطوط عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    // تحميل الخطوط مع تأخير بسيط لضمان تحميل الصفحة أولاً
    setTimeout(() => {
        loadFonts();
        initializeFonts();
    }, 500);
});

// تصدير الدوال للاستخدام في ملفات أخرى
window.loadFonts = loadFonts;
window.initializeFonts = initializeFonts;
