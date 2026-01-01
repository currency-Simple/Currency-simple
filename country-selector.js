
// ============================================
// 🌍 COUNTRY SELECTOR
// ============================================
// إدارة اختيار البلد والعلم

// 🚩 قائمة الدول العربية
export const COUNTRIES = [
  { code: 'SA', name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'AE', name: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'EG', name: 'جمهورية مصر العربية', nameEn: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: 'IQ', name: 'جمهورية العراق', nameEn: 'Iraq', flag: '🇮🇶', dialCode: '+964' },
  { code: 'JO', name: 'المملكة الأردنية الهاشمية', nameEn: 'Jordan', flag: '🇯🇴', dialCode: '+962' },
  { code: 'KW', name: 'دولة الكويت', nameEn: 'Kuwait', flag: '🇰🇼', dialCode: '+965' },
  { code: 'LB', name: 'الجمهورية اللبنانية', nameEn: 'Lebanon', flag: '🇱🇧', dialCode: '+961' },
  { code: 'LY', name: 'دولة ليبيا', nameEn: 'Libya', flag: '🇱🇾', dialCode: '+218' },
  { code: 'MA', name: 'المملكة المغربية', nameEn: 'Morocco', flag: '🇲🇦', dialCode: '+212' },
  { code: 'MR', name: 'الجمهورية الإسلامية الموريتانية', nameEn: 'Mauritania', flag: '🇲🇷', dialCode: '+222' },
  { code: 'OM', name: 'سلطنة عمان', nameEn: 'Oman', flag: '🇴🇲', dialCode: '+968' },
  { code: 'PS', name: 'دولة فلسطين', nameEn: 'Palestine', flag: '🇵🇸', dialCode: '+970' },
  { code: 'QA', name: 'دولة قطر', nameEn: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
  { code: 'SD', name: 'جمهورية السودان', nameEn: 'Sudan', flag: '🇸🇩', dialCode: '+249' },
  { code: 'SO', name: 'جمهورية الصومال الفيدرالية', nameEn: 'Somalia', flag: '🇸🇴', dialCode: '+252' },
  { code: 'SY', name: 'الجمهورية العربية السورية', nameEn: 'Syria', flag: '🇸🇾', dialCode: '+963' },
  { code: 'TN', name: 'الجمهورية التونسية', nameEn: 'Tunisia', flag: '🇹🇳', dialCode: '+216' },
  { code: 'YE', name: 'الجمهورية اليمنية', nameEn: 'Yemen', flag: '🇾🇪', dialCode: '+967' },
  { code: 'BH', name: 'مملكة البحرين', nameEn: 'Bahrain', flag: '🇧🇭', dialCode: '+973' },
  { code: 'DJ', name: 'جمهورية جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯', dialCode: '+253' },
  { code: 'KM', name: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲', dialCode: '+269' },
  { code: 'DZ', name: 'الجمهورية الجزائرية', nameEn: 'Algeria', flag: '🇩🇿', dialCode: '+213' }
];

// 🔍 البحث عن دولة بالاسم
export function searchCountries(query) {
  if (!query || query.length < 2) {
    return COUNTRIES;
  }

  const searchTerm = query.toLowerCase().trim();

  return COUNTRIES.filter(country => 
    country.name.includes(searchTerm) ||
    country.nameEn.toLowerCase().includes(searchTerm) ||
    country.code.toLowerCase() === searchTerm
  );
}

// 🚩 الحصول على دولة بالكود
export function getCountryByCode(code) {
  if (!code) return null;
  return COUNTRIES.find(c => c.code === code.toUpperCase()) || null;
}

// 🌍 الحصول على العلم بالكود
export function getFlagByCode(code) {
  const country = getCountryByCode(code);
  return country ? country.flag : '🌍';
}

// 📱 الحصول على رمز الاتصال
export function getDialCode(countryCode) {
  const country = getCountryByCode(countryCode);
  return country ? country.dialCode : null;
}

// 🗺️ الحصول على الدولة من الموقع الجغرافي (IP)
export async function detectCountryFromIP() {
  try {
    // استخدام API مجاني للكشف عن الدولة
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    if (data.country_code) {
      const country = getCountryByCode(data.country_code);
      if (country) {
        return {
          success: true,
          country,
          detected: true
        };
      }
    }

    return { success: false, country: null, detected: false };

  } catch (error) {
    console.error('Detect country error:', error);
    return { success: false, country: null, detected: false };
  }
}

// 📊 ترتيب الدول حسب الشعبية (بناءً على عدد اللاعبين)
export async function sortCountriesByPopularity(leaderboardData) {
  const countryCounts = {};

  leaderboardData.forEach(player => {
    if (player.country_code) {
      countryCounts[player.country_code] = (countryCounts[player.country_code] || 0) + 1;
    }
  });

  return COUNTRIES.map(country => ({
    ...country,
    playerCount: countryCounts[country.code] || 0
  })).sort((a, b) => b.playerCount - a.playerCount);
}

// 🎨 توليد ألوان الدولة (للثيمات)
export function getCountryColors(countryCode) {
  const colorMap = {
    'SA': { primary: '#006C35', secondary: '#FFFFFF', accent: '#006C35' },
    'AE': { primary: '#00732F', secondary: '#FF0000', accent: '#000000' },
    'EG': { primary: '#C09300', secondary: '#FFFFFF', accent: '#000000' },
    'IQ': { primary: '#CE1126', secondary: '#FFFFFF', accent: '#007A3D' },
    'JO': { primary: '#CE1126', secondary: '#000000', accent: '#007A3D' },
    'KW': { primary: '#007A3D', secondary: '#FFFFFF', accent: '#CE1126' },
    'LB': { primary: '#ED1C24', secondary: '#FFFFFF', accent: '#00A651' },
    'MA': { primary: '#C1272D', secondary: '#006233', accent: '#C1272D' },
    'OM': { primary: '#E10600', secondary: '#FFFFFF', accent: '#00843D' },
    'PS': { primary: '#007A3D', secondary: '#FFFFFF', accent: '#CE1126' },
    'QA': { primary: '#8D1B3D', secondary: '#FFFFFF', accent: '#8D1B3D' },
    'SD': { primary: '#D21034', secondary: '#FFFFFF', accent: '#007229' },
    'SY': { primary: '#CE1126', secondary: '#FFFFFF', accent: '#007A3D' },
    'TN': { primary: '#E70013', secondary: '#FFFFFF', accent: '#E70013' },
    'YE': { primary: '#CE1126', secondary: '#FFFFFF', accent: '#000000' }
  };

  return colorMap[countryCode] || { primary: '#4ECDC4', secondary: '#FFFFFF', accent: '#FF6B6B' };
}

// 🏆 إحصائيات الدول في اللعبة
export function getCountryStats(leaderboardData) {
  const stats = {};

  COUNTRIES.forEach(country => {
    const players = leaderboardData.filter(p => p.country_code === country.code);
    
    if (players.length > 0) {
      stats[country.code] = {
        country: country,
        playerCount: players.length,
        totalScore: players.reduce((sum, p) => sum + (p.total_score || 0), 0),
        averageScore: Math.floor(
          players.reduce((sum, p) => sum + (p.best_score || 0), 0) / players.length
        ),
        topPlayer: players.reduce((top, p) => 
          (p.best_score || 0) > (top.best_score || 0) ? p : top
        ),
        rank: 0 // سيتم حسابه لاحقاً
      };
    }
  });

  // ترتيب الدول حسب متوسط النقاط
  const rankedCountries = Object.values(stats)
    .sort((a, b) => b.averageScore - a.averageScore)
    .map((stat, index) => ({
      ...stat,
      rank: index + 1
    }));

  return rankedCountries;
}

// 🎯 فلترة الدول المتوفرة فقط
export function getAvailableCountries(leaderboardData) {
  const availableCodes = new Set(
    leaderboardData
      .filter(p => p.country_code)
      .map(p => p.country_code)
  );

  return COUNTRIES.filter(country => availableCodes.has(country.code));
}

// 📍 تنسيق عرض الدولة
export function formatCountryDisplay(countryCode, options = {}) {
  const country = getCountryByCode(countryCode);
  
  if (!country) {
    return options.fallback || '🌍 غير محدد';
  }

  const parts = [];
  
  if (options.showFlag !== false) {
    parts.push(country.flag);
  }
  
  if (options.showName !== false) {
    parts.push(country.name);
  }
  
  if (options.showCode) {
    parts.push(`(${country.code})`);
  }
  
  if (options.showDialCode) {
    parts.push(country.dialCode);
  }

  return parts.join(' ');
}

// 🔤 التحقق من صحة كود الدولة
export function isValidCountryCode(code) {
  if (!code || typeof code !== 'string') return false;
  return COUNTRIES.some(c => c.code === code.toUpperCase());
}

// 🎲 اختيار دولة عشوائية
export function getRandomCountry() {
  const randomIndex = Math.floor(Math.random() * COUNTRIES.length);
  return COUNTRIES[randomIndex];
}

// 📋 تصدير قائمة الدول بصيغ مختلفة
export function exportCountries(format = 'json') {
  switch (format) {
    case 'json':
      return JSON.stringify(COUNTRIES, null, 2);
    
    case 'csv':
      const headers = 'Code,Name,Name (English),Flag,Dial Code\n';
      const rows = COUNTRIES.map(c => 
        `${c.code},"${c.name}","${c.nameEn}",${c.flag},${c.dialCode}`
      ).join('\n');
      return headers + rows;
    
    case 'array':
      return COUNTRIES.map(c => c.code);
    
    default:
      return COUNTRIES;
  }
}

// 🌐 الحصول على اللغة المفضلة للدولة
export function getCountryLanguage(countryCode) {
  // جميع الدول العربية تستخدم العربية
  return 'ar';
}

// ⏰ الحصول على المنطقة الزمنية
export function getCountryTimezone(countryCode) {
  const timezones = {
    'SA': 'Asia/Riyadh',
    'AE': 'Asia/Dubai',
    'EG': 'Africa/Cairo',
    'IQ': 'Asia/Baghdad',
    'JO': 'Asia/Amman',
    'KW': 'Asia/Kuwait',
    'LB': 'Asia/Beirut',
    'MA': 'Africa/Casablanca',
    'OM': 'Asia/Muscat',
    'PS': 'Asia/Gaza',
    'QA': 'Asia/Qatar',
    'SD': 'Africa/Khartoum',
    'SY': 'Asia/Damascus',
    'TN': 'Africa/Tunis',
    'YE': 'Asia/Aden'
  };

  return timezones[countryCode] || 'UTC';
}

// ✅ استخدام:
// import { COUNTRIES, searchCountries, getCountryByCode, detectCountryFromIP } from './country-selector.js';
// 
// const results = searchCountries('سعود');
// const country = getCountryByCode('SA');
// const detected = await detectCountryFromIP();
