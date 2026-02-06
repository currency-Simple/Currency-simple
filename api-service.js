// ============================================
// API Service for TwelveData
// ============================================

class APIService {
    constructor() {
        this.apiKey = 'b83fce53976843bbb59336c03f9a6a30';
        this.baseURL = 'https://api.twelvedata.com';
        
        // استرجاع الكاش من localStorage
        const savedCache = localStorage.getItem('goldPriceCache');
        const savedTimestamp = localStorage.getItem('goldPriceCacheTimestamp');
        
        this.cache = {
            data: savedCache ? JSON.parse(savedCache) : null,
            timestamp: savedTimestamp ? parseInt(savedTimestamp) : null
        };
        
        // مدة صلاحية الكاش: 7.5 دقيقة
        this.cacheExpiry = 7.5 * 60 * 1000; // 7.5 minutes in milliseconds
    }

    /**
     * التحقق من صلاحية الكاش
     */
    isCacheValid() {
        if (!this.cache.data || !this.cache.timestamp) {
            return false;
        }
        const now = Date.now();
        return (now - this.cache.timestamp) < this.cacheExpiry;
    }

    /**
     * جلب سعر معدن واحد
     */
    async fetchMetalPrice(symbol) {
        try {
            const url = `${this.baseURL}/price?symbol=${symbol}&apikey=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            throw error;
        }
    }

    /**
     * جلب معلومات تفصيلية عن معدن (بما في ذلك السعر السابق للمقارنة)
     */
    async fetchMetalQuote(symbol) {
        try {
            const url = `${this.baseURL}/quote?symbol=${symbol}&apikey=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            throw error;
        }
    }

    /**
     * جلب أسعار الذهب فقط
     */
    async fetchAllMetals() {
        // التحقق من الكاش أولاً
        if (this.isCacheValid()) {
            console.log('Using cached data from localStorage');
            return this.cache.data;
        }

        try {
            console.log('Fetching fresh data from API...');
            // جلب الذهب فقط
            const goldData = await this.fetchMetalQuote('XAU/USD');
            
            const metalsData = {
                gold: this.parseMetalData(goldData, 'GOLD', '🥇')
            };

            // حفظ في الكاش والـ localStorage
            this.cache.data = metalsData;
            this.cache.timestamp = Date.now();
            
            localStorage.setItem('goldPriceCache', JSON.stringify(metalsData));
            localStorage.setItem('goldPriceCacheTimestamp', this.cache.timestamp.toString());

            return metalsData;
        } catch (error) {
            console.error('Error fetching gold price:', error);
            // في حالة الخطأ، نعيد الكاش إن وجد
            if (this.cache.data) {
                console.log('Returning stale cache due to error');
                return this.cache.data;
            }
            throw error;
        }
    }

    /**
     * تحليل بيانات المعدن
     */
    parseMetalData(data, name, icon) {
        if (!data || data.code === 400) {
            return {
                name: name,
                icon: icon,
                price: 0,
                change: 0,
                changePercent: 0,
                high: 0,
                low: 0,
                open: 0,
                previousClose: 0,
                timestamp: new Date().toISOString()
            };
        }

        const price = parseFloat(data.close) || 0;
        const previousClose = parseFloat(data.previous_close) || price;
        const change = price - previousClose;
        const changePercent = previousClose !== 0 ? ((change / previousClose) * 100) : 0;

        return {
            name: name,
            icon: icon,
            symbol: data.symbol,
            price: price,
            change: change,
            changePercent: changePercent,
            high: parseFloat(data.high) || 0,
            low: parseFloat(data.low) || 0,
            open: parseFloat(data.open) || 0,
            previousClose: previousClose,
            volume: data.volume || 0,
            timestamp: data.datetime || new Date().toISOString()
        };
    }

    /**
     * حساب عيارات الذهب بناءً على سعر الأونصة (24، 21، 18 فقط)
     */
    calculateGoldKarats(goldPricePerOunce) {
        // 1 أونصة = 31.1035 جرام
        const gramsPerOunce = 31.1035;
        const pricePerGram = goldPricePerOunce / gramsPerOunce;

        return {
            karat24: {
                name: 'عيار 24',
                purity: 0.999,
                price: pricePerGram * 0.999,
                icon: '🥇'
            },
            karat21: {
                name: 'عيار 21',
                purity: 0.875,
                price: pricePerGram * 0.875,
                icon: '🏅'
            },
            karat18: {
                name: 'عيار 18',
                purity: 0.750,
                price: pricePerGram * 0.750,
                icon: '⭐'
            }
        };
    }

    /**
     * الحصول على الوقت المتبقي حتى التحديث التالي
     */
    getTimeUntilNextUpdate() {
        if (!this.cache.timestamp) {
            return 0;
        }
        const elapsed = Date.now() - this.cache.timestamp;
        const remaining = this.cacheExpiry - elapsed;
        return Math.max(0, remaining);
    }

    /**
     * مسح الكاش
     */
    clearCache() {
        this.cache.data = null;
        this.cache.timestamp = null;
        localStorage.removeItem('goldPriceCache');
        localStorage.removeItem('goldPriceCacheTimestamp');
    }

    /**
     * إجبار التحديث
     */
    async forceUpdate() {
        this.clearCache();
        return await this.fetchAllMetals();
    }
}

// تصدير instance واحد من الخدمة
const apiService = new APIService();
