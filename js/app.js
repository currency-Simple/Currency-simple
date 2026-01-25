// متغيرات عامة
let categories = [];
let currentCategory = null;
let currentImages = [];
let keyboardOpen = false;
let textCardVisible = false;
let currentImageUrl = null; // لحفظ رابط الصورة الحالية

// تحميل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App starting...');
    
    loadSettings();
    loadCategories();
    showPage('categories');
    setupKeyboardListeners();
    
    setTimeout(() => {
        setupTextCard();
        setupBackgroundControls();
    }, 500);
});

// إعادة تعيين المحرر
function resetEditor() {
    // طلب تأكيد من المستخدم
    if (confirm('هل تريد حذف جميع التعديلات والبدء من جديد؟')) {
        console.log('🔄 إعادة تعيين المحرر...');
        
        // إعادة تعيين النص
        window.currentText = '';
        const textInput = document.getElementById('textCardInput');
        if (textInput) {
            textInput.value = '';
        }
        
        // إعادة تحميل الصورة الأصلية
        if (currentImageUrl && typeof loadImageToEditor === 'function') {
            loadImageToEditor(currentImageUrl);
        }
        
        // إعادة تعيين جميع القيم الافتراضية
        resetAllSettings();
        
        // إغلاق جميع اللوحات
        closeAllToolPanels();
        closeTextCard();
        
        showAlert('✅ تم إعادة التعيين بنجاح!', 'success');
        console.log('✅ تم إعادة تعيين المحرر');
    }
}

// إعادة تعيين جميع الإعدادات إلى القيم الافتراضية
function resetAllSettings() {
    // إعادة تعيين الألوان
    if (typeof setTextColor === 'function') setTextColor('#FFFFFF');
    if (typeof setStrokeColor === 'function') setStrokeColor('#000000');
    if (typeof setCardColor === 'function') setCardColor('#000000');
    if (typeof setBorderColor === 'function') setBorderColor('#000000');
    if (typeof setBackgroundColor === 'function') setBackgroundColor('#FFFFFF');
    if (typeof setBackgroundSize === 'function') setBackgroundSize('original');
    
    // إعادة تعيين الخط
    if (typeof selectFont === 'function' && window.ALL_FONTS && window.ALL_FONTS.length > 0) {
        selectFont(window.ALL_FONTS[0].family);
    }
    
    // إعادة تعيين أشرطة التحكم
    const controls = [
        { id: 'fontSizeSlider', value: 50, displayId: 'fontSizeDisplay' },
        { id: 'strokeWidth', value: 3, displayId: 'strokeWidthDisplay' },
        { id: 'shadowSlider', value: 5, displayId: 'shadowDisplay' },
        { id: 'bgOpacitySlider', value: 70, displayId: 'bgOpacityDisplay' },
        { id: 'blurSlider', value: 0, displayId: 'blurDisplay' },
        { id: 'borderSlider', value: 0, displayId: 'borderDisplay' }
    ];
    
    controls.forEach(ctrl => {
        const slider = document.getElementById(ctrl.id);
        const display = document.getElementById(ctrl.displayId);
        if (slider) {
            slider.value = ctrl.value;
            if (display) display.textContent = ctrl.value;
        }
    });
    
    // إعادة تعيين checkboxes
    const shadowEnabled = document.getElementById('shadowEnabled');
    const cardEnabled = document.getElementById('cardEnabled');
    if (shadowEnabled) shadowEnabled.checked = true;
    if (cardEnabled) cardEnabled.checked = false;
    
    // إعادة تحديد العناصر الافتراضية في الشبكات
    resetColorGrids();
    resetFontGrid();
    resetBackgroundGrid();
}

// إعادة تعيين شبكات الألوان
function resetColorGrids() {
    // لون النص - أبيض
    const colorGrid = document.getElementById('colorGrid');
    if (colorGrid) {
        colorGrid.querySelectorAll('.color-item').forEach((item, index) => {
            item.classList.remove('selected');
            if (index === 0) item.classList.add('selected');
        });
    }
    
    // حواف النص - أسود
    const strokeGrid = document.getElementById('strokeColorGrid');
    if (strokeGrid) {
        strokeGrid.querySelectorAll('.color-item').forEach(item => {
            item.classList.remove('selected');
            if (item.style.backgroundColor === 'rgb(0, 0, 0)' || item.title === '#000000') {
                item.classList.add('selected');
            }
        });
    }
    
    // خلفية النص - أسود
    const cardGrid = document.getElementById('cardColorGrid');
    if (cardGrid) {
        cardGrid.querySelectorAll('.color-item').forEach(item => {
            item.classList.remove('selected');
            if (item.style.backgroundColor === 'rgb(0, 0, 0)' || item.title === '#000000') {
                item.classList.add('selected');
            }
        });
    }
    
    // حواف الصورة - أسود
    const borderGrid = document.getElementById('borderColorGrid');
    if (borderGrid) {
        borderGrid.querySelectorAll('.color-item').forEach(item => {
            item.classList.remove('selected');
            if (item.style.backgroundColor === 'rgb(0, 0, 0)' || item.title === '#000000') {
                item.classList.add('selected');
            }
        });
    }
    
    // خلفية الصورة - أبيض
    const backgroundGrid = document.getElementById('backgroundColorGrid');
    if (backgroundGrid) {
        backgroundGrid.querySelectorAll('.color-item').forEach(item => {
            item.classList.remove('selected');
            if (item.style.backgroundColor === 'rgb(255, 255, 255)' || item.title === '#FFFFFF') {
                item.classList.add('selected');
            }
        });
    }
}

