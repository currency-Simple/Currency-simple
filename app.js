// ============================================
// Translations
// ============================================
const translations = {
    ar: {
        settings: 'الإعدادات',
        theme: 'السمة',
        dark: 'داكن',
        light: 'فاتح',
        language: 'اللغة',
        privacy: 'سياسة الخصوصية',
        about: 'حول التطبيق',
        copyright: 'حقوق الملكية',
        loading: 'جاري تحميل الأسعار...',
        livePrice: 'Live price',
        lastUpdate: 'آخر تحديث',
        nextUpdate: 'التحديث القادم',
        apiCredit: 'البيانات مقدمة من TwelveData API | يتم التحديث كل 7.5 دقيقة',
        disclaimer: '⚠️ الأسعار للإشارة فقط وليست للتداول الفعلي',
        goldSpot: 'Gold Spot / US Dollar',
        commodity: 'COMMODITY',
        dayRange: 'Day range',
        rise: 'Rise',
        fall: 'Fall',
        gram: 'جرام',
        karat24: 'عيار 24',
        karat21: 'عيار 21',
        karat18: 'عيار 18'
    },
    en: {
        settings: 'Settings',
        theme: 'Theme',
        dark: 'Dark',
        light: 'Light',
        language: 'Language',
        privacy: 'Privacy Policy',
        about: 'About App',
        copyright: 'Copyright',
        loading: 'Loading prices...',
        livePrice: 'Live price',
        lastUpdate: 'Last update',
        nextUpdate: 'Next update',
        apiCredit: 'Data provided by TwelveData API | Updates every 7.5 minutes',
        disclaimer: '⚠️ Prices are for reference only',
        goldSpot: 'Gold Spot / US Dollar',
        commodity: 'COMMODITY',
        dayRange: 'Day range',
        rise: 'Rise',
        fall: 'Fall',
        gram: 'gram',
        karat24: '24K',
        karat21: '21K',
        karat18: '18K'
    },
    fr: {
        settings: 'Paramètres',
        theme: 'Thème',
        dark: 'Sombre',
        light: 'Clair',
        language: 'Langue',
        privacy: 'Politique de confidentialité',
        about: 'À propos',
        copyright: 'Droits d\'auteur',
        loading: 'Chargement des prix...',
        livePrice: 'Prix en direct',
        lastUpdate: 'Dernière mise à jour',
        nextUpdate: 'Prochaine mise à jour',
        apiCredit: 'Données fournies par TwelveData API | Mises à jour toutes les 7,5 minutes',
        disclaimer: '⚠️ Prix indicatifs seulement',
        goldSpot: 'Or Spot / Dollar US',
        commodity: 'MATIÈRE PREMIÈRE',
        dayRange: 'Fourchette du jour',
        rise: 'Hausse',
        fall: 'Baisse',
        gram: 'gramme',
        karat24: '24 carats',
        karat21: '21 carats',
        karat18: '18 carats'
    }
};

// ============================================
// Main Application Logic
// ============================================

class MetalsApp {
    constructor() {
        this.isLoading = false;
        this.updateInterval = null;
        this.countdownInterval = null;
        this.currentLang = localStorage.getItem('language') || 'ar';
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    async init() {
        console.log('Initializing Gold Price App...');
        this.applyTheme(this.currentTheme);
        this.applyLanguage(this.currentLang);
        this.attachEventListeners();
        await this.loadData();
        this.startAutoUpdate();
    }

    /**
     * ربط event listeners
     */
    attachEventListeners() {
        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeModal = document.getElementById('closeModal');

        settingsBtn?.addEventListener('click', () => {
            settingsModal?.classList.add('active');
        });

        closeModal?.addEventListener('click', () => {
            settingsModal?.classList.remove('active');
        });

        settingsModal?.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.applyTheme(theme);
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Language select
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = this.currentLang;
            langSelect.addEventListener('change', (e) => {
                this.applyLanguage(e.target.value);
            });
        }

        // Setting links
        document.getElementById('privacyBtn')?.addEventListener('click', () => {
            this.showInfo('privacy');
        });
        document.getElementById('aboutBtn')?.addEventListener('click', () => {
            this.showInfo('about');
        });
        document.getElementById('copyrightBtn')?.addEventListener('click', () => {
            this.showInfo('copyright');
        });
    }

