// متغيرات عامة
let categories = [];
let currentCategory = null;
let currentImages = [];
let keyboardOpen = false;
let textCardVisible = false;

// تحميل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('App starting...');
    loadCategories();
    showPage('categories');
    
    setupKeyboardListeners();
    
    // إعداد بطاقة النص
    setupTextCard();
});

// إعداد بطاقة النص الجديدة
function setupTextCard() {
    // حذف عنصر النص القديم
    const oldTextOverlay = document.getElementById('textOverlay');
    if (oldTextOverlay) {
        oldTextOverlay.remove();
    }
    
    // إنشاء عنصر بطاقة النص
    const canvasWrapper = document.getElementById('canvasWrapperFixed');
    if (!canvasWrapper) return;
    
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
    
    // إضافة زر فتح بطاقة النص في شريط الأدوات
    addTextCardButton();
}

// إضافة زر بطاقة النص إلى شريط الأدوات
function addTextCardButton() {
    const editorToolbar = document.querySelector('.editor-toolbar');
    if (!editorToolbar) return;
    
    // التحقق من عدم وجود الزر مسبقاً
    const existingBtn = document.querySelector('.tool-btn[data-tool="text"]');
    if (existingBtn) return;
    
    // إنشاء زر جديد للنص
    const textBtn = document.createElement('button');
    textBtn.className = 'tool-btn';
    textBtn.setAttribute('data-tool', 'text');
    textBtn.innerHTML = `
        <span class="material-symbols-outlined">text_fields</span>
        <span>نص</span>
    `;
    textBtn.onclick = () => toggleTextCard();
    
    // إدراج الزر بعد زر الخط مباشرة
    const fontBtn = document.querySelector('.tool-btn[onclick*="fontPanel"]');
    if (fontBtn) {
        fontBtn.insertAdjacentElement('afterend', textBtn);
    } else {
        editorToolbar.insertAdjacentElement('afterbegin', textBtn);
    }
}

// فتح/إغلاق بطاقة النص
function toggleTextCard() {
    const textCard = document.getElementById('textCard');
    if (!textCard) return;
    
    if (textCard.style.display === 'none') {
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
        
        // التركيز على حقل النص بعد تأخير بسيط
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

// إعداد مستمعات لوحة المفاتيح
function setupKeyboardListeners() {
    // إزالة جميع المستمعات القديمة للوحة المفاتيح
    // سنستخدم أسلوباً أبسط لمنع ارتفاع العناصر
    
    window.addEventListener('resize', () => {
        setTimeout(() => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const windowHeight = window.innerHeight;
            const screenHeight = window.screen.height;
            
            // إذا كان الارتفاع الحالي أقل من 70% من ارتفاع الشاشة،
            // فهذا يعني أن لوحة المفاتيح مفتوحة
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
    
    // فقط إضافة كلاس للجسم لمنع التمرير
    document.body.classList.add('keyboard-open');
}

// التعامل مع إغلاق لوحة المفاتيح
function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    console.log('Keyboard closed');
    
    // إزالة كلاس لوحة المفاتيح
    document.body.classList.remove('keyboard-open');
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
        // إضافة زر حذف النص
        if (typeof addDeleteTextButton === 'function') {
            addDeleteTextButton();
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

// ============== دالة التنزيل ==============
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
        
        // محاولة التنزيل بالطريقة العادية
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
            
            // طريقة بديلة: فتح الصورة في نافذة جديدة
            try {
                const dataURL = exportCanvas.toDataURL('image/png', 1.0);
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                        <head>
                            <title>حفظ الصورة</title>
                        </head>
                        <body style="margin:0; padding:20px; text-align:center; background:#f5f5f7;">
                            <div style="max-width:800px; margin:0 auto; background:white; padding:20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                                <h2>حفظ الصورة</h2>
                                <div style="background:#f8f9fa; padding:15px; border-radius:5px; margin:20px 0; text-align:right;">
                                    <h3 style="margin-top:0;">طريقة الحفظ:</h3>
                                    <ol style="text-align:right; padding-right:20px;">
                                        <li>اضغط مع الاستمرار على الصورة</li>
                                        <li>اختر "حفظ الصورة" أو "تنزيل الصورة"</li>
                                        <li>اختر الموقع المناسب لحفظ الصورة</li>
                                    </ol>
                                </div>
                                <img src="${dataURL}" alt="الصورة المحفوظة" style="max-width:100%; height:auto; border:1px solid #ddd; border-radius:5px; margin:20px 0;" />
                                <p>اسم الملف: ${filename}</p>
                                <button onclick="window.print()" style="background:#007aff; color:white; border:none; padding:10px 20px; border-radius:5px; font-size:16px; cursor:pointer; margin:10px;">طباعة</button>
                                <button onclick="window.close()" style="background:#f44336; color:white; border:none; padding:10px 20px; border-radius:5px; font-size:16px; cursor:pointer; margin:10px;">إغلاق</button>
                            </div>
                        </body>
                        </html>
                    `);
                    newWindow.document.close();
                    showAlert('افتح نافذة الحفظ لحفظ الصورة', 'info');
                }
            } catch (windowError) {
                console.error('خطأ في فتح النافذة:', windowError);
                showAlert('حدث خطأ. حاول استخدام متصفح مختلف.', 'error');
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
        
        // التحقق من وجود صورة
        const canvas = document.getElementById('canvas');
        if (!canvas || !canvas.width || !canvas.width > 0) {
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
                
                // إذا كان الخطأ بسبب إلغاء المستخدم
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

// إضافة متغير النص العام
window.currentText = '';
