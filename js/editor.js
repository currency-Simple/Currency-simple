// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;
let originalImageWidth = 0;
let originalImageHeight = 0;
let highQualityImage = null;

// تهيئة المحرر
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d', { alpha: false });
    
    // تحسين جودة الرسم
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    initializeFonts();
    initializeColors();
    setupEventListeners();
    
    // إضافة زر حذف النص
    if (typeof addDeleteTextButton === 'function') {
        setTimeout(addDeleteTextButton, 500);
    }
    
    console.log('Editor initialized');
});

// إعداد الأحداث
function setupEventListeners() {
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const strokeWidth = document.getElementById('strokeWidth');
    const shadowEnabled = document.getElementById('shadowEnabled');
    const cardEnabled = document.getElementById('cardEnabled');

    if (fontSize) {
        fontSize.addEventListener('input', (e) => {
            document.getElementById('fontSizeDisplay').textContent = e.target.value;
            updateTextOnCanvas();
        });
    }
    
    if (strokeWidth) {
        strokeWidth.addEventListener('input', (e) => {
            document.getElementById('strokeWidthDisplay').textContent = e.target.value;
            updateTextOnCanvas();
        });
    }
    
    if (fontFamily) fontFamily.addEventListener('change', updateTextOnCanvas);
    if (shadowEnabled) shadowEnabled.addEventListener('change', updateTextOnCanvas);
    if (cardEnabled) cardEnabled.addEventListener('change', updateTextOnCanvas);
}

// تحديث النص على Canvas فوراً
function updateTextOnCanvas() {
    if (window.currentText && window.currentText.trim() !== '') {
        renderTextOnCanvas(false);
    }
}

// تحميل الصورة بجودة عالية
function loadImageToEditor(imageUrl) {
    showLoadingIndicator('جاري تحميل الصورة...');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        currentImage = img;
        imageLoaded = true;
        
        // حفظ الأبعاد الأصلية
        originalImageWidth = img.naturalWidth || img.width;
        originalImageHeight = img.naturalHeight || img.height;
        
        console.log(`أبعاد الصورة الأصلية: ${originalImageWidth}x${originalImageHeight}`);
        
        // تحميل نسخة عالية الجودة للتصدير
        loadHighQualityImage(imageUrl);
        
        // حساب الحجم المناسب للعرض في المحرر
        const container = document.querySelector('.canvas-wrapper-fixed');
        if (!container) {
            hideLoadingIndicator();
            return;
        }
        
        const containerWidth = container.clientWidth - 20;
        const containerHeight = container.clientHeight - 20;
        
        // حساب نسبة التكبير/التصغير مع الحفاظ على نسبة 4:5
        const widthRatio = containerWidth / originalImageWidth;
        const heightRatio = containerHeight / originalImageHeight;
        const scale = Math.min(widthRatio, heightRatio, 1);
        
        // أبعاد العرض مع الحفاظ على الجودة
        const displayWidth = Math.round(originalImageWidth * scale);
        const displayHeight = Math.round(originalImageHeight * scale);
        
        // ضبط أبعاد Canvas للعرض فقط
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        
        // تعزيز جودة الرسم
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // رسم الصورة الأصلية بجودة عالية
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        
        // إعادة رسم النص إذا كان موجوداً
        if (window.currentText) {
            renderTextOnCanvas(false);
        }
        
        hideLoadingIndicator();
        console.log(`أبعاد العرض: ${displayWidth}x${displayHeight}`);
    };
    
    img.onerror = function(error) {
        console.error('فشل تحميل الصورة:', error);
        hideLoadingIndicator();
        showAlert('فشل تحميل الصورة. الرجاء المحاولة مرة أخرى.', 'error');
    };
    
    // إضافة timestamp لمنع الكاش
    img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
}