    /**
     * تطبيق السمة
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    /**
     * تطبيق اللغة
     */
    applyLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        // Update direction
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', lang);
        }

        // Update all translated elements
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
    }

    /**
     * عرض معلومات
     */
    showInfo(type) {
        if (type === 'privacy') {
            // فتح رابط سياسة الخصوصية في نافذة جديدة
            window.open('https://sites.google.com/view/wallpaper-maker-1/%D8%A7%D9%84%D8%B5%D9%81%D8%AD%D8%A9-%D8%A7%D9%84%D8%B1%D8%A6%D9%8A%D8%B3%D9%8A%D8%A9', '_blank');
            return;
        }
        
        const messages = {
            about: {
                ar: 'حول التطبيق\n\nتطبيق أسعار الذهب - نسخة 1.0\n\nهذا التطبيق مخصص لعرض أسعار الذهب بمختلف عياراته للمعلومات فقط.\n\nالتطبيق لا يقدم أي نصائح مالية أو استثمارية ولا يدعم عمليات التداول. الأسعار المعروضة هي للإشارة فقط ولا ينبغي الاعتماد عليها في اتخاذ قرارات مالية.\n\nيُرجى استشارة مستشار مالي مؤهل قبل اتخاذ أي قرارات استثمارية.',
                en: 'About App\n\nGold Price App - Version 1.0\n\nThis app is designed to display gold prices in different karats for informational purposes only.\n\nThe app does not provide any financial or investment advice and does not support trading operations. The prices displayed are for reference only and should not be relied upon for making financial decisions.\n\nPlease consult a qualified financial advisor before making any investment decisions.',
                fr: 'À propos de l\'application\n\nApplication Prix de l\'Or - Version 1.0\n\nCette application est conçue pour afficher les prix de l\'or en différents carats à titre informatif uniquement.\n\nL\'application ne fournit aucun conseil financier ou d\'investissement et ne prend pas en charge les opérations de trading. Les prix affichés sont fournis à titre indicatif uniquement et ne doivent pas être utilisés pour prendre des décisions financières.\n\nVeuillez consulter un conseiller financier qualifié avant de prendre toute décision d\'investissement.'
            },
            copyright: {
                ar: 'حقوق الملكية\n\n© 2024 تطبيق أسعار الذهب\nجميع الحقوق محفوظة\n\nالبيانات مقدمة من TwelveData API\n\nيستخدم هذا التطبيق واجهة برمجة التطبيقات (API) من TwelveData لعرض أسعار الذهب الحالية. جميع البيانات المعروضة هي ملك لـ TwelveData وتخضع لشروط الخدمة الخاصة بهم.\n\nالتطبيق مقدم "كما هو" دون أي ضمانات من أي نوع.',
                en: 'Copyright\n\n© 2024 Gold Price App\nAll rights reserved\n\nData provided by TwelveData API\n\nThis application uses the TwelveData API to display current gold prices. All data displayed is owned by TwelveData and subject to their terms of service.\n\nThe application is provided "as is" without any warranties of any kind.',
                fr: 'Droits d\'auteur\n\n© 2024 Application Prix de l\'Or\nTous droits réservés\n\nDonnées fournies par l\'API TwelveData\n\nCette application utilise l\'API TwelveData pour afficher les prix actuels de l\'or. Toutes les données affichées appartiennent à TwelveData et sont soumises à leurs conditions d\'utilisation.\n\nL\'application est fournie "telle quelle" sans garantie d\'aucune sorte.'
            }
        };

        alert(messages[type][this.currentLang]);
    }

    /**
     * تحميل البيانات
     */
    async loadData() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();
        this.hideError();

        try {
            const data = await apiService.fetchAllMetals();
            this.renderMainGoldCardWithDayRange(data.gold);
            this.renderGoldKarats(data.gold.price);
            this.updateLastUpdateTime();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('فشل تحميل البيانات. سيتم إعادة المحاولة تلقائياً...');
            this.hideLoading();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * عرض شاشة التحميل
     */
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }

    /**
     * إخفاء شاشة التحميل
     */
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }

    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.style.display = 'flex';
        }
    }

    /**
     * إخفاء رسالة الخطأ
     */
    hideError() {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) errorDiv.style.display = 'none';
    }

    /**
     * عرض بطاقة الذهب الرئيسية مع Day Range المدمج
     */
    renderMainGoldCardWithDayRange(gold) {
        const card = document.getElementById('mainGoldCard');
        if (!card) return;

        const isPositive = gold.change >= 0;
        const changeSign = isPositive ? '+' : '';
        const changeClass = isPositive ? 'positive' : 'negative';

        const goldSpotText = translations[this.currentLang].goldSpot;
        const dayRangeText = translations[this.currentLang].dayRange;
        const riseText = translations[this.currentLang].rise;
        const fallText = translations[this.currentLang].fall;

        const range = gold.high - gold.low;
        const position = range > 0 ? ((gold.price - gold.low) / range) * 100 : 50;

        card.innerHTML = `
            <div class="main-gold-header">
                <div class="gold-icon">
                    <img src="https://i.imgur.com/m4HDho5.png" alt="Gold Icon">
                </div>
                <div class="main-gold-title">Gold Spot / US Dollar</div>
            </div>
            <div class="main-gold-price">$${gold.price.toLocaleString('en-US', {minimumFractionDigits: 5, maximumFractionDigits: 5})} <small style="font-size:0.4em">USD</small></div>
            <div class="main-gold-change ${changeClass}">
                ${changeSign}${Math.abs(gold.changePercent).toFixed(2)}% - ${changeSign}${Math.abs(gold.change).toFixed(4)}
            </div>
            
            <div class="day-range-integrated">
                <div class="day-range-title">${dayRangeText}</div>
                <div class="range-bar">
                    <div class="range-indicator" style="left: ${position}%"></div>
                </div>
                <div class="range-labels">
                    <div class="range-label-item">
                        <div class="range-label-title">${riseText}</div>
                        <div class="range-value">${gold.high.toLocaleString('en-US', {minimumFractionDigits: 5, maximumFractionDigits: 5})}</div>
                    </div>
                    <div class="range-label-item">
                        <div class="range-label-title">${fallText}</div>
                        <div class="range-value">${gold.low.toLocaleString('en-US', {minimumFractionDigits: 5, maximumFractionDigits: 5})}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * عرض عيارات الذهب بتصميم صف واحد
     */
    renderGoldKarats(goldPrice) {
        const row = document.getElementById('karatsRow');
        if (!row) return;

        row.innerHTML = '';

        const karats = apiService.calculateGoldKarats(goldPrice);
        const karatNames = {
            karat24: translations[this.currentLang].karat24,
            karat21: translations[this.currentLang].karat21,
            karat18: translations[this.currentLang].karat18
        };

        Object.keys(karats).forEach(karatKey => {
            const karat = karats[karatKey];
            karat.displayName = karatNames[karatKey];
            const card = this.createKaratCardInline(karat);
            row.appendChild(card);
        });
    }

    /**
     * إنشاء بطاقة عيار ذهب بتصميم inline
     */
    createKaratCardInline(karat) {
        const card = document.createElement('div');
        card.className = 'karat-card-inline';

        const gramText = translations[this.currentLang].gram;

        card.innerHTML = `
            <div class="karat-icon">
                <img src="https://i.imgur.com/m4HDho5.png" alt="Gold">
            </div>
            <div class="karat-info">
                <div class="karat-name">${karat.displayName}</div>
                <div class="karat-price-inline">$${karat.price.toFixed(2)}</div>
                <div class="karat-label">${gramText}</div>
            </div>
        `;

        return card;
    }

    /**
     * تحديث وقت آخر تحديث
     */
    updateLastUpdateTime() {
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl && apiService.cache.timestamp) {
            const updateTime = new Date(apiService.cache.timestamp);
            const timeString = updateTime.toLocaleTimeString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            lastUpdateEl.textContent = timeString;
        }
    }

    /**
     * تحديث عداد الوقت المتبقي
     */
    updateCountdown() {
        const nextUpdateEl = document.getElementById('nextUpdate');
        if (!nextUpdateEl) return;

        const remaining = apiService.getTimeUntilNextUpdate();
        
        if (remaining <= 0) {
            nextUpdateEl.textContent = '...';
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        nextUpdateEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * بدء التحديث التلقائي
     */
    startAutoUpdate() {
        // تحديث الوقت كل 7.5 دقيقة
        this.updateInterval = setInterval(() => {
            console.log('Checking if update needed...');
            // فقط إذا انتهت مدة الكاش
            if (!apiService.isCacheValid()) {
                console.log('Cache expired, updating data...');
                this.loadData();
            }
        }, 30 * 1000); // فحص كل 30 ثانية

        // تحديث العداد التنازلي كل ثانية
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);

        // تحديث فوري للعداد
        this.updateCountdown();
    }

    /**
     * إيقاف التحديث التلقائي
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    window.metalsApp = new MetalsApp();
});

// تنظيف عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    if (window.metalsApp) {
        window.metalsApp.stopAutoUpdate();
    }
});
