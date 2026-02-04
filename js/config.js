// ألوان من ColorHunt - مجموعة منتقاة من لوحات جميلة
const COLORS = [
    // Palette 1: Sunset
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    // Palette 2: Ocean
    '#006D77', '#83C5BE', '#EDF6F9', '#FFDDD2', '#E29578',
    // Palette 3: Forest
    '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2',
    // Palette 4: Pastel
    '#FFE5E5', '#FFF0F0', '#E4F1FF', '#F0E5FF', '#FFF5E1',
    // Palette 5: Vibrant
    '#FF6B9D', '#C44569', '#FFC048', '#54E346', '#00ADB5',
    // Palette 6: Dark Mode
    '#1A1A2E', '#16213E', '#0F3460', '#533483', '#E94560',
    // Palette 7: Warm
    '#F38181', '#FCE38A', '#95E1D3', '#EAFFD0', '#F85F73',
    // Palette 8: Cool
    '#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94', '#D4A5A5',
    // Palette 9: Neon
    '#00FFF0', '#7000FF', '#FF00E4', '#00FFB3', '#FFF000',
    // Palette 10: Earth
    '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3',
    // Palette 11: Modern
    '#22223B', '#4A4E69', '#9A8C98', '#C9ADA7', '#F2E9E4',
    // Palette 12: Candy
    '#FFEEF4', '#FFD6EC', '#E7BCDE', '#CA82F8', '#AE82F8',
    // Palette 13: Corporate
    '#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51',
    // Palette 14: Royal
    '#4A0E4E', '#810CA8', '#C147E9', '#E5B8F4', '#F8E4F8',
    // Palette 15: Tropical
    '#06FFA5', '#00CC88', '#00AA77', '#008866', '#006655',
    // Palette 16: Sunset Purple
    '#2D1B69', '#3E2C8D', '#553CB8', '#6C4DE6', '#8B5FBF',
    // Palette 17: Sweet
    '#FFC7C7', '#FFE2E2', '#F6F6F6', '#8785A2', '#FFC09F',
    // Palette 18: Nature
    '#F7DC6F', '#82E0AA', '#85C1E2', '#BB8FCE', '#F1948A',
    // Palette 19: Gradient
    '#FA8072', '#E9967A', '#F08080', '#FFA07A', '#FF7F50',
    // Palette 20: Monochrome
    '#000000', '#2C2C2C', '#595959', '#858585', '#B2B2B2', '#CCCCCC', '#E5E5E5', '#FFFFFF',
    // Palette 21: Mint
    '#B8F3FF', '#8FE3CF', '#6DD3CE', '#51C4D3', '#126E82',
    // Palette 22: Peach
    '#FFCAC8', '#FCA3CC', '#F57FB2', '#F26CA7', '#E05194',
    // Palette 23: Lavender
    '#E0BBE4', '#D291BC', '#FEC8D8', '#FFDFD3', '#957DAD',
    // Palette 24: Sky
    '#A8DADC', '#457B9D', '#1D3557', '#F1FAEE', '#E63946',
    // Palette 25: Fire
    '#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA500',
    // Palette 26: Ice
    '#B4E7F8', '#89CFF0', '#66B2FF', '#3399FF', '#0077BE',
    // Palette 27: Gold
    '#FFD700', '#FFC125', '#FFB90F', '#FFAA00', '#FF9900',
    // Palette 28: Rose
    '#FF69B4', '#FF1493', '#C71585', '#DB7093', '#FFC0CB',
    // Palette 29: Teal
    '#008080', '#00CED1', '#40E0D0', '#48D1CC', '#00FFFF',
    // Palette 30: Autumn
    '#8B0000', '#A52A2A', '#B22222', '#DC143C', '#FF4500'
];

const FONTS = [
    'Agu Display', 'Allura', 'Almarai', 'Anton', 'Archivo Black', 'Aref Ruqaa Ink', 'Aref Ruqaa',
    'Audiowide', 'BBH Bartle', 'Bahianita', 'Bangers', 'Barriecito', 'Barrio', 'Bebas Neue',
    'Berkshire Swash', 'Bigelow Rules', 'Bitcount Single', 'Blaka', 'Blaka Hollow', 'Blaka Ink',
    'Borel', 'Bungee', 'Bungee Shade', 'Bungee Spice', 'Bungee Tint', 'Butcherman', 'Caesar Dressing',
    'Cairo Play', 'Codystar', 'Coral Pixels', 'Creepster', 'Dancing Script', 'Danfo', 'Dorsa',
    'Eater', 'Edu SA Hand', 'El Messiri', 'Engagement', 'Exile', 'Faster One', 'Fjalla One',
    'Fustat', 'Geostar', 'Gloria Hallelujah', 'Gravitas One', 'Hanalei', 'Hanalei Fill', 'Honk',
    'Jomhuria', 'Kablammo', 'Kalnia Glaze', 'Kufam', 'Lalezar', 'Lateef', 'League Gothic',
    'League Script', 'Lemonada', 'Libertinus Keyboard', 'Libre Barcode 39 Extended Text', 'Lobster',
    'Lobster Two', 'Londrina Shadow', 'Luckiest Guy', 'Lugrasimo', 'Macondo', 'Mada', 'Matemasie',
    'Moirai One', 'Molle', 'Momo Signature', 'Monofett', 'Monoton', 'Moo Lah Lah', 'Nabla',
    'Nosifer', 'Noto Color Emoji', 'Noto Emoji', 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', 'Oi',
    'Oleo Script', 'Oswald', 'Pacifico', 'Patrick Hand SC', 'Permanent Marker', 'Pirata One',
    'Playfair Display SC', 'Playfair Display', 'Playwrite GB J Guides', 'Qahiri', 'Rakkas',
    'Reem Kufi Ink', 'Reem Kufi', 'Rock Salt', 'Rubik Iso', 'Rubik Puddles', 'Rubik Storm',
    'Ruwudu', 'Sancreek', 'Six Caps', 'Sixtyfour Convergence', 'Smokum', 'Special Gothic Condensed One',
    'Story Script', 'Sue Ellen Francisco', 'Syncopate', 'Trade Winds', 'UnifrakturCook', 'Yesteryear',
    'Zalando Sans Expanded', 'Zen Tokyo Zoo', 'Zilla Slab Highlight'
];
