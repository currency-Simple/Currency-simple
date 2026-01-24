[file name]: app.js
[file content begin]
// متغيرات عامة
let categories = [];
let currentCategory = null;
let currentImages = [];
let keyboardOpen = false;
let textCardVisible = false;
let textControlCardVisible = false;

// تحميل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    console.log('App starting...');
    
    loadCategories();
    showPage('categories');
    
    setupKeyboardListeners();
    
    // إعداد بطاقة النص بعد تحميل الصفحة
    setTimeout(() => {
        setupTextCard();
        setupFontSizeControl();
    }, 500);
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

function setupFontSizeControl() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = value;
            }
            
            // تحديث حجم النص
            if (window.textScale !== undefined) {
                window.textScale = value / 50;
                if (window.currentText && window.currentText.trim() !== '') {
                    setTimeout(() => {
                        if (typeof renderFullCanvas === 'function') {
                            renderFullCanvas();
                            updateTextControlFrame();
                        }
                    }, 50);
                }
            }
        });
    }
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
    deleteText();
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
        if (text) {
            updateTextControlFrame();
            showTextControlFrame();
        } else {
            hideTextControlFrame();
        }
    }
    
    updateDeleteButtonState();
    closeTextCard();
    
    if (text) {
        showAlert('تم إضافة النص إلى الصورة', 'success');
        showTextTransformControls();
    } else {
        showAlert('تم حذف النص من الصورة', 'success');
    }
    
    console.log('Text applied to image:', text);
}

function deleteText() {
    window.currentText = '';
    
    if (typeof renderFullCanvas === 'function') {
        renderFullCanvas();
    }
    
    hideTextControlFrame();
    hideDeleteTextButton();
    
    console.log('Text deleted from image');
}

// وظائف التحكم بالنص المتقدم
function showTextTransformControls() {
    if (window.currentText && window.currentText.trim() !== '') {
        updateTextControlFrame();
        showTextControlFrame();
        showDeleteTextButton();
        showAlert('يمكنك الآن تحريك وتدوير وتكبير النص باستخدام الإطار الزرق', 'info');
    }
}

function showTextControlFrame() {
    const frame = document.getElementById('textControlFrame');
    if (frame) {
        frame.style.display = 'block';
        setupTextFrameControls();
    }
}

function hideTextControlFrame() {
    const frame = document.getElementById('textControlFrame');
    if (frame) {
        frame.style.display = 'none';
    }
}

function updateTextControlFrame() {
    if (!window.currentText || !window.currentText.trim()) {
        hideTextControlFrame();
        return;
    }
    
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    const frame = document.getElementById('textControlFrame');
    if (!frame) return;
    
    const rect = canvas.getBoundingClientRect();
    const textX = window.textX || 0.5;
    const textY = window.textY || 0.5;
    
    // حساب أبعاد النص
    const ctx = canvas.getContext('2d');
    const fontSize = Math.min(canvas.width, canvas.height) * 0.08 * (window.textScale || 1);
    const fontFamily = window.currentFontFamily || "'Agu Display', display";
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    
    const lines = window.currentText.split('\n');
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const totalHeight = lines.length * fontSize * 1.4;
    
    // حساب موضع الإطار
    const frameWidth = maxWidth + 40;
    const frameHeight = totalHeight + 40;
    const frameX = (textX * canvas.width) - (frameWidth / 2) + rect.left;
    const frameY = (textY * canvas.height) - (frameHeight / 2) + rect.top;
    
    // تحديث الإطار
    frame.style.width = `${frameWidth}px`;
    frame.style.height = `${frameHeight}px`;
    frame.style.left = `${frameX}px`;
    frame.style.top = `${frameY}px`;
    frame.style.transform = `rotate(${window.textRotation || 0}deg)`;
}

