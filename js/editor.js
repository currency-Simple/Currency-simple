// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;
let originalImageWidth = 0;
let originalImageHeight = 0;

// متغيرات التحكم باللمس للنص
let isDragging = false;
let isResizing = false;
let startX = 0;
let startY = 0;
let textX = 0.5;
let textY = 0.5;
let textScale = 1;
let textRotation = 0;
let initialDistance = 0;
let initialScale = 1;
let initialAngle = 0;

// متغيرات الملصقات
let canvasStickers = [];
let selectedSticker = null;
let stickerDragging = false;
let stickerStartX = 0;
let stickerStartY = 0;

// متغيرات تأثيرات الصورة
let imageBlur = 0;
let imageRotation = 0;
let imageFlipH = false;
let imageFlipV = false;
let imageBorderWidth = 0;
let imageBorderColor = '#000000';
let currentFilter = 'none';

// متغيرات الخلفية
let backgroundColor = '#FFFFFF';
let backgroundSize = 'original';
let backgroundCanvas = null;
let backgroundCtx = null;

// تصدير imageBorderColor لـ window
window.imageBorderColor = imageBorderColor;

// متغيرات تأثيرات النص
let shadowIntensity = 5;
let bgOpacity = 70;

// الفلاتر المتاحة
const FILTERS = [
    { name: 'بدون فلتر', value: 'none', filter: 'none' },
    { name: 'أبيض وأسود', value: 'grayscale', filter: 'grayscale(100%)' },
    { name: 'سيبيا', value: 'sepia', filter: 'sepia(100%)' },
    { name: 'عكس الألوان', value: 'invert', filter: 'invert(100%)' },
    { name: 'سطوع', value: 'brightness', filter: 'brightness(150%)' },
    { name: 'تباين', value: 'contrast', filter: 'contrast(150%)' },
    { name: 'تشبع', value: 'saturate', filter: 'saturate(200%)' },
    { name: 'تدوير الألوان', value: 'hue', filter: 'hue-rotate(180deg)' },
    { name: 'قديم', value: 'vintage', filter: 'sepia(50%) contrast(120%) brightness(110%)' },
    { name: 'دافئ', value: 'warm', filter: 'sepia(30%) saturate(130%)' },
    { name: 'بارد', value: 'cool', filter: 'hue-rotate(180deg) saturate(120%)' },
    { name: 'حزين', value: 'sad', filter: 'grayscale(50%) brightness(90%)' },
    { name: 'سعيد', value: 'happy', filter: 'saturate(150%) brightness(110%)' },
    { name: 'ليلي', value: 'night', filter: 'brightness(70%) contrast(120%)' },
    { name: 'شروق', value: 'sunrise', filter: 'sepia(20%) saturate(140%) brightness(110%)' }
];

// التحكم المباشر في النص
let directTextActive = false;
let textMoving = false;
let textScaling = false;
let textRotating = false;
let textControls = null;

// ذاكرة مؤقتة لتحسين الأداء
let fontCache = new Map();
let lastRenderTime = 0;
let renderThrottleDelay = 16;
let isRendering = false;

window.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Editor initializing...');
    
    canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('❌ Canvas element not found');
        return;
    }
    
    ctx = canvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // إنشاء عناصر التحكم بالنص المباشر
    setupDirectTextControls();
    
    // إنشاء كانفاس للخلفية
    backgroundCanvas = document.createElement('canvas');
    backgroundCtx = backgroundCanvas.getContext('2d');
    
    // تهيئة القيم من window
    if (window.textScale === undefined) window.textScale = 1;
    if (window.textRotation === undefined) window.textRotation = 0;
    if (window.currentBackgroundColor === undefined) window.currentBackgroundColor = '#FFFFFF';
    if (window.currentBackgroundSize === undefined) window.currentBackgroundSize = 'original';
    
    backgroundColor = window.currentBackgroundColor;
    backgroundSize = window.currentBackgroundSize;
    
    if (typeof initializeFonts === 'function') {
        initializeFonts();
    }
    
    if (typeof initializeColors === 'function') {
        initializeColors();
    }
    
    setupEventListeners();
    setupTouchControls();
    setupImageControls();
    setupTextEffectsControls();
    setupFiltersGrid();
    
    console.log('✅ Editor initialized');
});

function setupDirectTextControls() {
    textControls = document.getElementById('directTextControls');
    if (!textControls) return;
    
    const moveHandle = document.getElementById('textMoveHandle');
    const resizeHandle = document.getElementById('textResizeHandle');
    const rotateHandle = document.getElementById('textRotateHandle');
    
    if (moveHandle) {
        moveHandle.addEventListener('mousedown', startTextMove);
        moveHandle.addEventListener('touchstart', startTextMoveTouch);
    }
    
    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', startTextResize);
        resizeHandle.addEventListener('touchstart', startTextResizeTouch);
    }
    
    if (rotateHandle) {
        rotateHandle.addEventListener('mousedown', startTextRotate);
        rotateHandle.addEventListener('touchstart', startTextRotateTouch);
    }
    
    // إضافة مستمعات عامة للفأرة
    document.addEventListener('mousemove', handleTextControlMove);
    document.addEventListener('mouseup', stopTextControl);
    
    // إضافة مستمعات عامة لللمس
    document.addEventListener('touchmove', handleTextControlMoveTouch);
    document.addEventListener('touchend', stopTextControlTouch);
}

