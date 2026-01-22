// ألوان ColorHunt مع الألوان الإضافية
const COLORS = [
  "#F7A8C4", "#F37199", "#E53888", "#AC1754", "#FFDFEF", "#EABDE6", "#D69ADE", "#AA60C8",
  "#F6CE71", "#CC561E", "#FF6500", "#C40C0C", "#F0F0DB", "#E1D9BC", "#ACBAC4", "#30364F",
  "#AEB877", "#D8E983", "#FFFBB1", "#A5C89E", "#9BC264", "#FFFDCE", "#F7DB91", "#F075AE",
  "#222222", "#FA8112", "#F5E7C6", "#FAF3E1", "#492828", "#656D3F", "#84934A", "#ECECEC",
  "#E4FF30", "#008BFF", "#5B23FF", "#362F4F", "#EDEDCE", "#629FAD", "#296374", "#0C2C55",
  "#111F35", "#8A244B", "#D02752", "#F63049", "#F375C2", "#B153D7", "#4D2FB2", "#0E21A0",
  "#5DD3B6", "#6E5034", "#CDB885", "#EFE1B5", "#FE7F2D", "#233D4D", "#215E61", "#F5FBE6",
  "#FAEB92", "#FF5FCF", "#9929EA", "#000000", "#FFDAB3", "#C8AAAA", "#9F8383", "#574964",
  "#FBEF76", "#FEC288", "#FD8A6B", "#FA5C5C", "#FFAAB8", "#FFD8DF", "#F0FFDF", "#A8DF8E",
  "#FA891A", "#F1E6C9", "#ABDADC", "#6E026F", "#F0F8A4", "#DAD887", "#75B06F", "#36656B",
  "#FF7DB0", "#FF0087", "#B0FFFA", "#00F7FF", "#EEEEEE", "#D8C9A7", "#DE802B", "#5C6F2B",
  "#F5F2F2", "#FEB05D", "#5A7ACD", "#2B2A2A", "#BDE8F5", "#4988C4", "#1C4D8D", "#0F2854",
  "#001F3D", "#B8DB80", "#547792", "#94B4C1", "#5A7863", "#EBF4DD", "#F6F3C2", "#FCF9EA",
  "#FFA240", "#FFD41D", "#000080", "#FF0000", "#16476A", "#132440", "#FDB5CE", "#4300FF",
  "#00FFDE", "#FF2DD1", "#FDFFB8", "#63C8FF", "#4DFFBE", "#FFFFFF",
  
  // الألوان الإضافية المطلوبة
  "#F4F4F4", "#0C2B4E", "#1A3D64", "#1D546C", "#FFF8D4", "#A3B087", "#313647", "#435663", "#D6F4ED",
  "#87BAC3", "#53629E", "#473472", "#C9B59C", "#D9CFC7", "#EFE9E3", "#F9F8F6", "#703B3B", "#A18D6D", "#E1D0B3", "#9BB4C0",
  "#B77466", "#FFE1AF", "#E2B59A", "#957C62", "#CD2C58", "#E06B80", "#FFC69D", "#FFE6D4", "#ECF4E8", "#CBF3BB", "#ABE7B2", "#93BFC7", "#84994F", "#FFE797", "#FCB53B", "#A72703", "#E52020", "#FBA518",
  "#F9CB43", "#A89C29", "#FF714B", "#C71E64", "#F2F2F2", "#FF0066",
  "#4D2D8C", "#6A0066", "#934790", "#E8D4B7", "#E62727", "#F3F2EC", "#DCDCDC", "#1E93AB", "#4E56C0", "#9B5DE0", "#D78FEE", "#FDCFFA", "#FCF9EA", "#BADFDB", "#FFA4A4", "#FFBDBD", "#7B542F", "#B6771D", "#FF9D00", "#FFCF71", "#84994F", "#FFE797", "#FCB53B", "#A72703"
];

// متغيرات لتخزين الألوان المختارة
let currentTextColor = "#FFFFFF";
let currentStrokeColor = "#000000";
let currentCardColor = "#000000";

// تخزين الألوان في window لاستخدامها في editor.js
window.currentTextColor = currentTextColor;
window.currentStrokeColor = currentStrokeColor;
window.currentCardColor = currentCardColor;

// تهيئة شبكات الألوان
function initializeColors() {
  console.log('⏳ جاري تهيئة الألوان...');
  
  // شبكة ألوان النص
  const colorGrid = document.getElementById('colorGrid');
  if (colorGrid) {
    colorGrid.innerHTML = '';
    COLORS.forEach((color, index) => {
      const item = createColorItem(color, () => setTextColor(color));
      colorGrid.appendChild(item);
    });
    console.log(`✓ تم تحميل ${COLORS.length} لون للنص`);
  }

  // شبكة ألوان الحواف
  const strokeGrid = document.getElementById('strokeColorGrid');
  if (strokeGrid) {
    strokeGrid.innerHTML = '';
    COLORS.forEach((color, index) => {
      const item = createColorItem(color, () => setStrokeColor(color));
      strokeGrid.appendChild(item);
    });
    console.log(`✓ تم تحميل ${COLORS.length} لون للحواف`);
  }

  // شبكة ألوان الخلفية
  const cardGrid = document.getElementById('cardColorGrid');
  if (cardGrid) {
    cardGrid.innerHTML = '';
    COLORS.forEach((color, index) => {
      const item = createColorItem(color, () => setCardColor(color));
      cardGrid.appendChild(item);
    });
    console.log(`✓ تم تحميل ${COLORS.length} لون للخلفية`);
  }
}

// إنشاء عنصر لون
function createColorItem(color, onClick) {
  const item = document.createElement('div');
  item.className = 'color-item';
  item.style.backgroundColor = color;
  item.onclick = onClick;
  item.title = color;
  
  // إضافة حدود للألوان الفاتحة جداً
  if (color === "#FFFFFF" || color === "#FFFBB1" || color === "#FFFDCE" || 
      color === "#F4F4F4" || color === "#F2F2F2" || color === "#FCF9EA" ||
      color === "#F9F8F6" || color === "#F3F2EC" || color === "#EFE9E3" ||
      color === "#DCDCDC" || color === "#ECF4E8" || color === "#FFE6D4") {
    item.style.border = "2px solid #ccc";
  }
  
  return item;
}

// تعيين لون النص
function setTextColor(color) {
  currentTextColor = color;
  window.currentTextColor = color;
  console.log('✓ لون النص:', color);
  
  // تحديث النمط فوراً
  if (window.currentText) {
    if (typeof updateTextOnCanvas === 'function') {
      updateTextOnCanvas();
    }
  }
}

// تعيين لون الحواف
function setStrokeColor(color) {
  currentStrokeColor = color;
  window.currentStrokeColor = color;
  console.log('✓ لون الحواف:', color);
  
  // تحديث النمط فوراً
  if (window.currentText) {
    if (typeof updateTextOnCanvas === 'function') {
      updateTextOnCanvas();
    }
  }
}

// تعيين لون الخلفية
function setCardColor(color) {
  currentCardColor = color;
  window.currentCardColor = color;
  console.log('✓ لون الخلفية:', color);
  
  // تحديث النمط فوراً
  if (window.currentText) {
    if (typeof updateTextOnCanvas === 'function') {
      updateTextOnCanvas();
    }
  }
}
