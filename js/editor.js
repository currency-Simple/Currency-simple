class EditorUI {
    constructor() {
        this.currentTool = 'text';
        this.selectedBgColor = '#FFFFFF';
        this.selectedRatio = '9:16';
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
    }
    
    initTools() {
        // Upload
        this.uploadArea.addEventListener('click', () => {
            this.imageUpload.click();
        });
        
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
        
        // Size buttons
        this.sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedRatio = btn.dataset.ratio;
            });
        });
        
        // Create Background Button
        this.createBackgroundBtn.addEventListener('click', () => {
            window.canvasEditor.createBackground(this.selectedBgColor, this.selectedRatio);
        });
        
        // Tool buttons
        this.toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                this.switchTool(tool);
            });
        });
    }
    
    initControls() {
        // Text
        this.textInput.addEventListener('input', (e) => {
            window.canvasEditor.updateText(e.target.value);
        });
        
        // Font Size
        this.fontSize.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.fontSizeValue.textContent = value;
            window.canvasEditor.updateTextProp('size', value);
        });
        
        // Stroke
        this.strokeWidth.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.strokeWidthValue.textContent = value;
            window.canvasEditor.updateTextProp('strokeWidth', value);
        });
        
        // Shadow
        this.shadowBlur.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.shadowBlurValue.textContent = value;
            window.canvasEditor.updateTextProp('shadowBlur', value);
        });
        
        // Background
        this.bgOpacity.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.bgOpacityValue.textContent = value;
            window.canvasEditor.updateTextProp('bgOpacity', value);
        });
        
        // Blur
        this.imageBlur.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.blurValue.textContent = value;
            window.canvasEditor.updateFilter('blurValue', value);
        });
        
        // Bold
        this.boldBtn.addEventListener('click', () => {
            const isActive = this.boldBtn.classList.toggle('active');
            window.canvasEditor.updateTextProp('isBold', isActive);
        });
        
        // Italic
        this.italicBtn.addEventListener('click', () => {
            const isActive = this.italicBtn.classList.toggle('active');
            window.canvasEditor.updateTextProp('isItalic', isActive);
        });
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
    }
    
    createFontScroll() {
        const container = document.getElementById('fontScroll');
        if (!container) return;
        
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
        if (!container) return;
        
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
        if (!container) return;
        
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

window.editorUI = new EditorUI();
