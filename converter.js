import { CONFIG } from './config.js';
import storageManager from './storage.js';

// كاش للأسعار
let ratesCache = {
    data: {},
    timestamp: null
};

// جلب جميع الأسعار
export async function fetchAllRates() {
    try {
        console.log('جارٍ جلب الأسعار...');
        
        // استخدام البيانات المخزنة مؤقتاً
        const cachedRates = storageManager.getRates();
        if (cachedRates) {
            ratesCache.data = cachedRates;
            ratesCache.timestamp = Date.now();
            console.log('تم استخدام الأسعار المخزنة');
            return { success: true, rates: cachedRates };
        }
        
        // جلب أسعار جديدة
        const rates = {};
        
        for (const pair of CONFIG.DEFAULT_FAVORITE_PAIRS) {
            try {
                const rate = await fetchRealRate(pair.from, pair.to);
                if (rate) {
                    if (!rates[pair.from]) rates[pair.from] = {};
                    rates[pair.from][pair.to] = rate;
                }
            } catch (error) {
                console.error(`خطأ في جلب ${pair.from}/${pair.to}:`, error);
            }
        }
        
        // تخزين الأسعار
        ratesCache.data = rates;
        ratesCache.timestamp = Date.now();
        storageManager.saveRates(rates);
        
        console.log('تم جلب الأسعار بنجاح');
        return { success: true, rates: rates };
        
    } catch (error) {
        console.error('خطأ في جلب الأسعار:', error);
        return { success: false, error: error.message };
    }
}

// جلب سعر حقيقي
async function fetchRealRate(from, to) {
    try {
        // استخدم API
        const url = `${CONFIG.BASE_URL}/exchange_rate?symbol=${from}/${to}&apikey=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.rate) {
                return parseFloat(data.rate);
            }
        }
    } catch (error) {
        console.error(`خطأ في API لـ ${from}/${to}:`, error);
    }
    
    // استخدام سعر افتراضي
    return getDefaultRate(from, to);
}

// الحصول على سعر افتراضي
function getDefaultRate(from, to) {
    const defaultRates = {
        'USD': { 'SAR': 3.75, 'EUR': 0.92, 'GBP': 0.78, 'JPY': 157 },
        'EUR': { 'USD': 1.09, 'GBP': 0.85 },
        'GBP': { 'USD': 1.28, 'EUR': 1.18 }
    };
    
    if (defaultRates[from] && defaultRates[from][to]) {
        return defaultRates[from][to];
    }
    
    // قيمة معقولة
    return 1.0;
}

// جلب سعر زوج محدد
export async function getExchangeRate(from, to) {
    if (from === to) return 1;
    
    // التحقق من الكاش
    if (ratesCache.data[from] && ratesCache.data[from][to]) {
        return ratesCache.data[from][to];
    }
    
    try {
        const rate = await fetchRealRate(from, to);
        
        if (rate) {
            if (!ratesCache.data[from]) ratesCache.data[from] = {};
            ratesCache.data[from][to] = rate;
            return rate;
        }
        
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
                convertedAmount: convertedAmount
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

// جلب بيانات الـ Chart
export async function fetchChartData(from, to) {
    // بيانات افتراضية
    const randomChange = (Math.random() - 0.5) * 2;
    const isUp = randomChange >= 0;
    
    return {
        success: true,
        changePercent: Math.abs(randomChange).toFixed(2),
        direction: isUp ? 'up' : 'down',
        html: `
            <div class="chart-container">
                <svg class="mini-chart" viewBox="0 0 80 40">
                    <path d="M10,30 L20,20 L30,25 L40,15 L50,20 L60,10 L70,15" 
                          fill="none" 
                          stroke="${isUp ? '#34c759' : '#ff3b30'}" 
                          stroke-width="2"/>
                </svg>
                <div class="${isUp ? 'chart-up' : 'chart-down'}">
                    ${isUp ? '↗' : '↘'} ${Math.abs(randomChange).toFixed(2)}%
                </div>
            </div>
        `
    };
}

// تحميل الكاش من التخزين
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
