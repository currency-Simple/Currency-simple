// الترجمات
const translations = {
    // ... ترجماتك موجودة (لا تغير)
};

// تحميل الإعدادات المحفوظة
function loadSettings() {
    const theme = localStorage.getItem('theme') || 'light';
    const language = localStorage.getItem('language') || 'ar';
    
    applyTheme(theme);
    applyLanguage(language);
}

// تطبيق السمة
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        }
    });
}

// تغيير السمة
function changeTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

// تطبيق اللغة
function applyLanguage(lang) {
    const isRTL = lang === 'ar';
    document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    const textOverlay = document.getElementById('textOverlay');
    if (textOverlay) {
        const placeholders = {
            ar: 'اكتب هنا...',
            en: 'Type here...',
            fr: 'Écrivez ici...'
        };
        textOverlay.setAttribute('data-placeholder', placeholders[lang]);
        if (!textOverlay.textContent.trim() || textOverlay.textContent === 'اكتب هنا...') {
            textOverlay.textContent = placeholders[lang];
        }
    }
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang-btn') === lang) {
            btn.classList.add('active');
        }
    });
}

// تغيير اللغة
function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    applyLanguage(lang);
}

// إظهار/إخفاء لوحة الأدوات
function toggleToolPanel(panelId) {
    const panel = document.getElementById(panelId);
    const allPanels = document.querySelectorAll('.tool-panel');
    const allButtons = document.querySelectorAll('.tool-btn');
    
    allPanels.forEach(p => {
        if (p.id === panelId) {
            p.classList.toggle('active');
        } else {
            p.classList.remove('active');
        }
    });
    
    allButtons.forEach(btn => {
        const panelName = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (panelName === panelId) {
            btn.classList.toggle('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// هذه الدوال كانت تعارض دوال colors.js - إزالتها أو جعلها تأخذ القيم من colors.js
// لا نعيد تعريفها لأنها موجودة في colors.js

// تحميل الإعدادات عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});
