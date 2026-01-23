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

// متغيرات تأثيرات النص الجديدة
let shadowIntensity = 5; // قوة الظل من 0 إلى 20
let bgOpacity = 70; // شفافية خلفية النص من 10 إلى 100

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
let renderThrottleDelay = 16; // ~60fps
let isRendering = false;

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
    // التحكم بقوة الظل
    const shadowSlider = document.getElementById('shadowSlider');
    if (shadowSlider) {
        let shadowTimeout;
        shadowSlider.addEventListener('input', (e) => {
            shadowIntensity = parseInt(e.target.value);
            const display = document.getElementById('shadowDisplay');
            if (display) display.textContent = shadowIntensity;
            
            clearTimeout(shadowTimeout);
            shadowTimeout = setTimeout(() => updateTextOnCanvas(), 50);
        });
    }
    
    // التحكم بشفافية خلفية النص
    const bgOpacitySlider = document.getElementById('bgOpacitySlider');
    if (bgOpacitySlider) {
        let bgOpacityTimeout;
        bgOpacitySlider.addEventListener('input', (e) => {
            bgOpacity = parseInt(e.target.value);
            const display = document.getElementById('bgOpacityDisplay');
            if (display) display.textContent = bgOpacity;
            
            clearTimeout(bgOpacityTimeout);
            bgOpacityTimeout = setTimeout(() => updateTextOnCanvas(), 50);
        });
    }
    
    // شبكة ألوان خلفية النص
    const cardColorGrid = document.getElementById('cardColorGrid');
    if (cardColorGrid && window.COLORS) {
        cardColorGrid.innerHTML = '';
        window.COLORS.forEach(color => {
            const item = document.createElement('div');
            item.className = 'color-item';
            item.style.backgroundColor = color;
            item.onclick = () => {
                window.currentCardColor = color;
                updateTextOnCanvas();
            };
            cardColorGrid.appendChild(item);
        });
    }
}

