// Currency data configuration
const CURRENCY_DATA = {
    EUR: {
        name: 'Euro',
        code: 'EUR',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/100-currency-eur.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/100-currency-eurx.png'
    },
    USD: {
        name: 'United States dollar',
        code: 'USD',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/101-currency-usd.png',
        iconPair: null
    },
    GBP: {
        name: 'British pound',
        code: 'GBP',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/102-currency-gbp.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/102-currency-gbpx.png'
    },
    CHF: {
        name: 'Swiss franc',
        code: 'CHF',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/103-currency-chf.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/103-currency-chfx.png'
    },
    CAD: {
        name: 'Canadian dollar',
        code: 'CAD',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/104-currency-cad.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/101-currency-cadx.png'
    },
    AUD: {
        name: 'Australian dollar',
        code: 'AUD',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/105-currency-aud.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/104-currency-audx.png'
    },
    TRY: {
        name: 'Turkish lira',
        code: 'TRY',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/106-currency-try.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/109-currency-tryx.png'
    },
    CNY: {
        name: 'Chinese yuan',
        code: 'CNY',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/107-currency-cny.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/110-currency-cnyx.png'
    },
    BRL: {
        name: 'Brazilian real',
        code: 'BRL',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/108-currency-brl.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/107-currency-brlx.png'
    },
    MXN: {
        name: 'Mexican peso',
        code: 'MXN',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/109-currency-mxn.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/108-currency-mxnx.png'
    },
    ARS: {
        name: 'Argentine peso',
        code: 'ARS',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/110-currency-ars.png',
        iconPair: null
    },
    RUB: {
        name: 'Russian ruble',
        code: 'RUB',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/111-currency-rub.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/112-currency-rubx.png'
    },
    ZAR: {
        name: 'South African rand',
        code: 'ZAR',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/112-currency-zar.png',
        iconPair: null
    },
    JPY: {
        name: 'Japanese yen',
        code: 'JPY',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/113-currency-jpy.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/105-currency-jpyx.png'
    },
    KRW: {
        name: 'South Korean won',
        code: 'KRW',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/114-currency-krw.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/106-currency-krwx.png'
    },
    INR: {
        name: 'Indian rupee',
        code: 'INR',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/115-currency-inr.png',
        iconPair: null
    },
    HKD: {
        name: 'Hong Kong dollar',
        code: 'HKD',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/116-currency-hkd.png',
        iconPair: null
    },
    MYR: {
        name: 'Malaysian ringgit',
        code: 'MYR',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/117-currency-myr.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/111-currency-myrx.png'
    },
    MAD: {
        name: 'Moroccan dirham',
        code: 'MAD',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/118-currency-mad.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/113-currency-madx.png'
    },
    EGP: {
        name: 'Egyptian pound',
        code: 'EGP',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/119-currency-egp.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/114-currency-egbx.png'
    },
    TND: {
        name: 'Tunisian dinar',
        code: 'TND',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/120-currency-tnd.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/115-currency-tndx.png'
    },
    SAR: {
        name: 'Saudi riyal',
        code: 'SAR',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/121-currency-sar.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/116-currency-sarx.png'
    },
    QAR: {
        name: 'Qatari riyal',
        code: 'QAR',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/122-currency-qar.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/117-currency-qarx.png'
    },
    AED: {
        name: 'UAE dirham',
        code: 'AED',
        icon: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/123-currency-aed.png',
        iconPair: 'https://raw.githubusercontent.com/jamalkatabeuro-sketch/My-website/main/118-currency-aed.png'
    }
};

// Popular currency pairs (against USD)
const POPULAR_PAIRS = [
    { from: 'EUR', to: 'USD' },
    { from: 'GBP', to: 'USD' },
    { from: 'JPY', to: 'USD' },
    { from: 'CAD', to: 'USD' },
    { from: 'AUD', to: 'USD' },
    { from: 'CHF', to: 'USD' },
    { from: 'CNY', to: 'USD' },
    { from: 'INR', to: 'USD' },
    { from: 'BRL', to: 'USD' },
    { from: 'TRY', to: 'USD' },
    { from: 'MXN', to: 'USD' },
    { from: 'RUB', to: 'USD' },
    { from: 'MAD', to: 'USD' },
    { from: 'EGP', to: 'USD' },
    { from: 'TND', to: 'USD' },
    { from: 'SAR', to: 'USD' },
    { from: 'QAR', to: 'USD' },
    { from: 'AED', to: 'USD' }
];

// Suggested currencies for selection
const SUGGESTED_CURRENCIES = ['EUR', 'GBP', 'USD', 'INR', 'AUD'];

// Get currency icon
function getCurrencyIcon(code, isPair = false) {
    const currency = CURRENCY_DATA[code];
    if (!currency) return '';
    return isPair && currency.iconPair ? currency.iconPair : currency.icon;
}

// Get currency name
function getCurrencyName(code) {
    const currency = CURRENCY_DATA[code];
    return currency ? currency.name : code;
}