function setupTextFrameControls() {
    const frame = document.getElementById('textControlFrame');
    if (!frame) return;
    
    // إزالة الأحداث القديمة
    frame.replaceWith(frame.cloneNode(true));
    const newFrame = document.getElementById('textControlFrame');
    
    let isDragging = false;
    let isResizing = false;
    let isRotating = false;
    let startX, startY;
    let startWidth, startHeight;
    let startRotation;
    
    newFrame.addEventListener('mousedown', startDrag);
    newFrame.addEventListener('touchstart', startDragTouch);
    
    function startDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.target.classList.contains('delete-handle')) {
            deleteText();
            return;
        }
        
        if (e.target.classList.contains('rotate-handle')) {
            startRotation = window.textRotation || 0;
            startX = e.clientX;
            startY = e.clientY;
            isRotating = true;
        } else if (e.target === newFrame) {
            startX = e.clientX;
            startY = e.clientY;
            isDragging = true;
        }
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    function startDragTouch(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            
            if (e.target.classList.contains('delete-handle')) {
                deleteText();
                return;
            }
            
            if (e.target.classList.contains('rotate-handle')) {
                startRotation = window.textRotation || 0;
                startX = touch.clientX;
                startY = touch.clientY;
                isRotating = true;
            } else if (e.target === newFrame) {
                startX = touch.clientX;
                startY = touch.clientY;
                isDragging = true;
            }
        } else if (e.touches.length === 2) {
            isResizing = true;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            startX = (touch1.clientX + touch2.clientX) / 2;
            startY = (touch1.clientY + touch2.clientY) / 2;
            startWidth = parseFloat(newFrame.style.width);
            startHeight = parseFloat(newFrame.style.height);
        }
        
        document.addEventListener('touchmove', onDragTouch);
        document.addEventListener('touchend', stopDrag);
    }
    
    function onDrag(e) {
        if (!isDragging && !isResizing && !isRotating) return;
        
        e.preventDefault();
        
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const canvas = document.getElementById('canvas');
            const rect = canvas.getBoundingClientRect();
            
            window.textX = ((parseFloat(newFrame.style.left) - rect.left + dx) + (parseFloat(newFrame.style.width) / 2)) / canvas.width;
            window.textY = ((parseFloat(newFrame.style.top) - rect.top + dy) + (parseFloat(newFrame.style.height) / 2)) / canvas.height;
            
            newFrame.style.left = `${parseFloat(newFrame.style.left) + dx}px`;
            newFrame.style.top = `${parseFloat(newFrame.style.top) + dy}px`;
            
            startX = e.clientX;
            startY = e.clientY;
            
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
            }
        } else if (isRotating) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            window.textRotation = (startRotation + angle) % 360;
            
            newFrame.style.transform = `rotate(${window.textRotation}deg)`;
            
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
            }
        }
    }
    
    function onDragTouch(e) {
        if (!isDragging && !isResizing && !isRotating) return;
        
        e.preventDefault();
        
        if (isDragging && e.touches.length === 1) {
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            
            const canvas = document.getElementById('canvas');
            const rect = canvas.getBoundingClientRect();
            
            window.textX = ((parseFloat(newFrame.style.left) - rect.left + dx) + (parseFloat(newFrame.style.width) / 2)) / canvas.width;
            window.textY = ((parseFloat(newFrame.style.top) - rect.top + dy) + (parseFloat(newFrame.style.height) / 2)) / canvas.height;
            
            newFrame.style.left = `${parseFloat(newFrame.style.left) + dx}px`;
            newFrame.style.top = `${parseFloat(newFrame.style.top) + dy}px`;
            
            startX = touch.clientX;
            startY = touch.clientY;
            
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
            }
        } else if (isResizing && e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentX = (touch1.clientX + touch2.clientX) / 2;
            const currentY = (touch1.clientY + touch2.clientY) / 2;
            
            const dx = currentX - startX;
            const dy = currentY - startY;
            const scale = 1 + (dx + dy) / 500;
            
            const newWidth = startWidth * scale;
            const newHeight = startHeight * scale;
            
            newFrame.style.width = `${newWidth}px`;
            newFrame.style.height = `${newHeight}px`;
            
            // تحديث حجم النص
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            if (fontSizeSlider) {
                const currentScale = window.textScale || 1;
                const newScale = currentScale * scale;
                const newValue = Math.max(10, Math.min(100, Math.round(newScale * 50)));
                fontSizeSlider.value = newValue;
                window.textScale = newScale;
                
                const display = document.getElementById('fontSizeDisplay');
                if (display) {
                    display.textContent = newValue;
                }
            }
            
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
            }
        } else if (isRotating && e.touches.length === 1) {
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            window.textRotation = (startRotation + angle) % 360;
            
            newFrame.style.transform = `rotate(${window.textRotation}deg)`;
            
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
            }
        }
    }
    
    function stopDrag() {
        isDragging = false;
        isResizing = false;
        isRotating = false;
        
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDragTouch);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
        
        updateTextControlFrame();
    }
}

function showDeleteTextButton() {
    const deleteBtn = document.getElementById('deleteTextBtn');
    if (deleteBtn) {
        deleteBtn.style.display = 'flex';
    }
}

function hideDeleteTextButton() {
    const deleteBtn = document.getElementById('deleteTextBtn');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
}

function rotateTextClockwise() {
    if (window.textRotation !== undefined) {
        window.textRotation = (window.textRotation + 15) % 360;
        if (window.currentText && window.currentText.trim() !== '') {
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
                updateTextControlFrame();
            }
        }
        showAlert('تم تدوير النص 15° يميناً', 'success');
    }
}

function rotateTextCounterClockwise() {
    if (window.textRotation !== undefined) {
        window.textRotation = (window.textRotation - 15 + 360) % 360;
        if (window.currentText && window.currentText.trim() !== '') {
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
                updateTextControlFrame();
            }
        }
        showAlert('تم تدوير النص 15° يساراً', 'success');
    }
}

