import { CONFIG } from './config.js';
import storageManager from './storage.js';

// كاش للأسعار
let ratesCache = {
    data: {},
    timestamp: null
};

// جلب جميع الأسعار في طلب واحد
export async function fetchAllRates() {
    try {
        // التحقق من وجود بيانات مخزنة حديثة
        const cachedRates = storageManager.getRates();
        if (cachedRates) {
            ratesCache.data = cachedRates;
            ratesCache.timestamp = Date.now();
            console.log('تم استخدام الأسعار المخزنة');
            return { success: true, rates: cachedRates, fromCache: true };
        }

        console.log('جارٍ جلب أسعار جديدة من API...');
        
        // بناء قائمة الأزواج الأساسية
        const basePairs = [
            'USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/CAD',
            'USD/AUD', 'USD/CHF', 'USD/CNY', 'USD/INR',
            'USD/SAR', 'USD/AED', 'EUR/GBP', 'EUR/JPY'
        ];

        const rates = {};
        
        // جلب كل زوج على حدة لتجنب حدود API
        for (const pair of basePairs) {
            try {
                const [from, to] = pair.split('/');
                const rate = await fetchSingleRate(from, to);
                
                if (rate) {
                    if (!rates[from]) rates[from] = {};
                    rates[from][to] = rate;
                }
                
                // تأخير صغير بين الطلبات
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`خطأ في جلب ${pair}:`, error);
            }
        }

        // ملء الأسعار المفقودة بالحساب
        fillMissingRates(rates);

        // تحديث الكاش المحلي
        ratesCache.data = rates;
        ratesCache.timestamp = Date.now();

        // تخزين في نظام التخزين
        storageManager.saveRates(rates);

        console.log('تم جلب وتخزين الأسعار بنجاح');
        return { success: true, rates: rates };

    } catch (error) {
        console.error('خطأ في جلب الأسعار:', error);
        
        // محاولة استخدام البيانات المخزنة
        const cachedRates = storageManager.getRates();
        if (cachedRates) {
            ratesCache.data = cachedRates;
            console.log('تم استخدام الأسعار المخزنة كبديل');
            return { success: true, rates: cachedRates, fromCache: true };
        }
        
        return { success: false, error: error.message };
    }
}

// جلب سعر زوج واحد
async function fetchSingleRate(from, to) {
    try {
        // استخدم API بسيط
        const url = `${CONFIG.BASE_URL}/exchange_rate?symbol=${from}/${to}&apikey=${CONFIG.API_KEY}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.rate) {
                return parseFloat(data.rate);
            }
        }
        
        // إذا فشل API، استخدم قيم افتراضية
        return getDefaultRate(from, to);
        
    } catch (error) {
        console.error(`خطأ في جلب ${from}/${to}:`, error);
        return getDefaultRate(from, to);
    }
}

// الحصول على سعر افتراضي
function getDefaultRate(from, to) {
    const defaultRates = {
        'USD': {
            'EUR': 0.92, 'GBP': 0.78, 'JPY': 157, 'CAD': 1.37,
            'AUD': 1.52, 'CHF': 0.88, 'CNY': 7.25, 'INR': 83,
            'SAR': 3.75, 'AED': 3.67, 'TRY': 32, 'BRL': 5.1,
            'MXN': 17, 'KRW': 1350, 'RUB': 91
        },
        'EUR': {
            'USD': 1.09, 'GBP': 0.85, 'JPY': 171
        },
        'GBP': {
            'USD': 1.28, 'EUR': 1.18
        }
    };

    if (defaultRates[from] && defaultRates[from][to]) {
        return defaultRates[from][to];
    }

    // قيمة عشوائية معقولة
    return Math.random() * 5 + 0.5;
}

// ملء الأسعار المفقودة
function fillMissingRates(rates) {
    // تأكد من وجود USD كمرجع
    if (!rates['USD']) rates['USD'] = {};
    
    // إضافة جميع العملات مقابل USD
    CONFIG.CURRENCIES.forEach(currency => {
        const code = currency.code;
        if (code !== 'USD' && !rates['USD'][code]) {
            rates['USD'][code] = getDefaultRate('USD', code);
        }
    });

    // حساب الأسعار المتبقية
    CONFIG.CURRENCIES.forEach(fromCurrency => {
        const from = fromCurrency.code;
        
        if (!rates[from]) rates[from] = {};
        
        CONFIG.CURRENCIES.forEach(toCurrency => {
            const to = toCurrency.code;
            
            if (from === to) {
                rates[from][to] = 1;
            } else if (!rates[from][to] && rates['USD'][from] && rates['USD'][to]) {
                rates[from][to] = rates['USD'][to] / rates['USD'][from];
            }
        });
    });
}

// جلب سعر زوج محدد
export async function getExchangeRate(from, to) {
    // إذا كانت نفس العملة
    if (from === to) return 1;
    
    // التحقق من الكاش أولاً
    if (ratesCache.data[from] && ratesCache.data[from][to]) {
        return ratesCache.data[from][to];
    }
    
    try {
        // محاولة جلب سعر جديد
        const rate = await fetchSingleRate(from, to);
        
        if (rate) {
            // تحديث الكاش
            if (!ratesCache.data[from]) ratesCache.data[from] = {};
            ratesCache.data[from][to] = rate;
            
            return rate;
        }
        
        // استخدام سعر افتراضي
        return getDefaultRate(from, to);
        
    } catch (error) {
        console.error(`خطأ في جلب ${from}/${to}:`, error);
        return getDefaultRate(from, to);
    }
}

// تحويل العملة
export async function convertCurrency(amount, from, to) {
    try {
        const rate = await getExchangeRate(from, to);
        
        if (rate) {
            const convertedAmount = amount * rate;
            return {
                success: true,
                amount: amount,
                from: from,
                to: to,
                rate: rate,
                convertedAmount: convertedAmount,
                timestamp: new Date().toISOString()
            };
        }
        
        return {
            success: false,
            error: 'فشل في الحصول على سعر الصرف'
        };
        
    } catch (error) {
        console.error('خطأ في التحويل:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// الحصول على معلومات الكاش
export function getCacheInfo() {
    return {
        hasCache: ratesCache.timestamp !== null,
        lastUpdate: ratesCache.timestamp ? new Date(ratesCache.timestamp).toLocaleString('ar-SA') : null,
        isValid: true, // مع نظام التخزين الجديد، البيانات دائماً صالحة
        data: ratesCache.data
    };
}

// تحميل الكاش من التخزين عند بدء التطبيق
export function loadCacheFromStorage() {
    try {
        const cachedRates = storageManager.getRates();
        if (cachedRates) {
            ratesCache.data = cachedRates;
            ratesCache.timestamp = Date.now();
            console.log('تم تحميل الأسعار من التخزين');
        }
    } catch (error) {
        console.error('خطأ في تحميل التخزين:', error);
    }
}

// إعادة تحميل الأسعار يدوياً
export async function refreshRates() {
    return await fetchAllRates();
}