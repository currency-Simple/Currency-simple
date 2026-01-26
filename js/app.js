// متغيرات عامة
let categories = [];
let currentCategory = null;
let currentImages = [];
let keyboardOpen = false;
let textCardVisible = false;
let textBoxVisible = false;

// تحميل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App starting...');
    
    // تهيئة الإعدادات
    loadSettings();
    
    // تحميل الفئات
    loadCategories();
    
    // عرض الصفحة الأولية
    showPage('categories');
    
    // إعداد مستمعات الكيبورد
    setupKeyboardListeners();
    
    // إعداد بطاقة النص بعد تحميل الصفحة
    setTimeout(() => {
        setupTextCard();
        setupBackgroundControls();
        setupTextBoxControls();
        setupWhiteColorBox();
    }, 500);
});

// إعداد مربع التحكم بالنص
function setupTextBoxControls() {
    console.log('📐 Setting up text box controls...');
    
    // إنشاء عنصر مربع التحكم إذا لم يكن موجوداً
    const editorContainer = document.querySelector('.editor-container');
    if (!editorContainer) return;
    
    if (!document.getElementById('textBox')) {
        const textBox = document.createElement('div');
        textBox.id = 'textBox';
        textBox.className = 'text-box-control';
        textBox.style.display = 'none';
        textBox.innerHTML = `
            <div class="text-box-handle nw" data-handle="nw"></div>
            <div class="text-box-handle ne" data-handle="ne"></div>
            <div class="text-box-handle sw" data-handle="sw"></div>
            <div class="text-box-handle se" data-handle="se"></div>
            <div class="text-box-handle rotate" data-handle="rotate"></div>
        `;
        editorContainer.appendChild(textBox);
        
        // إضافة مستمعات الأحداث للمقابض
        setupTextBoxHandles();
    }
}

function setupTextBoxHandles() {
    const textBox = document.getElementById('textBox');
    if (!textBox) return;
    
    const handles = textBox.querySelectorAll('.text-box-handle');
    handles.forEach(handle => {
        handle.addEventListener('mousedown', startTextBoxResize);
        handle.addEventListener('touchstart', startTextBoxResize);
    });
    
    // مستمعات لتحريك المربع
    textBox.addEventListener('mousedown', startTextBoxDrag);
    textBox.addEventListener('touchstart', startTextBoxDrag);
}

let isTextBoxDragging = false;
let isTextBoxResizing = false;
let currentHandle = null;
let startDragX = 0;
let startDragY = 0;
let startWidth = 0;
let startHeight = 0;
let startLeft = 0;
let startTop = 0;

function startTextBoxDrag(e) {
    e.preventDefault();
    if (e.type === 'touchstart') {
        e = e.touches[0];
    }
    
    isTextBoxDragging = true;
    startDragX = e.clientX;
    startDragY = e.clientY;
    
    const textBox = document.getElementById('textBox');
    const rect = textBox.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    
    document.addEventListener('mousemove', doTextBoxDrag);
    document.addEventListener('touchmove', doTextBoxDrag);
    document.addEventListener('mouseup', stopTextBoxDrag);
    document.addEventListener('touchend', stopTextBoxDrag);
}

function doTextBoxDrag(e) {
    if (!isTextBoxDragging) return;
    e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startDragX;
    const deltaY = clientY - startDragY;
    
    const textBox = document.getElementById('textBox');
    const container = document.querySelector('.canvas-wrapper-fixed');
    const containerRect = container.getBoundingClientRect();
    const textBoxRect = textBox.getBoundingClientRect();
    
    // حساب الموضع الجديد مع حدود الحاوية
    let newLeft = startLeft + deltaX;
    let newTop = startTop + deltaY;
    
    // التأكد من بقاء المربع داخل الحاوية
    newLeft = Math.max(containerRect.left, Math.min(newLeft, containerRect.right - textBoxRect.width));
    newTop = Math.max(containerRect.top, Math.min(newTop, containerRect.bottom - textBoxRect.height));
    
    // تحديث موقع المربع
    textBox.style.left = (newLeft - containerRect.left) + 'px';
    textBox.style.top = (newTop - containerRect.top) + 'px';
    
    // تحديث موقع النص النسبي على الكانفاس
    updateTextPositionFromBox();
}

