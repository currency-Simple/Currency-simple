// متغيرات عامة
let categories = [];
let currentCategory = null;
let currentImages = [];
let keyboardOpen = false;

// تحميل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('App starting...');
    loadCategories();
    showPage('categories');
    
    // إضافة مستمعات للوحة المفاتيح
    setupKeyboardListeners();
    
    // إضافة مستمع للتركيز على حقل النص
    const textOverlay = document.getElementById('textOverlay');
    if (textOverlay) {
        textOverlay.addEventListener('focus', handleTextFocus);
        textOverlay.addEventListener('blur', handleTextBlur);
        textOverlay.addEventListener('input', handleTextInput);
    }
});

// إعداد مستمعات لوحة المفاتيح
function setupKeyboardListeners() {
    // للمتصفحات الحديثة
    if ('visualViewport' in window) {
        const viewport = window.visualViewport;
        
        viewport.addEventListener('resize', () => {
            const keyboardHeight = window.innerHeight - viewport.height;
            
            if (keyboardHeight > 100) {
                // لوحة المفاتيح مفتوحة
                handleKeyboardOpen(keyboardHeight);
            } else {
                // لوحة المفاتيح مغلقة
                handleKeyboardClose();
            }
        });
    } else {
        // للمتصفحات القديمة
        window.addEventListener('resize', () => {
            setTimeout(() => {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile && window.innerHeight < window.outerHeight * 0.7) {
                    handleKeyboardOpen(200);
                } else {
                    handleKeyboardClose();
                }
            }, 100);
        });
    }
}

// التعامل مع فتح لوحة المفاتيح
function handleKeyboardOpen(keyboardHeight) {
    if (keyboardOpen) return;
    keyboardOpen = true;
    console.log('Keyboard opened, height:', keyboardHeight);
    
    // إضافة كلاس لتحديد أن لوحة المفاتيح مفتوحة
    document.documentElement.classList.add('keyboard-open');
    document.body.classList.add('keyboard-open');
    
    const editorPage = document.getElementById('editorPage');
    if (editorPage) editorPage.classList.add('keyboard-open');
    
    // ضبط المساحة للصورة
    adjustCanvasForKeyboard(keyboardHeight);
    
    // تثبيت الأزرار في الأسفل
    const bottomNav = document.querySelector('.bottom-nav');
    const editorToolbar = document.querySelector('.editor-toolbar');
    const toolPanels = document.querySelectorAll('.tool-panel.active');
    
    if (bottomNav) {
        bottomNav.classList.add('keyboard-open');
    }
    
    if (editorToolbar) {
        editorToolbar.classList.add('keyboard-open');
    }
    
    toolPanels.forEach(panel => {
        panel.classList.add('keyboard-open');
    });
}

// التعامل مع إغلاق لوحة المفاتيح
function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    console.log('Keyboard closed');
    
    // إزالة الكلاس
    document.documentElement.classList.remove('keyboard-open');
    document.body.classList.remove('keyboard-open');
    
    const editorPage = document.getElementById('editorPage');
    if (editorPage) editorPage.classList.remove('keyboard-open');
    
    // استعادة التنسيق الأصلي
    restoreCanvasAfterKeyboard();
    
    // إزالة كلاس من الأزرار
    const bottomNav = document.querySelector('.bottom-nav');
    const editorToolbar = document.querySelector('.editor-toolbar');
    const toolPanels = document.querySelectorAll('.tool-panel.active');
    
    if (bottomNav) {
        bottomNav.classList.remove('keyboard-open');
    }
    
    if (editorToolbar) {
        editorToolbar.classList.remove('keyboard-open');
    }
    
    toolPanels.forEach(panel => {
        panel.classList.remove('keyboard-open');
    });
}

// ضبط Canvas عند فتح لوحة المفاتيح
function adjustCanvasForKeyboard(keyboardHeight) {
    const canvasWrapper = document.getElementById('canvasWrapperFixed');
    const canvas = document.getElementById('canvas');
    const textOverlay = document.getElementById('textOverlay');
    
    if (canvasWrapper && canvas && textOverlay) {
        // حفظ الأبعاد الأصلية
        canvasWrapper.dataset.originalHeight = canvasWrapper.style.height;
        canvas.dataset.originalMaxHeight = canvas.style.maxHeight;
        
        // حساب الارتفاع الجديد مع مراعاة لوحة المفاتيح
        const totalFixedHeight = 71 + 70 + 70 + 50; // هيدر + أدوات + أزرار + هامش
        const availableHeight = window.innerHeight - totalFixedHeight - keyboardHeight;
        
        // ضبط الأبعاد الجديدة
        canvasWrapper.style.height = availableHeight + 'px';
        canvas.style.maxHeight = availableHeight + 'px';
        canvas.style.maxWidth = '100%';
        canvas.style.objectFit = 'contain';
        
        // ضبط النص
        textOverlay.style.fontSize = 'calc(min(48px, 5vw))';
        textOverlay.style.maxHeight = (availableHeight - 40) + 'px';
        textOverlay.style.overflowY = 'auto';
        
        // نقل الصورة لأعلى قليلاً لرؤية أفضل
        canvasWrapper.style.justifyContent = 'flex-start';
        canvasWrapper.style.paddingTop = '10px';
        
        console.log('Canvas adjusted for keyboard:', availableHeight, 'px');
    }
}

// استعادة Canvas بعد إغلاق لوحة المفاتيح
function restoreCanvasAfterKeyboard() {
    const canvasWrapper = document.getElementById('canvasWrapperFixed');
    const canvas = document.getElementById('canvas');
    const textOverlay = document.getElementById('textOverlay');
    
    if (canvasWrapper && canvas && textOverlay) {
        // استعادة الأبعاد الأصلية
        canvasWrapper.style.height = '';
        canvasWrapper.style.paddingTop = '';
        canvasWrapper.style.justifyContent = '';
        
        canvas.style.maxHeight = '';
        canvas.style.objectFit = 'contain';
        
        textOverlay.style.fontSize = '';
        textOverlay.style.maxHeight = '';
        textOverlay.style.overflowY = '';
        
        console.log('Canvas restored');
    }
}

