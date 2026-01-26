// متغيرات عامة
let categories = [];
let currentCategory = null;
let currentImages = [];
let keyboardOpen = false;
let textCardVisible = false;
let editHistory = [];
let historyIndex = -1;

// تحميل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App starting...');
    
    // تهيئة الإعدادات
    loadSettings();
    
    // تحميل الفئات
    loadCategories();
    
    // عرض الصفحة الأولية
    showPage('categories');
    
    // إعداد مستمعات الكيبورد
    setupKeyboardListeners();
    
    // إعداد بطاقة النص بعد تحميل الصفحة
    setTimeout(() => {
        setupTextCard();
    }, 500);
});

// إعداد بطاقة النص الجديدة
function setupTextCard() {
    const canvasWrapper = document.getElementById('canvasWrapperFixed');
    if (!canvasWrapper) {
        console.error('❌ canvasWrapperFixed not found');
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
            <button class="close-card-btn" onclick="closeTextCard()" aria-label="إغلاق">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <div class="text-card-content">
            <textarea id="textCardInput" placeholder="اكتب النص هنا..." rows="4" 
                      aria-label="مربع نص لإضافة نص إلى الصورة"></textarea>
            <div class="text-card-buttons">
                <button class="text-card-btn cancel-btn" onclick="closeTextCard()" aria-label="إلغاء">
                    إلغاء
                </button>
                <button class="text-card-btn delete-btn" onclick="clearTextFromCard()" id="deleteTextFromCardBtn" 
                        style="display: none;" aria-label="حذف النص">
                    حذف
                </button>
                <button class="text-card-btn ok-btn" onclick="applyTextToImage()" aria-label="تطبيق النص">
                    موافق
                </button>
            </div>
        </div>
    `;
    
    canvasWrapper.appendChild(textCard);
    console.log('✅ Text card setup complete');
    
    const textInput = document.getElementById('textCardInput');
    if (textInput) {
        textInput.addEventListener('focus', () => {
            setTimeout(() => {
                textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        });
        
        textInput.addEventListener('input', updateDeleteButtonState);
        
        // إضافة اختصارات لوحة المفاتيح
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                applyTextToImage();
            } else if (e.key === 'Escape') {
                closeTextCard();
            }
        });
    }
}

function toggleTextCard() {
    const textCard = document.getElementById('textCard');
    if (!textCard) {
        console.error('❌ Text card not found');
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
            // إظهار لوحة المفاتيح على الأجهزة المحمولة
            if ('virtualKeyboard' in navigator && navigator.virtualKeyboard.show) {
                navigator.virtualKeyboard.show();
            }
        }, 100);
        
        console.log('📝 Text card opened');
    }
}

function closeTextCard() {
    const textCard = document.getElementById('textCard');
    const textInput = document.getElementById('textCardInput');
    
    if (textCard && textInput) {
        textCard.style.display = 'none';
        textCardVisible = false;
        
        // إخفاء لوحة المفاتيح
        if ('virtualKeyboard' in navigator && navigator.virtualKeyboard.hide) {
            navigator.virtualKeyboard.hide();
        }
        
        console.log('📝 Text card closed');
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
    
    console.log('🗑️ Text cleared from card');
}

function applyTextToImage() {
    const textInput = document.getElementById('textCardInput');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    
    // حفظ حالة قبل التعديل
    saveToHistory();
    
    window.currentText = text;
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
    
    updateDeleteButtonState();
    closeTextCard();
    
    if (text) {
        showAlert('✅ تم إضافة النص إلى الصورة', 'success');
    } else {
        showAlert('✅ تم حذف النص من الصورة', 'success');
    }
    
    console.log('📝 Text applied to image:', text);
}

function clearTextFromImage() {
    // حفظ حالة قبل التعديل
    saveToHistory();
    
    window.currentText = '';
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
    
    console.log('🗑️ Text cleared from image');
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
    
    // مستمعات اختصارات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S لحفظ
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadImage();
        }
        
        // Ctrl/Cmd + P للمشاركة
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            shareImage();
        }
        
        // Ctrl/Cmd + Z للإعادة
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undoEdit();
        }
        
        // Escape لإغلاق البطاقات
        if (e.key === 'Escape') {
            if (textCardVisible) {
                closeTextCard();
            }
            closeAllToolPanels();
        }
    });
}

function handleKeyboardOpen() {
    if (keyboardOpen) return;
    keyboardOpen = true;
    console.log('⌨️ Keyboard opened');
    
    document.body.classList.add('keyboard-open');
}

function handleKeyboardClose() {
    if (!keyboardOpen) return;
    keyboardOpen = false;
    console.log('⌨️ Keyboard closed');
    
    document.body.classList.remove('keyboard-open');
}

async function loadCategories() {
    categories = [];
    console.log('📂 Loading categories...');
    
    try {
        const promises = [];
        
        // تحميل الفئات من 1 إلى 100
        for (let i = 1; i <= 100; i++) {
            promises.push(
                fetch(`data/images${i}.json`)
                    .then(res => {
                        if (!res.ok) throw new Error('Not found');
                        return res.json();
                    })
                    .then(data => {
                        if (data && data.images && data.images.length > 0) {
                            categories.push({
                                id: i,
                                name: data.name || `فئة ${i}`,
                                coverImage: data.images[0].url,
                                images: data.images,
                                description: data.description || ''
                            });
                        }
                    })
                    .catch(() => {
                        console.log(`📂 Category ${i} not found, skipping...`);
                    })
            );
        }
        
        await Promise.allSettled(promises);
        
        if (categories.length === 0) {
            console.log('📂 No categories found, loading demo...');
            loadDemoCategories();
        } else {
            categories.sort((a, b) => a.id - b.id);
            displayCategories();
            console.log(`✅ تم تحميل ${categories.length} فئة`);
        }
        
    } catch (error) {
        console.error('❌ Error loading categories:', error);
        loadDemoCategories();
    }
}

function loadDemoCategories() {
    console.log('📂 Loading demo categories...');
    
    const demoData = [
        {
            name: "الطبيعة",
            description: "مناظر طبيعية خلابة من حول العالم",
            images: [
                { id: 1, url: "https://images.pexels.com/photos/7615523/pexels-photo-7615523.jpeg", title: "جبال" },
                { id: 2, url: "https://images.pexels.com/photos/35570918/pexels-photo-35570918.jpeg", title: "شلال" },
                { id: 3, url: "https://images.pexels.com/photos/206359/pexels-photo-206359.jpeg", title: "غابة" }
            ]
        },
        {
            name: "المدن",
            description: "أجمل المدن والمعالم الحضرية",
            images: [
                { id: 4, url: "https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg", title: "إيطاليا" },
                { id: 5, url: "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg", title: "بحيرة" },
                { id: 6, url: "https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg", title: "مناظر" }
            ]
        },
        {
            name: "الفنون",
            description: "لوحات فنية وتصميمات إبداعية",
            images: [
                { id: 7, url: "https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg", title: "طريق جبلي" },
                { id: 8, url: "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg", title: "شروق الشمس" },
                { id: 9, url: "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg", title: "غروب" }
            ]
        },
        {
            name: "الحيوانات",
            description: "صور حيوانات برية و أليفة",
            images: [
                { id: 10, url: "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg", title: "شاطئ" },
                { id: 11, url: "https://images.pexels.com/photos/462024/pexels-photo-462024.jpeg", title: "أشجار" },
                { id: 12, url: "https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg", title: "حقول" }
            ]
        }
    ];
    
    demoData.forEach((data, index) => {
        categories.push({
            id: index + 1,
            name: data.name,
            coverImage: data.images[0].url,
            images: data.images,
            description: data.description
        });
    });
    
    displayCategories();
    console.log(`✅ تم تحميل ${categories.length} فئة تجريبية`);
}

function displayCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) {
        console.error('❌ Categories grid not found');
        return;
    }
    
    grid.innerHTML = '';
    
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.onclick = () => openCategory(cat);
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `فتح فئة ${cat.name}`);
        
        item.innerHTML = `
            <img src="${cat.coverImage}" alt="${cat.name}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <div class="category-overlay">
                <div class="category-title">${cat.name}</div>
                ${cat.description ? `<div class="category-description" style="font-size: 12px; opacity: 0.9;">${cat.description}</div>` : ''}
            </div>
        `;
        
        // إضافة مستمعات لوحة المفاتيح
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCategory(cat);
            }
        });
        
        grid.appendChild(item);
    });
    
    console.log(`✅ تم عرض ${categories.length} فئة`);
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
    
    console.log(`✅ تم فتح الفئة: ${cat.name}`);
}

function displayImages() {
    const grid = document.getElementById('imageGrid');
    if (!grid) {
        console.error('❌ Image grid not found');
        return;
    }
    
    grid.innerHTML = '';
    
    currentImages.forEach(img => {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.onclick = () => selectImage(img);
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `اختيار صورة ${img.title || img.id}`);
        
        const imgEl = document.createElement('img');
        imgEl.src = img.url;
        imgEl.alt = img.title || 'صورة';
        imgEl.loading = 'lazy';
        imgEl.onerror = function() {
            this.src = 'https://via.placeholder.com/300x400?text=Error+Loading';
        };
        
        // إضافة عنصر للعنوان
        const titleEl = document.createElement('div');
        titleEl.className = 'image-title';
        titleEl.textContent = img.title || `صورة ${img.id}`;
        titleEl.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
            color: white;
            padding: 8px;
            font-size: 12px;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        item.appendChild(imgEl);
        item.appendChild(titleEl);
        
        // إظهار العنوان عند التمرير
        item.addEventListener('mouseenter', () => {
            titleEl.style.opacity = '1';
        });
        
        item.addEventListener('mouseleave', () => {
            titleEl.style.opacity = '0';
        });
        
        // مستمعات لوحة المفاتيح
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectImage(img);
            }
        });
        
        grid.appendChild(item);
    });
    
    console.log(`✅ تم عرض ${currentImages.length} صورة`);
}

function selectImage(img) {
    console.log(`✅ تم اختيار الصورة: ${img.id}`);
    
    // حفظ الصورة المختارة في localStorage
    localStorage.setItem('selectedImage', JSON.stringify(img));
    
    // عرض مؤشر التحميل
    showLoadingIndicator('جاري تحميل الصورة...');
    
    // الانتقال إلى صفحة المحرر
    showPage('editor');
    
    // تحميل الصورة إلى المحرر بعد تأخير قصير
    setTimeout(() => {
        if (typeof loadImageToEditor === 'function') {
            loadImageToEditor(img.url);
        } else {
            console.error('❌ loadImageToEditor function not found');
            showAlert('خطأ في تحميل المحرر', 'error');
        }
        hideLoadingIndicator();
    }, 300);
}

function showPage(pageName) {
    console.log(`➡️ Navigating to: ${pageName}`);
    
    // إغلاق لوحة المفاتيح أولاً
    handleKeyboardClose();
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-hidden', 'true');
    });
    
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
        page.setAttribute('aria-hidden', 'false');
        
        // التركيز على عنصر مناسب في الصفحة
        setTimeout(() => {
            if (pageName === 'categories' || pageName === 'images') {
                const firstItem = page.querySelector('.category-item, .image-item');
                if (firstItem) {
                    firstItem.focus();
                }
            } else if (pageName === 'editor') {
                const canvas = document.getElementById('canvas');
                if (canvas) {
                    canvas.focus();
                }
            }
        }, 100);
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
    
    // إغلاق جميع الأدوات عند الانتقال من المحرر
    if (pageName !== 'editor') {
        closeAllToolPanels();
        closeTextCard();
    }
    
    // تحديث عنوان الصفحة
    document.title = getPageTitle(pageName);
}

function getPageTitle(pageName) {
    const titles = {
        'categories': 'الفئات - محرر النصوص على الصور',
        'images': 'الصور - محرر النصوص على الصور',
        'editor': 'التحرير - محرر النصوص على الصور',
        'settings': 'الإعدادات - محرر النصوص على الصور'
    };
    return titles[pageName] || 'محرر النصوص على الصور';
}

function closeAllToolPanels() {
    const panels = document.querySelectorAll('.tool-panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
    });
    
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
    });
    
    console.log('✅ جميع أدوات التحكم مغلقة');
}

function goBackToImages() {
    if (currentCategory) {
        showPage('images');
    } else {
        showPage('categories');
    }
}

// حفظ الحالة الحالية في التاريخ
function saveToHistory() {
    if (!window.currentText && editHistory.length === 0) return;
    
    const state = {
        text: window.currentText || '',
        textX: window.textX || 0.5,
        textY: window.textY || 0.5,
        textScale: window.textScale || 1,
        textRotation: window.textRotation || 0,
        textColor: window.currentTextColor || '#FFFFFF',
        strokeColor: window.currentStrokeColor || '#000000',
        backgroundColor: window.currentCardColor || '#000000',
        shadowEnabled: document.getElementById('shadowEnabled')?.checked || false,
        backgroundEnabled: document.getElementById('backgroundEnabled')?.checked || false,
        shadowIntensity: window.shadowIntensity || 5,
        backgroundOpacity: window.bgOpacity || 70,
        timestamp: Date.now()
    };
    
    // إزالة أي حالات بعد المؤشر الحالي
    if (historyIndex < editHistory.length - 1) {
        editHistory = editHistory.slice(0, historyIndex + 1);
    }
    
    editHistory.push(state);
    historyIndex = editHistory.length - 1;
    
    // تحديث حالة زر الإعادة
    updateUndoButton();
    
    // حفظ فقط آخر 20 حالة
    if (editHistory.length > 20) {
        editHistory.shift();
        historyIndex = editHistory.length - 1;
    }
    
    console.log('💾 Saved to history, total states:', editHistory.length);
}

// استعادة الحالة السابقة
function undoEdit() {
    if (historyIndex <= 0) {
        showAlert('⚠️ لا توجد تعديلات سابقة للإعادة', 'info');
        return;
    }
    
    historyIndex--;
    const previousState = editHistory[historyIndex];
    
    if (previousState) {
        // استعادة جميع القيم
        window.currentText = previousState.text;
        window.textX = previousState.textX;
        window.textY = previousState.textY;
        window.textScale = previousState.textScale;
        window.textRotation = previousState.textRotation;
        window.currentTextColor = previousState.textColor;
        window.currentStrokeColor = previousState.strokeColor;
        window.currentCardColor = previousState.backgroundColor;
        window.shadowIntensity = previousState.shadowIntensity;
        window.bgOpacity = previousState.backgroundOpacity;
        
        // تحديث عناصر التحكم
        const shadowEnabled = document.getElementById('shadowEnabled');
        const backgroundEnabled = document.getElementById('backgroundEnabled');
        const shadowIntensitySlider = document.getElementById('shadowIntensitySlider');
        const backgroundOpacitySlider = document.getElementById('backgroundOpacitySlider');
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        
        if (shadowEnabled) shadowEnabled.checked = previousState.shadowEnabled;
        if (backgroundEnabled) backgroundEnabled.checked = previousState.backgroundEnabled;
        if (shadowIntensitySlider) {
            shadowIntensitySlider.value = previousState.shadowIntensity;
            document.getElementById('shadowIntensityDisplay').textContent = previousState.shadowIntensity;
        }
        if (backgroundOpacitySlider) {
            backgroundOpacitySlider.value = previousState.backgroundOpacity;
            document.getElementById('backgroundOpacityDisplay').textContent = previousState.backgroundOpacity;
        }
        if (fontSizeSlider) {
            fontSizeSlider.value = Math.round(previousState.textScale * 50);
            document.getElementById('fontSizeDisplay').textContent = fontSizeSlider.value;
        }
        
        // تحديث الألوان المحددة
        setTimeout(() => {
            updateColorSelections();
        }, 100);
        
        // إعادة رسم الكانفاس
        if (typeof renderFullCanvas === 'function') {
            renderFullCanvas();
        }
        
        // تحديث حالة زر الإعادة
        updateUndoButton();
        
        showAlert('↩️ تم استعادة التعديل السابق', 'success');
        console.log('↩️ Undo to state:', historyIndex);
    }
}

// تحديث حالة زر الإعادة
function updateUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = historyIndex <= 0;
    }
}

// تحديث تحديد الألوان
function updateColorSelections() {
    // تحديث لون النص
    const colorItems = document.querySelectorAll('#colorGrid .color-item');
    colorItems.forEach(item => {
        item.classList.remove('selected');
        if (item.style.backgroundColor === window.currentTextColor) {
            item.classList.add('selected');
        }
    });
    
    // تحديث لون الحواف
    const strokeItems = document.querySelectorAll('#strokeColorGrid .color-item');
    strokeItems.forEach(item => {
        item.classList.remove('selected');
        if (item.style.backgroundColor === window.currentStrokeColor) {
            item.classList.add('selected');
        }
    });
    
    // تحديث لون الخلفية
    const bgItems = document.querySelectorAll('#backgroundColorGrid .color-item');
    bgItems.forEach(item => {
        item.classList.remove('selected');
        if (item.style.backgroundColor === window.currentCardColor) {
            item.classList.add('selected');
        }
    });
}

async function downloadImage() {
    try {
        console.log('⬇️ بدء عملية التنزيل...');
        
        const canvas = document.getElementById('canvas');
        if (!canvas || canvas.width === 0) {
            showAlert('⚠️ يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        showLoadingIndicator('🎨 جاري إنشاء الصورة النهائية...');
        
        let exportCanvas;
        if (typeof prepareImageForExport === 'function') {
            exportCanvas = prepareImageForExport();
            if (!exportCanvas) {
                hideLoadingIndicator();
                showAlert('❌ فشل في تحضير الصورة', 'error');
                return;
            }
        } else {
            exportCanvas = canvas;
        }
        
        // تأخير قصير للسماح بعرض مؤشر التحميل
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // إنشاء اسم ملف مع التاريخ والوقت
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`;
        const filename = `صورة-معدلة-${timestamp}.png`;
        
        exportCanvas.toBlob((blob) => {
            if (!blob) {
                hideLoadingIndicator();
                showAlert('❌ فشل في إنشاء الصورة', 'error');
                return;
            }
            
            // إنشاء رابط التنزيل
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.style.display = 'none';
            
            // إضافة الرابط إلى الصفحة والنقر عليه
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // تحرير الذاكرة بعد ثانية
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            hideLoadingIndicator();
            showAlert('✅ تم تنزيل الصورة بنجاح!', 'success');
            
            console.log('✅ Download completed:', filename);
            
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('❌ خطأ في التنزيل:', error);
        hideLoadingIndicator();
        showAlert('❌ حدث خطأ أثناء التنزيل', 'error');
    }
}

async function shareImage() {
    try {
        console.log('📤 بدء عملية المشاركة...');
        
        const canvas = document.getElementById('canvas');
        if (!canvas || canvas.width === 0) {
            showAlert('⚠️ يرجى اختيار صورة أولاً', 'error');
            return;
        }
        
        // التحقق من دعم المشاركة
        if (!navigator.share) {
            showAlert('ℹ️ المشاركة غير مدعومة في هذا المتصفح', 'info');
            // استبدال بالتنزيل
            return downloadImage();
        }
        
        showLoadingIndicator('📤 جاري تحضير الصورة للمشاركة...');
        
        let exportCanvas;
        if (typeof prepareImageForExport === 'function') {
            exportCanvas = prepareImageForExport();
            if (!exportCanvas) {
                hideLoadingIndicator();
                showAlert('❌ فشل في تحضير الصورة', 'error');
                return;
            }
        } else {
            exportCanvas = canvas;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        exportCanvas.toBlob(async (blob) => {
            if (!blob) {
                hideLoadingIndicator();
                showAlert('❌ فشل في إنشاء الصورة', 'error');
                return;
            }
            
            const file = new File([blob], 'صورة-معدلة.png', { 
                type: 'image/png',
                lastModified: Date.now()
            });
            
            try {
                // التحقق من إمكانية المشاركة
                if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
                    hideLoadingIndicator();
                    showAlert('ℹ️ لا يمكن مشاركة الملف في هذا الجهاز', 'info');
                    return downloadImage();
                }
                
                // المشاركة
                await navigator.share({
                    files: [file],
                    title: 'صورة معدلة',
                    text: 'شاهد هذه الصورة المعدلة!',
                    url: window.location.href
                });
                
                hideLoadingIndicator();
                showAlert('✅ تم المشاركة بنجاح!', 'success');
                console.log('✅ Share completed');
                
            } catch (shareError) {
                hideLoadingIndicator();
                
                if (shareError.name === 'AbortError') {
                    console.log('⚠️ تم إلغاء المشاركة من قبل المستخدم');
                    return;
                }
                
                console.error('❌ خطأ في المشاركة:', shareError);
                showAlert('❌ فشلت المشاركة', 'error');
                // استبدال بالتنزيل
                downloadImage();
            }
            
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('❌ خطأ في المشاركة:', error);
        hideLoadingIndicator();
        showAlert('❌ حدث خطأ أثناء المشاركة', 'error');
    }
}

function showAlert(message, type = 'info') {
    // إزالة أي تنبيهات سابقة
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // إنشاء التنبيه الجديد
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.setAttribute('role', 'alert');
    alert.setAttribute('aria-live', 'assertive');
    
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" aria-label="إغلاق التنبيه">
            <span class="material-symbols-outlined">close</span>
        </button>
    `;
    
    document.body.appendChild(alert);
    
    // إضافة صوت التنبيه (اختياري)
    if (typeof Audio !== 'undefined') {
        try {
            const alertSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
            alertSound.volume = 0.3;
            alertSound.play();
        } catch (e) {
            // تجاهل أخطاء الصوت
        }
    }
    
    // إخفاء التنبيه تلقائياً بعد 4 ثواني
    const timeout = setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 4000);
    
    // إلغاء الإخفاء التلقائي عند التركيز على التنبيه
    alert.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
    });
    
    alert.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 4000);
    });
    
    // التركيز على زر الإغلاق
    setTimeout(() => {
        const closeBtn = alert.querySelector('button');
        if (closeBtn) {
            closeBtn.focus();
        }
    }, 100);
}

function showLoadingIndicator(message = '🔄 جاري المعالجة...') {
    // إزالة أي مؤشرات تحميل سابقة
    const existingLoader = document.querySelector('.custom-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    // إنشاء مؤشر التحميل
    const loader = document.createElement('div');
    loader.className = 'custom-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-label', 'جاري التحميل');
    
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner" aria-hidden="true"></div>
            <div class="loader-text">${message}</div>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    // منع التمرير أثناء التحميل
    document.body.style.overflow = 'hidden';
}

function hideLoadingIndicator() {
    const loader = document.querySelector('.custom-loader');
    if (loader) {
        loader.remove();
    }
    
    // إعادة تفعيل التمرير
    document.body.style.overflow = '';
}

// تهيئة النص والمتغيرات العالمية
window.currentText = '';
window.textScale = 1;
window.textRotation = 0;
window.textX = 0.5;
window.textY = 0.5;
window.shadowIntensity = 5;
window.bgOpacity = 70;

// تصدير الوظائف العامة
window.showPage = showPage;
window.goBackToImages = goBackToImages;
window.downloadImage = downloadImage;
window.shareImage = shareImage;
window.showAlert = showAlert;
window.toggleTextCard = toggleTextCard;
window.closeTextCard = closeTextCard;
window.openTextCard = openTextCard;
window.clearTextFromImage = clearTextFromImage;
window.clearTextFromCard = clearTextFromCard;
window.applyTextToImage = applyTextToImage;
window.undoEdit = undoEdit;
window.saveToHistory = saveToHistory;

// تهيئة الإعدادات
function loadSettings() {
    const theme = localStorage.getItem('theme') || 'light';
    const language = localStorage.getItem('language') || 'ar';
    
    if (typeof changeTheme === 'function') {
        changeTheme(theme);
    }
    
    if (typeof changeLanguage === 'function') {
        changeLanguage(language);
    }
    
    console.log('⚙️ Settings loaded:', { theme, language });
}

// تسجيل الأخطاء العالمية
window.addEventListener('error', (e) => {
    console.error('🌍 Global error:', e.error);
    showAlert('حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'error');
});

// منع إغلاق الصفحة أثناء التعديل
window.addEventListener('beforeunload', (e) => {
    if (window.currentText && window.currentText.trim() !== '') {
        e.preventDefault();
        e.returnValue = 'لديك تعديلات غير محفوظة. هل تريد المغادرة؟';
        return e.returnValue;
    }
});

// خدمة Worker لتخزين البيانات (اختياري)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🔧 Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('🔧 Service Worker registration failed:', error);
            });
    });
}

// تهيئة PWA
if ('standalone' in navigator || window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 Running as PWA');
    document.documentElement.classList.add('pwa-mode');
}

// دعم وضع عدم الاتصال
window.addEventListener('online', () => {
    showAlert('✅ تم استعادة الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', () => {
    showAlert('⚠️ أنت غير متصل بالإنترنت', 'warning');
});

// تهيئة تحميل متأخر للصور
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
});
[file content end]
