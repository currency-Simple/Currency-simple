// js/colors.js
const COLORS = [
    "#F7A8C4", "#F37199", "#E53888", "#AC1754",
    "#F6CE71", "#CC561E", "#FF6500", "#C40C0C",
    "#AEB877", "#D8E983", "#FFFBB1", "#A5C89E",
    "#222222", "#FA8112", "#F5E7C6", "#FAF3E1",
    "#E4FF30", "#008BFF", "#5B23FF", "#362F4F",
    "#111F35", "#8A244B", "#D02752", "#F63049",
    "#F375C2", "#B153D7", "#4D2FB2", "#0E21A0",
    "#5DD3B6", "#6E5034", "#CDB885", "#EFE1B5",
    "#FE7F2D", "#233D4D", "#215E61", "#F5FBE6",
    "#000000", "#FF0000", "#000080", "#FFFFFF"
];

let currentTextColor = "#FFFFFF";
let currentStrokeColor = "#000000";

// تهيئة الألوان
function initializeColors() {
    const grid = document.getElementById('colorsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    COLORS.forEach(color => {
        const item = document.createElement('div');
        item.className = 'color-item';
        item.style.backgroundColor = color;
        item.onclick = () => selectColor(color, item);
        
        if (color === currentTextColor) {
            item.classList.add('selected');
        }
        
        // إضافة حدود للألوان الفاتحة
        const isLight = ['#FFFFFF', '#F5FBE6', '#FAF3E1', '#FFFBB1'].includes(color);
        if (isLight) {
            item.style.border = '2px solid #ccc';
        }
        
        grid.appendChild(item);
    });
}

// اختيار لون
function selectColor(color, element) {
    currentTextColor = color;
    window.currentTextColor = color;
    
    // تحديث الواجهة
    document.querySelectorAll('.color-item').forEach(item => {
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

// اختيار لون الحدود
function selectStrokeColor(color) {
    currentStrokeColor = color;
    window.currentStrokeColor = color;
    
    if (window.currentText) {
        if (typeof window.renderCanvas === 'function') {
            window.renderCanvas();
        }
    }
}

// التهيئة التلقائية
window.addEventListener('DOMContentLoaded', initializeColors);

// تصدير الدوال
window.initializeColors = initializeColors;
window.selectColor = selectColor;
window.selectStrokeColor = selectStrokeColor;
window.COLORS = COLORS;