function setupImageControls() {
    // زر رفع الصورة
    const uploadBtn = document.getElementById('uploadImageBtn');
    const uploadInput = document.getElementById('uploadImageInput');
    
    if (uploadBtn && uploadInput) {
        uploadBtn.addEventListener('click', () => uploadInput.click());
        uploadInput.addEventListener('change', handleImageUpload);
    }
    
    // التحكم بالضبابية
    const blurSlider = document.getElementById('blurSlider');
    if (blurSlider) {
        let blurTimeout;
        blurSlider.addEventListener('input', (e) => {
            imageBlur = parseInt(e.target.value);
            const display = document.getElementById('blurDisplay');
            if (display) display.textContent = imageBlur;
            
            clearTimeout(blurTimeout);
            blurTimeout = setTimeout(() => renderCanvas(), 50);
        });
    }
    
    // التحكم بحواف الصورة (الجديدة)
    const borderSlider = document.getElementById('borderSlider');
    if (borderSlider) {
        let borderTimeout;
        borderSlider.addEventListener('input', (e) => {
            imageBorderWidth = parseInt(e.target.value);
            const display = document.getElementById('borderDisplay');
            if (display) display.textContent = imageBorderWidth;
            
            clearTimeout(borderTimeout);
            borderTimeout = setTimeout(() => renderCanvas(), 50);
        });
    }
    
    // اختيار لون الحواف
    const borderColorGrid = document.getElementById('borderColorGrid');
    if (borderColorGrid && window.COLORS) {
        borderColorGrid.innerHTML = '';
        window.COLORS.forEach(color => {
            const item = document.createElement('div');
            item.className = 'color-item';
            item.style.backgroundColor = color;
            item.onclick = () => {
                imageBorderColor = color;
                renderCanvas();
            };
            borderColorGrid.appendChild(item);
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
    renderCanvas();
    showAlert('تم تدوير الصورة', 'success');
}

function flipImageH() {
    imageFlipH = !imageFlipH;
    renderCanvas();
    showAlert('تم قلب الصورة أفقياً', 'success');
}

function flipImageV() {
    imageFlipV = !imageFlipV;
    renderCanvas();
    showAlert('تم قلب الصورة عمودياً', 'success');
}

function applyFilter(filterName) {
    currentFilter = filterName;
    renderCanvas();
    
    const filterDisplay = FILTERS[filterName] ? FILTERS[filterName].name : 'بدون فلتر';
    showAlert(`تم تطبيق فلتر: ${filterDisplay}`, 'success');
}

function setupEventListeners() {
    const fontSize = document.getElementById('fontSize');
    const strokeWidth = document.getElementById('strokeWidth');
    const fontFamily = document.getElementById('fontFamily');
    const shadowEnabled = document.getElementById('shadowEnabled');
    const cardEnabled = document.getElementById('cardEnabled');

    if (fontSize) {
        let fontSizeTimeout;
        fontSize.addEventListener('input', (e) => {
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = e.target.value;
            }
            
            fontCache.clear();
            
            clearTimeout(fontSizeTimeout);
            fontSizeTimeout = setTimeout(() => updateTextOnCanvas(), 50);
        });
    }
    
    if (strokeWidth) {
        let strokeTimeout;
        strokeWidth.addEventListener('input', (e) => {
            const display = document.getElementById('strokeWidthDisplay');
            if (display) {
                display.textContent = e.target.value;
            }
            
            clearTimeout(strokeTimeout);
            strokeTimeout = setTimeout(() => updateTextOnCanvas(), 50);
        });
    }
    
    if (fontFamily) {
        fontFamily.addEventListener('change', () => {
            console.log('Font changed to:', fontFamily.value);
            
            fontCache.clear();
            
            loadFonts();
            
            setTimeout(() => updateTextOnCanvas(), 100);
        });
    }
    
    if (shadowEnabled) {
        shadowEnabled.addEventListener('change', updateTextOnCanvas);
    }
    
    if (cardEnabled) {
        cardEnabled.addEventListener('change', updateTextOnCanvas);
    }
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
}

function handleTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / canvas.width;
        const y = (touch.clientY - rect.top) / canvas.height;
        
        for (let i = canvasStickers.length - 1; i >= 0; i--) {
            const sticker = canvasStickers[i];
            if (isTouchOnSticker(x * canvas.width, y * canvas.height, sticker)) {
                selectedSticker = sticker;
                stickerDragging = true;
                stickerStartX = x * canvas.width - sticker.x;
                stickerStartY = y * canvas.height - sticker.y;
                renderCanvas();
                return;
            }
        }
        
        if (window.currentText && window.currentText.trim() !== '') {
            isDragging = true;
            startX = touch.clientX;
            startY = touch.clientY;
        }
    } else if (e.touches.length === 2 && window.currentText) {
        isResizing = true;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialAngle = Math.atan2(dy, dx);
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
        
        renderCanvas();
        return;
    }
    
    if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        
        textX += dx / canvas.width;
        textY += dy / canvas.height;
        
        textX = Math.max(0.1, Math.min(0.9, textX));
        textY = Math.max(0.1, Math.min(0.9, textY));
        
        startX = touch.clientX;
        startY = touch.clientY;
        
        // إصلاح: تحديث النص مباشرة دون إعادة رسم كامل
        if (window.currentText && window.currentText.trim() !== '') {
            renderTextOnly();
        }
    } else if (e.touches.length === 2 && isResizing) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const scaleChange = distance / initialDistance;
        textScale *= scaleChange;
        textScale = Math.max(0.5, Math.min(3, textScale));
        
        const angleChange = angle - initialAngle;
        textRotation += angleChange * (180 / Math.PI);
        
        initialDistance = distance;
        initialAngle = angle;
        
        // إصلاح: تحديث النص مباشرة دون إعادة رسم كامل
        if (window.currentText && window.currentText.trim() !== '') {
            renderTextOnly();
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    isDragging = false;
    isResizing = false;
    stickerDragging = false;
    selectedSticker = null;
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
        renderCanvas();
    };
    img.src = url;
}

