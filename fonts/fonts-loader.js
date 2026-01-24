// fonts/fonts-loader.js - النسخة المحسنة
class FontLoader {
    constructor() {
        this.loadedFonts = new Set();
        this.fontDefinitions = {
            'Agu Display': { type: 'display', weights: [400] },
            'Alkalami': { type: 'serif', weights: [400], arabic: true },
            'Amatic SC': { type: 'cursive', weights: [400, 700] },
            'Anton': { type: 'sans-serif', weights: [400] },
            'Archivo Black': { type: 'sans-serif', weights: [400] },
            'Archivo': { type: 'sans-serif', weights: [400, 700] },
            'Audiowide': { type: 'sans-serif', weights: [400] },
            'Badeen Display': { type: 'display', weights: [400], arabic: true },
            'Bangers': { type: 'system-ui', weights: [400] },
            'Bebas Neue': { type: 'sans-serif', weights: [400] },
            'Bitcount Single': { type: 'monospace', weights: [400] },
            'Buda': { type: 'display', weights: [300] },
            'Cairo Play': { type: 'sans-serif', weights: [400], arabic: true },
            'Creepster': { type: 'system-ui', weights: [400] },
            'Dancing Script': { type: 'cursive', weights: [400, 700] },
            'Eater': { type: 'system-ui', weights: [400] },
            'Edu SA Hand': { type: 'cursive', weights: [400, 700] },
            'Fjalla One': { type: 'sans-serif', weights: [400] },
            'Fredericka the Great': { type: 'serif', weights: [400] },
            'Gravitas One': { type: 'serif', weights: [400] },
            'Lalezar': { type: 'system-ui', weights: [400], arabic: true },
            'Lobster Two': { type: 'serif', weights: [400, 700] },
            'Macondo': { type: 'system-ui', weights: [400] },
            'Mada': { type: 'sans-serif', weights: [400], arabic: true },
            'Momo Signature': { type: 'cursive', weights: [400] },
            'Monoton': { type: 'system-ui', weights: [400] },
            'Moo Lah Lah': { type: 'system-ui', weights: [400] },
            'Noto Nastaliq Urdu': { type: 'serif', weights: [400], arabic: true },
            'Noto Serif': { type: 'serif', weights: [400] },
            'Oswald': { type: 'sans-serif', weights: [400, 700] },
            'Pacifico': { type: 'cursive', weights: [400] },
            'Playfair Display': { type: 'serif', weights: [400, 700] },
            'Playwrite GB J Guides': { type: 'cursive', weights: [400] },
            'Reem Kufi': { type: 'sans-serif', weights: [400, 700], arabic: true },
            'Rock Salt': { type: 'cursive', weights: [400] },
            'Rubik Storm': { type: 'system-ui', weights: [400] },
            'Ruwudu': { type: 'serif', weights: [400], arabic: true },
            'Special Gothic Condensed One': { type: 'sans-serif', weights: [400] },
            'Special Gothic Expanded One': { type: 'sans-serif', weights: [400] },
            'Zalando Sans Expanded': { type: 'sans-serif', weights: [400] }
        };
    }

    async loadFont(fontName) {
        if (this.loadedFonts.has(fontName)) {
            return true;
        }

        // محاولة التحميل من jsDelivr
        const success = await this.loadFromJsDelivr(fontName);
        
        if (success) {
            this.loadedFonts.add(fontName);
            return true;
        }

        // إذا فشل، استخدم الخط النظامي
        console.warn(`⚠️ استخدام الخط النظامي للخط: ${fontName}`);
        return false;
    }

    async loadFromJsDelivr(fontName) {
        try {
            const fontDef = this.fontDefinitions[fontName];
            if (!fontDef) return false;

            // تحويل اسم الخط إلى صيغة jsDelivr
            const fontSlug = fontName.toLowerCase().replace(/ /g, '-');
            const weight = fontDef.weights[0]; // استخدم الوزن الأول
            
            // إنشاء رابط jsDelivr
            let url;
            if (fontDef.arabic) {
                url = `https://cdn.jsdelivr.net/npm/@fontsource/${fontSlug}@5.0.0/arabic-${weight}-normal.woff2`;
            } else {
                url = `https://cdn.jsdelivr.net/npm/@fontsource/${fontSlug}@5.0.0/latin-${weight}-normal.woff2`;
            }

            // إنشاء FontFace
            const fontFace = new FontFace(
                fontName,
                `url(${url}) format('woff2')`,
                {
                    weight: weight,
                    style: 'normal',
                    display: 'swap'
                }
            );

            // إضافة الخط
            document.fonts.add(fontFace);
            await fontFace.load();
            
            console.log(`✅ تم تحميل الخط: ${fontName} من jsDelivr`);
            return true;

        } catch (error) {
            console.warn(`❌ فشل تحميل الخط ${fontName}:`, error);
            return false;
        }
    }

    getFontFamily(fontName) {
        const fontDef = this.fontDefinitions[fontName];
        if (!fontDef) return 'Arial, sans-serif';
        
        return `"${fontName}", ${fontDef.type}`;
    }

    // تحميل مجموعة خطوط دفعة واحدة
    async loadEssentialFonts() {
        const essentialFonts = [
            'Agu Display',
            'Oswald', 
            'Pacifico',
            'Reem Kufi',
            'Playfair Display',
            'Alkalami',
            'Amatic SC',
            'Dancing Script',
            'Lalezar',
            'Noto Nastaliq Urdu'
        ];
        
        for (const fontName of essentialFonts) {
            await this.loadFont(fontName);
        }
    }
}

// إنشاء نسخة عامة
window.fontLoader = new FontLoader();
