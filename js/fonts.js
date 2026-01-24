[file name]: fonts.js
[file content begin]
// قائمة الخطوط الـ 40 من Google Fonts
const ALL_FONTS = [
    { name: "Agu Display", family: "'Agu Display', display", demo: "نص تجريبي", link: "Agu+Display" },
    { name: "Alkalami", family: "'Alkalami', serif", demo: "خط عربي", link: "Alkalami" },
    { name: "Amatic SC", family: "'Amatic SC', cursive", demo: "Creative", link: "Amatic+SC" },
    { name: "Anton", family: "'Anton', sans-serif", demo: "BOLD", link: "Anton" },
    { name: "Archivo Black", family: "'Archivo Black', sans-serif", demo: "Heavy", link: "Archivo+Black" },
    { name: "Archivo", family: "'Archivo', sans-serif", demo: "Modern", link: "Archivo" },
    { name: "Audiowide", family: "'Audiowide', sans-serif", demo: "Tech", link: "Audiowide" },
    { name: "Badeen Display", family: "'Badeen Display', display", demo: "عرض", link: "Badeen+Display" },
    { name: "Bangers", family: "'Bangers', system-ui", demo: "POP!", link: "Bangers" },
    { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", demo: "TITLE", link: "Bebas+Neue" },
    { name: "Bitcount", family: "'Bitcount Single', monospace", demo: "01010", link: "Bitcount+Single" },
    { name: "Buda", family: "'Buda', display", demo: "Unique", link: "Buda" },
    { name: "Cairo Play", family: "'Cairo Play', sans-serif", demo: "قاهرة", link: "Cairo+Play" },
    { name: "Creepster", family: "'Creepster', system-ui", demo: "Scary", link: "Creepster" },
    { name: "Dancing Script", family: "'Dancing Script', cursive", demo: "Dance", link: "Dancing+Script" },
    { name: "Eater", family: "'Eater', system-ui", demo: "Horror", link: "Eater" },
    { name: "Edu Hand", family: "'Edu SA Hand', cursive", demo: "Hand", link: "Edu+SA+Hand" },
    { name: "Fjalla One", family: "'Fjalla One', sans-serif", demo: "Strong", link: "Fjalla+One" },
    { name: "Fredericka", family: "'Fredericka the Great', serif", demo: "Great", link: "Fredericka+the+Great" },
    { name: "Gravitas One", family: "'Gravitas One', serif", demo: "Heavy", link: "Gravitas+One" },
    { name: "Lalezar", family: "'Lalezar', system-ui", demo: "لاله زار", link: "Lalezar" },
    { name: "Lobster Two", family: "'Lobster Two', serif", demo: "Fancy", link: "Lobster+Two" },
    { name: "Macondo", family: "'Macondo', system-ui", demo: "Fun", link: "Macondo" },
    { name: "Mada", family: "'Mada', sans-serif", demo: "مدى", link: "Mada" },
    { name: "Momo Signature", family: "'Momo Signature', cursive", demo: "Sign", link: "Momo+Signature" },
    { name: "Monoton", family: "'Monoton', system-ui", demo: "LINE", link: "Monoton" },
    { name: "Moo Lah Lah", family: "'Moo Lah Lah', system-ui", demo: "Moo", link: "Moo+Lah+Lah" },
    { name: "Noto Nastaliq", family: "'Noto Nastaliq Urdu', serif", demo: "نستعلیق", link: "Noto+Nastaliq+Urdu" },
    { name: "Noto Serif", family: "'Noto Serif', serif", demo: "Classic", link: "Noto+Serif" },
    { name: "Oswald", family: "'Oswald', sans-serif", demo: "Clean", link: "Oswald" },
    { name: "Pacifico", family: "'Pacifico', cursive", demo: "Beach", link: "Pacifico" },
    { name: "Playfair", family: "'Playfair Display', serif", demo: "Elegant", link: "Playfair+Display" },
    { name: "Playwrite GB", family: "'Playwrite GB J Guides', cursive", demo: "Write", link: "Playwrite+GB+J+Guides" },
    { name: "Reem Kufi", family: "'Reem Kufi', sans-serif", demo: "ريم كوفي", link: "Reem+Kufi" },
    { name: "Rock Salt", family: "'Rock Salt', cursive", demo: "Rock", link: "Rock+Salt" },
    { name: "Rubik Storm", family: "'Rubik Storm', system-ui", demo: "Storm", link: "Rubik+Storm" },
    { name: "Ruwudu", family: "'Ruwudu', serif", demo: "روودو", link: "Ruwudu" },
    { name: "Gothic Condensed", family: "'Special Gothic Condensed One', sans-serif", demo: "Thin", link: "Special+Gothic+Condensed+One" },
    { name: "Gothic Expanded", family: "'Special Gothic Expanded One', sans-serif", demo: "Wide", link: "Special+Gothic+Expanded+One" },
    { name: "Zalando Sans", family: "'Zalando Sans Expanded', sans-serif", demo: "Expand", link: "Zalando+Sans+Expanded" }
];

let currentFontFamily = ALL_FONTS[0].family;

// دالة لتحميل خط محدد
function loadFont(fontFamily, fontLink) {
    // تحقق إذا كان الخط محملاً بالفعل
    if (document.fonts && document.fonts.check(`12px ${fontFamily}`)) {
        return Promise.resolve();
    }
    
    return new Promise((resolve) => {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontLink}&display=swap`;
        link.rel = 'stylesheet';
        
        link.onload = () => {
            // تأكد من تحميل الخط
            const testText = document.createElement('span');
            testText.style.fontFamily = fontFamily;
            testText.style.position = 'absolute';
            testText.style.opacity = '0';
            testText.textContent = 'test';
            document.body.appendChild(testText);
            
            setTimeout(() => {
                document.body.removeChild(testText);
                resolve();
            }, 100);
        };
        
        link.onerror = () => {
            console.warn(`Failed to load font: ${fontFamily}`);
            resolve();
        };
        
        document.head.appendChild(link);
    });
}

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
        fontItem.dataset.fontFamily = font.family;
        fontItem.dataset.fontLink = font.link;
        
        if (index === 0) {
            fontItem.classList.add('selected');
            // تحميل الخط الأول مباشرة
            loadFont(font.family, font.link);
        }
        
        fontItem.onclick = () => selectFont(font.family, font.link, fontItem);
        
        const fontSample = document.createElement('span');
        fontSample.style.fontFamily = font.family;
        fontSample.textContent = font.demo;
        
        fontItem.appendChild(fontSample);
        fontGrid.appendChild(fontItem);
    });
    
    console.log('✓ تم تحميل', ALL_FONTS.length, 'خط');
}

// اختيار خط
function selectFont(fontFamily, fontLink, fontElement) {
    // تحميل الخط أولاً
    loadFont(fontFamily, fontLink).then(() => {
        currentFontFamily = fontFamily;
        window.currentFontFamily = fontFamily;
        
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
    }).catch(error => {
        console.error('Error loading font:', error);
    });
}

// تحميل الخطوط عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('⏳ جاري تحميل الخطوط...');
    
    // تحميل الخطوط الأساسية أولاً
    setTimeout(() => {
        initializeFonts();
    }, 500);
});

// تصدير الدوال والمتغيرات
window.initializeFonts = initializeFonts;
window.selectFont = selectFont;
window.loadFont = loadFont;
window.currentFontFamily = currentFontFamily;
window.ALL_FONTS = ALL_FONTS;
[file content end]
