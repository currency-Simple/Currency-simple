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
            blurValue: 0,
            borderWidth: 0,
            borderColor: '#FFFFFF'
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
            
            // Draw image with border
            if (this.filters.borderWidth > 0) {
                const bw = this.filters.borderWidth;
                this.ctx.fillStyle = this.filters.borderColor;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.image, bw, bw, this.canvas.width - bw * 2, this.canvas.height - bw * 2);
            } else {
                this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            }
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
        
        // Create new draggable text element
        const textEl = document.createElement('div');
        textEl.className = 'draggable-text';
        textEl.style.left = '50%';
        textEl.style.top = '50%';
        textEl.style.transform = 'translate(-50%, -50%)';
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        // Make it draggable
        this.makeDraggable(textEl);
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
    
    makeDraggable(element) {
        let isDragging = false;
        let currentX, currentY;
        let initialX, initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        // Mouse events
        element.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        // Touch events
        element.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
        
        function dragStart(e) {
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            
            if (e.target === element) {
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
            blurValue: 0,
            borderWidth: 0,
            borderColor: '#FFFFFF'
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
            
            document.getElementById('borderWidth').value = 0;
            document.getElementById('borderWidthValue').textContent = 0;
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
        
        // Create temporary canvas with text rendered
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw base image/background first
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Draw text if exists
        if (this.currentTextElement && this.textProps.content) {
            // Get actual position from the DOM element
            const canvasRect = this.canvas.getBoundingClientRect();
            const textRect = this.currentTextElement.getBoundingClientRect();
            
            // Calculate scale factor for canvas coordinates
            const scaleX = this.canvas.width / canvasRect.width;
            const scaleY = this.canvas.height / canvasRect.height;
            
            // Get center position of text relative to canvas
            const x = ((textRect.left - canvasRect.left) + textRect.width / 2) * scaleX;
            const y = ((textRect.top - canvasRect.top) + textRect.height / 2) * scaleY;
            
            // Apply text styling
            tempCtx.font = `${this.textProps.size}px "${this.textProps.font}"`;
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';
            
            // Draw text background if exists
            if (this.textProps.bgOpacity > 0) {
                const metrics = tempCtx.measureText(this.textProps.content);
                const pad = 20;
                const opacity = this.textProps.bgOpacity / 100;
                const hex = this.textProps.bgColor;
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                
                tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                tempCtx.fillRect(
                    x - metrics.width / 2 - pad, 
                    y - this.textProps.size / 2 - pad, 
                    metrics.width + pad * 2, 
                    this.textProps.size + pad * 2
                );
            }
            
            // Draw shadow if exists
            if (this.textProps.shadowBlur > 0) {
                tempCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                tempCtx.shadowBlur = this.textProps.shadowBlur;
                tempCtx.shadowOffsetX = 4;
                tempCtx.shadowOffsetY = 4;
            }
            
            // Draw stroke if exists
            if (this.textProps.strokeWidth > 0) {
                tempCtx.strokeStyle = this.textProps.strokeColor;
                tempCtx.lineWidth = this.textProps.strokeWidth * 2; // Double for better visibility
                tempCtx.strokeText(this.textProps.content, x, y);
            }
            
            // Draw fill text
            tempCtx.fillStyle = this.textProps.color;
            tempCtx.fillText(this.textProps.content, x, y);
        }
        
        // Download with proper format
        try {
            const link = document.createElement('a');
            link.download = `photo-editor-${Date.now()}.png`;
            link.href = tempCanvas.toDataURL('image/png', 1.0);
            
            // Trigger download
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
                message = 'Veuillez télécharger une image ou créer un fond d\'abord';
            }
            alert(message);
            return;
        }
        
        try {
            // Create temporary canvas with text
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw base image/background
            tempCtx.drawImage(this.canvas, 0, 0);
            
            // Draw text if exists
            if (this.currentTextElement && this.textProps.content) {
                // Get actual position from the DOM element
                const canvasRect = this.canvas.getBoundingClientRect();
                const textRect = this.currentTextElement.getBoundingClientRect();
                
                // Calculate scale factor for canvas coordinates
                const scaleX = this.canvas.width / canvasRect.width;
                const scaleY = this.canvas.height / canvasRect.height;
                
                // Get center position of text relative to canvas
                const x = ((textRect.left - canvasRect.left) + textRect.width / 2) * scaleX;
                const y = ((textRect.top - canvasRect.top) + textRect.height / 2) * scaleY;
                
                tempCtx.font = `${this.textProps.size}px "${this.textProps.font}"`;
                tempCtx.textAlign = 'center';
                tempCtx.textBaseline = 'middle';
                
                // Draw text background if exists
                if (this.textProps.bgOpacity > 0) {
                    const metrics = tempCtx.measureText(this.textProps.content);
                    const pad = 20;
                    const opacity = this.textProps.bgOpacity / 100;
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    
                    tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    tempCtx.fillRect(
                        x - metrics.width / 2 - pad, 
                        y - this.textProps.size / 2 - pad, 
                        metrics.width + pad * 2, 
                        this.textProps.size + pad * 2
                    );
                }
                
                // Draw shadow if exists
                if (this.textProps.shadowBlur > 0) {
                    tempCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    tempCtx.shadowBlur = this.textProps.shadowBlur;
                    tempCtx.shadowOffsetX = 4;
                    tempCtx.shadowOffsetY = 4;
                }
                
                // Draw stroke if exists
                if (this.textProps.strokeWidth > 0) {
                    tempCtx.strokeStyle = this.textProps.strokeColor;
                    tempCtx.lineWidth = this.textProps.strokeWidth * 2; // Double for better visibility
                    tempCtx.strokeText(this.textProps.content, x, y);
                }
                
                // Draw fill text
                tempCtx.fillStyle = this.textProps.color;
                tempCtx.fillText(this.textProps.content, x, y);
            }
            
            // Try Web Share API first (works on mobile and some desktop browsers)
            if (navigator.share && navigator.canShare) {
                const blob = await new Promise(resolve => {
                    tempCanvas.toBlob(resolve, 'image/png', 1.0);
                });
                
                const file = new File([blob], `edited-${Date.now()}.png`, { type: 'image/png' });
                
                // Check if we can share files
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Edited Image',
                        text: 'Check out my edited image!'
                    });
                    return;
                }
            }
            
            // Fallback: Just download the image
            const link = document.createElement('a');
            link.download = `edited-${Date.now()}.png`;
            link.href = tempCanvas.toDataURL('image/png', 1.0);
            link.click();
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                // Final fallback: download
                this.download();
            }
        }
    }
}

window.canvasEditor = new CanvasEditor();
