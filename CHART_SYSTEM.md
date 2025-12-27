# نظام الشارت الحقيقي 📊

## 🎯 المميزات

### 1. بيانات حقيقية 100%
- استخدام Exchangerate-API Historical Data
- API Key: `78b674a6f7b773099b349c4b`
- بيانات تاريخية دقيقة لكل يوم

### 2. إدارة ذكية للطلبات
- **حد يومي:** 40 طلب كحد أقصى
- **عداد تلقائي:** يحسب الطلبات المستخدمة
- **إعادة تعيين يومية:** يبدأ من 0 كل يوم
- **حفظ في localStorage:** لا يضيع العداد عند إعادة التحميل

### 3. استراتيجية العينات الذكية
```javascript
// تقليل عدد الطلبات بناءً على الفترة:
1 Day    → 1 طلب (كل يوم)
1 Week   → 7 طلبات (كل يوم)
1 Month  → 15 طلب (كل يومين)
6 Months → 26 طلب (كل أسبوع)
1 Year   → 26 طلب (كل أسبوعين)
5 Years  → 30 طلب (كل شهر)
```

### 4. Cache ذكي
- **مدة Cache:** 24 ساعة
- **تحديث تلقائي:** بعد 24 ساعة فقط
- **لا تكرار:** نفس البيانات لا تُجلب مرتين

### 5. Interpolation
- ملء الفجوات بين العينات
- شارت سلس وجميل
- خوارزمية interpolation خطية

---

## 📁 هيكل الملف

### js/chart.js - ملف منفصل تماماً

```javascript
// المتغيرات الرئيسية
const CHART_API_KEY = '78b674a6f7b773099b349c4b';
const MAX_DAILY_REQUESTS = 40;
let dailyRequestCount = 0;
let chartCache = {};

// الدوال الرئيسية
initializeRequestCounter()    // تهيئة العداد
canMakeRequest()              // التحقق من الحصة
fetchHistoricalRate()         // جلب سعر تاريخي
fetchChartData()              // جلب بيانات الشارت
interpolateChartData()        // ملء الفجوات
getTimeSeriesData()           // واجهة عامة
```

---

## 🔄 آلية العمل

### 1. عند فتح التطبيق
```
1. تحميل العداد من localStorage
2. التحقق من التاريخ (اليوم الجديد = إعادة تعيين)
3. عرض: "X/40 requests used today"
```

### 2. عند فتح Modal عملة
```
1. التحقق من Cache (24 ساعة)
2. إذا Cache صالح → استخدامه
3. إذا لا:
   a. التحقق من الحصة (< 40 طلب)
   b. إذا نعم → جلب بيانات حقيقية
   c. إذا لا → استخدام fallback data
```

### 3. جلب البيانات الحقيقية
```
1. تحديد عدد العينات (بناءً على الفترة)
2. التحقق من الحصة المتبقية
3. جلب العينات واحدة تلو الأخرى
4. Interpolation للحصول على شارت سلس
5. Cache النتيجة لمدة 24 ساعة
```

---

## 📊 API Endpoints المستخدمة

### Historical Data
```
GET https://v6.exchangerate-api.com/v6/{API_KEY}/history/{BASE}/{YEAR}/{MONTH}/{DAY}

مثال:
GET https://v6.exchangerate-api.com/v6/78b674a6f7b773099b349c4b/history/USD/2024/12/27

Response:
{
  "result": "success",
  "base_code": "USD",
  "year": 2024,
  "month": 12,
  "day": 27,
  "conversion_rates": {
    "EUR": 0.9234,
    "GBP": 0.7891,
    "CAD": 1.3700,
    ...
  }
}
```

---

## 💾 LocalStorage

### المفاتيح المستخدمة
```javascript
'chartRequestDate'  // التاريخ الحالي
'chartRequestCount' // عدد الطلبات المستخدمة
```

### مثال
```javascript
localStorage.getItem('chartRequestDate')  // "Thu Dec 27 2024"
localStorage.getItem('chartRequestCount') // "15"
```

---

## 🎨 استراتيجية العينات التفصيلية

### 1 يوم (1D)
```javascript
days = 1
samples = 1 طلب
strategy: كل يوم
```

### أسبوع (1W)
```javascript
days = 7
samples = 7 طلبات
strategy: كل يوم
```

### شهر (1M)
```javascript
days = 30
samples = 15 طلب
strategy: كل يومين
interpolation: linear
```

### 6 أشهر (6M)
```javascript
days = 180
samples = 26 طلب
strategy: كل أسبوع (7 أيام)
interpolation: linear
```

### سنة (1Y)
```javascript
days = 365
samples = 26 طلب
strategy: كل أسبوعين (14 يوم)
interpolation: linear
```

### 5 سنوات (5Y)
```javascript
days = 1825
samples = 30 طلب
strategy: كل شهر (30 يوم)
interpolation: linear
```