function increaseTextSize() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        let value = parseInt(fontSizeSlider.value);
        if (value < 100) {
            value += 5;
            fontSizeSlider.value = value;
            
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = value;
            }
            
            // تحديث حجم النص
            if (window.textScale !== undefined) {
                window.textScale = value / 50;
                if (window.currentText && window.currentText.trim() !== '') {
                    setTimeout(() => {
                        if (typeof renderFullCanvas === 'function') {
                            renderFullCanvas();
                            updateTextControlFrame();
                        }
                    }, 50);
                }
            }
            
            showAlert('تم تكبير النص', 'success');
        }
    }
}

function decreaseTextSize() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        let value = parseInt(fontSizeSlider.value);
        if (value > 10) {
            value -= 5;
            fontSizeSlider.value = value;
            
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = value;
            }
            
            // تحديث حجم النص
            if (window.textScale !== undefined) {
                window.textScale = value / 50;
                if (window.currentText && window.currentText.trim() !== '') {
                    setTimeout(() => {
                        if (typeof renderFullCanvas === 'function') {
                            renderFullCanvas();
                            updateTextControlFrame();
                        }
                    }, 50);
                }
            }
            
            showAlert('تم تصغير النص', 'success');
        }
    }
}

function resetText() {
    if (window.textRotation !== undefined) {
        window.textRotation = 0;
        window.textScale = 1;
        window.textX = 0.5;
        window.textY = 0.5;
        
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = 50;
            const display = document.getElementById('fontSizeDisplay');
            if (display) {
                display.textContent = '50';
            }
        }
        
        if (window.currentText && window.currentText.trim() !== '') {
            if (typeof renderFullCanvas === 'function') {
                renderFullCanvas();
                updateTextControlFrame();
            }
        }
        
        showAlert('تم إعادة تعيين النص', 'success');
    }
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
                                images: data.images
                            });
                        }
                    })
                    .catch(() => {
                        console.log(`Category ${i} not found, skipping...`);
                    })
            );
        }
        
        await Promise.allSettled(promises);
        
        if (categories.length === 0) {
            console.log('No categories found, loading demo...');
            loadDemoCategories();
        } else {
            categories.sort((a, b) => a.id - b.id);
            displayCategories();
            console.log(`✓ تم تحميل ${categories.length} فئة`);
        }
        
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
                url: `https://images.pexels.com/photos/${1000000 + id}/pexels-photo-${1000000 + id}.jpeg?auto=compress&cs=tinysrgb&w=400`,
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
            <img src="${cat.coverImage}" alt="${cat.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <div class="category-overlay">
                <div class="category-title">${cat.name}</div>
            </div>
        `;
        grid.appendChild(item);
    });
    
    console.log('✓ تم عرض', categories.length, 'فئة');
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
    
    console.log('✓ تم فتح الفئة:', cat.name);
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
        imgEl.onerror = function() {
            this.src = 'https://via.placeholder.com/300x400?text=Error';
        };
        
        item.appendChild(imgEl);
        grid.appendChild(item);
    });
    
    console.log('✓ تم عرض', currentImages.length, 'صورة');
}

function selectImage(img) {
    console.log('✓ تم اختيار الصورة:', img.id);
    
    localStorage.setItem('selectedImage', JSON.stringify(img));
    showPage('editor');
    
    setTimeout(() => {
        if (typeof loadImageToEditor === 'function') {
            loadImageToEditor(img.url);
        } else {
            console.error('loadImageToEditor function not found');
        }
    }, 200);
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
        hideTextControlFrame();
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
            exportCanvas = canvas;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = `edited-image-${timestamp}.png`;
        
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
            showAlert('✓ تم تنزيل الصورة بنجاح!', 'success');
            
            console.log('✓ Download completed');
            
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
            exportCanvas = canvas;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        exportCanvas.toBlob(async (blob) => {
            if (!blob) {
                hideLoadingIndicator();
                showAlert('فشل في إنشاء الصورة', 'error');
                return;
            }
            
            const file = new File([blob], 'edited-image.png', { 
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
                    title: 'صورة معدلة',
                    text: 'شاهد هذه الصورة!'
                });
                
                hideLoadingIndicator();
                showAlert('✓ تم المشاركة بنجاح!', 'success');
                console.log('✓ Share completed');
                
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
    }, 4000);
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

// تهيئة النص
window.currentText = '';
window.textScale = 1;
window.textRotation = 0;
window.textX = 0.5;
window.textY = 0.5;
window.showPage = showPage;
window.goBackToImages = goBackToImages;
window.downloadImage = downloadImage;
window.shareImage = shareImage;
window.showAlert = showAlert;
window.toggleTextCard = toggleTextCard;
window.closeTextCard = closeTextCard;
window.openTextCard = openTextCard;
window.rotateTextClockwise = rotateTextClockwise;
window.rotateTextCounterClockwise = rotateTextCounterClockwise;
window.increaseTextSize = increaseTextSize;
window.decreaseTextSize = decreaseTextSize;
window.resetText = resetText;
window.deleteText = deleteText;
window.showTextTransformControls = showTextTransformControls;
[file content end]
