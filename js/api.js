// API Configuration
const API_KEY = 'b83fce53976843bbb59336c03f9a6a30';
const API_BASE_URL = 'https://api.twelvedata.com';

// Cache for exchange rates
let exchangeRatesCache = {};
let lastFetchTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// All currency codes
const ALL_CURRENCIES = Object.keys(CURRENCY_DATA);

// Fetch all exchange rates with improved error handling
async function fetchAllExchangeRates() {
    const now = Date.now();
    
    // Return valid cache
    if (lastFetchTime && (now - lastFetchTime < CACHE_DURATION) && Object.keys(exchangeRatesCache).length > 40) {
        console.log('✅ Using cached rates. Next update in:', Math.round((CACHE_DURATION - (now - lastFetchTime)) / 60000), 'min');
        return exchangeRatesCache;
    }

    console.log('🔄 Fetching exchange rates...');

    try {
        // Use a reliable free API for real-time rates
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        if (data && data.rates) {
            console.log('✅ Received rates from API');
            
            // Convert to our format
            const rates = {};
            
            // For each currency, calculate rate to USD
            Object.keys(data.rates).forEach(currency => {
                if (CURRENCY_DATA[currency]) {
                    const rate = data.rates[currency];
                    // Store as currency/USD
                    rates[`${currency}/USD`] = {
                        price: 1 / rate, // Inverse because API gives USD to currency
                        timestamp: now
                    };
                }
            });
            
            // Add USD/USD
            rates['USD/USD'] = { price: 1, timestamp: now };
            
            exchangeRatesCache = rates;
            lastFetchTime = now;
            
            console.log(`✅ Cached ${Object.keys(rates).length} exchange rates`);
            return exchangeRatesCache;
        }
        
        throw new Error('Invalid API response');
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        
        // If we have old cache, use it
        if (Object.keys(exchangeRatesCache).length > 0) {
            console.log('⚠️ Using old cache');
            return exchangeRatesCache;
        }
        
        // Generate mock data as last resort
        console.log('⚠️ Using mock data');
        const mockData = generateMockData();
        exchangeRatesCache = mockData;
        lastFetchTime = now;
        return mockData;
    }
}

// Generate realistic mock data
function generateMockData() {
    console.log('📊 Generating mock rates...');
    const mockRates = {};
    
    const baseRates = {
        'EUR': 1.08, 'GBP': 1.27, 'JPY': 0.0067, 'CAD': 0.73, 'AUD': 0.65,
        'CHF': 1.13, 'CNY': 0.14, 'INR': 0.012, 'BRL': 0.20, 'MXN': 0.058,
        'TRY': 0.032, 'RUB': 0.011, 'ZAR': 0.055, 'KRW': 0.00075, 'MYR': 0.22,
        'HKD': 0.13, 'DKK': 0.14, 'NOK': 0.093, 'SEK': 0.096, 'PLN': 0.25,
        'THB': 0.029, 'SGD': 0.75, 'NZD': 0.60, 'MAD': 0.10, 'EGP': 0.020,
        'SAR': 0.27, 'AED': 0.27, 'QAR': 0.27, 'IDR': 0.000064, 'PHP': 0.018,
        'VND': 0.000040, 'PKR': 0.0036, 'ARS': 0.0010, 'CLP': 0.0010,
        'COP': 0.00025, 'KWD': 3.25, 'BHD': 2.65, 'OMR': 2.60, 'DZD': 0.0074,
        'BWP': 0.073, 'CZK': 0.044, 'DOP': 0.017, 'ETB': 0.0092, 'HNL': 0.040,
        'HUF': 0.0028, 'ISK': 0.0072, 'KMF': 0.0022, 'LBP': 0.000011,
        'MDL': 0.055, 'RON': 0.22, 'RSD': 0.0093, 'UAH': 0.026, 'KZT': 0.0021,
        'AZN': 0.59, 'BDT': 0.0091
    };
    
    ALL_CURRENCIES.forEach(currency => {
        if (currency !== 'USD') {
            const symbol = `${currency}/USD`;
            let rate = baseRates[currency] || (Math.random() * 2 + 0.1);
            rate = rate * (1 + (Math.random() - 0.5) * 0.02); // ±1% variation
            
            mockRates[symbol] = {
                price: rate,
                timestamp: Date.now()
            };
        }
    });
    
    mockRates['USD/USD'] = { price: 1, timestamp: Date.now() };
    
    console.log(`✅ Generated ${Object.keys(mockRates).length} mock rates`);
    return mockRates;
}

// Get exchange rate for any pair
function getExchangeRate(from, to) {
    // Same currency
    if (from === to) return 1;
    
    // Direct pair to USD
    const directSymbol = `${from}/USD`;
    const directRate = exchangeRatesCache[directSymbol];
    
    // Target to USD
    const targetSymbol = `${to}/USD`;
    const targetRate = exchangeRatesCache[targetSymbol];
    
    // Calculate cross rate: from/to = (from/USD) / (to/USD)
    if (directRate && targetRate && targetRate.price !== 0) {
        return directRate.price / targetRate.price;
    }
    
    console.warn(`⚠️ No rate for ${from}/${to}`);
    return null;
}

// Generate chart data
function generateChartData(days = 30) {
    const data = [];
    const now = Date.now();
    const baseValue = Math.random() * 0.5 + 0.8;
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const variance = (Math.random() - 0.5) * 0.05;
        const trend = (days - i) * 0.001;
        const value = Math.max(0.1, baseValue + variance + trend);
        
        data.push({
            date: date.toISOString().split('T')[0],
            value: value
        });
    }
    
    return data;
}

// Get time series data
async function getTimeSeriesData(from, to, range = '1M') {
    const rangeToDays = {
        '1D': 1, '1W': 7, '1M': 30, '6M': 180, '1Y': 365, '5Y': 1825
    };
    
    const days = rangeToDays[range] || 30;
    return generateChartData(days);
}

// Calculate percentage change
function calculateChange(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}

// Initialize API
async function initializeAPI() {
    try {
        console.log('🚀 Initializing API...');
        await fetchAllExchangeRates();
        
        // Auto-refresh every 10 minutes
        setInterval(() => {
            console.log('⏰ Auto-refresh triggered');
            fetchAllExchangeRates();
        }, CACHE_DURATION);
        
        console.log('✅ API ready');
        return true;
    } catch (error) {
        console.error('❌ Init failed:', error);
        return false;
    }
}

// Force refresh
async function forceRefreshRates() {
    console.log('🔄 Force refresh...');
    lastFetchTime = null;
    return await fetchAllExchangeRates();
}
