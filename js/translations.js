const TRANSLATIONS = {
    en: {
        'categories': 'Image Categories',
        'nav-categories': 'Categories',
        'nav-editor': 'Editor',
        'nav-settings': 'Settings',
        'tool-upload': 'Upload Image',
        'tool-background-create': 'Background',
        'tool-text': 'Add Text',
        'tool-font': 'Fonts',
        'tool-style': 'Text Style',
        'tool-size': 'Font Size',
        'tool-color': 'Color',
        'tool-stroke': 'Stroke',
        'tool-shadow': 'Shadow',
        'tool-bg': 'Text BG',
        'tool-blur': 'Blur',
        'tool-border': 'Border',
        'text-placeholder': 'Type text here...',
        'upload-text': 'Click to upload image',
        'bg-title': 'Create Background',
        'bg-subtitle': 'Select a color to create 3:5 background',
        'bg-create': 'Create Background',
        'style-title': 'Text Style',
        'style-bold': 'Bold',
        'style-italic': 'Italic',
        'style-flip-h': 'Flip H',
        'style-flip-v': 'Flip V',
        'settings-title': 'Settings',
        'theme-title': 'Theme',
        'theme-dark': 'Dark',
        'theme-light': 'Light',
        'theme-gray': 'Gray',
        'language-title': 'Language',
        'links-title': 'Links',
        'about': 'About App',
        'copyright': 'Copyright',
        'privacy': 'Privacy Policy',
        'contact': 'Contact Us',
        'report': 'Report Issue',
        'font-size': 'Font Size',
        'stroke-width': 'Stroke Width',
        'shadow-blur': 'Shadow Intensity',
        'bg-opacity': 'Opacity',
        'blur-intensity': 'Blur Intensity',
        'border-width': 'Border Width'
    },
    ar: {
        'categories': 'فئات الصور',
        'nav-categories': 'فئات صور',
        'nav-editor': 'محرر',
        'nav-settings': 'إعدادات',
        'tool-upload': 'رفع صورة',
        'tool-background-create': 'خلفية',
        'tool-text': 'كتابة نص',
        'tool-font': 'خطوط',
        'tool-style': 'تنسيق نص',
        'tool-size': 'حجم خط',
        'tool-color': 'لون',
        'tool-stroke': 'حواف',
        'tool-shadow': 'ظل',
        'tool-bg': 'خلفية نص',
        'tool-blur': 'ضبابية',
        'tool-border': 'حواف صورة',
        'text-placeholder': 'اكتب النص هنا...',
        'upload-text': 'اضغط لرفع صورة',
        'bg-title': 'إنشاء خلفية',
        'bg-subtitle': 'اختر لون لإنشاء خلفية بحجم 3:5',
        'bg-create': 'إنشاء خلفية',
        'style-title': 'تنسيق النص',
        'style-bold': 'عريض',
        'style-italic': 'مائل',
        'style-flip-h': 'قلب أفقي',
        'style-flip-v': 'قلب عمودي',
        'settings-title': 'الإعدادات',
        'theme-title': 'السمة',
        'theme-dark': 'غامق',
        'theme-light': 'أبيض',
        'theme-gray': 'رمادي',
        'language-title': 'اللغة',
        'links-title': 'روابط',
        'about': 'حول التطبيق',
        'copyright': 'حقوق الملكية',
        'privacy': 'سياسة الخصوصية',
        'contact': 'تواصل معنا',
        'report': 'إبلاغ عن مشكلة',
        'font-size': 'حجم الخط',
        'stroke-width': 'عرض الحواف',
        'shadow-blur': 'شدة الظل',
        'bg-opacity': 'شفافية',
        'blur-intensity': 'شدة الضبابية',
        'border-width': 'عرض الحواف'
    },
    fr: {
        'categories': 'Catégories d\'images',
        'nav-categories': 'Catégories',
        'nav-editor': 'Éditeur',
        'nav-settings': 'Paramètres',
        'tool-upload': 'Télécharger Image',
        'tool-background-create': 'Fond',
        'tool-text': 'Ajouter Texte',
        'tool-font': 'Polices',
        'tool-style': 'Style Texte',
        'tool-size': 'Taille Police',
        'tool-color': 'Couleur',
        'tool-stroke': 'Contour',
        'tool-shadow': 'Ombre',
        'tool-bg': 'Fond Texte',
        'tool-blur': 'Flou',
        'tool-border': 'Bordure',
        'text-placeholder': 'Tapez le texte ici...',
        'upload-text': 'Cliquez pour télécharger',
        'bg-title': 'Créer Fond',
        'bg-subtitle': 'Sélectionnez une couleur pour créer un fond 3:5',
        'bg-create': 'Créer Fond',
        'style-title': 'Style de Texte',
        'style-bold': 'Gras',
        'style-italic': 'Italique',
        'style-flip-h': 'Retour H',
        'style-flip-v': 'Retour V',
        'settings-title': 'Paramètres',
        'theme-title': 'Thème',
        'theme-dark': 'Sombre',
        'theme-light': 'Clair',
        'theme-gray': 'Gris',
        'language-title': 'Langue',
        'links-title': 'Liens',
        'about': 'À propos',
        'copyright': 'Droits d\'auteur',
        'privacy': 'Politique de confidentialité',
        'contact': 'Nous contacter',
        'report': 'Signaler un problème',
        'font-size': 'Taille de police',
        'stroke-width': 'Largeur contour',
        'shadow-blur': 'Intensité ombre',
        'bg-opacity': 'Opacité',
        'blur-intensity': 'Intensité flou',
        'border-width': 'Largeur bordure'
    }
};

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.init();
    }
    
    init() {
        this.applyLanguage();
    }
    
    change(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        this.applyLanguage();
    }
    
    applyLanguage() {
        const translations = TRANSLATIONS[this.currentLang];
        
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
        
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });
        
        if (this.currentLang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', this.currentLang);
        }
    }
    
    get(key) {
        return TRANSLATIONS[this.currentLang][key] || key;
    }
}

window.langManager = new LanguageManager();
