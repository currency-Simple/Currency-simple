// إعدادات التطبيق
let appSettings = {
    darkMode: 'off',
    language: 'en'
};

// ترجمة النصوص
const translations = {
    en: {
        convert: 'Convert',
        rates: 'Rates',
        settings: 'Settings',
        darkMode: 'Dark mode',
        generalSettings: 'General settings',
        rateApp: 'Rate the app',
        termsPrivacy: 'Terms and privacy',
        version: 'Version',
        off: 'Off',
        on: 'On',
        auto: 'Auto',
        english: 'English',
        french: 'French',
        arabic: 'Arabic',
        language: 'Language'
    },
    fr: {
        convert: 'Convertir',
        rates: 'Taux',
        settings: 'Paramètres',
        darkMode: 'Mode sombre',
        generalSettings: 'Paramètres généraux',
        rateApp: 'Évaluer l\'app',
        termsPrivacy: 'Termes et confidentialité',
        version: 'Version',
        off: 'Désactivé',
        on: 'Activé',
        auto: 'Auto',
        english: 'Anglais',
        french: 'Français',
        arabic: 'Arabe',
        language: 'Langue'
    },
    ar: {
        convert: 'تحويل',
        rates: 'الأسعار',
        settings: 'الإعدادات',
        darkMode: 'الوضع الداكن',
        generalSettings: 'الإعدادات العامة',
        rateApp: 'تقييم التطبيق',
        termsPrivacy: 'الشروط والخصوصية',
        version: 'الإصدار',
        off: 'إيقاف',
        on: 'تشغيل',
        auto: 'تلقائي',
        english: 'الإنجليزية',
        french: 'الفرنسية',
        arabic: 'العربية',
        language: 'اللغة'
    }
};

// تحميل الإعدادات
export function loadSettings() {
    try {
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            appSettings = JSON.parse(saved);
            console.log('الإعدادات المحملة:', appSettings);
        }
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
    }
    return appSettings;
}

// حفظ الإعدادات
export function saveSettings(settings) {
    try {
        appSettings = { ...appSettings, ...settings };
        localStorage.setItem('appSettings', JSON.stringify(appSettings));
        console.log('الإعدادات المحفوظة:', appSettings);
        
        applySettings();
        applyLanguage();
        showToast('تم حفظ الإعدادات');
    } catch (error) {
        console.error('خطأ في حفظ الإعدادات:', error);
        showToast('خطأ في حفظ الإعدادات', 'error');
    }
}

// تطبيق الإعدادات
export function applySettings() {
    applyDarkMode(appSettings.darkMode);
}

// تطبيق الوضع الداكن
function applyDarkMode(mode) {
    const html = document.documentElement;
    
    if (mode === 'on') {
        html.classList.add('dark-mode');
    } else if (mode === 'off') {
        html.classList.remove('dark-mode');
    } else if (mode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            html.classList.add('dark-mode');
        } else {
            html.classList.remove('dark-mode');
        }
    }
}

// تطبيق اللغة
function applyLanguage() {
    const lang = appSettings.language || 'en';
    const texts = translations[lang];
    
    if (!texts) return;
    
    // تحديث النصوص
    const elementsToUpdate = {
        // أزرار التنقل
        '#navRates span': texts.rates,
        '#navConvert span': texts.convert,
        '#navSettings span': texts.settings,
        
        // عناوين الإعدادات
        '.language-section .section-title': texts.language,
        '.settings-section:nth-of-type(2) .section-title': texts.darkMode,
        '.settings-section:nth-of-type(3) .section-title': texts.generalSettings,
        
        // معلومات الإصدار
        '.version-info span': `${texts.version} 2.0.0`
    };
    
    Object.entries(elementsToUpdate).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text;
        }
    });
    
    // تحديث أزرار الوضع الداكن
    document.querySelectorAll('.dark-mode-btn').forEach(btn => {
        const mode = btn.dataset.mode;
        if (mode === 'off') btn.textContent = texts.off;
        if (mode === 'on') btn.textContent = texts.on;
        if (mode === 'auto') btn.textContent = texts.auto;
    });
    
    // تحديث أزرار اللغة
    document.querySelectorAll('.language-btn').forEach(btn => {
        const langCode = btn.dataset.lang;
        if (langCode === 'en') btn.textContent = texts.english;
        if (langCode === 'fr') btn.textContent = texts.french;
        if (langCode === 'ar') btn.textContent = texts.arabic;
    });
}

// عرض رسالة
function showToast(message, type = 'success') {
    // إزالة أي رسالة سابقة
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // إنشاء رسالة جديدة
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${type === 'error' ? '#ff3b30' : '#007aff'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: toastSlide 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // إزالة الرسالة بعد 3 ثواني
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// تهيئة صفحة الإعدادات
export function initSettingsPage() {
    console.log('تهيئة صفحة الإعدادات...');
    
    // أزرار الوضع الداكن
    const darkModeButtons = document.querySelectorAll('.dark-mode-btn');
    darkModeButtons.forEach(btn => {
        // إزالة الأحداث السابقة
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // تعيين النشط
        newBtn.classList.remove('active');
        if (newBtn.dataset.mode === appSettings.darkMode) {
            newBtn.classList.add('active');
        }
        
        // إضافة الحدث
        newBtn.addEventListener('click', () => {
            saveSettings({ darkMode: newBtn.dataset.mode });
            
            // تحديث حالة الأزرار
            darkModeButtons.forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
        });
    });
    
    // أزرار اللغة
    const languageButtons = document.querySelectorAll('.language-btn');
    languageButtons.forEach(btn => {
        // إزالة الأحداث السابقة
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // تعيين النشط
        newBtn.classList.remove('active');
        if (newBtn.dataset.lang === appSettings.language) {
            newBtn.classList.add('active');
        }
        
        // إضافة الحدث
        newBtn.addEventListener('click', () => {
            saveSettings({ language: newBtn.dataset.lang });
            
            // تحديث حالة الأزرار
            languageButtons.forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
        });
    });
    
    // أزرار الإعدادات العامة
    const settingButtons = document.querySelectorAll('.setting-btn');
    settingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('هذه الميزة غير متوفرة في النسخة التجريبية');
        });
    });
}

// الحصول على إعداد
export function getSetting(key) {
    return appSettings[key];
}

// تهيئة الإعدادات
export function initSettings() {
    loadSettings();
    applySettings();
    applyLanguage();
}
