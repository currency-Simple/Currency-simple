// قائمة الخطوط الـ 40 من Google Fonts
const ALL_FONTS = [
    { name: "Agu Display", family: "'Agu Display', display", demo: "نص تجريبي" },
    { name: "Alkalami", family: "'Alkalami', serif", demo: "خط عربي" },
    { name: "Amatic SC", family: "'Amatic SC', cursive", demo: "Creative" },
    { name: "Anton", family: "'Anton', sans-serif", demo: "BOLD" },
    { name: "Archivo Black", family: "'Archivo Black', sans-serif", demo: "Heavy" },
    { name: "Archivo", family: "'Archivo', sans-serif", demo: "Modern" },
    { name: "Audiowide", family: "'Audiowide', sans-serif", demo: "Tech" },
    { name: "Badeen Display", family: "'Badeen Display', display", demo: "عرض" },
    { name: "Bangers", family: "'Bangers', system-ui", demo: "POP!" },
    { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", demo: "TITLE" },
    { name: "Bitcount", family: "'Bitcount Single', monospace", demo: "01010" },
    { name: "Buda", family: "'Buda', display", demo: "Unique" },
    { name: "Cairo Play", family: "'Cairo Play', sans-serif", demo: "قاهرة" },
    { name: "Creepster", family: "'Creepster', system-ui", demo: "Scary" },
    { name: "Dancing Script", family: "'Dancing Script', cursive", demo: "Dance" },
    { name: "Eater", family: "'Eater', system-ui", demo: "Horror" },
    { name: "Edu Hand", family: "'Edu SA Hand', cursive", demo: "Hand" },
    { name: "Fjalla One", family: "'Fjalla One', sans-serif", demo: "Strong" },
    { name: "Fredericka", family: "'Fredericka the Great', serif", demo: "Great" },
    { name: "Gravitas One", family: "'Gravitas One', serif", demo: "Heavy" },
    { name: "Lalezar", family: "'Lalezar', system-ui", demo: "لاله زار" },
    { name: "Lobster Two", family: "'Lobster Two', serif", demo: "Fancy" },
    { name: "Macondo", family: "'Macondo', system-ui", demo: "Fun" },
    { name: "Mada", family: "'Mada', sans-serif", demo: "مدى" },
    { name: "Momo Signature", family: "'Momo Signature', cursive", demo: "Sign" },
    { name: "Monoton", family: "'Monoton', system-ui", demo: "LINE" },
    { name: "Moo Lah Lah", family: "'Moo Lah Lah', system-ui", demo: "Moo" },
    { name: "Noto Nastaliq", family: "'Noto Nastaliq Urdu', serif", demo: "نستعلیق" },
    { name: "Noto Serif", family: "'Noto Serif', serif", demo: "Classic" },
    { name: "Oswald", family: "'Oswald', sans-serif", demo: "Clean" },
    { name: "Pacifico", family: "'Pacifico', cursive", demo: "Beach" },
    { name: "Playfair", family: "'Playfair Display', serif", demo: "Elegant" },
    { name: "Playwrite GB", family: "'Playwrite GB J Guides', cursive", demo: "Write" },
    { name: "Reem Kufi", family: "'Reem Kufi', sans-serif", demo: "ريم كوفي" },
    { name: "Rock Salt", family: "'Rock Salt', cursive", demo: "Rock" },
    { name: "Rubik Storm", family: "'Rubik Storm', system-ui", demo: "Storm" },
    { name: "Ruwudu", family: "'Ruwudu', serif", demo: "روودو" },
    { name: "Gothic Condensed", family: "'Special Gothic Condensed One', sans-serif", demo: "Thin" },
    { name: "Gothic Expanded", family: "'Special Gothic Expanded One', sans-serif", demo: "Wide" },
    { name: "Zalando Sans", family: "'Zalando Sans Expanded', sans-serif", demo: "Expand" }
];

let currentFontFamily = ALL_FONTS[0].family;

// تهيئة قائمة الخطوط
function initializeFonts() {
    const fontGrid = document.getElementById('fontGrid');
    if (!fontGrid) {
        console.error('fontGrid element not found');
        return;
    }
    
    fontGrid.innerHTML = '';
    fontGrid.className = 'horizontal-controls';
    
    ALL_FONTS.forEach((font, index) => {
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        if (index === 0) fontItem.classList.add('selected');
        
        fontItem.onclick = () => selectFont(font.family, fontItem);
        
        const fontSample = document.createElement('span');
        fontSample.style.fontFamily = font.family;
        fontSample.textContent = font.demo;
        
        fontItem.appendChild(fontSample);
        fontGrid.appendChild(fontItem);
    });
    
    console.log('✓ تم تحميل', ALL_FONTS.length, 'خط');
}

// اختيار خط
function selectFont(fontFamily, fontElement) {
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
window.addEventListener('DOMContentLoaded', () => {
    console.log('⏳ جاري تحميل الخطوط...');
    
    // التأكد من تحميل الخطوط
    if (document.fonts) {
        document.fonts.ready.then(() => {
            console.log('✓ تم تحميل جميع الخطوط');
            setTimeout(() => {
                initializeFonts();
            }, 300);
        });
    } else {
        // متصفح قديم - تحميل مباشر
        setTimeout(() => {
            initializeFonts();
        }, 1000);
    }
});

// تصدير الدوال والمتغيرات
window.initializeFonts = initializeFonts;
window.selectFont = selectFont;
window.currentFontFamily = currentFontFamily;
window.ALL_FONTS = ALL_FONTS;
