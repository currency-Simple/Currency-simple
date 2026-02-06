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
            window.open('https://sites.google.com/view/goldpricelivenew/home-policy', '_blank');
            return;
        }
        
        const messages = {
            about: {
                ar: 'حول التطبيق\n\nتطبيق Gold Price - يعرض أسعار الذهب العالمية المباشرة لحظة بلحظة، مع تحويل تلقائي إلى عيارات 24، 21، و18. يحتوي على واجهة بسيطة باللغات العربية والإنجليزية والفرنسية، ودعم لتبديل السمة (داكن/فاتح). يتم تحديث البيانات كل 7.5 دقيقة من خلال TwelveData API مع تخزين مؤقت محلي لتحسين الأداء.\n\nالميزات الرئيسية:\n\n· عرض سعر أوقية الذهب بالدولار\n· تحويل تلقائي لعيارات الذهب المختلفة\n· مؤشر تغير السعر ونسبة الربح/الخسارة\n· نطاق التداول اليومي (Day Range)\n· 3 لغات و2 سمة\n· تحديث أوتوماتيكي مع عداد تنازلي',
                en: 'About App\n\nGold Price App - Displays real-time global gold prices with automatic conversion to 24K, 21K, and 18K karats. Features a simple interface in Arabic, English, and French, with theme switching support (dark/light). Data is updated every 7.5 minutes via TwelveData API with local caching for improved performance.\n\nKey Features:\n\n· Gold ounce price in USD\n· Automatic conversion to different gold karats\n· Price change indicator and profit/loss percentage\n· Daily trading range (Day Range)\n· 3 languages & 2 themes\n· Automatic updates with countdown timer',
                fr: 'À propos de l\'application\n\nApplication Gold Price - Affiche les prix mondiaux de l\'or en temps réel avec conversion automatique en carats 24, 21 et 18. Dispose d\'une interface simple en arabe, anglais et français, avec prise en charge du changement de thème (sombre/clair). Les données sont mises à jour toutes les 7,5 minutes via l\'API TwelveData avec mise en cache locale pour améliorer les performances.\n\nCaractéristiques principales:\n\n· Prix de l\'once d\'or en USD\n· Conversion automatique en différents carats d\'or\n· Indicateur de changement de prix et pourcentage profit/perte\n· Fourchette de négociation quotidienne (Day Range)\n· 3 langues et 2 thèmes\n· Mises à jour automatiques avec compte à rebours'
            },
            copyright: {
                ar: 'حقوق الملكية\n\nتطبيق "Gold Price" هو تطبيق يهدف إلى تسهيل الوصول إلى أسعار الذهب العالمية من خلال عرض بيانات TwelveData API للجمهور.\n\nطبيعة الاستخدام:\n\n· استهلاك API ضمن الحدود المسموح بها في الخطة المجانية\n· عرض البيانات للعامة بدون مقابل\n· لا يحتوي على أي محتوى مملوك للغير\n· لا يدعي ارتباطه بأي كيان تجاري\n\nالالتزام القانوني:\nيتم استخدام TwelveData API وفقًا لشروط خدمتهم المعلنة، ويحترم التطبيق جميع سياسات Google Play المتعلقة بحقوق الملكية واستخدام API.',
                en: 'Copyright\n\n"Gold Price" app aims to facilitate access to global gold prices by displaying TwelveData API data to the public.\n\nNature of Use:\n\n· API consumption within the limits allowed in the free plan\n· Displaying data to the public free of charge\n· Does not contain any third-party owned content\n· Does not claim association with any commercial entity\n\nLegal Compliance:\nTwelveData API is used in accordance with their published terms of service, and the app respects all Google Play policies related to intellectual property and API usage.',
                fr: 'Droits d\'auteur\n\nL\'application "Gold Price" vise à faciliter l\'accès aux prix mondiaux de l\'or en affichant les données de l\'API TwelveData au public.\n\nNature d\'utilisation:\n\n· Consommation d\'API dans les limites autorisées du plan gratuit\n· Affichage des données au public gratuitement\n· Ne contient aucun contenu appartenant à des tiers\n· Ne prétend pas être associé à une entité commerciale\n\nConformité juridique:\nL\'API TwelveData est utilisée conformément à leurs conditions de service publiées, et l\'application respecte toutes les politiques de Google Play relatives à la propriété intellectuelle et à l\'utilisation des API.'
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
