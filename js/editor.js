// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;
let originalImageWidth = 0;
let originalImageHeight = 0;

// متغيرات التحكم باللمس للنص مع تحسينات للحركة
let isDragging = false;
let isResizing = false;
let isRotating = false;
let startX = 0;
let startY = 0;
let textX = 0.5;
let textY = 0.5;
let textScale = 1;
let textRotation = 0;
let initialDistance = 0;
let initialScale = 1;
let initialAngle = 0;
let initialRotation = 0;
let lastTouchTime = 0;

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

// متغيرات تأثيرات النص الجديدة
let shadowIntensity = 5;
let bgOpacity = 70;
let shadowEnabled = true;
let backgroundEnabled = false;

// الفلاتر المتاحة
const FILTERS = {
    'none': { name: 'بدون فلتر', filter: 'none' },
    'grayscale': { name: 'أبيض وأسود', filter: 'grayscale(100%)' },
    'sepia': { name: 'سيبيا', filter: 'sepia(100%)' },
    'invert': { name: 'عكس الألوان', filter: 'invert(100%)' },
    'brightness': { name: 'سطوع', filter: 'brightness(150%)' },
    'contrast': { name: 'تباين', filter: 'contrast(150%)' },
    'saturate': { name: 'تشبع', filter: 'saturate(200%)' },
    'hue': { name: 'تدوير الألوان', filter: 'hue-rotate(180deg)' },
    'vintage': { name: 'قديم', filter: 'sepia(50%) contrast(120%) brightness(110%)' },
    'warm': { name: 'دافئ', filter: 'sepia(30%) saturate(130%)' },
    'cool': { name: 'بارد', filter: 'hue-rotate(180deg) saturate(120%)' }
};

// ذاكرة مؤقتة لتحسين الأداء
let fontCache = new Map();
let lastRenderTime = 0;
let renderThrottleDelay = 16;
let isRendering = false;

// تهيئة المحرر
window.addEventListener('DOMContentLoaded', () => {
    console.log('Editor initializing...');
    
    canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    ctx = canvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // تهيئة القيم من window
    if (window.textScale === undefined) window.textScale = 1;
    if (window.textRotation === undefined) window.textRotation = 0;
    if (window.textX === undefined) window.textX = 0.5;
    if (window.textY === undefined) window.textY = 0.5;
    if (window.shadowIntensity === undefined) window.shadowIntensity = 5;
    if (window.bgOpacity === undefined) window.bgOpacity = 70;
    
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
    
    console.log('Editor initialized');
});

function setupTextEffectsControls() {
    // إعداد عناصر الظل
    const shadowSlider = document.getElementById('shadowIntensitySlider');
    const shadowEnabledCheckbox = document.getElementById('shadowEnabled');
    const backgroundEnabledCheckbox = document.getElementById('backgroundEnabled');
    const bgOpacitySlider = document.getElementById('backgroundOpacitySlider');
    
    if (shadowSlider) {
        let shadowTimeout;
        shadowSlider.addEventListener('input', (e) => {
            shadowIntensity = parseInt(e.target.value);
            window.shadowIntensity = shadowIntensity;
            const display = document.getElementById('shadowIntensityDisplay');
            if (display) display.textContent = shadowIntensity;
            
            // حفظ في التاريخ
            if (typeof saveToHistory === 'function') {
                saveToHistory();
            }
            
            clearTimeout(shadowTimeout);
            shadowTimeout = setTimeout(() => {
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            }, 50);
        });
    }
    
    if (shadowEnabledCheckbox) {
        shadowEnabledCheckbox.addEventListener('change', (e) => {
            shadowEnabled = e.target.checked;
            
            // حفظ في التاريخ
            if (typeof saveToHistory === 'function') {
                saveToHistory();
            }
            
            if (window.currentText && window.currentText.trim() !== '') {
                renderFullCanvas();
            }
        });
    }
    
    if (backgroundEnabledCheckbox) {
        backgroundEnabledCheckbox.addEventListener('change', (e) => {
            backgroundEnabled = e.target.checked;
            
            // حفظ في التاريخ
            if (typeof saveToHistory === 'function') {
                saveToHistory();
            }
            
            if (window.currentText && window.currentText.trim() !== '') {
                renderFullCanvas();
            }
        });
    }
    
    if (bgOpacitySlider) {
        let bgOpacityTimeout;
        bgOpacitySlider.addEventListener('input', (e) => {
            bgOpacity = parseInt(e.target.value);
            window.bgOpacity = bgOpacity;
            const display = document.getElementById('backgroundOpacityDisplay');
            if (display) display.textContent = bgOpacity;
            
            // حفظ في التاريخ
            if (typeof saveToHistory === 'function') {
                saveToHistory();
            }
            
            clearTimeout(bgOpacityTimeout);
            bgOpacityTimeout = setTimeout(() => {
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            }, 50);
        });
    }
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
    
    const filterDisplay = FILTERS[filterName] ? FILTERS[filterName].name : 'بدون فلتر';
    showAlert(`تم تطبيق فلتر: ${filterDisplay}`, 'success');
}

