import { CONFIG, getCurrencyIconConvert } from './config.js';
import { convertCurrency, getExchangeRate, loadCacheFromStorage, fetchAllRates } from './converter.js';
import { updateRatesDisplay, loadFavorites, showAddCurrencyDialog, showDeleteCurrencyDialog } from './rates.js';
import { initSettings, initSettingsPage } from './settings.js';
import storageManager from './storage.js';

// عناصر الصفحة
let amountInput1, amountInput2;
let currency1Select, currency2Select;
let swapBtn, rateDisplay;
let icon1, icon2;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Currency Converter loading...');
    
    // تهيئة العناصر أولاً
    initElements();
    
    // تهيئة قوائم العملات
    populateCurrencySelects();
    
    // تهيئة الأحداث
    initEvents();
    
    console.log('App initialized');
});

// تهيئة العناصر
function initElements() {
    console.log('Initializing elements...');
    
    amountInput1 = document.getElementById('amount1');
    amountInput2 = document.getElementById('amount2');
    currency1Select = document.getElementById('currency1');
    currency2Select = document.getElementById('currency2');
    swapBtn = document.getElementById('swapBtn');
    rateDisplay = document.getElementById('rateDisplay');
    icon1 = document.getElementById('icon1');
    icon2 = document.getElementById('icon2');
    
    console.log('Elements found:', {
        amountInput1: !!amountInput1,
        amountInput2: !!amountInput2,
        currency1Select: !!currency1Select,
        currency2Select: !!currency2Select,
        swapBtn: !!swapBtn
    });
}

// ملء قوائم العملات (للمحول)
function populateCurrencySelects() {
    console.log('Populating currency selects...');
    
    const selects = [currency1Select, currency2Select];
    
    selects.forEach(select => {
        if (!select) {
            console.error('Select element not found!');
            return;
        }
        
        select.innerHTML = '';
        CONFIG.CURRENCIES_CONVERT.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = `${currency.code} - ${currency.name}`;
            select.appendChild(option);
        });
    });
    
    // تعيين القيم الافتراضية (USD/SAR كما في الصورة)
    if (currency1Select) currency1Select.value = 'USD';
    if (currency2Select) currency2Select.value = 'SAR';
    
    console.log('Currency selects populated');
}

// تهيئة الأحداث
function initEvents() {
    console.log('Initializing events...');
    
    // تحويل عند الكتابة
    if (amountInput1) {
        amountInput1.addEventListener('input', () => {
            console.log('Amount 1 changed');
            performConversion();
        });
    }
    
    // تبديل العملات
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            console.log('Swap button clicked');
            swapCurrencies();
        });
    }
    
    // تحديث عند تغيير العملة
    if (currency1Select) {
        currency1Select.addEventListener('change', () => {
            console.log('Currency 1 changed:', currency1Select.value);
            performConversion();
        });
    }
    
    if (currency2Select) {
        currency2Select.addEventListener('change', () => {
            console.log('Currency 2 changed:', currency2Select.value);
            performConversion();
        });
    }
    
    // أزرار التنقل
    const navRates = document.getElementById('navRates');
    const navConvert = document.getElementById('navConvert');
    const navSettings = document.getElementById('navSettings');
    
    if (navRates) {
        navRates.addEventListener('click', () => {
            console.log('Rates nav clicked');
            showPage('rates');
        });
    }
    
    if (navConvert) {
        navConvert.addEventListener('click', () => {
            console.log('Convert nav clicked');
            showPage('convert');
        });
    }
    
    if (navSettings) {
        navSettings.addEventListener('click', () => {
            console.log('Settings nav clicked');
            showPage('settings');
        });
    }
    
    // أزرار المفضلة
    const addBtn = document.getElementById('addFavoriteBtn');
    const deleteBtn = document.getElementById('deleteFavoriteBtn');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            console.log('Add favorite clicked');
            showAddCurrencyDialog();
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            console.log('Delete favorite clicked');
            showDeleteCurrencyDialog();
        });
    }
    
    console.log('Events initialized');
}

// تنفيذ التحويل
async function performConversion() {
    console.log('Performing conversion...');
    
    if (!amountInput1 || !amountInput2 || !currency1Select || !currency2Select) {
        console.error('Required elements not found');
        return;
    }
    
    const amount = parseFloat(amountInput1.value);
    
    if (isNaN(amount) || amount <= 0) {
        amountInput2.value = '';
        return;
    }
    
    const from = currency1Select.value;
    const to = currency2Select.value;
    
    console.log(`Converting ${amount} ${from} to ${to}`);
    
    // إظهار تحميل
    amountInput2.value = '...';
    
    try {
        const rate = await getExchangeRate(from, to);
        console.log('Rate received:', rate);
        
        if (rate) {
            const convertedAmount = amount * rate;
            amountInput2.value = convertedAmount.toFixed(2);
            
            // تحديث عرض السعر
            if (rateDisplay) {
                rateDisplay.innerHTML = `
                    <span>${from} = ${rate.toFixed(4)} ${to}</span> at the mid-market 1 rate
                `;
            }
        } else {
            amountInput2.value = 'Error';
        }
    } catch (error) {
        console.error('Conversion error:', error);
        amountInput2.value = 'Error';
    }
}

// تبديل العملات
function swapCurrencies() {
    console.log('Swapping currencies...');
    
    if (!currency1Select || !currency2Select || !amountInput1 || !amountInput2) {
        console.error('Required elements not found');
        return;
    }
    
    // حفظ القيم
    const tempCurrency = currency1Select.value;
    const tempAmount = amountInput1.value;
    
    // تبديل العملات
    currency1Select.value = currency2Select.value;
    currency2Select.value = tempCurrency;
    
    // تبديل المبالغ
    amountInput1.value = amountInput2.value;
    amountInput2.value = tempAmount;
    
    // إعادة التحويل
    performConversion();
    
    // تأثير الزر
    swapBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        swapBtn.style.transform = 'scale(1)';
    }, 150);
}

// عرض صفحة
function showPage(page) {
    console.log('Showing page:', page);
    
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // تحديث أزرار التنقل
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // عرض الصفحة المطلوبة
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // تفعيل زر التنقل
    const navBtn = document.getElementById(`nav${page.charAt(0).toUpperCase() + page.slice(1)}`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // إجراءات خاصة بالصفحة
    if (page === 'rates') {
        updateRatesDisplay();
    } else if (page === 'settings') {
        initSettingsPage();
    }
}

// جعل الدوال متاحة عالمياً
window.performConversion = performConversion;
window.swapCurrencies = swapCurrencies;
window.showPage = showPage;
