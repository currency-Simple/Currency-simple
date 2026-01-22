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
        
        // إزالة مستمعات focus/blur لأن app.js يتعامل معها
        // فقط أبقى على input event
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

// تحديث نمط النص - إصلاح كامل للألوان والحواف
function updateTextStyle() {
    const textOverlay = document.getElementById('textOverlay');
    if (!textOverlay) return;
    
    const fontFamily = document.getElementById('fontFamily')?.value || "Arial";
    const fontSize = document.getElementById('fontSize')?.value || "48";
    const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
    const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
    const cardEnabled = document.getElementById('cardEnabled')?.checked || false;

    // تطبيق الأنماط بشكل مباشر
    textOverlay.style.fontFamily = fontFamily;
    textOverlay.style.fontSize = fontSize + 'px';
    textOverlay.style.fontWeight = 'bold';
    
    // اللون - إصلاح
    if (typeof currentTextColor !== 'undefined') {
        textOverlay.style.color = currentTextColor;
        textOverlay.style.webkitTextFillColor = currentTextColor;
    } else {
        textOverlay.style.color = '#FFFFFF';
        textOverlay.style.webkitTextFillColor = '#FFFFFF';
    }
    
    // الحواف - إصلاح
    if (strokeWidth > 0) {
        textOverlay.style.webkitTextStrokeWidth = strokeWidth + 'px';
        if (typeof currentStrokeColor !== 'undefined') {
            textOverlay.style.webkitTextStrokeColor = currentStrokeColor;
        } else {
            textOverlay.style.webkitTextStrokeColor = '#000000';
        }
        textOverlay.style.paintOrder = 'stroke fill';
    } else {
        textOverlay.style.webkitTextStrokeWidth = '0px';
    }
    
    // الظل
    if (shadowEnabled) {
        textOverlay.style.textShadow = '3px 3px 6px rgba(0,0,0,0.8)';
    } else {
        textOverlay.style.textShadow = 'none';
    }
    
    // الخلفية
    if (cardEnabled) {
        if (typeof currentCardColor !== 'undefined') {
            textOverlay.style.backgroundColor = currentCardColor;
        } else {
            textOverlay.style.backgroundColor = '#000000';
        }
        textOverlay.style.padding = '10px 20px';
        textOverlay.style.borderRadius = '8px';
    } else {
        textOverlay.style.backgroundColor = 'transparent';
        textOverlay.style.padding = '10px';
    }
    
    console.log('Style updated:', {
        color: currentTextColor,
        stroke: currentStrokeColor,
        card: currentCardColor,
        strokeWidth: strokeWidth
    });
}

// تحميل الصورة
function loadImageToEditor(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        currentImage = img;
        imageLoaded = true;
        
        // نسبة 4:5
        const targetRatio = 4 / 5;
        let width = img.width;
        let height = img.height;
        
        if (width / height > targetRatio) {
            width = height * targetRatio;
        } else {
            height = width / targetRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // حساب الحجم المناسب للعرض
        const container = document.querySelector('.canvas-wrapper-fixed');
        if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            const widthRatio = containerWidth / width;
            const heightRatio = containerHeight / height;
            const scale = Math.min(widthRatio, heightRatio);
            
            canvas.style.width = (width * scale) + 'px';
            canvas.style.height = (height * scale) + 'px';
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        autoAdjustFontSize();
        updateTextStyle();
        
        console.log('Image loaded:', width, 'x', height);
    };
    
    img.onerror = function() {
        alert('فشل تحميل الصورة');
    };
    
    img.src = imageUrl;
}

// رسم النص على Canvas
function renderTextOnCanvas() {
    if (!imageLoaded || !currentImage) return;
    
    // إعادة رسم الصورة
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    
    const textElement = document.getElementById('textOverlay');
    if (!textElement) return;
    
    const text = textElement.innerText || textElement.textContent;
    if (!text || text === 'اكتب هنا...' || text === 'Type here...' || text === 'Écrivez ici...') return;
    
    const fontFamily = document.getElementById('fontFamily')?.value || "Arial";
    const fontSize = parseInt(document.getElementById('fontSize')?.value || "48");
    const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
    const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
    const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
    
    ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = text.split('\n').filter(line => line.trim());
    const lineHeight = fontSize * 1.3;
    const totalHeight = lines.length * lineHeight;
    const startY = (canvas.height / 2) - (totalHeight / 2) + (lineHeight / 2);
    
    lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        const x = canvas.width / 2;
        
        // الخلفية
        if (cardEnabled) {
            const metrics = ctx.measureText(line);
            const padding = 20;
            if (typeof currentCardColor !== 'undefined') {
                ctx.fillStyle = currentCardColor;
            } else {
                ctx.fillStyle = '#000000';
            }
            ctx.globalAlpha = 0.7;
            ctx.fillRect(
                x - metrics.width / 2 - padding,
                y - fontSize / 2 - padding / 2,
                metrics.width + padding * 2,
                fontSize + padding
            );
            ctx.globalAlpha = 1;
        }
        
        // الظل
        if (shadowEnabled) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // الحواف
        if (strokeWidth > 0) {
            if (typeof currentStrokeColor !== 'undefined') {
                ctx.strokeStyle = currentStrokeColor;
            } else {
                ctx.strokeStyle = '#000000';
            }
            ctx.lineWidth = strokeWidth * 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText(line, x, y);
        }
        
        // النص
        if (typeof currentTextColor !== 'undefined') {
            ctx.fillStyle = currentTextColor;
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        ctx.fillText(line, x, y);
    });
    
    // إعادة تعيين الظل
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    console.log('Text rendered on canvas');
}