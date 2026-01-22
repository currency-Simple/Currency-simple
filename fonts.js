// قائمة الخطوط المضمونة 100% في Canvas
const FONTS = [
  "Arial",
  "Verdana", 
  "Helvetica",
  "Times New Roman",
  "Times",
  "Courier New",
  "Courier",
  "Georgia",
  "Palatino",
  "Garamond",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Impact"
];

// تهيئة قائمة الخطوط
function initializeFonts() {
  const fontSelect = document.getElementById('fontFamily');
  if (!fontSelect) {
    console.error('fontFamily element not found');
    return;
  }
  
  fontSelect.innerHTML = '';
  
  FONTS.forEach(font => {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font;
    fontSelect.appendChild(option);
  });
  
  fontSelect.value = "Arial";
  console.log('Fonts loaded:', FONTS.length);
}