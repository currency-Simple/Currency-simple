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
    
    setupKeyboardListeners();
});

// تحميل الفئات
async function loadCategories() {
    categories = [];
    console.log('Loading categories...');
    
    try {
        // محاولة تحميل أول 5 فئات
        const promises = [];
        for (let i = 1; i <= 5; i++) {
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
    } catch (error) {
        console.error('Error loading categories:', error);
        loadDemoCategories();
    }
}

// فئات تجريبية
function loadDemoCategories() {
    console.log('Loading demo categories...');
    
    for (let i = 1; i <= 4; i++) {
        const images = [];
        for (let j = 1; j <= 12; j++) {
            const id = (i - 1) * 12 + j;
            images.push({
                id: id,
                url: `https://picsum.photos/300/400?random=${id}`,
                title: `صورة ${id}`
            });
        }
        categories.push({
            id: i,
            name: `فئة تجريبية ${i}`,
            coverImage: images[0].url,
            images: images
        });
    }
    displayCategories();
}

// عرض الفئات
function displayCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) {
        console.error('Categories grid not found');
        return;
    }
    
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
    
    console.log('Categories displayed:', categories.length);
}

// فتح فئة
function openCategory(cat) {
    currentCategory = cat;
    currentImages = cat.images;
    
    const categoryTitle = document.getElementById('categoryTitle');
    if (categoryTitle) {
        categoryTitle.textContent = cat.name;
    }
    
    displayImages();
    showPage('images');
    
    console.log('Category opened:', cat.name);
}

// عرض الصور
function displayImages() {
    const grid = document.getElementById('imageGrid');
    if (!grid) {
        console.error('Image grid not found');
        return;
    }
    
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
    
    console.log('Images displayed:', currentImages.length);
}

// اختيار صورة
function selectImage(img) {
    console.log('Image selected:', img.id);
    
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
        'colored': 'coloredPage',
        'settings': 'settingsPage'
    };
    
    const page = document.getElementById(pageMap[pageName]);
    if (page) {
        page.classList.add('active');
    }
    
    const navMap = {
        'categories': 'navCategories',
        'editor': 'navEditor',
        'colored': 'navColored',
        'settings': 'navSettings'
    };
    
    const btn = document.getElementById(navMap[pageName]);
    if (btn) {
        btn.classList.add('active');
    }
    
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

// إعداد مستمعات لوحة المفاتيح
function setupKeyboardListeners() {
    window.addEventListener('resize', () => {
        setTimeout(() => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const windowHeight = window.innerHeight;
            const screenHeight = window.screen.height;
            
            if (isMobile && windowHeight < screenHeight * 0.7) {
                handleKeyboardOpen();
            } else {
                handleKeyboardClose();
            }
        }, 100);
    });
}

// التعامل مع فتح لوحة المفاتيح
function handleKeyboardOpen() {
    if (keyboardOpen) return;
    keyboardOpen = true;
    console.log('Keyboard opened');
    
    document.body.classList.add('keyboard-open');
}

// التعامل مع إغلاق لوحة المفاتيح
function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    console.log('Keyboard closed');
    
    document.body.classList.remove('keyboard-open');
}

// ============== دالة التنزيل ==============
async function downloadImage() {
    try {
        console.log('بدء عملية التنزيل...');
        
        // التحقق من وجود صورة
        const canvas = document.getElementById('canvas');
        if (!canvas || canvas.width === 0) {
            showAlert('يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        // إظهار مؤشر تحميل
        showLoadingIndicator('جاري إنشاء الصورة النهائية...');
        
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
            hideLoadingIndicator();
            showAlert('دالة الرسم غير متوفرة', 'error');
            return;
        }
        
        // انتظار الرسم
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // إنشاء ملف للتنزيل
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `صورة-مع-نص-${timestamp}.png`;
        
        // تحويل Canvas إلى Blob
        exportCanvas.toBlob((blob) => {
            if (!blob) {
                hideLoadingIndicator();
                showAlert('فشل في إنشاء الصورة', 'error');
                return;
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            hideLoadingIndicator();
            showAlert('تم تنزيل الصورة بنجاح!', 'success');
            
            console.log('Download completed');
            
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('خطأ في التنزيل:', error);
        hideLoadingIndicator();
        showAlert('حدث خطأ أثناء التنزيل', 'error');
    }
}

// ============== دالة المشاركة ==============
async function shareImage() {
    try {
        console.log('بدء عملية المشاركة...');
        
        // التحقق من وجود صورة
        const canvas = document.getElementById('canvas');
        if (!canvas || canvas.width === 0) {
            showAlert('يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        // التحقق من دعم المشاركة
        if (!navigator.share) {
            showAlert('المشاركة غير مدعومة في هذا المتصفح', 'info');
            return downloadImage();
        }
        
        // إظهار مؤشر تحميل
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
            hideLoadingIndicator();
            showAlert('دالة الرسم غير متوفرة', 'error');
            return;
        }
        
        // انتظار الرسم
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // تحويل Canvas إلى Blob
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
                if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
                    hideLoadingIndicator();
                    showAlert('لا يمكن مشاركة الملف في هذا الجهاز', 'info');
                    return downloadImage();
                }
                
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
                
                if (shareError.name === 'AbortError') {
                    console.log('تم إلغاء المشاركة من قبل المستخدم');
                    return;
                }
                
                console.error('خطأ في المشاركة:', shareError);
                showAlert('فشلت المشاركة', 'error');
                downloadImage();
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
    if (existingAlert) {
        existingAlert.remove();
    }
    
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
    
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function showLoadingIndicator(message = 'جاري المعالجة...') {
    const existingLoader = document.querySelector('.custom-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
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

// تهيئة النص
window.currentText = '';