// تحميل نسخة عالية الجودة للتصدير
function loadHighQualityImage(imageUrl) {
    highQualityImage = new Image();
    highQualityImage.crossOrigin = 'anonymous';
    
    highQualityImage.onload = function() {
        console.log('تم تحميل الصورة عالية الجودة للتصدير');
    };
    
    highQualityImage.onerror = function() {
        console.warn('لم يتمكن من تحميل الصورة عالية الجودة، سيتم استخدام النسخة العادية');
        highQualityImage = currentImage;
    };
    
    // إضافة معلمات لجودة أفضل من Cloudinary
    let highQualityUrl = imageUrl;
    if (imageUrl.includes('cloudinary.com')) {
        // إضافة معلمات لتحسين الجودة
        highQualityUrl = imageUrl.replace(/\/upload\//, '/upload/q_auto:best,f_auto/');
    }
    
    highQualityImage.src = highQualityUrl + (highQualityUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
}

// دالة رسم النص (للعرض في المحرر)
function renderTextOnCanvas(forExport = false) {
    if (!imageLoaded || !currentImage) {
        console.error('لم يتم تحميل صورة');
        return false;
    }
    
    // إذا لم يكن هناك نص، فقط ارسم الصورة
    if (!window.currentText || window.currentText.trim() === '') {
        if (forExport) {
            return prepareHighQualityExport();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
            return true;
        }
    }
    
    try {
        let targetCanvas, targetCtx, targetWidth, targetHeight;
        
        if (forExport) {
            // للتصدير: نستخدم الأبعاد الأصلية للصورة
            targetWidth = originalImageWidth;
            targetHeight = originalImageHeight;
            targetCanvas = document.createElement('canvas');
            targetCanvas.width = targetWidth;
            targetCanvas.height = targetHeight;
            targetCtx = targetCanvas.getContext('2d', { alpha: false });
            targetCtx.imageSmoothingEnabled = true;
            targetCtx.imageSmoothingQuality = 'high';
            
            // استخدام الصورة عالية الجودة للرسم
            const exportImage = highQualityImage || currentImage;
            targetCtx.drawImage(exportImage, 0, 0, targetWidth, targetHeight);
        } else {
            // للعرض: نستخدم Canvas الحالي
            targetCanvas = canvas;
            targetCtx = ctx;
            targetWidth = canvas.width;
            targetHeight = canvas.height;
            
            // إعادة رسم الصورة
            ctx.clearRect(0, 0, targetWidth, targetHeight);
            ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);
        }
        
        // إعداد النص
        const fontFamily = document.getElementById('fontFamily')?.value || "'Amiri', serif";
        const fontSize = parseInt(document.getElementById('fontSize')?.value || "48");
        const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
        const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
        const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
        const text = window.currentText || '';
        
        // الحصول على الألوان الحالية
        const textColor = window.currentTextColor || '#FFFFFF';
        const strokeColor = window.currentStrokeColor || '#000000';
        const cardColor = window.currentCardColor || '#000000';
        
        // حساب حجم الخط المناسب ليتناسب مع عرض الصورة
        let finalFontSize = fontSize;
        if (forExport) {
            // تكبير النص للتصدير ليناسب حجم الصورة الكبير
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
        
        // تقسيم النص إلى أسطر مع عرض أكبر (90% من عرض الصورة)
        const maxLineWidth = targetWidth * 0.9; // 90% من العرض بدلاً من 80%
        const lines = wrapText(text, maxLineWidth, targetCtx, finalFontSize);
        
        // ضبط حجم الخط ليتناسب مع العرض مع منع التصغير المفرط
        let adjustedFontSize = finalFontSize;
        let adjustedLines = lines;
        
        // تكرار لضبط حجم الخط
        let attempts = 0;
        while (attempts < 10) {
            const testWidth = Math.max(...adjustedLines.map(line => targetCtx.measureText(line).width));
            if (testWidth <= maxLineWidth) {
                break;
            }
            adjustedFontSize -= Math.max(1, Math.floor(adjustedFontSize * 0.05));
            targetCtx.font = 'bold ' + adjustedFontSize + 'px ' + fontFamily;
            adjustedLines = wrapText(text, maxLineWidth, targetCtx, adjustedFontSize);
            attempts++;
        }
        
        // حساب ارتفاع النص الكلي مع تباعد أكبر
        const lineHeight = adjustedFontSize * 1.5; // زيادة التباعد بين الأسطر
        const totalHeight = adjustedLines.length * lineHeight;
        const startY = (targetHeight / 2) - (totalHeight / 2) + (lineHeight / 2);
        
        // إعداد الظل
        if (shadowEnabled) {
            targetCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            targetCtx.shadowBlur = forExport ? 12 : 8; // ظل أكبر للتصدير
            targetCtx.shadowOffsetX = forExport ? 6 : 4;
            targetCtx.shadowOffsetY = forExport ? 6 : 4;
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
                const padding = adjustedFontSize * 0.6; // زيادة padding
                const bgWidth = textMetrics.width + (padding * 2);
                const bgHeight = adjustedFontSize + padding;
                const bgX = x - (bgWidth / 2);
                const bgY = y - (adjustedFontSize / 2) - (padding / 2);
                
                targetCtx.save();
                targetCtx.fillStyle = cardColor;
                targetCtx.globalAlpha = 0.8; // زيادة العتامة
                targetCtx.fillRect(bgX, bgY, bgWidth, bgHeight);
                targetCtx.restore();
            }
            
            // رسم حواف النص
            if (strokeWidth > 0) {
                const exportStrokeWidth = forExport ? strokeWidth * 2 : strokeWidth;
                targetCtx.strokeStyle = strokeColor;
                targetCtx.lineWidth = exportStrokeWidth;
                targetCtx.strokeText(line, x, y);
            }
            
            // رسم النص نفسه
            targetCtx.fillStyle = textColor;
            targetCtx.fillText(line, x, y);
        });
        
        targetCtx.restore();
        
        return forExport ? targetCanvas : true;
        
    } catch (error) {
        console.error('خطأ في رسم النص:', error);
        return false;
    }
}