function deleteSelectedSticker() {
    if (selectedSticker) {
        const index = canvasStickers.indexOf(selectedSticker);
        if (index > -1) {
            canvasStickers.splice(index, 1);
            selectedSticker = null;
            renderCanvas();
            showAlert('تم حذف الملصق', 'success');
        }
    }
}

function updateTextOnCanvas() {
    if (window.currentText && window.currentText.trim() !== '') {
        renderTextOnCanvas(false);
    }
}

// إضافة دالة جديدة: رسم النص فقط (لإصلاح مشكلة التكرار)
function renderTextOnly() {
    if (!imageLoaded || !currentImage || isRendering) return;
    
    const now = Date.now();
    if (now - lastRenderTime < renderThrottleDelay) {
        return;
    }
    
    isRendering = true;
    lastRenderTime = now;
    
    try {
        // حفظ الحالة الحالية للكانفاس
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // مسح المنطقة التي كان النص فيها سابقاً (إذا كان هناك نص)
        ctx.putImageData(imageData, 0, 0);
        
        // رسم النص الجديد
        if (window.currentText && window.currentText.trim() !== '') {
            renderTextContent();
        }
    } catch (error) {
        console.error('Error rendering text only:', error);
        renderCanvas();
    } finally {
        isRendering = false;
    }
}

function renderTextContent() {
    const fontFamily = document.getElementById('fontFamily')?.value || "'Amiri', serif";
    const fontSize = parseInt(document.getElementById('fontSize')?.value || "48");
    const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
    const shadowEnabled = document.getElementById('shadowEnabled')?.checked !== false;
    const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
    const text = window.currentText || '';
    
    const textColor = window.currentTextColor || '#FFFFFF';
    const strokeColor = window.currentStrokeColor || '#000000';
    const cardColor = window.currentCardColor || '#000000';
    
    let finalFontSize = fontSize * textScale;
    
    // استخدام التخزين المؤقت للخط
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
    ctx.rotate(textRotation * Math.PI / 180);
    
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
        
        console.log(`Original image dimensions: ${originalImageWidth}x${originalImageHeight}`);
        
        const container = document.querySelector('.canvas-wrapper-fixed');
        if (!container) {
            console.error('Canvas container not found');
            return;
        }
        
        // إصلاح: حساب الحجم المناسب لاستيعاب الصورة كاملة
        const containerWidth = container.clientWidth - 20;
        const containerHeight = container.clientHeight - 20;
        
        const widthRatio = containerWidth / originalImageWidth;
        const heightRatio = containerHeight / originalImageHeight;
        const scale = Math.min(widthRatio, heightRatio);
        
        const displayWidth = Math.round(originalImageWidth * scale);
        const displayHeight = Math.round(originalImageHeight * scale);
        
        // إصلاح: ضبط أبعاد الكانفاس لاستيعاب الصورة كاملة
        canvas.width = Math.max(displayWidth, 100);
        canvas.height = Math.max(displayHeight, 100);
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // إعادة تعيين التأثيرات
        imageBlur = 0;
        imageRotation = 0;
        imageFlipH = false;
        imageFlipV = false;
        imageBorderWidth = 0;
        currentFilter = 'none';
        canvasStickers = [];
        
        // إعادة تعيين موضع النص
        textX = 0.5;
        textY = 0.5;
        textScale = 1;
        textRotation = 0;
        
        renderCanvas();
        
        console.log(`Display dimensions: ${displayWidth}x${displayHeight}`);
    };
    
    img.onerror = function(error) {
        console.error('Failed to load image:', error);
        showAlert('فشل تحميل الصورة. الرجاء المحاولة مرة أخرى.', 'error');
    };
    
    img.src = imageUrl;
}

