// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;
let originalImageWidth = 0;
let originalImageHeight = 0;

// متغيرات التحكم باللمس للنص Picsart-style
let isDraggingText = false;
let isResizingText = false;
let isRotatingText = false;
let textX = 0.5;
let textY = 0.5;
let textScale = 1;
let textRotation = 0;
let textWidth = 200;
let textHeight = 100;
let initialDistance = 0;
let initialScale = 1;
let initialAngle = 0;
let startX = 0;
let startY = 0;
let resizeDirection = null;

// نقاط التحكم
let controlPoints = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
    rotate: { x: 0, y: 0 }
};

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
let textBoundingBox = { x: 0, y: 0, width: 0, height: 0 };

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
    
    if (typeof initializeFonts === 'function') {
        setTimeout(() => initializeFonts(), 100);
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
        if (isDraggingText || isResizingText || isRotatingText || stickerDragging) {
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
        const x = (touch.clientX - rect.left);
        const y = (touch.clientY - rect.top);
        
        // التحقق من الملصقات أولاً
        for (let i = canvasStickers.length - 1; i >= 0; i--) {
            const sticker = canvasStickers[i];
            if (isTouchOnSticker(x, y, sticker)) {
                selectedSticker = sticker;
                stickerDragging = true;
                stickerStartX = x - sticker.x;
                stickerStartY = y - sticker.y;
                renderFullCanvas();
                return;
            }
        }
        
        if (window.currentText && window.currentText.trim() !== '') {
            // التحقق من نقاط التحكم
            const controlPoint = getControlPointAt(x, y);
            if (controlPoint) {
                if (controlPoint === 'rotate') {
                    isRotatingText = true;
                } else {
                    isResizingText = true;
                    resizeDirection = controlPoint;
                }
            } else if (isPointInTextBox(x, y)) {
                isDraggingText = true;
            }
            
            startX = x;
            startY = y;
        }
    } else if (e.touches.length === 2 && window.currentText) {
        // قرص التكبير للنص
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialScale = window.textScale || 1;
        initialAngle = Math.atan2(dy, dx);
        
        isResizingText = true;
        resizeDirection = 'scale';
        
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
    
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (isDraggingText) {
            const deltaX = x - startX;
            const deltaY = y - startY;
            
            textX += deltaX / canvas.width;
            textY += deltaY / canvas.height;
            
            textX = Math.max(0.1, Math.min(0.9, textX));
            textY = Math.max(0.1, Math.min(0.9, textY));
            
            startX = x;
            startY = y;
            
        } else if (isResizingText) {
            if (resizeDirection === 'scale') {
                // قياس ذو إصبعين
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                if (touch1 && touch2) {
                    const dx = touch2.clientX - touch1.clientX;
                    const dy = touch2.clientY - touch1.clientY;
                    const currentDistance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (initialDistance > 0) {
                        const scaleMultiplier = currentDistance / initialDistance;
                        window.textScale = Math.max(0.2, Math.min(5, initialScale * scaleMultiplier));
                    }
                }
            } else {
                // تغيير الحجم من نقطة تحكم
                const deltaX = x - startX;
                const deltaY = y - startY;
                
                let scaleFactor = 1;
                if (resizeDirection.includes('right')) scaleFactor += deltaX / (textWidth * 2);
                if (resizeDirection.includes('left')) scaleFactor -= deltaX / (textWidth * 2);
                if (resizeDirection.includes('bottom')) scaleFactor += deltaY / (textHeight * 2);
                if (resizeDirection.includes('top')) scaleFactor -= deltaY / (textHeight * 2);
                
                window.textScale = Math.max(0.2, Math.min(5, window.textScale * scaleFactor));
            }
            
            startX = x;
            startY = y;
            
        } else if (isRotatingText) {
            const centerX = textX * canvas.width;
            const centerY = textY * canvas.height;
            const angle = Math.atan2(y - centerY, x - centerX);
            window.textRotation = (angle * (180 / Math.PI) + 90) % 360;
        }
        
    } else if (e.touches.length === 2 && isResizingText) {
        // قياس ذو إصبعين للتدوير والتكبير
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const currentAngle = Math.atan2(dy, dx);
        
        // حساب التكبير/التصغير
        if (initialDistance > 0) {
            const scaleMultiplier = currentDistance / initialDistance;
            window.textScale = Math.max(0.2, Math.min(5, initialScale * scaleMultiplier));
        }
        
        // حساب التدوير
        const angleChange = currentAngle - initialAngle;
        window.textRotation = (window.textRotation + angleChange * (180 / Math.PI)) % 360;
        initialAngle = currentAngle;
    }
    
    if (isDraggingText || isResizingText || isRotatingText) {
        lastRenderTime = now;
        renderFullCanvas();
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    isDraggingText = false;
    isResizingText = false;
    isRotatingText = false;
    stickerDragging = false;
    selectedSticker = null;
    resizeDirection = null;
    initialDistance = 0;
    initialScale = 1;
    initialAngle = 0;
    
    // تحديث شريط التحكم عند الانتهاء
    if (window.textScale !== undefined) {
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            const newValue = Math.round(window.textScale * 50);
            fontSizeSlider.value = Math.max(10, Math.min(100, newValue));
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = fontSizeSlider.value;
            }
        }
    }
}

