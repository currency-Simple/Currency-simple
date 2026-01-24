// fonts/fonts-loader.js
class FontLoader {
    constructor() {
        this.loadedFonts = new Set();
        this.cache = new Map();
        this.fallbackFonts = {
            'Agu Display': 'Arial, sans-serif',
            'Oswald': 'Arial, sans-serif',
            'Pacifico': 'cursive',
            'Reem Kufi': 'Arial, sans-serif',
            'Playfair Display': 'serif'
        };
    }

    async loadFont(fontName) {
        // إذا كان الخط محملاً بالفعل
        if (this.loadedFonts.has(fontName)) {
            return true;
        }

        // إذا كان الخط في الكاش
        if (this.cache.has(fontName)) {
            const font = this.cache.get(fontName);
            if (await this.isFontLoaded(font.family)) {
                this.loadedFonts.add(fontName);
                return true;
            }
        }

        // جرب تحميل الخط محلياً أولاً
        const localSuccess = await this.loadLocalFont(fontName);
        
        if (!localSuccess) {
            // إذا فشل التحميل المحلي، استخدم Google Fonts كاحتياطي
            await this.loadGoogleFont(fontName);
        }

        this.loadedFonts.add(fontName);
        return true;
    }

    async loadLocalFont(fontName) {
        try {
            // تحقق إذا كان الخط موجوداً في LOCAL_FONTS
            const font = LOCAL_FONTS.find(f => f.name === fontName);
            if (!font || !font.file) {
                return false;
            }

            // إنشاء تعريف @font-face ديناميكي
            const fontFace = new FontFace(
                fontName,
                `url('fonts/${font.file}') format('woff2')`,
                { 
                    weight: '100 900',
                    style: 'normal',
                    display: 'swap'
                }
            );

            // إضافة الخط إلى document
            document.fonts.add(fontFace);
            
            // انتظر تحميل الخط
            await fontFace.load();
            
            console.log(`✅ الخط المحمل محلياً: ${fontName}`);
            return true;
            
        } catch (error) {
            console.warn(`⚠️ فشل تحميل الخط المحلي ${fontName}:`, error);
            return false;
        }
    }

    async loadGoogleFont(fontName) {
        try {
            const font = LOCAL_FONTS.find(f => f.name === fontName);
            if (!font) return false;

            // إنشاء رابط Google Fonts ديناميكي
            const fontFamily = fontName.replace(/ /g, '+');
            const googleUrl = `https://fonts.googleapis.com/css2?family=${fontFamily}&display=swap`;
            
            // إنشاء رابط CSS
            const link = document.createElement('link');
            link.href = googleUrl;
            link.rel = 'stylesheet';
            link.crossOrigin = 'anonymous';
            
            document.head.appendChild(link);
            
            // انتظر تحميل الخط
            await new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = reject;
                setTimeout(resolve, 2000); // وقت انتظار أقصى
            });
            
            console.log(`✅ الخط المحمل من Google: ${fontName}`);
            return true;
            
        } catch (error) {
            console.warn(`⚠️ فشل تحميل الخط من Google ${fontName}:`, error);
            return false;
        }
    }

    async isFontLoaded(fontFamily) {
        try {
            await document.fonts.load(`16px "${fontFamily}"`);
            return true;
        } catch {
            return false;
        }
    }

    getFontFamily(fontName) {
        const font = LOCAL_FONTS.find(f => f.name === fontName);
        return font ? font.family : this.fallbackFonts[fontName] || 'Arial, sans-serif';
    }
}

// إنشاء نسخة عامة
window.fontLoader = new FontLoader();
