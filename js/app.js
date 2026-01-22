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
    // إزالة زر النص القديم إذا كان موجوداً
    const oldTextBtn = document.querySelector('.tool-btn[onclick*="textPanel"]');
    if (oldTextBtn) {
        oldTextBtn.remove();
    }
    
    const editorToolbar = document.querySelector('.editor-toolbar');
    if (!editorToolbar) return;
    
    // إنشاء زر جديد
    const textBtn = document.createElement('button');
    textBtn.className = 'tool-btn';
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
        textCard.style.display = 'block';
        textCardVisible = true;
        
        // التركيز على حقل النص بعد تأخير بسيط
        setTimeout(() => {
            textInput.focus();
            handleKeyboardOpen(300); // محاكاة فتح لوحة المفاتيح
        }, 100);
    }
}

function closeTextCard() {
    const textCard = document.getElementById('textCard');
    const textInput = document.getElementById('textCardInput');
    
    if (textCard && textInput) {
        textCard.style.display = 'none';
        textInput.value = '';
        textCardVisible = false;
        
        handleKeyboardClose(); // محاكاة إغلاق لوحة المفاتيح
    }
}

// تطبيق النص على الصورة
function applyTextToImage() {
    const textInput = document.getElementById('textCardInput');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    if (!text) {
        showAlert('يرجى كتابة نص', 'error');
        return;
    }
    
    // تخزين النص في متغير لتستخدمه دالة الرسم
    window.currentText = text;
    
    // تحديث الصورة بالنص الجديد
    if (typeof renderTextOnCanvas === 'function') {
        renderTextOnCanvas(false);
        showAlert('تم إضافة النص إلى الصورة', 'success');
    }
    
    closeTextCard();
}

// حذف النص من الصورة
function clearTextFromImage() {
    window.currentText = '';
    
    // إعادة رسم الصورة بدون نص
    if (typeof renderTextOnCanvas === 'function') {
        renderTextOnCanvas(false);
        showAlert('تم حذف النص من الصورة', 'success');
    }
}

// إضافة زر حذف النص
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

// بقية الكود بدون تغيير...
// [يبقى باقي الكود كما هو مع إزالة دوال handleTextFocus و handleTextBlur و handleTextInput]
