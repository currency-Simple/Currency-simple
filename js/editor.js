// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;
let originalImageWidth = 0;
let originalImageHeight = 0;

// تهيئة المحرر
window.addEventListener('DOMContentLoaded', () => {
    console.log('Editor initializing...');
    
    canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // تحسين جودة الرسم
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // تهيئة الخطوط والألوان
    if (typeof initializeFonts === 'function') {
        initializeFonts();
    }
    
    if (typeof initializeColors === 'function') {
        initializeColors();
    }
    
    setupEventListeners();
    
    console.log('Editor initialized');
});

// إعداد الأحداث
function setupEventListeners() {
    const fontSize = document.getElementById('fontSize');
    const strokeWidth = document.getElementById('strokeWidth');
    const fontFamily = document.getElementById('fontFamily');
    const shadowEnabled = document.getElementById('shadowEnabled');
    const cardEnabled = document.getElementById('cardEnabled');

    if (fontSize) {
        fontSize.addEventListener('input', (e) => {
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = e.target.value;
            }
            updateTextOnCanvas();
        });
    }
    
    if (strokeWidth) {
        strokeWidth.addEventListener('input', (e) => {
            const display = document.getElementById('strokeWidthDisplay');
            if (display) {
                display.textContent = e.target.value;
            }
            updateTextOnCanvas();
        });
    }
    
    if (fontFamily) {
        fontFamily.addEventListener('change', updateTextOnCanvas);
    }
    
    if (shadowEnabled) {
        shadowEnabled.addEventListener('change', updateTextOnCanvas);
    }
    
    if (cardEnabled) {
        cardEnabled.addEventListener('change', updateTextOnCanvas);
    }
}

// تحديث النص على Canvas فوراً
function updateTextOnCanvas() {
    if (window.currentText && window.currentText.trim() !== '') {
        renderTextOnCanvas(false);
    }
}

// تحميل الصورة
function loadImageToEditor(imageUrl) {
    console.log('Loading image to editor:', imageUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        console.log('Image loaded successfully');
        
        currentImage = img;
        imageLoaded = true;
        
        // حفظ الأبعاد الأصلية
        originalImageWidth = img.naturalWidth || img.width;
        originalImageHeight = img.naturalHeight || img.height;
        
        console.log(`Original image dimensions: ${originalImageWidth}x${originalImageHeight}`);
        
        // حساب الحجم المناسب للعرض
        const container = document.querySelector('.canvas-wrapper-fixed');
        if (!container) {
            console.error('Canvas container not found');
            return;
        }
        
        const containerWidth = container.clientWidth - 20;
        const containerHeight = container.clientHeight - 20;
        
        // حساب نسبة التكبير/التصغير
        const widthRatio = containerWidth / originalImageWidth;
        const heightRatio = containerHeight / originalImageHeight;
        const scale = Math.min(widthRatio, heightRatio, 1);
        
        // أبعاد العرض
        const displayWidth = Math.round(originalImageWidth * scale);
        const displayHeight = Math.round(originalImageHeight * scale);
        
        // ضبط أبعاد Canvas
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        
        // تحسين جودة الرسم
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // رسم الصورة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        
        console.log(`Display dimensions: ${displayWidth}x${displayHeight}`);
        
        // إعادة رسم النص إذا كان موجوداً
        if (window.currentText) {
            renderTextOnCanvas(false);
        }
    };
    
    img.onerror = function(error) {
        console.error('Failed to load image:', error);
        showAlert('فشل تحميل الصورة. الرجاء المحاولة مرة أخرى.', 'error');
    };
    
    img.src = imageUrl;
}

