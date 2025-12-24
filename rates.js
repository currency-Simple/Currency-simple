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
    
    ratesContainer.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        await fetchAllRates();
        const cacheInfo = getCacheInfo();
        const rates = cacheInfo.data;
        
        ratesContainer.innerHTML = '';
        
        for (const pair of REQUIRED_PAIRS) {
            const rateItem = await createRateItem(pair.from, pair.to, rates);
            ratesContainer.appendChild(rateItem);
        }
        
    } catch (error) {
        console.error('Error loading rates:', error);
        ratesContainer.innerHTML = '<div class="error">Failed to load rates</div>';
    }
}

// إنشاء عنصر سعر
async function createRateItem(from, to, rates) {
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
                <div class="currency-icon-small">
                    <img src="${fromIcon}" alt="${from}" loading="lazy">
                </div>
                <span style="font-size: 24px; color: var(--text-secondary);">=</span>
                <div class="currency-icon-small">
                    <img src="${toIcon}" alt="${to}" loading="lazy">
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
}

// تحديث الأيقونات
function updateConverterIcons(from, to) {
    const icon1 = document.getElementById('icon1');
    const icon2 = document.getElementById('icon2');
    
    if (icon1) {
        const iconUrl = `https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/101-currency-usd${from === 'USD' ? '' : 'x'}.png`;
        icon1.innerHTML = `<img src="${iconUrl}" alt="${from}">`;
    }
    
    if (icon2) {
        const iconUrl = `https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/100-currency-eur${to === 'EUR' ? '' : 'x'}.png`;
        icon2.innerHTML = `<img src="${iconUrl}" alt="${to}">`;
    }
}

// دوال المفضلة (مبسطة)
export function loadFavorites() { }
export function showAddCurrencyDialog() { }
export function showDeleteCurrencyDialog() { }
export function toggleFavorite() { }
