// Main application state
let currentFromCurrency = 'EUR';
let currentToCurrency = 'GBP';
let currentDetailPair = null;
let currentTimeRange = '1M';
let selectingFor = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎯 App Starting...');
    
    loadSavedTheme();
    
    setTimeout(async () => {
        console.log('⏳ Initializing...');
        
        await initializeAPI();
        
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        initializeUI();
        
        await loadPopularRates();
        loadFavorites();
        updateConverter();
        
        console.log('🎉 App Ready!');
    }, 2000);
});

// Initialize UI
function initializeUI() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Favorites
    document.getElementById('add-favorite-btn').addEventListener('click', openCurrencySelector);
    
    // Converter
    document.getElementById('from-amount').addEventListener('input', debounce(updateConverter, 300));
    document.getElementById('swap-currencies').addEventListener('click', swapCurrencies);
    document.getElementById('from-currency').addEventListener('click', () => openCurrencySelectorForConverter('from'));
    document.getElementById('to-currency').addEventListener('click', () => openCurrencySelectorForConverter('to'));
    
    // Modals
    document.getElementById('detail-close').addEventListener('click', closeDetailModal);
    document.getElementById('selector-close').addEventListener('click', closeCurrencySelector);
    document.getElementById('terms-close').addEventListener('click', closeTermsModal);
    document.getElementById('terms-link').addEventListener('click', (e) => {
        e.preventDefault();
        openTermsModal();
    });
    
    // Time range
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => selectTimeRange(btn.dataset.range));
    });
    
    // Search
    document.getElementById('currency-search-input').addEventListener('input', debounce(filterCurrencies, 300));
    document.getElementById('swap-selection').addEventListener('click', swapSelection);
    
    // Dark mode
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            applyTheme(mode);
        });
    });
    
    // Modal actions
    document.getElementById('modal-convert-btn').addEventListener('click', () => {
        if (currentDetailPair) {
            currentFromCurrency = currentDetailPair.from;
            currentToCurrency = currentDetailPair.to;
            updateConverter();
            closeDetailModal();
            switchTab('convert');
        }
    });
    
    document.getElementById('detail-favorite').addEventListener('click', toggleDetailFavorite);
}