function setupEventListeners() {
    const strokeWidth = document.getElementById('strokeWidth');
    const fontSizeSlider = document.getElementById('fontSizeSlider');

    if (strokeWidth) {
        let strokeTimeout;
        strokeWidth.addEventListener('input', (e) => {
            const display = document.getElementById('strokeWidthDisplay');
            if (display) {
                display.textContent = e.target.value;
            }
            
            // حفظ في التاريخ
            if (typeof saveToHistory === 'function') {
                saveToHistory();
            }
            
            clearTimeout(strokeTimeout);
            strokeTimeout = setTimeout(() => {
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            }, 50);
        });
    }
    
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = value;
            }
            
            // تحديث حجم النص فوراً
            window.textScale = value / 50;
            textScale = window.textScale;
            
            // حفظ في التاريخ
            if (typeof saveToHistory === 'function') {
                saveToHistory();
            }
            
            if (window.currentText && window.currentText.trim() !== '') {
                renderFullCanvas();
            }
        });
    }
}

function setupTouchControls() {
    // التحكم باللمس - تحسينات للحركة الفورية
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // التحكم بالفأرة
    canvas.addEventListener('mousedown', (e) => {
        const touch = { clientX: e.clientX, clientY: e.clientY };
        handleTouchStart({ touches: [touch], preventDefault: () => e.preventDefault() });
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging || isResizing || isRotating || stickerDragging) {
            const touch = { clientX: e.clientX, clientY: e.clientY };
            handleTouchMove({ touches: [touch], preventDefault: () => e.preventDefault() });
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        handleTouchEnd({ preventDefault: () => e.preventDefault() });
    });
    
    // منع سلوك اللمس الافتراضي
    canvas.addEventListener('touchmove', (e) => {
        if (isDragging || isResizing || isRotating) {
            e.preventDefault();
        }
    }, { passive: false });
}

function handleTouchStart(e) {
    e.preventDefault();
    const now = Date.now();
    
    // منع النقرات السريعة المتتالية
    if (now - lastTouchTime < 100) return;
    lastTouchTime = now;
    
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / canvas.width;
        const y = (touch.clientY - rect.top) / canvas.height;
        
        // التحقق من الملصقات أولاً
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
        
        // التحقق إذا كان اللمس على النص
        if (window.currentText && window.currentText.trim() !== '') {
            isDragging = true;
            startX = touch.clientX;
            startY = touch.clientY;
            
            // حفظ حالة قبل التحريك
            if (typeof saveToHistory === 'function') {
                saveToHistory();
            }
            
            // تحديث الموضع مباشرة
            textX = Math.max(0.1, Math.min(0.9, x));
            textY = Math.max(0.1, Math.min(0.9, y));
            window.textX = textX;
            window.textY = textY;
            
            // تحديث فوري للعرض
            renderFullCanvas();
        }
        
    } else if (e.touches.length === 2 && window.currentText) {
        isDragging = false;
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // حساب المسافة بين الإصبعين
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialScale = window.textScale || 1;
        initialAngle = Math.atan2(dy, dx);
        initialRotation = window.textRotation || 0;
        
        // تحديد نوع الحركة بناءً على المسافة الأولية
        if (initialDistance > 50) {
            isResizing = true;
            
            // حفظ حالة قبل التكبير/التصغير
            if (typeof saveToHistory === 'function') {
                saveToHistory();
            }
        }
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
        
        // التأكد من بقاء الملصق داخل الكانفاس
        selectedSticker.x = Math.max(0, Math.min(canvas.width - selectedSticker.width, selectedSticker.x));
        selectedSticker.y = Math.max(0, Math.min(canvas.height - selectedSticker.height, selectedSticker.y));
        
        lastRenderTime = now;
        renderFullCanvas();
        return;
    }
    
    if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        // حساب الموضع النسبي الجديد
        const x = Math.max(0.1, Math.min(0.9, (touch.clientX - rect.left) / canvas.width));
        const y = Math.max(0.1, Math.min(0.9, (touch.clientY - rect.top) / canvas.height));
        
        // تحريك النص مباشرة دون تأخير
        textX = x;
        textY = y;
        window.textX = textX;
        window.textY = textY;
        
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
            const newScale = Math.max(0.2, Math.min(3, initialScale * scaleMultiplier));
            window.textScale = newScale;
            textScale = newScale;
            
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
        const newRotation = (initialRotation + angleChange * (180 / Math.PI)) % 360;
        window.textRotation = newRotation;
        textRotation = newRotation;
        
        lastRenderTime = now;
        renderFullCanvas();
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    // إعادة تعيين جميع حالات التحكم
    isDragging = false;
    isResizing = false;
    isRotating = false;
    stickerDragging = false;
    selectedSticker = null;
    initialDistance = 0;
    initialScale = 1;
    initialAngle = 0;
    initialRotation = 0;
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
    
    // استخدم الأبعاد الأصلية للصورة مع الحفاظ على التناسب
    if (currentImage && imageLoaded) {
        const imageAspect = originalImageWidth / originalImageHeight;
        const containerAspect = containerWidth / containerHeight;
        
        let targetWidth, targetHeight;
        
        if (containerAspect > imageAspect) {
            // الحاوية أوسع من الصورة
            targetHeight = containerHeight;
            targetWidth = targetHeight * imageAspect;
        } else {
            // الحاوية أطول من الصورة
            targetWidth = containerWidth;
            targetHeight = targetWidth / imageAspect;
        }
        
        // التأكد من أن الأبعاد لا تتجاوز الحاوية
        if (targetWidth > containerWidth) {
            targetWidth = containerWidth;
            targetHeight = targetWidth / imageAspect;
        }
        
        if (targetHeight > containerHeight) {
            targetHeight = containerHeight;
            targetWidth = targetHeight * imageAspect;
        }
        
        // إضافة مساحة للحواف
        const borderSpace = imageBorderWidth * 2;
        return { 
            width: Math.round(targetWidth) + borderSpace, 
            height: Math.round(targetHeight) + borderSpace 
        };
    }
    
    // إذا لم توجد صورة، استخدم أبعاد الحاوية
    return { 
        width: Math.max(300, Math.min(containerWidth, 1200)), 
        height: Math.max(200, Math.min(containerHeight, 800)) 
    };
}