function stopTextBoxDrag() {
    isTextBoxDragging = false;
    document.removeEventListener('mousemove', doTextBoxDrag);
    document.removeEventListener('touchmove', doTextBoxDrag);
    document.removeEventListener('mouseup', stopTextBoxDrag);
    document.removeEventListener('touchend', stopTextBoxDrag);
}

function startTextBoxResize(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const handle = e.target;
    currentHandle = handle.dataset.handle;
    isTextBoxResizing = true;
    
    const textBox = document.getElementById('textBox');
    const rect = textBox.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    startDragX = clientX;
    startDragY = clientY;
    
    document.addEventListener('mousemove', doTextBoxResize);
    document.addEventListener('touchmove', doTextBoxResize);
    document.addEventListener('mouseup', stopTextBoxResize);
    document.addEventListener('touchend', stopTextBoxResize);
}

function doTextBoxResize(e) {
    if (!isTextBoxResizing || !currentHandle) return;
    e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startDragX;
    const deltaY = clientY - startDragY;
    
    const textBox = document.getElementById('textBox');
    const container = document.querySelector('.canvas-wrapper-fixed');
    const containerRect = container.getBoundingClientRect();
    const minSize = 50;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;
    
    // حساب التغيير بناءً على المقبض المختار
    switch(currentHandle) {
        case 'nw':
            newWidth = Math.max(minSize, startWidth - deltaX);
            newHeight = Math.max(minSize, startHeight - deltaY);
            newLeft = startLeft + deltaX;
            newTop = startTop + deltaY;
            break;
        case 'ne':
            newWidth = Math.max(minSize, startWidth + deltaX);
            newHeight = Math.max(minSize, startHeight - deltaY);
            newTop = startTop + deltaY;
            break;
        case 'sw':
            newWidth = Math.max(minSize, startWidth - deltaX);
            newHeight = Math.max(minSize, startHeight + deltaY);
            newLeft = startLeft + deltaX;
            break;
        case 'se':
            newWidth = Math.max(minSize, startWidth + deltaX);
            newHeight = Math.max(minSize, startHeight + deltaY);
            break;
        case 'rotate':
            // تدوير النص
            const centerX = startLeft + startWidth / 2;
            const centerY = startTop + startHeight / 2;
            const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
            window.textRotation = (angle + 90) % 360;
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
            }
            return;
    }
    
    // التأكد من عدم تجاوز الحدود
    if (newLeft < containerRect.left) {
        newWidth = startWidth + (newLeft - containerRect.left);
        newLeft = containerRect.left;
    }
    if (newTop < containerRect.top) {
        newHeight = startHeight + (newTop - containerRect.top);
        newTop = containerRect.top;
    }
    if (newLeft + newWidth > containerRect.right) {
        newWidth = containerRect.right - newLeft;
    }
    if (newTop + newHeight > containerRect.bottom) {
        newHeight = containerRect.bottom - newTop;
    }
    
    // تحديث أبعاد وموقع المربع
    const relativeLeft = newLeft - containerRect.left;
    const relativeTop = newTop - containerRect.top;
    
    textBox.style.width = newWidth + 'px';
    textBox.style.height = newHeight + 'px';
    textBox.style.left = relativeLeft + 'px';
    textBox.style.top = relativeTop + 'px';
    
    // تحديث حجم النص بناءً على حجم المربع
    updateTextSizeFromBox(newWidth, newHeight);
}

function stopTextBoxResize() {
    isTextBoxResizing = false;
    currentHandle = null;
    document.removeEventListener('mousemove', doTextBoxResize);
    document.removeEventListener('touchmove', doTextBoxResize);
    document.removeEventListener('mouseup', stopTextBoxResize);
    document.removeEventListener('touchend', stopTextBoxResize);
}