function updateTextControlsPosition() {
    if (!textControls || !window.currentText) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = rect.left + (textX * canvas.width);
    const y = rect.top + (textY * canvas.height);
    
    textControls.style.left = (x - 20) + 'px';
    textControls.style.top = (y - 20) + 'px';
    textControls.style.display = 'block';
    
    directTextActive = true;
}

function hideTextControls() {
    if (textControls) {
        textControls.style.display = 'none';
        directTextActive = false;
    }
}

function startTextMove(e) {
    e.preventDefault();
    textMoving = true;
    startX = e.clientX;
    startY = e.clientY;
}

function startTextMoveTouch(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        textMoving = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }
}

function startTextResize(e) {
    e.preventDefault();
    textScaling = true;
    startX = e.clientX;
    startY = e.clientY;
    initialScale = window.textScale || 1;
}

function startTextResizeTouch(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        textScaling = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        initialScale = window.textScale || 1;
    }
}

function startTextRotate(e) {
    e.preventDefault();
    textRotating = true;
    startX = e.clientX;
    startY = e.clientY;
    initialAngle = window.textRotation || 0;
}

function startTextRotateTouch(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        textRotating = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        initialAngle = window.textRotation || 0;
    }
}

function handleTextControlMove(e) {
    if (!textMoving && !textScaling && !textRotating) return;
    
    e.preventDefault();
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    if (textMoving) {
        const rect = canvas.getBoundingClientRect();
        const newX = (e.clientX - rect.left) / canvas.width;
        const newY = (e.clientY - rect.top) / canvas.height;
        
        textX = Math.max(0.1, Math.min(0.9, newX));
        textY = Math.max(0.1, Math.min(0.9, newY));
        
        updateTextControlsPosition();
        renderFullCanvas();
        
    } else if (textScaling) {
        const scaleDelta = deltaY * -0.01;
        window.textScale = Math.max(0.2, Math.min(3, initialScale + scaleDelta));
        
        // تحديث شريط التحكم
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = Math.round(window.textScale * 50);
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = fontSizeSlider.value;
            }
        }
        
        renderFullCanvas();
        
    } else if (textRotating) {
        const angleDelta = deltaX * 0.5;
        window.textRotation = (initialAngle + angleDelta) % 360;
        renderFullCanvas();
    }
    
    startX = e.clientX;
    startY = e.clientY;
}

function handleTextControlMoveTouch(e) {
    if (!textMoving && !textScaling && !textRotating) return;
    
    e.preventDefault();
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    if (textMoving) {
        const rect = canvas.getBoundingClientRect();
        const newX = (touch.clientX - rect.left) / canvas.width;
        const newY = (touch.clientY - rect.top) / canvas.height;
        
        textX = Math.max(0.1, Math.min(0.9, newX));
        textY = Math.max(0.1, Math.min(0.9, newY));
        
        updateTextControlsPosition();
        renderFullCanvas();
        
    } else if (textScaling) {
        const scaleDelta = deltaY * -0.01;
        window.textScale = Math.max(0.2, Math.min(3, initialScale + scaleDelta));
        
        // تحديث شريط التحكم
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = Math.round(window.textScale * 50);
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = fontSizeSlider.value;
            }
        }
        
        renderFullCanvas();
        
    } else if (textRotating) {
        const angleDelta = deltaX * 0.5;
        window.textRotation = (initialAngle + angleDelta) % 360;
        renderFullCanvas();
    }
    
    startX = touch.clientX;
    startY = touch.clientY;
}

function stopTextControl() {
    textMoving = false;
    textScaling = false;
    textRotating = false;
}

function stopTextControlTouch(e) {
    textMoving = false;
    textScaling = false;
    textRotating = false;
}

function setupTextEffectsControls() {
    const shadowSlider = document.getElementById('shadowSlider');
    if (shadowSlider) {
        let shadowTimeout;
        shadowSlider.addEventListener('input', (e) => {
            shadowIntensity = parseInt(e.target.value);
            const display = document.getElementById('shadowDisplay');
            if (display) display.textContent = shadowIntensity;
            
            clearTimeout(shadowTimeout);
            shadowTimeout = setTimeout(() => {
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            }, 50);
        });
    }
    
    const bgOpacitySlider = document.getElementById('bgOpacitySlider');
    if (bgOpacitySlider) {
        let bgOpacityTimeout;
        bgOpacitySlider.addEventListener('input', (e) => {
            bgOpacity = parseInt(e.target.value);
            const display = document.getElementById('bgOpacityDisplay');
            if (display) display.textContent = bgOpacity;
            
            clearTimeout(bgOpacityTimeout);
            bgOpacityTimeout = setTimeout(() => {
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            }, 50);
        });
    }
}

function setupFiltersGrid() {
    const filtersGrid = document.getElementById('filtersGrid');
    if (!filtersGrid) return;
    
    filtersGrid.innerHTML = '';
    
    FILTERS.forEach(filter => {
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';
        if (filter.value === currentFilter) filterItem.classList.add('selected');
        
        filterItem.innerHTML = `
            <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--primary-color); opacity: 0.7; margin: 0 auto 5px;"></div>
            <span>${filter.name}</span>
        `;
        
        filterItem.onclick = () => {
            document.querySelectorAll('.filter-item').forEach(item => item.classList.remove('selected'));
            filterItem.classList.add('selected');
            applyFilter(filter.value);
        };
        
        filtersGrid.appendChild(filterItem);
    });
}