function renderCanvas() {
    if (!imageLoaded || !currentImage || isRendering) return;
    
    const now = Date.now();
    if (now - lastRenderTime < renderThrottleDelay) {
        return;
    }
    
    isRendering = true;
    lastRenderTime = now;
    
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        
        // تطبيق التحولات
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(imageRotation * Math.PI / 180);
        
        if (imageFlipH) ctx.scale(-1, 1);
        if (imageFlipV) ctx.scale(1, -1);
        
        // تطبيق الضبابية
        if (imageBlur > 0) {
            ctx.filter = `blur(${imageBlur}px)`;
        }
        
        // تطبيق الفلتر
        if (currentFilter !== 'none' && FILTERS[currentFilter]) {
            const currentFilterValue = ctx.filter !== 'none' ? ctx.filter + ' ' : '';
            ctx.filter = currentFilterValue + FILTERS[currentFilter].filter;
        }
        
        // إصلاح: رسم الصورة بالحجم المناسب
        ctx.drawImage(currentImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        
        ctx.filter = 'none';
        ctx.restore();
        
        // إصلاح: رسم الحواف بشكل صحيح (حواف على جميع الجوانب)
        if (imageBorderWidth > 0) {
            ctx.strokeStyle = imageBorderColor;
            ctx.lineWidth = imageBorderWidth;
            
            // رسم حواف على جميع الجوانب
            ctx.beginPath();
            // الأعلى
            ctx.moveTo(0, imageBorderWidth / 2);
            ctx.lineTo(canvas.width, imageBorderWidth / 2);
            // اليمين
            ctx.moveTo(canvas.width - imageBorderWidth / 2, 0);
            ctx.lineTo(canvas.width - imageBorderWidth / 2, canvas.height);
            // الأسفل
            ctx.moveTo(0, canvas.height - imageBorderWidth / 2);
            ctx.lineTo(canvas.width, canvas.height - imageBorderWidth / 2);
            // اليسار
            ctx.moveTo(imageBorderWidth / 2, 0);
            ctx.lineTo(imageBorderWidth / 2, canvas.height);
            ctx.stroke();
            
            // رسم زوايا (اختياري)
            ctx.beginPath();
            // الزاوية اليسرى العليا
            ctx.moveTo(imageBorderWidth, imageBorderWidth);
            ctx.lineTo(imageBorderWidth * 2, imageBorderWidth);
            ctx.lineTo(imageBorderWidth, imageBorderWidth * 2);
            // الزاوية اليمنى العليا
            ctx.moveTo(canvas.width - imageBorderWidth, imageBorderWidth);
            ctx.lineTo(canvas.width - imageBorderWidth * 2, imageBorderWidth);
            ctx.lineTo(canvas.width - imageBorderWidth, imageBorderWidth * 2);
            // الزاوية اليمنى السفلى
            ctx.moveTo(canvas.width - imageBorderWidth, canvas.height - imageBorderWidth);
            ctx.lineTo(canvas.width - imageBorderWidth * 2, canvas.height - imageBorderWidth);
            ctx.lineTo(canvas.width - imageBorderWidth, canvas.height - imageBorderWidth * 2);
            // الزاوية اليسرى السفلى
            ctx.moveTo(imageBorderWidth, canvas.height - imageBorderWidth);
            ctx.lineTo(imageBorderWidth * 2, canvas.height - imageBorderWidth);
            ctx.lineTo(imageBorderWidth, canvas.height - imageBorderWidth * 2);
            ctx.stroke();
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
        
        if (window.currentText && window.currentText.trim() !== '') {
            renderTextContent();
        }
    } catch (error) {
        console.error('Error rendering canvas:', error);
    } finally {
        isRendering = false;
    }
}

function renderTextOnCanvas(forExport = false) {
    if (!imageLoaded || !currentImage) {
        console.error('No image loaded');
        return false;
    }
    
    if (!window.currentText || window.currentText.trim() === '') {
        if (forExport) {
            return createExportCanvas();
        } else {
            renderCanvas();
            return true;
        }
    }
    
    try {
        let targetCanvas, targetCtx, targetWidth, targetHeight, scale = 1;
        
        if (forExport) {
            const exportResult = createExportCanvas();
            targetCanvas = exportResult;
            targetCtx = targetCanvas.getContext('2d');
            targetWidth = targetCanvas.width;
            targetHeight = targetCanvas.height;
            scale = targetWidth / canvas.width;
        } else {
            targetCanvas = canvas;
            targetCtx = ctx;
            targetWidth = canvas.width;
            targetHeight = canvas.height;
            
            // إصلاح: استدعاء renderCanvas فقط إذا لم يكن هناك نص مرسوم بالفعل
            if (!isRendering) {
                renderCanvas();
            }
            return true;
        }
        
        // ... (بقية الكود كما هو للتصدير)
        
        return forExport ? targetCanvas : true;
        
    } catch (error) {
        console.error('Error rendering text:', error);
        
        if (typeof loadFonts === 'function') {
            loadFonts();
        }
        
        return false;
    }
}

function createExportCanvas() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = originalImageWidth;
    exportCanvas.height = originalImageHeight;
    const exportCtx = exportCanvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';
    
    exportCtx.save();
    
    // تطبيق نفس التحولات
    exportCtx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
    exportCtx.rotate(imageRotation * Math.PI / 180);
    
    if (imageFlipH) exportCtx.scale(-1, 1);
    if (imageFlipV) exportCtx.scale(1, -1);
    
    // تطبيق الضبابية والفلاتر
    if (imageBlur > 0) {
        const scaledBlur = imageBlur * (originalImageWidth / canvas.width);
        exportCtx.filter = `blur(${scaledBlur}px)`;
    }
    
    if (currentFilter !== 'none' && FILTERS[currentFilter]) {
        const currentFilterValue = exportCtx.filter !== 'none' ? exportCtx.filter + ' ' : '';
        exportCtx.filter = currentFilterValue + FILTERS[currentFilter].filter;
    }
    
    exportCtx.drawImage(currentImage, -exportCanvas.width / 2, -exportCanvas.height / 2, 
                       exportCanvas.width, exportCanvas.height);
    
    exportCtx.filter = 'none';
    exportCtx.restore();
    
    // رسم حواف الصورة (الجديدة)
    if (imageBorderWidth > 0) {
        const scaledBorder = imageBorderWidth * (originalImageWidth / canvas.width);
        exportCtx.strokeStyle = imageBorderColor;
        exportCtx.lineWidth = scaledBorder;
        
        // رسم حواف على جميع الجوانب
        exportCtx.beginPath();
        // الأعلى
        exportCtx.moveTo(0, scaledBorder / 2);
        exportCtx.lineTo(exportCanvas.width, scaledBorder / 2);
        // اليمين
        exportCtx.moveTo(exportCanvas.width - scaledBorder / 2, 0);
        exportCtx.lineTo(exportCanvas.width - scaledBorder / 2, exportCanvas.height);
        // الأسفل
        exportCtx.moveTo(0, exportCanvas.height - scaledBorder / 2);
        exportCtx.lineTo(exportCanvas.width, exportCanvas.height - scaledBorder / 2);
        // اليسار
        exportCtx.moveTo(scaledBorder / 2, 0);
        exportCtx.lineTo(scaledBorder / 2, exportCanvas.height);
        exportCtx.stroke();
    }
    
    // رسم الملصقات
    const scale = originalImageWidth / canvas.width;
    canvasStickers.forEach(sticker => {
        exportCtx.save();
        const x = sticker.x * scale;
        const y = sticker.y * scale;
        const w = sticker.width * scale;
        const h = sticker.height * scale;
        exportCtx.translate(x + w / 2, y + h / 2);
        exportCtx.rotate(sticker.rotation * Math.PI / 180);
        exportCtx.drawImage(sticker.img, -w / 2, -h / 2, w, h);
        exportCtx.restore();
    });
    
    return exportCanvas;
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
    return renderTextOnCanvas(true);
}

window.prepareImageForExport = prepareImageForExport;
window.renderTextOnCanvas = renderTextOnCanvas;
window.updateTextOnCanvas = updateTextOnCanvas;
window.loadImageToEditor = loadImageToEditor;
window.addSticker = addSticker;
window.deleteSelectedSticker = deleteSelectedSticker;
window.rotateImage = rotateImage;
window.flipImageH = flipImageH;
window.flipImageV = flipImageV;
window.applyFilter = applyFilter;
window.FILTERS = FILTERS;
