// app.js - التطبيق الرئيسي

let currentUser = null;
let categories = [];
let currentCategory = null;
let currentImages = [];

// تهيئة التطبيق
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 بدء تشغيل التطبيق...');
    
    // تهيئة الإعدادات
    loadSettings();
    
    // تهيئة الخطوط والألوان
    if (typeof initializeFonts === 'function') initializeFonts();
    if (typeof initializeColors === 'function') initializeColors();
    
    // التحقق من حالة المصادقة
    await checkAuthStatus();
    
    // الاستماع لتغييرات المصادقة
    Auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            await onUserSignedIn();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showPage('auth');
        }
    });
});

// التحقق من حالة المصادقة
async function checkAuthStatus() {
    try {
        currentUser = await Auth.getCurrentUser();
        
        if (currentUser) {
            await onUserSignedIn();
        } else {
            showPage('auth');
        }
    } catch (error) {
        console.error('خطأ في التحقق من المصادقة:', error);
        showPage('auth');
    }
}

// عند تسجيل الدخول بنجاح
async function onUserSignedIn() {
    console.log('✅ مستخدم مسجل:', currentUser.email);
    
    showAlert(`مرحباً ${currentUser.email}`, 'success');
    
    // تحميل الفئات من Supabase
    await loadCategories();
    
    // عرض صفحة الفئات
    showPage('categories');
}

// معالجة تسجيل الدخول/التسجيل
async function handleAuth(type) {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        showAlert('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        if (type === 'signup') {
            await Auth.signUp(email, password);
            showAlert('تم إنشاء الحساب! تحقق من بريدك الإلكتروني', 'success');
        } else {
            await Auth.signIn(email, password);
        }
        
    } catch (error) {
        console.error('خطأ في المصادقة:', error);
        showAlert(error.message || 'حدث خطأ في المصادقة', 'error');
    } finally {
        showLoading(false);
    }
}

// تسجيل دخول بجوجل
async function handleGoogleAuth() {
    try {
        showLoading(true);
        await Auth.signInWithGoogle();
    } catch (error) {
        console.error('خطأ في تسجيل الدخول بجوجل:', error);
        showAlert('فشل تسجيل الدخول بجوجل', 'error');
        showLoading(false);
    }
}

