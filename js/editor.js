// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;
let originalImageWidth = 0;
let originalImageHeight = 0;

// متغيرات التحكم الحر بالنص
let textBounds = { x: 0, y: 0, width: 200, height: 100 };
let isDraggingText = false;
let isResizingText = false;
let isRotatingText = false;
let dragStartX = 0;
let dragStartY = 0;
let activeHandle = null;

// متغيرات تأثيرات الصورة
let imageBlur = 0;
let imageRotation = 0;
let imageFlipH = false;
let imageFlipV = false;
let imageBorderWidth = 0;
let imageBorderColor = '#000000';

// متغيرات الخلفية
let backgroundColor = '#FFFFFF';
let squareColor = '#FFFFFF';
let squareRatio = 80;
let backgroundSize = 'original';

let shadowIntensity = 5;
let bgOpacity = 70;

window.imageBorderColor = imageBorderColor;

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
    
    if (window.textScale === undefined) window.textScale = 1;
    if (window.textRotation === undefined) window.textRotation = 0;
    
    if (typeof initializeFonts === 'function') {
        initializeFonts();
    }
    
    if (typeof initializeColors === 'function') {
        initializeColors();
    }
    
    setupEventListeners();
    setupImageControls();
    setupTextEffectsControls();
    setupTextHandles();
    
    console.log('Editor initialized');
});

