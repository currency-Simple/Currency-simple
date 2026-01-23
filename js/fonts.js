// ============================================
// نظام الخطوط لمحرر النصوص على الصور - النسخة المعدلة
// ============================================

// قائمة الخطوط (أنت تضيف الخطوط هنا بنفسك)
const FONTS_LIST = [
    // هنا ستضع الخطوط التي تريدها
    // مثال: { name: "اسم الخط", family: "'FontName', serif", demo: "عرض" }
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
    
    // إضافة الخطوط
    FONTS_LIST.forEach(font => {
        const option = document.createElement('option');
        option.value = font.family;
        option.textContent = `${font.name} - ${font.demo}`;
        option.style.fontFamily = font.family;
        fontSelect.appendChild(option);
    });
    
    // تعيين الخط الافتراضي
    if (FONTS_LIST.length > 0) {
        fontSelect.value = FONTS_LIST[0].family;
    }
    
    console.log(`✅ تم تحميل ${FONTS_LIST.length} خط بنجاح`);
}

// دالة لتحميل خط معين (تعمل من أول مرة)
function loadSpecificFont(fontFamily) {
    return new Promise((resolve) => {
        // تحقق إذا كان الخط محملاً بالفعل
        if (document.fonts.check(`12px ${fontFamily}`)) {
            resolve(true);
            return;
        }
        
        // تحميل الخط
        const fontFace = new FontFace(fontFamily, `url(https://fonts.googleapis.com/css2?family=${fontFamily})`);
        
        fontFace.load().then(() => {
            document.fonts.add(fontFace);
            resolve(true);
        }).catch(() => {
            // إذا فشل، حاول بطريقة أخرى
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/'/g, '')}&display=swap`;
            document.head.appendChild(link);
            
            setTimeout(() => resolve(true), 300);
        });
    });
}

// تحديث النص عند تغيير الخط
function updateFontSelection() {
    const fontSelect = document.getElementById('fontFamily');
    if (!fontSelect || !window.currentText) return;
    
    const selectedFont = fontSelect.value;
    
    // تحميل الخط أولاً
    loadSpecificFont(selectedFont).then(() => {
        // الآن قم بتحديث النص
        if (typeof updateTextOnCanvas === 'function') {
            updateTextOnCanvas();
        }
    });
}

// إعداد حدث تغيير الخط
function setupFontChangeListener() {
    const fontSelect = document.getElementById('fontFamily');
    if (fontSelect) {
        fontSelect.addEventListener('change', updateFontSelection);
    }
}

// جعل الدوال متاحة عالمياً
window.initializeFonts = initializeFonts;
window.loadSpecificFont = loadSpecificFont;
window.updateFontSelection = updateFontSelection;
window.setupFontChangeListener = setupFontChangeListener;

// تحميل الخطوط عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    // تهيئة القائمة
    initializeFonts();
    
    // إعداد المستمع
    setupFontChangeListener();
});
