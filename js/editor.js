// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;

// تهيئة المحرر
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
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
            if (window.currentText) {
                renderTextOnCanvas(false);
            }
        });
    }
    
    if (strokeWidth) {
        strokeWidth.addEventListener('input', (e) => {
            document.getElementById('strokeWidthDisplay').textContent = e.target.value;
            if (window.currentText) {
                renderTextOnCanvas(false);
            }
        });
    }
    
    if (fontFamily) fontFamily.addEventListener('change', () => {
        if (window.currentText) {
            renderTextOnCanvas(false);
        }
    });
    if (shadowEnabled) shadowEnabled.addEventListener('change', () => {
        if (window.currentText) {
            renderTextOnCanvas(false);
        }
    });
    if (cardEnabled) cardEnabled.addEventListener('change', () => {
        if (window.currentText) {
            renderTextOnCanvas(false);
        }
    });
}

// تحميل الصورة
function loadImageToEditor(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        currentImage = img;
        imageLoaded = true;
        
        // الحفاظ على نسبة العرض والارتفاع الأصلية للصورة
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;
        
        // حساب الحجم المناسب للعرض في المحرر
        const container = document.querySelector('.canvas-wrapper-fixed');
        if (!container) return;
        
        const containerWidth = container.clientWidth - 20;
        const containerHeight = container.clientHeight - 20;
        
        // حساب نسبة التكبير/التصغير
        const widthRatio = containerWidth / originalWidth;
        const heightRatio = containerHeight / originalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1);
        
        // أبعاد العرض
        const displayWidth = originalWidth * scale;
        const displayHeight = originalHeight * scale;
        
        // ضبط أبعاد Canvas للعرض فقط
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        
        // تنظيف Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // إعدادات جودة عالية للرسم
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // رسم الصورة الأصلية
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        
        // إعادة رسم النص إذا كان موجوداً
        if (window.currentText) {
            renderTextOnCanvas(false);
        }
    };
    
    img.onerror = function(error) {
        console.error('فشل تحميل الصورة:', error);
        showAlert('فشل تحميل الصورة. الرجاء المحاولة مرة أخرى.', 'error');
    };
    
    img.src = imageUrl;
}

// دالة رسم النص
function renderTextOnCanvas(forExport = false) {
    if (!imageLoaded || !currentImage) {
        console.error('لم يتم تحميل صورة');
        return false;
    }
    
    // إذا لم يكن هناك نص، فقط ارسم الصورة
    if (!window.currentText || window.currentText.trim() === '') {
        if (forExport) {
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = currentImage.naturalWidth || currentImage.width;
            exportCanvas.height = currentImage.naturalHeight || currentImage.height;
            const exportCtx = exportCanvas.getContext('2d');
            exportCtx.drawImage(currentImage, 0, 0, exportCanvas.width, exportCanvas.height);
            return exportCanvas;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
            return true;
        }
    }
    
    try {
        // إنشاء Canvas بناءً على الغرض
        let targetCanvas, targetCtx;
        
        if (forExport) {
            // للتصدير: نستخدم Canvas بنفس حجم الصورة الأصلية
            const exportCanvas = document.createElement('canvas');
            const originalWidth = currentImage.naturalWidth || currentImage.width;
            const originalHeight = currentImage.naturalHeight || currentImage.height;
            
            exportCanvas.width = originalWidth;
            exportCanvas.height = originalHeight;
            targetCanvas = exportCanvas;
            targetCtx = exportCanvas.getContext('2d');
            
            // رسم الصورة الأصلية بحجمها الكامل
            targetCtx.drawImage(currentImage, 0, 0, originalWidth, originalHeight);
        } else {
            // للعرض: نستخدم Canvas الحالي
            targetCanvas = canvas;
            targetCtx = ctx;
            
            // إعادة رسم الصورة
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        }
        
        // إعداد النص
        const fontFamily = document.getElementById('fontFamily')?.value || "'Amiri', serif";
        const fontSize = parseInt(document.getElementById('fontSize')?.value || "48");
        const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
        const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
        const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
        const text = window.currentText || '';
        
        // حساب حجم الخط المناسب
        let finalFontSize = fontSize;
        if (forExport) {
            // تكبير النص للتصدير ليناسب حجم الصورة الكبير
            const scale = targetCanvas.width / canvas.width;
            finalFontSize = fontSize * scale * 0.8;
        }
        
        targetCtx.save();
        
        // إعداد الخط
        targetCtx.font = 'bold ' + finalFontSize + 'px ' + fontFamily;
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.lineJoin = 'round';
        targetCtx.lineCap = 'round';
        targetCtx.direction = 'rtl';
        
        // تقسيم النص إلى أسطر
        const maxLineWidth = targetCanvas.width * 0.8;
        const lines = wrapText(text, maxLineWidth, targetCtx, finalFontSize);
        
        // ضبط حجم الخط ليتناسب مع العرض
        let adjustedFontSize = finalFontSize;
        let adjustedLines = lines;
        
        while (true) {
            const testWidth = Math.max(...adjustedLines.map(line => targetCtx.measureText(line).width));
            if (testWidth <= maxLineWidth || adjustedFontSize <= 20) {
                break;
            }
            adjustedFontSize -= 2;
            targetCtx.font = 'bold ' + adjustedFontSize + 'px ' + fontFamily;
            adjustedLines = wrapText(text, maxLineWidth, targetCtx, adjustedFontSize);
        }
        
        // حساب ارتفاع النص الكلي
        const lineHeight = adjustedFontSize * 1.3;
        const totalHeight = adjustedLines.length * lineHeight;
        const startY = (targetCanvas.height / 2) - (totalHeight / 2) + (lineHeight / 2);
        
        // إعداد الظل
        if (shadowEnabled) {
            targetCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            targetCtx.shadowBlur = 8;
            targetCtx.shadowOffsetX = 4;
            targetCtx.shadowOffsetY = 4;
        } else {
            targetCtx.shadowColor = 'transparent';
            targetCtx.shadowBlur = 0;
            targetCtx.shadowOffsetX = 0;
            targetCtx.shadowOffsetY = 0;
        }
        
        // رسم كل سطر
        adjustedLines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            const x = targetCanvas.width / 2;
            
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
                targetCtx.fillStyle = currentCardColor || '#000000';
                targetCtx.globalAlpha = 0.7;
                targetCtx.fillRect(bgX, bgY, bgWidth, bgHeight);
                targetCtx.restore();
            }
            
            // رسم حواف النص
            if (strokeWidth > 0) {
                targetCtx.strokeStyle = currentStrokeColor || '#000000';
                targetCtx.lineWidth = strokeWidth * (forExport ? 3 : 1);
                targetCtx.strokeText(line, x, y);
            }
            
            // رسم النص نفسه
            targetCtx.fillStyle = currentTextColor || '#FFFFFF';
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
    let currentLine = words[0];
    
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
    lines.push(currentLine);
    
    return lines;
}

// دالة خاصة للتصدير
function prepareImageForExport() {
    return renderTextOnCanvas(true);
}