function setupImageControls() {
    const uploadBtn = document.getElementById('uploadImageBtn');
    const uploadInput = document.getElementById('uploadImageInput');
    
    if (uploadBtn && uploadInput) {
        uploadBtn.addEventListener('click', () => uploadInput.click());
        uploadInput.addEventListener('change', handleImageUpload);
    }
    
    const blurSlider = document.getElementById('blurSlider');
    if (blurSlider) {
        let blurTimeout;
        blurSlider.addEventListener('input', (e) => {
            imageBlur = parseInt(e.target.value);
            const display = document.getElementById('blurDisplay');
            if (display) display.textContent = imageBlur;
            
            clearTimeout(blurTimeout);
            blurTimeout = setTimeout(() => renderFullCanvas(), 50);
        });
    }
    
    const borderSlider = document.getElementById('borderSlider');
    if (borderSlider) {
        let borderTimeout;
        borderSlider.addEventListener('input', (e) => {
            imageBorderWidth = parseInt(e.target.value);
            const display = document.getElementById('borderDisplay');
            if (display) display.textContent = imageBorderWidth;
            
            adjustImageForBorder();
            clearTimeout(borderTimeout);
            borderTimeout = setTimeout(() => renderFullCanvas(), 50);
        });
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showAlert('يرجى اختيار ملف صورة', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        loadImageToEditor(event.target.result);
        showAlert('تم رفع الصورة بنجاح', 'success');
    };
    reader.readAsDataURL(file);
}

function rotateImage() {
    imageRotation = (imageRotation + 90) % 360;
    renderFullCanvas();
    showAlert('تم تدوير الصورة', 'success');
}

function flipImageH() {
    imageFlipH = !imageFlipH;
    renderFullCanvas();
    showAlert('تم قلب الصورة أفقياً', 'success');
}

function flipImageV() {
    imageFlipV = !imageFlipV;
    renderFullCanvas();
    showAlert('تم قلب الصورة عمودياً', 'success');
}

function applyFilter(filterName) {
    currentFilter = filterName;
    renderFullCanvas();
    
    const filter = FILTERS.find(f => f.value === filterName);
    const filterDisplay = filter ? filter.name : 'بدون فلتر';
    showAlert(`تم تطبيق فلتر: ${filterDisplay}`, 'success');
}

// دالة إعادة تعيين المحرر
function resetEditor() {
    if (!confirm('هل تريد إعادة تعيين المحرر؟ ستفقد جميع التغييرات غير المحفوظة.')) {
        return;
    }
    
    // إعادة تعيين جميع المتغيرات
    window.currentText = '';
    window.textScale = 1;
    window.textRotation = 0;
    window.currentTextColor = "#FFFFFF";
    window.currentStrokeColor = "#000000";
    window.currentCardColor = "#000000";
    window.currentBorderColor = "#000000";
    window.currentBackgroundColor = "#FFFFFF";
    window.currentBackgroundSize = "original";
    
    // إعادة تعيين متغيرات المحرر
    imageBlur = 0;
    imageRotation = 0;
    imageFlipH = false;
    imageFlipV = false;
    imageBorderWidth = 0;
    imageBorderColor = '#000000';
    currentFilter = 'none';
    canvasStickers = [];
    backgroundColor = '#FFFFFF';
    backgroundSize = 'original';
    
    textX = 0.5;
    textY = 0.5;
    
    // إعادة تعيين واجهة المستخدم
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        fontSizeSlider.value = 50;
        const display = document.getElementById('fontSizeDisplay');
        if (display) {
            display.textContent = '50';
        }
    }
    
    const blurSlider = document.getElementById('blurSlider');
    if (blurSlider) blurSlider.value = 0;
    
    const borderSlider = document.getElementById('borderSlider');
    if (borderSlider) borderSlider.value = 0;
    
    const shadowSlider = document.getElementById('shadowSlider');
    if (shadowSlider) shadowSlider.value = 5;
    
    const bgOpacitySlider = document.getElementById('bgOpacitySlider');
    if (bgOpacitySlider) bgOpacitySlider.value = 70;
    
    const shadowEnabled = document.getElementById('shadowEnabled');
    if (shadowEnabled) shadowEnabled.checked = true;
    
    const cardEnabled = document.getElementById('cardEnabled');
    if (cardEnabled) cardEnabled.checked = false;
    
    // إعادة تعيين الألوان في الواجهة
    if (typeof initializeColors === 'function') {
        initializeColors();
    }
    
    // إعادة تعيين الفلاتر
    if (typeof setupFiltersGrid === 'function') {
        setupFiltersGrid();
    }
    
    // إخفاء عناصر التحكم بالنص
    hideTextControls();
    
    // إعادة رسم الكانفاس
    if (currentImage) {
        renderFullCanvas();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    showAlert('تم إعادة تعيين المحرر بنجاح', 'success');
    console.log('🔄 تم إعادة تعيين المحرر');
}

function setupEventListeners() {
    const strokeWidth = document.getElementById('strokeWidth');
    const shadowEnabled = document.getElementById('shadowEnabled');
    const cardEnabled = document.getElementById('cardEnabled');

    if (strokeWidth) {
        let strokeTimeout;
        strokeWidth.addEventListener('input', (e) => {
            const display = document.getElementById('strokeWidthDisplay');
            if (display) {
                display.textContent = e.target.value;
            }
            
            clearTimeout(strokeTimeout);
            strokeTimeout = setTimeout(() => {
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            }, 50);
        });
    }
    
    if (shadowEnabled) {
        shadowEnabled.addEventListener('change', () => {
            if (window.currentText && window.currentText.trim() !== '') {
                renderFullCanvas();
            }
        });
    }
    
    if (cardEnabled) {
        cardEnabled.addEventListener('change', () => {
            if (window.currentText && window.currentText.trim() !== '') {
                renderFullCanvas();
            }
        });
    }

    // إعداد شريط حجم النص للتحديث الفوري
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = value;
            }
            
            // تحديث حجم النص فوراً
            window.textScale = value / 50;
            if (window.currentText && window.currentText.trim() !== '') {
                renderFullCanvas();
            }
        });
    }
    
    // إضافة مستمع للنقر خارج عناصر التحكم لإخفائها
    document.addEventListener('click', (e) => {
        if (directTextActive && textControls && !textControls.contains(e.target)) {
            hideTextControls();
        }
    });
}