---

## 🧮 Interpolation Algorithm

```javascript
// مثال: لدينا نقطتين
Point A: { date: '2024-12-01', value: 0.92 }
Point B: { date: '2024-12-15', value: 0.94 }

// نريد حساب القيمة في '2024-12-08'
daysBetween = 14 (15 - 1)
daysFromA = 7 (8 - 1)
ratio = 7/14 = 0.5

interpolatedValue = 0.92 + (0.94 - 0.92) * 0.5
                  = 0.92 + 0.01
                  = 0.93
```

---

## 📈 مثال عملي كامل

### السيناريو: عرض شارت USD/EUR لمدة شهر

```javascript
// 1. المستخدم يفتح Modal
openDetailModal('USD', 'EUR');

// 2. طلب بيانات الشارت
getTimeSeriesData('USD', 'EUR', '1M');

// 3. داخل fetchChartData
cacheKey = "USD/EUR/30"

// 4. فحص Cache
if (chartCache[cacheKey] && age < 24h) {
    return chartCache[cacheKey]; // ✅ استخدام Cache
}

// 5. فحص الحصة
if (dailyRequestCount >= 40) {
    return generateFallbackData(); // ⚠️ الحد مكتمل
}

// 6. تحديد العينات
allDates = [30 يوم]
samplingDates = filter every 2 days = 15 يوم

// 7. جلب البيانات
for each date in samplingDates {
    incrementRequestCounter(); // 1, 2, 3, ...
    
    rates = await fetchHistoricalRate('USD', date);
    // GET /v6/.../history/USD/2024/12/XX
    
    if (rates.EUR) {
        chartData.push({ date, value: rates.EUR });
    }
    
    await sleep(100ms); // تأخير صغير
}

// 8. Interpolation
fullData = interpolateChartData(chartData, 30);
// 15 نقطة → 30 نقطة

// 9. Cache
chartCache[cacheKey] = fullData;
chartCacheTimestamp[cacheKey] = now;

// 10. عرض
return fullData; // 30 نقطة للرسم
```

---

## 🔍 كيفية المراقبة

### في Console

```javascript
// 1. عدد الطلبات المستخدمة اليوم
console.log(dailyRequestCount + '/40');

// 2. فحص Cache
console.log('Chart cache:', Object.keys(chartCache));

// 3. اختبار جلب
getTimeSeriesData('USD', 'EUR', '1M').then(data => {
    console.log('Points:', data.length);
    console.log('First:', data[0]);
    console.log('Last:', data[data.length - 1]);
});

// 4. فحص localStorage
console.log('Date:', localStorage.getItem('chartRequestDate'));
console.log('Count:', localStorage.getItem('chartRequestCount'));
```

### رسائل Console المتوقعة

```
📊 Initializing chart system...
📊 Chart API: 0/40 requests used today
🔄 Fetching real chart data for USD/EUR (30 days)...
📊 Chart API request: 1/40
📊 Chart API request: 2/40
...
📊 Chart API request: 15/40
✅ Fetched 15 real data points, interpolated to 30 points
```

---

## ⚡ التحسينات

### 1. Preloading
```javascript
// تحميل مسبق للأزواج الشائعة
preloadPopularCharts() {
    // USD/EUR, USD/GBP, USD/CAD, USD/CHF
    // يستخدم 4 × 15 = 60 طلب تقريباً
    // موزعة على يومين
}
```

### 2. Smart Caching
```javascript
// Cache حسب الفترة
'USD/EUR/7'   → 7 أيام
'USD/EUR/30'  → 30 يوم
'USD/EUR/365' → سنة

// كل واحد له cache مستقل
```

### 3. Request Limiting
```javascript
// إذا المستخدم طلب بيانات كثيرة
if (samples > remainingQuota) {
    // تقليل العينات تلقائياً
    samples = remainingQuota;
}
```

---

## ✅ قائمة التحقق

- [x] ملف `js/chart.js` منفصل
- [x] استخدام Exchangerate-API فقط للشارت
- [x] حد 40 طلب يومياً
- [x] عداد في localStorage
- [x] Cache 24 ساعة
- [x] Interpolation للبيانات
- [x] Fallback عند اكتمال الحصة
- [x] Preloading للأزواج الشائعة
- [x] حذف دوال الشارت من api.js

---

## 🎯 النتيجة

**شارت حقيقي:**
- ✅ بيانات تاريخية دقيقة من Exchangerate-API
- ✅ 40 طلب يومياً كحد أقصى
- ✅ Cache ذكي لمدة 24 ساعة
- ✅ Interpolation للحصول على شارت سلس
- ✅ Fallback تلقائي عند اكتمال الحصة
- ✅ ملف منفصل تماماً (js/chart.js)

**جاهز للاستخدام! 🚀**