// Switch tab
function switchTab(tab) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// Load popular rates
async function loadPopularRates() {
    const container = document.getElementById('popular-list');
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">Loading rates...</div>';
    
    try {
        const rates = await fetchAllExchangeRates();
        
        if (!rates || Object.keys(rates).length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">No rates available. Please wait...</div>';
            return;
        }
        
        container.innerHTML = '';
        let count = 0;
        
        POPULAR_PAIRS.forEach(pair => {
            const rate = getExchangeRate(pair.from, pair.to);
            
            if (rate && rate > 0) {
                const item = createCurrencyItem(pair.from, pair.to, rate);
                container.appendChild(item);
                count++;
            }
        });
        
        if (count === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">No rates available</div>';
        } else {
            console.log(`✅ Displayed ${count} rates`);
        }
    } catch (error) {
        console.error('Error loading rates:', error);
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading rates. Please refresh.</div>';
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
    let count = 0;
    
    favorites.forEach(pairStr => {
        const [from, to] = pairStr.split('/');
        const rate = getExchangeRate(from, to);
        
        if (rate && rate > 0) {
            const item = createCurrencyItem(from, to, rate);
            container.appendChild(item);
            count++;
        }
    });
    
    if (count === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">Unable to load rates</div>';
    }
}

// Create currency item
function createCurrencyItem(from, to, rate) {
    const div = document.createElement('div');
    div.className = 'currency-item';
    div.onclick = () => openDetailModal(from, to);
    
    const fromIcon = getCurrencyIcon(from);
    const toIcon = getCurrencyIcon(to);
    
    div.innerHTML = `
        <div class="currency-info">
            <div class="currency-icons">
                <img src="${fromIcon}" alt="${from}" class="currency-icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22%23666%22%3E${from}%3C/text%3E%3C/svg%3E'">
                <img src="${toIcon}" alt="${to}" class="currency-icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22%23666%22%3E${to}%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="currency-details">
                <div class="currency-pair">${from} to ${to}</div>
                <div class="currency-rate">${from} = ${formatCurrency(rate)} ${to}</div>
            </div>
        </div>
        <canvas class="currency-chart" width="80" height="40"></canvas>
        <div class="rate-change">
            <div class="rate-value">${formatCurrency(rate)}</div>
        </div>
    `;
    
    setTimeout(() => {
        const canvas = div.querySelector('.currency-chart');
        if (canvas) {
            const isPositive = Math.random() > 0.5;
            getTimeSeriesData(from, to, '1W').then(chartData => {
                drawMiniChart(canvas, chartData, isPositive);
            });
        }
    }, 100);
    
    return div;
}

// Open detail modal
async function openDetailModal(from, to) {
    currentDetailPair = { from, to };
    const modal = document.getElementById('currency-detail-modal');
    const rate = getExchangeRate(from, to);
    
    if (!rate || rate <= 0) {
        console.error('No rate available');
        return;
    }
    
    modal.querySelector('.from-icon').src = getCurrencyIcon(from);
    modal.querySelector('.to-icon').src = getCurrencyIcon(to);
    
    document.getElementById('modal-title').textContent = `${from} to ${to}`;
    document.getElementById('modal-subtitle').textContent = `${getCurrencyName(from)} to ${getCurrencyName(to)}`;
    document.getElementById('modal-rate').textContent = `1 ${from} = ${formatCurrency(rate)} ${to}`;
    
    // Calculate real change from chart data
    const chartData = await getTimeSeriesData(from, to, currentTimeRange);
    const firstValue = chartData[0]?.value || rate;
    const lastValue = chartData[chartData.length - 1]?.value || rate;
    const change = calculateChange(lastValue, firstValue);
    const isPositive = change >= 0;
    
    const changeEl = document.getElementById('modal-change');
    changeEl.className = isPositive ? 'positive' : 'negative';
    changeEl.textContent = `${isPositive ? '↗' : '↘'} ${isPositive ? 'Up' : 'Down'} by ${formatPercentage(Math.abs(change))}% (${formatCurrency(Math.abs(change * rate / 100))} ${to})`;
    
    document.getElementById('detail-favorite').textContent = Favorites.isFavorite(from, to) ? '⭐' : '☆';
    document.getElementById('modal-convert-btn').textContent = `Convert ${from} to ${to}`;
    
    const canvas = document.getElementById('detail-chart');
    drawDetailChart(canvas, chartData, isPositive);
    
    modal.classList.remove('hidden');
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('currency-detail-modal').classList.add('hidden');
}

// Toggle favorite
function toggleDetailFavorite() {
    if (!currentDetailPair) return;
    
    const { from, to } = currentDetailPair;
    const btn = document.getElementById('detail-favorite');
    
    if (Favorites.isFavorite(from, to)) {
        Favorites.remove(from, to);
        btn.textContent = '☆';
    } else {
        Favorites.add(from, to);
        btn.textContent = '⭐';
    }
    
    loadFavorites();
}

// Select time range
async function selectTimeRange(range) {
    currentTimeRange = range;
    
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.range === range);
    });
    
    if (currentDetailPair) {
        const { from, to } = currentDetailPair;
        const chartData = await getTimeSeriesData(from, to, range);
        
        // Calculate change from chart data
        const firstValue = chartData[0]?.value || 1;
        const lastValue = chartData[chartData.length - 1]?.value || 1;
        const change = calculateChange(lastValue, firstValue);
        const isPositive = change >= 0;
        
        const canvas = document.getElementById('detail-chart');
        drawDetailChart(canvas, chartData, isPositive);
    }
}

// Update converter
function updateConverter() {
    const fromAmount = parseFloat(document.getElementById('from-amount').value) || 0;
    const rate = getExchangeRate(currentFromCurrency, currentToCurrency);
    
    if (rate && rate > 0) {
        const toAmount = fromAmount * rate;
        document.getElementById('to-amount').value = toAmount.toFixed(2);
        document.getElementById('exchange-rate-text').textContent = 
            `1 ${currentFromCurrency} = ${formatCurrency(rate)} ${currentToCurrency} at the mid-market rate`;
    } else {
        document.getElementById('to-amount').value = '0.00';
        document.getElementById('exchange-rate-text').textContent = 'Loading...';
    }
    
    const fromIcon = getCurrencyIcon(currentFromCurrency);
    const toIcon = getCurrencyIcon(currentToCurrency);
    
    document.querySelector('#from-currency .currency-icon').src = fromIcon;
    document.querySelector('#from-currency .currency-code').textContent = currentFromCurrency;
    document.querySelector('#to-currency .currency-icon').src = toIcon;
    document.querySelector('#to-currency .currency-code').textContent = currentToCurrency;
}

