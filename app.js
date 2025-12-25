import { CONFIG, getCurrencyIconConvert } from './config.js';
import { convertCurrency, getExchangeRate, loadCacheFromStorage, fetchAllRates } from './converter.js';
import { updateRatesDisplay, loadFavorites, showAddCurrencyDialog, showDeleteCurrencyDialog } from './rates.js';
import { initSettings, initSettingsPage } from './settings.js';
import storageManager from './storage.js';

// المتغيرات العامة
let currentPage = 'convert';

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    console.log('بدء تحميل محول العملات...');
    initApp();
});

async function initApp() {
    try {
        // تحميل الإعدادات
        initSettings();
        loadCacheFromStorage();
        loadFavorites();
        
        // تهيئة العناصر
        initElements();
        
        // تعيين الأحداث
        setupEvents();
        
        // تحميل البيانات
        await loadInitialData();
        
        // تحديث العرض
        await updateDisplay();
        
        console.log('التطبيق جاهز للاستخدام!');
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
    }
}

function initElements() {
    // تحديث الأيقونات
    updateCurrencyIcons();
    
    // ملء قوائم العملات
    populateCurrencySelects();
}

function populateCurrencySelects() {
    const currency1 = document.getElementById('currency1');
    const currency2 = document.getElementById('currency2');
    
    if (currency1 && currency2) {
        // مسح المحتوى القديم
        currency1.innerHTML = '';
        currency2.innerHTML = '';
        
        // إضافة العملات
        CONFIG.CURRENCIES_CONVERT.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency.code;
            option1.textContent = `${currency.code} - ${currency.name}`;
            currency1.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = currency.code;
            option2.textContent = `${currency.code} - ${currency.name}`;
            currency2.appendChild(option2);
        });
        
        // تعيين القيم الافتراضية
        currency1.value = 'USD';
        currency2.value = 'SAR';
    }
}

async function updateCurrencyIcons() {
    const currency1 = document.getElementById('currency1');
    const currency2 = document.getElementById('currency2');
    const icon1 = document.getElementById('icon1');
    const icon2 = document.getElementById('icon2');
    
    if (currency1 && icon1) {
        const fromCode = currency1.value || 'USD';
        const fromIcon = getCurrencyIconConvert(fromCode);
        icon1.innerHTML = `<img src="${fromIcon}" alt="${fromCode}">`;
    }
    
    if (currency2 && icon2) {
        const toCode = currency2.value || 'SAR';
        const toIcon = getCurrencyIconConvert(toCode);
        icon2.innerHTML = `<img src="${toIcon}" alt="${toCode}">`;
    }
}

function setupEvents() {
    console.log('جاري إعداد الأحداث...');
    
    // زر التبديل
    const swapBtn = document.getElementById('swapBtn');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCurrencies);
    }
    
    // حقل الإدخال
    const amountInput1 = document.getElementById('amount1');
    if (amountInput1) {
        amountInput1.addEventListener('input', performConversion);
    }
    
    // تغيير العملات
    const currency1 = document.getElementById('currency1');
    const currency2 = document.getElementById('currency2');
    
    if (currency1) {
        currency1.addEventListener('change', async () => {
            await updateCurrencyIcons();
            await updateDisplay();
            await performConversion();
        });
    }
    
    if (currency2) {
        currency2.addEventListener('change', async () => {
            await updateCurrencyIcons();
            await updateDisplay();
            await performConversion();
        });
    }
    
    // أزرار التنقل
    document.getElementById('navRates')?.addEventListener('click', () => showPage('rates'));
    document.getElementById('navConvert')?.addEventListener('click', () => showPage('convert'));
    document.getElementById('navSettings')?.addEventListener('click', () => showPage('settings'));
    
    // أزرار المفضلة
    document.getElementById('addFavoriteBtn')?.addEventListener('click', showAddCurrencyDialog);
    document.getElementById('deleteFavoriteBtn')?.addEventListener('click', showDeleteCurrencyDialog);
}

async function loadInitialData() {
    try {
        const hasFreshRates = storageManager.hasFreshRates();
        
        if (!hasFreshRates) {
            console.log('جارٍ جلب الأسعار الجديدة...');
            await fetchAllRates();
        } else {
            console.log('جارٍ استخدام الأسعار المخزنة');
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

async function performConversion() {
    const amountInput1 = document.getElementById('amount1');
    const amountInput2 = document.getElementById('amount2');
    const currency1 = document.getElementById('currency1');
    const currency2 = document.getElementById('currency2');
    
    if (!amountInput1 || !amountInput2 || !currency1 || !currency2) return;
    
    const amount = parseFloat(amountInput1.value);
    const from = currency1.value;
    const to = currency2.value;
    
    if (isNaN(amount) || amount <= 0) {
        amountInput2.value = '';
        return;
    }
    
    amountInput2.value = '...';
    
    try {
        const result = await convertCurrency(amount, from, to);
        
        if (result.success) {
            amountInput2.value = result.convertedAmount.toFixed(2);
            await updateRateDisplay();
        } else {
            amountInput2.value = 'Error';
        }
    } catch (error) {
        amountInput2.value = 'Error';
        console.error('خطأ في التحويل:', error);
    }
}

async function updateRateDisplay() {
    const currency1 = document.getElementById('currency1');
    const currency2 = document.getElementById('currency2');
    const rateDisplay = document.getElementById('rateDisplay');
    
    if (!currency1 || !currency2 || !rateDisplay) return;
    
    const from = currency1.value;
    const to = currency2.value;
    
    try {
        const rate = await getExchangeRate(from, to);
        
        if (rate) {
            rateDisplay.innerHTML = `<span>${from} = ${rate.toFixed(4)} ${to}</span> at the mid-market 1 rate`;
        }
    } catch (error) {
        rateDisplay.innerHTML = `<span>${from} = --- ${to}</span> at the mid-market 1 rate`;
    }
}

async function swapCurrencies() {
    const currency1 = document.getElementById('currency1');
    const currency2 = document.getElementById('currency2');
    const amountInput1 = document.getElementById('amount1');
    const amountInput2 = document.getElementById('amount2');
    
    if (!currency1 || !currency2 || !amountInput1 || !amountInput2) return;
    
    // حفظ القيم القديمة
    const tempCurrency = currency1.value;
    const tempAmount = amountInput1.value;
    
    // تبديل القيم
    currency1.value = currency2.value;
    currency2.value = tempCurrency;
    
    // تبديل المبالغ
    amountInput1.value = amountInput2.value;
    amountInput2.value = tempAmount;
    
    // تحديث الأيقونات
    await updateCurrencyIcons();
    
    // تحديث العرض
    await updateDisplay();
    
    // تنفيذ التحويل
    await performConversion();
    
    // تأثير زر التبديل
    const swapBtn = document.getElementById('swapBtn');
    if (swapBtn) {
        swapBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            swapBtn.style.transform = 'scale(1)';
        }, 150);
    }
}

async function updateDisplay() {
    await updateRateDisplay();
    
    if (currentPage === 'rates') {
        await updateRatesDisplay();
    } else if (currentPage === 'settings') {
        initSettingsPage();
    }
}

// دالة عرض الصفحات (متاحة عالمياً)
window.showPage = function(page) {
    currentPage = page;
    
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
    
    // تحديث العرض حسب الصفحة
    updateDisplay();
};

// جعل الدوال متاحة عالمياً
window.performConversion = performConversion;
window.swapCurrencies = swapCurrencies;
