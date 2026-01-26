// الترجمات
const translations = {
    ar: {
        edit: "تحرير",
        font: "الخط",
        size: "الحجم",
        color: "اللون",
        stroke: "الحواف",
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

// دوال الروابط الإضافية
function showPrivacyPolicy() {
    const content = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: var(--primary-color); margin-bottom: 20px;">سياسة الخصوصية</h2>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. هذا التطبيق لا يجمع أي معلومات شخصية أو بيانات من المستخدمين.
            </p>
            <h3 style="color: var(--text-color); margin: 20px 0 10px;">البيانات المحلية</h3>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                جميع البيانات والإعدادات يتم حفظها محلياً على جهازك فقط ولا يتم إرسالها إلى أي خوادم خارجية.
            </p>
            <h3 style="color: var(--text-color); margin: 20px 0 10px;">الصور</h3>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                الصور التي تقوم برفعها أو تعديلها تبقى على جهازك ولا يتم رفعها أو مشاركتها مع أي جهة ثالثة.
            </p>
            <button onclick="closeInfoDialog()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
            ">فهمت</button>
        </div>
    `;
    showInfoDialog(content);
}

function showAbout() {
    const content = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; text-align: center;">
            <h2 style="color: var(--primary-color); margin-bottom: 20px;">محرر النصوص على الصور</h2>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                الإصدار 10.1 Final
            </p>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                تطبيق متقدم لإضافة النصوص على الصور مع خيارات تحرير متعددة وأكثر من 40 خط عربي وإنجليزي.
            </p>
            <h3 style="color: var(--text-color); margin: 20px 0 10px;">المميزات</h3>
            <ul style="text-align: right; line-height: 2; margin-bottom: 20px;">
                <li>أكثر من 40 خط عربي وإنجليزي</li>
                <li>مجموعة واسعة من الألوان</li>
                <li>تأثيرات الظل والخلفية للنص</li>
                <li>تحكم بالحجم والحركة عبر اللمس</li>
                <li>تدوير وقلب الصور</li>
                <li>حواف ملونة للصور والنصوص</li>
                <li>إمكانية التراجع عن التعديلات</li>
                <li>تصدير بجودة عالية</li>
            </ul>
            <p style="line-height: 1.8; margin-bottom: 15px; color: var(--text-secondary);">
                © 2025 جميع الحقوق محفوظة
            </p>
            <button onclick="closeInfoDialog()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
            ">إغلاق</button>
        </div>
    `;
    showInfoDialog(content);
}

function showHelp() {
    const content = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: var(--primary-color); margin-bottom: 20px;">مركز المساعدة</h2>
            
            <h3 style="color: var(--text-color); margin: 20px 0 10px;">كيفية إضافة نص</h3>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                1. اختر صورة من الفئات أو قم برفع صورة من جهازك<br>
                2. اضغط على زر "نص" في شريط الأدوات<br>
                3. اكتب النص المطلوب واضغط "موافق"
            </p>
            
            <h3 style="color: var(--text-color); margin: 20px 0 10px;">تحريك وتغيير حجم النص</h3>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                • لتحريك النص: المس النص واسحبه بإصبع واحد (حركة فورية)<br>
                • لتغيير الحجم: استخدم إصبعين (قرص وتكبير) على النص<br>
                • للتدوير: استخدم إصبعين ولف النص
            </p>
            
            <h3 style="color: var(--text-color); margin: 20px 0 10px;">تأثيرات النص</h3>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                • زر "ظل": لتفعيل/تعطيل الظل وتغيير لونه وشدة<br>
                • زر "خلفية": لتفعيل/تعطيل خلفية النص وتغيير لونها وشفافيتها<br>
                • زر "حواف": لإضافة إطار حول النص
            </p>
            
            <h3 style="color: var(--text-color); margin: 20px 0 10px;">إمكانية التراجع</h3>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                • زر "↩️" في الأعلى: للتراجع عن آخر تعديل<br>
                • يمكنك التراجع عن جميع التعديلات حتى تحميل الصورة
            </p>
            
            <h3 style="color: var(--text-color); margin: 20px 0 10px;">حفظ ومشاركة</h3>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                • زر "تنزيل": لحفظ الصورة على جهازك<br>
                • زر "مشاركة": لمشاركة الصورة مباشرة
            </p>
            
            <button onclick="closeInfoDialog()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
            ">فهمت</button>
        </div>
    `;
    showInfoDialog(content);
}

function showContact() {
    const content = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; text-align: center;">
            <h2 style="color: var(--primary-color); margin-bottom: 20px;">اتصل بنا</h2>
            <p style="line-height: 1.8; margin-bottom: 25px;">
                نحن نرحب بملاحظاتك واقتراحاتك لتحسين التطبيق
            </p>
            
            <div style="background: var(--bg-color); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: var(--text-color); margin-bottom: 15px;">طرق التواصل</h3>
                <p style="margin: 10px 0;">
                    <strong>البريد الإلكتروني:</strong><br>
                    <a href="mailto:support@texteditor.com" style="color: var(--primary-color);">
                        support@texteditor.com
                    </a>
                </p>
                <p style="margin: 10px 0;">
                    <strong>الدعم الفني:</strong><br>
                    متاح من الأحد إلى الخميس<br>
                    من 9 صباحاً إلى 5 مساءً
                </p>
            </div>
            
            <p style="line-height: 1.8; color: var(--text-secondary); margin-bottom: 20px;">
                سنرد على استفساراتك في أقرب وقت ممكن
            </p>
            
            <button onclick="closeInfoDialog()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
            ">إغلاق</button>
        </div>
    `;
    showInfoDialog(content);
}

function showInfoDialog(content) {
    const existingDialog = document.getElementById('infoDialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    const dialog = document.createElement('div');
    dialog.id = 'infoDialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: var(--card-bg);
        color: var(--text-color);
        border-radius: 16px;
        max-width: 700px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;
    dialogContent.innerHTML = content;
    
    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);
    
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            closeInfoDialog();
        }
    });
}

function closeInfoDialog() {
    const dialog = document.getElementById('infoDialog');
    if (dialog) {
        dialog.remove();
    }
}

// تحميل الإعدادات عند بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});

// تصدير الدوال
window.showPrivacyPolicy = showPrivacyPolicy;
window.showAbout = showAbout;
window.showHelp = showHelp;
window.showContact = showContact;
window.closeInfoDialog = closeInfoDialog;
window.changeTheme = changeTheme;
window.changeLanguage = changeLanguage;
window.toggleToolPanel = toggleToolPanel;
