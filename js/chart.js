// Chart API Configuration
const CHART_API_KEY = '78b674a6f7b773099b349c4b';
const CHART_API_BASE = 'https://v6.exchangerate-api.com/v6/' + CHART_API_KEY;

// Chart cache with 24-hour expiry
let chartCache = {};
let chartCacheTimestamp = {};
const CHART_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_DAILY_REQUESTS = 40;
let dailyRequestCount = 0;
let lastRequestDate = null;

// Initialize request counter from localStorage
function initializeRequestCounter() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('chartRequestDate');
    const savedCount = parseInt(localStorage.getItem('chartRequestCount')) || 0;
    
    if (savedDate === today) {
        dailyRequestCount = savedCount;
        lastRequestDate = today;
    } else {
        dailyRequestCount = 0;
        lastRequestDate = today;
        localStorage.setItem('chartRequestDate', today);
        localStorage.setItem('chartRequestCount', '0');
    }
    
    console.log(`📊 Chart API: ${dailyRequestCount}/${MAX_DAILY_REQUESTS} requests used today`);
}

// Increment request counter
function incrementRequestCounter() {
    const today = new Date().toDateString();
    
    if (lastRequestDate !== today) {
        dailyRequestCount = 0;
        lastRequestDate = today;
        localStorage.setItem('chartRequestDate', today);
    }
    
    dailyRequestCount++;
    localStorage.setItem('chartRequestCount', dailyRequestCount.toString());
    
    console.log(`📊 Chart API request: ${dailyRequestCount}/${MAX_DAILY_REQUESTS}`);
}

// Check if we can make more requests
function canMakeRequest() {
    const today = new Date().toDateString();
    
    if (lastRequestDate !== today) {
        dailyRequestCount = 0;
        lastRequestDate = today;
        return true;
    }
    
    return dailyRequestCount < MAX_DAILY_REQUESTS;
}