function isTouchOnSticker(x, y, sticker) {
    return x >= sticker.x && x <= sticker.x + sticker.width &&
           y >= sticker.y && y <= sticker.y + sticker.height;
}

function isPointInTextBox(x, y) {
    const centerX = textX * canvas.width;
    const centerY = textY * canvas.height;
    const halfWidth = textWidth / 2;
    const halfHeight = textHeight / 2;
    
    // التحويل إلى نظام إحداثيات النص
    const cos = Math.cos(-textRotation * Math.PI / 180);
    const sin = Math.sin(-textRotation * Math.PI / 180);
    
    const dx = x - centerX;
    const dy = y - centerY;
    
    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;
    
    return Math.abs(rotatedX) <= halfWidth && Math.abs(rotatedY) <= halfHeight;
}

function getControlPointAt(x, y) {
    if (!window.currentText || window.currentText.trim() === '') return null;
    
    const points = controlPoints;
    const radius = 15;
    
    // التحقق من نقطة التدوير
    const dx = x - points.rotate.x;
    const dy = y - points.rotate.y;
    if (Math.sqrt(dx * dx + dy * dy) <= radius) return 'rotate';
    
    // التحقق من نقاط تغيير الحجم
    if (Math.abs(x - points.topLeft.x) <= radius && Math.abs(y - points.topLeft.y) <= radius) return 'top-left';
    if (Math.abs(x - points.topRight.x) <= radius && Math.abs(y - points.topRight.y) <= radius) return 'top-right';
    if (Math.abs(x - points.bottomLeft.x) <= radius && Math.abs(y - points.bottomLeft.y) <= radius) return 'bottom-left';
    if (Math.abs(x - points.bottomRight.x) <= radius && Math.abs(y - points.bottomRight.y) <= radius) return 'bottom-right';
    
    return null;
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

// دالة جديدة لحذف النص
function deleteCurrentText() {
    window.currentText = '';
    renderFullCanvas();
    showAlert('تم حذف النص', 'success');
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
    
    // إعادة حساب أبعاد النص
    textWidth = canvas.width * 0.4;
    textHeight = canvas.height * 0.15;
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
        window.textScale = 1;
        window.textRotation = 0;
        
        // إعادة تعيين أبعاد النص
        textWidth = canvas.width * 0.4;
        textHeight = canvas.height * 0.15;
        
        // تحديث شريط التحكم
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = 50;
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = '50';
            }
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
            drawTextControls();
        }
        
    } catch (error) {
        console.error('Error rendering canvas:', error);
    } finally {
        isRendering = false;
        lastRenderTime = now;
    }
}

