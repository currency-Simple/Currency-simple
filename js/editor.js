// editor.js - محرر الصور المحسّن

let canvas, ctx;
let currentImage = null;
let imageLoaded = false;

// متغيرات التحكم بالنص
let textX = 0.5;
let textY = 0.5;
let textScale = 1;
let textRotation = 0;

// متغيرات اللمس
let isDragging = false;
let isResizing = false;
let startX = 0;
let startY = 0;
let initialDistance = 0;
let initialScale = 1;
let initialAngle = 0;
let initialRotation = 0;

// تهيئة المحرر
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    setupTouchControls();
    setupEffectsControls();
    
    console.log('✅ المحرر جاهز');
});

// إعداد التحكم باللمس
function setupTouchControls() {
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // دعم الماوس
    canvas.addEventListener('mousedown', (e) => {
        handleTouchStart({ 
            touches: [{ clientX: e.clientX, clientY: e.clientY }], 
            preventDefault: () => e.preventDefault() 
        });
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging || isResizing) {
            handleTouchMove({ 
                touches: [{ clientX: e.clientX, clientY: e.clientY }], 
                preventDefault: () => e.preventDefault() 
            });
        }
    });
    
    canvas.addEventListener('mouseup', handleTouchEnd);
}

function handleTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 1) {
        // لمسة واحدة - التحريك
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        isDragging = true;
        startX = touch.clientX;
        startY = touch.clientY;
        
        textX = (touch.clientX - rect.left) / canvas.width;
        textY = (touch.clientY - rect.top) / canvas.height;
        
        renderFullCanvas();
        
    } else if (e.touches.length === 2) {
        // لمستان - التكبير والتدوير
        isDragging = false;
        isResizing = true;
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialScale = textScale;
        initialAngle = Math.atan2(dy, dx);
        initialRotation = textRotation;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        textX = Math.max(0.1, Math.min(0.9, (touch.clientX - rect.left) / canvas.width));
        textY = Math.max(0.1, Math.min(0.9, (touch.clientY - rect.top) / canvas.height));
        
        renderFullCanvas();
        
    } else if (e.touches.length === 2 && isResizing) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        
        // التكبير
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        textScale = Math.max(0.3, Math.min(3, initialScale * (currentDistance / initialDistance)));
        
        // التدوير
        const currentAngle = Math.atan2(dy, dx);
        textRotation = (initialRotation + (currentAngle - initialAngle) * (180 / Math.PI)) % 360;
        
        renderFullCanvas();
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    isDragging = false;
    isResizing = false;
}

// إعداد عناصر التحكم بالتأثيرات
function setupEffectsControls() {
    const shadowEnabled = document.getElementById('shadowEnabled');
    const bgEnabled = document.getElementById('bgEnabled');
    
    if (shadowEnabled) {
        shadowEnabled.addEventListener('change', renderFullCanvas);
    }
    
    if (bgEnabled) {
        bgEnabled.addEventListener('change', renderFullCanvas);
    }
}

// تحميل صورة للمحرر
function loadImageToEditor(imageUrl) {
    console.log('⏳ جاري تحميل الصورة...');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        currentImage = img;
        imageLoaded = true;
        
        // ضبط حجم الكانفاس
        const container = document.querySelector('.canvas-wrapper');
        const maxWidth = container.clientWidth - 30;
        const maxHeight = container.clientHeight - 30;
        
        const imgAspect = img.width / img.height;
        
        let canvasWidth, canvasHeight;
        
        if (maxWidth / maxHeight > imgAspect) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * imgAspect;
        } else {
            canvasWidth = maxWidth;
            canvasHeight = canvasWidth / imgAspect;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // إعادة تعيين الإعدادات
        textX = 0.5;
        textY = 0.5;
        textScale = 1;
        textRotation = 0;
        
        renderFullCanvas();
        
        console.log('✅ تم تحميل الصورة');
    };
    
    img.onerror = function() {
        console.error('❌ فشل تحميل الصورة');
        showAlert('فشل تحميل الصورة', 'error');
    };
    
    img.src = imageUrl;
}