// إعادة تعيين شبكة الخطوط
function resetFontGrid() {
    const fontGrid = document.getElementById('fontGrid');
    if (fontGrid) {
        fontGrid.querySelectorAll('.font-item').forEach((item, index) => {
            item.classList.remove('selected');
            if (index === 0) item.classList.add('selected');
        });
    }
}

// إعادة تعيين شبكة الخلفية
function resetBackgroundGrid() {
    const backgroundSizeGrid = document.getElementById('backgroundSizeGrid');
    if (backgroundSizeGrid) {
        backgroundSizeGrid.querySelectorAll('.background-size-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent.includes('أصلي')) {
                btn.classList.add('selected');
            }
        });
    }
}

function setupBackgroundControls() {
    console.log('🎨 Setting up background controls...');
    
    const backgroundColorGrid = document.getElementById('backgroundColorGrid');
    if (backgroundColorGrid) {
        backgroundColorGrid.addEventListener('click', () => {
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
        
        if (!navigator.share) {
            showAlert('ℹ️ المشاركة غير مدعومة في هذا المتصفح', 'info');
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
                if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
                    hideLoadingIndicator();
                    showAlert('ℹ️ لا يمكن مشاركة الملف في هذا الجهاز', 'info');
                    return downloadImage();
                }
                
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
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
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
    
    if (typeof Audio !== 'undefined') {
        try {
            const alertSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
            alertSound.volume = 0.3;
            alertSound.play();
        } catch (e) {
            // تجاهل أخطاء الصوت
        }
    }
    
    const timeout = setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 4000);
    
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
    
    setTimeout(() => {
        const closeBtn = alert.querySelector('button');
        if (closeBtn) {
            closeBtn.focus();
        }
    }, 100);
}

function showLoadingIndicator(message = '🔄 جاري المعالجة...') {
    const existingLoader = document.querySelector('.custom-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
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
    document.body.style.overflow = 'hidden';
}

function hideLoadingIndicator() {
    const loader = document.querySelector('.custom-loader');
    if (loader) {
        loader.remove();
    }
    
    document.body.style.overflow = '';
}

window.currentText = '';
window.textScale = 1;
window.textRotation = 0;

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
window.resetEditor = resetEditor;

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

window.addEventListener('error', (e) => {
    console.error('🌍 Global error:', e.error);
    showAlert('حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'error');
});

window.addEventListener('beforeunload', (e) => {
    if (window.currentText && window.currentText.trim() !== '') {
        e.preventDefault();
        e.returnValue = 'لديك تعديلات غير محفوظة. هل تريد المغادرة؟';
        return e.returnValue;
    }
});

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

if ('standalone' in navigator || window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 Running as PWA');
    document.documentElement.classList.add('pwa-mode');
}

window.addEventListener('online', () => {
    showAlert('✅ تم استعادة الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', () => {
    showAlert('⚠️ أنت غير متصل بالإنترنت', 'warning');
});

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
});(() => {
                if (typeof updateBackground === 'function') {
                    updateBackground();
                }
            }, 100);
        });
    }
    
    const backgroundSizeGrid = document.getElementById('backgroundSizeGrid');
    if (backgroundSizeGrid) {
        backgroundSizeGrid.addEventListener('click', () => {
            setTimeout(() => {
                if (typeof updateBackground === 'function') {
                    updateBackground();
                }
            }, 100);
        });
    }
}

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
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadImage();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            shareImage();
        }
        
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
        
        item.addEventListener('mouseenter', () => {
            titleEl.style.opacity = '1';
        });
        
        item.addEventListener('mouseleave', () => {
            titleEl.style.opacity = '0';
        });
        
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
    
    // حفظ رابط الصورة الحالية
    currentImageUrl = img.url;
    
    localStorage.setItem('selectedImage', JSON.stringify(img));
    
    showLoadingIndicator('جاري تحميل الصورة...');
    
    showPage('editor');
    
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
    
    if (pageName !== 'editor') {
        closeAllToolPanels();
        closeTextCard();
    }
    
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
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`;
        const filename = `صورة-معدلة-${timestamp}.png`;
        
        exportCanvas.toBlob((blob) => {
            if (!blob) {
                hideLoadingIndicator();
                showAlert('❌ فشل في إنشاء الصورة', 'error');
                return;
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout
