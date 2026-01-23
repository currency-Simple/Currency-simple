// ملف colored.js - قسم الملون
let selectedShape = null;
let selectedBgColor = null;
let coloredTextColor = '#FFFFFF';
let coloredStrokeColor = '#000000';

// قائمة الأشكال
const SHAPES = [
    { id: 'square', name: 'مربع', icon: 'square', type: 'filled' },
    { id: 'rectangle', name: 'مستطيل', icon: 'rectangle', type: 'filled' },
    { id: 'circle', name: 'دائرة', icon: 'circle', type: 'filled' },
    { id: 'triangle', name: 'مثلث', icon: 'change_history', type: 'filled' },
    { id: 'hexagon', name: 'سداسي', icon: 'hexagon', type: 'filled' },
    { id: 'star', name: 'نجمة', icon: 'star', type: 'filled' },
    { id: 'heart', name: 'قلب', icon: 'favorite', type: 'filled' },
    { id: 'square-outline', name: 'مربع مجوف', icon: 'check_box_outline_blank', type: 'outline' },
    { id: 'circle-outline', name: 'دائرة مجوفة', icon: 'radio_button_unchecked', type: 'outline' },
    { id: 'triangle-outline', name: 'مثلث مجوف', icon: 'change_history', type: 'outline' },
    { id: 'hexagon-outline', name: 'سداسي مجوف', icon: 'hexagon', type: 'outline' },
    { id: 'star-outline', name: 'نجمة مجوفة', icon: 'star_border', type: 'outline' },
    { id: 'heart-outline', name: 'قلب مجوف', icon: 'favorite_border', type: 'outline' }
];

// تهيئة قسم الملون
function initializeColoredPage() {
    console.log('⏳ تهيئة قسم الملون...');
    
    // إعداد المستمعات للأحداث
    setupColoredEventListeners();
    
    // تهيئة الأشكال
    initializeShapes();
    
    // تهيئة ألوان الخلفية
    initializeBackgroundColors();
    
    // تهيئة ألوان النص
    initializeColoredTextColors();
    
    // تهيئة ألوان الحواف
    initializeColoredStrokeColors();
    
    console.log('✓ قسم الملون جاهز');
}

// إعداد مستمعات الأحداث
function setupColoredEventListeners() {
    const coloredFontSize = document.getElementById('coloredFontSize');
    const coloredStrokeWidth = document.getElementById('coloredStrokeWidth');
    const coloredFontFamily = document.getElementById('coloredFontFamily');
    const coloredShadowEnabled = document.getElementById('coloredShadowEnabled');
    const coloredCardEnabled = document.getElementById('coloredCardEnabled');
    
    if (coloredFontSize) {
        coloredFontSize.addEventListener('input', function() {
            document.getElementById('coloredFontSizeDisplay').textContent = this.value;
        });
    }
    
    if (coloredStrokeWidth) {
        coloredStrokeWidth.addEventListener('input', function() {
            document.getElementById('coloredStrokeWidthDisplay').textContent = this.value;
        });
    }
    
    if (coloredFontFamily) {
        coloredFontFamily.addEventListener('change', function() {
            // يمكن إضافة تحديث للعرض المباشر هنا إذا لزم الأمر
        });
    }
    
    if (coloredShadowEnabled) {
        coloredShadowEnabled.addEventListener('change', function() {
            // يمكن إضافة تحديث للعرض المباشر هنا إذا لزم الأمر
        });
    }
    
    if (coloredCardEnabled) {
        coloredCardEnabled.addEventListener('change', function() {
            // يمكن إضافة تحديث للعرض المباشر هنا إذا لزم الأمر
        });
    }
}

// تهيئة الأشكال
function initializeShapes() {
    const shapesGrid = document.getElementById('shapesGrid');
    if (!shapesGrid) return;
    
    shapesGrid.innerHTML = '';
    
    SHAPES.forEach(shape => {
        const item = document.createElement('div');
        item.className = 'shape-item';
        item.id = `shape-${shape.id}`;
        item.onclick = () => selectShape(shape.id);
        
        item.innerHTML = `
            <span class="material-symbols-outlined shape-icon">${shape.icon}</span>
            <span class="shape-label">${shape.name}</span>
        `;
        
        shapesGrid.appendChild(item);
    });
}

