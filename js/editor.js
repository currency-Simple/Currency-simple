// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;
let originalCanvasSize = { width: 0, height: 0 };

// تهيئة المحرر
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d', { alpha: false }); // إيقاف الشفافية للأداء
    
    initializeFonts();
    initializeColors();
    setupEventListeners();
    
    console.log('Editor initialized');
});

// إعداد الأحداث
function setupEventListeners() {
    const textOverlay = document.getElementById('textOverlay');
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const strokeWidth = document.getElementById('strokeWidth');
    const shadowEnabled = document.getElementById('shadowEnabled');
    const cardEnabled = document.getElementById('cardEnabled');

    if (textOverlay) {
        textOverlay.addEventListener('input', () => {
            autoAdjustFontSize();
            updateTextStyle();
        });
    }
    
    if (fontSize) {
        fontSize.addEventListener('input', (e) => {
            document.getElementById('fontSizeDisplay').textContent = e.target.value;
            updateTextStyle();
        });
    }
    
    if (strokeWidth) {
        strokeWidth.addEventListener('input', (e) => {
            document.getElementById('strokeWidthDisplay').textContent = e.target.value;
            updateTextStyle();
        });
    }
    
    if (fontFamily) fontFamily.addEventListener('change', updateTextStyle);
    if (shadowEnabled) shadowEnabled.addEventListener('change', updateTextStyle);
    if (cardEnabled) cardEnabled.addEventListener('change', updateTextStyle);
}

// تناسق حجم الخط
function autoAdjustFontSize() {
    const textOverlay = document.getElementById('textOverlay');
    if (!textOverlay || !canvas.width) return;
    
    const text = textOverlay.innerText || textOverlay.textContent;
    if (!text || text === 'اكتب هنا...' || text === 'Type here...' || text === 'Écrivez ici...') return;
    
    const baseSize = Math.min(canvas.width, canvas.height) / 8;
    const textLength = text.length;
    let newSize;
    
    if (textLength < 20) newSize = baseSize;
    else if (textLength < 50) newSize = baseSize * 0.8;
    else if (textLength < 100) newSize = baseSize * 0.6;
    else newSize = baseSize * 0.4;
    
    newSize = Math.max(20, Math.min(120, newSize));
    
    const fontSizeInput = document.getElementById('fontSize');
    if (fontSizeInput) {
        fontSizeInput.value = Math.round(newSize);
        document.getElementById('fontSizeDisplay').textContent = Math.round(newSize);
        updateTextStyle();
    }
}

// تحديث نمط النص
function updateTextStyle() {
    const textOverlay = document.getElementById('textOverlay');
    if (!textOverlay) return;
    
    const fontFamily = document.getElementById('fontFamily')?.value || "Arial";
    const fontSize = document.getElementById('fontSize')?.value || "48";
    const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
    const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
    const cardEnabled = document.getElementById('cardEnabled')?.checked || false;

    textOverlay.style.fontFamily = fontFamily;
    textOverlay.style.fontSize = fontSize + 'px';
    textOverlay.style.fontWeight = 'bold';
    
    if (typeof currentTextColor !== 'undefined') {
        textOverlay.style.color = currentTextColor;
        textOverlay.style.webkitTextFillColor = currentTextColor;
    }
    
    if (strokeWidth > 0) {
        textOverlay.style.webkitTextStrokeWidth = strokeWidth + 'px';
        if (typeof currentStrokeColor !== 'undefined') {
            textOverlay.style.webkitTextStrokeColor = currentStrokeColor;
        }
        textOverlay.style.paintOrder = 'stroke fill';
    } else {
        textOverlay.style.webkitTextStrokeWidth = '0px';
    }
    
    if (shadowEnabled) {
        textOverlay.style.textShadow = '3px 3px 6px rgba(0,0,0,0.8)';
    } else {
        textOverlay.style.textShadow = 'none';
    }
    
    if (cardEnabled) {
        if (typeof currentCardColor !== 'undefined') {
            textOverlay.style.backgroundColor = currentCardColor;
        }
        textOverlay.style.padding = '10px 20px';
        textOverlay.style.borderRadius = '8px';
    } else {
        textOverlay.style.backgroundColor = 'transparent';
        textOverlay.style.padding = '10px';
    }
}

// تحميل الصورة - إصلاح المشكلة 3
function loadImageToEditor(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        currentImage = img;
        imageLoaded = true;
        
        // حفظ الأبعاد الأصلية للصورة
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // نسبة 4:5 ثابتة للـ Canvas
        const targetRatio = 4 / 5;
        let width, height;
        
        // حساب الأبعاد مع الحفاظ على نسبة الصورة الأصلية
        if (originalWidth / originalHeight > targetRatio) {
            // الصورة أوسع من النسبة المطلوبة
            height = originalHeight;
            width = height * targetRatio;
        } else {
            // الصورة أطول من النسبة المطلوبة
            width = originalWidth;
            height = width / targetRatio;
        }
        
        // ضبط أبعاد Canvas بأعلى جودة
        canvas.width = Math.max(800, width); // الحد الأدنى 800 بكسل للجودة
        canvas.height = Math.max(1000, height); // الحد الأدنى 1000 بكسل للجودة
        
        // حفظ الأبعاد الأصلية
        originalCanvasSize.width = canvas.width;
        originalCanvasSize.height = canvas.height;
        
        // رسم الصورة على Canvas بالحجم الكامل
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // حساب الموقع لمركز الصورة
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        
        // تحسين جودة الرسم
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // رسم الصورة
        ctx.drawImage(img, x, y, width, height);
        
        // ضبط الحجم المعروض
        const container = document.querySelector('.canvas-wrapper-fixed');
        if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            const widthRatio = containerWidth / canvas.width;
            const heightRatio = containerHeight / canvas.height;
            const scale = Math.min(widthRatio, heightRatio) * 0.9; // 90% من الحجم المتاح
            
            canvas.style.width = (canvas.width * scale) + 'px';
            canvas.style.height = (canvas.height * scale) + 'px';
            canvas.style.objectFit = 'contain';
        }
        
        autoAdjustFontSize();
        updateTextStyle();
        
        console.log('Image loaded:', canvas.width, 'x', canvas.height);
    };
    
    img.onerror = function() {
        console.error('Failed to load image');
        alert('فشل تحميل الصورة. الرجاء المحاولة مرة أخرى.');
    };
    
    img.src = imageUrl;
}

