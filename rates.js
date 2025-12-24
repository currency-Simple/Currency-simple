import { CONFIG, getCurrencyIconRates } from './config.js';
import { getCacheInfo, fetchAllRates, getExchangeRate } from './converter.js';
import storageManager from './storage.js';

// الأزواج المطلوبة
const REQUIRED_PAIRS = [
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'GBP' },
    { from: 'USD', to: 'CAD' },
    { from: 'USD', to: 'CHF' }
];

// عرض الأسعار
export async function updateRatesDisplay() {
    const ratesContainer = document.getElementById('ratesContainer');
    
    if (!ratesContainer) return;
    
    ratesContainer.innerHTML = '<div class="loading">جاري التحميل...</div>';
    
    try {
        await fetchAllRates();
        const cacheInfo = getCacheInfo();
        const rates = cacheInfo.data;
        
        ratesContainer.innerHTML = '';
        
        for (const pair of REQUIRED_PAIRS) {
            const rateItem = await createRateItem(pair.from, pair.to, rates);
            if (rateItem) {
                ratesContainer.appendChild(rateItem);
            }
        }
        
    } catch (error) {
        console.error('خطأ في تحميل الأسعار:', error);
        ratesContainer.innerHTML = '<div class="error">فشل تحميل الأسعار</div>';
    }
}

// إنشاء عنصر سعر
async function createRateItem(from, to, rates) {
    try {
        const item = document.createElement('div');
        item.className = 'rate-item';
        
        let currentRate = rates && rates[from] && rates[from][to] ? rates[from][to] : null;
        
        if (!currentRate) {
            currentRate = await getExchangeRate(from, to);
        }
        
        const rate = currentRate ? currentRate.toFixed(4) : '---';
        
        const fromIcon = await storageManager.cacheImage(getCurrencyIconRates(from), from);
        const toIcon = await storageManager.cacheImage(getCurrencyIconRates(to), to);
        
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: var(--bg-secondary);">
                        <img src="${fromIcon}" alt="${from}" loading="lazy" style="width: 100%; height: 100%; object-fit: contain; padding: 6px;">
                    </div>
                    <span style="font-size: 24px; color: var(--text-secondary);">=</span>
                    <div style="width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: var(--bg-secondary);">
                        <img src="${toIcon}" alt="${to}" loading="lazy" style="width: 100%; height: 100%; object-fit: contain; padding: 6px;">
                    </div>
                </div>
                <div style="font-size: 22px; font-weight: 700; color: var(--text-primary);">
                    ${from} = ${rate} ${to}
                </div>
            </div>
        `;
        
        item.onclick = () => {
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
        
        return item;
    } catch (error) {
        console.error('خطأ في إنشاء عنصر:', error);
        return null;
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
        console.error('خطأ في تحديث الأيقونات:', error);
    }
}

// دوال المفضلة (مبسطة)
export function loadFavorites() {
    // لا شيء - نستخدم الأزواج الثابتة
}

export function showAddCurrencyDialog() {
    alert('هذه الخاصية غير متوفرة في النسخة الحالية');
}

export function showDeleteCurrencyDialog() {
    alert('هذه الخاصية غير متوفرة في النسخة الحالية');
}

export function toggleFavorite() {
    // لا شيء
}
