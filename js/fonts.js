// قائمة الخطوط الموسعة من Bunny Fonts
const ALL_FONTS = [
    { name: "ABeeZee", family: "'ABeeZee', sans-serif", demo: "نص تجريبي" },
    { name: "Abhaya Libre", family: "'Abhaya Libre', serif", demo: "خط عربي" },
    { name: "Aboreto", family: "'Aboreto', display", demo: "Creative" },
    { name: "Abril Fatface", family: "'Abril Fatface', serif", demo: "Elegant" },
    { name: "Abyssinica SIL", family: "'Abyssinica SIL', serif", demo: "Ethiopic" },
    { name: "Aclonica", family: "'Aclonica', sans-serif", demo: "Modern" },
    { name: "Acme", family: "'Acme', sans-serif", demo: "Clean" },
    { name: "Advent Pro", family: "'Advent Pro', sans-serif", demo: "Light" },
    { name: "Aguafina Script", family: "'Aguafina Script', cursive", demo: "Script" },
    { name: "Akaya Telivigala", family: "'Akaya Telivigala', display", demo: "Telugu" },
    { name: "Akronim", family: "'Akronim', display", demo: "Stylish" },
    { name: "Aladin", family: "'Aladin', cursive", demo: "Fantasy" },
    { name: "Aldrich", family: "'Aldrich', sans-serif", demo: "Tech" },
    { name: "Alegreya", family: "'Alegreya', serif", demo: "Serif" },
    { name: "Alegreya SC", family: "'Alegreya SC', serif", demo: "Caps" },
    { name: "Alex Brush", family: "'Alex Brush', cursive", demo: "Hand" },
    { name: "Alfa Slab One", family: "'Alfa Slab One', serif", demo: "Slab" },
    { name: "Allan", family: "'Allan', cursive", demo: "Cursive" },
    { name: "Almendra", family: "'Almendra', serif", demo: "Classic" },
    { name: "Almendra SC", family: "'Almendra SC', serif", demo: "Small" },
    { name: "Alumni Sans", family: "'Alumni Sans', sans-serif", demo: "Sans" },
    { name: "Alumni Sans Inline", family: "'Alumni Sans Inline One', display", demo: "Inline" },
    { name: "Amatic SC", family: "'Amatic SC', cursive", demo: "Hand" },
    { name: "Amita", family: "'Amita', cursive", demo: "Deva" },
    { name: "Arbutus", family: "'Arbutus', serif", demo: "Serif" },
    { name: "Architects Daughter", family: "'Architects Daughter', cursive", demo: "Hand" },
    { name: "Are You Serious", family: "'Are You Serious', cursive", demo: "Fun" },
    { name: "Aref Ruqaa", family: "'Aref Ruqaa', serif", demo: "عربي" },
    { name: "Asset", family: "'Asset', display", demo: "Display" },
    { name: "Astloch", family: "'Astloch', serif", demo: "Serif" },
    { name: "Atomic Age", family: "'Atomic Age', display", demo: "Retro" },
    { name: "Aubrey", family: "'Aubrey', display", demo: "Display" },
    { name: "Audiowide", family: "'Audiowide', monospace", demo: "Tech" },
    { name: "Bahiana", family: "'Bahiana', display", demo: "Display" },
    { name: "Bakbak One", family: "'Bakbak One', sans-serif", demo: "Sans" },
    { name: "Ballet", family: "'Ballet', cursive", demo: "Elegant" },
    { name: "Bangers", family: "'Bangers', cursive", demo: "Comic" },
    { name: "Barriecito", family: "'Barriecito', display", demo: "Display" },
    { name: "Beau Rivage", family: "'Beau Rivage', cursive", demo: "Hand" },
    { name: "Berkshire Swash", family: "'Berkshire Swash', cursive", demo: "Swash" },
    { name: "Beth Ellen", family: "'Beth Ellen', cursive", demo: "Cursive" },
    { name: "Bhutuka Expanded", family: "'Bhutuka Expanded One', sans-serif", demo: "Expand" },
    { name: "Big Shoulders Display", family: "'Big Shoulders Display', sans-serif", demo: "Display" },
    { name: "Bigelow Rules", family: "'Bigelow Rules', serif", demo: "Rules" },
    { name: "Biorhyme Expanded", family: "'Biorhyme Expanded', serif", demo: "Expand" },
    { name: "Black And White Picture", family: "'Black And White Picture', sans-serif", demo: "한국어" },
    { name: "Bonbon", family: "'Bonbon', cursive", demo: "Cursive" },
    { name: "Bowlby One SC", family: "'Bowlby One SC', display", demo: "Bold" },
    { name: "Bruno Ace", family: "'Bruno Ace', display", demo: "Display" },
    { name: "Bungee", family: "'Bungee', display", demo: "Bungee" },
    { name: "Bungee Inline", family: "'Bungee Inline', display", demo: "Inline" },
    { name: "Bungee Outline", family: "'Bungee Outline', display", demo: "Outline" },
    { name: "Bungee Shade", family: "'Bungee Shade', display", demo: "Shade" },
    { name: "Bungee Tint", family: "'Bungee Tint', display", demo: "Tint" },
    { name: "Butcherman", family: "'Butcherman', display", demo: "Horror" },
    { name: "Caesar Dressing", family: "'Caesar Dressing', display", demo: "Roman" },
    { name: "Castoro Titling", family: "'Castoro Titling', display", demo: "Title" },
    { name: "Chathura", family: "'Chathura', sans-serif", demo: "සිංහල" },
    { name: "Cinzel", family: "'Cinzel', serif", demo: "Classic" },
    { name: "Cute Font", family: "'Cute Font', display", demo: "귀여운" },
    { name: "Damion", family: "'Damion', cursive", demo: "Cursive" },
    { name: "Diplomata", family: "'Diplomata', display", demo: "Display" },
    { name: "Dokdo", family: "'Dokdo', cursive", demo: "독도" },
    { name: "Dorsa", family: "'Dorsa', sans-serif", demo: "Sans" },
    { name: "Dr Sugiyama", family: "'Dr Sugiyama', cursive", demo: "Script" },
    { name: "Eagle Lake", family: "'Eagle Lake', cursive", demo: "Script" },
    { name: "Edu QLD Beginner", family: "'Edu QLD Beginner', cursive", demo: "School" },
    { name: "Erica One", family: "'Erica One', display", demo: "Display" },
    { name: "Fascinate", family: "'Fascinate', display", demo: "Fascinate" },
    { name: "Faster One", family: "'Faster One', cursive", demo: "Speed" },
    { name: "Fleur De Leah", family: "'Fleur De Leah', cursive", demo: "Elegant" },
    { name: "Ga Maamli", family: "'Ga Maamli', display", demo: "ᨀ" },
    { name: "Gajraj One", family: "'Gajraj One', display", demo: "देव" },
    { name: "Great Vibes", family: "'Great Vibes', cursive", demo: "Vibes" },
    { name: "Hanalei", family: "'Hanalei', display", demo: "Display" },
    { name: "Homemade Apple", family: "'Homemade Apple', cursive", demo: "Hand" },
    { name: "Honk", family: "'Honk', display", demo: "Honk" },
    { name: "IBM Plex Sans Arabic", family: "'IBM Plex Sans Arabic', sans-serif", demo: "عربي" },
    { name: "Jacquard 12 Charted", family: "'Jacquard 12 Charted', display", demo: "Chart" },
    { name: "Jacquard 24 Charted", family: "'Jacquard 24 Charted', display", demo: "Chart" },
    { name: "Jacquarda Bastarda 9", family: "'Jacquarda Bastarda 9', display", demo: "Gothic" },
    { name: "Jersey 25 Charted", family: "'Jersey 25 Charted', display", demo: "Jersey" },
    { name: "Jomhuria", family: "'Jomhuria', display", demo: "عربي" },
    { name: "Kablammo", family: "'Kablammo', display", demo: "Kablammo" },
    { name: "Kalnia Glaze", family: "'Kalnia Glaze', display", demo: "Glaze" },
    { name: "Kumar One Outline", family: "'Kumar One Outline', display", demo: "Outline" },
    { name: "Libre Barcode 39 Text", family: "'Libre Barcode 39 Text', display", demo: "Barcode" },
    { name: "Limelight", family: "'Limelight', display", demo: "Limelight" },
    { name: "Major Mono Display", family: "'Major Mono Display', monospace", demo: "Mono" },
    { name: "Moirai One", family: "'Moirai One', display", demo: "Display" },
    { name: "Monofett", family: "'Monofett', monospace", demo: "Mono" },
    { name: "Monoton", family: "'Monoton', cursive", demo: "Display" },
    { name: "Mrs Sheppards", family: "'Mrs Sheppards', cursive", demo: "Victorian" },
    { name: "Nosifer", family: "'Nosifer', display", demo: "Horror" },
    { name: "Noto Kufi Arabic", family: "'Noto Kufi Arabic', sans-serif", demo: "عربي" },
    { name: "Palette Mosaic", family: "'Palette Mosaic', display", demo: "Mosaic" },
    { name: "Rock Salt", family: "'Rock Salt', cursive", demo: "Rock" },
    { name: "Rubik Beastly", family: "'Rubik Beastly', display", demo: "Beastly" },
    { name: "Rubik Broken Fax", family: "'Rubik Broken Fax', display", demo: "Broken" },
    { name: "Rubik Gemstones", family: "'Rubik Gemstones', display", demo: "Gems" },
    { name: "Rubik Glitch Pop", family: "'Rubik Glitch Pop', display", demo: "Glitch" },
    { name: "Rubik Puddles", family: "'Rubik Puddles', display", demo: "Puddles" },
    { name: "Sancreek", family: "'Sancreek', display", demo: "Western" },
    { name: "Sixtyfour", family: "'Sixtyfour', monospace", demo: "Pixel" },
    { name: "Sonsie One", family: "'Sonsie One', display", demo: "Sonsie" }
];

