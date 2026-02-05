// Currency data
const currencyData = {
    parallel: [
        { code: 'EUR', name: 'اليورو', flag: 'https://flagcdn.com/w160/eu.png', buy: 279.00, sell: 281.00, trend: 'up' },
        { code: 'USD', name: 'الدولار الأمريكي', flag: 'https://flagcdn.com/w160/us.png', buy: 235.00, sell: 238.00, trend: 'down' },
        { code: 'GBP', name: 'الجنيه البريطاني', flag: 'https://flagcdn.com/w160/gb.png', buy: 310.00, sell: 315.00, trend: 'up' },
        { code: 'CAD', name: 'الدولار الكندي', flag: 'https://flagcdn.com/w160/ca.png', buy: 168.00, sell: 172.00, trend: 'down' },
        { code: 'CHF', name: 'الفرنك السويسري', flag: 'https://flagcdn.com/w160/ch.png', buy: 265.00, sell: 268.00 },
        { code: 'CNY', name: 'اليوان الصيني', flag: 'https://flagcdn.com/w160/cn.png', buy: 32.50, sell: 33.20 },
        { code: 'TRY', name: 'الليرة التركية', flag: 'https://flagcdn.com/w160/tr.png', buy: 7.20, sell: 7.50 },
        { code: 'AUD', name: 'الدولار الأسترالي', flag: 'https://flagcdn.com/w160/au.png', buy: 155.00, sell: 158.00 },
        { code: 'RUB', name: 'الروبل الروسي', flag: 'https://flagcdn.com/w160/ru.png', buy: 2.45, sell: 2.60 },
        { code: 'MYR', name: 'الرينغيت الماليزي', flag: 'https://flagcdn.com/w160/my.png', buy: 52.50, sell: 53.50 },
        { code: 'BRL', name: 'الريال البرازيلي', flag: 'https://flagcdn.com/w160/br.png', buy: 46.50, sell: 47.50 },
        { code: 'MXN', name: 'البيزو المكسيكي', flag: 'https://flagcdn.com/w160/mx.png', buy: 11.80, sell: 12.20 },
        { code: 'KRW', name: 'الوون الكوري', flag: 'https://flagcdn.com/w160/kr.png', buy: 0.17, sell: 0.18 },
        { code: 'JPY', name: 'الين الياباني', flag: 'https://flagcdn.com/w160/jp.png', buy: 1.80, sell: 1.85 },
        { code: 'INR', name: 'الروبية الهندية', flag: 'https://flagcdn.com/w160/in.png', buy: 2.80, sell: 2.95 },
        { code: 'MAD', name: 'الدرهم المغربي', flag: 'https://flagcdn.com/w160/ma.png', buy: 23.50, sell: 24.00 },
        { code: 'TND', name: 'الدينار التونسي', flag: 'https://flagcdn.com/w160/tn.png', buy: 75.00, sell: 76.50 },
        { code: 'EGP', name: 'الجنيه المصري', flag: 'https://flagcdn.com/w160/eg.png', buy: 4.80, sell: 4.95 },
        { code: 'SAR', name: 'الريال السعودي', flag: 'https://flagcdn.com/w160/sa.png', buy: 62.50, sell: 63.50 },
        { code: 'QAR', name: 'الريال القطري', flag: 'https://flagcdn.com/w160/qa.png', buy: 64.50, sell: 65.50 },
        { code: 'AED', name: 'الدرهم الإماراتي', flag: 'https://flagcdn.com/w160/ae.png', buy: 64.00, sell: 65.00 }
    ],
    official: [
        { code: 'EUR', name: 'اليورو', flag: 'https://flagcdn.com/w160/eu.png', sell: 153.52, trend: 'up' },
        { code: 'USD', name: 'الدولار الأمريكي', flag: 'https://flagcdn.com/w160/us.png', sell: 129.92, trend: 'down' },
        { code: 'GBP', name: 'الجنيه البريطاني', flag: 'https://flagcdn.com/w160/gb.png', sell: 178.09, trend: 'up' },
        { code: 'CAD', name: 'الدولار الكندي', flag: 'https://flagcdn.com/w160/ca.png', sell: 95.15, trend: 'down' },
        { code: 'CHF', name: 'الفرنك السويسري', flag: 'https://flagcdn.com/w160/ch.png', sell: 151.20 },
        { code: 'CNY', name: 'اليوان الصيني', flag: 'https://flagcdn.com/w160/cn.png', sell: 18.50 },
        { code: 'TRY', name: 'الليرة التركية', flag: 'https://flagcdn.com/w160/tr.png', sell: 4.10 },
        { code: 'AUD', name: 'الدولار الأسترالي', flag: 'https://flagcdn.com/w160/au.png', sell: 88.30 },
        { code: 'RUB', name: 'الروبل الروسي', flag: 'https://flagcdn.com/w160/ru.png', sell: 1.40 },
        { code: 'MYR', name: 'الرينغيت الماليزي', flag: 'https://flagcdn.com/w160/my.png', sell: 29.80 },
        { code: 'BRL', name: 'الريال البرازيلي', flag: 'https://flagcdn.com/w160/br.png', sell: 26.50 },
        { code: 'MXN', name: 'البيزو المكسيكي', flag: 'https://flagcdn.com/w160/mx.png', sell: 6.70 },
        { code: 'KRW', name: 'الوون الكوري', flag: 'https://flagcdn.com/w160/kr.png', sell: 0.10 },
        { code: 'JPY', name: 'الين الياباني', flag: 'https://flagcdn.com/w160/jp.png', sell: 1.05 },
        { code: 'INR', name: 'الروبية الهندية', flag: 'https://flagcdn.com/w160/in.png', sell: 1.60 },
        { code: 'MAD', name: 'الدرهم المغربي', flag: 'https://flagcdn.com/w160/ma.png', sell: 13.40 },
        { code: 'TND', name: 'الدينار التونسي', flag: 'https://flagcdn.com/w160/tn.png', sell: 42.50 },
        { code: 'EGP', name: 'الجنيه المصري', flag: 'https://flagcdn.com/w160/eg.png', sell: 2.75 },
        { code: 'SAR', name: 'الريال السعودي', flag: 'https://flagcdn.com/w160/sa.png', sell: 35.60 },
        { code: 'QAR', name: 'الريال القطري', flag: 'https://flagcdn.com/w160/qa.png', sell: 36.70 },
        { code: 'AED', name: 'الدرهم الإماراتي', flag: 'https://flagcdn.com/w160/ae.png', sell: 36.40 }
    ]
};

