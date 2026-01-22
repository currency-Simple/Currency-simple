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
                handleKeyboardOpen(keyboardHeight);
            } else {
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
    
    document.documentElement.classList.add('keyboard-open');
    document.body.classList.add('keyboard-open');
    
    const editorPage = document.getElementById('editorPage');
    if (editorPage) editorPage.classList.add('keyboard-open');
    
    adjustCanvasForKeyboard(keyboardHeight);
    
    const bottomNav = document.querySelector('.bottom-nav');
    const editorToolbar = document.querySelector('.editor-toolbar');
    const toolPanels = document.querySelectorAll('.tool-panel.active');
    
    if (bottomNav) bottomNav.classList.add('keyboard-open');
    if (editorToolbar) editorToolbar.classList.add('keyboard-open');
    
    toolPanels.forEach(panel => {
        panel.classList.add('keyboard-open');
    });
}

// التعامل مع إغلاق لوحة المفاتيح
function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    console.log('Keyboard closed');
    
    document.documentElement.classList.remove('keyboard-open');
    document.body.classList.remove('keyboard-open');
    
    const editorPage = document.getElementById('editorPage');
    if (editorPage) editorPage.classList.remove('keyboard-open');
    
    restoreCanvasAfterKeyboard();
    
    const bottomNav = document.querySelector('.bottom-nav');
    const editorToolbar = document.querySelector('.editor-toolbar');
    const toolPanels = document.querySelectorAll('.tool-panel.active');
    
    if (bottomNav) bottomNav.classList.remove('keyboard-open');
    if (editorToolbar) editorToolbar.classList.remove('keyboard-open');
    
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
        canvasWrapper.dataset.originalHeight = canvasWrapper.style.height;
        canvas.dataset.originalMaxHeight = canvas.style.maxHeight;
        
        const totalFixedHeight = 71 + 70 + 70 + 50;
        const availableHeight = window.innerHeight - totalFixedHeight - keyboardHeight;
        
        canvasWrapper.style.height = availableHeight + 'px';
        canvas.style.maxHeight = availableHeight + 'px';
        canvas.style.maxWidth = '100%';
        canvas.style.objectFit = 'contain';
        
        textOverlay.style.fontSize = 'calc(min(48px, 5vw))';
        textOverlay.style.maxHeight = (availableHeight - 40) + 'px';
        textOverlay.style.overflowY = 'auto';
        
        canvasWrapper.style.justifyContent = 'flex-start';
        canvasWrapper.style.paddingTop = '10px';
    }
}

// استعادة Canvas بعد إغلاق لوحة المفاتيح
function restoreCanvasAfterKeyboard() {
    const canvasWrapper = document.getElementById('canvasWrapperFixed');
    const canvas = document.getElementById('canvas');
    const textOverlay = document.getElementById('textOverlay');
    
    if (canvasWrapper && canvas && textOverlay) {
        canvasWrapper.style.height = '';
        canvasWrapper.style.paddingTop = '';
        canvasWrapper.style.justifyContent = '';
        
        canvas.style.maxHeight = '';
        canvas.style.objectFit = 'contain';
        
        textOverlay.style.fontSize = '';
        textOverlay.style.maxHeight = '';
        textOverlay.style.overflowY = '';
    }
}

// التعامل مع التركيز على حقل النص
function handleTextFocus() {
    console.log('Text field focused');
}

function handleTextBlur() {
    setTimeout(() => {
        if (!document.activeElement || document.activeElement.id !== 'textOverlay') {
            handleKeyboardClose();
        }
    }, 300);
}