// دالة لتقسيم النص إلى أسطر
function wrapText(text, maxWidth, ctx, fontSize) {
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

// دالة خاصة للتصدير بجودة عالية
function prepareHighQualityExport() {
    if (!imageLoaded || !currentImage) {
        console.error('لم يتم تحميل صورة');
        return null;
    }
    
    try {
        // إنشاء Canvas بنفس حجم الصورة الأصلية
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = originalImageWidth;
        exportCanvas.height = originalImageHeight;
        const exportCtx = exportCanvas.getContext('2d', { alpha: false });
        
        // تعزيز جودة الرسم للتصدير
        exportCtx.imageSmoothingEnabled = true;
        exportCtx.imageSmoothingQuality = 'high';
        
        // استخدام الصورة عالية الجودة إذا كانت متاحة
        const sourceImage = highQualityImage || currentImage;
        
        // رسم الصورة الأصلية بحجمها الكامل
        exportCtx.drawImage(sourceImage, 0, 0, originalImageWidth, originalImageHeight);
        
        // إذا كان هناك نص، إضافته
        if (window.currentText && window.currentText.trim() !== '') {
            // حساب النسبة بين حجم العرض وحجم التصدير
            const displayScale = canvas.width / originalImageWidth;
            
            // إعداد النص مع الأبعاد الأصلية
            const fontFamily = document.getElementById('fontFamily')?.value || "'Amiri', serif";
            const fontSize = parseInt(document.getElementById('fontSize')?.value || "48");
            const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
            const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
            const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
            const text = window.currentText || '';
            
            // تكبير حجم الخط ليتناسب مع الصورة الأصلية
            const exportFontSize = Math.round(fontSize / displayScale);
            
            // الحصول على الألوان الحالية
            const textColor = window.currentTextColor || '#FFFFFF';
            const strokeColor = window.currentStrokeColor || '#000000';
            const cardColor = window.currentCardColor || '#000000';
            
            exportCtx.save();
            
            // إعداد الخط
            exportCtx.font = 'bold ' + exportFontSize + 'px ' + fontFamily;
            exportCtx.textAlign = 'center';
            exportCtx.textBaseline = 'middle';
            exportCtx.lineJoin = 'round';
            exportCtx.lineCap = 'round';
            exportCtx.direction = 'rtl';
            
            // تقسيم النص إلى أسطر
            const maxLineWidth = originalImageWidth * 0.9; // 90% من العرض
            const lines = wrapText(text, maxLineWidth, exportCtx, exportFontSize);
            
            // حساب ارتفاع النص الكلي
            const lineHeight = exportFontSize * 1.5;
            const totalHeight = lines.length * lineHeight;
            const startY = (originalImageHeight / 2) - (totalHeight / 2) + (lineHeight / 2);
            
            // إعداد الظل
            if (shadowEnabled) {
                exportCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                exportCtx.shadowBlur = 12;
                exportCtx.shadowOffsetX = 6;
                exportCtx.shadowOffsetY = 6;
            } else {
                exportCtx.shadowColor = 'transparent';
                exportCtx.shadowBlur = 0;
                exportCtx.shadowOffsetX = 0;
                exportCtx.shadowOffsetY = 0;
            }
            
            // رسم كل سطر
            lines.forEach((line, index) => {
                const y = startY + (index * lineHeight);
                const x = originalImageWidth / 2;
                
                // قياس عرض النص
                const textMetrics = exportCtx.measureText(line);
                
                // رسم خلفية النص
                if (cardEnabled) {
                    const padding = exportFontSize * 0.6;
                    const bgWidth = textMetrics.width + (padding * 2);
                    const bgHeight = exportFontSize + padding;
                    const bgX = x - (bgWidth / 2);
                    const bgY = y - (exportFontSize / 2) - (padding / 2);
                    
                    exportCtx.save();
                    exportCtx.fillStyle = cardColor;
                    exportCtx.globalAlpha = 0.8;
                    exportCtx.fillRect(bgX, bgY, bgWidth, bgHeight);
                    exportCtx.restore();
                }
                
                // رسم حواف النص
                if (strokeWidth > 0) {
                    exportCtx.strokeStyle = strokeColor;
                    exportCtx.lineWidth = strokeWidth * 2; // حواف أسمك للتصدير
                    exportCtx.strokeText(line, x, y);
                }
                
                // رسم النص نفسه
                exportCtx.fillStyle = textColor;
                exportCtx.fillText(line, x, y);
            });
            
            exportCtx.restore();
        }
        
        return exportCanvas;
        
    } catch (error) {
        console.error('خطأ في تحضير الصورة للتصدير:', error);
        return null;
    }
}

// جعل الدالة متاحة عالمياً
window.prepareHighQualityExport = prepareHighQualityExport;
