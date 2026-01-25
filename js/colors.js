// ألوان ColorHunt مع الألوان الإضافية
const COLORS = [
  "#F7A8C4", "#F37199", "#E53888", "#AC1754", "#FFDFEF", "#EABDE6", "#D69ADE", "#AA60C8",
  "#F6CE71", "#CC561E", "#FF6500", "#C40C0C", "#F0F0DB", "#E1D9BC", "#ACBAC4", "#30364F",
  "#AEB877", "#D8E983", "#FFFBB1", "#A5C89E", "#9BC264", "#FFFDCE", "#F7DB91", "#F075AE",
  "#222222", "#FA8112", "#F5E7C6", "#FAF3E1", "#492828", "#656D3F", "#84934A", "#ECECEC",
  "#E4FF30", "#008BFF", "#5B23FF", "#362F4F", "#EDEDCE", "#629FAD", "#296374", "#0C2C55",
  "#111F35", "#8A244B", "#D02752", "#F63049", "#F375C2", "#B153D7", "#4D2FB2", "#0E21A0",
  "#5DD3B6", "#6E5034", "#CDB885", "#EFE1B5", "#FE7F2D", "#233D4D", "#215E61", "#F5FBE6",
  "#FAEB92", "#FF5FCF", "#9929EA", "#000000", "#FFDAB3", "#C8AAAA", "#9F8383", "#574964",
  "#FBEF76", "#FEC288", "#FD8A6B", "#FA5C5C", "#FFAAB8", "#FFD8DF", "#F0FFDF", "#A8DF8E",
  "#FA891A", "#F1E6C9", "#ABDADC", "#6E026F", "#F0F8A4", "#DAD887", "#75B06F", "#36656B",
  "#FF7DB0", "#FF0087", "#B0FFFA", "#00F7FF", "#EEEEEE", "#D8C9A7", "#DE802B", "#5C6F2B",
  "#F5F5F2", "#FEB05D", "#5A7ACD", "#2B2A2A", "#BDE8F5", "#4988C4", "#1C4D8D", "#0F2854",
  "#001F3D", "#B8DB80", "#547792", "#94B4C1", "#5A7863", "#EBF4DD", "#F6F3C2", "#FCF9EA",
  "#FFA240", "#FFD41D", "#000080", "#FF0000", "#16476A", "#132440", "#FDB5CE", "#4300FF",
  "#00FFDE", "#FF2DD1", "#FDFFB8", "#63C8FF", "#4DFFBE", "#FFFFFF"
];

// متغيرات لتخزين الألوان المختارة
let currentTextColor = "#FFFFFF";
let currentStrokeColor = "#000000";
let currentCardColor = "#000000";
let currentBorderColor = "#000000";
let currentBackgroundColor = "#FFFFFF";
let currentBackgroundSize = "original";

// تخزين الألوان في window لاستخدامها في editor.js
window.currentTextColor = currentTextColor;
window.currentStrokeColor = currentStrokeColor;
window.currentCardColor = currentCardColor;
window.currentBorderColor = currentBorderColor;
window.currentBackgroundColor = currentBackgroundColor;
window.currentBackgroundSize = currentBackgroundSize;

// أحجام الخلفية المتاحة - محدثة
const BACKGROUND_SIZES = [
    { name: "أصلي", value: "original", icon: "crop_original" },
    { name: "تغطية", value: "cover", icon: "fit_screen" },
    { name: "مربع 1:1", value: "1:1", icon: "crop_square" },
    { name: "عمودي 4:5", value: "4:5", icon: "crop_portrait" },
    { name: "قصة 9:16", value: "9:16", icon: "crop_portrait" },
    { name: "أفقي 16:9", value: "16:9", icon: "crop_landscape" },
    { name: "عمودي 3:4", value: "3:4", icon: "crop_portrait" },
    { name: "نشر 3:2", value: "3:2", icon: "crop_landscape" },
    { name: "شاشة 16:10", value: "16:10", icon: "desktop_windows" }
];

