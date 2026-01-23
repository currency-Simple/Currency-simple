// ============================================
// نظام الخطوط - يعمل من أول ضغطة
// ============================================

// متغير لتخزين الخط الحالي
let currentFont = null;

// تهيئة قائمة الخطوط
function initializeFonts() {
    console.log('🎨 جاري تحميل قائمة الخطوط...');
    
    const fontGrid = document.getElementById('fontGrid');
    if (!fontGrid) {
        console.error('❌ شبكة الخطوط غير موجودة');
        return;
    }
    
    // مسح المحتوى القديم
    fontGrid.innerHTML = '';
    
    // التحقق من وجود قائمة الخطوط
    if (!window.FONTS_LIST || window.FONTS_LIST.length === 0) {
        console.warn('⚠️ قائمة الخطوط فارغة، جاري تحميل خطوط افتراضية...');
        loadDefaultFonts();
    }
    
    // إضافة الخطوط إلى الشبكة
    window.FONTS_LIST.forEach((font, index) => {
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        if (index === 0) {
            fontItem.classList.add('active');
            currentFont = font.family;
        }
        
        fontItem.innerHTML = `
            <div class="font-name">${font.name}</div>
            <div class="font-demo" style="font-family: ${font.family}">${font.demo}</div>
        `;
        
        fontItem.onclick = () => {
            // إزالة النشط من جميع العناصر
            document.querySelectorAll('.font-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // إضافة النشط للعنصر المحدد
            fontItem.classList.add('active');
            
            // تغيير الخط
            changeFont(font.family);
        };
        
        fontGrid.appendChild(fontItem);
    });
    
    console.log(`✅ تم تحميل ${window.FONTS_LIST.length} خط في الشبكة`);
}

// تحميل خطوط افتراضية
function loadDefaultFonts() {
    window.FONTS_LIST = [
        {
            name: "Amiri Arabic",
            family: "'Amiri', serif",
            demo: "السلام عليكم",
            category: "arabic"
        },
        {
            name: "Noto Nastaliq Urdu",
            family: "'Noto Nastaliq Urdu', serif",
            demo: "مرحبا بك",
            category: "arabic"
        },
        {
            name: "Reem Kufi",
            family: "'Reem Kufi', sans-serif",
            demo: "أهلاً وسهلاً",
            category: "arabic"
        },
        {
            name: "Pacifico",
            family: "'Pacifico', cursive",
            demo: "Hello World",
            category: "english"
        },
        {
            name: "Dancing Script",
            family: "'Dancing Script', cursive",
            demo: "Elegant Text",
            category: "english"
        }
    ];
}

// تغيير الخط (يعمل من أول مرة)
function changeFont(fontFamily) {
    console.log(`🔄 تغيير الخط إلى: ${fontFamily}`);
    
    // تحديث الخط الحالي
    currentFont = fontFamily;
    
    // تحديث النص على Canvas مباشرة
    if (window.currentText && typeof updateTextOnCanvas === 'function') {
        updateTextOnCanvas();
    }
    
    // إشعار بنجاح التغيير
    showFontChangeNotification(fontFamily);
}

// إشعار تغيير الخط
function showFontChangeNotification(fontFamily) {
    // يمكنك إضافة إشعار هنا إذا أردت
    // showAlert(`تم تغيير الخط`, 'success');
}

// دالة لضمان تحميل الخط قبل الاستخدام
async function ensureFontLoaded(fontFamily) {
    return new Promise((resolve) => {
        // الخطوط من Google Fonts تكون محملة مسبقاً
        // هذه الدالة للتأكد فقط
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                resolve(true);
            });
        } else {
            resolve(true);
        }
    });
}

// جعل الدوال متاحة عالمياً
window.initializeFonts = initializeFonts;
window.changeFont = changeFont;
window.ensureFontLoaded = ensureFontLoaded;
window.currentFont = () => currentFont;

// تحميل الخطوط عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    // تأخير قليلاً للتأكد من تحميل الصفحة
    setTimeout(initializeFonts, 500);
});
