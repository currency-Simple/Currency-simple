import { CONFIG, getCurrencyIconRates } from './config.js';
import { getCacheInfo, fetchAllRates, getExchangeRate, fetchChartData } from './converter.js';
import storageManager from './storage.js';

// تخزين الأزواج المفضلة
let favoritePairs = [];

// تحميل المفضلات
export function loadFavorites() {
    try {
        const saved = localStorage.getItem('currencykik_favorites');
        if (saved) {
            favoritePairs = JSON.parse(saved);
            console.log('المفضلات المحملة:', favoritePairs);
        } else {
            // استخدام المفضلات الافتراضية
            favoritePairs = CONFIG.DEFAULT_FAVORITE_PAIRS;
            saveFavorites();
        }
    } catch (error) {
        console.error('خطأ في تحميل المفضلات:', error);
        favoritePairs = CONFIG.DEFAULT_FAVORITE_PAIRS;
    }
}

// حفظ المفضلات
function saveFavorites() {
    try {
        localStorage.setItem('currencykik_favorites', JSON.stringify(favoritePairs));
    } catch (error) {
        console.error('خطأ في حفظ المفضلات:', error);
    }
}

// عرض الأسعار
export async function updateRatesDisplay() {
    const ratesContainer = document.getElementById('ratesContainer');
    
    if (!ratesContainer) return;
    
    ratesContainer.innerHTML = '<div class="loading">جاري التحميل...</div>';
    
    try {
        await fetchAllRates();
        
        if (favoritePairs.length === 0) {
            ratesContainer.innerHTML = `
                <div class="no-rates">
                    <span class="icon">📊</span>
                    <div>لا توجد عملات مضافة</div>
                    <div style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                        اضغط على + لإضافة عملات
                    </div>
                </div>
            `;
            return;
        }
        
        ratesContainer.innerHTML = '';
        
        for (const pair of favoritePairs) {
            const rateItem = await createRateItem(pair.from, pair.to);
            if (rateItem) {
                ratesContainer.appendChild(rateItem);
            }
        }
        
    } catch (error) {
        console.error('خطأ في تحميل الأسعار:', error);
        ratesContainer.innerHTML = '<div class="error">فشل في تحميل الأسعار</div>';
    }
}

// إنشاء عنصر سعر
async function createRateItem(from, to) {
    try {
        const rate = await getExchangeRate(from, to);
        const fromIcon = getCurrencyIconRates(from);
        const toIcon = getCurrencyIconRates(to);
        
        const item = document.createElement('div');
        item.className = 'rate-item';
        
        item.innerHTML = `
            <div class="rate-item-left">
                <div class="currency-icons-double">
                    <div class="currency-icon-small">
                        <img src="${fromIcon}" alt="${from}">
                    </div>
                    <span class="equals-icon">=</span>
                    <div class="currency-icon-small">
                        <img src="${toIcon}" alt="${to}">
                    </div>
                </div>
                <div class="rate-content">
                    <div class="rate-value-with-icons">
                        <span class="currency-code">${from}</span>
                        <span class="equals-sign">=</span>
                        <span class="rate-number">${rate ? rate.toFixed(4) : '---'}</span>
                        <span class="currency-code">${to}</span>
                    </div>
                </div>
            </div>
            <button class="remove-rate-btn" data-from="${from}" data-to="${to}">×</button>
        `;
        
        // حدث النقر للانتقال للمحول
        item.addEventListener('click', (e) => {
            if (e.target.closest('.remove-rate-btn')) return;
            
            const currency1 = document.getElementById('currency1');
            const currency2 = document.getElementById('currency2');
            
            if (currency1 && currency2) {
                currency1.value = from;
                currency2.value = to;
                
                // تحديث المحول
                if (typeof window.showPage === 'function') {
                    window.showPage('convert');
                }
            }
        });
        
        // حدث حذف الزوج
        const removeBtn = item.querySelector('.remove-rate-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(from, to);
        });
        
        return item;
    } catch (error) {
        console.error('خطأ في إنشاء عنصر السعر:', error);
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

// عرض نافذة إضافة عملات
export function showAddCurrencyDialog() {
    console.log('فتح نافذة إضافة عملة...');
    
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    const currenciesHTML = CONFIG.CURRENCIES_RATES.map(currency => 
        `<option value="${currency.code}">${currency.code} - ${currency.name}</option>`
    ).join('');
    
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>إضافة عملة</h3>
                <button class="close-dialog">&times;</button>
            </div>
            <div class="dialog-body">
                <div class="selection-group">
                    <label>من العملة:</label>
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
                    <label>إلى العملة:</label>
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
                    <button class="dialog-btn cancel-btn">إلغاء</button>
                    <button class="dialog-btn add-btn-dialog">إضافة</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // حدث إغلاق النافذة
    const closeDialog = () => {
        document.body.removeChild(dialog);
    };
    
    dialog.querySelector('.close-dialog').addEventListener('click', closeDialog);
    dialog.querySelector('.cancel-btn').addEventListener('click', closeDialog);
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) closeDialog();
    });
    
    // حدث إضافة العملة
    dialog.querySelector('.add-btn-dialog').addEventListener('click', () => {
        const fromSelect = dialog.querySelector('#addFromCurrency');
        const toSelect = dialog.querySelector('#addToCurrency');
        
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
                alert('زوج العملات هذا موجود بالفعل!');
            }
        } else {
            alert('الرجاء اختيار عملتين مختلفتين');
        }
    });
}

// عرض نافذة حذف عملات
export function showDeleteCurrencyDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>حذف الكل</h3>
                <button class="close-dialog">&times;</button>
            </div>
            <div class="dialog-body">
                <div style="color: var(--text-secondary); margin-bottom: 20px; font-size: 14px; text-align: center;">
                    هل أنت متأكد من حذف جميع أزواج العملات؟
                </div>
                <div class="dialog-actions">
                    <button class="dialog-btn cancel-btn">إلغاء</button>
                    <button class="dialog-btn delete-all-btn">حذف الكل</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const closeDialog = () => {
        document.body.removeChild(dialog);
    };
    
    dialog.querySelector('.close-dialog').addEventListener('click', closeDialog);
    dialog.querySelector('.cancel-btn').addEventListener('click', closeDialog);
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) closeDialog();
    });
    
    // حدث حذف الكل
    dialog.querySelector('.delete-all-btn').addEventListener('click', () => {
        favoritePairs = [];
        saveFavorites();
        updateRatesDisplay();
        closeDialog();
    });
}
