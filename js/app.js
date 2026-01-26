// js/app.js
let categories = [];
let currentCategory = null;
let currentImages = [];

// التهيئة
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 App starting...');
    
    // تحميل الفئات من Supabase
    await loadCategories();
    
    // إعداد عناصر التحكم
    setupUpload();
    setupEventListeners();
    
    // عرض الصفحة الأولى
    showPage('categories');
});

// تحميل الفئات
async function loadCategories() {
    try {
        categories = await window.imageDB.getCategories();
        displayCategories();
        console.log(`✅ Loaded ${categories.length} categories`);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// عرض الفئات
function displayCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    categories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.onclick = () => openCategory(category);
        
        item.innerHTML = `
            <img src="${category.cover_image}" alt="${category.name}" loading="lazy">
            <div class="category-overlay">
                <div class="category-title">${category.name}</div>
            </div>
        `;
        
        grid.appendChild(item);
    });
}

// فتح فئة
async function openCategory(category) {
    currentCategory = category;
    
    // تحديث العنوان
    const title = document.getElementById('categoryTitle');
    if (title) title.textContent = category.name;
    
    // جلب صور الفئة
    currentImages = await window.imageDB.getCategoryImages(category.id);
    displayImages();
    
    // الانتقال لصفحة الصور
    showPage('images');
}

// عرض الصور
function displayImages() {
    const grid = document.getElementById('imageGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    currentImages.forEach(image => {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.onclick = () => selectImage(image);
        
        item.innerHTML = `
            <img src="${image.url}" alt="${image.title}" loading="lazy">
            <div class="image-title">${image.title}</div>
        `;
        
        grid.appendChild(item);
    });
}

// اختيار صورة
function selectImage(image) {
    console.log('Selected image:', image);
    
    // تحميل الصورة في المحرر
    if (window.loadImageToEditor) {
        window.loadImageToEditor(image.url);
    }
    
    // الانتقال للمحرر
    showPage('editor');
}

// إعداد رفع الصورة
function setupUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageUpload');
    
    if (!uploadArea || !fileInput) return;
    
    // عند النقر على منطقة الرفع
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // عند اختيار ملف
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('يرجى اختيار ملف صورة فقط');
            return;
        }
        
        // عرض مؤشر تحميل
        uploadArea.innerHTML = `
            <div class="loader"></div>
            <p>جاري رفع الصورة...</p>
        `;
        
        try {
            // رفع الصورة إلى Supabase
            const imageUrl = await window.imageDB.uploadImage(file);
            
            // تحميل الصورة في المحرر
            if (window.loadImageToEditor) {
                window.loadImageToEditor(imageUrl);
            }
            
            // الانتقال للمحرر
            showPage('editor');
            
            // إظهار رسالة نجاح
            showAlert('✅ تم رفع الصورة بنجاح', 'success');
            
        } catch (error) {
            console.error('Upload error:', error);
            showAlert('❌ فشل رفع الصورة', 'error');
        }
    });
    
    // سحب وإفلات
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });
}

// استخدام صورة تجريبية
function useSampleImage() {
    const sampleImages = [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    
    if (window.loadImageToEditor) {
        window.loadImageToEditor(`${randomImage}?w=1200&h=800&fit=crop`);
    }
    
    showPage('editor');
}

// التنقل بين الصفحات
function showPage(pageName) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // إظهار الصفحة المطلوبة
    const page = document.getElementById(`${pageName}Page`);
    if (page) {
        page.classList.add('active');
    }
    
    // تحديث القائمة السفلية
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const navBtn = document.querySelector(`.nav-btn[onclick*="${pageName}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
}

// الرجوع للخلف
function goBack() {
    if (currentCategory) {
        showPage('images');
    } else {
        showPage('categories');
    }
}

// الإعدادات العامة
function setupEventListeners() {
    // اختصارات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        // Ctrl+S لحفظ
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadImage();
        }
        
        // Escape للخروج
        if (e.key === 'Escape') {
            goBack();
        }
    });
    
    // عند فقدان الاتصال
    window.addEventListener('offline', () => {
        showAlert('⚠️ أنت غير متصل بالإنترنت', 'warning');
    });
    
    window.addEventListener('online', () => {
        showAlert('✅ تم استعادة الاتصال', 'success');
    });
}

// تنزيل الصورة
function downloadImage() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `صورة-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showAlert('✅ تم تنزيل الصورة', 'success');
}

// مشاركة الصورة
async function shareImage() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    if (navigator.share) {
        try {
            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'صورة.png', { type: 'image/png' });
                
                await navigator.share({
                    files: [file],
                    title: 'صورة من محرر النصوص',
                    text: 'شاهد هذه الصورة المعدلة!'
                });
                
                showAlert('✅ تم المشاركة بنجاح', 'success');
            });
        } catch (error) {
            console.error('Share error:', error);
            downloadImage();
        }
    } else {
        downloadImage();
    }
}

// إظهار رسالة
function showAlert(message, type = 'info') {
    // إنشاء عنصر الرسالة
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // إخفاء تلقائي بعد 3 ثوان
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// تصدير الدوال
window.showPage = showPage;
window.goBack = goBack;
window.downloadImage = downloadImage;
window.shareImage = shareImage;
window.useSampleImage = useSampleImage;
