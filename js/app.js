// Main application logic
let currentFromCurrency = 'EUR';
let currentToCurrency = 'GBP';
let currentDetailPair = null;
let currentTimeRange = '1Y';
let selectingFor = null; // 'from' or 'to' for currency selector

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎯 Currency Exchange App Starting...');
    
    // Load saved theme
    loadSavedTheme();
    
    // Show loading screen for 2 seconds
    setTimeout(async () => {
        console.log('⏳ Loading screen timeout - initializing app...');
        
        // Initialize API
        const apiSuccess = await initializeAPI();
        
        if (apiSuccess) {
            console.log('✅ API initialization successful');
        } else {
            console.warn('⚠️ API initialization had issues, using fallback data');
        }
        
        // Hide loading screen
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Initialize UI
        initializeUI();
        
        // Load data
        console.log('📱 Loading UI data...');
        await loadPopularRates();
        loadFavorites();
        updateConverter();
        
        console.log('🎉 App ready!');
    }, 2000);
});

// Initialize UI event listeners
function initializeUI() {
    // Navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Add favorite button
    document.getElementById('add-favorite-btn').addEventListener('click', openCurrencySelector);
    
    // Currency converter
    document.getElementById('from-amount').addEventListener('input', debounce(updateConverter, 300));
    document.getElementById('swap-currencies').addEventListener('click', swapCurrencies);
    document.getElementById('from-currency').addEventListener('click', () => openCurrencySelectorForConverter('from'));
    document.getElementById('to-currency').addEventListener('click', () => openCurrencySelectorForConverter('to'));
    
    // Modal close buttons
    document.getElementById('detail-close').addEventListener('click', closeDetailModal);
    document.getElementById('selector-close').addEventListener('click', closeCurrencySelector);
    document.getElementById('terms-close').addEventListener('click', closeTermsModal);
    
    // Terms link
    document.getElementById('terms-link').addEventListener('click', function(e) {
        e.preventDefault();
        openTermsModal();
    });
    
    // Time range selector
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const range = this.dataset.range;
            selectTimeRange(range);
        });
    });
    
    // Currency search
    document.getElementById('currency-search-input').addEventListener('input', debounce(filterCurrencies, 300));
    
    // Swap selection
    document.getElementById('swap-selection').addEventListener('click', swapSelection);
    
    // Dark mode toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Apply theme
            if (mode === 'off') {
                // Light mode
                document.documentElement.style.setProperty('--bg-primary', '#ffffff');
                document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5');
                document.documentElement.style.setProperty('--bg-tertiary', '#e0e0e0');
                document.documentElement.style.setProperty('--text-primary', '#000000');
                document.documentElement.style.setProperty('--text-secondary', '#666666');
                document.documentElement.style.setProperty('--border', '#d0d0d0');
                Storage.set('theme', 'light');
            } else if (mode === 'on') {
                // Dark mode
                document.documentElement.style.setProperty('--bg-primary', '#000000');
                document.documentElement.style.setProperty('--bg-secondary', '#1a1a1a');
                document.documentElement.style.setProperty('--bg-tertiary', '#2a2a2a');
                document.documentElement.style.setProperty('--text-primary', '#ffffff');
                document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
                document.documentElement.style.setProperty('--border', '#3a3a3a');
                Storage.set('theme', 'dark');
            } else {
                // Auto mode - detect system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    document.documentElement.style.setProperty('--bg-primary', '#000000');
                    document.documentElement.style.setProperty('--bg-secondary', '#1a1a1a');
                    document.documentElement.style.setProperty('--bg-tertiary', '#2a2a2a');
                    document.documentElement.style.setProperty('--text-primary', '#ffffff');
                    document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
                    document.documentElement.style.setProperty('--border', '#3a3a3a');
                } else {
                    document.documentElement.style.setProperty('--bg-primary', '#ffffff');
                    document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5');
                    document.documentElement.style.setProperty('--bg-tertiary', '#e0e0e0');
                    document.documentElement.style.setProperty('--text-primary', '#000000');
                    document.documentElement.style.setProperty('--text-secondary', '#666666');
                    document.documentElement.style.setProperty('--border', '#d0d0d0');
                }
                Storage.set('theme', 'auto');
            }
        });
    });
    
    // Modal convert button
    document.getElementById('modal-convert-btn').addEventListener('click', function() {
        if (currentDetailPair) {
            currentFromCurrency = currentDetailPair.from;
            currentToCurrency = currentDetailPair.to;
            updateConverter();
            closeDetailModal();
            switchTab('convert');
        }
    });
    
    // Favorite button in detail modal
    document.getElementById('detail-favorite').addEventListener('click', toggleDetailFavorite);
}