function setupTouchControls() {
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    canvas.addEventListener('mousedown', (e) => {
        const touch = { clientX: e.clientX, clientY: e.clientY };
        handleTouchStart({ touches: [touch], preventDefault: () => e.preventDefault() });
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging || isResizing || stickerDragging) {
            const touch = { clientX: e.clientX, clientY: e.clientY };
            handleTouchMove({ touches: [touch], preventDefault: () => e.preventDefault() });
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        handleTouchEnd({ preventDefault: () => e.preventDefault() });
    });
    
    // النقر على الكانفاس لإظهار/إخفاء عناصر التحكم بالنص
    canvas.addEventListener('click', (e) => {
        if (window.currentText && window.currentText.trim() !== '') {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / canvas.width;
            const y = (e.clientY - rect.top) / canvas.height;
            
            // حساب إذا كان النقر بالقرب من النص
            const textCenterX = textX;
            const textCenterY = textY;
            const distance = Math.sqrt(Math.pow(x - textCenterX, 2) + Math.pow(y - textCenterY, 2));
            
            if (distance < 0.2) { // إذا كان النقر بالقرب من النص
                updateTextControlsPosition();
            } else if (directTextActive) {
                hideTextControls();
            }
        }
    });
}

function handleTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / canvas.width;
        const y = (touch.clientY - rect.top) / canvas.height;
        
        // التحقق من النقر على الملصقات أولاً
        for (let i = canvasStickers.length - 1; i >= 0; i--) {
            const sticker = canvasStickers[i];
            if (isTouchOnSticker(x * canvas.width, y * canvas.height, sticker)) {
                selectedSticker = sticker;
                stickerDragging = true;
                stickerStartX = x * canvas.width - sticker.x;
                stickerStartY = y * canvas.height - sticker.y;
                renderFullCanvas();
                return;
            }
        }
        
        // التحقق من النقر على النص
        if (window.currentText && window.currentText.trim() !== '') {
            const textCenterX = textX;
            const textCenterY = textY;
            const distance = Math.sqrt(Math.pow(x - textCenterX, 2) + Math.pow(y - textCenterY, 2));
            
            if (distance < 0.2) { // إذا كان اللمس بالقرب من النص
                updateTextControlsPosition();
                isDragging = true;
                startX = touch.clientX;
                startY = touch.clientY;
            } else {
                hideTextControls();
            }
        }
    } else if (e.touches.length === 2 && window.currentText) {
        isDragging = false;
        isResizing = true;
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialScale = window.textScale || 1;
        initialAngle = Math.atan2(dy, dx);
        
        console.log('🔍 بدء التكبير/التصغير - المسافة الأولية:', initialDistance);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastRenderTime < renderThrottleDelay) {
        return;
    }
    
    if (isRendering) {
        return;
    }
    
    if (stickerDragging && selectedSticker) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        selectedSticker.x = x - stickerStartX;
        selectedSticker.y = y - stickerStartY;
        
        lastRenderTime = now;
        renderFullCanvas();
        return;
    }
    
    if (e.touches.length === 1 && isDragging && !isResizing) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0.1, Math.min(0.9, (touch.clientX - rect.left) / canvas.width));
        const y = Math.max(0.1, Math.min(0.9, (touch.clientY - rect.top) / canvas.height));
        
        textX = x;
        textY = y;
        
        updateTextControlsPosition();
        lastRenderTime = now;
        renderFullCanvas();
        
    } else if (e.touches.length === 2 && isResizing) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const currentAngle = Math.atan2(dy, dx);
        
        // حساب التكبير/التصغير
        if (initialDistance > 0) {
            const scaleMultiplier = currentDistance / initialDistance;
            window.textScale = Math.max(0.2, Math.min(3, initialScale * scaleMultiplier));
            
            // تحديث شريط التحكم
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            if (fontSizeSlider) {
                const newValue = Math.round(window.textScale * 50);
                fontSizeSlider.value = Math.max(10, Math.min(150, newValue));
                const display = document.getElementById('fontSizeDisplay');
                if (display) {
                    display.textContent = fontSizeSlider.value;
                }
            }
        }
        
        // حساب التدوير
        const angleChange = currentAngle - initialAngle;
        window.textRotation = (window.textRotation + angleChange * (180 / Math.PI)) % 360;
        initialAngle = currentAngle;
        
        lastRenderTime = now;
        renderFullCanvas();
        
        console.log('📏 حجم النص:', window.textScale.toFixed(2));
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    if (isResizing) {
        console.log('🔍 انتهى التكبير/التصغير - الحجم النهائي:', window.textScale.toFixed(2));
    }
    
    isDragging = false;
    isResizing = false;
    stickerDragging = false;
    selectedSticker = null;
    initialDistance = 0;
    initialScale = 1;
    initialAngle = 0;
}