function updateTextPositionFromBox() {
    const textBox = document.getElementById('textBox');
    const container = document.querySelector('.canvas-wrapper-fixed');
    const canvas = document.getElementById('canvas');
    
    if (!textBox || !container || !canvas) return;
    
    const containerRect = container.getBoundingClientRect();
    const textBoxRect = textBox.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // حساب الموضع النسبي للنص في الكانفاس
    const relativeX = (textBoxRect.left + textBoxRect.width / 2 - canvasRect.left) / canvasRect.width;
    const relativeY = (textBoxRect.top + textBoxRect.height / 2 - canvasRect.top) / canvasRect.height;
    
    textX = Math.max(0.1, Math.min(0.9, relativeX));
    textY = Math.max(0.1, Math.min(0.9, relativeY));
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
}

function updateTextSizeFromBox(width, height) {
    const container = document.querySelector('.canvas-wrapper-fixed');
    if (!container) return;
    
    // حساب المقياس بناءً على حجم المربع مقارنة بحجم الحاوية
    const maxSize = Math.min(container.clientWidth, container.clientHeight);
    const boxSize = Math.min(width, height);
    
    window.textScale = Math.max(0.2, Math.min(2, boxSize / maxSize * 2));
    
    // تحديث شريط التحكم
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        const newValue = Math.round(window.textScale * 50);
        fontSizeSlider.value = Math.max(10, Math.min(100, newValue));
        const display = document.getElementById('fontSizeDisplay');
        if (display) {
            display.textContent = fontSizeSlider.value;
        }
    }
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
}

function showTextBox() {
    const textBox = document.getElementById('textBox');
    const container = document.querySelector('.canvas-wrapper-fixed');
    const canvas = document.getElementById('canvas');
    
    if (!textBox || !container || !canvas) return;
    
    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // تحديد الحجم الابتدائي للمربع
    const boxSize = Math.min(containerRect.width, containerRect.height) * 0.4;
    
    // تحديد الموضع المركزي
    const left = (containerRect.width - boxSize) / 2;
    const top = (containerRect.height - boxSize) / 2;
    
    textBox.style.width = boxSize + 'px';
    textBox.style.height = boxSize + 'px';
    textBox.style.left = left + 'px';
    textBox.style.top = top + 'px';
    textBox.style.display = 'block';
    
    textBoxVisible = true;
    
    // تحديث موقع النص ليكون في المركز
    textX = 0.5;
    textY = 0.5;
    window.textScale = 1;
    
    // تحديث شريط التحكم
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        fontSizeSlider.value = 50;
        const display = document.getElementById('fontSizeDisplay');
        if (display) {
            display.textContent = '50';
        }
    }
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
}

function hideTextBox() {
    const textBox = document.getElementById('textBox');
    if (textBox) {
        textBox.style.display = 'none';
        textBoxVisible = false;
    }
}

function updateTextBoxPosition() {
    if (!textBoxVisible || !window.currentText) return;
    
    const textBox = document.getElementById('textBox');
    const container = document.querySelector('.canvas-wrapper-fixed');
    const canvas = document.getElementById('canvas');
    
    if (!textBox || !container || !canvas) return;
    
    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // حساب موقع المربع بناءً على موقع النص
    const boxSize = Math.min(containerRect.width, containerRect.height) * 0.4 * window.textScale;
    const centerX = textX * canvasRect.width;
    const centerY = textY * canvasRect.height;
    
    const left = centerX - boxSize / 2;
    const top = centerY - boxSize / 2;
    
    textBox.style.width = boxSize + 'px';
    textBox.style.height = boxSize + 'px';
    textBox.style.left = left + 'px';
    textBox.style.top = top + 'px';
}

// إعداد مربع اللون الأبيض
function setupWhiteColorBox() {
    const whiteBox = document.getElementById('whiteColorBox');
    if (!whiteBox) return;
    
    whiteBox.addEventListener('click', () => {
        // عرض ألوان لاختيار لون جديد للمربع
        showColorPickerForWhiteBox();
    });
}