let currentTab = 'parallel';
let currentLanguage = 'ar';

// Translations
const translations = {
    ar: {
        appName: 'Change Dinar',
        parallelMarket: 'السوق الموازية',
        officialMarket: 'السوق الرسمية',
        lastUpdate: 'آخر تحديث',
        buy: 'شراء',
        sell: 'بيع',
        alert: 'تنبيه: الأسعار المعروضة هي للمعلومات فقط وقد تختلف من ولاية لأخرى',
        footerNote: '** هذه أسعار العملات الأجنبية في العاصمة، يوجد تغيير طفيف في الأسعار من ولاية إلى ولاية اخرى',
        about: 'حول التطبيق',
        privacy: 'سياسة الخصوصية',
        contact: 'تواصل معنا',
        shareApp: 'مشاركة التطبيق',
        darkMode: 'الوضع الداكن',
        language: 'اللغة / Language',
        settings: 'الإعدادات',
        currencies: {
            'EUR': 'اليورو',
            'USD': 'الدولار الأمريكي',
            'GBP': 'الجنيه البريطاني',
            'CAD': 'الدولار الكندي',
            'CHF': 'الفرنك السويسري',
            'CNY': 'اليوان الصيني',
            'TRY': 'الليرة التركية',
            'AUD': 'الدولار الأسترالي',
            'RUB': 'الروبل الروسي',
            'MYR': 'الرينغيت الماليزي',
            'BRL': 'الريال البرازيلي',
            'MXN': 'البيزو المكسيكي',
            'KRW': 'الوون الكوري',
            'JPY': 'الين الياباني',
            'INR': 'الروبية الهندية',
            'MAD': 'الدرهم المغربي',
            'TND': 'الدينار التونسي',
            'EGP': 'الجنيه المصري',
            'SAR': 'الريال السعودي',
            'QAR': 'الريال القطري',
            'AED': 'الدرهم الإماراتي'
        }
    },
    fr: {
        appName: 'Change Dinar',
        parallelMarket: 'Marché Parallèle',
        officialMarket: 'Marché Officiel',
        lastUpdate: 'Dernière mise à jour',
        buy: 'Achat',
        sell: 'Vente',
        alert: 'Attention: Les prix affichés sont à titre informatif uniquement et peuvent varier d\'une wilaya à l\'autre',
        footerNote: '** Ces prix de devises étrangères sont valables dans la capitale, il existe une légère variation des prix d\'une wilaya à l\'autre',
        about: 'À propos',
        privacy: 'سياسة الخصوصية',
        contact: 'Contactez-nous',
        shareApp: 'Partager l\'application',
        darkMode: 'Mode sombre',
        language: 'Langue / Language',
        settings: 'Paramètres',
        currencies: {
            'EUR': 'Euro',
            'USD': 'Dollar américain',
            'GBP': 'Livre sterling',
            'CAD': 'Dollar canadien',
            'CHF': 'Franc suisse',
            'CNY': 'Yuan chinois',
            'TRY': 'Livre turque',
            'AUD': 'Dollar australien',
            'RUB': 'Rouble russe',
            'MYR': 'Ringgit malaisien',
            'BRL': 'Real brésilien',
            'MXN': 'Peso mexicain',
            'KRW': 'Won sud-coréen',
            'JPY': 'Yen japonais',
            'INR': 'Roupie indienne',
            'MAD': 'Dirham marocain',
            'TND': 'Dinar tunisien',
            'EGP': 'Livre égyptienne',
            'SAR': 'Riyal saoudien',
            'QAR': 'Riyal qatari',
            'AED': 'Dirham des EAU'
        }
    },
    en: {
        appName: 'Change Dinar',
        parallelMarket: 'Parallel Market',
        officialMarket: 'Official Market',
        lastUpdate: 'Last update',
        buy: 'Buy',
        sell: 'Sell',
        alert: 'Notice: Displayed prices are for information only and may vary from one state to another',
        footerNote: '** These foreign currency prices are valid in the capital, there is a slight variation in prices from state to state',
        about: 'About',
        privacy: 'سياسة الخصوصية',
        contact: 'Contact Us',
        shareApp: 'Share App',
        darkMode: 'Dark Mode',
        language: 'Language / اللغة',
        settings: 'Settings',
        currencies: {
            'EUR': 'Euro',
            'USD': 'US Dollar',
            'GBP': 'British Pound',
            'CAD': 'Canadian Dollar',
            'CHF': 'Swiss Franc',
            'CNY': 'Chinese Yuan',
            'TRY': 'Turkish Lira',
            'AUD': 'Australian Dollar',
            'RUB': 'Russian Ruble',
            'MYR': 'Malaysian Ringgit',
            'BRL': 'Brazilian Real',
            'MXN': 'Mexican Peso',
            'KRW': 'South Korean Won',
            'JPY': 'Japanese Yen',
            'INR': 'Indian Rupee',
            'MAD': 'Moroccan Dirham',
            'TND': 'Tunisian Dinar',
            'EGP': 'Egyptian Pound',
            'SAR': 'Saudi Riyal',
            'QAR': 'Qatari Riyal',
            'AED': 'UAE Dirham'
        }
    }
};


// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadLanguage();
    updateLastUpdate();
    renderCurrencies();
    updateUILanguage();
});

// Toggle menu
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    menu.classList.toggle('active');
}

// Change tab
function changeTab(tab) {
    currentTab = tab;
    
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Render currencies for selected tab
    renderCurrencies();
}

// Render currencies
function renderCurrencies() {
    const currencyList = document.getElementById('currencyList');
    const data = currencyData[currentTab] || [];
    
    currencyList.innerHTML = '';
    
    data.forEach(currency => {
        const card = createCurrencyCard(currency);
        currencyList.appendChild(card);
    });
}

// Create currency card
function createCurrencyCard(currency) {
    const card = document.createElement('div');
    card.className = 'currency-card';
    
    // For official market, only show sell price
    const isOfficialMarket = currentTab === 'official';
    
    // Get translated currency name
    const currencyName = translations[currentLanguage].currencies[currency.code] || currency.code;
    
    // Trend arrow (can be 'up', 'down', or undefined to hide)
    let trendArrow = '';
    if (currency.trend === 'up') {
        trendArrow = '<span class="trend-arrow up">▲</span>';
    } else if (currency.trend === 'down') {
        trendArrow = '<span class="trend-arrow down">▼</span>';
    }
    
    // Format price to show only 3 significant digits
    const formatPrice = (price) => {
        if (price >= 100) {
            return Math.round(price).toString();
        } else if (price >= 10) {
            return price.toFixed(1);
        } else {
            return price.toFixed(2);
        }
    };
    
    card.innerHTML = `
        <div class="currency-info">
            <img src="${currency.flag}" alt="${currencyName}" class="currency-flag" onerror="this.src='https://via.placeholder.com/50'">
            <div class="currency-details">
                <h3>${currency.code}${trendArrow}</h3>
                <div class="currency-name">${currencyName}</div>
            </div>
        </div>
        <div class="currency-rates">
            ${!isOfficialMarket && currency.buy ? `
                <div class="rate buy">
                    <div class="rate-label">${translations[currentLanguage].buy}</div>
                    <div class="rate-value">${formatPrice(currency.buy)}</div>
                </div>
            ` : ''}
            <div class="rate sell">
                <div class="rate-label">${translations[currentLanguage].sell}</div>
                <div class="rate-value">${formatPrice(currency.sell)}</div>
            </div>
        </div>
    `;
    
    return card;
}