// تهيئة شبكات الألوان والخلفية
function initializeColors() {
    console.log('⏳ جاري تهيئة الألوان والخلفية...');
    
    // شبكة ألوان النص (أفقية)
    const colorGrid = document.getElementById('colorGrid');
    if (colorGrid) {
        colorGrid.innerHTML = '';
        colorGrid.className = 'horizontal-controls color-scroll';
        COLORS.forEach((color, index) => {
            const item = createColorItem(color, () => setTextColor(color));
            if (index === 0) item.classList.add('selected');
            colorGrid.appendChild(item);
        });
        console.log(`✓ تم تحميل ${COLORS.length} لون للنص`);
    }

    // شبكة ألوان الحواف (أفقية)
    const strokeGrid = document.getElementById('strokeColorGrid');
    if (strokeGrid) {
        strokeGrid.innerHTML = '';
        strokeGrid.className = 'horizontal-controls color-scroll';
        COLORS.forEach((color, index) => {
            const item = createColorItem(color, () => setStrokeColor(color));
            if (color === "#000000") item.classList.add('selected');
            strokeGrid.appendChild(item);
        });
        console.log(`✓ تم تحميل ${COLORS.length} لون للحواف`);
    }

    // شبكة ألوان حواف الصورة (أفقية)
    const borderGrid = document.getElementById('borderColorGrid');
    if (borderGrid) {
        borderGrid.innerHTML = '';
        borderGrid.className = 'horizontal-controls color-scroll';
        COLORS.forEach((color, index) => {
            const item = createColorItem(color, () => setBorderColor(color));
            if (color === "#000000") item.classList.add('selected');
            borderGrid.appendChild(item);
        });
        console.log(`✓ تم تحميل ${COLORS.length} لون لحواف الصورة`);
    }

    // شبكة ألوان خلفية النص (أفقية)
    const cardGrid = document.getElementById('cardColorGrid');
    if (cardGrid) {
        cardGrid.innerHTML = '';
        cardGrid.className = 'horizontal-controls color-scroll';
        COLORS.forEach((color, index) => {
            const item = createColorItem(color, () => setCardColor(color));
            if (color === "#000000") item.classList.add('selected');
            cardGrid.appendChild(item);
        });
        console.log(`✓ تم تحميل ${COLORS.length} لون لخلفية النص`);
    }

    // شبكة ألوان خلفية الصورة (أفقية)
    const backgroundGrid = document.getElementById('backgroundColorGrid');
    if (backgroundGrid) {
        backgroundGrid.innerHTML = '';
        backgroundGrid.className = 'horizontal-controls color-scroll';
        
        // إضافة عنصر للشفافية
        const transparentItem = document.createElement('div');
        transparentItem.className = 'color-item';
        transparentItem.style.backgroundColor = 'transparent';
        transparentItem.style.backgroundImage = 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)';
        transparentItem.style.backgroundSize = '20px 20px';
        transparentItem.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
        transparentItem.title = 'شفاف';
        transparentItem.onclick = () => {
            backgroundGrid.querySelectorAll('.color-item').forEach(c => c.classList.remove('selected'));
            transparentItem.classList.add('selected');
            setBackgroundColor('transparent');
        };
        backgroundGrid.appendChild(transparentItem);
        
        COLORS.forEach((color, index) => {
            const item = createColorItem(color, () => setBackgroundColor(color));
            if (color === "#FFFFFF") item.classList.add('selected');
            backgroundGrid.appendChild(item);
        });
        console.log(`✓ تم تحميل ${COLORS.length + 1} لون للخلفية`);
    }

    // شبكة أحجام الخلفية
    const backgroundSizeGrid = document.getElementById('backgroundSizeGrid');
    if (backgroundSizeGrid) {
        backgroundSizeGrid.innerHTML = '';
        backgroundSizeGrid.className = 'background-buttons-grid';
        
        BACKGROUND_SIZES.forEach((size, index) => {
            const button = document.createElement('button');
            button.className = 'background-size-btn';
            button.innerHTML = `
                <span class="material-symbols-outlined">${size.icon}</span>
                <span>${size.name}</span>
            `;
            button.title = size.name;
            button.onclick = () => setBackgroundSize(size.value, button);
            
            // تحديد "أصلي" افتراضياً
            if (size.value === "original") {
                button.classList.add('selected');
            }
            
            backgroundSizeGrid.appendChild(button);
        });
        console.log(`✓ تم تحميل ${BACKGROUND_SIZES.length} حجم للخلفية`);
    }
}

