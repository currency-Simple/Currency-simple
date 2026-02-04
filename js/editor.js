class EditorUI {
    constructor() {
        this.currentTool = 'text';
        this.selectedBgColor = '#FFFFFF';
        this.selectedRatio = '9:16';
        
        // انتظار تحميل DOM بالكامل
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.initElements();
        this.initTools();
        this.initControls();
        this.createScrolls();
    }
    
    initElements() {
        this.toolBtns = document.querySelectorAll('.tool-btn');
        this.toolPanels = document.querySelectorAll('.tool-panel');
        
        this.uploadArea = document.getElementById('uploadArea');
        this.imageUpload = document.getElementById('imageUpload');
        
        this.textInput = document.getElementById('textInput');
        
        this.fontSize = document.getElementById('fontSize');
        this.fontSizeValue = document.getElementById('fontSizeValue');
        
        this.strokeWidth = document.getElementById('strokeWidth');
        this.strokeWidthValue = document.getElementById('strokeWidthValue');
        
        this.shadowBlur = document.getElementById('shadowBlur');
        this.shadowBlurValue = document.getElementById('shadowBlurValue');
        
        this.bgOpacity = document.getElementById('bgOpacity');
        this.bgOpacityValue = document.getElementById('bgOpacityValue');
        
        this.imageBlur = document.getElementById('imageBlur');
        this.blurValue = document.getElementById('blurValue');
        
        this.boldBtn = document.getElementById('boldBtn');
        this.italicBtn = document.getElementById('italicBtn');
        
        this.createBackgroundBtn = document.getElementById('createBackgroundBtn');
        this.sizeBtns = document.querySelectorAll('.size-btn');
        
        this.textGradientBtn = document.getElementById('textGradientBtn');
        this.bgGradientBtn = document.getElementById('bgGradientBtn');
    }
    
    initTools() {
        // Upload
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', () => {
                this.imageUpload.click();
            });
        }
        
        if (this.imageUpload) {
            this.imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        window.canvasEditor.loadImage(event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Size buttons
        this.sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedRatio = btn.dataset.ratio;
            });
        });
        
        // Create Background Button
        if (this.createBackgroundBtn) {
            this.createBackgroundBtn.addEventListener('click', () => {
                window.canvasEditor.createBackground(this.selectedBgColor, this.selectedRatio);
            });
        }
        
        // Tool buttons
        this.toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                this.switchTool(tool);
            });
        });
        
        // Text Gradient Button
        if (this.textGradientBtn) {
            this.textGradientBtn.addEventListener('click', () => {
                const isActive = this.textGradientBtn.classList.toggle('active');
                const colorsDiv = document.getElementById('textGradientColors');
                if (colorsDiv) {
                    colorsDiv.classList.toggle('active', isActive);
                }
                window.canvasEditor.textProps.gradientEnabled = isActive;
                window.canvasEditor.updateTextElement();
            });
        }
        
        // Background Gradient Button
        if (this.bgGradientBtn) {
            this.bgGradientBtn.addEventListener('click', () => {
                const isActive = this.bgGradientBtn.classList.toggle('active');
                const colorsDiv = document.getElementById('bgGradientColors');
                if (colorsDiv) {
                    colorsDiv.classList.toggle('active', isActive);
                }
                window.canvasEditor.backgroundGradient.enabled = isActive;
            });
        }
    }
    
    initControls() {
        // Text
        if (this.textInput) {
            this.textInput.addEventListener('input', (e) => {
                window.canvasEditor.updateText(e.target.value);
            });
        }
        
        // Font Size
        if (this.fontSize) {
            this.fontSize.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.fontSizeValue.textContent = value;
                window.canvasEditor.updateTextProp('size', value);
            });
        }
        
        // Stroke
        if (this.strokeWidth) {
            this.strokeWidth.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.strokeWidthValue.textContent = value;
                window.canvasEditor.updateTextProp('strokeWidth', value);
            });
        }
        
        // Shadow
        if (this.shadowBlur) {
            this.shadowBlur.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.shadowBlurValue.textContent = value;
                window.canvasEditor.updateTextProp('shadowBlur', value);
            });
        }
        
        // Background
        if (this.bgOpacity) {
            this.bgOpacity.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.bgOpacityValue.textContent = value;
                window.canvasEditor.updateTextProp('bgOpacity', value);
            });
        }
        
        // Blur
        if (this.imageBlur) {
            this.imageBlur.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.blurValue.textContent = value;
                window.canvasEditor.updateFilter('blurValue', value);
            });
        }
        
        // Bold
        if (this.boldBtn) {
            this.boldBtn.addEventListener('click', () => {
                const isActive = this.boldBtn.classList.toggle('active');
                window.canvasEditor.updateTextProp('isBold', isActive);
            });
        }
        
        // Italic
        if (this.italicBtn) {
            this.italicBtn.addEventListener('click', () => {
                const isActive = this.italicBtn.classList.toggle('active');
                window.canvasEditor.updateTextProp('isItalic', isActive);
            });
        }
    }
    
    switchTool(tool) {
        this.currentTool = tool;
        
        this.toolBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
        
        this.toolPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tool}Panel`);
        });
    }
    
    createScrolls() {
        this.createFontScroll();
        this.createColorScroll('colorScroll', (color) => {
            window.canvasEditor.updateTextProp('color', color);
        });
        this.createColorScroll('strokeColorScroll', (color) => {
            window.canvasEditor.updateTextProp('strokeColor', color);
        });
        this.createColorScroll('bgColorScroll', (color) => {
            window.canvasEditor.updateTextProp('bgColor', color);
        });
        this.createBgCreationColorScroll();
        this.createTextGradientPresets();
    }
    
    createFontScroll() {
        const container = document.getElementById('fontScroll');
        if (!container || typeof FONTS === 'undefined') return;
        
        FONTS.forEach(font => {
            const item = document.createElement('div');
            item.className = 'font-item';
            item.style.fontFamily = `"${font}", sans-serif`;
            item.textContent = font;
            item.addEventListener('click', () => {
                container.querySelectorAll('.font-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                window.canvasEditor.updateTextProp('font', font);
            });
            container.appendChild(item);
        });
    }
    
    createColorScroll(id, callback) {
        const container = document.getElementById(id);
        if (!container || typeof COLORS === 'undefined') return;
        
        COLORS.forEach(color => {
            const item = document.createElement('div');
            item.className = 'color-item';
            item.style.backgroundColor = color;
            item.addEventListener('click', () => {
                container.querySelectorAll('.color-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                callback(color);
            });
            container.appendChild(item);
        });
    }
    
    createBgCreationColorScroll() {
        const container = document.getElementById('bgCreateColorScroll');
        if (!container || typeof COLORS === 'undefined') return;
        
        // إضافة الألوان العادية
        COLORS.forEach(color => {
            const item = document.createElement('div');
            item.className = 'color-item';
            item.style.backgroundColor = color;
            
            if (color === '#FFFFFF') {
                item.classList.add('active');
            }
            
            item.addEventListener('click', () => {
                container.querySelectorAll('.color-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.selectedBgColor = color;
                // إلغاء تفعيل التدرج عند اختيار لون عادي
                window.canvasEditor.backgroundGradient.enabled = false;
                const bgGradientBtn = document.getElementById('bgGradientBtn');
                if (bgGradientBtn) {
                    bgGradientBtn.classList.remove('active');
                }
            });
            container.appendChild(item);
        });
        
        // إضافة مزيج الألوان الثلاثية
        if (typeof COLOR_GRADIENTS !== 'undefined') {
            COLOR_GRADIENTS.forEach(gradientColors => {
                const item = document.createElement('div');
                item.className = 'color-item gradient-item';
                item.style.background = `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[2]})`;
                
                item.addEventListener('click', () => {
                    container.querySelectorAll('.color-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    window.canvasEditor.backgroundGradient.colors = [...gradientColors];
                    window.canvasEditor.backgroundGradient.enabled = true;
                    
                    // تفعيل زر التدرج
                    const bgGradientBtn = document.getElementById('bgGradientBtn');
                    if (bgGradientBtn) {
                        bgGradientBtn.classList.add('active');
                    }
                });
                container.appendChild(item);
            });
        }
    }
    
    createTextGradientPresets() {
        const container = document.getElementById('textGradientPresets');
        if (!container || typeof COLOR_GRADIENTS === 'undefined') return;
        
        COLOR_GRADIENTS.forEach(gradientColors => {
            const item = document.createElement('div');
            item.className = 'color-item gradient-item';
            item.style.background = `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[2]})`;
            
            item.addEventListener('click', () => {
                container.querySelectorAll('.color-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                window.canvasEditor.textProps.gradientColors = [...gradientColors];
                window.canvasEditor.textProps.gradientEnabled = true;
                
                const textGradientBtn = document.getElementById('textGradientBtn');
                if (textGradientBtn) {
                    textGradientBtn.classList.add('active');
                    const colorsDiv = document.getElementById('textGradientColors');
                    if (colorsDiv) {
                        colorsDiv.classList.add('active');
                    }
                }
                
                window.canvasEditor.updateTextElement();
            });
            container.appendChild(item);
        });
    }
    
    updateColorUI() {
        const colorContainer = document.getElementById('colorScroll');
        if (colorContainer) {
            const currentColor = window.canvasEditor.textProps.color;
            colorContainer.querySelectorAll('.color-item').forEach(item => {
                item.classList.toggle('active', item.style.backgroundColor === currentColor);
            });
        }
    }
}

// تأخير التهيئة حتى يتم تحميل كل شيء
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.editorUI = new EditorUI();
    });
} else {
    window.editorUI = new EditorUI();
}
