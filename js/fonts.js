// قائمة الخطوط العربية والإنجليزية
const ARABIC_FONTS = [
    {
        name: "Amiri",
        family: "'Amiri', serif",
        demo: "السلام"
    },
    {
        name: "Lateef",
        family: "'Lateef', serif",
        demo: "مرحبا"
    },
    {
        name: "Noto Kufi Arabic",
        family: "'Noto Kufi Arabic', sans-serif",
        demo: "شكرا"
    },
    {
        name: "Cairo",
        family: "'Cairo', sans-serif",
        demo: "أهلا"
    },
    {
        name: "Tajawal",
        family: "'Tajawal', sans-serif",
        demo: "صباح"
    }
];

const ENGLISH_FONTS = [
    {
        name: "Arial",
        family: "Arial, sans-serif",
        demo: "Hello"
    },
    {
        name: "Times New Roman",
        family: "'Times New Roman', serif",
        demo: "World"
    },
    {
        name: "Courier New",
        family: "'Courier New', monospace",
        demo: "Code"
    },
    {
        name: "Georgia",
        family: "Georgia, serif",
        demo: "Text"
    },
    {
        name: "Verdana",
        family: "Verdana, sans-serif",
        demo: "Test"
    }
];

// تهيئة قائمة الخطوط
function initializeFonts() {
    const fontSelect = document.getElementById('fontFamily');
    if (!fontSelect) {
        console.error('fontFamily element not found');
        return;
    }
    
    fontSelect.innerHTML = '';
    
    // إضافة الخطوط العربية
    const arabicGroup = document.createElement('optgroup');
    arabicGroup.label = 'الخطوط العربية';
    
    ARABIC_FONTS.forEach(font => {
        const option = document.createElement('option');
        option.value = font.family;
        option.textContent = `${font.name} - ${font.demo}`;
        option.style.fontFamily = font.family;
        arabicGroup.appendChild(option);
    });
    
    fontSelect.appendChild(arabicGroup);
    
    // إضافة الخطوط الإنجليزية
    const englishGroup = document.createElement('optgroup');
    englishGroup.label = 'English Fonts';
    
    ENGLISH_FONTS.forEach(font => {
        const option = document.createElement('option');
        option.value = font.family;
        option.textContent = `${font.name} - ${font.demo}`;
        option.style.fontFamily = font.family;
        englishGroup.appendChild(option);
    });
    
    fontSelect.appendChild(englishGroup);
    
    // تعيين الخط الافتراضي
    fontSelect.value = ARABIC_FONTS[0].family;
    console.log('Fonts loaded:', ARABIC_FONTS.length + ENGLISH_FONTS.length);
}

// إضافة روابط الخطوط إلى HTML
function loadFonts() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Amiri&family=Lateef&family=Noto+Kufi+Arabic:wght@400;700&family=Cairo:wght@400;700&family=Tajawal:wght@400;700&display=swap';
    document.head.appendChild(link);
}

// تحميل الخطوط عند بدء التطبيق
window.addEventListener('DOMContentLoaded', loadFonts);