// ============== دالة رسم النص المعدلة (إصلاح المشكلة 3) ==============
function renderTextOnCanvas() {
    if (!imageLoaded || !currentImage) {
        console.error('لم يتم تحميل صورة');
        return false;
    }
    
    try {
        // استخدام Canvas جديد عالي الجودة للتصدير
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        // استخدام الأبعاد الأصلية المخزنة
        exportCanvas.width = originalCanvasSize.width || canvas.width;
        exportCanvas.height = originalCanvasSize.height || canvas.height;
        
        // تحسين الجودة
        exportCtx.imageSmoothingEnabled = true;
        exportCtx.imageSmoothingQuality = 'high';
        
        // إعادة حساب أبعاد الصورة للـ Canvas الجديد
        const targetRatio = 4 / 5;
        let width, height;
        
        if (currentImage.width / currentImage.height > targetRatio) {
            height = currentImage.height;
            width = height * targetRatio;
        } else {
            width = currentImage.width;
            height = width / targetRatio;
        }
        
        // حساب الموقع لمركز الصورة
        const x = (exportCanvas.width - width) / 2;
        const y = (exportCanvas.height - height) / 2;
        
        // رسم الصورة الأصلية
        exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
        exportCtx.drawImage(currentImage, x, y, width, height);
        
        // الحصول على النص
        const textElement = document.getElementById('textOverlay');
        if (!textElement) {
            console.error('عنصر النص غير موجود');
            return false;
        }
        
        const text = textElement.innerText || textElement.textContent;
        if (!text || text === 'اكتب هنا...' || text === 'Type here...' || text === 'Écrivez ici...') {
            // إذا لا يوجد نص، نرجع الصورة فقط
            // نسخ Canvas التصدير إلى Canvas الرئيسي
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(exportCanvas, 0, 0, canvas.width, canvas.height);
            return true;
        }
        
        // إعداد النص للتصدير
        const fontFamily = document.getElementById('fontFamily')?.value || "Arial";
        const fontSize = parseInt(document.getElementById('fontSize')?.value || "48");
        const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
        const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
        const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
        
        // حساب حجم الخط للتصدير (أكبر للحصول على جودة أفضل)
        const exportFontSize = fontSize * (exportCanvas.width / canvas.width);
        
        exportCtx.save();
        
        // إعداد الخط للتصدير
        exportCtx.font = 'bold ' + exportFontSize + 'px ' + fontFamily;
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        exportCtx.lineJoin = 'round';
        exportCtx.lineCap = 'round';
        
        // تقسيم النص إلى أسطر
        const lines = text.split('\n').filter(line => line.trim());
        const lineHeight = exportFontSize * 1.3;
        const totalHeight = lines.length * lineHeight;
        const startY = (exportCanvas.height / 2) - (totalHeight / 2) + (lineHeight / 2);
        
        // إعداد الظل
        if (shadowEnabled) {
            exportCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            exportCtx.shadowBlur = 8;
            exportCtx.shadowOffsetX = 4;
            exportCtx.shadowOffsetY = 4;
        }
        
        // رسم كل سطر
        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            const x = exportCanvas.width / 2;
            
            // قياس عرض النص
            const textMetrics = exportCtx.measureText(line);
            
            // رسم خلفية النص
            if (cardEnabled) {
                const padding = 30;
                const bgWidth = textMetrics.width + (padding * 2);
                const bgHeight = exportFontSize + padding;
                const bgX = x - (bgWidth / 2);
                const bgY = y - (exportFontSize / 2) - (padding / 2);
                
                exportCtx.save();
                exportCtx.fillStyle = currentCardColor || '#000000';
                exportCtx.globalAlpha = 0.7;
                exportCtx.fillRect(bgX, bgY, bgWidth, bgHeight);
                exportCtx.restore();
            }
            
            // رسم حواف النص
            if (strokeWidth > 0) {
                exportCtx.strokeStyle = currentStrokeColor || '#000000';
                exportCtx.lineWidth = strokeWidth * 3;
                exportCtx.strokeText(line, x, y);
            }
            
            // رسم النص نفسه
            exportCtx.fillStyle = currentTextColor || '#FFFFFF';
            exportCtx.fillText(line, x, y);
        });
        
        exportCtx.restore();
        
        // نسخ Canvas التصدير إلى Canvas الرئيسي للعرض
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(exportCanvas, 0, 0, canvas.width, canvas.height);
        
        // تحديث Canvas الرئيسي بصورة التصدير
        const dataURL = exportCanvas.toDataURL('image/png', 1.0);
        const img = new Image();
        img.onload = function() {
            canvas.width = exportCanvas.width;
            canvas.height = exportCanvas.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
        
        console.log('تم رسم النص على Canvas للتصدير');
        return true;
        
    } catch (error) {
        console.error('خطأ في رسم النص:', error);
        return false;
    }
}
