class CanvasEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.canvasWrapper = null;
        this.image = null;
        this.imageObj = new Image();
        
        this.currentTextElement = null;
        this.selectedBgColor = '#FFFFFF';
        this.selectedRatio = '9:16';
        
        this.textProps = {
            content: '',
            font: 'Almarai',
            size: 48,
            color: '#000000',
            strokeWidth: 0,
            strokeColor: '#FFFFFF',
            shadowBlur: 0,
            bgOpacity: 0,
            bgColor: '#000000',
            isBold: false,
            isItalic: false,
            maxWidth: 400,
            gradientEnabled: false,
            gradientColors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
        };
        
        this.backgroundGradient = {
            enabled: false,
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
        };
        
        this.filters = {
            blurValue: 0
        };
        
        this.longPressTimer = null;
        this.longPressDuration = 800;
        
        this.init();
    }
    
    init() {
        const container = document.querySelector('.canvas-container');
        this.canvasWrapper = document.createElement('div');
        this.canvasWrapper.className = 'canvas-wrapper';
        container.appendChild(this.canvasWrapper);
        this.canvasWrapper.appendChild(this.canvas);
        
        this.initLongPress();
    }
    
    initLongPress() {
        this.canvasWrapper.addEventListener('touchstart', (e) => {
            if (!this.image) return;
            this.longPressTimer = setTimeout(() => {
                this.download();
            }, this.longPressDuration);
        });
        
        this.canvasWrapper.addEventListener('touchend', () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        });
        
        this.canvasWrapper.addEventListener('touchmove', () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        });
        
        this.canvasWrapper.addEventListener('mousedown', (e) => {
            if (!this.image) return;
            this.longPressTimer = setTimeout(() => {
                this.download();
            }, this.longPressDuration);
        });
        
        this.canvasWrapper.addEventListener('mouseup', () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        });
        
        this.canvasWrapper.addEventListener('mouseleave', () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        });
    }
    
    createBackground(color, ratio) {
        this.selectedBgColor = color;
        this.selectedRatio = ratio;
        
        let width = 1080;
        const [w, h] = ratio.split(':').map(Number);
        let height = (width * h) / w;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        if (this.backgroundGradient.enabled) {
            const gradient = this.ctx.createLinearGradient(0, 0, width, height);
            const colors = this.backgroundGradient.colors;
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(0.5, colors[1]);
            gradient.addColorStop(1, colors[2]);
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = color;
        }
        this.ctx.fillRect(0, 0, width, height);
        
        this.image = { 
            isBackground: true, 
            color: color, 
            width: width, 
            height: height,
            hasGradient: this.backgroundGradient.enabled,
            gradientColors: [...this.backgroundGradient.colors]
        };
        
        if (this.currentTextElement) {
            this.currentTextElement.remove();
            this.currentTextElement = null;
        }
        
        this.adjustTextColorForBackground(color);
        this.render();
    }
    
    adjustTextColorForBackground(bgColor) {
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        if (brightness > 128) {
            this.textProps.color = '#000000';
        } else {
            this.textProps.color = '#FFFFFF';
        }
        
        if (window.editorUI) {
            window.editorUI.updateColorUI();
        }
    }
    
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            this.imageObj.crossOrigin = 'anonymous';
            
            this.imageObj.onload = () => {
                this.image = this.imageObj;
                
                let width = this.image.width;
                let height = this.image.height;
                
                const maxWidth = window.innerWidth * 2;
                const maxHeight = window.innerHeight * 2;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = width / height;
                    if (width > maxWidth) {
                        width = maxWidth;
                        height = width / ratio;
                    }
                    if (height > maxHeight) {
                        height = maxHeight;
                        width = height * ratio;
                    }
                }
                
                this.canvas.width = width;
                this.canvas.height = height;
                
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                
                if (this.currentTextElement) {
                    this.currentTextElement.remove();
                    this.currentTextElement = null;
                }
                
                this.render();
                resolve();
            };
            
            this.imageObj.onerror = reject;
            this.imageObj.src = url;
        });
    }
    
    render() {
        if (!this.image) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        
        if (this.image.isBackground) {
            if (this.image.hasGradient) {
                const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                gradient.addColorStop(0, this.image.gradientColors[0]);
                gradient.addColorStop(0.5, this.image.gradientColors[1]);
                gradient.addColorStop(1, this.image.gradientColors[2]);
                this.ctx.fillStyle = gradient;
            } else {
                this.ctx.fillStyle = this.image.color;
            }
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            if (this.filters.blurValue > 0) {
                this.ctx.filter = `blur(${this.filters.blurValue}px)`;
            } else {
                this.ctx.filter = 'none';
            }
            
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.ctx.restore();
    }
    
    formatTextWithWidth(text, maxWidth) {
        const words = text.trim().split(/\s+/);
        
        if (maxWidth <= 0 || maxWidth >= words.length) {
            return words.join(' ');
        }
        
        const wordsPerLine = Math.max(1, Math.floor(words.length / maxWidth));
        const lines = [];
        
        for (let i = 0; i < words.length; i += wordsPerLine) {
            const line = words.slice(i, i + wordsPerLine).join(' ');
            lines.push(line);
        }
        
        return lines.join('\n');
    }
    
    updateText(content) {
        const rawContent = content.trim();
        if (!rawContent && this.currentTextElement) {
            this.currentTextElement.remove();
            this.currentTextElement = null;
            this.textProps.content = '';
            return;
        }
        
        this.textProps.content = rawContent;
        
        if (rawContent && !this.currentTextElement) {
            this.createTextElement();
        } else if (this.currentTextElement) {
            this.updateTextElement();
        }
    }
    
    createTextElement() {
        if (this.currentTextElement) {
            this.currentTextElement.remove();
        }
        
        const textEl = document.createElement('div');
        textEl.className = 'draggable-text';
        textEl.style.left = '50%';
        textEl.style.top = '50%';
        textEl.style.transform = 'translate(-50%, -50%)';
        textEl.style.whiteSpace = 'pre-wrap';
        textEl.style.wordWrap = 'break-word';
        textEl.style.maxWidth = this.textProps.maxWidth + 'px';
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        this.makeDraggable(textEl);
        this.addTextControls(textEl);
    }
    
    applyTextStyle(element) {
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                element.removeChild(node);
            }
        });
        
        const textNode = document.createTextNode(this.textProps.content);
        element.insertBefore(textNode, element.firstChild);
        
        let fontStyle = this.textProps.isItalic ? 'italic' : 'normal';
        let fontWeight = this.textProps.isBold ? 'bold' : 'normal';
        
        element.style.fontFamily = `"${this.textProps.font}", sans-serif`;
        element.style.fontSize = `${this.textProps.size}px`;
        element.style.fontWeight = fontWeight;
        element.style.fontStyle = fontStyle;
        
        if (this.textProps.gradientEnabled) {
            const colors = this.textProps.gradientColors;
            element.style.background = `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
            element.style.webkitBackgroundClip = 'text';
            element.style.backgroundClip = 'text';
            element.style.webkitTextFillColor = 'transparent';
            element.style.color = 'transparent';
        } else {
            element.style.background = 'none';
            element.style.webkitBackgroundClip = 'initial';
            element.style.backgroundClip = 'initial';
            element.style.webkitTextFillColor = 'initial';
            element.style.color = this.textProps.color;
        }
        
        element.style.whiteSpace = 'pre-wrap';
        element.style.wordWrap = 'break-word';
        element.style.maxWidth = this.textProps.maxWidth + 'px';
        
        if (this.textProps.strokeWidth > 0 && !this.textProps.gradientEnabled) {
            element.style.webkitTextStroke = `${this.textProps.strokeWidth}px ${this.textProps.strokeColor}`;
            element.style.textStroke = `${this.textProps.strokeWidth}px ${this.textProps.strokeColor}`;
        } else if (!this.textProps.gradientEnabled) {
            element.style.webkitTextStroke = '';
            element.style.textStroke = '';
        }
        
        if (this.textProps.shadowBlur > 0) {
            element.style.textShadow = `4px 4px ${this.textProps.shadowBlur}px rgba(0, 0, 0, 0.8)`;
        } else {
            element.style.textShadow = '';
        }
        
        if (this.textProps.bgOpacity > 0) {
            const hex = this.textProps.bgColor;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const opacity = this.textProps.bgOpacity / 100;
            element.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            element.style.padding = '10px';
            element.style.borderRadius = '5px';
        } else {
            element.style.backgroundColor = 'transparent';
            element.style.padding = '10px 0';
        }
    }
    
    addTextControls(element) {
        const oldControls = element.querySelector('.text-controls');
        if (oldControls) oldControls.remove();
        
        const controls = document.createElement('div');
        controls.className = 'text-controls';
        controls.innerHTML = `
            <button class="control-btn delete" data-action="delete" title="Delete">
                <span class="material-icons">close</span>
            </button>
            <button class="control-btn copy" data-action="duplicate" title="Copy">
                <span class="material-icons">content_copy</span>
            </button>
            <button class="control-btn edit" data-action="edit" title="Edit">
                <span class="material-icons">edit</span>
            </button>
            <div class="line-width-controls">
                <button class="line-width-btn" data-action="decrease-width" title="Wider Lines">
                    <span class="material-icons">unfold_more</span>
                </button>
                <button class="line-width-btn" data-action="increase-width" title="Narrower Lines">
                    <span class="material-icons">unfold_less</span>
                </button>
            </div>
        `;
        
        element.appendChild(controls);
        
        controls.querySelectorAll('.control-btn, .line-width-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleControlAction(btn.dataset.action, element, controls);
            });
        });
    }
    
    handleControlAction(action, element, controls) {
        switch(action) {
            case 'delete':
                element.remove();
                this.currentTextElement = null;
                this.textProps.content = '';
                if (window.editorUI) {
                    document.getElementById('textInput').value = '';
                }
                break;
                
            case 'edit':
                if (window.editorUI) {
                    document.getElementById('textInput').focus();
                }
                break;
                
            case 'duplicate':
                this.duplicateText(element);
                break;
                
            case 'decrease-width':
                this.adjustMaxWidth(element, 50);
                break;
                
            case 'increase-width':
                this.adjustMaxWidth(element, -50);
                break;
        }
    }
    
    adjustMaxWidth(element, delta) {
        this.textProps.maxWidth = Math.max(100, Math.min(800, this.textProps.maxWidth + delta));
        element.style.maxWidth = this.textProps.maxWidth + 'px';
    }
    
    duplicateText(element) {
        const clone = element.cloneNode(true);
        clone.style.left = `calc(${element.style.left} + 20px)`;
        clone.style.top = `calc(${element.style.top} + 20px)`;
        this.canvasWrapper.appendChild(clone);
        this.makeDraggable(clone);
        
        const oldControls = clone.querySelector('.text-controls');
        if (oldControls) oldControls.remove();
        this.addTextControls(clone);
    }
    
    updateTextElement() {
        if (!this.currentTextElement) return;
        this.applyTextStyle(this.currentTextElement);
    }
    
    makeDraggable(element) {
        let isDragging = false;
        let currentX, currentY;
        let initialX, initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        element.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        element.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
        
        function dragStart(e) {
            if (e.target.closest('.control-btn') || e.target.closest('.line-width-btn')) return;
            
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            
            if (e.target === element || element.contains(e.target)) {
                isDragging = true;
                element.classList.add('active');
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }
                
                xOffset = currentX;
                yOffset = currentY;
                
                setTranslate(currentX, currentY, element);
            }
        }
        
        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            element.classList.remove('active');
        }
        
        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
        }
    }
    
    updateTextProp(prop, value) {
        this.textProps[prop] = value;
        this.updateTextElement();
    }
    
    updateFilter(prop, value) {
        this.filters[prop] = value;
        this.render();
    }
    
    reset() {
        if (this.currentTextElement) {
            this.currentTextElement.remove();
            this.currentTextElement = null;
        }
        
        this.textProps = {
            content: '',
            font: 'Almarai',
            size: 48,
            color: '#000000',
            strokeWidth: 0,
            strokeColor: '#FFFFFF',
            shadowBlur: 0,
            bgOpacity: 0,
            bgColor: '#000000',
            isBold: false,
            isItalic: false,
            maxWidth: 400,
            gradientEnabled: false,
            gradientColors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
        };
        
        this.filters = {
            blurValue: 0
        };
        
        if (this.image) {
            this.render();
        }
        
        if (window.editorUI) {
            document.getElementById('textInput').value = '';
            document.getElementById('fontSize').value = 48;
            document.getElementById('fontSizeValue').textContent = 48;
            document.getElementById('strokeWidth').value = 0;
            document.getElementById('strokeWidthValue').textContent = 0;
            document.getElementById('shadowBlur').value = 0;
            document.getElementById('shadowBlurValue').textContent = 0;
            document.getElementById('bgOpacity').value = 0;
            document.getElementById('bgOpacityValue').textContent = 0;
            document.getElementById('imageBlur').value = 0;
            document.getElementById('blurValue').textContent = 0;
            
            document.getElementById('boldBtn')?.classList.remove('active');
            document.getElementById('italicBtn')?.classList.remove('active');
        }
    }
    
    async download() {
        if (!this.image) {
            const lang = localStorage.getItem('language') || 'en';
            let message = 'Please upload an image or create background first';
            if (lang === 'ar') {
                message = 'الرجاء رفع صورة أو إنشاء خلفية أولاً';
            } else if (lang === 'fr') {
                message = 'Veuillez télécharger une image ou créer un fond d\'abord';
            }
            alert(message);
            return;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + Date.now();
        const filename = `edited-photo-${timestamp}.png`;
        
        try {
            // إخفاء أدوات التحكم مؤقتاً
            const allControls = this.canvasWrapper.querySelectorAll('.text-controls');
            allControls.forEach(ctrl => ctrl.style.display = 'none');
            
            const allTexts = this.canvasWrapper.querySelectorAll('.draggable-text');
            allTexts.forEach(text => text.classList.remove('active'));
            
            // استيراد html2canvas
            const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
            
            // الحصول على أبعاد canvas
            const canvasRect = this.canvas.getBoundingClientRect();
            const wrapperRect = this.canvasWrapper.getBoundingClientRect();
            
            // التقاط الصورة بنفس حجم canvas الأصلي
            const finalCanvas = await html2canvas(this.canvasWrapper, {
                backgroundColor: null,
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: this.canvas.width,
                height: this.canvas.height,
                windowWidth: this.canvas.width,
                windowHeight: this.canvas.height,
                x: (canvasRect.left - wrapperRect.left),
                y: (canvasRect.top - wrapperRect.top)
            });
            
            // إعادة إظهار الأدوات
            allControls.forEach(ctrl => ctrl.style.display = '');
            
            // التنزيل
            const blob = await new Promise((resolve) => {
                finalCanvas.toBlob(resolve, 'image/png', 1.0);
            });
            
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = filename;
                link.href = url;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 1000);
                
                console.log('Downloaded successfully');
            }
            
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to save image');
        }
    }
}

window.canvasEditor = new CanvasEditor();