// رسم الكانفاس الكامل
function renderFullCanvas() {
    if (!imageLoaded || !currentImage) return;
    
    // تنظيف الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الخلفية البيضاء
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // رسم الصورة
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    
    // رسم النص إذا كان موجوداً
    if (window.currentText && window.currentText.trim() !== '') {
        renderText();
    }
}

// رسم النص
function renderText() {
    const text = window.currentText || '';
    const fontFamily = window.currentFontFamily || "'IBeeZee', sans-serif";
    const textColor = window.currentTextColor || '#FFFFFF';
    
    const shadowEnabled = document.getElementById('shadowEnabled')?.checked !== false;
    const bgEnabled = document.getElementById('bgEnabled')?.checked || false;
    
    // حجم الخط
    const baseFontSize = Math.min(canvas.width, canvas.height) * 0.08;
    const fontSize = baseFontSize * textScale;
    
    ctx.save();
    
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    
    const centerX = textX * canvas.width;
    const centerY = textY * canvas.height;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(textRotation * Math.PI / 180);
    
    // الظل
    if (shadowEnabled) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
    }
    
    // الخلفية
    if (bgEnabled) {
        const metrics = ctx.measureText(text);
        const padding = fontSize * 0.3;
        const bgWidth = metrics.width + padding * 2;
        const bgHeight = fontSize + padding;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);
    }
    
    // النص
    ctx.fillStyle = textColor;
    ctx.fillText(text, 0, 0);
    
    ctx.restore();
}

// تحضير الصورة للتصدير
function prepareImageForExport() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = currentImage.width;
    exportCanvas.height = currentImage.height;
    
    const exportCtx = exportCanvas.getContext('2d', { 
        willReadFrequently: false,
        alpha: true 
    });
    
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';
    
    // رسم الخلفية
    exportCtx.fillStyle = '#FFFFFF';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    // رسم الصورة
    exportCtx.drawImage(currentImage, 0, 0);
    
    // رسم النص
    if (window.currentText && window.currentText.trim() !== '') {
        const text = window.currentText;
        const fontFamily = window.currentFontFamily || "'ABeeZee', sans-serif";
        const textColor = window.currentTextColor || '#FFFFFF';
        
        const shadowEnabled = document.getElementById('shadowEnabled')?.checked !== false;
        const bgEnabled = document.getElementById('bgEnabled')?.checked || false;
        
        const baseFontSize = Math.min(exportCanvas.width, exportCanvas.height) * 0.08;
        const fontSize = baseFontSize * textScale;
        
        exportCtx.save();
        
        exportCtx.font = `bold ${fontSize}px ${fontFamily}`;
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        exportCtx.direction = 'rtl';
        
        const centerX = textX * exportCanvas.width;
        const centerY = textY * exportCanvas.height;
        
        exportCtx.translate(centerX, centerY);
        exportCtx.rotate(textRotation * Math.PI / 180);
        
        if (shadowEnabled) {
            exportCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            exportCtx.shadowBlur = 10;
            exportCtx.shadowOffsetX = 5;
            exportCtx.shadowOffsetY = 5;
        }
        
        if (bgEnabled) {
            const metrics = exportCtx.measureText(text);
            const padding = fontSize * 0.3;
            const bgWidth = metrics.width + padding * 2;
            const bgHeight = fontSize + padding;
            
            exportCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            exportCtx.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);
        }
        
        exportCtx.fillStyle = textColor;
        exportCtx.fillText(text, 0, 0);
        
        exportCtx.restore();
    }
    
    return exportCanvas;
}

// تصدير الدوال
window.loadImageToEditor = loadImageToEditor;
window.renderFullCanvas = renderFullCanvas;
window.prepareImageForExport = prepareImageForExport;
window.currentText = '';
window.textScale = textScale;
window.textRotation = textRotation;
