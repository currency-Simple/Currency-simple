// ============================================
// تطبيق محرر النصوص على الصور - النسخة النهائية
// يدعم 100 فئة و 40 خط مع إصلاح جميع المشاكل
// ============================================

// متغيرات عامة
let categories = [];
let currentCategory = null;
let currentImages = [];
let keyboardOpen = false;
let textCardVisible = false;
let loadingCategories = false;
let loadedCategoriesCount = 0;
const MAX_CATEGORIES = 100; // يمكنك تغيير هذا الرقم

// تحميل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 بدء تشغيل التطبيق...');
    
    // تهيئة الخطوط أولاً
    if (typeof initializeFonts === 'function') {
        setTimeout(() => {
            initializeFonts();
            console.log('✅ الخطوط مهيأة');
        }, 100);
    }
    
    // تهيئة الألوان
    if (typeof initializeColors === 'function') {
        setTimeout(() => {
            initializeColors();
            console.log('✅ الألوان مهيأة');
        }, 200);
    }
    
    // تحميل الإعدادات
    if (typeof loadSettings === 'function') {
        loadSettings();
        console.log('✅ الإعدادات محملة');
    }
    
    // تحميل الفئات (جميع الفئات 1-100)
    loadAllCategories();
    
    // عرض صفحة الفئات
    showPage('categories');
    
    // إعداد مستمعات لوحة المفاتيح
    setupKeyboardListeners();
    
    // إعداد بطاقة النص
    setTimeout(() => {
        setupTextCard();
        addTextCardButton();
        console.log('✅ بطاقة النص مهيأة');
    }, 1000);
    
    console.log('🎉 التطبيق جاهز للاستخدام');
});

// ============== تحميل 100 فئة ==============
// تحميل جميع الفئات (من 1 إلى 100)
async function loadAllCategories() {
    if (loadingCategories) return;
    
    loadingCategories = true;
    categories = [];
    loadedCategoriesCount = 0;
    
    console.log(`📂 جاري تحميل جميع الفئات (1-${MAX_CATEGORIES})...`);
    updateCategoriesCounter(`جاري التحميل 0/${MAX_CATEGORIES}`);
    
    // إنشاء مصفوفة من الوعود لتحميل جميع الملفات
    const promises = [];
    
    for (let i = 1; i <= MAX_CATEGORIES; i++) {
        promises.push(loadCategoryFile(i));
    }
    
    // استخدام Promise.allSettled للسماح بفشل بعض الملفات
    const results = await Promise.allSettled(promises);
    
    // حساب الفئات المحملة بنجاح
    loadedCategoriesCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
    
    // ترتيب الفئات حسب المعرف
    categories.sort((a, b) => a.id - b.id);
    
    // عرض الفئات المحملة
    displayCategories();
    
    // تحديث العداد
    updateCategoriesCounter(`تم تحميل ${loadedCategoriesCount} فئة`);
    
    console.log(`✅ تم تحميل ${loadedCategoriesCount}/${MAX_CATEGORIES} فئة بنجاح`);
    loadingCategories = false;
    
    // إذا لم يتم تحميل أي فئة، تحميل الفئات التجريبية
    if (loadedCategoriesCount === 0) {
        console.log('⚠️ لم يتم تحميل أي فئة، جاري تحميل فئات تجريبية...');
        loadDemoCategories();
    }
}

// تحميل ملف فئة واحد
async function loadCategoryFile(categoryId) {
    try {
        const response = await fetch(`data/images${categoryId}.json`);
        
        if (!response.ok) {
            console.log(`⚠️ ملف images${categoryId}.json غير موجود`);
            return null;
        }
        
        const data = await response.json();
        
        if (data && data.images && data.images.length > 0) {
            const category = {
                id: categoryId,
                name: data.name || `فئة ${categoryId}`,
                coverImage: data.images[0].url,
                images: data.images
            };
            
            categories.push(category);
            console.log(`✅ تم تحميل فئة ${categoryId}: ${category.name}`);
            return category;
        }
        
        return null;
    } catch (error) {
        console.log(`❌ خطأ في تحميل فئة ${categoryId}:`, error.message);
        return null;
    }
}

// تحديث عداد الفئات
function updateCategoriesCounter(text) {
    const counter = document.getElementById('categoriesCounter');
    if (counter) {
        counter.textContent = text;
    }
}