let currentFontFamily = ALL_FONTS[0].family;

function initializeFonts() {
    const fontGrid = document.getElementById('fontGrid');
    if (!fontGrid) {
        console.error('fontGrid element not found');
        return;
    }
    
    fontGrid.innerHTML = '';
    fontGrid.className = 'horizontal-controls';
    
    ALL_FONTS.forEach((font, index) => {
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        if (index === 0) fontItem.classList.add('selected');
        
        fontItem.onclick = () => selectFont(font.family, fontItem);
        
        const fontSample = document.createElement('span');
        fontSample.style.fontFamily = font.family;
        fontSample.textContent = font.demo;
        
        fontItem.appendChild(fontSample);
        fontGrid.appendChild(fontItem);
    });
    
    console.log('✓ تم تحميل', ALL_FONTS.length, 'خط');
}

function selectFont(fontFamily, fontElement) {
    currentFontFamily = fontFamily;
    window.currentFontFamily = fontFamily;
    
    document.querySelectorAll('.font-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    if (fontElement) {
        fontElement.classList.add('selected');
    }
    
    if (window.currentText && window.currentText.trim() !== '') {
        if (typeof renderFullCanvas === 'function') {
            renderFullCanvas();
        }
    }
    
    console.log('✓ تم اختيار الخط:', fontFamily);
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('⏳ جاري تحميل الخطوط...');
    
    if (document.fonts) {
        document.fonts.ready.then(() => {
            console.log('✓ تم تحميل جميع الخطوط');
            setTimeout(() => {
                initializeFonts();
            }, 300);
        });
    } else {
        setTimeout(() => {
            initializeFonts();
        }, 1000);
    }
});

window.initializeFonts = initializeFonts;
window.selectFont = selectFont;
window.currentFontFamily = currentFontFamily;
window.ALL_FONTS = ALL_FONTS;