// إنشاء عنصر لون
function createColorItem(color, onClick) {
    const item = document.createElement('div');
    item.className = 'color-item';
    item.style.backgroundColor = color;
    item.onclick = () => {
        // إزالة التحديد من جميع العناصر في نفس المجموعة
        const parent = item.parentElement;
        if (parent) {
            parent.querySelectorAll('.color-item').forEach(c => c.classList.remove('selected'));
        }
        item.classList.add('selected');
        onClick();
    };
    item.title = color;
    
    // إضافة حدود للألوان الفاتحة جداً
    const lightColors = ["#FFFFFF", "#FFFBB1", "#FFFDCE", "#F4F4F4", "#F2F2F2", 
                       "#FCF9EA", "#F9F8F6", "#F3F2EC", "#EFE9E3", "#DCDCDC", 
                       "#ECF4E8", "#FFE6D4", "#ECECEC", "#F0F0DB", "#EDEDCE", 
                       "#EFE1B5", "#F5FBE6", "#F1E6C9", "#EEEEEE", "#F5F5F2", 
                       "#EBF4DD", "#F6F3C2", "#FCF9EA", "#FDFFB8"];
    
    if (lightColors.includes(color)) {
        item.style.border = "2px solid #ccc";
    }
    
    return item;
}

// تعيين لون النص
function setTextColor(color) {
    currentTextColor = color;
    window.currentTextColor = color;
    console.log('✓ لون النص:', color);
    
    // تحديث النمط فوراً
    if (window.currentText && window.currentText.trim() !== '') {
        if (typeof renderFullCanvas === 'function') {
            renderFullCanvas();
        }
    }
}

// تعيين لون الحواف
function setStrokeColor(color) {
    currentStrokeColor = color;
    window.currentStrokeColor = color;
    console.log('✓ لون حواف النص:', color);
    
    // تحديث النمط فوراً
    if (window.currentText && window.currentText.trim() !== '') {
        if (typeof renderFullCanvas === 'function') {
            renderFullCanvas();
        }
    }
}

// تعيين لون حواف الصورة
function setBorderColor(color) {
    currentBorderColor = color;
    window.currentBorderColor = color;
    
    // تحديث متغير imageBorderColor في editor.js
    if (typeof window.imageBorderColor !== 'undefined') {
        window.imageBorderColor = color;
    }
    
    console.log('✓ لون حواف الصورة:', color);
    
    // تحديث الصورة فوراً
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
}

// تعيين لون الخلفية
function setCardColor(color) {
    currentCardColor = color;
    window.currentCardColor = color;
    console.log('✓ لون خلفية النص:', color);
    
    // تحديث النمط فوراً
    if (window.currentText && window.currentText.trim() !== '') {
        if (typeof renderFullCanvas === 'function') {
            renderFullCanvas();
        }
    }
}

// تعيين لون خلفية الصورة
function setBackgroundColor(color) {
    currentBackgroundColor = color;
    window.currentBackgroundColor = color;
    console.log('✓ لون خلفية الصورة:', color);
    
    // تحديث الصورة فوراً
    if (typeof updateBackground === 'function') {
        updateBackground();
    } else if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
}

// تعيين حجم الخلفية
function setBackgroundSize(size, button) {
    currentBackgroundSize = size;
    window.currentBackgroundSize = size;
    console.log('✓ حجم الخلفية:', size);
    
    // تحديث واجهة المستخدم
    const buttons = document.querySelectorAll('.background-size-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    if (button) {
        button.classList.add('selected');
    }
    
    // تحديث الصورة فوراً
    if (typeof updateBackground === 'function') {
        updateBackground();
    } else if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
}

// تصدير الدوال
window.initializeColors = initializeColors;
window.setTextColor = setTextColor;
window.setStrokeColor = setStrokeColor;
window.setBorderColor = setBorderColor;
window.setCardColor = setCardColor;
window.setBackgroundColor = setBackgroundColor;
window.setBackgroundSize = setBackgroundSize;
window.COLORS = COLORS;
window.BACKGROUND_SIZES = BACKGROUND_SIZES;
