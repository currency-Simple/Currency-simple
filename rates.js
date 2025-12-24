import { CONFIG, getCurrencyIconRates } from './config.js';
import { getCacheInfo, fetchAllRates, getExchangeRate, fetchChartData } from './converter.js';
import storageManager from './storage.js';

// تخزين الأزواج المفضلة
let favoritePairs = [
    { from: 'USD', to: 'GBP' },
    { from: 'USD', to: 'CAD' },
    { from: 'USD', to: 'CHF' },
    { from: 'CHF', to: 'USD' },
    { from: 'USD', to: 'EUR' }
];

// تحميل المفضلات
export function loadFavorites() {
    try {
        const saved = localStorage.getItem('currencykik_favorites');
        if (saved) {
            favoritePairs = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// حفظ المفضلات
function saveFavorites() {
    try {
        localStorage.setItem('currencykik_favorites', JSON.stringify(favoritePairs));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

// عرض الأسعار
export async function updateRatesDisplay() {
    const ratesContainer = document.getElementById('ratesContainer');
    
    if (!ratesContainer) return;
    
    ratesContainer.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        await fetchAllRates();
        const cacheInfo = getCacheInfo();
        const rates = cacheInfo.data;
        
        ratesContainer.innerHTML = '';
        
        if (favoritePairs.length === 0) {
            ratesContainer.innerHTML = `
                <div class="no-rates">
                    <span class="icon">📊</span>
                    <div>No currencies added</div>
                    <div style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                        Press + to add currencies
                    </div>
                </div>
            `;
            return;
        }
        
        for (const pair of favoritePairs) {
            const rateItem = await createRateItem(pair.from, pair.to, rates);
            if (rateItem) {
                ratesContainer.appendChild(rateItem);
            }
        }
        
    } catch (error) {
        console.error('Error loading rates:', error);
        ratesContainer.innerHTML = '<div class="error">Failed to load rates</div>';
    }
}

// إنشاء عنصر سعر مع الأيقونات والـ Chart
async function createRateItem(from, to, rates) {
    try {
        const item = document.createElement('div');
        item.className = 'rate-item';
        
        let currentRate = rates && rates[from] && rates[from][to] ? rates[from][to] : null;
        
        if (!currentRate) {
            currentRate = await getExchangeRate(from, to);
        }
        
        const rate = currentRate ? currentRate.toFixed(4) : '---';
        
        // تحميل الأيقونات - باستخدام الإصدار x للصور
        const fromIcon = await storageManager.cacheImage(getCurrencyIconRates(from), from);
        const toIcon = await storageManager.cacheImage(getCurrencyIconRates(to), to);
        
        // جلب بيانات الـ Chart
        const chartData = await fetchChartData(from, to);
        
        item.innerHTML = `
            <div class="rate-item-left">
                <div class="currency-icons-double">
                    <div class="currency-icon-small">
                        <img src="${fromIcon}" alt="${from}" class="currency-flag">
                    </div>
                    <span class="equals-icon">=</span>
                    <div class="currency-icon-small">
                        <img src="${toIcon}" alt="${to}" class="currency-flag">
                    </div>
                </div>
                <div class="rate-content">
                    <div class="rate-value-with-icons">
                        <span class="currency-code">${from}</span>
                        <span class="equals-sign">=</span>
                        <span class="rate-number">${rate}</span>
                        <span class="currency-code">${to}</span>
                    </div>
                </div>
                ${chartData.html || ''}
            </div>
            <button class="remove-rate-btn" data-from="${from}" data-to="${to}">×</button>
        `;
        
        // حدث النقر للانتقال للمحول
        item.onclick = (e) => {
            if (e.target.closest('.remove-rate-btn')) return;
            
            const currency1Select = document.getElementById('currency1');
            const currency2Select = document.getElementById('currency2');
            
            if (currency1Select && currency2Select) {
                currency1Select.value = from;
                currency2Select.value = to;
                
                updateConverterIcons(from, to);
                
                const amount1 = document.getElementById('amount1');
                if (amount1 && amount1.value) {
                    setTimeout(() => {
                        amount1.dispatchEvent(new Event('input'));
                    }, 100);
                }
                
                window.showPage('convert');
            }
        };
        
        // حدث حذف الزوج
        const removeBtn = item.querySelector('.remove-rate-btn');
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeFavorite(from, to);
        };
        
        return item;
    } catch (error) {
        console.error('Error creating rate item:', error);
        return null;
    }
}

// إزالة من المفضلة
function removeFavorite(from, to) {
    const index = favoritePairs.findIndex(
        pair => pair.from === from && pair.to === to
    );
    
    if (index !== -1) {
        favoritePairs.splice(index, 1);
        saveFavorites();
        updateRatesDisplay();
    }
}

// تحديث الأيقونات
function updateConverterIcons(from, to) {
    try {
        const icon1 = document.getElementById('icon1');
        const icon2 = document.getElementById('icon2');
        
        if (icon1) {
            const icon1Elem = icon1.querySelector('img') || document.createElement('img');
            icon1Elem.src = `https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/101-currency-usd.png`;
            icon1Elem.alt = from;
            if (!icon1.querySelector('img')) {
                icon1.innerHTML = '';
                icon1.appendChild(icon1Elem);
            }
        }
        
        if (icon2) {
            const icon2Elem = icon2.querySelector('img') || document.createElement('img');
            icon2Elem.src = `https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/121-currency-sar.png`;
            icon2Elem.alt = to;
            if (!icon2.querySelector('img')) {
                icon2.innerHTML = '';
                icon2.appendChild(icon2Elem);
            }
        }
    } catch (error) {
        console.error('Error updating icons:', error);
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
                <h3>Add Currency</h3>
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
            const exists = favoritePairs.some(
                pair => pair.from === from && pair.to === to
            );
            
            if (!exists) {
                favoritePairs.push({ from, to });
                saveFavorites();
                updateRatesDisplay();
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
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>Delete All</h3>
                <button class="close-dialog">&times;</button>
            </div>
            <div class="dialog-body">
                <div style="color: var(--text-secondary); margin-bottom: 20px; font-size: 14px; text-align: center;">
                    Are you sure you want to delete all currency pairs?
                </div>
                <div class="dialog-actions">
                    <button class="dialog-btn cancel-btn">Cancel</button>
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
        favoritePairs = [];
        saveFavorites();
        updateRatesDisplay();
        closeDialog();
    };
    
    // حدث Escape
    const escapeHandler = (e) => e.key === 'Escape' && closeDialog();
    document.addEventListener('keydown', escapeHandler);
}

// إضافة/إزالة من المفضلة
export function toggleFavorite(from, to) {
    const index = favoritePairs.findIndex(
        pair => pair.from === from && pair.to === to
    );
    
    if (index === -1) {
        favoritePairs.push({ from, to });
    } else {
        favoritePairs.splice(index, 1);
    }
    
    saveFavorites();
    updateRatesDisplay();
}