// Update last update timestamp
function updateLastUpdate() {
    const now = new Date();
    const formatted = now.toISOString().split('T')[0];
    document.getElementById('lastUpdate').textContent = formatted;
}

// Share app function
function shareApp() {
    const playStoreUrl = ''; // Add Play Store URL here when available
    
    if (playStoreUrl) {
        // If URL is available, share it
        if (navigator.share) {
            navigator.share({
                title: 'Change Dinar',
                text: 'تطبيق Change Dinar لمتابعة أسعار صرف العملات في الجزائر',
                url: playStoreUrl
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(playStoreUrl).then(() => {
                alert('تم نسخ رابط التطبيق');
            });
        }
    } else {
        // Show message that the app is not yet published
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>مشاركة التطبيق</h2>
            <p style="text-align: center; padding: 30px 20px; line-height: 1.8;">
                <strong>التطبيق قريباً على متجر Google Play</strong><br><br>
                سنقوم بإضافة رابط التطبيق هنا فور نشره على المتجر.<br>
                شكراً لاهتمامك! 🙏
            </p>
        `;
        showModal();
    }
    toggleMenu();
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    
    // Save theme preference
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Load theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.checked = true;
    }
}

// Show about modal
function showAbout() {
    const modalBody = document.getElementById('modalBody');
    
    if (currentLanguage === 'ar') {
        modalBody.innerHTML = `
            <h2>حول التطبيق</h2>
            <p><strong>Change Dinar</strong> هو تطبيق مخصص للهواتف المحمولة يجمع ويوفر معلومات دقيقة حول أسعار صرف العملات الأجنبية مثل اليورو، والدولار الأمريكي، والدولار الكندي، مقابل الدينار الجزائري في السوق الموازية عبر عدة نقاط في العاصمة الجزائرية.</p>
            
            <p>تتميز الحالة الجزائرية بنظام صرف فريد، حيث يصعب الحصول على العملات الأجنبية عبر القنوات المصرفية الرسمية في غياب مكاتب الصرافة المعتمدة، مما أدى إلى انتشار واسع لسوق الصرف الموازي. يُعتبر ساحة بور سعيد القلب النابض لهذا السوق، إلى جانب العديد من النقاط غير الرسمية المعروفة لدى المواطنين.</p>
            
            <p>يقدم التطبيق خدمة ميسرة لمتابعة أسعار الصرف بشكل آني، مع الإشارة إلى أن هذه الأسعار لا تخضع للتنظيم النقدي الرسمي. وتنتشر نقاط الصرف هذه عادة ضمن محال المواد الغذائية، وبيع الملابس، ومحلات الهواتف، والمطاعم في مختلف أنحاء الجزائر.</p>
            
            <p style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 8px; text-align: center; color: #000; font-weight: bold;">
                Change Dinar – رفيقك الموثوق لمعرفة أسعار الصرف في السوق الموازية الجزائرية.
            </p>
            
            <p style="margin-top: 20px; text-align: center; color: var(--text-secondary);">
                <strong>الإصدار:</strong> 1.0.0<br>
                <strong>تاريخ الإصدار:</strong> فبراير 2026
            </p>
        `;
    } else if (currentLanguage === 'fr') {
        modalBody.innerHTML = `
            <h2>À propos de l'application</h2>
            <p><strong>Change Dinar</strong> est une application mobile dédiée qui collecte et fournit des informations précises sur les taux de change des devises étrangères telles que l'euro, le dollar américain et le dollar canadien par rapport au dinar algérien sur le marché parallèle à travers plusieurs points dans la capitale algérienne.</p>
            
            <p>Le cas algérien se distingue par un système de change unique, où il est difficile d'obtenir des devises étrangères via les canaux bancaires officiels en l'absence de bureaux de change agréés, ce qui a conduit à une large diffusion du marché de change parallèle. La place Port-Saïd est considérée comme le cœur battant de ce marché, aux côtés de nombreux points informels connus des citoyens.</p>
            
            <p>L'application offre un service pratique pour suivre les taux de change en temps réel, notant que ces prix ne sont pas soumis à la réglementation monétaire officielle. Ces points de change se trouvent généralement dans les épiceries, les magasins de vêtements, les boutiques de téléphones et les restaurants à travers l'Algérie.</p>
            
            <p style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 8px; text-align: center; color: #000; font-weight: bold;">
                Change Dinar – Votre compagnon de confiance pour connaître les taux de change sur le marché parallèle algérien.
            </p>
            
            <p style="margin-top: 20px; text-align: center; color: var(--text-secondary);">
                <strong>Version:</strong> 1.0.0<br>
                <strong>Date de sortie:</strong> Février 2026
            </p>
        `;
    } else {
        modalBody.innerHTML = `
            <h2>About the App</h2>
            <p><strong>Change Dinar</strong> is a dedicated mobile application that collects and provides accurate information about foreign currency exchange rates such as the Euro, US Dollar, and Canadian Dollar against the Algerian Dinar in the parallel market across several points in the Algerian capital.</p>
            
            <p>The Algerian case is characterized by a unique exchange system, where it is difficult to obtain foreign currencies through official banking channels in the absence of licensed exchange offices, leading to the widespread prevalence of the parallel exchange market. Port Said Square is considered the beating heart of this market, alongside many informal points known to citizens.</p>
            
            <p>The application provides a convenient service for tracking exchange rates in real-time, noting that these prices are not subject to official monetary regulation. These exchange points are usually spread within grocery stores, clothing shops, phone stores, and restaurants throughout Algeria.</p>
            
            <p style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 8px; text-align: center; color: #000; font-weight: bold;">
                Change Dinar – Your trusted companion for knowing exchange rates in the Algerian parallel market.
            </p>
            
            <p style="margin-top: 20px; text-align: center; color: var(--text-secondary);">
                <strong>Version:</strong> 1.0.0<br>
                <strong>Release Date:</strong> February 2026
            </p>
        `;
    }
    
    showModal();
    toggleMenu();
}

// Show contact modal
function showContact() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>تواصل معنا</h2>
        <p>نحن سعداء بتواصلك معنا. يمكنك التواصل معنا عبر البريد الإلكتروني:</p>
        
        <div style="margin-top: 30px; text-align: center;">
            <div style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: #000; margin-bottom: 15px; font-size: 20px;">📧 البريد الإلكتروني</h3>
                <a href="mailto:jamalkatabeuro@gmail.com" style="color: #000; font-size: 18px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 24px; background: rgba(0, 0, 0, 0.1); border-radius: 8px; transition: all 0.3s;">
                    jamalkatabeuro@gmail.com
                </a>
            </div>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: var(--card-bg); border-radius: 8px; border: 2px solid var(--primary-color);">
            <h3 style="color: var(--primary-color); margin-bottom: 15px; text-align: center;">💬 كيف يمكننا مساعدتك؟</h3>
            <ul style="line-height: 2.2; margin-right: 20px; color: var(--text-color);">
                <li>الاستفسارات العامة</li>
                <li>الإبلاغ عن مشكلة تقنية</li>
                <li>اقتراحات لتحسين التطبيق</li>
                <li>طلبات إضافة عملات جديدة</li>
                <li>أسئلة حول دقة الأسعار</li>
            </ul>
        </div>
        
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color); text-align: center; color: var(--text-secondary);">
            نحن نقدر ملاحظاتك واقتراحاتك لتحسين خدماتنا!<br>
            <strong>سنرد على رسائلك في أقرب وقت ممكن</strong>
        </p>
    `;
    showModal();
    toggleMenu();
}

// Show modal
function showModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});

// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update page direction
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    updateUILanguage();
    renderCurrencies();
}

