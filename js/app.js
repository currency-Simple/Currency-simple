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
    
    // إعداد بطاقة النص بعد تحميل الصفحة
    setTimeout(() => {
        setupTextCard();
        addTextCardButton();
    }, 1000);
});

// إعداد بطاقة النص الجديدة
function setupTextCard() {
    const canvasWrapper = document.getElementById('canvasWrapperFixed');
    if (!canvasWrapper) {
        console.error('canvasWrapperFixed not found');
        return;
    }
    
    if (document.getElementById('textCard')) {
        return;
    }
    
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
    console.log('Text card setup complete');
    
    const textInput = document.getElementById('textCardInput');
    if (textInput) {
        textInput.addEventListener('focus', () => {
            setTimeout(() => {
                textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        });
        
        textInput.addEventListener('input', updateDeleteButtonState);
    }
}

function addTextCardButton() {
    const editorToolbar = document.querySelector('.editor-toolbar');
    if (!editorToolbar) {
        console.error('Editor toolbar not found');
        return;
    }
    
    const existingBtn = editorToolbar.querySelector('.tool-btn[data-tool="text"]');
    if (existingBtn) {
        return;
    }
    
    const textBtn = document.createElement('button');
    textBtn.className = 'tool-btn';
    textBtn.setAttribute('data-tool', 'text');
    textBtn.innerHTML = `
        <span class="material-symbols-outlined">text_fields</span>
        <span>نص</span>
    `;
    textBtn.onclick = () => toggleTextCard();
    
    editorToolbar.insertBefore(textBtn, editorToolbar.firstChild);
    
    console.log('Text button added to toolbar');
}

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
        if (window.currentText) {
            textInput.value = window.currentText;
        }
        
        textCard.style.display = 'block';
        textCardVisible = true;
        
        updateDeleteButtonState();
        
        setTimeout(() => {
            textInput.focus();
            textInput.select();
        }, 100);
        
        console.log('Text card opened');
    }
}

function closeTextCard() {
    const textCard = document.getElementById('textCard');
    const textInput = document.getElementById('textCardInput');
    
    if (textCard && textInput) {
        textCard.style.display = 'none';
        textCardVisible = false;
        console.log('Text card closed');
    }
}

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

function clearTextFromCard() {
    const textInput = document.getElementById('textCardInput');
    if (!textInput) return;
    
    textInput.value = '';
    clearTextFromImage();
    updateDeleteButtonState();
    textInput.focus();
    
    console.log('Text cleared from card');
}

function applyTextToImage() {
    const textInput = document.getElementById('textCardInput');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    window.currentText = text;
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
    
    updateDeleteButtonState();
    closeTextCard();
    
    if (text) {
        showAlert('تم إضافة النص إلى الصورة', 'success');
    } else {
        showAlert('تم حذف النص من الصورة', 'success');
    }
    
    console.log('Text applied to image:', text);
}

function clearTextFromImage() {
    window.currentText = '';
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
    
    console.log('Text cleared from image');
}

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

function handleKeyboardOpen() {
    if (keyboardOpen) return;
    keyboardOpen = true;
    console.log('Keyboard opened');
    
    document.body.classList.add('keyboard-open');
}

function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    console.log('Keyboard closed');
    
    document.body.classList.remove('keyboard-open');
}

async function loadCategories() {
    categories = [];
    console.log('Loading categories...');
    
    try {
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
    } catch (error) {
        console.error('Error loading categories:', error);
        loadDemoCategories();
    }
}

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
        closeAllToolPanels();
        handleKeyboardClose();
    }
    
    // عرض خلفية فارغة عند فتح المحرر
    if (pageName === 'editor' && typeof initializeEmptyCanvas === 'function') {
        initializeEmptyCanvas();
    }
}

function closeAllToolPanels() {
    const panels = document.querySelectorAll('.tool-panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
}

function goBackToImages() {
    if (currentCategory) {
        showPage('images');
    } else {
        showPage('categories');
    }
}

async function downloadImage() {
    try {
        console.log('بدء عملية التنزيل...');
        
        const canvas = document.getElementById('canvas');
        if (!canvas || canvas.width === 0) {
            showAlert('يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        showLoadingIndicator('جاري إنشاء الصورة النهائية...');
        
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
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `صورة-مع-نص-${timestamp}.png`;
        
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

async function shareImage() {
    try {
        console.log('بدء عملية المشاركة...');
        
        const canvas = document.getElementById('canvas');
        if (!canvas || canvas.width === 0) {
            showAlert('يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        if (!navigator.share) {
            showAlert('المشاركة غير مدعومة في هذا المتصفح', 'info');
            return downloadImage();
        }
        
        showLoadingIndicator('جاري تحضير الصورة للمشاركة...');
        
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

window.currentText = '';