function showColorPickerForWhiteBox() {
    // إنشاء لوحة اختيار الألوان
    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker-popup';
    colorPicker.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg);
        border-radius: 20px;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    colorPicker.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: var(--text-color);">اختر لون المربع الأبيض</h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-color); font-size: 24px; cursor: pointer;">
                ×
            </button>
        </div>
        <div class="color-picker-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
            ${COLORS.map(color => `
                <div class="color-picker-item" style="
                    width: 40px;
                    height: 40px;
                    background-color: ${color};
                    border-radius: 8px;
                    cursor: pointer;
                    border: 2px solid ${color === window.currentWhiteBoxColor ? 'var(--primary-color)' : 'transparent'};
                    transition: transform 0.2s;
                " onclick="selectWhiteBoxColor('${color}')" title="${color}"></div>
            `).join('')}
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <input type="color" id="customWhiteBoxColor" style="width: 100%; height: 50px; cursor: pointer;" 
                   value="${window.currentWhiteBoxColor || '#FFFFFF'}" 
                   onchange="selectCustomWhiteBoxColor(this.value)">
        </div>
    `;
    
    document.body.appendChild(colorPicker);
}

function selectWhiteBoxColor(color) {
    window.currentWhiteBoxColor = color;
    
    // تحديث لون المربع
    const whiteBox = document.getElementById('whiteColorBox');
    if (whiteBox) {
        whiteBox.style.backgroundColor = color;
        
        // تغيير لون النص بناءً على لون الخلفية
        const rgb = hexToRgb(color);
        if (rgb) {
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            whiteBox.querySelector('span').style.color = brightness > 128 ? '#333' : '#fff';
        }
    }
    
    // إغلاق منتقي الألوان
    const colorPicker = document.querySelector('.color-picker-popup');
    if (colorPicker) {
        colorPicker.remove();
    }
    
    // تطبيق اللون على الخلفية
    setBackgroundColor(color);
}

function selectCustomWhiteBoxColor(color) {
    selectWhiteBoxColor(color);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// زر إعادة التعيين
function resetAllEdits() {
    if (confirm('هل تريد مسح جميع التعديلات والعودة إلى الصورة الأصلية؟')) {
        // إعادة تعيين جميع المتغيرات
        window.currentText = '';
        window.textScale = 1;
        window.textRotation = 0;
        
        // إعادة تعيين إعدادات الصورة
        if (typeof window.imageBlur !== 'undefined') window.imageBlur = 0;
        if (typeof window.imageRotation !== 'undefined') window.imageRotation = 0;
        if (typeof window.imageFlipH !== 'undefined') window.imageFlipH = false;
        if (typeof window.imageFlipV !== 'undefined') window.imageFlipV = false;
        if (typeof window.imageBorderWidth !== 'undefined') window.imageBorderWidth = 0;
        if (typeof window.currentFilter !== 'undefined') window.currentFilter = 'none';
        
        // إعادة تعيين الألوان
        if (typeof window.currentTextColor !== 'undefined') window.currentTextColor = '#FFFFFF';
        if (typeof window.currentStrokeColor !== 'undefined') window.currentStrokeColor = '#000000';
        if (typeof window.currentCardColor !== 'undefined') window.currentCardColor = '#000000';
        if (typeof window.currentBorderColor !== 'undefined') window.currentBorderColor = '#000000';
        if (typeof window.currentBackgroundColor !== 'undefined') window.currentBackgroundColor = '#FFFFFF';
        if (typeof window.currentWhiteBoxColor !== 'undefined') window.currentWhiteBoxColor = '#FFFFFF';
        
        // إعادة تعيين مربع النص
        hideTextBox();
        
        // إعادة تعيين عناصر التحكم
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = 50;
            document.getElementById('fontSizeDisplay').textContent = '50';
        }
        
        const blurSlider = document.getElementById('blurSlider');
        if (blurSlider) {
            blurSlider.value = 0;
            document.getElementById('blurDisplay').textContent = '0';
        }
        
        const borderSlider = document.getElementById('borderSlider');
        if (borderSlider) {
            borderSlider.value = 0;
            document.getElementById('borderDisplay').textContent = '0';
        }
        
        const strokeWidth = document.getElementById('strokeWidth');
        if (strokeWidth) {
            strokeWidth.value = 3;
            document.getElementById('strokeWidthDisplay').textContent = '3';
        }
        
        const shadowSlider = document.getElementById('shadowSlider');
        if (shadowSlider) {
            shadowSlider.value = 5;
            document.getElementById('shadowDisplay').textContent = '5';
        }
        
        const bgOpacitySlider = document.getElementById('bgOpacitySlider');
        if (bgOpacitySlider) {
            bgOpacitySlider.value = 70;
            document.getElementById('bgOpacityDisplay').textContent = '70';
        }
        
        const shadowEnabled = document.getElementById('shadowEnabled');
        if (shadowEnabled) shadowEnabled.checked = true;
        
        const cardEnabled = document.getElementById('cardEnabled');
        if (cardEnabled) cardEnabled.checked = false;
        
        // تحديث واجهة الألوان
        if (typeof initializeColors === 'function') {
            setTimeout(() => {
                initializeColors();
            }, 100);
        }
        
        // إعادة تعيين مربع اللون الأبيض
        const whiteBox = document.getElementById('whiteColorBox');
        if (whiteBox) {
            whiteBox.style.backgroundColor = '#FFFFFF';
            whiteBox.querySelector('span').style.color = '#333';
        }
        
        // إعادة رسم الكانفاس
        if (typeof renderFullCanvas === 'function') {
            setTimeout(() => {
                renderFullCanvas();
            }, 200);
        }
        
        showAlert('✅ تم إعادة تعيين جميع التعديلات', 'success');
    }
}

// تعديل دالة applyTextToImage لإظهار مربع التحكم
function applyTextToImage() {
    const textInput = document.getElementById('textCardInput');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    window.currentText = text;
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
    
    updateDeleteButtonState();
    closeTextCard();
    
    if (text) {
        // إظهار مربع التحكم عند إضافة النص
        showTextBox();
        showAlert('✅ تم إضافة النص إلى الصورة', 'success');
    } else {
        hideTextBox();
        showAlert('✅ تم حذف النص من الصورة', 'success');
    }
    
    console.log('📝 Text applied to image:', text);
}

// تعديل دالة clearTextFromImage لإخفاء مربع التحكم
function clearTextFromImage() {
    window.currentText = '';
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
    
    hideTextBox();
    
    console.log('🗑️ Text cleared from image');
}

// إضافة مستمع للرسم لإظهار/إخفاء مربع التحكم
window.addEventListener('load', () => {
    // محاكاة الدالة الأصلية
    const originalRenderFullCanvas = window.renderFullCanvas;
    if (originalRenderFullCanvas) {
        window.renderFullCanvas = function() {
            const result = originalRenderFullCanvas.apply(this, arguments);
            
            // التحقق مما إذا كان هناك نص لعرض مربع التحكم
            if (window.currentText && window.currentText.trim() !== '') {
                if (!textBoxVisible) {
                    showTextBox();
                } else {
                    updateTextBoxPosition();
                }
            } else {
                hideTextBox();
            }
            
            return result;
        };
    }
});

// الباقي من الدوال الأصلية تبقى كما هي...
// ... [جميع الدوال الأصلية من app.js تبقى كما هي دون تغيير] ...

// تصدير الدوال الجديدة
window.resetAllEdits = resetAllEdits;
window.showTextBox = showTextBox;
window.hideTextBox = hideTextBox;
window.selectWhiteBoxColor = selectWhiteBoxColor;
window.selectCustomWhiteBoxColor = selectCustomWhiteBoxColor;
