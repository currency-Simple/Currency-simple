// app.js - التطبيق الرئيسي

let currentUser = null;
let categories = [];
let currentCategory = null;
let currentImages = [];
let isGuestMode = true; // الوضع الافتراضي

// تهيئة التطبيق
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 بدء تشغيل التطبيق...');
    
    // تهيئة الإعدادات
    loadSettings();
    
    // تهيئة الخطوط والألوان
    if (typeof initializeFonts === 'function') initializeFonts();
    if (typeof initializeColors === 'function') initializeColors();
    
    // تحميل الفئات مباشرة (بدون تسجيل دخول)
    await loadCategories();
    
    // عرض صفحة الفئات مباشرة
    showPage('categories');
    
    // إخفاء صفحة المصادقة وإظهار زر "حسابي" اختياري
    setupOptionalAuth();
    
    // الاستماع لتغييرات المصادقة (اختياري)
    Auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            isGuestMode = false;
            await onUserSignedIn();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            isGuestMode = true;
            showAlert('تم تسجيل الخروج', 'success');
        }
    });
});

// إعداد نظام المصادقة الاختياري
function setupOptionalAuth() {
    // إخفاء صفحة المصادقة من التنقل
    const authPage = document.getElementById('authPage');
    if (authPage) {
        authPage.classList.remove('active');
    }
    
    // إضافة زر "حسابي" في الهيدر (اختياري)
    const header = document.querySelector('.header');
    if (header && !document.getElementById('accountBtn')) {
        const accountBtn = document.createElement('button');
        accountBtn.id = 'accountBtn';
        accountBtn.className = 'icon-btn';
        accountBtn.onclick = toggleAuthModal;
        accountBtn.innerHTML = '<span class="material-symbols-outlined">account_circle</span>';
        accountBtn.title = 'تسجيل الدخول (اختياري)';
        header.appendChild(accountBtn);
    }
}

// نافذة تسجيل الدخول المنبثقة
function toggleAuthModal() {
    let modal = document.getElementById('authModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <button onclick="closeAuthModal()" class="close-btn" style="position: absolute; top: 10px; right: 10px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
                
                ${currentUser ? `
                    <div style="text-align: center; padding: 20px;">
                        <h2>مرحباً ${currentUser.email}</h2>
                        <p style="color: var(--text-secondary); margin: 10px 0;">أنت مسجل دخول</p>
                        <button onclick="handleSignOut()" class="auth-btn primary" style="margin-top: 20px;">
                            تسجيل الخروج
                        </button>
                    </div>
                ` : `
                    <h2 style="text-align: center; margin-bottom: 20px;">تسجيل الدخول</h2>
                    <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
                        اختياري - لحفظ أعمالك في السحابة
                    </p>
                    
                    <input type="email" id="modalEmail" placeholder="البريد الإلكتروني" class="auth-input">
                    <input type="password" id="modalPassword" placeholder="كلمة المرور" class="auth-input">
                    
                    <button onclick="handleAuth('signin')" class="auth-btn primary">تسجيل الدخول</button>
                    <button onclick="handleAuth('signup')" class="auth-btn secondary">إنشاء حساب</button>
                    
                    <div class="auth-divider">أو</div>
                    
                    <button onclick="handleGoogleAuth()" class="auth-btn google">
                        متابعة مع Google
                    </button>
                    
                    <button onclick="closeAuthModal()" class="auth-btn secondary" style="margin-top: 10px;">
                        متابعة كضيف
                    </button>
                `}
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function handleSignOut() {
    try {
        await Auth.signOut();
        closeAuthModal();
        // إعادة إنشاء النافذة
        const modal = document.getElementById('authModal');
        if (modal) modal.remove();
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        showAlert('فشل تسجيل الخروج', 'error');
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
    const email = document.getElementById('modalEmail')?.value.trim() || 
                  document.getElementById('authEmail')?.value.trim();
    const password = document.getElementById('modalPassword')?.value || 
                     document.getElementById('authPassword')?.value;
    
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
            closeAuthModal();
        } else {
            await Auth.signIn(email, password);
            closeAuthModal();
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
        closeAuthModal();
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
window.handleSignOut = handleSignOut;
window.toggleAuthModal = toggleAuthModal;
window.closeAuthModal = closeAuthModal;
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
