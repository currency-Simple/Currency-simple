// Canvas Editor with Background Creation
class CanvasEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.canvasWrapper = null;
        this.image = null;
        this.imageObj = new Image();
        
        // Current text element
        this.currentTextElement = null;
        
        // Selected background color for creation
        this.selectedBgColor = '#FFFFFF';
        
        // Text settings (default)
        this.textProps = {
            content: '',
            font: 'Abeezee',
            size: 48,
            color: '#000000',
            strokeWidth: 0,
            strokeColor: '#FFFFFF',
            shadowBlur: 0,
            bgOpacity: 0,
            bgColor: '#000000'
        };
        
        // Image filters
        this.filters = {
            blurValue: 0
        };
        
        this.init();
    }
    
    init() {
        // Create canvas wrapper
        const container = document.querySelector('.canvas-container');
        this.canvasWrapper = document.createElement('div');
        this.canvasWrapper.className = 'canvas-wrapper';
        
        // Move canvas into wrapper
        container.appendChild(this.canvasWrapper);
        this.canvasWrapper.appendChild(this.canvas);
    }
    
    // إنشاء خلفية بحجم 3:5
    createBackground(color) {
        this.selectedBgColor = color;
        
        // حساب الأبعاد بنسبة 3:5
        const maxWidth = window.innerWidth - 32;
        const maxHeight = window.innerHeight - 300;
        
        let width = 600;  // 3 * 200
        let height = 1000; // 5 * 200
        
        // تصغير إذا كان أكبر من الشاشة
        if (width > maxWidth) {
            width = maxWidth;
            height = width * (5/3);
        }
        if (height > maxHeight) {
            height = maxHeight;
            width = height * (3/5);
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // رسم الخلفية
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, width, height);
        
        // حفظ كصورة داخلية
        this.image = { isBackground: true, color: color, width: width, height: height };
        
        // إزالة النص القديم
        if (this.currentTextElement) {
            this.currentTextElement.remove();
            this.currentTextElement = null;
        }
        
        // تغيير لون النص الافتراضي حسب الخلفية
        this.adjustTextColorForBackground(color);
        
        this.render();
    }
    
    // تعديل لون النص حسب الخلفية
    adjustTextColorForBackground(bgColor) {
        // تحويل hex إلى RGB
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        
        // حساب السطوع
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // إذا كانت الخلفية فاتحة، استخدم نص غامق
        if (brightness > 128) {
            this.textProps.color = '#000000';
        } else {
            this.textProps.color = '#FFFFFF';
        }
        
        // تحديث واجهة المستخدم
        if (window.editorUI) {
            window.editorUI.updateColorUI();
        }
    }
    
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            this.imageObj.crossOrigin = 'anonymous';
            
            this.imageObj.onload = () => {
                this.image = this.imageObj;
                
                const maxWidth = window.innerWidth - 32;
                const maxHeight = window.innerHeight - 300;
                
                let width = this.image.width;
                let height = this.image.height;
                const ratio = width / height;
                
                if (width > maxWidth || height > maxHeight) {
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
                
                // Remove old text element
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
        
        // رسم الخلفية أو الصورة
        if (this.image.isBackground) {
            // خلفية ملونة
            this.ctx.fillStyle = this.image.color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // صورة عادية
            // Blur filter
            if (this.filters.blurValue > 0) {
                this.ctx.filter = `blur(${this.filters.blurValue}px)`;
            } else {
                this.ctx.filter = 'none';
            }
            
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.ctx.restore();
    }
    
    updateText(content) {
        this.textProps.content = content;
        
        if (content && !this.currentTextElement) {
            this.createTextElement();
        } else if (this.currentTextElement) {
            this.updateTextElement();
        } else if (!content && this.currentTextElement) {
            this.currentTextElement.remove();
            this.currentTextElement = null;
        }
    }
    
    createTextElement() {
        // Remove old element
        if (this.currentTextElement) {
            this.currentTextElement.remove();
        }
        
        // Remove old transform box
        if (this.transformBox) {
            this.transformBox.remove();
        }
        
        // Create new draggable text element
        const textEl = document.createElement('div');
        textEl.className = 'draggable-text';
        textEl.style.left = '50%';
        textEl.style.top = '50%';
        textEl.style.transform = 'translate(-50%, -50%)';
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        // Create transform box
        this.createTransformBox(textEl);
        
        // Make it draggable and transformable
        this.makeTransformable(textEl);
    }
    
    applyTextStyle(element) {
        element.textContent = this.textProps.content;
        element.style.fontFamily = `"${this.textProps.font}"`;
        element.style.fontSize = `${this.textProps.size}px`;
        element.style.color = this.textProps.color;
        
        // Stroke
        if (this.textProps.strokeWidth > 0) {
            element.style.webkitTextStroke = `${this.textProps.strokeWidth}px ${this.textProps.strokeColor}`;
            element.style.textStroke = `${this.textProps.strokeWidth}px ${this.textProps.strokeColor}`;
        } else {
            element.style.webkitTextStroke = '';
            element.style.textStroke = '';
        }
        
        // Shadow
        if (this.textProps.shadowBlur > 0) {
            element.style.textShadow = `4px 4px ${this.textProps.shadowBlur}px rgba(0, 0, 0, 0.8)`;
        } else {
            element.style.textShadow = '';
        }
        
        // Background
        if (this.textProps.bgOpacity > 0) {
            const hex = this.textProps.bgColor;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const opacity = this.textProps.bgOpacity / 100;
            element.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        } else {
            element.style.backgroundColor = 'transparent';
        }
    }
    
    updateTextElement() {
        if (!this.currentTextElement) return;
        this.applyTextStyle(this.currentTextElement);
    }
    
    createTransformBox(textElement) {
        // Create transform box
        const box = document.createElement('div');
        box.className = 'text-transform-box';
        
        // Create controls container
        const controls = document.createElement('div');
        controls.className = 'transform-controls';
        
        // Rotate button (🔄)
        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'transform-btn rotate-btn';
        rotateBtn.innerHTML = '🔄';
        rotateBtn.title = 'Rotate';
        rotateBtn.dataset.action = 'rotate';
        
        // Width button (↔️) - تصغير/تكبير العرض (السطور)
        const widthBtn = document.createElement('button');
        widthBtn.className = 'transform-btn width-btn';
        widthBtn.innerHTML = '↔';
        widthBtn.title = 'Width';
        widthBtn.dataset.action = 'width';
        
        // Scale button (⇲) - تكبير/تصغير الحجم
        const scaleBtn = document.createElement('button');
        scaleBtn.className = 'transform-btn scale-btn';
        scaleBtn.innerHTML = '⇲';
        scaleBtn.title = 'Scale';
        scaleBtn.dataset.action = 'scale';
        
        controls.appendChild(rotateBtn);
        controls.appendChild(widthBtn);
        controls.appendChild(scaleBtn);
        box.appendChild(controls);
        
        this.canvasWrapper.appendChild(box);
        this.transformBox = box;
        this.updateTransformBox(textElement);
    }
    
    updateTransformBox(textElement) {
        if (!this.transformBox) return;
        
        const rect = textElement.getBoundingClientRect();
        const containerRect = this.canvasWrapper.getBoundingClientRect();
        
        this.transformBox.style.left = (rect.left - containerRect.left) + 'px';
        this.transformBox.style.top = (rect.top - containerRect.top) + 'px';
        this.transformBox.style.width = rect.width + 'px';
        this.transformBox.style.height = rect.height + 'px';
    }
    
    makeTransformable(element) {
        let isDragging = false;
        let isRotating = false;
        let isResizingWidth = false;
        let isScaling = false;
        
        let startX, startY;
        let startWidth, startHeight;
        let startRotation = 0;
        let currentRotation = 0;
        let elementX = 0, elementY = 0;
        let startFontSize = this.textProps.size;
        
        // Parse transform
        const getTransform = () => {
            const transform = element.style.transform || '';
            const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
            
            return {
                x: translateMatch ? parseFloat(translateMatch[1]) : 0,
                y: translateMatch ? parseFloat(translateMatch[2]) : 0,
                rotation: rotateMatch ? parseFloat(rotateMatch[1]) : 0
            };
        };
        
        const setTransform = (x, y, rotation) => {
            element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            this.updateTransformBox(element);
        };
        
        // Click on text to show transform box
        element.addEventListener('mousedown', (e) => {
            if (e.target === element) {
                this.transformBox.classList.add('active');
                element.classList.add('active');
                
                isDragging = true;
                const transform = getTransform();
                elementX = transform.x;
                elementY = transform.y;
                currentRotation = transform.rotation;
                startX = e.clientX;
                startY = e.clientY;
                e.preventDefault();
            }
        });
        
        element.addEventListener('touchstart', (e) => {
            if (e.target === element) {
                this.transformBox.classList.add('active');
                element.classList.add('active');
                
                isDragging = true;
                const transform = getTransform();
                elementX = transform.x;
                elementY = transform.y;
                currentRotation = transform.rotation;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                e.preventDefault();
            }
        }, { passive: false });
        
        // Handle button clicks
        this.transformBox.addEventListener('click', (e) => {
            const btn = e.target.closest('.transform-btn');
            if (!btn) return;
            
            const action = btn.dataset.action;
            
            if (action === 'rotate') {
                // Rotate 90 degrees
                const transform = getTransform();
                setTransform(transform.x, transform.y, transform.rotation + 90);
            } else if (action === 'width') {
                // Toggle width between normal and wider
                const currentWidth = element.style.width;
                if (!currentWidth || currentWidth === 'auto') {
                    element.style.width = element.offsetWidth * 1.5 + 'px';
                } else {
                    const width = parseFloat(currentWidth);
                    if (width > element.scrollWidth) {
                        element.style.width = 'auto';
                    } else {
                        element.style.width = width * 1.5 + 'px';
                    }
                }
                this.updateTransformBox(element);
            } else if (action === 'scale') {
                // Scale font size
                const currentSize = this.textProps.size;
                const newSize = currentSize < 200 ? currentSize + 10 : 48;
                this.textProps.size = newSize;
                this.updateTextElement();
                this.updateTransformBox(element);
                
                // Update UI slider
                if (document.getElementById('fontSize')) {
                    document.getElementById('fontSize').value = newSize;
                    document.getElementById('fontSizeValue').textContent = newSize;
                }
            }
            
            e.stopPropagation();
        });
        
        // Long press on rotate button for continuous rotation
        let rotateInterval = null;
        this.transformBox.addEventListener('mousedown', (e) => {
            const btn = e.target.closest('.transform-btn');
            if (btn && btn.dataset.action === 'rotate') {
                isRotating = true;
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                startRotation = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
                currentRotation = getTransform().rotation;
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        this.transformBox.addEventListener('touchstart', (e) => {
            const btn = e.target.closest('.transform-btn');
            if (btn && btn.dataset.action === 'rotate') {
                isRotating = true;
                const touch = e.touches[0];
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                startRotation = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
                currentRotation = getTransform().rotation;
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });
        
        // Mouse/Touch move
        document.addEventListener('mousemove', (e) => {
            if (isDragging && !isRotating) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                setTransform(elementX + deltaX, elementY + deltaY, currentRotation);
            } else if (isRotating) {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
                const rotation = currentRotation + (angle - startRotation);
                
                const transform = getTransform();
                setTransform(transform.x, transform.y, rotation);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging && !isRotating) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - startX;
                const deltaY = touch.clientY - startY;
                setTransform(elementX + deltaX, elementY + deltaY, currentRotation);
            } else if (isRotating) {
                const touch = e.touches[0];
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
                const rotation = currentRotation + (angle - startRotation);
                
                const transform = getTransform();
                setTransform(transform.x, transform.y, rotation);
            }
        }, { passive: false });
        
        // Mouse/touch up
        const endInteraction = () => {
            isDragging = false;
            isRotating = false;
            isResizingWidth = false;
            isScaling = false;
            if (rotateInterval) {
                clearInterval(rotateInterval);
                rotateInterval = null;
            }
        };
        
        document.addEventListener('mouseup', endInteraction);
        document.addEventListener('touchend', endInteraction);
        
        // Click outside to deselect
        document.addEventListener('click', (e) => {
            if (!element.contains(e.target) && !this.transformBox.contains(e.target)) {
                this.transformBox.classList.remove('active');
                element.classList.remove('active');
            }
        });
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
        // إعادة تعيين كل شيء
        if (this.currentTextElement) {
            this.currentTextElement.remove();
            this.currentTextElement = null;
        }
        
        // إعادة تعيين النص
        this.textProps = {
            content: '',
            font: 'Abeezee',
            size: 48,
            color: '#000000',
            strokeWidth: 0,
            strokeColor: '#FFFFFF',
            shadowBlur: 0,
            bgOpacity: 0,
            bgColor: '#000000'
        };
        
        // إعادة تعيين الفلاتر
        this.filters = {
            blurValue: 0
        };
        
        // إعادة رسم الصورة الأصلية
        if (this.image) {
            this.render();
        }
        
        // إعادة تعيين واجهة المستخدم
        if (window.editorUI) {
            // Text input
            document.getElementById('textInput').value = '';
            
            // Sliders
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
        
        try {
            // Use html2canvas-like approach: capture the actual visual
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw the base image/background
            tempCtx.drawImage(this.canvas, 0, 0);
            
            // If text exists, capture it from DOM by rendering it properly
            if (this.currentTextElement && this.textProps.content) {
                // Get the text element's computed style and position
                const canvasRect = this.canvas.getBoundingClientRect();
                const textRect = this.currentTextElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(this.currentTextElement);
                
                // Calculate position relative to canvas
                const scaleX = this.canvas.width / canvasRect.width;
                const scaleY = this.canvas.height / canvasRect.height;
                
                const x = (textRect.left - canvasRect.left) * scaleX;
                const y = (textRect.top - canvasRect.top) * scaleY;
                const width = textRect.width * scaleX;
                const height = textRect.height * scaleY;
                
                // Get transform values
                const transform = this.currentTextElement.style.transform || '';
                const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
                const rotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
                
                // Save context
                tempCtx.save();
                
                // Apply rotation around text center
                const centerX = x + width / 2;
                const centerY = y + height / 2;
                tempCtx.translate(centerX, centerY);
                tempCtx.rotate(rotation * Math.PI / 180);
                tempCtx.translate(-centerX, -centerY);
                
                // Draw text background if exists
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    tempCtx.fillRect(x, y, width, height);
                }
                
                // Split text into lines as displayed
                const lines = this.textProps.content.split('\n');
                const fontSize = this.textProps.size;
                const lineHeight = fontSize * 1.3;
                
                // Set up text styling
                tempCtx.font = `${fontSize}px "${this.textProps.font}"`;
                tempCtx.textAlign = computedStyle.textAlign || 'center';
                tempCtx.textBaseline = 'middle';
                
                // Draw shadow if exists
                if (this.textProps.shadowBlur > 0) {
                    tempCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    tempCtx.shadowBlur = this.textProps.shadowBlur;
                    tempCtx.shadowOffsetX = 4;
                    tempCtx.shadowOffsetY = 4;
                }
                
                // Calculate starting Y position to center text vertically
                const totalTextHeight = lines.length * lineHeight;
                let currentY = y + (height - totalTextHeight) / 2 + lineHeight / 2;
                
                // Draw each line
                lines.forEach(line => {
                    const lineX = tempCtx.textAlign === 'center' ? x + width / 2 : x + 10;
                    
                    // Draw stroke if exists
                    if (this.textProps.strokeWidth > 0) {
                        tempCtx.strokeStyle = this.textProps.strokeColor;
                        tempCtx.lineWidth = this.textProps.strokeWidth * 2;
                        tempCtx.strokeText(line, lineX, currentY);
                    }
                    
                    // Draw fill text
                    tempCtx.fillStyle = this.textProps.color;
                    tempCtx.fillText(line, lineX, currentY);
                    
                    currentY += lineHeight;
                });
                
                // Restore context
                tempCtx.restore();
            }
            
            // Download with maximum quality
            const link = document.createElement('a');
            link.download = `photo-editor-${Date.now()}.png`;
            link.href = tempCanvas.toDataURL('image/png', 1.0);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        }
    }
    
    async share() {
        if (!this.image) {
            const lang = localStorage.getItem('language') || 'en';
            let message = 'Please upload an image or create background first';
            if (lang === 'ar') {
                message = 'الرجاء رفع صورة أو إنشاء خلفية أولاً';
            } else if (lang === 'fr') {
                message = 'Veuillez télécharger une image أو créer un fond d\'abord';
            }
            alert(message);
            return;
        }
        
        try {
            // Use same approach as download
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw the base image/background
            tempCtx.drawImage(this.canvas, 0, 0);
            
            // If text exists, capture it from DOM
            if (this.currentTextElement && this.textProps.content) {
                const canvasRect = this.canvas.getBoundingClientRect();
                const textRect = this.currentTextElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(this.currentTextElement);
                
                const scaleX = this.canvas.width / canvasRect.width;
                const scaleY = this.canvas.height / canvasRect.height;
                
                const x = (textRect.left - canvasRect.left) * scaleX;
                const y = (textRect.top - canvasRect.top) * scaleY;
                const width = textRect.width * scaleX;
                const height = textRect.height * scaleY;
                
                const transform = this.currentTextElement.style.transform || '';
                const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
                const rotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
                
                tempCtx.save();
                
                const centerX = x + width / 2;
                const centerY = y + height / 2;
                tempCtx.translate(centerX, centerY);
                tempCtx.rotate(rotation * Math.PI / 180);
                tempCtx.translate(-centerX, -centerY);
                
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    tempCtx.fillRect(x, y, width, height);
                }
                
                const lines = this.textProps.content.split('\n');
                const fontSize = this.textProps.size;
                const lineHeight = fontSize * 1.3;
                
                tempCtx.font = `${fontSize}px "${this.textProps.font}"`;
                tempCtx.textAlign = computedStyle.textAlign || 'center';
                tempCtx.textBaseline = 'middle';
                
                if (this.textProps.shadowBlur > 0) {
                    tempCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    tempCtx.shadowBlur = this.textProps.shadowBlur;
                    tempCtx.shadowOffsetX = 4;
                    tempCtx.shadowOffsetY = 4;
                }
                
                const totalTextHeight = lines.length * lineHeight;
                let currentY = y + (height - totalTextHeight) / 2 + lineHeight / 2;
                
                lines.forEach(line => {
                    const lineX = tempCtx.textAlign === 'center' ? x + width / 2 : x + 10;
                    
                    if (this.textProps.strokeWidth > 0) {
                        tempCtx.strokeStyle = this.textProps.strokeColor;
                        tempCtx.lineWidth = this.textProps.strokeWidth * 2;
                        tempCtx.strokeText(line, lineX, currentY);
                    }
                    
                    tempCtx.fillStyle = this.textProps.color;
                    tempCtx.fillText(line, lineX, currentY);
                    
                    currentY += lineHeight;
                });
                
                tempCtx.restore();
            }
            
            // Try Web Share API
            if (navigator.share && navigator.canShare) {
                const blob = await new Promise(resolve => {
                    tempCanvas.toBlob(resolve, 'image/png', 1.0);
                });
                
                const file = new File([blob], `photo-editor-${Date.now()}.png`, { type: 'image/png' });
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Edited Image',
                        text: 'Check out my edited image!'
                    });
                    return;
                }
            }
            
            // Fallback: download
            const link = document.createElement('a');
            link.download = `photo-editor-${Date.now()}.png`;
            link.href = tempCanvas.toDataURL('image/png', 1.0);
            link.click();
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                this.download();
            }
        }
    }
}

window.canvasEditor = new CanvasEditor();
