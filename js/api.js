// API Configuration
const API_KEY = 'b83fce53976843bbb59336c03f9a6a30';
const API_BASE_URL = 'https://api.twelvedata.com';

// Cache for exchange rates
let exchangeRatesCache = {};
let lastFetchTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fetch all exchange rates in a single request
async function fetchAllExchangeRates() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (lastFetchTime && (now - lastFetchTime < CACHE_DURATION) && Object.keys(exchangeRatesCache).length > 0) {
        console.log('Using cached exchange rates');
        return exchangeRatesCache;
    }

    try {
        console.log('Fetching new exchange rates from API...');
        
        // Build symbol pairs for all popular currencies
        const symbols = POPULAR_PAIRS.map(pair => `${pair.from}/${pair.to}`).join(',');
        
        const url = `${API_BASE_URL}/price?symbol=${symbols}&apikey=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Process the response
        const rates = {};
        
        if (Array.isArray(data)) {
            // Multiple pairs response
            data.forEach(item => {
                if (item.price) {
                    rates[item.symbol] = {
                        price: parseFloat(item.price),
                        timestamp: Date.now()
                    };
                }
            });
        } else if (data.price) {
            // Single pair response
            rates[data.symbol] = {
                price: parseFloat(data.price),
                timestamp: Date.now()
            };
        }
        
        // Update cache
        exchangeRatesCache = { ...exchangeRatesCache, ...rates };
        lastFetchTime = now;
        
        console.log('Exchange rates cached:', Object.keys(exchangeRatesCache).length, 'pairs');
        return exchangeRatesCache;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        
        // Return cached data if available, even if expired
        if (Object.keys(exchangeRatesCache).length > 0) {
            console.log('Using expired cache due to error');
            return exchangeRatesCache;
        }
        
        // Return mock data as fallback
        console.log('Using mock data as fallback');
        const mockData = generateMockData();
        exchangeRatesCache = mockData;
        lastFetchTime = now;
        return mockData;
    }
}

// Generate mock data for testing
function generateMockData() {
    const mockRates = {};
    POPULAR_PAIRS.forEach(pair => {
        const symbol = `${pair.from}/${pair.to}`;
        mockRates[symbol] = {
            price: Math.random() * 2 + 0.5,
            timestamp: Date.now()
        };
    });
    return mockRates;
}

// Get exchange rate for a specific pair
function getExchangeRate(from, to) {
    const symbol = `${from}/${to}`;
    const rate = exchangeRatesCache[symbol];
    
    if (rate) {
        return rate.price;
    }
    
    // Try reverse rate
    const reverseSymbol = `${to}/${from}`;
    const reverseRate = exchangeRatesCache[reverseSymbol];
    
    if (reverseRate) {
        return 1 / reverseRate.price;
    }
    
    // Calculate through USD if available
    if (from !== 'USD' && to !== 'USD') {
        const fromToUSD = exchangeRatesCache[`${from}/USD`];
        const toToUSD = exchangeRatesCache[`${to}/USD`];
        
        if (fromToUSD && toToUSD) {
            return fromToUSD.price / toToUSD.price;
        }
    }
    
    return null;
}

// Generate mock chart data
function generateChartData(days = 365) {
    const data = [];
    const now = Date.now();
    const baseValue = Math.random() * 2 + 0.5;
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const variance = (Math.random() - 0.5) * 0.1;
        const trend = (days - i) * 0.0005;
        const value = baseValue + variance + trend;
        
        data.push({
            date: date.toISOString().split('T')[0],
            value: value
        });
    }
    
    return data;
}

// Get time series data for chart
async function getTimeSeriesData(from, to, range = '1Y') {
    // Map range to days
    const rangeToDays = {
        '1D': 1,
        '1W': 7,
        '1M': 30,
        '6M': 180,
        '1Y': 365,
        '5Y': 1825
    };
    
    const days = rangeToDays[range] || 365;
    
    // For now, return mock data
    // In production, you would fetch real historical data from the API
    return generateChartData(days);
}

// Calculate percentage change
function calculateChange(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}

// Initialize API and fetch initial data
async function initializeAPI() {
    try {
        await fetchAllExchangeRates();
        
        // Set up periodic refresh every 10 minutes
        setInterval(fetchAllExchangeRates, CACHE_DURATION);
        
        return true;
    } catch (error) {
        console.error('Failed to initialize API:', error);
        return false;
    }
}