// تحميل الفئات من Supabase
async function loadCategories() {
    try {
        console.log('📂 جاري تحميل الفئات...');
        showLoading(true);
        
        const data = await Database.getCategories();
        categories = data;
        
        displayCategories();
        console.log(`✅ تم تحميل ${categories.length} فئة`);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الفئات:', error);
        showAlert('فشل تحميل الفئات', 'error');
    } finally {
        showLoading(false);
    }
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
            <img src="${cat.cover_image}" alt="${cat.name}" loading="lazy">
            <div class="category-overlay">
                <div class="category-title">${cat.name}</div>
            </div>
        `;
        
        grid.appendChild(item);
    });
}

// فتح فئة
async function openCategory(cat) {
    try {
        currentCategory = cat;
        showLoading(true);
        
        console.log(`📂 فتح فئة: ${cat.name}`);
        
        const images = await Database.getCategoryImages(cat.id);
        currentImages = images;
        
        const title = document.getElementById('categoryTitle');
        if (title) title.textContent = cat.name;
        
        displayImages();
        showPage('images');
        
    } catch (error) {
        console.error('❌ خطأ في فتح الفئة:', error);
        showAlert('فشل تحميل الصور', 'error');
    } finally {
        showLoading(false);
    }
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
    console.log(`✅ تم اختيار الصورة: ${img.id}`);
    
    showPage('editor');
    
    setTimeout(() => {
        if (typeof loadImageToEditor === 'function') {
            loadImageToEditor(img.url);
        }
    }, 100);
}

// التنقل بين الصفحات
function showPage(pageName) {
    console.log(`➡️ الانتقال إلى: ${pageName}`);
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const pageMap = {
        'auth': 'authPage',
        'categories': 'categoriesPage',
        'images': 'imagesPage',
        'editor': 'editorPage'
    };
    
    const page = document.getElementById(pageMap[pageName]);
    if (page) page.classList.add('active');
    
    const navMap = {
        'categories': 'navCategories',
        'editor': 'navEditor'
    };
    
    const btn = document.getElementById(navMap[pageName]);
    if (btn) btn.classList.add('active');
    
    // إخفاء القائمة السفلية في صفحة المصادقة
    const nav = document.querySelector('.bottom-nav');
    if (nav) {
        nav.style.display = pageName === 'auth' ? 'none' : 'flex';
    }
}

// الرجوع للصور
function goBackToImages() {
    if (currentCategory) {
        showPage('images');
    } else {
        showPage('categories');
    }
}

// فتح/إغلاق اللوحات
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    const isActive = panel.classList.contains('active');
    
    // إغلاق جميع اللوحات
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    
    // فتح اللوحة المطلوبة
    if (!isActive) {
        panel.classList.add('active');
    }
}

function closePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('active');
    }
}

// بطاقة النص
function toggleTextCard() {
    const card = document.getElementById('textCard');
    if (!card) return;
    
    if (card.style.display === 'none') {
        card.style.display = 'block';
        const input = document.getElementById('textInput');
        if (input) {
            input.value = window.currentText || '';
            input.focus();
        }
    } else {
        card.style.display = 'none';
    }
}

function closeTextCard() {
    const card = document.getElementById('textCard');
    if (card) card.style.display = 'none';
}

function applyText() {
    const input = document.getElementById('textInput');
    if (!input) return;
    
    window.currentText = input.value.trim();
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
    
    closeTextCard();
    showAlert('تم تطبيق النص', 'success');
}

// التنزيل
async function downloadImage() {
    try {
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            showAlert('لا توجد صورة للتنزيل', 'error');
            return;
        }
        
        showLoading(true);
        
        let exportCanvas;
        if (typeof prepareImageForExport === 'function') {
            exportCanvas = prepareImageForExport();
        } else {
            exportCanvas = canvas;
        }
        
        exportCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `صورة-${Date.now()}.png`;
            link.href = url;
            link.click();
            
            URL.revokeObjectURL(url);
            showAlert('تم التنزيل بنجاح', 'success');
            showLoading(false);
        }, 'image/png');
        
    } catch (error) {
        console.error('خطأ في التنزيل:', error);
        showAlert('فشل التنزيل', 'error');
        showLoading(false);
    }
}

// المشاركة
async function shareImage() {
    try {
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            showAlert('لا توجد صورة للمشاركة', 'error');
            return;
        }
        
        if (!navigator.share) {
            return downloadImage();
        }
        
        showLoading(true);
        
        let exportCanvas;
        if (typeof prepareImageForExport === 'function') {
            exportCanvas = prepareImageForExport();
        } else {
            exportCanvas = canvas;
        }
        
        exportCanvas.toBlob(async (blob) => {
            const file = new File([blob], 'صورة.png', { type: 'image/png' });
            
            try {
                await navigator.share({
                    files: [file],
                    title: 'صورة معدلة'
                });
                showAlert('تم المشاركة', 'success');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    downloadImage();
                }
            } finally {
                showLoading(false);
            }
        }, 'image/png');
        
    } catch (error) {
        console.error('خطأ في المشاركة:', error);
        showAlert('فشلت المشاركة', 'error');
        showLoading(false);
    }
}

// الرسائل
function showAlert(message, type = 'success') {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) existingAlert.remove();
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 3000);
}

// مؤشر التحميل
function showLoading(show) {
    let loader = document.getElementById('loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            loader.innerHTML = '<div style="color: white; font-size: 18px;">جاري التحميل...</div>';
            document.body.appendChild(loader);
        }
    } else {
        if (loader) loader.remove();
    }
}

// تصدير الدوال
window.handleAuth = handleAuth;
window.handleGoogleAuth = handleGoogleAuth;
window.showPage = showPage;
window.goBackToImages = goBackToImages;
window.togglePanel = togglePanel;
window.closePanel = closePanel;
window.toggleTextCard = toggleTextCard;
window.closeTextCard = closeTextCard;
window.applyText = applyText;
window.downloadImage = downloadImage;
window.shareImage = shareImage;
window.showAlert = showAlert;
