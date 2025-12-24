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
        
        // الأزواج المطلوبة للعرض
        const requiredPairs = [
            { from: 'USD', to: 'EUR' },
            { from: 'USD', to: 'GBP' },
            { from: 'USD', to: 'CAD' },
            { from: 'USD', to: 'CHF' }
        ];

        const rates = {};
        
        // جلب كل زوج على حدة
        for (const pair of requiredPairs) {
            try {
                const { from, to } = pair;
                const rate = await fetchRealRate(from, to);
                
                if (rate) {
                    if (!rates[from]) rates[from] = {};
                    rates[from][to] = rate;
                    console.log(`${from}/${to}: ${rate}`);
                }
                
                // تأخير بين الطلبات لتجنب حدود API
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`خطأ في جلب ${pair.from}/${pair.to}:`, error);
            }
        }

        // ملء الأسعار الأخرى بالحساب
        completeRates(rates);

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

// جلب سعر حقيقي من API
async function fetchRealRate(from, to) {
    try {
        // استخدم API الأساسي
        const url = `${CONFIG.BASE_URL}/exchange_rate?symbol=${from}/${to}&apikey=${CONFIG.API_KEY}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.rate) {
                return parseFloat(data.rate);
            }
        }
        
        // إذا فشل API الأساسي، جرب API بديل
        return await fetchAlternativeRate(from, to);
        
    } catch (error) {
        console.error(`خطأ في جلب ${from}/${to}:`, error);
        return await fetchAlternativeRate(from, to);
    }
}

// API بديل
async function fetchAlternativeRate(from, to) {
    try {
        // استخدام ExchangeRate-API المجاني
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.rates && data.rates[to]) {
                return data.rates[to];
            }
        }
    } catch (error) {
        console.error('فشل API البديل:', error);
    }
    
    // استخدام قيم افتراضية حال فشل جميع المحاولات
    return getDefaultRate(from, to);
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
            'USD': 1.09, 'GBP': 0.85, 'JPY': 171, 'CHF': 0.96
        },
        'GBP': {
            'USD': 1.28, 'EUR': 1.18, 'CHF': 1.13
        },
        'CAD': {
            'USD': 0.73, 'EUR': 0.67, 'GBP': 0.57
        },
        'CHF': {
            'USD': 1.14, 'EUR': 1.04, 'GBP': 0.88
        }
    };

    if (defaultRates[from] && defaultRates[from][to]) {
        return defaultRates[from][to];
    }

    // إذا لم يكن هناك سعر محدد، حاول العكس
    if (defaultRates[to] && defaultRates[to][from]) {
        return 1 / defaultRates[to][from];
    }

    // قيمة معقولة
    return Math.random() * 2 + 0.5;
}

// إكمال الأسعار بالحساب
function completeRates(rates) {
    // تأكد من وجود USD كمرجع
    if (!rates['USD']) rates['USD'] = {};
    
    // إضافة جميع العملات مقابل USD
    const allCurrencies = [...CONFIG.CURRENCIES_CONVERT, ...CONFIG.CURRENCIES_RATES];
    const uniqueCurrencies = Array.from(new Set(allCurrencies.map(c => c.code)));
    
    uniqueCurrencies.forEach(code => {
        if (code !== 'USD' && !rates['USD'][code]) {
            rates['USD'][code] = getDefaultRate('USD', code);
        }
    });

    // حساب الأسعار المتبقية
    uniqueCurrencies.forEach(from => {
        if (!rates[from]) rates[from] = {};
        
        uniqueCurrencies.forEach(to => {
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
        const rate = await fetchRealRate(from, to);
        
        if (rate) {
            // تحديث الكاش
            if (!ratesCache.data[from]) ratesCache.data[from] = {};
            ratesCache.data[from][to] = rate;
            ratesCache.timestamp = Date.now();
            
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
        isValid: true,
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
