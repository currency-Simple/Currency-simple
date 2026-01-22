// متغيرات عامة
let categories = [];
let currentCategory = null;
let currentImages = [];
let keyboardOpen = false;
let keyboardHeight = 0;

// تحميل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('App starting...');
    loadCategories();
    showPage('categories');
    
    setupKeyboardListeners();
    setupEnhancedKeyboardDetection();
    
    // إضافة مستمع للتركيز على حقل النص
    const textOverlay = document.getElementById('textOverlay');
    if (textOverlay) {
        // إخفاء النص الافتراضي عند التركيز
        textOverlay.addEventListener('focus', function() {
            if (this.textContent === 'اكتب هنا...' || 
                this.textContent === 'Type here...' || 
                this.textContent === 'Écrivez ici...') {
                this.textContent = '';
            }
        });
        
        // إعادة النص الافتراضي إذا ترك فارغاً
        textOverlay.addEventListener('blur', function() {
            if (this.textContent.trim() === '') {
                const lang = localStorage.getItem('language') || 'ar';
                const placeholders = {
                    ar: 'اكتب هنا...',
                    en: 'Type here...',
                    fr: 'Écrivez ici...'
                };
                this.textContent = placeholders[lang];
            }
        });
    }
});

// ============== إدارة لوحة المفاتيح المحسنة ==============

function setupEnhancedKeyboardDetection() {
    // طريقة 1: استخدام Visual Viewport API
    if ('visualViewport' in window) {
        const viewport = window.visualViewport;
        
        viewport.addEventListener('resize', () => {
            const newKeyboardHeight = window.innerHeight - viewport.height;
            
            if (newKeyboardHeight > 100 && !keyboardOpen) {
                // لوحة المفاتيح ظهرت
                keyboardHeight = newKeyboardHeight;
                keyboardOpen = true;
                handleKeyboardAppear();
            } else if (newKeyboardHeight < 50 && keyboardOpen) {
                // لوحة المفاتيح اختفت
                keyboardOpen = false;
                handleKeyboardDisappear();
            }
        });
        
        viewport.addEventListener('scroll', () => {
            if (keyboardOpen) {
                // رفع المحتوى لأعلى عند الكتابة
                const textOverlay = document.getElementById('textOverlay');
                if (textOverlay && document.activeElement === textOverlay) {
                    textOverlay.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'center'
                    });
                }
            }
        });
    }
    
    // طريقة 2: اكتشاف التغيير في حجم النافذة
    window.addEventListener('resize', () => {
        setTimeout(() => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const windowHeight = window.innerHeight;
            const screenHeight = window.screen.height;
            
            if (isMobile && windowHeight < screenHeight * 0.7) {
                if (!keyboardOpen) {
                    keyboardOpen = true;
                    keyboardHeight = screenHeight - windowHeight;
                    handleKeyboardAppear();
                }
            } else {
                if (keyboardOpen) {
                    keyboardOpen = false;
                    handleKeyboardDisappear();
                }
            }
        }, 100);
    });
    
    // طريقة 3: مستمعات التركيز
    document.addEventListener('focusin', (e) => {
        if (e.target.id === 'textOverlay') {
            setTimeout(() => {
                if (!keyboardOpen) {
                    keyboardOpen = true;
                    handleKeyboardAppear();
                }
            }, 300);
        }
    });
    
    document.addEventListener('focusout', (e) => {
        if (e.target.id === 'textOverlay') {
            setTimeout(() => {
                if (document.activeElement.id !== 'textOverlay' && keyboardOpen) {
                    keyboardOpen = false;
                    handleKeyboardDisappear();
                }
            }, 300);
        }
    });
}

function handleKeyboardAppear() {
    console.log('لوحة المفاتيح ظهرت، الارتفاع:', keyboardHeight);
    
    // إضافة كلاس للمؤشر
    document.documentElement.classList.add('keyboard-open');
    document.body.classList.add('keyboard-open');
    
    const editorPage = document.getElementById('editorPage');
    if (editorPage) editorPage.classList.add('keyboard-open');
    
    // توسيع منطقة المحرر
    const editorContainer = document.querySelector('.editor-container');
    if (editorContainer) {
        const additionalSpace = Math.min(keyboardHeight + 100, 400);
        editorContainer.style.height = `calc(100vh + ${additionalSpace}px)`;
        editorContainer.style.overflowY = 'auto';
        editorContainer.style.webkitOverflowScrolling = 'touch';
    }
    
    // رفع المحتوى للأعلى
    setTimeout(() => {
        const textOverlay = document.getElementById('textOverlay');
        if (textOverlay) {
            textOverlay.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'center'
            });
            
            // الحفاظ على التركيز
            textOverlay.focus({ preventScroll: true });
        }
    }, 100);
    
    // إظهار مساحة لوحة المفاتيح
    let keyboardSpace = document.querySelector('.keyboard-space');
    if (!keyboardSpace) {
        keyboardSpace = document.createElement('div');
        keyboardSpace.className = 'keyboard-space';
        const editorContainer = document.querySelector('.editor-container');
        if (editorContainer) {
            editorContainer.appendChild(keyboardSpace);
        }
    }
    keyboardSpace.style.display = 'block';
    keyboardSpace.style.height = `${Math.min(keyboardHeight + 50, 300)}px`;
}

