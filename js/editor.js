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

// تصدير imageBorderColor لـ window
window.imageBorderColor = imageBorderColor;

// متغيرات تأثيرات النص الجديدة
let shadowIntensity = 5;
let bgOpacity = 70;

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
                renderFullCanvas();
                return;
            }
        }
        
        if (window.currentText && window.currentText.trim() !== '') {
            isDragging = true;
            startX = touch.clientX;
            startY = touch.clientY;
        }
    } else if (e.touches.length === 2 && window.currentText) {
        isDragging = false;
        isResizing = true;
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialScale = textScale;
        initialAngle = Math.atan2(dy, dx);
        
        console.log('بدء التكبير/التصغير - المسافة الأولية:', initialDistance);
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
            textScale = Math.max(0.3, Math.min(5, initialScale * scaleMultiplier));
        }
        
        // حساب التدوير
        const angleChange = currentAngle - initialAngle;
        textRotation += angleChange * (180 / Math.PI);
        initialAngle = currentAngle;
        
        lastRenderTime = now;
        renderFullCanvas();
        
        console.log('حجم النص:', textScale.toFixed(2));
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    if (isResizing) {
        console.log('انتهى التكبير/التصغير - الحجم النهائي:', textScale.toFixed(2));
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

function adjustImageForBorder() {
    if (!currentImage || !imageLoaded) return;
    
    const container = document.querySelector('.canvas-wrapper-fixed');
    if (!container) return;
    
    const containerWidth = container.clientWidth - 20;
    const containerHeight = container.clientHeight - 20;
    
    const borderSpace = imageBorderWidth * 2;
    const availableWidth = containerWidth - borderSpace;
    const availableHeight = containerHeight - borderSpace;
    
    const widthRatio = availableWidth / originalImageWidth;
    const heightRatio = availableHeight / originalImageHeight;
    const scale = Math.min(widthRatio, heightRatio);
    
    const displayWidth = Math.max(100, Math.round(originalImageWidth * scale));
    const displayHeight = Math.max(100, Math.round(originalImageHeight * scale));
    
    canvas.width = displayWidth + borderSpace;
    canvas.height = displayHeight + borderSpace;
    canvas.style.width = (displayWidth + borderSpace) + 'px';
    canvas.style.height = (displayHeight + borderSpace) + 'px';
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
        
        adjustImageForBorder();
        
        imageBlur = 0;
        imageRotation = 0;
        imageFlipH = false;
        imageFlipV = false;
        imageBorderWidth = 0;
        currentFilter = 'none';
        canvasStickers = [];
        
        textX = 0.5;
        textY = 0.5;
        textScale = 1;
        textRotation = 0;
        
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
    if (!imageLoaded || !currentImage || isRendering) return;
    
    const now = Date.now();
    if (now - lastRenderTime < renderThrottleDelay) {
        return;
    }
    
    isRendering = true;
    
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (imageLoaded && currentImage) {
            ctx.save();
            
            const borderSpace = imageBorderWidth;
            const imageWidth = canvas.width - (borderSpace * 2);
            const imageHeight = canvas.height - (borderSpace * 2);
            
            ctx.translate(canvas.width / 2, canvas.height / 2);
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
        console.error('Error rendering canvas:', error);
    } finally {
        isRendering = false;
        lastRenderTime = now;
    }
}

function renderTextContent() {
    const fontFamily = window.currentFontFamily || "'Agu Display', display";
    const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
    const shadowEnabled = document.getElementById('shadowEnabled')?.checked !== false;
    const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
    const text = window.currentText || '';
    
    const textColor = window.currentTextColor || '#FFFFFF';
    const strokeColor = window.currentStrokeColor || '#000000';
    const cardColor = window.currentCardColor || '#000000';
    
    // حساب حجم الخط الأساسي بناءً على حجم الكانفاس
    const baseFontSize = Math.min(canvas.width, canvas.height) * 0.08;
    let finalFontSize = baseFontSize * textScale;
    
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
    exportCanvas.width = originalImageWidth;
    exportCanvas.height = originalImageHeight;
    const exportCtx = exportCanvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';
    
    exportCtx.save();
    
    const scale = originalImageWidth / (canvas.width - (imageBorderWidth * 2));
    const scaledBorder = imageBorderWidth * scale;
    
    const imageWidth = originalImageWidth;
    const imageHeight = originalImageHeight;
    
    exportCtx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
    exportCtx.rotate(imageRotation * Math.PI / 180);
    
    if (imageFlipH) exportCtx.scale(-1, 1);
    if (imageFlipV) exportCtx.scale(1, -1);
    
    if (imageBlur > 0) {
        const scaledBlur = imageBlur * scale;
        exportCtx.filter = `blur(${scaledBlur}px)`;
    }
    
    if (currentFilter !== 'none' && FILTERS[currentFilter]) {
        const currentFilterValue = exportCtx.filter !== 'none' ? exportCtx.filter + ' ' : '';
        exportCtx.filter = currentFilterValue + FILTERS[currentFilter].filter;
    }
    
    exportCtx.drawImage(currentImage, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    
    exportCtx.filter = 'none';
    exportCtx.restore();
    
    if (scaledBorder > 0) {
        exportCtx.strokeStyle = imageBorderColor;
        exportCtx.lineWidth = scaledBorder;
        exportCtx.lineCap = 'square';
        exportCtx.lineJoin = 'miter';
        
        exportCtx.strokeRect(
            scaledBorder / 2,
            scaledBorder / 2,
            exportCanvas.width - scaledBorder,
            exportCanvas.height - scaledBorder
        );
    }
    
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
    
    if (window.currentText && window.currentText.trim() !== '') {
        exportCtx.save();
        
        const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
        const shadowEnabled = document.getElementById('shadowEnabled')?.checked !== false;
        const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
        const fontFamily = window.currentFontFamily || "'Agu Display', display";
        
        const textColor = window.currentTextColor || '#FFFFFF';
        const strokeColor = window.currentStrokeColor || '#000000';
        const cardColor = window.currentCardColor || '#000000';
        
        const baseFontSize = Math.min(exportCanvas.width, exportCanvas.height) * 0.08;
        const scaledFontSize = baseFontSize * textScale;
        const scaledStrokeWidth = strokeWidth * scale;
        
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
        exportCtx.rotate(textRotation * Math.PI / 180);
        
        if (shadowEnabled) {
            exportCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            exportCtx.shadowBlur = shadowIntensity * scale;
            exportCtx.shadowOffsetX = (shadowIntensity / 2) * scale;
            exportCtx.shadowOffsetY = (shadowIntensity / 2) * scale;
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
            
            if (scaledStrokeWidth > 0) {
                exportCtx.strokeStyle = strokeColor;
                exportCtx.lineWidth = scaledStrokeWidth;
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
