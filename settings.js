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
    
    // تحديث عناصر الواجهة
    const elements = {
        'navConvert': texts.convert,
        'navRates': texts.rates,
        'navSettings': texts.settings,
        '.section-title:nth-child(1)': texts.darkMode,
        '.section-title:nth-child(2)': texts.generalSettings,
        '.setting-item:nth-child(1) .setting-label': texts.rateApp,
        '.setting-item:nth-child(2) .setting-label': texts.termsPrivacy,
        '.version-info span': `${texts.version} 2.9.0`
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
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
    const lang = appSettings.language || 'en';
    const texts = translations[lang];
    
    // تحديث أزرار الوضع الداكن
    const darkModeButtons = document.querySelectorAll('.dark-mode-btn');
    
    darkModeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === appSettings.darkMode) {
            btn.classList.add('active');
        }
        
        btn.onclick = () => {
            saveSettings({ darkMode: btn.dataset.mode });
            darkModeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });
    
    // إضافة قسم اللغة إذا لم يكن موجوداً
    let languageSection = document.querySelector('.settings-section.language-section');
    if (!languageSection) {
        languageSection = document.createElement('div');
        languageSection.className = 'settings-section language-section';
        languageSection.innerHTML = `
            <h3 class="section-title">${texts.language}</h3>
            <div class="language-buttons">
                <button class="language-btn" data-lang="en">${texts.english}</button>
                <button class="language-btn" data-lang="fr">${texts.french}</button>
                <button class="language-btn" data-lang="ar">${texts.arabic}</button>
            </div>
        `;
        
        const generalSection = document.querySelector('.settings-section:nth-child(2)');
        if (generalSection) {
            generalSection.parentNode.insertBefore(languageSection, generalSection);
        }
    }
    
    // تحديث أزرار اللغة
    const languageButtons = document.querySelectorAll('.language-btn');
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === appSettings.language) {
            btn.classList.add('active');
        }
        
        btn.onclick = () => {
            saveSettings({ language: btn.dataset.lang });
            languageButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // إعادة تحميل النصوص
            applyLanguage();
        };
    });
    
    // تحديث أزرار الإعدادات العامة
    const settingButtons = document.querySelectorAll('.setting-btn');
    settingButtons.forEach((btn, index) => {
        btn.onclick = () => {
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