// Load language
function loadLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'ar';
    currentLanguage = savedLanguage;
    
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
    
    document.documentElement.setAttribute('lang', savedLanguage);
    document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
}

// Update UI language
function updateUILanguage() {
    const t = translations[currentLanguage];
    
    // Update logo
    document.querySelector('.logo').textContent = t.appName;
    
    // Update menu header
    const menuHeader = document.querySelector('.menu-header h2');
    if (menuHeader) menuHeader.textContent = t.settings;
    
    // Update tabs
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs[0]) tabs[0].textContent = t.parallelMarket;
    if (tabs[1]) tabs[1].textContent = t.officialMarket;
    
    // Update last update text
    const lastUpdateDiv = document.querySelector('.last-update');
    const dateSpan = document.getElementById('lastUpdate');
    if (lastUpdateDiv && dateSpan) {
        lastUpdateDiv.innerHTML = `${t.lastUpdate} <span id="lastUpdate">${dateSpan.textContent}</span>`;
    }
    
    // Update alert card
    const alertCard = document.querySelector('.alert-card');
    if (alertCard) {
        alertCard.innerHTML = `<strong>${t.alert.split(':')[0]}:</strong> ${t.alert.split(':')[1]}`;
    }
    
    // Update footer note
    const footerNote = document.querySelector('.footer-note');
    if (footerNote) {
        footerNote.textContent = t.footerNote;
    }
    
    // Update menu items using IDs for reliability
    const aboutLink = document.getElementById('aboutLink');
    if (aboutLink) aboutLink.textContent = t.about;
    
    // Privacy link - always keep as "سياسة الخصوصية" regardless of language
    const privacyLink = document.getElementById('privacyLink');
    if (privacyLink) {
        privacyLink.textContent = 'سياسة الخصوصية';
    }
    
    // Contact link
    const contactLink = document.getElementById('contactLink');
    if (contactLink) contactLink.textContent = t.contact;
    
    // Share app link
    const shareAppLink = document.getElementById('shareAppLink');
    if (shareAppLink) {
        shareAppLink.textContent = t.shareApp;
    }
    
    // Update theme toggle label
    const themeLabel = document.querySelector('.theme-toggle span');
    if (themeLabel) themeLabel.textContent = t.darkMode;
}