function adjustImageForBorder() {
    if (!currentImage || !imageLoaded) return;
    
    const dimensions = calculateCanvasDimensions();
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    canvas.style.width = dimensions.width + 'px';
    canvas.style.height = dimensions.height + 'px';
}

function loadImageToEditor(imageUrl) {
    console.log('Loading image to editor:', imageUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        console.log('Image loaded successfully');
        
        currentImage = img;
        imageLoaded = true;
        
        originalImageWidth = img.naturalWidth || img.width;
        originalImageHeight = img.naturalHeight || img.height;
        
        console.log('Original image dimensions:', originalImageWidth, 'x', originalImageHeight);
        
        // ضبط الكانفاس ليتناسب مع الصورة الأصلية
        adjustImageForBorder();
        
        // إعادة تعيين جميع الإعدادات
        imageBlur = 0;
        imageRotation = 0;
        imageFlipH = false;
        imageFlipV = false;
        imageBorderWidth = 0;
        currentFilter = 'none';
        canvasStickers = [];
        
        // إعادة تعيين إعدادات النص
        textX = 0.5;
        textY = 0.5;
        window.textScale = 1;
        window.textRotation = 0;
        window.textX = 0.5;
        window.textY = 0.5;
        textScale = 1;
        textRotation = 0;
        shadowIntensity = 5;
        bgOpacity = 70;
        shadowEnabled = true;
        backgroundEnabled = false;
        
        // تحديث شريط التحكم
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = 50;
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = '50';
            }
        }
        
        const shadowIntensitySlider = document.getElementById('shadowIntensitySlider');
        if (shadowIntensitySlider) {
            shadowIntensitySlider.value = 5;
            const shadowDisplay = document.getElementById('shadowIntensityDisplay');
            if (shadowDisplay) {
                shadowDisplay.textContent = '5';
            }
        }
        
        const backgroundOpacitySlider = document.getElementById('backgroundOpacitySlider');
        if (backgroundOpacitySlider) {
            backgroundOpacitySlider.value = 70;
            const bgDisplay = document.getElementById('backgroundOpacityDisplay');
            if (bgDisplay) {
                bgDisplay.textContent = '70';
            }
        }
        
        const shadowCheckbox = document.getElementById('shadowEnabled');
        if (shadowCheckbox) {
            shadowCheckbox.checked = true;
        }
        
        const backgroundCheckbox = document.getElementById('backgroundEnabled');
        if (backgroundCheckbox) {
            backgroundCheckbox.checked = false;
        }
        
        // إعادة تعيين التاريخ
        if (typeof editHistory !== 'undefined') {
            editHistory = [];
            historyIndex = -1;
        }
        
        renderFullCanvas();
        
        console.log(`Display dimensions: ${canvas.width}x${canvas.height}`);
    };
    
    img.onerror = function(error) {
        console.error('Failed to load image:', error);
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
        // تنظيف الكانفاس - بدون رسم خلفية بيضاء
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // ملاحظة: تمت إزالة السطر التالي لإزالة المستطيل الأبيض
        // ctx.fillStyle = '#FFFFFF';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (imageLoaded && currentImage) {
            ctx.save();
            
            const borderSpace = imageBorderWidth;
            let imageWidth = canvas.width - (borderSpace * 2);
            let imageHeight = canvas.height - (borderSpace * 2);
            
            // حساب نسبة الصورة الأصلية
            const imageAspect = originalImageWidth / originalImageHeight;
            const canvasAspect = imageWidth / imageHeight;
            
            if (canvasAspect > imageAspect) {
                imageHeight = imageWidth / imageAspect;
            } else {
                imageWidth = imageHeight * imageAspect;
            }
            
            // حساب موضع الصورة في المنتصف مع مراعاة الحواف
            const x = (canvas.width - imageWidth) / 2;
            const y = (canvas.height - imageHeight) / 2;
            
            ctx.translate(x + imageWidth / 2, y + imageHeight / 2);
            ctx.rotate(imageRotation * Math.PI / 180);
            
            if (imageFlipH) ctx.scale(-1, 1);
            if (imageFlipV) ctx.scale(1, -1);
            
            if (imageBlur > 0) {
                ctx.filter = `blur(${imageBlur}px)`;
            }
            
            if (currentFilter !== 'none' && FILTERS[currentFilter]) {
                const currentFilterValue = ctx.filter !== 'none' ? ctx.filter + ' ' : '';
                ctx.filter = currentFilterValue + FILTERS[currentFilter].filter;
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
        
        // رسم الملصقات
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
        
        // رسم النص إذا كان موجوداً
        if (window.currentText && window.currentText.trim() !== '') {
            renderTextContent();
        }
        
    } catch (error) {
        console.error('Error rendering canvas:', error);
    } finally {
        isRendering = false;
        lastRenderTime = now;
    }
}

