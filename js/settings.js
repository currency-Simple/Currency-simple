// الترجمات
const translations = {
    ar: {
        edit: "تحرير",
        font: "الخط",
        size: "الحجم",
        color: "اللون",
        stroke: "الحواف",
        effects: "تأثيرات",
        shadow: "ظل",
        background: "خلفية",
        settings: "الإعدادات",
        theme: "السمة",
        light: "فاتح",
        dark: "داكن",
        language: "اللغة",
        privacy: "سياسة الخصوصية",
        about: "معلومات حول",
        help: "مركز المساعدة",
        contact: "اتصل بنا",
        version: "الإصدار",
        categories: "الفئات",
        editor: "التحرير"
    },
    en: {
        edit: "Edit",
        font: "Font",
        size: "Size",
        color: "Color",
        stroke: "Stroke",
        effects: "Effects",
        shadow: "Shadow",
        background: "Background",
        settings: "Settings",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        language: "Language",
        privacy: "Privacy Policy",
        about: "About",
        help: "Help Center",
        contact: "Contact Us",
        version: "Version",
        categories: "Categories",
        editor: "Editor"
    },
    fr: {
        edit: "Éditer",
        font: "Police",
        size: "Taille",
        color: "Couleur",
        stroke: "Contour",
        effects: "Effets",
        shadow: "Ombre",
        background: "Arrière-plan",
        settings: "Paramètres",
        theme: "Thème",
        light: "Clair",
        dark: "Sombre",
        language: "Langue",
        privacy: "Politique de confidentialité",
        about: "À propos",
        help: "Centre d'aide",
        contact: "Contactez-nous",
        version: "Version",
        categories: "Catégories",
        editor: "Éditeur"
    }
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
    // فقط السمات المتاحة: light, dark
    if (theme !== 'light' && theme !== 'dark') {
        theme = 'light';
        localStorage.setItem('theme', theme);
    }
    
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
    // فقط السمات المتاحة: light, dark
    if (theme !== 'light' && theme !== 'dark') {
        theme = 'light';
    }
    
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
    
    const textInput = document.getElementById('textCardInput');
    if (textInput) {
        const placeholders = {
            ar: 'اكتب النص هنا...',
            en: 'Type your text here...',
            fr: 'Écrivez votre texte ici...'
        };
        textInput.placeholder = placeholders[lang];
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

// تحميل الإعدادات عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});
