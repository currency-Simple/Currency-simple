// متغيرات المحرر
let canvas, ctx;
let currentImage = null;
let imageLoaded = false;

// تهيئة المحرر
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // تأكد من تهيئة الأبعاد
    canvas.width = 800;
    canvas.height = 1000;
    
    initializeFonts();
    initializeColors();
    setupEventListeners();
    
    console.log('Editor initialized, canvas:', canvas.width, 'x', canvas.height);
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
    if (!text || text.includes('...')) return;
    
    const baseSize = Math.min(canvas.width, canvas.height) / 10;
    const textLength = text.length;
    let newSize;
    
    if (textLength < 10) newSize = baseSize;
    else if (textLength < 30) newSize = baseSize * 0.8;
    else if (textLength < 50) newSize = baseSize * 0.6;
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
    
    // اللون
    if (typeof currentTextColor !== 'undefined') {
        textOverlay.style.color = currentTextColor;
        textOverlay.style.webkitTextFillColor = currentTextColor;
    }
    
    // الحواف
    if (strokeWidth > 0 && typeof currentStrokeColor !== 'undefined') {
        textOverlay.style.webkitTextStrokeWidth = strokeWidth + 'px';
        textOverlay.style.webkitTextStrokeColor = currentStrokeColor;
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
    if (cardEnabled && typeof currentCardColor !== 'undefined') {
        textOverlay.style.backgroundColor = currentCardColor;
        textOverlay.style.padding = '10px 20px';
        textOverlay.style.borderRadius = '8px';
    } else {
        textOverlay.style.backgroundColor = 'transparent';
        textOverlay.style.padding = '10px';
    }
    
    console.log('Text style updated');
}

// تحميل الصورة
function loadImageToEditor(imageUrl) {
    console.log('Loading image to editor:', imageUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        currentImage = img;
        imageLoaded = true;
        
        // نسبة 4:5
        const targetRatio = 4 / 5;
        let width = img.width;
        let height = img.height;
        
        // احسب الأبعاد المناسبة مع الحفاظ على النسبة
        if (width / height > targetRatio) {
            width = height * targetRatio;
        } else {
            height = width / targetRatio;
        }
        
        // ضع حدود قصوى
        const maxWidth = 1200;
        const maxHeight = 1500;
        
        if (width > maxWidth) {
            const scale = maxWidth / width;
            width = maxWidth;
            height = height * scale;
        }
        
        if (height > maxHeight) {
            const scale = maxHeight / height;
            height = maxHeight;
            width = width * scale;
        }
        
        // عيّن أبعاد Canvas
        canvas.width = width;
        canvas.height = height;
        
        // ارسم الصورة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        console.log('Image loaded to canvas:', canvas.width, 'x', canvas.height);
        
        // اضبط النص
        autoAdjustFontSize();
        updateTextStyle();
        
        // ارسم النص مباشرة على Canvas للعرض
        renderTextOnCanvas();
    };
    
    img.onerror = function() {
        console.error('Failed to load image');
        alert('فشل تحميل الصورة. الرابط قد لا يكون صحيحاً.');
    };
    
    img.src = imageUrl;
}

// رسم النص على Canvas - الإصلاح الكامل
function renderTextOnCanvas() {
    console.log('renderTextOnCanvas called');
    
    if (!imageLoaded || !currentImage) {
        console.log('No image loaded yet');
        return;
    }
    
    if (!canvas || !ctx) {
        console.error('Canvas or context not available');
        return;
    }
    
    try {
        // 1. إعادة رسم الصورة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        
        // 2. الحصول على النص من text-overlay
        const textElement = document.getElementById('textOverlay');
        if (!textElement) {
            console.log('No text element found');
            return;
        }
        
        const text = textElement.innerText || textElement.textContent;
        if (!text || text.includes('...')) {
            console.log('No text to render');
            return;
        }
        
        console.log('Text to render:', text);
        
        // 3. الحصول على الإعدادات
        const fontFamily = document.getElementById('fontFamily')?.value || "Arial";
        const fontSize = parseInt(document.getElementById('fontSize')?.value || "48");
        const strokeWidth = parseInt(document.getElementById('strokeWidth')?.value || "3");
        const shadowEnabled = document.getElementById('shadowEnabled')?.checked || false;
        const cardEnabled = document.getElementById('cardEnabled')?.checked || false;
        
        // 4. إعداد سياق الرسم
        ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 5. تقسيم النص إلى أسطر
        const lines = text.split('\n').filter(line => line.trim());
        const lineHeight = fontSize * 1.3;
        const totalHeight = lines.length * lineHeight;
        const startY = (canvas.height / 2) - (totalHeight / 2) + (lineHeight / 2);
        
        console.log('Rendering', lines.length, 'lines');
        
        // 6. رسم كل سطر
        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            const x = canvas.width / 2;
            
            // الخلفية
            if (cardEnabled && typeof currentCardColor !== 'undefined') {
                const metrics = ctx.measureText(line);
                const padding = 20;
                ctx.fillStyle = currentCardColor;
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
            }
            
            // الحواف
            if (strokeWidth > 0 && typeof currentStrokeColor !== 'undefined') {
                ctx.strokeStyle = currentStrokeColor;
                ctx.lineWidth = strokeWidth * 2;
                ctx.lineJoin = 'round';
                ctx.strokeText(line, x, y);
            }
            
            // النص نفسه
            if (typeof currentTextColor !== 'undefined') {
                ctx.fillStyle = currentTextColor;
            } else {
                ctx.fillStyle = '#FFFFFF';
            }
            ctx.fillText(line, x, y);
            
            // إعادة ضبط الظل للسطر التالي
            if (shadowEnabled) {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
        });
        
        console.log('Text rendered successfully on canvas');
        return true;
        
    } catch (error) {
        console.error('Error in renderTextOnCanvas:', error);
        return false;
    }
}
