// App settings
let appSettings = {
    darkMode: 'off',
    baseCurrency: 'USD',
    decimals: 4,
    notifications: true,
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

// Load settings
export function loadSettings() {
    try {
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            appSettings = { ...appSettings, ...JSON.parse(saved) };
            console.log('Settings loaded:', appSettings);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    applyLanguage();
    return appSettings;
}

// Save settings
export function saveSettings(settings) {
    try {
        appSettings = { ...appSettings, ...settings };
        localStorage.setItem('appSettings', JSON.stringify(appSettings));
        console.log('Settings saved:', appSettings);
        applySettings();
        applyLanguage();
        showToast('Settings saved');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings', 'error');
    }
}

// Apply settings
export function applySettings() {
    applyDarkMode(appSettings.darkMode);
}

// Apply dark mode
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

// Apply language
function applyLanguage() {
    const lang = appSettings.language || 'en';
    const texts = translations[lang];
    
    if (!texts) return;
    
    console.log('Applying language:', lang);
    
    // تحديث عناصر الواجهة
    // 1. أزرار التنقل
    const navConvert = document.querySelector('#navConvert span');
    const navRates = document.querySelector('#navRates span');
    const navSettings = document.querySelector('#navSettings span');
    
    if (navConvert) navConvert.textContent = texts.convert;
    if (navRates) navRates.textContent = texts.rates;
    if (navSettings) navSettings.textContent = texts.settings;
    
    // 2. عناوين الإعدادات
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title, index) => {
        if (index === 0) {
            // قسم اللغة
            title.textContent = texts.language;
        } else if (index === 1) {
            // الوضع الداكن
            title.textContent = texts.darkMode;
        } else if (index === 2) {
            // الإعدادات العامة
            title.textContent = texts.generalSettings;
        }
    });
    
    // 3. عناصر الإعدادات العامة
    const settingLabels = document.querySelectorAll('.setting-label');
    if (settingLabels[0]) settingLabels[0].textContent = texts.rateApp;
    if (settingLabels[1]) settingLabels[1].textContent = texts.termsPrivacy;
    
    // 4. معلومات الإصدار
    const versionInfo = document.querySelector('.version-info span');
    if (versionInfo) versionInfo.textContent = `${texts.version} 2.0.0`;
    
    // 5. أزرار الوضع الداكن
    document.querySelectorAll('.dark-mode-btn').forEach(btn => {
        const mode = btn.dataset.mode;
        if (mode === 'off') btn.textContent = texts.off;
        if (mode === 'on') btn.textContent = texts.on;
        if (mode === 'auto') btn.textContent = texts.auto;
    });
    
    // 6. أزرار اللغة
    document.querySelectorAll('.language-btn').forEach(btn => {
        const langCode = btn.dataset.lang;
        if (langCode === 'en') btn.textContent = texts.english;
        if (langCode === 'fr') btn.textContent = texts.french;
        if (langCode === 'ar') btn.textContent = texts.arabic;
    });
}

// Show toast message
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--accent-color);
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: toastSlide 0.3s ease-out;
        box-shadow: 0 8px 30px rgba(0, 122, 255, 0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Initialize settings page
export function initSettingsPage() {
    console.log('Initializing settings page...');
    
    // تحديث أزرار الوضع الداكن
    const darkModeButtons = document.querySelectorAll('.dark-mode-btn');
    
    darkModeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === appSettings.darkMode) {
            btn.classList.add('active');
        }
        
        // إزالة الأحداث السابقة وإضافة جديدة
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.onclick = () => {
            saveSettings({ darkMode: newBtn.dataset.mode });
            darkModeButtons.forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
        };
    });
    
    // تحديث أزرار اللغة
    const languageButtons = document.querySelectorAll('.language-btn');
    
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === appSettings.language) {
            btn.classList.add('active');
        }
        
        // إزالة الأحداث السابقة وإضافة جديدة
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.onclick = () => {
            saveSettings({ language: newBtn.dataset.lang });
            languageButtons.forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
        };
    });
    
    // تحديث أزرار الإعدادات العامة
    const settingButtons = document.querySelectorAll('.setting-btn');
    
    settingButtons.forEach((btn, index) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.onclick = () => {
            if (index === 0) {
                showToast('Thank you for rating!');
            } else if (index === 1) {
                showToast('Opening terms and privacy...');
                window.open('#', '_blank');
            }
        };
    });
}

// Get setting
export function getSetting(key) {
    return appSettings[key];
}

// Initialize settings on app start
export function initSettings() {
    console.log('Initializing settings...');
    loadSettings();
    applySettings();
    
    if (appSettings.darkMode === 'auto') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (appSettings.darkMode === 'auto') {
                applyDarkMode('auto');
            }
        });
    }
}