function renderTextContent() {
    const fontFamily = window.currentFontFamily || "Arial, sans-serif";
    const fontWeight = window.currentFontWeight || "bold";
    const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
    const shadowEnabled = document.getElementById('shadowEnabled')?.checked !== false;
    const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
    const text = window.currentText || '';
    
    const textColor = window.currentTextColor || '#FFFFFF';
    const strokeColor = window.currentStrokeColor || '#000000';
    const cardColor = window.currentCardColor || '#000000';
    
    // حساب حجم الخط بناءً على حجم الكانفاس وعامل التحجيم
    const baseFontSize = Math.min(canvas.width, canvas.height) * 0.08;
    let finalFontSize = baseFontSize * (window.textScale || 1);
    
    // حفظ أبعاد النص لاستخدامها في التحكم
    ctx.save();
    ctx.font = fontWeight + ' ' + finalFontSize + 'px ' + fontFamily;
    
    const maxLineWidth = canvas.width * 0.9 * (window.textScale || 1);
    const lines = wrapText(text, maxLineWidth, ctx, finalFontSize);
    
    const lineHeight = finalFontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    
    // حساب أبعاد المربع المحيط
    let maxWidth = 0;
    lines.forEach(line => {
        const width = ctx.measureText(line).width;
        if (width > maxWidth) maxWidth = width;
    });
    
    textWidth = maxWidth + (finalFontSize * 0.5 * 2); // مع الهوامش
    textHeight = totalHeight + (finalFontSize * 0.5);
    
    ctx.restore();
    
    const centerX = textX * canvas.width;
    const centerY = textY * canvas.height;
    
    ctx.save();
    
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
    
    // رسم خلفية النص
    if (cardEnabled) {
        ctx.save();
        ctx.fillStyle = cardColor;
        ctx.globalAlpha = bgOpacity / 100;
        ctx.fillRect(-textWidth/2, -textHeight/2, textWidth, textHeight);
        ctx.restore();
    }
    
    // رسم النص نفسه
    lines.forEach((line, index) => {
        const y = -(totalHeight / 2) + (index * lineHeight) + (lineHeight / 2);
        const x = 0;
        
        if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(line, x, y);
        }
        
        ctx.fillStyle = textColor;
        ctx.fillText(line, x, y);
    });
    
    ctx.restore();
    
    // حفظ مربع النص
    textBoundingBox = {
        x: centerX - textWidth/2,
        y: centerY - textHeight/2,
        width: textWidth,
        height: textHeight
    };
}