function handleTextInput() {
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

// ============== دالة التنزيل المحسنة ==============
async function downloadImage() {
    try {
        console.log('بدء عملية التنزيل...');
        
        // التحقق من وجود صورة
        const canvas = document.getElementById('canvas');
        if (!canvas || !canvas.width || !canvas.width > 0) {
            showAlert('يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        // إظهار مؤشر تحميل
        showLoadingIndicator('جاري تحضير الصورة للتنزيل...');
        
        // التأكد أننا في صفحة المحرر
        if (!document.getElementById('editorPage').classList.contains('active')) {
            showPage('editor');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // رسم النص على Canvas
        if (typeof renderTextOnCanvas === 'function') {
            const success = renderTextOnCanvas();
            if (!success) {
                hideLoadingIndicator();
                showAlert('فشل في تحضير الصورة', 'error');
                return;
            }
        } else {
            hideLoadingIndicator();
            showAlert('دالة الرسم غير متوفرة', 'error');
            return;
        }
        
        // انتظار قصير لضمان الرسم
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // إنشاء رابط التنزيل
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `صورة-مع-نص-${timestamp}.png`;
        
        // تحويل Canvas إلى صورة
        canvas.toBlob((blob) => {
            if (!blob) {
                hideLoadingIndicator();
                showAlert('فشل في إنشاء الصورة', 'error');
                return;
            }
            
            const url = URL.createObjectURL(blob);
            link.href = url;
            
            // محاكاة النقر على الرابط
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // تحرير الذاكرة
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            hideLoadingIndicator();
            showAlert('تم تنزيل الصورة بنجاح!', 'success');
            
            console.log('تم التنزيل بنجاح');
            
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('خطأ في التنزيل:', error);
        hideLoadingIndicator();
        showAlert('حدث خطأ أثناء التنزيل: ' + error.message, 'error');
    }
}

// ============== دالة المشاركة المحسنة ==============
async function shareImage() {
    try {
        console.log('بدء عملية المشاركة...');
        
        // التحقق من وجود صورة
        const canvas = document.getElementById('canvas');
        if (!canvas || !canvas.width || !canvas.width > 0) {
            showAlert('يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        // التحقق من دعم المشاركة
        if (!navigator.share) {
            showAlert('المشاركة غير مدعومة في هذا المتصفح', 'info');
            return downloadImage(); // استدعاء التنزيل كبديل
        }
        
        // إظهار مؤشر تحميل
        showLoadingIndicator('جاري تحضير الصورة للمشاركة...');
        
        // التأكد أننا في صفحة المحرر
        if (!document.getElementById('editorPage').classList.contains('active')) {
            showPage('editor');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // رسم النص على Canvas
        if (typeof renderTextOnCanvas === 'function') {
            const success = renderTextOnCanvas();
            if (!success) {
                hideLoadingIndicator();
                showAlert('فشل في تحضير الصورة', 'error');
                return;
            }
        } else {
            hideLoadingIndicator();
            showAlert('دالة الرسم غير متوفرة', 'error');
            return;
        }
        
        // انتظار قصير لضمان الرسم
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // تحويل Canvas إلى Blob
        canvas.toBlob(async (blob) => {
            if (!blob) {
                hideLoadingIndicator();
                showAlert('فشل في إنشاء الصورة', 'error');
                return;
            }
            
            // إنشاء ملف من Blob
            const file = new File([blob], 'صورة-مع-نص.png', { 
                type: 'image/png',
                lastModified: Date.now()
            });
            
            try {
                // التحقق من إمكانية المشاركة
                if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
                    hideLoadingIndicator();
                    showAlert('لا يمكن مشاركة الملف في هذا الجهاز', 'info');
                    return downloadImage();
                }
                
                // مشاركة الملف
                await navigator.share({
                    files: [file],
                    title: 'صورة مع نص',
                    text: 'شاهد هذه الصورة الرائعة مع نص مكتوب عليها!'
                });
                
                hideLoadingIndicator();
                showAlert('تم المشاركة بنجاح!', 'success');
                console.log('تمت المشاركة بنجاح');
                
            } catch (shareError) {
                hideLoadingIndicator();
                
                // إذا كان الخطأ بسبب إلغاء المستخدم، لا نعرض رسالة
                if (shareError.name === 'AbortError') {
                    console.log('تم إلغاء المشاركة من قبل المستخدم');
                    return;
                }
                
                console.error('خطأ في المشاركة:', shareError);
                showAlert('فشلت المشاركة: ' + shareError.message, 'error');
                
                // محاولة التنزيل كبديل
                downloadImage();
            }
            
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('خطأ في المشاركة:', error);
        hideLoadingIndicator();
        showAlert('حدث خطأ أثناء المشاركة: ' + error.message, 'error');
    }
}

// ============== دوال مساعدة ==============
function showAlert(message, type = 'info') {
    // إزالة أي رسالة سابقة
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // إنشاء عنصر الرسالة
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0 10px;
        ">×</button>
    `;
    
    document.body.appendChild(alert);
    
    // إزالة الرسالة تلقائياً بعد 5 ثواني
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function showLoadingIndicator(message = 'جاري المعالجة...') {
    // إزالة أي مؤشر سابق
    const existingLoader = document.querySelector('.custom-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    // إنشاء عنصر التحميل
    const loader = document.createElement('div');
    loader.className = 'custom-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <div class="loader-text">${message}</div>
        </div>
    `;
    
    document.body.appendChild(loader);
}

function hideLoadingIndicator() {
    const loader = document.querySelector('.custom-loader');
    if (loader) {
        loader.remove();
    }
}