// دالة رسم النص
function renderTextOnCanvas(forExport = false) {
    if (!imageLoaded || !currentImage) {
        console.error('No image loaded');
        return false;
    }
    
    // إذا لم يكن هناك نص، ارسم الصورة فقط
    if (!window.currentText || window.currentText.trim() === '') {
        if (forExport) {
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = originalImageWidth;
            exportCanvas.height = originalImageHeight;
            const exportCtx = exportCanvas.getContext('2d');
            
            exportCtx.imageSmoothingEnabled = true;
            exportCtx.imageSmoothingQuality = 'high';
            exportCtx.drawImage(currentImage, 0, 0, originalImageWidth, originalImageHeight);
            
            return exportCanvas;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
            return true;
        }
    }
    
    try {
        let targetCanvas, targetCtx, targetWidth, targetHeight;
        
        if (forExport) {
            // للتصدير: استخدام الأبعاد الأصلية
            targetWidth = originalImageWidth;
            targetHeight = originalImageHeight;
            targetCanvas = document.createElement('canvas');
            targetCanvas.width = targetWidth;
            targetCanvas.height = targetHeight;
            targetCtx = targetCanvas.getContext('2d');
            targetCtx.imageSmoothingEnabled = true;
            targetCtx.imageSmoothingQuality = 'high';
            targetCtx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);
        } else {
            // للعرض: استخدام Canvas الحالي
            targetCanvas = canvas;
            targetCtx = ctx;
            targetWidth = canvas.width;
            targetHeight = canvas.height;
            
            // إعادة رسم الصورة
            ctx.clearRect(0, 0, targetWidth, targetHeight);
            ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);
        }
        
        // الحصول على إعدادات النص
        const fontFamily = document.getElementById('fontFamily')?.value || "'Amiri', serif";
        const fontSize = parseInt(document.getElementById('fontSize')?.value || "48");
        const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
        const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
        const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
        const text = window.currentText || '';
        
        // الحصول على الألوان
        const textColor = window.currentTextColor || '#FFFFFF';
        const strokeColor = window.currentStrokeColor || '#000000';
        const cardColor = window.currentCardColor || '#000000';
        
        // حساب حجم الخط المناسب
        let finalFontSize = fontSize;
        if (forExport) {
            // تكبير النص للتصدير
            const scale = targetWidth / canvas.width;
            finalFontSize = Math.round(fontSize * scale);
        }
        
        targetCtx.save();
        
        // إعداد الخط
        targetCtx.font = 'bold ' + finalFontSize + 'px ' + fontFamily;
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.lineJoin = 'round';
        targetCtx.lineCap = 'round';
        targetCtx.direction = 'rtl';
        
        // تقسيم النص إلى أسطر (90% من عرض الصورة)
        const maxLineWidth = targetWidth * 0.9;
        const lines = wrapText(text, maxLineWidth, targetCtx, finalFontSize);
        
        // ضبط حجم الخط
        let adjustedFontSize = finalFontSize;
        let adjustedLines = lines;
        
        for (let i = 0; i < 10; i++) {
            const maxWidth = Math.max(...adjustedLines.map(line => targetCtx.measureText(line).width));
            if (maxWidth <= maxLineWidth) {
                break;
            }
            adjustedFontSize -= Math.max(1, Math.floor(adjustedFontSize * 0.05));
            targetCtx.font = 'bold ' + adjustedFontSize + 'px ' + fontFamily;
            adjustedLines = wrapText(text, maxLineWidth, targetCtx, adjustedFontSize);
        }
        
        // حساب ارتفاع النص
        const lineHeight = adjustedFontSize * 1.4;
        const totalHeight = adjustedLines.length * lineHeight;
        const startY = (targetHeight / 2) - (totalHeight / 2) + (lineHeight / 2);
        
        // إعداد الظل
        if (shadowEnabled) {
            targetCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            targetCtx.shadowBlur = forExport ? 10 : 6;
            targetCtx.shadowOffsetX = forExport ? 5 : 3;
            targetCtx.shadowOffsetY = forExport ? 5 : 3;
        } else {
            targetCtx.shadowColor = 'transparent';
            targetCtx.shadowBlur = 0;
            targetCtx.shadowOffsetX = 0;
            targetCtx.shadowOffsetY = 0;
        }
        
        // رسم كل سطر
        adjustedLines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            const x = targetWidth / 2;
            
            // قياس عرض النص
            const textMetrics = targetCtx.measureText(line);
            
            // رسم خلفية النص
            if (cardEnabled) {
                const padding = adjustedFontSize * 0.5;
                const bgWidth = textMetrics.width + (padding * 2);
                const bgHeight = adjustedFontSize + padding;
                const bgX = x - (bgWidth / 2);
                const bgY = y - (adjustedFontSize / 2) - (padding / 2);
                
                targetCtx.save();
                targetCtx.fillStyle = cardColor;
                targetCtx.globalAlpha = 0.7;
                targetCtx.fillRect(bgX, bgY, bgWidth, bgHeight);
                targetCtx.restore();
            }
            
            // رسم حواف النص
            if (strokeWidth > 0) {
                targetCtx.strokeStyle = strokeColor;
                targetCtx.lineWidth = forExport ? strokeWidth * 2 : strokeWidth;
                targetCtx.strokeText(line, x, y);
            }
            
            // رسم النص
            targetCtx.fillStyle = textColor;
            targetCtx.fillText(line, x, y);
        });
        
        targetCtx.restore();
        
        return forExport ? targetCanvas : true;
        
    } catch (error) {
        console.error('Error rendering text:', error);
        return false;
    }
}

// دالة لتقسيم النص إلى أسطر
function wrapText(text, maxWidth, ctx, fontSize) {
    if (!text) return [];
    
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
    
    return lines;
}

// دالة خاصة للتصدير
function prepareImageForExport() {
    return renderTextOnCanvas(true);
}

// جعل الدالة متاحة عالمياً
window.prepareImageForExport = prepareImageForExport;
window.renderTextOnCanvas = renderTextOnCanvas;
window.updateTextOnCanvas = updateTextOnCanvas;
window.loadImageToEditor = loadImageToEditor;