// التعامل مع التركيز على حقل النص
function handleTextFocus() {
    console.log('Text field focused');
    // نترك للـ resize handler التعامل مع ذلك
}

function handleTextBlur() {
    console.log('Text field blurred');
    // تأخير للتحقق من إغلاق لوحة المفاتيح
    setTimeout(() => {
        if (!document.activeElement || document.activeElement.id !== 'textOverlay') {
            handleKeyboardClose();
        }
    }, 300);
}

function handleTextInput() {
    // تحديث الحجم التلقائي للنص
    setTimeout(() => {
        if (typeof autoAdjustFontSize === 'function') {
            autoAdjustFontSize();
        }
        if (typeof updateTextStyle === 'function') {
            updateTextStyle();
        }
    }, 50);
}

// تحميل الفئات
async function loadCategories() {
    categories = [];
    console.log('Loading categories...');
    
    const promises = [];
    for (let i = 1; i <= 100; i++) {
        promises.push(
            fetch(`data/images${i}.json`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.images && data.images.length > 0) {
                        categories.push({
                            id: i,
                            name: data.name || `فئة ${i}`,
                            coverImage: data.images[0].url,
                            images: data.images
                        });
                    }
                })
                .catch(() => null)
        );
    }
    
    await Promise.allSettled(promises);
    
    if (categories.length === 0) {
        loadDemoCategories();
    } else {
        categories.sort((a, b) => a.id - b.id);
        displayCategories();
    }
    
    console.log('Categories loaded:', categories.length);
}

// فئات تجريبية
function loadDemoCategories() {
    for (let i = 1; i <= 10; i++) {
        const images = [];
        for (let j = 1; j <= 100; j++) {
            const id = (i - 1) * 100 + j;
            images.push({
                id: id,
                url: `https://picsum.photos/400/500?random=${id}`,
                title: `صورة ${id}`
            });
        }
        categories.push({
            id: i,
            name: `فئة ${i}`,
            coverImage: images[0].url,
            images: images
        });
    }
    displayCategories();
}

// عرض الفئات
function displayCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.onclick = () => openCategory(cat);
        item.innerHTML = `
            <img src="${cat.coverImage}" alt="${cat.name}" loading="lazy">
            <div class="category-overlay">
                <div class="category-title">${cat.name}</div>
            </div>
        `;
        grid.appendChild(item);
    });
}

// فتح فئة
function openCategory(cat) {
    currentCategory = cat;
    currentImages = cat.images;
    document.getElementById('categoryTitle').textContent = cat.name;
    displayImages();
    showPage('images');
}

// عرض الصور
function displayImages() {
    const grid = document.getElementById('imageGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    currentImages.forEach(img => {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.onclick = () => selectImage(img);
        
        const imgEl = document.createElement('img');
        imgEl.src = img.url;
        imgEl.alt = img.title || 'صورة';
        imgEl.loading = 'lazy';
        
        item.appendChild(imgEl);
        grid.appendChild(item);
    });
}

// اختيار صورة
function selectImage(img) {
    localStorage.setItem('selectedImage', JSON.stringify(img));
    showPage('editor');
    
    setTimeout(() => {
        if (typeof loadImageToEditor === 'function') {
            loadImageToEditor(img.url);
        }
    }, 100);
}

// التنقل بين الصفحات
function showPage(pageName) {
    console.log('Navigating to:', pageName);
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(b => b.classList.remove('active'));
    
    const pageMap = {
        'categories': 'categoriesPage',
        'images': 'imagesPage',
        'editor': 'editorPage',
        'settings': 'settingsPage'
    };
    
    const page = document.getElementById(pageMap[pageName]);
    if (page) page.classList.add('active');
    
    const navMap = {
        'categories': 'navCategories',
        'editor': 'navEditor',
        'settings': 'navSettings'
    };
    
    const btn = document.getElementById(navMap[pageName]);
    if (btn) btn.classList.add('active');
    
    // عند الخروج من المحرر، تأكد من إغلاق حالة لوحة المفاتيح
    if (pageName !== 'editor') {
        handleKeyboardClose();
    }
}

// العودة
function goBackToImages() {
    if (currentCategory) {
        showPage('images');
    } else {
        showPage('categories');
    }
}

// تنزيل الصورة
function downloadImage() {
    const canvas = document.getElementById('canvas');
    if (!canvas || !canvas.width) {
        alert('يرجى اختيار صورة أولاً');
        return;
    }
    
    try {
        if (typeof renderTextOnCanvas === 'function') {
            renderTextOnCanvas();
        }
        
        const link = document.createElement('a');
        link.download = `image-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    } catch (error) {
        console.error('Download error:', error);
        alert('حدث خطأ أثناء التنزيل');
    }
}

// مشاركة الصورة
async function shareImage() {
    const canvas = document.getElementById('canvas');
    if (!canvas || !canvas.width) {
        alert('يرجى اختيار صورة أولاً');
        return;
    }
    
    try {
        if (typeof renderTextOnCanvas === 'function') {
            renderTextOnCanvas();
        }
        
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'image.png', { type: 'image/png' });
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'صورة',
                    text: 'شاهد هذه الصورة!'
                });
            } else {
                alert('المشاركة غير مدعومة');
            }
        }, 'image/png', 1.0);
    } catch (error) {
        console.error('Share error:', error);
        alert('حدث خطأ أثناء المشاركة');
    }
}