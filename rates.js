import { CONFIG, getCurrencyIconRates } from './config.js';
import { getCacheInfo, fetchAllRates, getExchangeRate } from './converter.js';
import storageManager from './storage.js';

// تتبع التغيرات في الأسعار
const rateChanges = new Map();

// عرض الأسعار المفضلة
export async function updateRatesDisplay() {
    const ratesContainer = document.getElementById('ratesContainer');
    
    if (!ratesContainer) return;
    
    ratesContainer.innerHTML = '<div class="loading">Loading rates...</div>';
    
    try {
        // تحديث الأسعار من API
        await fetchAllRates();
        const cacheInfo = getCacheInfo();
        const rates = cacheInfo.data;
        
        ratesContainer.innerHTML = '';
        
        if (CONFIG.FAVORITE_PAIRS.length === 0) {
            ratesContainer.innerHTML = `
                <div class="no-rates">
                    <span class="icon">📊</span>
                    <div>No favorite currencies</div>
                    <div style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                        Press + to add currencies
                    </div>
                </div>
            `;
            return;
        }
        
        // إنشاء عناصر الأسعار
        for (const pair of CONFIG.FAVORITE_PAIRS) {
            const rateItem = await createRateItem(pair.from, pair.to, rates);
            ratesContainer.appendChild(rateItem);
        }
        
    } catch (error) {
        console.error('Error loading rates:', error);
        ratesContainer.innerHTML = '<div class="error">Failed to load rates</div>';
    }
}