// اختيار شكل
function selectShape(shapeId) {
    // إلغاء تحديد الشكل السابق
    if (selectedShape) {
        const prevItem = document.getElementById(`shape-${selectedShape}`);
        if (prevItem) prevItem.classList.remove('active');
    }
    
    // تحديد الشكل الجديد
    selectedShape = shapeId;
    const currentItem = document.getElementById(`shape-${selectedShape}`);
    if (currentItem) currentItem.classList.add('active');
    
    console.log('✓ شكل مختار:', shapeId);
}

// تهيئة ألوان الخلفية
function initializeBackgroundColors() {
    const bgGrid = document.getElementById('backgroundColorsGrid');
    if (!bgGrid || !window.COLORS) return;
    
    bgGrid.innerHTML = '';
    
    // استخدام الألوان المحددة من ملف colors.js
    window.COLORS.forEach((color, index) => {
        const item = document.createElement('div');
        item.className = 'color-item';
        item.style.backgroundColor = color;
        item.onclick = () => selectBgColor(color);
        item.title = color;
        
        // إضافة حدود للألوان الفاتحة
        if (color === "#FFFFFF" || color === "#F4F4F4" || color === "#FCF9EA" || 
            color === "#F2F2F2" || color === "#F9F8F6") {
            item.style.border = "2px solid #ccc";
        }
        
        bgGrid.appendChild(item);
    });
}

// اختيار لون الخلفية
function selectBgColor(color) {
    selectedBgColor = color;
    
    // إزالة التحديد من جميع الألوان
    document.querySelectorAll('#backgroundColorsGrid .color-item').forEach(item => {
        item.style.border = '';
        // إعادة تطبيق الحدود للألوان الفاتحة
        const bgColor = item.style.backgroundColor;
        if (isLightColor(bgColor)) {
            item.style.border = "2px solid #ccc";
        }
    });
    
    // إضافة حدود للون المختار
    const selectedItem = Array.from(document.querySelectorAll('#backgroundColorsGrid .color-item'))
        .find(item => item.style.backgroundColor === color || 
                     rgbToHex(item.style.backgroundColor) === color);
    
    if (selectedItem) {
        selectedItem.style.border = "3px solid var(--primary-color)";
        selectedItem.style.boxShadow = "0 0 0 2px var(--card-bg)";
    }
    
    console.log('✓ لون خلفية مختار:', color);
}

// تهيئة ألوان النص
function initializeColoredTextColors() {
    const textGrid = document.getElementById('coloredTextColorsGrid');
    if (!textGrid || !window.COLORS) return;
    
    textGrid.innerHTML = '';
    
    // اختيار مجموعة من الألوان المتنوعة
    const selectedColors = [
        '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
        '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
        '#008000', '#800000', '#FFC0CB', '#A52A2A', '#FFD700'
    ];
    
    selectedColors.forEach(color => {
        const item = document.createElement('div');
        item.className = 'color-item';
        item.style.backgroundColor = color;
        item.onclick = () => selectColoredTextColor(color);
        item.title = color;
        
        if (color === "#FFFFFF") {
            item.style.border = "2px solid #ccc";
        }
        
        textGrid.appendChild(item);
    });
}

// اختيار لون النص
function selectColoredTextColor(color) {
    coloredTextColor = color;
    console.log('✓ لون نص مختار:', color);
}

// تهيئة ألوان الحواف
function initializeColoredStrokeColors() {
    const strokeGrid = document.getElementById('coloredStrokeColorsGrid');
    if (!strokeGrid || !window.COLORS) return;
    
    strokeGrid.innerHTML = '';
    
    // اختيار مجموعة من الألوان المتنوعة للحواف
    const selectedColors = [
        '#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FFFF00',
        '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
        '#800000', '#A52A2A', '#696969', '#2F4F4F', '#000080'
    ];
    
    selectedColors.forEach(color => {
        const item = document.createElement('div');
        item.className = 'color-item';
        item.style.backgroundColor = color;
        item.onclick = () => selectColoredStrokeColor(color);
        item.title = color;
        
        if (color === "#FFFFFF") {
            item.style.border = "2px solid #ccc";
        }
        
        strokeGrid.appendChild(item);
    });
}