function isTouchOnSticker(x, y, sticker) {
    return x >= sticker.x && x <= sticker.x + sticker.width &&
           y >= sticker.y && y <= sticker.y + sticker.height;
}

function addSticker(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        const maxSize = canvas.width * 0.3;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        
        const sticker = {
            img: img,
            x: canvas.width / 2 - (img.width * scale) / 2,
            y: canvas.height / 2 - (img.height * scale) / 2,
            width: img.width * scale,
            height: img.height * scale,
            rotation: 0
        };
        
        canvasStickers.push(sticker);
        renderFullCanvas();
    };
    img.src = url;
}

function deleteSelectedSticker() {
    if (selectedSticker) {
        const index = canvasStickers.indexOf(selectedSticker);
        if (index > -1) {
            canvasStickers.splice(index, 1);
            selectedSticker = null;
            renderFullCanvas();
            showAlert('تم حذف الملصق', 'success');
        }
    }
}

function updateTextOnCanvas() {
    if (window.currentText && window.currentText.trim() !== '') {
        renderFullCanvas();
    }
}

function calculateCanvasDimensions() {
    const container = document.querySelector('.canvas-wrapper-fixed');
    if (!container) return { width: 800, height: 600 };
    
    const containerWidth = container.clientWidth - 30;
    const containerHeight = container.clientHeight - 30;
    
    let targetWidth = containerWidth;
    let targetHeight = containerHeight;
    
    // حساب الأبعاد بناءً على حجم الخلفية
    if (backgroundSize !== 'original' && backgroundSize !== 'cover') {
        if (backgroundSize.includes(':')) {
            const [widthRatio, heightRatio] = backgroundSize.split(':').map(Number);
            const aspectRatio = widthRatio / heightRatio;
            
            if (targetWidth / targetHeight > aspectRatio) {
                targetWidth = targetHeight * aspectRatio;
            } else {
                targetHeight = targetWidth / aspectRatio;
            }
        }
    } else if (backgroundSize === 'cover' && currentImage) {
        const imageAspect = originalImageWidth / originalImageHeight;
        if (targetWidth / targetHeight > imageAspect) {
            targetHeight = targetWidth / imageAspect;
        } else {
            targetWidth = targetHeight * imageAspect;
        }
    } else if (backgroundSize === 'original' && currentImage) {
        // استخدام الأبعاد الأصلية مع التكبير للاستفادة من المساحة المتاحة
        const widthRatio = targetWidth / originalImageWidth;
        const heightRatio = targetHeight / originalImageHeight;
        const scale = Math.min(widthRatio, heightRatio, 1);
        
        targetWidth = originalImageWidth * scale;
        targetHeight = originalImageHeight * scale;
    }
    
    // إضافة مساحة للحواف
    const borderSpace = imageBorderWidth * 2;
    targetWidth = Math.max(300, Math.min(targetWidth, containerWidth)) + borderSpace;
    targetHeight = Math.max(200, Math.min(targetHeight, containerHeight)) + borderSpace;
    
    return { width: Math.round(targetWidth), height: Math.round(targetHeight) };
}

function adjustImageForBorder() {
    if (!currentImage || !imageLoaded) return;
    
    const dimensions = calculateCanvasDimensions();
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    canvas.style.width = dimensions.width + 'px';
    canvas.style.height = dimensions.height + 'px';
    
    // تحديث موقع عناصر التحكم بالنص
    if (directTextActive) {
        updateTextControlsPosition();
    }
}

function loadImageToEditor(imageUrl) {
    console.log('🖼️ Loading image to editor:', imageUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        console.log('✅ Image loaded successfully');
        
        currentImage = img;
        imageLoaded = true;
        
        originalImageWidth = img.naturalWidth || img.width;
        originalImageHeight = img.naturalHeight || img.height;
        
        console.log('📐 Original image dimensions:', originalImageWidth, 'x', originalImageHeight);
        
        adjustImageForBorder();
        
        // إعادة تعيين التعديلات
        imageBlur = 0;
        imageRotation = 0;
        imageFlipH = false;
        imageFlipV = false;
        imageBorderWidth = 0;
        currentFilter = 'none';
        canvasStickers = [];
        
        textX = 0.5;
        textY = 0.5;
        window.textScale = 1;
        window.textRotation = 0;
        
        // تحديث شريط التحكم
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = 50;
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = '50';
            }
        }
        
        // إعادة تعيين الفلاتر
        if (typeof setupFiltersGrid === 'function') {
            setupFiltersGrid();
        }
        
        renderFullCanvas();
        
        console.log(`📱 Display dimensions: ${canvas.width}x${canvas.height}`);
        
        // إخفاء عناصر التحكم بالنص
        hideTextControls();
    };
    
    img.onerror = function(error) {
        console.error('❌ Failed to load image:', error);
        showAlert('فشل تحميل الصورة. الرجاء المحاولة مرة أخرى.', 'error');
    };
    
    img.src = imageUrl;
}

