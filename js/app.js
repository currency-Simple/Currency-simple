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
    
    console.log('App loaded successfully');
});

// إعداد مستمعات لوحة المفاتيح
function setupKeyboardListeners() {
    // بسيط للموبايل
    window.addEventListener('resize', function() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            const keyboardHeight = window.innerHeight - document.documentElement.clientHeight;
            if (keyboardHeight > 100) {
                handleKeyboardOpen(keyboardHeight);
            } else {
                handleKeyboardClose();
            }
        }
    });
}

// التعامل مع فتح لوحة المفاتيح
function handleKeyboardOpen(keyboardHeight) {
    if (keyboardOpen) return;
    keyboardOpen = true;
    console.log('Keyboard opened');
    
    // إضافة كلاس
    document.body.classList.add('keyboard-open');
    document.getElementById('editorPage')?.classList.add('keyboard-open');
}

// التعامل مع إغلاق لوحة المفاتيح
function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    console.log('Keyboard closed');
    
    // إزالة الكلاس
    document.body.classList.remove('keyboard-open');
    document.getElementById('editorPage')?.classList.remove('keyboard-open');
}

// تحميل الفئات
async function loadCategories() {
    categories = [];
    console.log('Loading categories...');
    
    // محاولة تحميل فئة واحدة أولاً للتجربة
    try {
        const response = await fetch('data/images1.json');
        if (response.ok) {
            const data = await response.json();
            if (data && data.images && data.images.length > 0) {
                categories.push({
                    id: 1,
                    name: data.name || 'فئة 1',
                    coverImage: data.images[0].url,
                    images: data.images
                });
                console.log('Category 1 loaded');
            }
        }
    } catch (error) {
        console.log('Using demo categories');
        loadDemoCategories();
    }
    
    if (categories.length === 0) {
        loadDemoCategories();
    } else {
        displayCategories();
    }
}

// فئات تجريبية
function loadDemoCategories() {
    console.log('Loading demo categories...');
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
            <img src="${cat.coverImage}" alt="${cat.name}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/400x500?text=Error+Loading'">
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
        imgEl.onerror = function() {
            this.src = 'https://via.placeholder.com/400x500?text=Error+Loading';
        };
        
        item.appendChild(imgEl);
        grid.appendChild(item);
    });
}

// اختيار صورة
function selectImage(img) {
    console.log('Selecting image:', img.url);
    localStorage.setItem('selectedImage', JSON.stringify(img));
    showPage('editor');
    
    // تأخير قصير لتحميل الصورة
    setTimeout(() => {
        if (typeof loadImageToEditor === 'function') {
            console.log('Loading image to editor...');
            loadImageToEditor(img.url);
        } else {
            console.error('loadImageToEditor function not found!');
            alert('خطأ في تحميل المحرر');
        }
    }, 300);
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
}

// العودة
function goBackToImages() {
    if (currentCategory) {
        showPage('images');
    } else {
        showPage('categories');
    }
}

// تنزيل الصورة - الإصلاح الكامل
function downloadImage() {
    console.log('Attempting to download image...');
    
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        alert('لم يتم العثور على عنصر Canvas');
        return;
    }
    
    if (!canvas.width || canvas.width === 0) {
        alert('يرجى اختيار صورة أولاً');
        return;
    }
    
    try {
        console.log('Canvas found, width:', canvas.width, 'height:', canvas.height);
        
        // 1. أولاً تأكد من أن النص مرسوم على Canvas
        if (typeof renderTextOnCanvas === 'function') {
            console.log('Calling renderTextOnCanvas...');
            renderTextOnCanvas();
        } else {
            console.error('renderTextOnCanvas function not available');
            alert('خطأ في دالة الرسم');
            return;
        }
        
        // 2. انتظر قليلاً لضمان اكتمال الرسم
        setTimeout(() => {
            try {
                // 3. تحقق من وجود محتوى على Canvas
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, 1, 1).data;
                console.log('Canvas has data:', imageData);
                
                // 4. أنشئ رابط التنزيل
                const link = document.createElement('a');
                const fileName = `صورة-مع-نص-${Date.now()}.png`;
                
                // 5. حوّل Canvas إلى صورة
                const dataURL = canvas.toDataURL('image/png');
                console.log('Data URL generated, length:', dataURL.length);
                
                // 6. عيّن خصائص الرابط
                link.download = fileName;
                link.href = dataURL;
                
                // 7. أضف الرابط للصفحة وانقر عليه
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('Download successful:', fileName);
                
            } catch (innerError) {
                console.error('Inner download error:', innerError);
                alert('خطأ في إنشاء الصورة: ' + innerError.message);
            }
        }, 500); // انتظار أطول لضمان الرسم
        
    } catch (error) {
        console.error('Download error:', error);
        alert('حدث خطأ أثناء التنزيل: ' + error.message);
    }
}

// مشاركة الصورة
async function shareImage() {
    console.log('Attempting to share image...');
    
    const canvas = document.getElementById('canvas');
    if (!canvas || !canvas.width) {
        alert('يرجى اختيار صورة أولاً');
        return;
    }
    
    try {
        // 1. ارسم النص أولاً
        if (typeof renderTextOnCanvas === 'function') {
            renderTextOnCanvas();
        }
        
        // 2. انتظر للرسم
        setTimeout(async () => {
            try {
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        alert('فشل في إنشاء الصورة');
                        return;
                    }
                    
                    const file = new File([blob], 'image.png', { type: 'image/png' });
                    
                    if (navigator.share) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'صورة مع نص',
                                text: 'شاهد هذه الصورة الجميلة!'
                            });
                        } catch (shareError) {
                            console.log('Sharing cancelled or failed:', shareError);
                        }
                    } else {
                        alert('المشاركة غير مدعومة في هذا المتصفح. يمكنك تنزيل الصورة بدلاً من ذلك.');
                    }
                }, 'image/png', 1.0);
                
            } catch (error) {
                console.error('Share error:', error);
                alert('خطأ في المشاركة');
            }
        }, 500);
        
    } catch (error) {
        console.error('Share setup error:', error);
        alert('حدث خطأ في إعداد المشاركة');
    }
}