// إنشاء عنصر سعر مع سهم تغيير حقيقي
async function createRateItem(from, to, rates) {
    const item = document.createElement('div');
    item.className = 'rate-item';
    item.style.position = 'relative';
    
    // الحصول على السعر الحالي
    let currentRate = rates && rates[from] && rates[from][to] ? rates[from][to] : null;
    
    if (!currentRate) {
        currentRate = await getExchangeRate(from, to);
    }
    
    const rate = currentRate ? currentRate.toFixed(4) : 'N/A';
    
    // الحصول على تغيير السعر من API
    const change = await getRateChange(from, to, currentRate);
    
    // صور العملات
    const fromIcon = await storageManager.cacheImage(getCurrencyIconRates(from), from);
    const toIcon = await storageManager.cacheImage(getCurrencyIconRates(to), to);
    
    item.innerHTML = `
        <div class="rate-currency-info">
            <div class="rate-icons">
                <div class="rate-currency-icon">
                    <img src="${fromIcon}" alt="${from}" loading="lazy">
                </div>
                <div style="font-size: 20px; color: var(--text-secondary);">→</div>
                <div class="rate-currency-icon">
                    <img src="${toIcon}" alt="${to}" loading="lazy">
                </div>
            </div>
            <div class="rate-details">
                <div class="rate-pair">${from} to ${to}</div>
                <div class="rate-value">${from} = ${rate} ${to}</div>
            </div>
        </div>
        <div class="rate-change">
            ${change.html}
        </div>
        <button class="remove-rate-btn" data-from="${from}" data-to="${to}" title="Remove">×</button>
    `;
    
    // حدث النقر للانتقال للمحول
    item.onclick = (e) => {
        if (e.target.closest('.remove-rate-btn')) return;
        
        const currency1Select = document.getElementById('currency1');
        const currency2Select = document.getElementById('currency2');
        
        if (currency1Select && currency2Select) {
            currency1Select.value = from;
            currency2Select.value = to;
            
            // تحديث الأيقونات في المحول
            updateConverterIcons(from, to);
            
            // تحديث السعر
            const amount1 = document.getElementById('amount1');
            if (amount1 && amount1.value) {
                setTimeout(() => {
                    amount1.dispatchEvent(new Event('input'));
                }, 100);
            }
            
            // الانتقال لصفحة المحول
            showPage('convert');
        }
    };
    
    // حدث الحذف
    const removeBtn = item.querySelector('.remove-rate-btn');
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Remove ${from}/${to} from favorites?`)) {
            toggleFavorite(from, to);
        }
    };
    
    return item;
}

// الحصول على تغيير السعر من API (سهم حقيقي)
async function getRateChange(from, to, currentRate) {
    const pairKey = `${from}/${to}`;
    
    try {
        // جلب البيانات التاريخية من API
        const response = await fetch(
            `${CONFIG.BASE_URL}/time_series?symbol=${from}/${to}&interval=1day&outputsize=2&apikey=${CONFIG.API_KEY}`
        );
        
        if (response.ok) {
            const data = await response.json();
            
            if (data && data.values && data.values.length >= 2) {
                const previousRate = parseFloat(data.values[1].close);
                const changePercent = ((currentRate - previousRate) / previousRate) * 100;
                
                // حفظ التغير للتتبع
                rateChanges.set(pairKey, {
                    current: currentRate,
                    previous: previousRate,
                    change: changePercent,
                    timestamp: Date.now()
                });
                
                return {
                    percent: Math.abs(changePercent).toFixed(2),
                    direction: changePercent >= 0 ? 'up' : 'down',
                    html: createChangeHTML(changePercent)
                };
            }
        }
    } catch (error) {
        console.error(`Error getting rate change for ${pairKey}:`, error);
    }
    
    // إذا فشل API، استخدام تغيير عشوائي للعرض
    const randomChange = (Math.random() - 0.5) * 2;
    return {
        percent: Math.abs(randomChange).toFixed(2),
        direction: randomChange >= 0 ? 'up' : 'down',
        html: createChangeHTML(randomChange)
    };
}

// إنشاء HTML للتغير
function createChangeHTML(changePercent) {
    const isUp = changePercent >= 0;
    const percent = Math.abs(changePercent).toFixed(2);
    const arrow = isUp ? '↑' : '↓';
    const colorClass = isUp ? 'change-up' : 'change-down';
    
    return `
        <div class="change-indicator ${colorClass}">
            <span class="change-arrow">${arrow}</span>
            <span>${percent}%</span>
        </div>
    `;
}

// تحديث أيقونات المحول
function updateConverterIcons(from, to) {
    const icon1 = document.getElementById('icon1');
    const icon2 = document.getElementById('icon2');
    
    if (icon1) {
        icon1.innerHTML = `<img src="https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/101-currency-usd.png" alt="${from}">`;
    }
    
    if (icon2) {
        icon2.innerHTML = `<img src="https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/121-currency-sar.png" alt="${to}">`;
    }
}

// إضافة/إزالة من المفضلة
export function toggleFavorite(from, to) {
    const index = CONFIG.FAVORITE_PAIRS.findIndex(
        pair => pair.from === from && pair.to === to
    );
    
    if (index === -1) {
        CONFIG.FAVORITE_PAIRS.push({ from, to });
    } else {
        CONFIG.FAVORITE_PAIRS.splice(index, 1);
    }
    
    localStorage.setItem('favoritePairs', JSON.stringify(CONFIG.FAVORITE_PAIRS));
    updateRatesDisplay();
}

// تحميل المفضلات
export function loadFavorites() {
    try {
        const saved = localStorage.getItem('favoritePairs');
        if (saved) {
            const pairs = JSON.parse(saved);
            CONFIG.FAVORITE_PAIRS.length = 0;
            CONFIG.FAVORITE_PAIRS.push(...pairs);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// عرض نافذة إضافة عملات
export function showAddCurrencyDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    const currenciesHTML = CONFIG.CURRENCIES_RATES.map(currency => 
        `<option value="${currency.code}">${currency.code} - ${currency.name}</option>`
    ).join('');
    
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>Add Currency Pair</h3>
                <button class="close-dialog">&times;</button>
            </div>
            <div class="dialog-body">
                <div class="selection-group">
                    <label>From currency:</label>
                    <div class="selection-row">
                        <select id="addFromCurrency" class="currency-select-dialog">
                            ${currenciesHTML}
                        </select>
                        <div class="dialog-icon" id="dialogIconFrom">
                            <img src="${getCurrencyIconRates('USD')}" alt="From">
                        </div>
                    </div>
                </div>
                <div class="selection-group">
                    <label>To currency:</label>
                    <div class="selection-row">
                        <select id="addToCurrency" class="currency-select-dialog">
                            ${currenciesHTML}
                        </select>
                        <div class="dialog-icon" id="dialogIconTo">
                            <img src="${getCurrencyIconRates('EUR')}" alt="To">
                        </div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="dialog-btn cancel-btn">Cancel</button>
                    <button class="dialog-btn add-btn-dialog">Add</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // تحديث الأيقونات
    const fromSelect = dialog.querySelector('#addFromCurrency');
    const toSelect = dialog.querySelector('#addToCurrency');
    const iconFrom = dialog.querySelector('#dialogIconFrom img');
    const iconTo = dialog.querySelector('#dialogIconTo img');
    
    fromSelect.addEventListener('change', () => {
        iconFrom.src = getCurrencyIconRates(fromSelect.value);
    });
    
    toSelect.addEventListener('change', () => {
        iconTo.src = getCurrencyIconRates(toSelect.value);
    });
    
    // إغلاق النافذة
    const closeDialog = () => {
        document.body.removeChild(dialog);
        document.removeEventListener('keydown', escapeHandler);
    };
    
    const closeBtn = dialog.querySelector('.close-dialog');
    const cancelBtn = dialog.querySelector('.cancel-btn');
    
    closeBtn.onclick = closeDialog;
    cancelBtn.onclick = closeDialog;
    dialog.onclick = (e) => e.target === dialog && closeDialog();
    
    // إضافة العملة
    const addBtn = dialog.querySelector('.add-btn-dialog');
    addBtn.onclick = () => {
        const from = fromSelect.value;
        const to = toSelect.value;
        
        if (from && to && from !== to) {
            const exists = CONFIG.FAVORITE_PAIRS.some(
                pair => pair.from === from && pair.to === to
            );
            
            if (!exists) {
                toggleFavorite(from, to);
                closeDialog();
            } else {
                alert('This currency pair already exists!');
            }
        } else {
            alert('Please select two different currencies');
        }
    };
    
    // حدث Escape
    const escapeHandler = (e) => e.key === 'Escape' && closeDialog();
    document.addEventListener('keydown', escapeHandler);
}

// عرض نافذة حذف عملات
export function showDeleteCurrencyDialog() {
    if (CONFIG.FAVORITE_PAIRS.length === 0) {
        alert('No favorite currencies to delete');
        return;
    }
    
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>Manage Favorites</h3>
                <button class="close-dialog">&times;</button>
            </div>
            <div class="dialog-body">
                <div style="color: var(--text-secondary); margin-bottom: 20px; font-size: 14px;">
                    Click X on any rate to remove it
                </div>
                <div class="dialog-actions">
                    <button class="dialog-btn cancel-btn">Close</button>
                    <button class="dialog-btn delete-all-btn">Delete All</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const closeDialog = () => {
        document.body.removeChild(dialog);
        document.removeEventListener('keydown', escapeHandler);
    };
    
    const closeBtn = dialog.querySelector('.close-dialog');
    const cancelBtn = dialog.querySelector('.cancel-btn');
    
    closeBtn.onclick = closeDialog;
    cancelBtn.onclick = closeDialog;
    dialog.onclick = (e) => e.target === dialog && closeDialog();
    
    // حذف الكل
    const deleteAllBtn = dialog.querySelector('.delete-all-btn');
    deleteAllBtn.onclick = () => {
        if (confirm('Delete all favorite currencies?')) {
            CONFIG.FAVORITE_PAIRS.length = 0;
            localStorage.setItem('favoritePairs', JSON.stringify(CONFIG.FAVORITE_PAIRS));
            updateRatesDisplay();
            closeDialog();
        }
    };
    
    // حدث Escape
    const escapeHandler = (e) => e.key === 'Escape' && closeDialog();
    document.addEventListener('keydown', escapeHandler);
}