function renderFullCanvas() {
    if (isRendering) return;
    
    const now = Date.now();
    if (now - lastRenderTime < renderThrottleDelay) {
        return;
    }
    
    isRendering = true;
    
    try {
        // تنظيف الكانفاس
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // رسم الخلفية أولاً
        if (backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        if (imageLoaded && currentImage) {
            ctx.save();
            
            const borderSpace = imageBorderWidth;
            let imageWidth = canvas.width - (borderSpace * 2);
            let imageHeight = canvas.height - (borderSpace * 2);
            
            // ضبط حجم الصورة بناءً على حجم الخلفية
            if (backgroundSize === 'cover') {
                const imageAspect = originalImageWidth / originalImageHeight;
                const canvasAspect = imageWidth / imageHeight;
                
                if (canvasAspect > imageAspect) {
                    imageHeight = imageWidth / imageAspect;
                } else {
                    imageWidth = imageHeight * imageAspect;
                }
            } else if (backgroundSize !== 'original' && backgroundSize.includes(':')) {
                const [widthRatio, heightRatio] = backgroundSize.split(':').map(Number);
                const aspectRatio = widthRatio / heightRatio;
                
                if (imageWidth / imageHeight > aspectRatio) {
                    imageHeight = imageWidth / aspectRatio;
                } else {
                    imageWidth = imageHeight * aspectRatio;
                }
            }
            
            // حساب موضع الصورة في المنتصف
            const x = (canvas.width - imageWidth) / 2;
            const y = (canvas.height - imageHeight) / 2;
            
            ctx.translate(x + imageWidth / 2, y + imageHeight / 2);
            ctx.rotate(imageRotation * Math.PI / 180);
            
            if (imageFlipH) ctx.scale(-1, 1);
            if (imageFlipV) ctx.scale(1, -1);
            
            if (imageBlur > 0) {
                ctx.filter = `blur(${imageBlur}px)`;
            }
            
            // تطبيق الفلتر
            if (currentFilter !== 'none') {
                const filterObj = FILTERS.find(f => f.value === currentFilter);
                if (filterObj) {
                    const currentFilterValue = ctx.filter !== 'none' ? ctx.filter + ' ' : '';
                    ctx.filter = currentFilterValue + filterObj.filter;
                }
            }
            
            // استخدام جودة عالية
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(currentImage, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
            ctx.filter = 'none';
            ctx.restore();
            
            if (imageBorderWidth > 0) {
                ctx.strokeStyle = imageBorderColor;
                ctx.lineWidth = imageBorderWidth;
                ctx.lineCap = 'square';
                ctx.lineJoin = 'miter';
                
                ctx.strokeRect(
                    imageBorderWidth / 2,
                    imageBorderWidth / 2,
                    canvas.width - imageBorderWidth,
                    canvas.height - imageBorderWidth
                );
            }
        }
        
        canvasStickers.forEach(sticker => {
            ctx.save();
            ctx.translate(sticker.x + sticker.width / 2, sticker.y + sticker.height / 2);
            ctx.rotate(sticker.rotation * Math.PI / 180);
            ctx.drawImage(sticker.img, -sticker.width / 2, -sticker.height / 2, sticker.width, sticker.height);
            
            if (sticker === selectedSticker) {
                ctx.strokeStyle = '#0a84ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(-sticker.width / 2, -sticker.height / 2, sticker.width, sticker.height);
            }
            ctx.restore();
        });
        
        if (window.currentText && window.currentText.trim() !== '') {
            renderTextContent();
        }
        
    } catch (error) {
        console.error('❌ Error rendering canvas:', error);
    } finally {
        isRendering = false;
        lastRenderTime = now;
    }
}

function renderTextContent() {
    const fontFamily = window.currentFontFamily || "'ABeeZee', sans-serif";
    const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
    const shadowEnabled = document.getElementById('shadowEnabled')?.checked !== false;
    const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
    const text = window.currentText || '';
    
    const textColor = window.currentTextColor || '#FFFFFF';
    const strokeColor = window.currentStrokeColor || '#000000';
    const cardColor = window.currentCardColor || '#000000';
    
    // حساب حجم الخط الأساسي بناءً على حجم الكانفاس
    const baseFontSize = Math.min(canvas.width, canvas.height) * 0.08;
    let finalFontSize = baseFontSize * (window.textScale || 1);
    
    const fontKey = `${fontFamily}_${finalFontSize}`;
    if (!fontCache.has(fontKey)) {
        ctx.font = 'bold ' + finalFontSize + 'px ' + fontFamily;
        fontCache.set(fontKey, true);
    } else {
        ctx.font = 'bold ' + finalFontSize + 'px ' + fontFamily;
    }
    
    ctx.save();
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.direction = 'rtl';
    
    const maxLineWidth = canvas.width * 0.9;
    const lines = wrapText(text, maxLineWidth, ctx, finalFontSize);
    
    let adjustedFontSize = finalFontSize;
    let adjustedLines = lines;
    
    for (let i = 0; i < 5; i++) {
        const maxWidth = Math.max(...adjustedLines.map(line => ctx.measureText(line).width));
        if (maxWidth <= maxLineWidth) {
            break;
        }
        adjustedFontSize -= Math.max(1, Math.floor(adjustedFontSize * 0.05));
        ctx.font = 'bold ' + adjustedFontSize + 'px ' + fontFamily;
        adjustedLines = wrapText(text, maxLineWidth, ctx, adjustedFontSize);
    }
    
    const lineHeight = adjustedFontSize * 1.4;
    const totalHeight = adjustedLines.length * lineHeight;
    const centerX = textX * canvas.width;
    const centerY = textY * canvas.height;
    
    ctx.translate(centerX, centerY);
    ctx.rotate((window.textRotation || 0) * Math.PI / 180);
    
    if (shadowEnabled) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = shadowIntensity;
        ctx.shadowOffsetX = shadowIntensity / 2;
        ctx.shadowOffsetY = shadowIntensity / 2;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    adjustedLines.forEach((line, index) => {
        const y = -(totalHeight / 2) + (index * lineHeight) + (lineHeight / 2);
        const x = 0;
        
        const textMetrics = ctx.measureText(line);
        
        if (cardEnabled) {
            const padding = adjustedFontSize * 0.5;
            const bgWidth = textMetrics.width + (padding * 2);
            const bgHeight = adjustedFontSize + padding;
            const bgX = -(bgWidth / 2);
            const bgY = y - (adjustedFontSize / 2) - (padding / 2);
            
            ctx.save();
            ctx.fillStyle = cardColor;
            ctx.globalAlpha = bgOpacity / 100;
            ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
            ctx.restore();
        }
        
        if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(line, x, y);
        }
        
        ctx.fillStyle = textColor;
        ctx.fillText(line, x, y);
    });
    
    ctx.restore();
}

function wrapText(text, maxWidth, ctx, fontSize) {
    if (!text) return [];
    
    const cacheKey = `${text}_${maxWidth}_${fontSize}`;
    if (fontCache.has(cacheKey)) {
        return fontCache.get(cacheKey);
    }
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    fontCache.set(cacheKey, lines);
    return lines;
}

function prepareImageForExport() {
    const exportCanvas = document.createElement('canvas');
    
    // استخدام الأبعاد الأصلية للصورة
    let exportWidth = originalImageWidth;
    let exportHeight = originalImageHeight;
    
    // ضبط الحجم بناءً على حجم الخلفية المختار
    if (backgroundSize !== 'original') {
        if (backgroundSize === 'cover') {
            exportWidth = Math.max(originalImageWidth, 1920);
            exportHeight = Math.max(originalImageHeight, 1080);
        } else if (backgroundSize.includes(':')) {
            const [widthRatio, heightRatio] = backgroundSize.split(':').map(Number);
            const aspectRatio = widthRatio / heightRatio;
            
            exportWidth = Math.max(originalImageWidth, 1200);
            exportHeight = Math.round(exportWidth / aspectRatio);
        } else {
            exportWidth = Math.max(originalImageWidth, 1200);
            exportHeight = Math.max(originalImageHeight, 800);
        }
    }
    
    const borderSpace = imageBorderWidth;
    exportCanvas.width = exportWidth + (borderSpace * 2);
    exportCanvas.height = exportHeight + (borderSpace * 2);
    
    const exportCtx = exportCanvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';
    
    // رسم الخلفية أولاً
    if (backgroundColor !== 'transparent') {
        exportCtx.fillStyle = backgroundColor;
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }
    
    exportCtx.save();
    
    let imageWidth = exportWidth;
    let imageHeight = exportHeight;
    
    // ضبط حجم الصورة بناءً على حجم الخلفية
    if (backgroundSize === 'cover') {
        const imageAspect = originalImageWidth / originalImageHeight;
        const canvasAspect = imageWidth / imageHeight;
        
        if (canvasAspect > imageAspect) {
            imageHeight = imageWidth / imageAspect;
        } else {
            imageWidth = imageHeight * imageAspect;
        }
    } else if (backgroundSize !== 'original' && backgroundSize.includes(':')) {
        const [widthRatio, heightRatio] = backgroundSize.split(':').map(Number);
        const aspectRatio = widthRatio / heightRatio;
        
        if (imageWidth / imageHeight > aspectRatio) {
            imageHeight = imageWidth / aspectRatio;
        } else {
            imageWidth = imageHeight * aspectRatio;
        }
    }
    
    // حساب موضع الصورة في المنتصف
    const x = (exportCanvas.width - imageWidth) / 2;
    const y = (exportCanvas.height - imageHeight) / 2;
    
    exportCtx.translate(x + imageWidth / 2, y + imageHeight / 2);
    exportCtx.rotate(imageRotation * Math.PI / 180);
    
    if (imageFlipH) exportCtx.scale(-1, 1);
    if (imageFlipV) exportCtx.scale(1, -1);
    
    if (imageBlur > 0) {
        exportCtx.filter = `blur(${imageBlur}px)`;
    }
    
    if (currentFilter !== 'none') {
        const filterObj = FILTERS.find(f => f.value === currentFilter);
        if (filterObj) {
            const currentFilterValue = exportCtx.filter !== 'none' ? exportCtx.filter + ' ' : '';
            exportCtx.filter = currentFilterValue + filterObj.filter;
        }
    }
    
    exportCtx.drawImage(currentImage, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    
    exportCtx.filter = 'none';
    exportCtx.restore();
    
    if (borderSpace > 0) {
        exportCtx.strokeStyle = imageBorderColor;
        exportCtx.lineWidth = borderSpace;
        exportCtx.lineCap = 'square';
        exportCtx.lineJoin = 'miter';
        
        exportCtx.strokeRect(
            borderSpace / 2,
            borderSpace / 2,
            exportCanvas.width - borderSpace,
            exportCanvas.height - borderSpace
        );
    }
    
    canvasStickers.forEach(sticker => {
        exportCtx.save();
        const scaleX = exportCanvas.width / canvas.width;
        const scaleY = exportCanvas.height / canvas.height;
        const x = sticker.x * scaleX;
        const y = sticker.y * scaleY;
        const w = sticker.width * scaleX;
        const h = sticker.height * scaleY;
        exportCtx.translate(x + w / 2, y + h / 2);
        exportCtx.rotate(sticker.rotation * Math.PI / 180);
        exportCtx.drawImage(sticker.img, -w / 2, -h / 2, w, h);
        exportCtx.restore();
    });
    
    if (window.currentText && window.currentText.trim() !== '') {
        exportCtx.save();
        
        const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
        const shadowEnabled = document.getElementById('shadowEnabled')?.checked !== false;
        const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
        const fontFamily = window.currentFontFamily || "'ABeeZee', sans-serif";
        
        const textColor = window.currentTextColor || '#FFFFFF';
        const strokeColor = window.currentStrokeColor || '#000000';
        const cardColor = window.currentCardColor || '#000000';
        
        const baseFontSize = Math.min(exportCanvas.width, exportCanvas.height) * 0.08;
        const scaledFontSize = baseFontSize * (window.textScale || 1);
        
        exportCtx.font = 'bold ' + scaledFontSize + 'px ' + fontFamily;
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        exportCtx.direction = 'rtl';
        
        const maxLineWidth = exportCanvas.width * 0.9;
        const lines = wrapText(window.currentText, maxLineWidth, exportCtx, scaledFontSize);
        
        const lineHeight = scaledFontSize * 1.4;
        const totalHeight = lines.length * lineHeight;
        const centerX = textX * exportCanvas.width;
        const centerY = textY * exportCanvas.height;
        
        exportCtx.translate(centerX, centerY);
        exportCtx.rotate((window.textRotation || 0) * Math.PI / 180);
        
        if (shadowEnabled) {
            exportCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            exportCtx.shadowBlur = shadowIntensity;
            exportCtx.shadowOffsetX = shadowIntensity / 2;
            exportCtx.shadowOffsetY = shadowIntensity / 2;
        }
        
        lines.forEach((line, index) => {
            const y = -(totalHeight / 2) + (index * lineHeight) + (lineHeight / 2);
            const x = 0;
            
            const textMetrics = exportCtx.measureText(line);
            
            if (cardEnabled) {
                const padding = scaledFontSize * 0.5;
                const bgWidth = textMetrics.width + (padding * 2);
                const bgHeight = scaledFontSize + padding;
                const bgX = -(bgWidth / 2);
                const bgY = y - (scaledFontSize / 2) - (padding / 2);
                
                exportCtx.save();
                exportCtx.fillStyle = cardColor;
                exportCtx.globalAlpha = bgOpacity / 100;
                exportCtx.fillRect(bgX, bgY, bgWidth, bgHeight);
                exportCtx.restore();
            }
            
            if (strokeWidth > 0) {
                exportCtx.strokeStyle = strokeColor;
                exportCtx.lineWidth = strokeWidth;
                exportCtx.strokeText(line, x, y);
            }
            
            exportCtx.fillStyle = textColor;
            exportCtx.fillText(line, x, y);
        });
        
        exportCtx.restore();
    }
    
    return exportCanvas;
}

function setBorderColor(color) {
    imageBorderColor = color;
    window.imageBorderColor = color;
    console.log('🎨 تم تغيير لون حواف الصورة إلى:', color);
    renderFullCanvas();
}

// دالة جديدة لتحديث الخلفية
function updateBackground() {
    backgroundColor = window.currentBackgroundColor || '#FFFFFF';
    backgroundSize = window.currentBackgroundSize || 'original';
    adjustImageForBorder();
    renderFullCanvas();
}

// تصدير جميع الدوال المهمة
window.prepareImageForExport = prepareImageForExport;
window.renderFullCanvas = renderFullCanvas;
window.renderTextOnCanvas = renderFullCanvas;
window.updateTextOnCanvas = updateTextOnCanvas;
window.loadImageToEditor = loadImageToEditor;
window.addSticker = addSticker;
window.deleteSelectedSticker = deleteSelectedSticker;
window.rotateImage = rotateImage;
window.flipImageH = flipImageH;
window.flipImageV = flipImageV;
window.applyFilter = applyFilter;
window.setBorderColor = setBorderColor;
window.updateBackground = updateBackground;
window.resetEditor = resetEditor;
window.updateTextControlsPosition = updateTextControlsPosition;
window.hideTextControls = hideTextControls;
window.FILTERS = FILTERS;
