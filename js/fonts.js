// js/fonts.js - المحدث
const ALL_FONTS = [
    { name: "Agu Display", family: "'Agu Display', display", demo: "نص تجريبي" },
    { name: "Oswald", family: "'Oswald', sans-serif", demo: "نص تجريبي" },
    { name: "Pacifico", family: "'Pacifico', cursive", demo: "نص تجريبي" },
    { name: "Reem Kufi", family: "'Reem Kufi', sans-serif", demo: "نص تجريبي" },
    { name: "Playfair Display", family: "'Playfair Display', serif", demo: "نص تجريبي" }
    // ... يمكنك إضافة باقي الخطوط هنا
];

let currentFontFamily = ALL_FONTS[0].family;

async function initializeFonts() {
    const fontGrid = document.getElementById('fontGrid');
    if (!fontGrid) {
        console.error('fontGrid element not found');
        return;
    }
    
    fontGrid.innerHTML = '';
    fontGrid.className = 'horizontal-controls';
    
    // تحميل الخط الافتراضي أولاً
    await window.fontLoader.loadFont(ALL_FONTS[0].name);
    
    ALL_FONTS.forEach((font, index) => {
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        if (index === 0) fontItem.classList.add('selected');
        
        fontItem.onclick = async () => {
            // تحميل الخط عند الاختيار (ديناميكي)
            await window.fontLoader.loadFont(font.name);
            selectFont(font.family, fontItem);
        };
        
        const fontSample = document.createElement('span');
        fontSample.style.fontFamily = window.fontLoader.getFontFamily(font.name);
        fontSample.textContent = font.demo;
        
        fontItem.appendChild(fontSample);
        fontGrid.appendChild(fontItem);
    });
    
    console.log('✓ تم تحميل', ALL_FONTS.length, 'خط');
}

async function selectFont(fontFamily, fontElement) {
    const fontName = ALL_FONTS.find(f => f.family === fontFamily)?.name;
    
    if (fontName) {
        // تأكد من تحميل الخط أولاً
        await window.fontLoader.loadFont(fontName);
    }
    
    currentFontFamily = fontFamily;
    
    // تحديث واجهة المستخدم
    document.querySelectorAll('.font-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    if (fontElement) {
        fontElement.classList.add('selected');
    }
    
    // تحديث النص على الكانفاس
    if (window.currentText && window.currentText.trim() !== '') {
        if (typeof renderFullCanvas === 'function') {
            renderFullCanvas();
        }
    }
    
    console.log('✓ تم اختيار الخط:', fontFamily);
}

// تحميل الخطوط عند بدء التطبيق
window.addEventListener('DOMContentLoaded', async () => {
    console.log('⏳ جاري تحميل الخطوط...');
    
    // تحميل محمل الخطوط أولاً
    if (typeof window.fontLoader === 'undefined') {
        // إذا لم يكن محمل الخطوط موجوداً، استخدم الخطوط النظامية
        console.warn('⚠️ محمل الخطوط غير موجود، استخدام الخطوط النظامية');
    }
    
    setTimeout(async () => {
        await initializeFonts();
        console.log('✓ تم تحميل جميع الخطوط');
    }, 300);
});

// تصدير الدوال والمتغيرات
window.initializeFonts = initializeFonts;
window.selectFont = selectFont;
window.currentFontFamily = currentFontFamily;
window.ALL_FONTS = ALL_FONTS;