function handleKeyboardDisappear() {
    console.log('لوحة المفاتيح اختفت');
    
    // إزالة كلاس المؤشر
    document.documentElement.classList.remove('keyboard-open');
    document.body.classList.remove('keyboard-open');
    
    const editorPage = document.getElementById('editorPage');
    if (editorPage) editorPage.classList.remove('keyboard-open');
    
    // استعادة أبعاد المحرر
    const editorContainer = document.querySelector('.editor-container');
    if (editorContainer) {
        editorContainer.style.height = 'calc(100vh - 211px)';
        editorContainer.style.overflowY = 'hidden';
    }
    
    // إخفاء مساحة لوحة المفاتيح
    const keyboardSpace = document.querySelector('.keyboard-space');
    if (keyboardSpace) {
        keyboardSpace.style.display = 'none';
    }
    
    // إرجاع الصفحة للأعلى
    window.scrollTo(0, 0);
}

// ============== الوظائف الأساسية ==============

function setupKeyboardListeners() {
    // للتوافق مع الكود القديم
    if ('visualViewport' in window) {
        const viewport = window.visualViewport;
        
        viewport.addEventListener('resize', () => {
            const newKeyboardHeight = window.innerHeight - viewport.height;
            
            if (newKeyboardHeight > 100) {
                if (!keyboardOpen) {
                    keyboardOpen = true;
                    keyboardHeight = newKeyboardHeight;
                    handleKeyboardAppear();
                }
            } else {
                if (keyboardOpen) {
                    keyboardOpen = false;
                    handleKeyboardDisappear();
                }
            }
        });
    }
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
            // تحسين ألوان الصورة قبل التحميل
            enhanceAndLoadImage(img.url);
        }
    }, 100);
}