// Switch tab
function switchTab(tab) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// Load popular rates
async function loadPopularRates() {
    const container = document.getElementById('popular-list');
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #b0b0b0;">Loading rates...</div>';
    
    const rates = await fetchAllExchangeRates();
    
    console.log('📊 Loading popular rates. Available rates:', Object.keys(rates).length);
    
    container.innerHTML = '';
    
    let displayedCount = 0;
    
    POPULAR_PAIRS.forEach(pair => {
        const rate = getExchangeRate(pair.from, pair.to);
        
        if (rate && rate > 0) {
            const item = createCurrencyItem(pair.from, pair.to, rate);
            container.appendChild(item);
            displayedCount++;
        } else {
            console.warn(`⚠️ No rate for ${pair.from}/${pair.to}`);
        }
    });
    
    if (displayedCount === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #b0b0b0;">No rates available. Please wait...</div>';
    } else {
        console.log(`✅ Displayed ${displayedCount} popular currency pairs`);
    }
}

// Load favorites
function loadFavorites() {
    const container = document.getElementById('favorites-list');
    const favorites = Favorites.getAll();
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>⭐</span>
                <p>You haven't added any favourite rates yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    let displayedCount = 0;
    
    favorites.forEach(pairStr => {
        const [from, to] = pairStr.split('/');
        const rate = getExchangeRate(from, to);
        
        if (rate && rate > 0) {
            const item = createCurrencyItem(from, to, rate);
            container.appendChild(item);
            displayedCount++;
        }
    });
    
    if (displayedCount === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>⚠️</span>
                <p>Unable to load favorite rates. Please refresh.</p>
            </div>
        `;
    }
}

// Create currency item element
function createCurrencyItem(from, to, rate) {
    const div = document.createElement('div');
    div.className = 'currency-item';
    div.onclick = () => openDetailModal(from, to);
    
    const fromIcon = getCurrencyIcon(from);
    const toIcon = getCurrencyIcon('USD'); // Always show USD as second icon
    const change = (Math.random() - 0.5) * 5; // Mock change
    const isPositive = change >= 0;
    
    div.innerHTML = `
        <div class="currency-info">
            <div class="currency-icons">
                <img src="${fromIcon}" alt="${from}" class="currency-icon">
                <img src="${toIcon}" alt="USD" class="currency-icon">
            </div>
            <div class="currency-details">
                <div class="currency-pair">${from} to ${to}</div>
                <div class="currency-rate">1 ${from} = ${formatCurrency(rate)} ${to}</div>
            </div>
        </div>
        <canvas class="currency-chart" width="80" height="40"></canvas>
        <div class="rate-change">
            <div class="rate-value">${formatCurrency(rate)}</div>
            <div class="rate-percent ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '↗' : '↘'} ${formatPercentage(Math.abs(change))}%
            </div>
        </div>
    `;
    
    // Draw mini chart
    setTimeout(() => {
        const canvas = div.querySelector('.currency-chart');
        if (canvas) {
            const chartData = generateChartData(7);
            drawMiniChart(canvas, chartData, isPositive);
        }
    }, 100);
    
    return div;
}

    // Open detail modal
async function openDetailModal(from, to) {
    currentDetailPair = { from, to };
    
    const modal = document.getElementById('currency-detail-modal');
    const rate = getExchangeRate(from, to);
    
    if (!rate) {
        console.error('No rate found for', from, to);
        return;
    }
    
    // Update icons
    modal.querySelector('.from-icon').src = getCurrencyIcon(from);
    modal.querySelector('.to-icon').src = getCurrencyIcon(to);
    
    // Update title
    document.getElementById('modal-title').textContent = `${from} to ${to}`;
    document.getElementById('modal-subtitle').textContent = `${getCurrencyName(from)} to ${getCurrencyName(to)}`;
    
    // Update rate
    document.getElementById('modal-rate').textContent = `1 ${from} = ${formatCurrency(rate)} ${to}`;
    
    // Update change
    const change = (Math.random() - 0.5) * 5;
    const isPositive = change >= 0;
    const changeEl = document.getElementById('modal-change');
    changeEl.className = isPositive ? 'positive' : 'negative';
    changeEl.textContent = `${isPositive ? '↗' : '↘'} ${isPositive ? 'Up' : 'Down'} by ${formatPercentage(Math.abs(change))}% (${formatCurrency(Math.abs(change * rate / 100))} ${to})`;
    
    // Update favorite button
    const favBtn = document.getElementById('detail-favorite');
    favBtn.textContent = Favorites.isFavorite(from, to) ? '⭐' : '☆';
    
    // Update convert button
    document.getElementById('modal-convert-btn').textContent = `Convert ${from} to ${to}`;
    
    // Load and draw chart
    const chartData = await getTimeSeriesData(from, to, currentTimeRange);
    const canvas = document.getElementById('detail-chart');
    drawDetailChart(canvas, chartData, isPositive);
    
    modal.classList.remove('hidden');
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('currency-detail-modal').classList.add('hidden');
    currentDetailPair = null;
}

// Toggle favorite in detail modal
function toggleDetailFavorite() {
    if (!currentDetailPair) return;
    
    const { from, to } = currentDetailPair;
    const favBtn = document.getElementById('detail-favorite');
    
    if (Favorites.isFavorite(from, to)) {
        Favorites.remove(from, to);
        favBtn.textContent = '☆';
    } else {
        Favorites.add(from, to);
        favBtn.textContent = '⭐';
    }
    
    loadFavorites();
}

// Select time range
async function selectTimeRange(range) {
    currentTimeRange = range;
    
    // Update active button
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.range === range) {
            btn.classList.add('active');
        }
    });
    
    // Reload chart
    if (currentDetailPair) {
        const { from, to } = currentDetailPair;
        const chartData = await getTimeSeriesData(from, to, range);
        const canvas = document.getElementById('detail-chart');
        const isPositive = Math.random() > 0.5;
        drawDetailChart(canvas, chartData, isPositive);
    }
}

// Update converter
function updateConverter() {
    const fromAmount = parseFloat(document.getElementById('from-amount').value) || 0;
    const rate = getExchangeRate(currentFromCurrency, currentToCurrency);
    
    console.log(`🔄 Converting ${fromAmount} ${currentFromCurrency} to ${currentToCurrency}`);
    console.log(`📊 Exchange rate: ${rate}`);
    
    if (rate && rate > 0) {
        const toAmount = fromAmount * rate;
        document.getElementById('to-amount').value = formatCurrency(toAmount, 2);
        document.getElementById('exchange-rate-text').textContent = 
            `1 ${currentFromCurrency} = ${formatCurrency(rate)} ${currentToCurrency} at the mid-market rate`;
    } else {
        document.getElementById('to-amount').value = '0.00';
        document.getElementById('exchange-rate-text').textContent = 'Loading exchange rate...';
        console.warn(`⚠️ No rate available for ${currentFromCurrency}/${currentToCurrency}`);
    }
    
    // Update currency icons
    const fromIcon = getCurrencyIcon(currentFromCurrency);
    const toIcon = getCurrencyIcon(currentToCurrency);
    
    document.querySelector('#from-currency .currency-icon').src = fromIcon;
    document.querySelector('#from-currency .currency-code').textContent = currentFromCurrency;
    document.querySelector('#to-currency .currency-icon').src = toIcon;
    document.querySelector('#to-currency .currency-code').textContent = currentToCurrency;
}

// Swap currencies
function swapCurrencies() {
    const temp = currentFromCurrency;
    currentFromCurrency = currentToCurrency;
    currentToCurrency = temp;
    updateConverter();
}

// Open currency selector for converter
function openCurrencySelectorForConverter(type) {
    selectingFor = type;
    openCurrencySelector();
}

// Open currency selector modal
function openCurrencySelector() {
    const modal = document.getElementById('currency-selector-modal');
    
    // Populate currency lists
    populateCurrencyLists();
    
    modal.classList.remove('hidden');
}

// Close currency selector
function closeCurrencySelector() {
    document.getElementById('currency-selector-modal').classList.add('hidden');
    selectingFor = null;
}

// Populate currency lists
function populateCurrencyLists() {
    const suggestedContainer = document.getElementById('suggested-currencies');
    const allContainer = document.getElementById('all-currencies');
    
    suggestedContainer.innerHTML = '';
    allContainer.innerHTML = '';
    
    // Suggested currencies
    SUGGESTED_CURRENCIES.forEach(code => {
        const option = createCurrencyOption(code);
        suggestedContainer.appendChild(option);
    });
    
    // All currencies
    Object.keys(CURRENCY_DATA).forEach(code => {
        if (!SUGGESTED_CURRENCIES.includes(code)) {
            const option = createCurrencyOption(code);
            allContainer.appendChild(option);
        }
    });
}

// Create currency option element
function createCurrencyOption(code) {
    const div = document.createElement('div');
    div.className = 'currency-option';
    div.onclick = () => selectCurrency(code);
    
    const icon = getCurrencyIcon(code);
    const name = getCurrencyName(code);
    
    div.innerHTML = `
        <img src="${icon}" alt="${code}">
        <div class="currency-option-info">
            <div class="currency-option-code">${code}</div>
            <div class="currency-option-name">${name}</div>
        </div>
    `;
    
    return div;
}

// Select currency
function selectCurrency(code) {
    if (selectingFor === 'from') {
        currentFromCurrency = code;
        updateConverter();
        closeCurrencySelector();
    } else if (selectingFor === 'to') {
        currentToCurrency = code;
        updateConverter();
        closeCurrencySelector();
    } else {
        // For adding favorites
        const selectedFrom = document.getElementById('selected-from').dataset.currency;
        const selectedTo = document.getElementById('selected-to').dataset.currency;
        
        if (!selectedFrom) {
            document.getElementById('selected-from').dataset.currency = code;
            document.getElementById('selected-from').innerHTML = `
                <img src="${getCurrencyIcon(code)}" style="width: 24px; height: 24px; border-radius: 50%;">
                <span>${code}</span>
            `;
        } else if (!selectedTo) {
            document.getElementById('selected-to').dataset.currency = code;
            document.getElementById('selected-to').innerHTML = `
                <img src="${getCurrencyIcon(code)}" style="width: 24px; height: 24px; border-radius: 50%;">
                <span>${code}</span>
            `;
            
            // Both selected, add to favorites
            Favorites.add(selectedFrom, code);
            loadFavorites();
            closeCurrencySelector();
            
            // Reset selection
            document.getElementById('selected-from').dataset.currency = '';
            document.getElementById('selected-from').innerHTML = '<span>Select currency</span>';
            document.getElementById('selected-to').dataset.currency = '';
            document.getElementById('selected-to').innerHTML = '<span>Select currency</span>';
        }
    }
}

// Swap selection
function swapSelection() {
    const fromEl = document.getElementById('selected-from');
    const toEl = document.getElementById('selected-to');
    
    const tempCurrency = fromEl.dataset.currency;
    const tempHTML = fromEl.innerHTML;
    
    fromEl.dataset.currency = toEl.dataset.currency;
    fromEl.innerHTML = toEl.innerHTML;
    
    toEl.dataset.currency = tempCurrency;
    toEl.innerHTML = tempHTML;
}

// Filter currencies
function filterCurrencies() {
    const searchTerm = document.getElementById('currency-search-input').value.toLowerCase();
    
    document.querySelectorAll('.currency-option').forEach(option => {
        const code = option.querySelector('.currency-option-code').textContent.toLowerCase();
        const name = option.querySelector('.currency-option-name').textContent.toLowerCase();
        
        if (code.includes(searchTerm) || name.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

// Open terms modal
function openTermsModal() {
    document.getElementById('terms-modal').classList.remove('hidden');
}

// Close terms modal
function closeTermsModal() {
    document.getElementById('terms-modal').classList.add('hidden');
}

// Load saved theme
function loadSavedTheme() {
    const savedTheme = Storage.get('theme') || 'auto';
    
    // Find and activate the correct button
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === savedTheme) {
            btn.classList.add('active');
        }
    });
    
    // Apply the theme
    if (savedTheme === 'light') {
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5');
        document.documentElement.style.setProperty('--bg-tertiary', '#e0e0e0');
        document.documentElement.style.setProperty('--text-primary', '#000000');
        document.documentElement.style.setProperty('--text-secondary', '#666666');
        document.documentElement.style.setProperty('--border', '#d0d0d0');
    } else if (savedTheme === 'dark') {
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--bg-secondary', '#1a1a1a');
        document.documentElement.style.setProperty('--bg-tertiary', '#2a2a2a');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
        document.documentElement.style.setProperty('--border', '#3a3a3a');
    } else {
        // Auto - use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.style.setProperty('--bg-primary', '#000000');
            document.documentElement.style.setProperty('--bg-secondary', '#1a1a1a');
            document.documentElement.style.setProperty('--bg-tertiary', '#2a2a2a');
            document.documentElement.style.setProperty('--text-primary', '#ffffff');
            document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
            document.documentElement.style.setProperty('--border', '#3a3a3a');
        } else {
            document.documentElement.style.setProperty('--bg-primary', '#ffffff');
            document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5');
            document.documentElement.style.setProperty('--bg-tertiary', '#e0e0e0');
            document.documentElement.style.setProperty('--text-primary', '#000000');
            document.documentElement.style.setProperty('--text-secondary', '#666666');
            document.documentElement.style.setProperty('--border', '#d0d0d0');
        }
    }
}