function drawTextControls() {
    if (!window.currentText || window.currentText.trim() === '') return;
    
    const centerX = textX * canvas.width;
    const centerY = textY * canvas.height;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((window.textRotation || 0) * Math.PI / 180);
    
    // رسم مربع التحكم حول النص
    ctx.strokeStyle = '#0a84ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-textWidth/2, -textHeight/2, textWidth, textHeight);
    ctx.setLineDash([]);
    
    // رسم نقاط التحكم
    const controlSize = 10;
    const halfWidth = textWidth / 2;
    const halfHeight = textHeight / 2;
    
    // تحديث نقاط التحكم
    controlPoints.topLeft = { x: -halfWidth, y: -halfHeight };
    controlPoints.topRight = { x: halfWidth, y: -halfHeight };
    controlPoints.bottomLeft = { x: -halfWidth, y: halfHeight };
    controlPoints.bottomRight = { x: halfWidth, y: halfHeight };
    controlPoints.rotate = { x: 0, y: -halfHeight - 40 };
    
    // رسم نقاط التحكم
    ctx.fillStyle = '#0a84ff';
    
    // الزوايا
    ctx.fillRect(-halfWidth - controlSize/2, -halfHeight - controlSize/2, controlSize, controlSize);
    ctx.fillRect(halfWidth - controlSize/2, -halfHeight - controlSize/2, controlSize, controlSize);
    ctx.fillRect(-halfWidth - controlSize/2, halfHeight - controlSize/2, controlSize, controlSize);
    ctx.fillRect(halfWidth - controlSize/2, halfHeight - controlSize/2, controlSize, controlSize);
    
    // رسم زر التدوير
    ctx.beginPath();
    ctx.arc(0, -halfHeight - 40, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#0a84ff';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(0, -halfHeight - 40, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(0, -halfHeight - 55);
    ctx.lineTo(0, -halfHeight - 45);
    ctx.lineTo(5, -halfHeight - 40);
    ctx.lineTo(-5, -halfHeight - 40);
    ctx.closePath();
    ctx.fillStyle = '#0a84ff';
    ctx.fill();
    
    // رسم زر الحذف
    ctx.beginPath();
    ctx.arc(halfWidth + 20, -halfHeight - 20, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3b30';
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', halfWidth + 20, -halfHeight - 20);
    
    ctx.restore();
    
    // تحويل نقاط التحكم إلى إحداثيات الكانفاس
    const cos = Math.cos((window.textRotation || 0) * Math.PI / 180);
    const sin = Math.sin((window.textRotation || 0) * Math.PI / 180);
    
    Object.keys(controlPoints).forEach(key => {
        const point = controlPoints[key];
        const tx = point.x * cos - point.y * sin + centerX;
        const ty = point.x * sin + point.y * cos + centerY;
        controlPoints[key] = { x: tx, y: ty };
    });
    
    // نقطة حذف خاصة
    const deleteX = halfWidth + 20;
    const deleteY = -halfHeight - 20;
    const deleteTx = deleteX * cos - deleteY * sin + centerX;
    const deleteTy = deleteX * sin + deleteY * cos + centerY;
    
    // التحقق من النقر على زر الحذف
    canvas.addEventListener('click', function checkDelete(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const distance = Math.sqrt(
            Math.pow(x - deleteTx, 2) + Math.pow(y - deleteTy, 2)
        );
        
        if (distance <= 12) {
            deleteCurrentText();
            canvas.removeEventListener('click', checkDelete);
        }
    }, { once: true });
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
    
    // استخدام الأبعاد الأصلية مع حد أدنى للحفاظ على الجودة
    const exportWidth = Math.max(originalImageWidth, 800);
    const exportHeight = Math.max(originalImageHeight, 600);
    
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const exportCtx = exportCanvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';
    
    exportCtx.save();
    
    const scaleX = exportWidth / (canvas.width - (imageBorderWidth * 2));
    const scaleY = exportHeight / (canvas.height - (imageBorderWidth * 2));
    const scale = Math.min(scaleX, scaleY);
    
    const scaledBorder = imageBorderWidth * scale;
    const imageWidth = exportWidth;
    const imageHeight = exportHeight;
    
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
        const fontFamily = window.currentFontFamily || "Arial, sans-serif";
        const fontWeight = window.currentFontWeight || "bold";
        
        const textColor = window.currentTextColor || '#FFFFFF';
        const strokeColor = window.currentStrokeColor || '#000000';
        const cardColor = window.currentCardColor || '#000000';
        
        const baseFontSize = Math.min(exportCanvas.width, exportCanvas.height) * 0.08;
        const scaledFontSize = baseFontSize * (window.textScale || 1);
        const scaledStrokeWidth = strokeWidth * scale;
        
        exportCtx.font = fontWeight + ' ' + scaledFontSize + 'px ' + fontFamily;
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
            exportCtx.shadowBlur = shadowIntensity * scale;
            exportCtx.shadowOffsetX = (shadowIntensity / 2) * scale;
            exportCtx.shadowOffsetY = (shadowIntensity / 2) * scale;
        }
        
        lines.forEach((line, index) => {
            const y = -(totalHeight / 2) + (index * lineHeight) + (lineHeight / 2);
            const x = 0;
            
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
window.deleteCurrentText = deleteCurrentText;
window.rotateImage = rotateImage;
window.flipImageH = flipImageH;
window.flipImageV = flipImageV;
window.applyFilter = applyFilter;
window.setBorderColor = setBorderColor;
window.FILTERS = FILTERS;