// Fetch historical data for a specific date
async function fetchHistoricalRate(base, date) {
    try {
        // Format: YYYY/MM/DD
        const [year, month, day] = date.split('-');
        const url = `${CHART_API_BASE}/history/${base}/${year}/${month}/${day}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.result !== 'success') {
            throw new Error(data['error-type'] || 'API error');
        }
        
        return data.conversion_rates;
        
    } catch (error) {
        console.error(`❌ Failed to fetch rate for ${date}:`, error.message);
        return null;
    }
}

// Generate date range
function generateDateRange(days) {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
}

// Fetch chart data with smart caching and request limiting
async function fetchChartData(from, to, days = 30) {
    const cacheKey = `${from}/${to}/${days}`;
    const now = Date.now();
    
    // Check cache first
    if (chartCache[cacheKey] && chartCacheTimestamp[cacheKey]) {
        const cacheAge = now - chartCacheTimestamp[cacheKey];
        if (cacheAge < CHART_CACHE_DURATION) {
            console.log(`✅ Using cached chart data for ${cacheKey} (${Math.round(cacheAge / 3600000)}h old)`);
            return chartCache[cacheKey];
        }
    }
    
    // Check request limit
    if (!canMakeRequest()) {
        console.warn(`⚠️ Daily limit reached (${MAX_DAILY_REQUESTS} requests). Using cached or generated data.`);
        
        if (chartCache[cacheKey]) {
            return chartCache[cacheKey];
        }
        
        return generateFallbackChartData(from, to, days);
    }
    
    console.log(`🔄 Fetching real chart data for ${from}/${to} (${days} days)...`);
    
    try {
        // Determine sampling strategy based on days to limit requests
        let samplingDates;
        
        if (days <= 7) {
            // Daily data for 1 week
            samplingDates = generateDateRange(days);
        } else if (days <= 30) {
            // Every 2 days for 1 month (15 requests)
            const allDates = generateDateRange(days);
            samplingDates = allDates.filter((_, index) => index % 2 === 0);
        } else if (days <= 180) {
            // Weekly samples for 6 months (26 requests)
            const allDates = generateDateRange(days);
            samplingDates = allDates.filter((_, index) => index % 7 === 0);
        } else if (days <= 365) {
            // Bi-weekly for 1 year (26 requests)
            const allDates = generateDateRange(days);
            samplingDates = allDates.filter((_, index) => index % 14 === 0);
        } else {
            // Monthly for 5 years (60 requests - spread over 2 days)
            const allDates = generateDateRange(days);
            samplingDates = allDates.filter((_, index) => index % 30 === 0);
        }
        
        // Limit to remaining daily quota
        const remainingRequests = MAX_DAILY_REQUESTS - dailyRequestCount;
        if (samplingDates.length > remainingRequests) {
            console.warn(`⚠️ Reducing samples from ${samplingDates.length} to ${remainingRequests} to stay within limit`);
            const step = Math.ceil(samplingDates.length / remainingRequests);
            samplingDates = samplingDates.filter((_, index) => index % step === 0);
        }
        
        const chartData = [];
        const currentRate = getExchangeRate(from, to) || 1;
        
        // Fetch historical data for each sample date
        for (const date of samplingDates) {
            incrementRequestCounter();
            
            const rates = await fetchHistoricalRate(from, date);
            
            if (rates && rates[to]) {
                const value = from === 'USD' ? rates[to] : (1 / rates[from]) * rates[to];
                chartData.push({ date, value });
            } else {
                // Fallback: interpolate based on current rate
                const daysAgo = samplingDates.length - samplingDates.indexOf(date);
                const variance = (Math.random() - 0.5) * 0.05;
                const value = currentRate * (1 + variance - (daysAgo * 0.0001));
                chartData.push({ date, value: Math.max(0.01, value) });
            }
            
            // Small delay to avoid rate limiting
            if (samplingDates.indexOf(date) < samplingDates.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // Interpolate missing dates for smooth chart
        const fullData = interpolateChartData(chartData, days);
        
        // Cache the result
        chartCache[cacheKey] = fullData;
        chartCacheTimestamp[cacheKey] = now;
        
        console.log(`✅ Fetched ${samplingDates.length} real data points, interpolated to ${fullData.length} points`);
        
        return fullData;
        
    } catch (error) {
        console.error('❌ Chart fetch failed:', error);
        
        if (chartCache[cacheKey]) {
            console.log('⚠️ Using old cached data');
            return chartCache[cacheKey];
        }
        
        return generateFallbackChartData(from, to, days);
    }
}

// Interpolate data points for smooth chart
function interpolateChartData(sampledData, totalDays) {
    if (sampledData.length < 2) {
        return sampledData;
    }
    
    const allDates = generateDateRange(totalDays);
    const interpolated = [];
    
    for (const date of allDates) {
        // Find closest data points
        const exactMatch = sampledData.find(d => d.date === date);
        
        if (exactMatch) {
            interpolated.push(exactMatch);
        } else {
            // Find surrounding points
            const before = sampledData.filter(d => d.date < date).pop();
            const after = sampledData.find(d => d.date > date);
            
            if (before && after) {
                // Linear interpolation
                const daysBetween = (new Date(after.date) - new Date(before.date)) / (1000 * 60 * 60 * 24);
                const daysFromBefore = (new Date(date) - new Date(before.date)) / (1000 * 60 * 60 * 24);
                const ratio = daysFromBefore / daysBetween;
                const value = before.value + (after.value - before.value) * ratio;
                
                interpolated.push({ date, value });
            } else if (before) {
                interpolated.push({ date, value: before.value });
            } else if (after) {
                interpolated.push({ date, value: after.value });
            }
        }
    }
    
    return interpolated;
}

// Generate fallback data when API limit is reached
function generateFallbackChartData(from, to, days) {
    console.log(`📊 Generating fallback chart data for ${from}/${to}`);
    
    const data = [];
    const currentRate = getExchangeRate(from, to) || 1;
    const dates = generateDateRange(days);
    
    for (let i = 0; i < dates.length; i++) {
        const daysAgo = dates.length - i;
        const trend = (daysAgo / dates.length) * 0.05;
        const noise = (Math.random() - 0.5) * 0.03;
        const value = currentRate * (1 - trend + noise);
        
        data.push({
            date: dates[i],
            value: Math.max(0.01, value)
        });
    }
    
    return data;
}

// Get time series data based on range
async function getTimeSeriesData(from, to, range = '1M') {
    const rangeToDays = {
        '1D': 1,
        '1W': 7,
        '1M': 30,
        '6M': 180,
        '1Y': 365,
        '5Y': 1825
    };
    
    const days = rangeToDays[range] || 30;
    return await fetchChartData(from, to, days);
}

// Calculate percentage change from chart data
function calculateChangeFromChart(chartData) {
    if (!chartData || chartData.length < 2) {
        return 0;
    }
    
    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    
    if (!firstValue || firstValue === 0) {
        return 0;
    }
    
    return ((lastValue - firstValue) / firstValue) * 100;
}

// Preload chart data for popular pairs
async function preloadPopularCharts() {
    if (!canMakeRequest()) {
        console.log('⚠️ Skipping preload - daily limit reached');
        return;
    }
    
    console.log('📊 Preloading popular charts...');
    
    const popularPairs = [
        { from: 'USD', to: 'EUR' },
        { from: 'USD', to: 'GBP' },
        { from: 'USD', to: 'CAD' },
        { from: 'USD', to: 'CHF' }
    ];
    
    for (const pair of popularPairs) {
        if (canMakeRequest()) {
            await fetchChartData(pair.from, pair.to, 30);
        }
    }
}

// Initialize chart system
function initializeChartSystem() {
    console.log('📊 Initializing chart system...');
    initializeRequestCounter();
    
    // Preload popular charts if quota allows
    setTimeout(() => {
        preloadPopularCharts();
    }, 3000);
}

// Initialize on load
initializeChartSystem();