// Swap currencies
function swapCurrencies() {
    [currentFromCurrency, currentToCurrency] = [currentToCurrency, currentFromCurrency];
    updateConverter();
}

// Currency selector
function openCurrencySelectorForConverter(type) {
    selectingFor = type;
    openCurrencySelector();
}

function openCurrencySelector() {
    populateCurrencyLists();
    document.getElementById('currency-selector-modal').classList.remove('hidden');
}

function closeCurrencySelector() {
    document.getElementById('currency-selector-modal').classList.add('hidden');
    selectingFor = null;
}

function populateCurrencyLists() {
    const suggested = document.getElementById('suggested-currencies');
    const all = document.getElementById('all-currencies');
    
    suggested.innerHTML = '';
    all.innerHTML = '';
    
    SUGGESTED_CURRENCIES.forEach(code => {
        suggested.appendChild(createCurrencyOption(code));
    });
    
    Object.keys(CURRENCY_DATA).forEach(code => {
        if (!SUGGESTED_CURRENCIES.includes(code)) {
            all.appendChild(createCurrencyOption(code));
        }
    });
}

function createCurrencyOption(code) {
    const div = document.createElement('div');
    div.className = 'currency-option';
    div.onclick = () => selectCurrency(code);
    
    const icon = getCurrencyIcon(code);
    const name = getCurrencyName(code);
    
    div.innerHTML = `
        <img src="${icon}" alt="${code}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2212%22 fill=%22%23666%22%3E${code}%3C/text%3E%3C/svg%3E'">
        <div class="currency-option-info">
            <div class="currency-option-code">${code}</div>
            <div class="currency-option-name">${name}</div>
        </div>
    `;
    
    return div;
}

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
        const selectedFrom = document.getElementById('selected-from').dataset.currency;
        
        if (!selectedFrom) {
            document.getElementById('selected-from').dataset.currency = code;
            document.getElementById('selected-from').innerHTML = `<img src="${getCurrencyIcon(code)}" style="width:24px;height:24px;border-radius:50%;"><span>${code}</span>`;
        } else {
            Favorites.add(selectedFrom, code);
            loadFavorites();
            closeCurrencySelector();
            document.getElementById('selected-from').dataset.currency = '';
            document.getElementById('selected-from').innerHTML = '<span>Select currency</span>';
        }
    }
}

function swapSelection() {
    const from = document.getElementById('selected-from');
    const to = document.getElementById('selected-to');
    const temp = { currency: from.dataset.currency, html: from.innerHTML };
    from.dataset.currency = to.dataset.currency;
    from.innerHTML = to.innerHTML;
    to.dataset.currency = temp.currency;
    to.innerHTML = temp.html;
}

function filterCurrencies() {
    const term = document.getElementById('currency-search-input').value.toLowerCase();
    document.querySelectorAll('.currency-option').forEach(opt => {
        const code = opt.querySelector('.currency-option-code').textContent.toLowerCase();
        const name = opt.querySelector('.currency-option-name').textContent.toLowerCase();
        opt.style.display = (code.includes(term) || name.includes(term)) ? 'flex' : 'none';
    });
}

// Theme management
function applyTheme(mode) {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    const colors = mode === 'off' ? {
        '--bg-primary': '#ffffff', '--bg-secondary': '#f5f5f5', '--bg-tertiary': '#e0e0e0',
        '--text-primary': '#000000', '--text-secondary': '#666666', '--border': '#d0d0d0'
    } : {
        '--bg-primary': '#000000', '--bg-secondary': '#1a1a1a', '--bg-tertiary': '#2a2a2a',
        '--text-primary': '#ffffff', '--text-secondary': '#b0b0b0', '--border': '#3a3a3a'
    };
    
    Object.entries(colors).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    Storage.set('theme', mode);
}

function loadSavedTheme() {
    const theme = Storage.get('theme') || 'auto';
    applyTheme(theme);
}

// Terms modal
function openTermsModal() {
    document.getElementById('terms-modal').classList.remove('hidden');
}

function closeTermsModal() {
    document.getElementById('terms-modal').classList.add('hidden');
}