function setupTextHandles() {
    canvas.addEventListener('mousedown', handleTextMouseDown);
    canvas.addEventListener('mousemove', handleTextMouseMove);
    canvas.addEventListener('mouseup', handleTextMouseUp);
    canvas.addEventListener('touchstart', handleTextTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTextTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTextTouchEnd, { passive: false });
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function handleTextMouseDown(e) {
    if (!window.currentText || !window.currentText.trim()) return;
    
    const coords = getCanvasCoordinates(e);
    const handle = getHandleAtPosition(coords.x, coords.y);
    
    if (handle) {
        activeHandle = handle;
        if (handle === 'rotate') {
            isRotatingText = true;
        } else {
            isResizingText = true;
        }
        dragStartX = coords.x;
        dragStartY = coords.y;
        e.preventDefault();
    } else if (isPointInTextBounds(coords.x, coords.y)) {
        isDraggingText = true;
        dragStartX = coords.x - textBounds.x;
        dragStartY = coords.y - textBounds.y;
        e.preventDefault();
    }
}

function handleTextMouseMove(e) {
    if (!isDraggingText && !isResizingText && !isRotatingText) return;
    
    const coords = getCanvasCoordinates(e);
    
    if (isDraggingText) {
        textBounds.x = coords.x - dragStartX;
        textBounds.y = coords.y - dragStartY;
        renderFullCanvas();
    } else if (isResizingText && activeHandle) {
        resizeTextBounds(coords.x, coords.y, activeHandle);
        renderFullCanvas();
    } else if (isRotatingText) {
        const centerX = textBounds.x + textBounds.width / 2;
        const centerY = textBounds.y + textBounds.height / 2;
        const angle = Math.atan2(coords.y - centerY, coords.x - centerX);
        window.textRotation = (angle * 180 / Math.PI + 90) % 360;
        renderFullCanvas();
    }
}

function handleTextMouseUp(e) {
    isDraggingText = false;
    isResizingText = false;
    isRotatingText = false;
    activeHandle = null;
}

function handleTextTouchStart(e) {
    handleTextMouseDown(e);
}

function handleTextTouchMove(e) {
    handleTextMouseMove(e);
}

function handleTextTouchEnd(e) {
    handleTextMouseUp(e);
}

function getHandleAtPosition(x, y) {
    const handleSize = 20;
    const handles = [
        { name: 'nw', x: textBounds.x, y: textBounds.y },
        { name: 'ne', x: textBounds.x + textBounds.width, y: textBounds.y },
        { name: 'sw', x: textBounds.x, y: textBounds.y + textBounds.height },
        { name: 'se', x: textBounds.x + textBounds.width, y: textBounds.y + textBounds.height },
        { name: 'rotate', x: textBounds.x + textBounds.width / 2, y: textBounds.y - 30 }
    ];
    
    for (const handle of handles) {
        if (Math.abs(x - handle.x) < handleSize && Math.abs(y - handle.y) < handleSize) {
            return handle.name;
        }
    }
    return null;
}

function isPointInTextBounds(x, y) {
    return x >= textBounds.x && x <= textBounds.x + textBounds.width &&
           y >= textBounds.y && y <= textBounds.y + textBounds.height;
}

function resizeTextBounds(x, y, handle) {
    switch (handle) {
        case 'nw':
            textBounds.width += textBounds.x - x;
            textBounds.height += textBounds.y - y;
            textBounds.x = x;
            textBounds.y = y;
            break;
        case 'ne':
            textBounds.width = x - textBounds.x;
            textBounds.height += textBounds.y - y;
            textBounds.y = y;
            break;
        case 'sw':
            textBounds.width += textBounds.x - x;
            textBounds.height = y - textBounds.y;
            textBounds.x = x;
            break;
        case 'se':
            textBounds.width = x - textBounds.x;
            textBounds.height = y - textBounds.y;
            break;
    }
    
    textBounds.width = Math.max(50, textBounds.width);
    textBounds.height = Math.max(30, textBounds.height);
    
    window.textScale = textBounds.width / 200;
}

function drawTextHandles() {
    if (!window.currentText || !window.currentText.trim()) return;
    
    ctx.save();
    ctx.strokeStyle = '#9b87f5';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(textBounds.x, textBounds.y, textBounds.width, textBounds.height);
    ctx.setLineDash([]);
    
    const handleSize = 12;
    const handles = [
        { x: textBounds.x, y: textBounds.y },
        { x: textBounds.x + textBounds.width, y: textBounds.y },
        { x: textBounds.x, y: textBounds.y + textBounds.height },
        { x: textBounds.x + textBounds.width, y: textBounds.y + textBounds.height }
    ];
    
    ctx.fillStyle = '#9b87f5';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    handles.forEach(handle => {
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });
    
    const rotateX = textBounds.x + textBounds.width / 2;
    const rotateY = textBounds.y - 30;
    ctx.fillStyle = '#34c759';
    ctx.beginPath();
    ctx.arc(rotateX, rotateY, handleSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
}

function setupTextEffectsControls() {
    const shadowSlider = document.getElementById('shadowSlider');
    if (shadowSlider) {
        shadowSlider.addEventListener('input', (e) => {
            shadowIntensity = parseInt(e.target.value);
            const display = document.getElementById('shadowDisplay');
            if (display) display.textContent = shadowIntensity;
            renderFullCanvas();
        });
    }
    
    const bgOpacitySlider = document.getElementById('bgOpacitySlider');
    if (bgOpacitySlider) {
        bgOpacitySlider.addEventListener('input', (e) => {
            bgOpacity = parseInt(e.target.value);
            const display = document.getElementById('bgOpacityDisplay');
            if (display) display.textContent = bgOpacity;
            renderFullCanvas();
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
        blurSlider.addEventListener('input', (e) => {
            imageBlur = parseInt(e.target.value);
            const display = document.getElementById('blurDisplay');
            if (display) display.textContent = imageBlur;
            renderFullCanvas();
        });
    }
    
    const borderSlider = document.getElementById('borderSlider');
    if (borderSlider) {
        borderSlider.addEventListener('input', (e) => {
            imageBorderWidth = parseInt(e.target.value);
            const display = document.getElementById('borderDisplay');
            if (display) display.textContent = imageBorderWidth;
            renderFullCanvas();
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

function setupEventListeners() {
    const strokeWidth = document.getElementById('strokeWidth');
    const shadowEnabled = document.getElementById('shadowEnabled');
    const cardEnabled = document.getElementById('cardEnabled');

    if (strokeWidth) {
        strokeWidth.addEventListener('input', (e) => {
            const display = document.getElementById('strokeWidthDisplay');
            if (display) {
                display.textContent = e.target.value;
            }
            renderFullCanvas();
        });
    }
    
    if (shadowEnabled) {
        shadowEnabled.addEventListener('change', () => {
            renderFullCanvas();
        });
    }
    
    if (cardEnabled) {
        cardEnabled.addEventListener('change', () => {
            renderFullCanvas();
        });
    }

    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = value;
            }
            
            window.textScale = value / 50;
            textBounds.width = 200 * window.textScale;
            renderFullCanvas();
        });
    }
}

function loadImageToEditor(imageUrl) {
    console.log('Loading image to editor:', imageUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        currentImage = img;
        imageLoaded = true;
        
        originalImageWidth = img.naturalWidth || img.width;
        originalImageHeight = img.naturalHeight || img.height;
        
        canvas.width = Math.min(originalImageWidth, 1200);
        canvas.height = Math.min(originalImageHeight, 800);
        
        textBounds = {
            x: canvas.width / 2 - 100,
            y: canvas.height / 2 - 50,
            width: 200,
            height: 100
        };
        
        renderFullCanvas();
    };
    
    img.onerror = function(error) {
        console.error('Failed to load image:', error);
        showAlert('فشل تحميل الصورة', 'error');
    };
    
    img.src = imageUrl;
}

function renderFullCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الخلفية
    ctx.fillStyle = backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // رسم المربع
    const squareSize = Math.min(canvas.width, canvas.height) * (squareRatio / 100);
    const squareX = (canvas.width - squareSize) / 2;
    const squareY = (canvas.height - squareSize) / 2;
    
    ctx.fillStyle = squareColor || '#FFFFFF';
    ctx.fillRect(squareX, squareY, squareSize, squareSize);
    
    if (imageLoaded && currentImage) {
        ctx.save();
        
        const borderSpace = imageBorderWidth;
        let imageWidth = canvas.width - (borderSpace * 2);
        let imageHeight = canvas.height - (borderSpace * 2);
        
        const x = (canvas.width - imageWidth) / 2;
        const y = (canvas.height - imageHeight) / 2;
        
        ctx.translate(x + imageWidth / 2, y + imageHeight / 2);
        ctx.rotate(imageRotation * Math.PI / 180);
        
        if (imageFlipH) ctx.scale(-1, 1);
        if (imageFlipV) ctx.scale(1, -1);
        
        if (imageBlur > 0) {
            ctx.filter = `blur(${imageBlur}px)`;
        }
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(currentImage, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
        ctx.filter = 'none';
        ctx.restore();
        
        if (imageBorderWidth > 0) {
            ctx.strokeStyle = imageBorderColor;
            ctx.lineWidth = imageBorderWidth;
            ctx.strokeRect(
                imageBorderWidth / 2,
                imageBorderWidth / 2,
                canvas.width - imageBorderWidth,
                canvas.height - imageBorderWidth
            );
        }
    }
    
    if (window.currentText && window.currentText.trim() !== '') {
        renderTextContent();
        drawTextHandles();
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
    
    const baseFontSize = textBounds.height * 0.8;
    
    ctx.save();
    ctx.font = 'bold ' + baseFontSize + 'px ' + fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    
    const centerX = textBounds.x + textBounds.width / 2;
    const centerY = textBounds.y + textBounds.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate((window.textRotation || 0) * Math.PI / 180);
    
    if (shadowEnabled) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = shadowIntensity;
        ctx.shadowOffsetX = shadowIntensity / 2;
        ctx.shadowOffsetY = shadowIntensity / 2;
    }
    
    if (cardEnabled) {
        const textMetrics = ctx.measureText(text);
        const padding = baseFontSize * 0.5;
        const bgWidth = textMetrics.width + (padding * 2);
        const bgHeight = baseFontSize + padding;
        
        ctx.save();
        ctx.fillStyle = cardColor;
        ctx.globalAlpha = bgOpacity / 100;
        ctx.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);
        ctx.restore();
    }
    
    if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(text, 0, 0);
    }
    
    ctx.fillStyle = textColor;
    ctx.fillText(text, 0, 0);
    
    ctx.restore();
}

function prepareImageForExport() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    
    const exportCtx = exportCanvas.getContext('2d');
    exportCtx.drawImage(canvas, 0, 0);
    
    return exportCanvas;
}

function updateBackground() {
    backgroundColor = window.currentBackgroundColor || '#FFFFFF';
    squareColor = window.currentSquareColor || '#FFFFFF';
    squareRatio = window.squareRatio || 80;
    renderFullCanvas();
}

function resetEditor() {
    if (confirm('هل تريد مسح جميع التعديلات؟')) {
        window.currentText = '';
        window.textScale = 1;
        window.textRotation = 0;
        imageBlur = 0;
        imageRotation = 0;
        imageFlipH = false;
        imageFlipV = false;
        imageBorderWidth = 0;
        
        textBounds = {
            x: canvas.width / 2 - 100,
            y: canvas.height / 2 - 50,
            width: 200,
            height: 100
        };
        
        renderFullCanvas();
        showAlert('تم إعادة تعيين المحرر', 'success');
    }
}

window.prepareImageForExport = prepareImageForExport;
window.renderFullCanvas = renderFullCanvas;
window.loadImageToEditor = loadImageToEditor;
window.rotateImage = rotateImage;
window.flipImageH = flipImageH;
window.flipImageV = flipImageV;
window.updateBackground = updateBackground;
window.resetEditor = resetEditor;