function renderTextContent() {
    const fontFamily = window.currentFontFamily || "'ABeeZee', sans-serif";
    const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
    const text = window.currentText || '';
    
    const textColor = window.currentTextColor || '#FFFFFF';
    const strokeColor = window.currentStrokeColor || '#000000';
    const cardColor = window.currentCardColor || '#000000';
    const shadowColor = window.currentShadowColor || '#000000';
    
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
    
    // ضبط حجم الخط ليناسب العرض
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
    
    // تطبيق الظل إذا كان مفعلاً
    if (shadowEnabled) {
        ctx.shadowColor = shadowColor;
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
        
        if (backgroundEnabled) {
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
    
    const borderSpace = imageBorderWidth;
    exportCanvas.width = exportWidth + (borderSpace * 2);
    exportCanvas.height = exportHeight + (borderSpace * 2);
    
    const exportCtx = exportCanvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';
    
    // رسم خلفية بيضاء للتصدير
    exportCtx.fillStyle = '#FFFFFF';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    exportCtx.save();
    
    let imageWidth = exportWidth;
    let imageHeight = exportHeight;
    
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
    
    if (currentFilter !== 'none' && FILTERS[currentFilter]) {
        const currentFilterValue = exportCtx.filter !== 'none' ? exportCtx.filter + ' ' : '';
        exportCtx.filter = currentFilterValue + FILTERS[currentFilter].filter;
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
        const fontFamily = window.currentFontFamily || "'ABeeZee', sans-serif";
        
        const textColor = window.currentTextColor || '#FFFFFF';
        const strokeColor = window.currentStrokeColor || '#000000';
        const cardColor = window.currentCardColor || '#000000';
        const shadowColor = window.currentShadowColor || '#000000';
        
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
        
        // تطبيق الظل في التصدير
        if (shadowEnabled) {
            exportCtx.shadowColor = shadowColor;
            exportCtx.shadowBlur = shadowIntensity;
            exportCtx.shadowOffsetX = shadowIntensity / 2;
            exportCtx.shadowOffsetY = shadowIntensity / 2;
        }
        
        lines.forEach((line, index) => {
            const y = -(totalHeight / 2) + (index * lineHeight) + (lineHeight / 2);
            const x = 0;
            
            const textMetrics = exportCtx.measureText(line);
            
            if (backgroundEnabled) {
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
    console.log('✓ تم تغيير لون حواف الصورة إلى:', color);
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
window.FILTERS = FILTERS;