// اختيار لون الحواف
function selectColoredStrokeColor(color) {
    coloredStrokeColor = color;
    console.log('✓ لون حواف مختار:', color);
}

// تطبيق الإعدادات على المحرر
function applyColoredToEditor() {
    // تطبيق الشكل إذا كان مختاراً
    if (selectedShape) {
        console.log('تطبيق الشكل:', selectedShape);
        // هنا يمكنك إضافة كود لرسم الشكل على الكانفاس
    }
    
    // تطبيق لون الخلفية إذا كان مختاراً
    if (selectedBgColor) {
        console.log('تطبيق لون الخلفية:', selectedBgColor);
        // هنا يمكنك إضافة كود لتغيير خلفية الكانفاس
    }
    
    // تطبيق إعدادات النص على المحرر
    applyTextSettingsToEditor();
    
    // عرض رسالة نجاح
    showAlert('تم تطبيق الإعدادات على المحرر', 'success');
}

// تطبيق إعدادات النص على المحرر
function applyTextSettingsToEditor() {
    // تحديث إعدادات النص في المحرر الرئيسي
    const coloredFontSize = document.getElementById('coloredFontSize').value;
    const coloredStrokeWidth = document.getElementById('coloredStrokeWidth').value;
    const coloredFontFamily = document.getElementById('coloredFontFamily').value;
    const coloredShadowEnabled = document.getElementById('coloredShadowEnabled').checked;
    const coloredCardEnabled = document.getElementById('coloredCardEnabled').checked;
    
    // تطبيق على عناصر المحرر الرئيسي
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const strokeWidthInput = document.getElementById('strokeWidth');
    const strokeWidthDisplay = document.getElementById('strokeWidthDisplay');
    const fontFamilySelect = document.getElementById('fontFamily');
    const shadowCheckbox = document.getElementById('shadowEnabled');
    const cardCheckbox = document.getElementById('cardEnabled');
    
    if (fontSizeInput) fontSizeInput.value = coloredFontSize;
    if (fontSizeDisplay) fontSizeDisplay.textContent = coloredFontSize;
    if (strokeWidthInput) strokeWidthInput.value = coloredStrokeWidth;
    if (strokeWidthDisplay) strokeWidthDisplay.textContent = coloredStrokeWidth;
    if (fontFamilySelect) fontFamilySelect.value = coloredFontFamily;
    if (shadowCheckbox) shadowCheckbox.checked = coloredShadowEnabled;
    if (cardCheckbox) cardCheckbox.checked = coloredCardEnabled;
    
    // تطبيق الألوان على المتغيرات العامة
    window.currentTextColor = coloredTextColor;
    window.currentStrokeColor = coloredStrokeColor;
    
    console.log('✓ تم تطبيق إعدادات النص:', {
        fontSize: coloredFontSize,
        strokeWidth: coloredStrokeWidth,
        fontFamily: coloredFontFamily,
        shadow: coloredShadowEnabled,
        card: coloredCardEnabled,
        textColor: coloredTextColor,
        strokeColor: coloredStrokeColor
    });
}

// دوال مساعدة
function isLightColor(color) {
    // تحويل اللون إلى RGB
    let r, g, b;
    
    if (color.startsWith('#')) {
        r = parseInt(color.substr(1, 2), 16);
        g = parseInt(color.substr(3, 2), 16);
        b = parseInt(color.substr(5, 2), 16);
    } else if (color.startsWith('rgb')) {
        const rgb = color.match(/\d+/g);
        r = parseInt(rgb[0]);
        g = parseInt(rgb[1]);
        b = parseInt(rgb[2]);
    } else {
        return false;
    }
    
    // حساب السطوع
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
}

function rgbToHex(rgb) {
    if (!rgb) return '';
    
    if (rgb.startsWith('#')) return rgb;
    
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length < 3) return '';
    
    const r = parseInt(rgbValues[0]);
    const g = parseInt(rgbValues[1]);
    const b = parseInt(rgbValues[2]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// تحميل قسم الملون عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof initializeColoredPage === 'function') {
            initializeColoredPage();
        }
    }, 500);
});
