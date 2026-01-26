// js/fonts.js
const FONTS = [
    { name: "ABeeZee", family: "'ABeeZee', sans-serif" },
    { name: "Aref Ruqaa", family: "'Aref Ruqaa', serif" },
    { name: "Noto Kufi Arabic", family: "'Noto Kufi Arabic', sans-serif" },
    { name: "Jomhuria", family: "'Jomhuria', cursive" },
    { name: "Abril Fatface", family: "'Abril Fatface', serif" },
    { name: "Alex Brush", family: "'Alex Brush', cursive" },
    { name: "Cinzel", family: "'Cinzel', serif" },
    { name: "Damion", family: "'Damion', cursive" },
    { name: "Great Vibes", family: "'Great Vibes', cursive" },
    { name: "Rock Salt", family: "'Rock Salt', cursive" },
    { name: "Monoton", family: "'Monoton', cursive" },
    { name: "Audiowide", family: "'Audiowide', monospace" },
    { name: "Bangers", family: "'Bangers', cursive" },
    { name: "Alfa Slab One", family: "'Alfa Slab One', serif" }
];

let currentFont = FONTS[0].family;

// تهيئة الخطوط
function initializeFonts() {
    const grid = document.getElementById('fontsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    FONTS.forEach(font => {
        const item = document.createElement('div');
        item.className = 'font-item';
        item.onclick = () => selectFont(font.family, item);
        
        if (font.family === currentFont) {
            item.classList.add('selected');
        }
        
        item.innerHTML = `
            <div class="font-sample" style="font-family: ${font.family}">
                ${font.name}
            </div>
        `;
        
        grid.appendChild(item);
    });
}

// اختيار خط
function selectFont(fontFamily, element) {
    currentFont = fontFamily;
    window.currentFontFamily = fontFamily;
    
    // تحديث الواجهة
    document.querySelectorAll('.font-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    if (element) {
        element.classList.add('selected');
    }
    
    // تحديث النص إذا كان موجودًا
    if (window.currentText) {
        if (typeof window.renderCanvas === 'function') {
            window.renderCanvas();
        }
    }
}

// التهيئة التلقائية
window.addEventListener('DOMContentLoaded', initializeFonts);

// تصدير الدوال
window.initializeFonts = initializeFonts;
window.selectFont = selectFont;
window.FONTS = FONTS;
