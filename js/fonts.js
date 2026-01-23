// ============================================
// نظام الخطوط لمحرر النصوص على الصور
// يحتوي على 40 خط من Google Fonts
// ============================================

// قائمة الخطوط العربية والإنجليزية من رابطك
const FONTS_LIST = [
    // خطوط عربية وأنيقة
    { name: "Amiri Arabic", family: "'Amiri', serif", demo: "السلام عليكم" },
    { name: "Noto Nastaliq Urdu", family: "'Noto Nastaliq Urdu', serif", demo: "مرحبا بك" },
    { name: "Reem Kufi", family: "'Reem Kufi', sans-serif", demo: "أهلاً وسهلاً" },
    { name: "Mada", family: "'Mada', sans-serif", demo: "شكراً جزيلاً" },
    { name: "Lalezar", family: "'Lalezar', cursive", demo: "صباح الخير" },
    { name: "Ruwudu", family: "'Ruwudu', serif", demo: "مساء النور" },
    { name: "Cairo Play", family: "'Cairo Play', sans-serif", demo: "تحية طيبة" },
    { name: "Badeen Display", family: "'Badeen Display', serif", demo: "الأمل" },
    
    // خطوط إنجليزية أنيقة
    { name: "Pacifico", family: "'Pacifico', cursive", demo: "Hello World" },
    { name: "Dancing Script", family: "'Dancing Script', cursive", demo: "Elegant Text" },
    { name: "Lobster Two", family: "'Lobster Two', cursive", demo: "Creative" },
    { name: "Playfair Display", family: "'Playfair Display', serif", demo: "Classic Style" },
    { name: "Playwrite GB J", family: "'Playwrite GB J', cursive", demo: "Handwritten" },
    { name: "Moo Lah Lah", family: "'Moo Lah Lah', cursive", demo: "Fun Font" },
    { name: "Rock Salt", family: "'Rock Salt', cursive", demo: "Signature" },
    { name: "Macondo", family: "'Macondo', cursive", demo: "Fantasy" },
    
    // خطوط عريضة وجريئة
    { name: "Anton", family: "'Anton', sans-serif", demo: "BOLD TEXT" },
    { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", demo: "IMPACT" },
    { name: "Oswald", family: "'Oswald', sans-serif", demo: "STRONG" },
    { name: "Archivo Black", family: "'Archivo Black', sans-serif", demo: "POWER" },
    { name: "Fjalla One", family: "'Fjalla One', sans-serif", demo: "HEADLINE" },
    { name: "Bangers", family: "'Bangers', cursive", demo: "COMIC" },
    { name: "Audiowide", family: "'Audiowide', cursive", demo: "TECH" },
    { name: "Monoton", family: "'Monoton', cursive", demo: "NEON" },
    { name: "Creepster", family: "'Creepster', cursive", demo: "HORROR" },
    { name: "Eater", family: "'Eater', cursive", demo: "SCARY" },
    { name: "Special Gothic", family: "'Special Gothic', sans-serif", demo: "GOTHIC" },
    
    // خطوط رقمية وتقنية
    { name: "Agu Display", family: "'Agu Display', serif", demo: "DISPLAY" },
    { name: "Rubik Storm", family: "'Rubik Storm', sans-serif", demo: "STORM" },
    { name: "Zalando Sans", family: "'Zalando Sans', sans-serif", demo: "MODERN" },
    { name: "Bitcount Single", family: "'Bitcount Single', monospace", demo: "CODE" },
    { name: "Fredericka Great", family: "'Fredericka the Great', serif", demo: "ROYAL" },
    
    // خطوط بسيطة وواضحة
    { name: "Archivo", family: "'Archivo', sans-serif", demo: "Clean Text" },
    { name: "Noto Serif", family: "'Noto Serif', serif", demo: "Readable" },
    { name: "Gravitas One", family: "'Gravitas One', serif", demo: "GRAND" },
    { name: "Alkalami", family: "'Alkalami', serif", demo: "Traditional" },
    { name: "Buda", family: "'Buda', serif", demo: "Light" },
    
    // خطوط فنية ومميزة
    { name: "Amatic SC", family: "'Amatic SC', cursive", demo: "Handwriting" },
    { name: "Edu SA Hand", family: "'Edu SA Hand', cursive", demo: "School" },
    { name: "Momo Signature", family: "'Momo Signature', cursive", demo: "Sign Here" }
];

// تهيئة قائمة الخطوط
function initializeFonts() {
    console.log('🎨 جاري تحميل الخطوط...');
    
    const fontSelect = document.getElementById('fontFamily');
    if (!fontSelect) {
        console.error('❌ عنصر fontFamily غير موجود');
        return;
    }
    
    // مسح المحتوى القديم
    fontSelect.innerHTML = '';
    
    // إضافة مجموعة الخطوط العربية
    const arabicGroup = document.createElement('optgroup');
    arabicGroup.label = 'الخطوط العربية والأردية';
    
    FONTS_LIST.filter(font => 
        font.name.includes("Arabic") || 
        font.name.includes("Urdu") || 
        font.name.includes("Reem") ||
        font.name.includes("Mada") ||
        font.name.includes("Lalezar") ||
        font.name.includes("Ruwudu") ||
        font.name.includes("Cairo") ||
        font.name.includes("Badeen") ||
        font.name.includes("Alkalami")
    ).forEach(font => {
        const option = document.createElement('option');
        option.value = font.family;
        option.textContent = `${font.name} - ${font.demo}`;
        option.style.fontFamily = font.family;
        arabicGroup.appendChild(option);
    });
    
    fontSelect.appendChild(arabicGroup);
    
    // إضافة مجموعة الخطوط الإنجليزية
    const englishGroup = document.createElement('optgroup');
    englishGroup.label = 'English Fonts';
    
    FONTS_LIST.filter(font => 
        !font.name.includes("Arabic") && 
        !font.name.includes("Urdu") && 
        !font.name.includes("Reem") &&
        !font.name.includes("Mada") &&
        !font.name.includes("Lalezar") &&
        !font.name.includes("Ruwudu") &&
        !font.name.includes("Cairo") &&
        !font.name.includes("Badeen") &&
        !font.name.includes("Alkalami")
    ).forEach(font => {
        const option = document.createElement('option');
        option.value = font.family;
        option.textContent = `${font.name} - ${font.demo}`;
        option.style.fontFamily = font.family;
        englishGroup.appendChild(option);
    });
    
    fontSelect.appendChild(englishGroup);
    
    // تعيين الخط الافتراضي (أول خط عربي)
    const defaultFont = FONTS_LIST.find(font => font.name.includes("Arabic")) || FONTS_LIST[0];
    fontSelect.value = defaultFont.family;
    
    console.log(`✅ تم تحميل ${FONTS_LIST.length} خط بنجاح`);
}

// تحميل الخطوط من Google Fonts
function loadGoogleFonts() {
    // الرابط موجود بالفعل في index.html
    console.log('🌐 الخطوط متصلة بـ Google Fonts');
    
    // تأكد من تحميل جميع الخطوط قبل الاستخدام
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            console.log('✅ جميع الخطوط جاهزة للاستخدام');
        });
    }
}

// دالة لفحص إذا كان الخط محملاً
function checkFontLoaded(fontFamily) {
    return document.fonts.check(`12px ${fontFamily}`);
}

// جعل الدوال متاحة عالمياً
window.initializeFonts = initializeFonts;
window.loadGoogleFonts = loadGoogleFonts;
window.checkFontLoaded = checkFontLoaded;

// تحميل الخطوط عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    loadGoogleFonts();
    
    // تأخير تهيئة الخطوط قليلاً للتأكد من تحميلها
    setTimeout(initializeFonts, 500);
});
