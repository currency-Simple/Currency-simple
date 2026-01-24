// js/fonts.js - النسخة النهائية المبسطة
const ALL_FONTS = [
    { name: "Agu Display", family: "'Agu Display', display", demo: "عرض" },
    { name: "Alkalami", family: "'Alkalami', serif", demo: "خط عربي" },
    { name: "Amatic SC", family: "'Amatic SC', cursive", demo: "يدوي" },
    { name: "Anton", family: "'Anton', sans-serif", demo: "غامق" },
    { name: "Archivo Black", family: "'Archivo Black', sans-serif", demo: "ثقيل" },
    { name: "Archivo", family: "'Archivo', sans-serif", demo: "حديث" },
    { name: "Audiowide", family: "'Audiowide', sans-serif", demo: "تكنو" },
    { name: "Badeen Display", family: "'Badeen Display', display", demo: "بَدين" },
    { name: "Bangers", family: "'Bangers', system-ui", demo: "كوميكس" },
    { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", demo: "عنوان" },
    { name: "Bitcount Single", family: "'Bitcount Single', monospace", demo: "01010" },
    { name: "Buda", family: "'Buda', display", demo: "خفيف" },
    { name: "Cairo Play", family: "'Cairo Play', sans-serif", demo: "قاهرة" },
    { name: "Creepster", family: "'Creepster', system-ui", demo: "مرعب" },
    { name: "Dancing Script", family: "'Dancing Script', cursive", demo: "راقص" },
    { name: "Eater", family: "'Eater', system-ui", demo: "مُرعب" },
    { name: "Edu SA Hand", family: "'Edu SA Hand', cursive", demo: "يدوي" },
    { name: "Fjalla One", family: "'Fjalla One', sans-serif", demo: "قوي" },
    { name: "Fredericka the Great", family: "'Fredericka the Great', serif", demo: "عظيم" },
    { name: "Gravitas One", family: "'Gravitas One', serif", demo: "ثقيل" },
    { name: "Lalezar", family: "'Lalezar', system-ui", demo: "لاله‌زار" },
    { name: "Lobster Two", family: "'Lobster Two', serif", demo: "فاخر" },
    { name: "Macondo", family: "'Macondo', system-ui", demo: "ممتع" },
    { name: "Mada", family: "'Mada', sans-serif", demo: "مدى" },
    { name: "Momo Signature", family: "'Momo Signature', cursive", demo: "توقيع" },
    { name: "Monoton", family: "'Monoton', system-ui", demo: "خطوط" },
    { name: "Moo Lah Lah", family: "'Moo Lah Lah', system-ui", demo: "مرح" },
    { name: "Noto Nastaliq Urdu", family: "'Noto Nastaliq Urdu', serif", demo: "نستعلیق" },
    { name: "Noto Serif", family: "'Noto Serif', serif", demo: "كلاسيك" },
    { name: "Oswald", family: "'Oswald', sans-serif", demo: "أنيق" },
    { name: "Pacifico", family: "'Pacifico', cursive", demo: "شاطئ" },
    { name: "Playfair Display", family: "'Playfair Display', serif", demo: "راقي" },
    { name: "Playwrite GB J Guides", family: "'Playwrite GB J Guides', cursive", demo: "كتابة" },
    { name: "Reem Kufi", family: "'Reem Kufi', sans-serif", demo: "ريم كوفي" },
    { name: "Rock Salt", family: "'Rock Salt', cursive", demo: "روك" },
    { name: "Rubik Storm", family: "'Rubik Storm', system-ui", demo: "عاصفة" },
    { name: "Ruwudu", family: "'Ruwudu', serif", demo: "روودو" },
    { name: "Special Gothic Condensed One", family: "'Special Gothic Condensed One', sans-serif", demo: "رقيق" },
    { name: "Special Gothic Expanded One", family: "'Special Gothic Expanded One', sans-serif", demo: "واسع" },
    { name: "Zalando Sans Expanded", family: "'Zalando Sans Expanded', sans-serif", demo: "مُوسع" }
];

let currentFontFamily = ALL_FONTS[0].family;

function initializeFonts() {
    const fontGrid = document.getElementById('fontGrid');
    if (!fontGrid) {
        console.error('fontGrid element not found');
        return;
    }
    
    fontGrid.innerHTML = '';
    fontGrid.className = 'horizontal-controls';
    
    // تحميل الخط الافتراضي فوراً
    setTimeout(() => {
        if (window.fontLoader) {
            window.fontLoader.loadFont(ALL_FONTS[0].name);
            window.fontLoader.loadEssentialFonts(); // تحميل الخطوط الأساسية
        }
    }, 100);
    
    ALL_FONTS.forEach((font, index) => {
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        if (index === 0) fontItem.classList.add('selected');
        
        fontItem.onclick = async () => {
            if (window.fontLoader) {
                await window.fontLoader.loadFont(font.name);
            }
            selectFont(font.family, fontItem);
        };
        
        const fontSample = document.createElement('span');
        fontSample.textContent = font.demo;
        
        // تطبيق الخط عند التحميل
        if (window.fontLoader) {
            fontSample.style.fontFamily = window.fontLoader.getFontFamily(font.name);
        } else {
            fontSample.style.fontFamily = font.family;
        }
        
        fontItem.appendChild(fontSample);
        fontGrid.appendChild(fontItem);
    });
    
    console.log('✓ تم تهيئة', ALL_FONTS.length, 'خط');
}

function selectFont(fontFamily, fontElement) {
    currentFontFamily = fontFamily;
    
    document.querySelectorAll('.font-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    if (fontElement) {
        fontElement.classList.add('selected');
    }
    
    if (window.currentText && window.currentText.trim() !== '') {
        if (typeof renderFullCanvas === 'function') {
            renderFullCanvas();
        }
    }
    
    console.log('✓ تم اختيار الخط:', fontFamily);
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('⏳ جاري تحميل الخطوط...');
    setTimeout(initializeFonts, 500);
});

window.initializeFonts = initializeFonts;
window.selectFont = selectFont;
window.currentFontFamily = currentFontFamily;
window.ALL_FONTS = ALL_FONTS;