// تحسين وتحميل الصورة
async function enhanceAndLoadImage(imageUrl) {
    try {
        showLoadingIndicator('جاري تحسين جودة الصورة...');
        
        // إنشاء صورة مؤقتة لتحسين الألوان
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        
        tempImg.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = tempImg.width;
            canvas.height = tempImg.height;
            
            // رسم الصورة
            ctx.drawImage(tempImg, 0, 0);
            
            // تحسين الألوان (زيادة التشبع والتباين)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                // زيادة التشبع
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];
                
                // زيادة الإضاءة قليلاً
                r = Math.min(255, r * 1.05);
                g = Math.min(255, g * 1.05);
                b = Math.min(255, b * 1.05);
                
                // زيادة التباين
                const avg = (r + g + b) / 3;
                const contrast = 1.1;
                r = avg + contrast * (r - avg);
                g = avg + contrast * (g - avg);
                b = avg + contrast * (b - avg);
                
                data[i] = Math.max(0, Math.min(255, r));
                data[i + 1] = Math.max(0, Math.min(255, g));
                data[i + 2] = Math.max(0, Math.min(255, b));
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // تحويل إلى URL
            const enhancedUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            // تحميل الصورة المحسنة
            loadImageToEditor(enhancedUrl);
            hideLoadingIndicator();
        };
        
        tempImg.onerror = function() {
            // في حالة الخطأ، استخدام الصورة الأصلية
            loadImageToEditor(imageUrl);
            hideLoadingIndicator();
        };
        
        tempImg.src = imageUrl;
        
    } catch (error) {
        console.error('خطأ في تحسين الصورة:', error);
        loadImageToEditor(imageUrl);
        hideLoadingIndicator();
    }
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
        handleKeyboardDisappear();
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
        
        const canvas = document.getElementById('canvas');
        if (!canvas || !canvas.width) {
            showAlert('يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        // عرض تحميل
        showLoadingIndicator('جاري إنشاء الصورة النهائية...');
        
        // استخدام دالة التصدير الخاصة
        let exportCanvas;
        if (typeof prepareImageForExport === 'function') {
            exportCanvas = prepareImageForExport();
            if (!exportCanvas) {
                hideLoadingIndicator();
                showAlert('فشل في تحضير الصورة', 'error');
                return;
            }
        } else if (typeof renderTextOnCanvas === 'function') {
            // استخدام الطريقة القديمة كبديل
            renderTextOnCanvas();
            exportCanvas = canvas;
        } else {
            hideLoadingIndicator();
            showAlert('دالة الرسم غير متوفرة', 'error');
            return;
        }
        
        // انتظار الرسم
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // إنشاء ملف للتنزيل
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `صورة-مع-نص-${timestamp}.png`;
        
        // محاولة التنزيل بالطريقة العادية
        try {
            const link = document.createElement('a');
            link.download = filename;
            
            // تحويل Canvas إلى صورة عالية الجودة
            exportCanvas.toBlob((blob) => {
                if (!blob) {
                    hideLoadingIndicator();
                    showAlert('فشل في إنشاء الصورة', 'error');
                    return;
                }
                
                const url = URL.createObjectURL(blob);
                link.href = url;
                
                // إضافة الرابط والنقر عليه
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
            
            // طريقة بديلة
            const dataURL = exportCanvas.toDataURL('image/png', 1.0);
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                    <head><title>حفظ الصورة</title></head>
                    <body style="margin:0; padding:20px; text-align:center;">
                        <h3>لحفظ الصورة:</h3>
                        <p>اضغط مع الاستمرار على الصورة واختر "حفظ الصورة"</p>
                        <img src="${dataURL}" style="max-width:100%; height:auto;" />
                    </body>
                    </html>
                `);
                newWindow.document.close();
                showAlert('افتح نافذة الحفظ لحفظ الصورة', 'info');
            }
        }
        
    } catch (error) {
        console.error('خطأ عام في التنزيل:', error);
        hideLoadingIndicator();
        showAlert('حدث خطأ أثناء التنزيل: ' + error.message, 'error');
    }
}

// ============== دالة المشاركة ==============
async function shareImage() {
    try {
        console.log('بدء عملية المشاركة...');
        
        const canvas = document.getElementById('canvas');
        if (!canvas || !canvas.width) {
            showAlert('يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        if (!navigator.share) {
            showAlert('المشاركة غير مدعومة في هذا المتصفح', 'info');
            return downloadImage();
        }
        
        showLoadingIndicator('جاري تحضير الصورة للمشاركة...');
        
        // استخدام دالة التصدير
        let exportCanvas;
        if (typeof prepareImageForExport === 'function') {
            exportCanvas = prepareImageForExport();
            if (!exportCanvas) {
                hideLoadingIndicator();
                showAlert('فشل في تحضير الصورة', 'error');
                return;
            }
        } else {
            if (typeof renderTextOnCanvas === 'function') {
                renderTextOnCanvas();
            }
            exportCanvas = canvas;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        exportCanvas.toBlob(async (blob) => {
            if (!blob) {
                hideLoadingIndicator();
                showAlert('فشل في إنشاء الصورة', 'error');
                return;
            }
            
            const file = new File([blob], 'صورة-مع-نص.png', { 
                type: 'image/png',
                lastModified: Date.now()
            });
            
            try {
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'صورة مع نص',
                        text: 'شاهد هذه الصورة الرائعة مع نص مكتوب عليها!'
                    });
                    hideLoadingIndicator();
                    showAlert('تم المشاركة بنجاح!', 'success');
                } else {
                    hideLoadingIndicator();
                    showAlert('لا يمكن مشاركة الملف في هذا الجهاز', 'info');
                }
            } catch (shareError) {
                hideLoadingIndicator();
                if (shareError.name !== 'AbortError') {
                    console.error('خطأ في المشاركة:', shareError);
                    showAlert('فشلت المشاركة', 'error');
                }
            }
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('خطأ في المشاركة:', error);
        hideLoadingIndicator();
        showAlert('حدث خطأ أثناء المشاركة', 'error');
    }
}

// ============== دوال مساعدة ==============
function showAlert(message, type = 'info') {
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();
    
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
    setTimeout(() => { if (alert.parentElement) alert.remove(); }, 5000);
}

function showLoadingIndicator(message = 'جاري المعالجة...') {
    const existingLoader = document.querySelector('.custom-loader');
    if (existingLoader) existingLoader.remove();
    
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
    if (loader) loader.remove();
}

// ============== تحسينات للأداء ==============
document.addEventListener('touchmove', function(e) {
    if (document.body.classList.contains('keyboard-open')) {
        e.preventDefault();
    }
}, { passive: false });

// تحسين تحميل الصفحة
window.addEventListener('load', function() {
    console.log('تطبيق محرر الصور المميز جاهز');
    document.body.style.height = window.innerHeight + 'px';
    
    if (typeof initializeColors === 'function') {
        setTimeout(initializeColors, 500);
    }
});

// منع السلوك الافتراضي لأزرار التنزيل
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
    }
});
