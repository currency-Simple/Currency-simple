# دليل استكشاف الأخطاء وإصلاحها

## المشاكل الشائعة وحلولها

### 1. الأسعار لا تظهر في صفحة Rates أو Convert

#### الأسباب المحتملة:
- مشكلة في الاتصال بالـ API
- استنفاد حصة الـ API
- مشكلة في التخزين المؤقت

#### الحلول:
1. **افتح Console في المتصفح** (F12 → Console)
2. **ابحث عن الرسائل التالية:**
   - ✅ رسائل النجاح: "Successfully cached X exchange rates"
   - ⚠️ رسائل التحذير: "No rate found for..."
   - ❌ رسائل الخطأ: "API Error..."

3. **تحقق من الرسائل:**

```javascript
// رسائل نجاح
✅ Using cached exchange rates. Next update in: X minutes
✅ Successfully cached 57 exchange rates
✅ API initialized successfully

// رسائل fallback
⚠️ API returned no data, using old cache
⚠️ Generating mock data as fallback

// رسائل خطأ
❌ API Error for chunk 1: 429 (too many requests)
❌ Critical error fetching exchange rates
```

### 2. استخدام البيانات التجريبية (Mock Data)

التطبيق يستخدم بيانات تجريبية تلقائياً في الحالات التالية:
- فشل الاتصال بالـ API
- انتهاء حصة الـ API اليومية
- عدم وجود بيانات مخزنة مؤقتاً

**البيانات التجريبية تشمل:**
- أسعار واقعية تقريبية لـ 57 عملة
- تحديث كل 10 دقائق (محاكاة)
- تباين عشوائي صغير (±2%)

### 3. فحص حالة الـ API

#### في Console، شغل:
```javascript
// فحص البيانات المخزنة
console.log('Cached rates:', Object.keys(exchangeRatesCache).length);

// فحص آخر تحديث
console.log('Last fetch:', new Date(lastFetchTime).toLocaleString());

// فحص سعر معين
console.log('EUR/USD:', getExchangeRate('EUR', 'USD'));

// تحديث يدوي
forceRefreshRates();
```

### 4. حدود الـ API

**Twelve Data Free Plan:**
- 800 طلب API في اليوم
- 8 طلبات في الدقيقة

**استراتيجية التطبيق:**
- طلب واحد كبير عند بدء التطبيق
- تحديث كل 10 دقائق (144 طلب/يوم)
- استخدام Cache للحد من الطلبات
- Fallback إلى Mock Data عند الحاجة

### 5. التحقق من عمل التخزين المؤقت

```javascript
// في Console
// 1. تحقق من وجود البيانات
console.log('Cache status:', {
    entries: Object.keys(exchangeRatesCache).length,
    lastUpdate: new Date(lastFetchTime).toLocaleString(),
    cacheAge: Math.round((Date.now() - lastFetchTime) / 1000 / 60) + ' minutes ago'
});

// 2. فحص صلاحية Cache
const CACHE_DURATION = 10 * 60 * 1000;
const isValid = lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION);
console.log('Cache is valid:', isValid);
```

### 6. المحول لا يعمل

#### الخطوات:
1. تحقق من Console: هل هناك خطأ؟
2. تأكد من اختيار عملتين مختلفتين
3. جرب هذا في Console:

```javascript
// اختبار المحول
console.log('From:', currentFromCurrency);
console.log('To:', currentToCurrency);
console.log('Rate:', getExchangeRate(currentFromCurrency, currentToCurrency));
```

### 7. الوضع الداكن لا يعمل

```javascript
// في Console
// فحص الثيم المحفوظ
console.log('Saved theme:', localStorage.getItem('theme'));

// إعادة تعيين الثيم
localStorage.setItem('theme', 'dark');
location.reload();
```

### 8. مسح البيانات وإعادة التشغيل

إذا كانت المشاكل مستمرة:

```javascript
// في Console
// 1. مسح كل البيانات المخزنة
localStorage.clear();

// 2. إعادة تحميل الصفحة
location.reload();

// 3. فحص البيانات الجديدة بعد 2 ثانية
setTimeout(() => {
    console.log('New cache:', Object.keys(exchangeRatesCache).length, 'entries');
}, 3000);
```

## رسائل Console المهمة

### عند البدء:
```
🎯 Currency Exchange App Starting...
⏳ Loading screen timeout - initializing app...
🚀 Initializing Currency Exchange API...
🔄 Fetching fresh exchange rates from API...
📦 Fetching 57 currency pairs in 2 request(s)...
✅ Successfully cached 57 exchange rates
⏰ Next update in 10 minutes
✅ API initialized successfully
📱 Loading UI data...
📊 Loading popular rates. Available rates: 57
✅ Displayed 18 popular currency pairs
🎉 App ready!
```

### كل 10 دقائق:
```
⏰ 10 minutes passed - refreshing exchange rates...
🔄 Fetching fresh exchange rates from API...
✅ Successfully cached 57 exchange rates
```

### عند استخدام Mock Data:
```
⚠️ No data available, generating mock data
📊 Generating mock exchange rates...
✅ Generated 57 mock rates
```

## اختبار شامل

```javascript
// في Console - نسخ والصق هذا الكود

console.log('=== Currency App Diagnostic ===');
console.log('1. Cache Status:', {
    entries: Object.keys(exchangeRatesCache).length,
    lastUpdate: lastFetchTime ? new Date(lastFetchTime).toLocaleString() : 'Never',
    isValid: lastFetchTime && (Date.now() - lastFetchTime < 600000)
});

console.log('2. Sample Rates:');
console.log('   EUR/USD:', getExchangeRate('EUR', 'USD'));
console.log('   GBP/USD:', getExchangeRate('GBP', 'USD'));
console.log('   JPY/USD:', getExchangeRate('JPY', 'USD'));

console.log('3. Converter State:', {
    from: currentFromCurrency,
    to: currentToCurrency,
    rate: getExchangeRate(currentFromCurrency, currentToCurrency)
});

console.log('4. Storage:', {
    theme: localStorage.getItem('theme'),
    favorites: JSON.parse(localStorage.getItem('currency_favorites') || '[]')
});

console.log('=== End Diagnostic ===');
```

## طلب المساعدة

إذا استمرت المشاكل، أرسل المعلومات التالية:
1. لقطة شاشة من Console
2. المتصفح والإصدار المستخدم
3. نتائج الاختبار الشامل أعلاه
4. وصف المشكلة بالتفصيل

**البريد الإلكتروني:** jamalkatabeuro@gmail.com
