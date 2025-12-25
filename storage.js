// نظام تخزين محسن للأسعار والصور
class StorageManager {
    constructor() {
        this.cacheDuration = 30 * 60 * 1000; // 30 دقيقة
        this.imageCache = new Map();
        this.init();
    }

    init() {
        // تحميل ذاكرة الصور من localStorage
        this.loadImageCache();
        console.log('تم تهيئة مدير التخزين');
    }

    // تخزين الأسعار
    saveRates(ratesData) {
        try {
            const storageData = {
                data: ratesData,
                timestamp: Date.now(),
                expiresAt: Date.now() + this.cacheDuration
            };
            
            localStorage.setItem('currency_rates', JSON.stringify(storageData));
            console.log('تم حفظ الأسعار في التخزين المحلي');
            return true;
        } catch (error) {
            console.error('خطأ في حفظ الأسعار:', error);
            return false;
        }
    }

    // استرجاع الأسعار
    getRates() {
        try {
            const stored = localStorage.getItem('currency_rates');
            if (!stored) return null;

            const data = JSON.parse(stored);
            
            // التحقق من صلاحية البيانات
            if (Date.now() > data.expiresAt) {
                console.log('البيانات منتهية الصلاحية');
                return null;
            }
            
            return data.data;
        } catch (error) {
            console.error('خطأ في استرجاع الأسعار:', error);
            return null;
        }
    }

    // التحقق من وجود بيانات حديثة
    hasFreshRates() {
        const stored = this.getRates();
        return stored !== null;
    }

    // تخزين الصور في ذاكرة التخزين
    async cacheImage(url, code) {
        return new Promise((resolve, reject) => {
            // التحقق إذا كانت الصورة مخزنة مسبقاً
            if (this.imageCache.has(code)) {
                resolve(this.imageCache.get(code));
                return;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                // حفظ الصورة في ذاكرة التخزين
                this.imageCache.set(code, url);
                this.saveImageToLocalStorage(code, url);
                resolve(url);
            };
            
            img.onerror = () => {
                console.warn(`فشل تحميل صورة العملة: ${code}`);
                // استخدام صورة افتراضية
                const fallbackUrl = 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/101-currency-usd.png';
                this.imageCache.set(code, fallbackUrl);
                resolve(fallbackUrl);
            };
            
            img.src = url;
        });
    }

    // حفظ الصورة في localStorage
    saveImageToLocalStorage(code, url) {
        try {
            const imageCache = this.getImageCache();
            imageCache[code] = {
                url: url,
                timestamp: Date.now()
            };
            
            localStorage.setItem('currency_images', JSON.stringify(imageCache));
        } catch (error) {
            console.error('خطأ في حفظ صورة:', error);
        }
    }

    // استرجاع ذاكرة الصور
    getImageCache() {
        try {
            const cache = localStorage.getItem('currency_images');
            return cache ? JSON.parse(cache) : {};
        } catch (error) {
            return {};
        }
    }

    // تحميل ذاكرة الصور عند بدء التطبيق
    loadImageCache() {
        const cache = this.getImageCache();
        Object.keys(cache).forEach(code => {
            this.imageCache.set(code, cache[code].url);
        });
    }

    // الحصول على صورة العملة
    getCurrencyImage(code) {
        if (this.imageCache.has(code)) {
            return this.imageCache.get(code);
        }
        
        // إذا لم تكن موجودة في الذاكرة
        const fallbackUrl = 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/101-currency-usd.png';
        return fallbackUrl;
    }

    // مسح البيانات القديمة
    clearOldData() {
        try {
            const imageCache = this.getImageCache();
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            Object.keys(imageCache).forEach(code => {
                if (imageCache[code].timestamp < oneWeekAgo) {
                    delete imageCache[code];
                    this.imageCache.delete(code);
                }
            });
            
            localStorage.setItem('currency_images', JSON.stringify(imageCache));
        } catch (error) {
            console.error('خطأ في مسح البيانات القديمة:', error);
        }
    }

    // الحصول على وقت آخر تحديث
    getLastUpdateTime() {
        try {
            const stored = localStorage.getItem('currency_rates');
            if (!stored) return null;

            const data = JSON.parse(stored);
            return new Date(data.timestamp);
        } catch (error) {
            return null;
        }
    }
}

// إنشاء نسخة عامة
const storageManager = new StorageManager();
export default storageManager;
