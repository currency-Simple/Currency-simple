// API Configuration
const FALLBACK_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// Cache for exchange rates
let exchangeRatesCache = {};
let lastFetchTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Currency groups for 5 separate requests
const CURRENCY_GROUPS = [
    ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN'],
    ['TRY', 'RUB', 'ZAR', 'KRW', 'MYR', 'HKD', 'DKK', 'NOK', 'SEK', 'PLN'],
    ['THB', 'SGD', 'NZD', 'MAD', 'EGP', 'SAR', 'AED', 'QAR', 'IDR', 'PHP'],
    ['VND', 'PKR', 'ARS', 'CLP', 'COP', 'KWD', 'BHD', 'OMR', 'DZD', 'BWP'],
    ['CZK', 'DOP', 'ETB', 'HNL', 'HUF', 'ISK', 'KMF', 'LBP', 'MDL', 'RON', 'RSD', 'UAH', 'KZT', 'AZN', 'BDT']
];

// Fetch exchange rates in 5 separate requests
async function fetchAllExchangeRates() {
    const now = Date.now();
    
    // Return valid cache
    if (lastFetchTime && (now - lastFetchTime < CACHE_DURATION) && Object.keys(exchangeRatesCache).length > 40) {
        console.log('✅ Using cached rates. Next update in:', Math.round((CACHE_DURATION - (now - lastFetchTime)) / 60000), 'min');
        return exchangeRatesCache;
    }

    console.log('🔄 Fetching exchange rates in 5 requests...');

    try {
        const allRates = {};
        
        // Make 5 parallel requests
        const promises = CURRENCY_GROUPS.map(async (group, index) => {
            try {
                const response = await fetch(FALLBACK_API_URL);
                
                if (!response.ok) {
                    throw new Error(`Request ${index + 1} failed`);
                }
                
                const data = await response.json();
                
                if (data && data.rates) {
                    console.log(`✅ Request ${index + 1}/5 successful`);
                    
                    // Filter only currencies in this group
                    group.forEach(currency => {
                        if (data.rates[currency]) {
                            const rate = data.rates[currency];
                            allRates[`USD/${currency}`] = {
                                price: rate,
                                timestamp: now
                            };
                        }
                    });
                }
            } catch (error) {
                console.error(`❌ Request ${index + 1} failed:`, error.message);
            }
        });
        
        // Wait for all requests
        await Promise.all(promises);
        
        // Add USD/USD
        allRates['USD/USD'] = { price: 1, timestamp: now };
        
        if (Object.keys(allRates).length > 0) {
            exchangeRatesCache = allRates;
            lastFetchTime = now;
            console.log(`✅ Cached ${Object.keys(allRates).length} exchange rates from 5 requests`);
            return exchangeRatesCache;
        }
        
        throw new Error('No rates received');
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        
        if (Object.keys(exchangeRatesCache).length > 0) {
            console.log('⚠️ Using old cache');
            return exchangeRatesCache;
        }
        
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
        'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.50, 'CAD': 1.37, 'AUD': 1.54,
        'CHF': 0.88, 'CNY': 7.24, 'INR': 83.20, 'BRL': 5.01, 'MXN': 17.25,
        'TRY': 31.50, 'RUB': 92.50, 'ZAR': 18.20, 'KRW': 1330.50, 'MYR': 4.52,
        'HKD': 7.82, 'DKK': 6.87, 'NOK': 10.75, 'SEK': 10.42, 'PLN': 4.01,
        'THB': 34.50, 'SGD': 1.33, 'NZD': 1.67, 'MAD': 10.05, 'EGP': 49.80,
        'SAR': 3.75, 'AED': 3.67, 'QAR': 3.64, 'IDR': 15650, 'PHP': 56.80,
        'VND': 25100, 'PKR': 278.50, 'ARS': 1000, 'CLP': 950, 'COP': 4000,
        'KWD': 0.31, 'BHD': 0.38, 'OMR': 0.38, 'DZD': 135, 'BWP': 13.70,
        'CZK': 22.80, 'DOP': 59.50, 'ETB': 108, 'HNL': 25, 'HUF': 355,
        'ISK': 139, 'KMF': 453, 'LBP': 89500, 'MDL': 18.20, 'RON': 4.55,
        'RSD': 107, 'UAH': 38.50, 'KZT': 475, 'AZN': 1.70, 'BDT': 110
    };
    
    Object.keys(baseRates).forEach(currency => {
        const symbol = `USD/${currency}`;
        let rate = baseRates[currency];
        rate = rate * (1 + (Math.random() - 0.5) * 0.02);
        
        mockRates[symbol] = {
            price: rate,
            timestamp: Date.now()
        };
    });
    
    mockRates['USD/USD'] = { price: 1, timestamp: Date.now() };
    
    console.log(`✅ Generated ${Object.keys(mockRates).length} mock rates`);
    return mockRates;
}

// Get exchange rate for any pair
function getExchangeRate(from, to) {
    if (from === to) return 1;
    
    // Direct pair USD/XXX
    const directSymbol = `${from}/${to}`;
    const directRate = exchangeRatesCache[directSymbol];
    
    if (directRate) {
        return directRate.price;
    }
    
    // Reverse pair XXX/USD
    const reverseSymbol = `${to}/${from}`;
    const reverseRate = exchangeRatesCache[reverseSymbol];
    
    if (reverseRate && reverseRate.price !== 0) {
        return 1 / reverseRate.price;
    }
    
    // Cross rate through USD
    const fromUSD = exchangeRatesCache[`USD/${from}`];
    const toUSD = exchangeRatesCache[`USD/${to}`];
    
    if (fromUSD && toUSD && fromUSD.price !== 0) {
        return toUSD.price / fromUSD.price;
    }
    
    console.warn(`⚠️ No rate for ${from}/${to}`);
    return null;
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
