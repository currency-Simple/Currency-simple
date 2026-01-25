// قائمة الخطوط مع خطوط افتراضية مضمونة
const ALL_FONTS = [
    { name: "Arial Arabic", family: "Arial, sans-serif", demo: "نص تجريبي", weight: "bold" },
    { name: "Tahoma Arabic", family: "Tahoma, Geneva, sans-serif", demo: "خط عربي", weight: "bold" },
    { name: "Amatic SC", family: "'Amatic SC', cursive", demo: "Creative", weight: "700" },
    { name: "Anton", family: "'Anton', sans-serif", demo: "BOLD", weight: "400" },
    { name: "Archivo Black", family: "'Archivo Black', sans-serif", demo: "Heavy", weight: "400" },
    { name: "Archivo", family: "'Archivo', sans-serif", demo: "Modern", weight: "600" },
    { name: "Audiowide", family: "'Audiowide', sans-serif", demo: "Tech", weight: "400" },
    { name: "Badeen Display", family: "'Badeen Display', display", demo: "عرض", weight: "400" },
    { name: "Bangers", family: "'Bangers', system-ui", demo: "POP!", weight: "400" },
    { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", demo: "TITLE", weight: "400" },
    { name: "Bitcount", family: "'Bitcount Single', monospace", demo: "01010", weight: "400" },
    { name: "Buda", family: "'Buda', display", demo: "Unique", weight: "300" },
    { name: "Cairo Play", family: "'Cairo Play', sans-serif", demo: "قاهرة", weight: "600" },
    { name: "Creepster", family: "'Creepster', system-ui", demo: "Scary", weight: "400" },
    { name: "Dancing Script", family: "'Dancing Script', cursive", demo: "Dance", weight: "700" },
    { name: "Eater", family: "'Eater', system-ui", demo: "Horror", weight: "400" },
    { name: "Edu Hand", family: "'Edu SA Hand', cursive", demo: "Hand", weight: "700" },
    { name: "Fjalla One", family: "'Fjalla One', sans-serif", demo: "Strong", weight: "400" },
    { name: "Fredericka", family: "'Fredericka the Great', serif", demo: "Great", weight: "400" },
    { name: "Gravitas One", family: "'Gravitas One', serif", demo: "Heavy", weight: "400" },
    { name: "Lalezar", family: "'Lalezar', system-ui", demo: "لاله زار", weight: "400" },
    { name: "Lobster Two", family: "'Lobster Two', serif", demo: "Fancy", weight: "700" },
    { name: "Macondo", family: "'Macondo', system-ui", demo: "Fun", weight: "400" },
    { name: "Mada", family: "'Mada', sans-serif", demo: "مدى", weight: "700" },
    { name: "Momo Signature", family: "'Momo Signature', cursive", demo: "Sign", weight: "400" },
    { name: "Monoton", family: "'Monoton', system-ui", demo: "LINE", weight: "400" },
    { name: "Moo Lah Lah", family: "'Moo Lah Lah', system-ui", demo: "Moo", weight: "400" },
    { name: "Noto Nastaliq", family: "'Noto Nastaliq Urdu', serif", demo: "نستعلیق", weight: "700" },
    { name: "Noto Serif", family: "'Noto Serif', serif", demo: "Classic", weight: "700" },
    { name: "Oswald", family: "'Oswald', sans-serif", demo: "Clean", weight: "700" },
    { name: "Pacifico", family: "'Pacifico', cursive", demo: "Beach", weight: "400" },
    { name: "Playfair", family: "'Playfair Display', serif", demo: "Elegant", weight: "700" },
    { name: "Playwrite GB", family: "'Playwrite GB J Guides', cursive", demo: "Write", weight: "400" },
    { name: "Reem Kufi", family: "'Reem Kufi', sans-serif", demo: "ريم كوفي", weight: "700" },
    { name: "Rock Salt", family: "'Rock Salt', cursive", demo: "Rock", weight: "400" },
    { name: "Rubik Storm", family: "'Rubik Storm', system-ui", demo: "Storm", weight: "400" },
    { name: "Ruwudu", family: "'Ruwudu', serif", demo: "روودو", weight: "700" },
    { name: "Gothic Condensed", family: "'Special Gothic Condensed One', sans-serif", demo: "Thin", weight: "400" },
    { name: "Gothic Expanded", family: "'Special Gothic Expanded One', sans-serif", demo: "Wide", weight: "400" },
    { name: "Zalando Sans", family: "'Zalando Sans Expanded', sans-serif", demo: "Expand", weight: "600" }
];

let currentFontFamily = ALL_FONTS[0].family;
let currentFontWeight = ALL_FONTS[0].weight;

// ذاكرة مؤقتة للخطوط المحملة
const loadedFonts = new Set();

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
        
        fontItem.onclick = () => selectFont(font.family, font.weight, fontItem);
        
        const fontSample = document.createElement('span');
        fontSample.style.fontFamily = font.family;
        fontSample.style.fontWeight = font.weight;
        fontSample.textContent = font.demo;
        
        // تحميل الخط عند النقر
        fontItem.addEventListener('click', () => {
            loadFont(font.family);
        });
        
        fontItem.appendChild(fontSample);
        fontGrid.appendChild(fontItem);
    });
    
    // تحميل الخط الافتراضي أولاً
    loadFont(ALL_FONTS[0].family);
    
    console.log('✓ تم تحميل', ALL_FONTS.length, 'خط');
}

// تحميل خط واحد فقط عند الحاجة
function loadFont(fontFamily) {
    if (loadedFonts.has(fontFamily)) {
        return;
    }
    
    loadedFonts.add(fontFamily);
    console.log('🔄 جاري تحميل الخط:', fontFamily);
    
    // استخدام Web Font Loader لضمان التحميل
    if (typeof WebFont !== 'undefined') {
        WebFont.load({
            google: {
                families: [fontFamily]
            },
            active: () => {
                console.log('✓ تم تحميل الخط:', fontFamily);
                if (window.currentText && window.currentText.trim() !== '') {
                    setTimeout(() => {
                        if (typeof renderFullCanvas === 'function') {
                            renderFullCanvas();
                        }
                    }, 100);
                }
            }
        });
    } else {
        // طريقة احتياطية
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}&display=swap`;
        link.rel = 'stylesheet';
        link.onload = () => {
            console.log('✓ تم تحميل الخط (احتياطي):', fontFamily);
        };
        document.head.appendChild(link);
    }
}

// اختيار خط
function selectFont(fontFamily, fontWeight, fontElement) {
    currentFontFamily = fontFamily;
    currentFontWeight = fontWeight;
    
    // تحديث واجهة المستخدم
    document.querySelectorAll('.font-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    if (fontElement) {
        fontElement.classList.add('selected');
    }
    
    // تحديث النص على الكانفاس
    if (window.currentText && window.currentText.trim() !== '') {
        setTimeout(() => {
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
            }
        }, 50);
    }
    
    console.log('✓ تم اختيار الخط:', fontFamily);
}

// تحميل Web Font Loader
(function() {
    const wf = document.createElement('script');
    wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
    wf.async = true;
    wf.onload = function() {
        console.log('Web Font Loader جاهز');
        initializeFonts();
    };
    document.head.appendChild(wf);
})();

// تصدير الدوال والمتغيرات
window.initializeFonts = initializeFonts;
window.selectFont = selectFont;
window.currentFontFamily = currentFontFamily;
window.currentFontWeight = currentFontWeight;
window.ALL_FONTS = ALL_FONTS;
