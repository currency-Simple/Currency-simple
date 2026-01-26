// js/editor.js
let canvas, ctx;
let currentImage = null;
let currentText = '';
let textX = 0.5, textY = 0.5;
let textScale = 1;
let isDragging = false;

// التهيئة
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    setupCanvas();
    setupTextControls();
    setupTouchControls();
});

// إعداد الكانفاس
function setupCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.maxHeight = '70vh';
}

// تحميل صورة للمحرر
function loadImageToEditor(imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        currentImage = img;
        
        // ضبط أبعاد الكانفاس حسب الصورة
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.7;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        renderCanvas();
    };
    img.src = imageUrl;
}

// رسم الكانفاس
function renderCanvas() {
    if (!currentImage) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الصورة
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    
    // رسم النص إذا كان موجودًا
    if (currentText.trim()) {
        drawText();
    }
}

// رسم النص
function drawText() {
    const fontSize = 40 * textScale;
    const fontFamily = window.currentFontFamily || "'ABeeZee', sans-serif";
    const textColor = window.currentTextColor || '#FFFFFF';
    const strokeColor = window.currentStrokeColor || '#000000';
    
    ctx.save();
    
    // إعداد النص
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    
    // رسم ظل النص
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // رسم حدود النص
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.strokeText(currentText, textX * canvas.width, textY * canvas.height);
    
    // رسم النص
    ctx.fillStyle = textColor;
    ctx.fillText(currentText, textX * canvas.width, textY * canvas.height);
    
    ctx.restore();
}

// إعداد تحكم اللمس
function setupTouchControls() {
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvas.width;
        const y = (e.clientY - rect.top) / canvas.height;
        
        if (currentText) {
            isDragging = true;
            textX = x;
            textY = y;
            renderCanvas();
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = canvas.getBoundingClientRect();
            textX = (e.clientX - rect.left) / canvas.width;
            textY = (e.clientY - rect.top) / canvas.height;
            renderCanvas();
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function handleTouchStart(e) {
    if (e.touches.length === 1 && currentText) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        textX = (touch.clientX - rect.left) / canvas.width;
        textY = (touch.clientY - rect.top) / canvas.height;
        isDragging = true;
        renderCanvas();
    } else if (e.touches.length === 2) {
        // تكبير/تصغير النص
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const initialDistance = Math.sqrt(dx * dx + dy * dy);
        
        canvas.dataset.initialDistance = initialDistance;
        canvas.dataset.initialScale = textScale;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        textX = (touch.clientX - rect.left) / canvas.width;
        textY = (touch.clientY - rect.top) / canvas.height;
        renderCanvas();
    } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const initialDistance = parseFloat(canvas.dataset.initialDistance);
        const initialScale = parseFloat(canvas.dataset.initialScale);
        
        if (initialDistance > 0) {
            const scaleMultiplier = currentDistance / initialDistance;
            textScale = Math.max(0.5, Math.min(3, initialScale * scaleMultiplier));
            renderCanvas();
        }
    }
}

function handleTouchEnd() {
    isDragging = false;
}

// إعداد عناصر التحكم بالنص
function setupTextControls() {
    const textInput = document.getElementById('textInput');
    if (!textInput) return;
    
    // عند تغيير النص
    textInput.addEventListener('input', () => {
        currentText = textInput.value;
        renderCanvas();
    });
}

// فتح/إغلاق لوحة النص
function toggleTextPanel() {
    const panel = document.getElementById('textPanel');
    if (panel) {
        panel.classList.toggle('hidden');
        
        if (!panel.classList.contains('hidden')) {
            const textInput = document.getElementById('textInput');
            if (textInput) {
                textInput.focus();
                textInput.value = currentText;
            }
        }
    }
}

// تطبيق النص
function applyText() {
    const textInput = document.getElementById('textInput');
    if (textInput) {
        currentText = textInput.value;
        renderCanvas();
        toggleTextPanel();
    }
}

// حذف النص
function clearText() {
    currentText = '';
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.value = '';
    renderCanvas();
    toggleTextPanel();
}

// فتح لوحة الأدوات
function openToolPanel(panelName) {
    // إغلاق جميع اللوحات
    document.querySelectorAll('.tool-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // فتح اللوحة المطلوبة
    const panel = document.getElementById(`${panelName}Panel`);
    if (panel) {
        panel.classList.remove('hidden');
    }
}

// تصدير الدوال
window.loadImageToEditor = loadImageToEditor;
window.toggleTextPanel = toggleTextPanel;
window.applyText = applyText;
window.clearText = clearText;
window.openToolPanel = openToolPanel;