// فئات تجريبية (إذا لم توجد ملفات JSON)
function loadDemoCategories() {
    console.log('📝 جاري تحميل فئات تجريبية...');
    
    categories = [];
    
    for (let i = 1; i <= 8; i++) {
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
    updateCategoriesCounter(`8 فئات تجريبية`);
    console.log('✅ تم تحميل 8 فئات تجريبية');
}

// عرض الفئات
function displayCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) {
        console.error('❌ شبكة الفئات غير موجودة');
        return;
    }
    
    grid.innerHTML = '';
    
    if (categories.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #86868b;">
                <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 20px;">
                    folder_off
                </span>
                <p>لا توجد فئات متاحة</p>
            </div>
        `;
        return;
    }
    
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
    
    const categoryTitle = document.getElementById('categoryTitle');
    if (categoryTitle) {
        categoryTitle.textContent = cat.name;
    }
    
    displayImages();
    showPage('images');
}

// عرض الصور
function displayImages() {
    const grid = document.getElementById('imageGrid');
    if (!grid) {
        console.error('❌ شبكة الصور غير موجودة');
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
}

// اختيار صورة
function selectImage(img) {
    console.log('🖼️ تم اختيار الصورة:', img.id);
    
    localStorage.setItem('selectedImage', JSON.stringify(img));
    showPage('editor');
    
    setTimeout(() => {
        if (typeof loadImageToEditor === 'function') {
            loadImageToEditor(img.url);
        }
        
        // إضافة زر حذف النص
        if (typeof addDeleteTextButton === 'function') {
            setTimeout(addDeleteTextButton, 500);
        }
    }, 100);
}

// ============== بطاقة النص ==============
// إعداد بطاقة النص الجديدة
function setupTextCard() {
    // حذف عنصر النص القديم إذا كان موجوداً
    const oldTextOverlay = document.getElementById('textOverlay');
    if (oldTextOverlay) {
        oldTextOverlay.remove();
    }
    
    // إنشاء عنصر بطاقة النص
    const canvasWrapper = document.getElementById('canvasWrapperFixed');
    if (!canvasWrapper) {
        console.error('canvasWrapperFixed not found');
        return;
    }
    
    // التحقق من عدم وجود البطاقة مسبقاً
    if (document.getElementById('textCard')) {
        return;
    }
    
    // إنشاء عنصر div لبطاقة النص
    const textCard = document.createElement('div');
    textCard.id = 'textCard';
    textCard.className = 'text-card';
    textCard.style.display = 'none';
    textCard.innerHTML = `
        <div class="text-card-header">
            <span>إضافة نص إلى الصورة</span>
            <button class="close-card-btn" onclick="closeTextCard()">×</button>
        </div>
        <div class="text-card-content">
            <textarea id="textCardInput" placeholder="اكتب النص هنا..." rows="4"></textarea>
            <div class="text-card-buttons">
                <button class="text-card-btn cancel-btn" onclick="closeTextCard()">إلغاء</button>
                <button class="text-card-btn delete-btn" onclick="clearTextFromCard()" id="deleteTextFromCardBtn" style="display: none;">
                    حذف
                </button>
                <button class="text-card-btn ok-btn" onclick="applyTextToImage()">موافق</button>
            </div>
        </div>
    `;
    
    canvasWrapper.appendChild(textCard);
}

// إضافة زر بطاقة النص إلى شريط الأدوات
function addTextCardButton() {
    const editorToolbar = document.querySelector('.editor-toolbar');
    if (!editorToolbar) {
        console.error('Editor toolbar not found');
        return;
    }
    
    // التحقق من عدم وجود الزر مسبقاً
    const existingBtn = document.querySelector('.tool-btn[data-tool="text"]');
    if (existingBtn) {
        return;
    }
    
    // إنشاء زر جديد للنص
    const textBtn = document.createElement('button');
    textBtn.className = 'tool-btn';
    textBtn.setAttribute('data-tool', 'text');
    textBtn.innerHTML = `
        <span class="material-symbols-outlined">text_fields</span>
        <span>نص</span>
    `;
    textBtn.onclick = () => toggleTextCard();
    
    // إدراج الزر في البداية
    editorToolbar.insertAdjacentElement('afterbegin', textBtn);
}

// فتح/إغلاق بطاقة النص
function toggleTextCard() {
    const textCard = document.getElementById('textCard');
    if (!textCard) {
        console.error('Text card not found');
        return;
    }
    
    if (textCard.style.display === 'none' || textCard.style.display === '') {
        openTextCard();
    } else {
        closeTextCard();
    }
}

function openTextCard() {
    const textCard = document.getElementById('textCard');
    const textInput = document.getElementById('textCardInput');
    
    if (textCard && textInput) {
        // تعبئة الحقل بالنص الحالي إذا كان موجوداً
        if (window.currentText) {
            textInput.value = window.currentText;
        }
        
        textCard.style.display = 'block';
        textCardVisible = true;
        
        // تحديث حالة زر الحذف
        updateDeleteButtonState();
        
        // التركيز على حقل النص
        setTimeout(() => {
            textInput.focus();
        }, 100);
    }
}

function closeTextCard() {
    const textCard = document.getElementById('textCard');
    const textInput = document.getElementById('textCardInput');
    
    if (textCard && textInput) {
        textCard.style.display = 'none';
        textCardVisible = false;
    }
}

// تحديث حالة زر الحذف
function updateDeleteButtonState() {
    const deleteBtn = document.getElementById('deleteTextFromCardBtn');
    const textInput = document.getElementById('textCardInput');
    
    if (deleteBtn && textInput) {
        if (textInput.value.trim() !== '' || window.currentText) {
            deleteBtn.style.display = 'inline-block';
        } else {
            deleteBtn.style.display = 'none';
        }
    }
}

// حذف النص من بطاقة النص
function clearTextFromCard() {
    const textInput = document.getElementById('textCardInput');
    if (!textInput) return;
    
    // مسح النص من الحقل
    textInput.value = '';
    
    // حذف النص من الصورة
    clearTextFromImage();
    
    // تحديث حالة زر الحذف
    updateDeleteButtonState();
    
    // التركيز على حقل النص
    textInput.focus();
}

// تطبيق النص على الصورة
function applyTextToImage() {
    const textInput = document.getElementById('textCardInput');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    
    // تخزين النص في متغير لتستخدمه دالة الرسم
    window.currentText = text;
    
    // تحديث الصورة بالنص الجديد
    if (typeof renderTextOnCanvas === 'function') {
        renderTextOnCanvas(false);
    }
    
    // تحديث حالة زر الحذف
    updateDeleteButtonState();
    
    // إغلاق بطاقة النص
    closeTextCard();
    
    // عرض رسالة نجاح
    if (text) {
        showAlert('تم إضافة النص إلى الصورة', 'success');
    } else {
        showAlert('تم حذف النص من الصورة', 'success');
    }
}

// حذف النص من الصورة
function clearTextFromImage() {
    window.currentText = '';
    
    // إعادة رسم الصورة بدون نص
    if (typeof renderTextOnCanvas === 'function') {
        renderTextOnCanvas(false);
    }
}

// إضافة زر حذف النص في لوحة التأثيرات
function addDeleteTextButton() {
    const effectsPanel = document.getElementById('effectsPanel');
    if (!effectsPanel) return;
    
    // التحقق من عدم وجود الزر مسبقاً
    if (document.getElementById('deleteTextBtn')) return;
    
    const deleteBtnHtml = `
        <button class="effect-option delete-text-btn" id="deleteTextBtn" onclick="clearTextFromImage()">
            <span class="material-symbols-outlined">delete</span>
            <span>حذف النص</span>
        </button>
    `;
    
    effectsPanel.innerHTML += deleteBtnHtml;
}

// ============== التنقل ==============
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
    if (page) {
        page.classList.add('active');
    }
    
    const navMap = {
        'categories': 'navCategories',
        'editor': 'navEditor',
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

// ============== لوحة المفاتيح ==============
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
    
    document.body.classList.add('keyboard-open');
}

// التعامل مع إغلاق لوحة المفاتيح
function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    
    document.body.classList.remove('keyboard-open');
}

// ============== تنزيل الصور ==============
async function downloadImage() {
    try {
        console.log('💾 بدء عملية التنزيل...');
        
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
        
        // انتظار تحميل الخطوط
        await waitForFonts();
        
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
            
            // إضافة الرابط والنقر عليه
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // تحرير الذاكرة
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            hideLoadingIndicator();
            showAlert('✅ تم تنزيل الصورة بنجاح!', 'success');
            
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('❌ خطأ في التنزيل:', error);
        hideLoadingIndicator();
        showAlert('حدث خطأ أثناء التنزيل', 'error');
    }
}

// انتظار تحميل الخطوط
async function waitForFonts() {
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
        console.log('✅ جميع الخطوط محملة');
    }
}

// ============== مشاركة الصور ==============
async function shareImage() {
    try {
        console.log('📤 بدء عملية المشاركة...');
        
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
        
        // انتظار تحميل الخطوط
        await waitForFonts();
        
        // انتظار الرسم
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // تحويل Canvas إلى Blob
        exportCanvas.toBlob(async (blob) => {
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
                showAlert('✅ تم المشاركة بنجاح!', 'success');
                
            } catch (shareError) {
                hideLoadingIndicator();
                
                if (shareError.name === 'AbortError') {
                    console.log('تم إلغاء المشاركة من قبل المستخدم');
                    return;
                }
                
                console.error('❌ خطأ في المشاركة:', shareError);
                showAlert('فشلت المشاركة', 'error');
                downloadImage();
            }
            
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('❌ خطأ في المشاركة:', error);
        hideLoadingIndicator();
        showAlert('حدث خطأ أثناء المشاركة', 'error');
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

// تهيئة النص
window.currentText = '';
