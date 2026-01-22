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

// إعداد مستمعات لوحة المفاتيح
function setupKeyboardListeners() {
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
    }
}

// التعامل مع فتح لوحة المفاتيح
function handleKeyboardOpen(keyboardHeight) {
    if (keyboardOpen) return;
    keyboardOpen = true;
    document.documentElement.classList.add('keyboard-open');
    document.body.classList.add('keyboard-open');
    const editorPage = document.getElementById('editorPage');
    if (editorPage) editorPage.classList.add('keyboard-open');
}

// التعامل مع إغلاق لوحة المفاتيح
function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    document.documentElement.classList.remove('keyboard-open');
    document.body.classList.remove('keyboard-open');
    const editorPage = document.getElementById('editorPage');
    if (editorPage) editorPage.classList.remove('keyboard-open');
}

// تحميل الفئات
async function loadCategories() {
    categories = [];
    console.log('Loading categories...');
    
    for (let i = 1; i <= 10; i++) {
        try {
            const response = await fetch(`data/images${i}.json`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.images && data.images.length > 0) {
                    categories.push({
                        id: i,
                        name: data.name || `فئة ${i}`,
                        coverImage: data.images[0].url,
                        images: data.images
                    });
                }
            }
        } catch (error) {
            console.log(`Category ${i} not found`);
        }
    }
    
    if (categories.length === 0) {
        loadDemoCategories();
    } else {
        displayCategories();
    }
}

// فئات تجريبية
function loadDemoCategories() {
    for (let i = 1; i <= 5; i++) {
        const images = [];
        for (let j = 1; j <= 20; j++) {
            const id = (i - 1) * 20 + j;
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

// ============== دالة التنزيل المحسنة (المشكلة 1) ==============
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
        
        // المشكلة 1: استخدام دالة التصدير الخاصة
        let exportCanvas;
        if (typeof prepareImageForExport === 'function') {
            exportCanvas = prepareImageForExport();
        } else if (typeof renderTextOnCanvas === 'function') {
            // استخدام الطريقة القديمة كبديل
            renderTextOnCanvas();
            exportCanvas = canvas;
        } else {
            exportCanvas = canvas;
        }
        
        // انتظار الرسم
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // إنشاء ملف للتنزيل
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `صورة-مع-نص-${timestamp}.png`;
        
        // محاولة التنزيل
        try {
            const link = document.createElement('a');
            link.download = filename;
            
            // تحويل Canvas إلى صورة
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
                
                // تحرير الذاكرة بعد ثانية
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
            }
        }
        
    } catch (error) {
        console.error('خطأ عام في التنزيل:', error);
        hideLoadingIndicator();
        showAlert('حدث خطأ أثناء التنزيل', 'error');
    }
}

// ============== دالة المشاركة ==============
async function shareImage() {
    try {
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
        } else {
            if (typeof renderTextOnCanvas === 'function') {
                renderTextOnCanvas();
            }
            exportCanvas = canvas;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
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
