// إعدادات API
export const CONFIG = {
    API_KEY: 'b83fce53976843bbb59336c03f9a6a30',
    BASE_URL: 'https://api.twelvedata.com',
    UPDATE_INTERVAL: 30 * 60 * 1000, // 30 دقيقة
    
    // العملات المدعومة لصفحة المحول (بدون x)
    CURRENCIES_CONVERT: [
        { code: 'USD', name: 'US Dollar', symbol: '$', icon: '101-currency-usd.png' },
        { code: 'EUR', name: 'Euro', symbol: '€', icon: '100-currency-eur.png' },
        { code: 'GBP', name: 'British Pound', symbol: '£', icon: '102-currency-gbp.png' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', icon: '113-currency-jpy.png' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', icon: '121-currency-sar.png' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', icon: '123-currency-aed.png' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', icon: '104-currency-cad.png' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', icon: '105-currency-aud.png' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', icon: '103-currency-chf.png' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', icon: '107-currency-cny.png' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', icon: '115-currency-inr.png' }
    ],
    
    // العملات المدعومة لصفحة الأسعار (بـ x)
    CURRENCIES_RATES: [
        { code: 'USD', name: 'US Dollar', icon: '101-currency-usdx.png' },
        { code: 'EUR', name: 'Euro', icon: '100-currency-eurx.png' },
        { code: 'GBP', name: 'British Pound', icon: '102-currency-gbpx.png' },
        { code: 'JPY', name: 'Japanese Yen', icon: '105-currency-jpyx.png' },
        { code: 'SAR', name: 'Saudi Riyal', icon: '116-currency-sarx.png' },
        { code: 'AED', name: 'UAE Dirham', icon: '118-currency-aed.png' },
        { code: 'CAD', name: 'Canadian Dollar', icon: '101-currency-cadx.png' },
        { code: 'AUD', name: 'Australian Dollar', icon: '104-currency-audx.png' },
        { code: 'CHF', name: 'Swiss Franc', icon: '103-currency-chfx.png' },
        { code: 'TRY', name: 'Turkish Lira', icon: '109-currency-tryx.png' },
        { code: 'CNY', name: 'Chinese Yuan', icon: '110-currency-cnyx.png' },
        { code: 'BRL', name: 'Brazilian Real', icon: '107-currency-brlx.png' },
        { code: 'MXN', name: 'Mexican Peso', icon: '108-currency-mxnx.png' },
        { code: 'KRW', name: 'South Korean Won', icon: '106-currency-krwx.png' },
        { code: 'INR', name: 'Indian Rupee', icon: '115-currency-inr.png' },
        { code: 'RUB', name: 'Russian Ruble', icon: '112-currency-rubx.png' },
        { code: 'MYR', name: 'Malaysian Ringgit', icon: '111-currency-myrx.png' },
        { code: 'MAD', name: 'Moroccan Dirham', icon: '113-currency-madx.png' },
        { code: 'EGP', name: 'Egyptian Pound', icon: '114-currency-egbx.png' },
        { code: 'TND', name: 'Tunisian Dinar', icon: '115-currency-tndx.png' },
        { code: 'QAR', name: 'Qatari Riyal', icon: '117-currency-qarx.png' }
    ],
    
    // أزواج العملات المفضلة الافتراضية
    DEFAULT_FAVORITE_PAIRS: [
        { from: 'USD', to: 'GBP' },
        { from: 'USD', to: 'CAD' },
        { from: 'USD', to: 'CHF' },
        { from: 'CHF', to: 'USD' },
        { from: 'USD', to: 'EUR' }
    ]
};

// الحصول على معلومات عملة للمحول
export function getCurrencyInfoConvert(code) {
    return CONFIG.CURRENCIES_CONVERT.find(c => c.code === code);
}

// الحصول على معلومات عملة للأسعار
export function getCurrencyInfoRates(code) {
    return CONFIG.CURRENCIES_RATES.find(c => c.code === code);
}

// الحصول على صورة العملة للمحول
export function getCurrencyIconConvert(code) {
    const info = getCurrencyInfoConvert(code);
    return `https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/${info?.icon || '101-currency-usd.png'}`;
}

// الحصول على صورة العملة للأسعار (بـ x)
export function getCurrencyIconRates(code) {
    const info = getCurrencyInfoRates(code);
    if (info && info.icon) {
        return `https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/${info.icon}`;
    }
    
    // إذا لم توجد صورة x، استخدم الصورة العادية
    const convertInfo = getCurrencyInfoConvert(code);
    return `https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/${convertInfo?.icon || '101-currency-usd.png'}`;
}
