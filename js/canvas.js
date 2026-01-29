class CanvasEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.canvasWrapper = null;
        this.image = null;
        this.imageObj = new Image();
        
        this.currentTextElement = null;
        this.selectedBgColor = '#FFFFFF';
        
        // تخزين موضع وسحابة النص الحالية
        this.textElementData = {
            x: 0,
            y: 0,
            offsetX: 0,
            offsetY: 0,
            width: 0,
            height: 0,
            transform: ''
        };
        
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
        
        this.filters = {
            blurValue: 0
        };
        
        this.init();
    }
    
    init() {
        const container = document.querySelector('.canvas-container');
        this.canvasWrapper = document.createElement('div');
        this.canvasWrapper.className = 'canvas-wrapper';
        container.appendChild(this.canvasWrapper);
        this.canvasWrapper.appendChild(this.canvas);
    }
    
    createBackground(color) {
        this.selectedBgColor = color;
        
        const maxWidth = window.innerWidth - 32;
        const maxHeight = window.innerHeight - 300;
        
        let width = 600;
        let height = 1000;
        
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
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, width, height);
        
        this.image = { isBackground: true, color: color, width: width, height: height };
        
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
        
        // مسح canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        
        // رسم الصورة أو الخلفية
        if (this.image.isBackground) {
            this.ctx.fillStyle = this.image.color;
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
    
    updateText(content) {
        this.textProps.content = content;
        
        if (content && content.trim() && !this.currentTextElement) {
            this.createTextElement();
        } else if (this.currentTextElement) {
            this.updateTextElement();
        } else if ((!content || content.trim() === '') && this.currentTextElement) {
            this.currentTextElement.remove();
            this.currentTextElement = null;
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
        
        // حفظ التحويل الابتدائي
        this.textElementData.transform = 'translate(-50%, -50%)';
        this.textElementData.offsetX = 0;
        this.textElementData.offsetY = 0;
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        // تحديث بيانات العنصر
        this.updateTextElementData();
        
        this.makeDraggable(textEl);
    }
    
    applyTextStyle(element) {
        element.textContent = this.textProps.content;
        element.style.fontFamily = `"${this.textProps.font}"`;
        element.style.fontSize = `${this.textProps.size}px`;
        element.style.color = this.textProps.color;
        element.style.whiteSpace = 'pre-wrap'; // الحفاظ على السطور
        element.style.wordWrap = 'break-word'; // تفعيل التفاف النص
        element.style.textAlign = 'center'; // محاذاة النص
        element.style.lineHeight = '1.3'; // ارتفاع السطر
        
        if (this.textProps.strokeWidth > 0) {
            element.style.webkitTextStroke = `${this.textProps.strokeWidth}px ${this.textProps.strokeColor}`;
            element.style.textStroke = `${this.textProps.strokeWidth}px ${this.textProps.strokeColor}`;
        } else {
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
            element.style.padding = '10px'; // إضافة padding للخلفية
            element.style.borderRadius = '8px'; // زوايا دائرية
        } else {
            element.style.backgroundColor = 'transparent';
            element.style.padding = '0';
        }
    }
    
    updateTextElement() {
        if (!this.currentTextElement) return;
        
        this.applyTextStyle(this.currentTextElement);
        
        // تحديث بيانات العنصر بعد تغيير النص
        setTimeout(() => {
            this.updateTextElementData();
        }, 10);
    }
    
    updateTextElementData() {
        if (!this.currentTextElement) return;
        
        const rect = this.currentTextElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        this.textElementData.width = rect.width;
        this.textElementData.height = rect.height;
        this.textElementData.x = rect.left - canvasRect.left + rect.width / 2;
        this.textElementData.y = rect.top - canvasRect.top + rect.height / 2;
    }
    
    makeDraggable(element) {
        let isDragging = false;
        let startX, startY;
        let startOffsetX, startOffsetY;
        
        const dragStart = (e) => {
            e.preventDefault();
            isDragging = true;
            
            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }
            
            // حفظ الإزاحة الحالية
            startOffsetX = this.textElementData.offsetX;
            startOffsetY = this.textElementData.offsetY;
            
            element.classList.add('active');
        };
        
        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            let currentX, currentY;
            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;
            } else {
                currentX = e.clientX;
                currentY = e.clientY;
            }
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // تحديث الإزاحة
            this.textElementData.offsetX = startOffsetX + deltaX;
            this.textElementData.offsetY = startOffsetY + deltaY;
            
            // تطبيق التحويل
            element.style.transform = `translate(calc(-50% + ${this.textElementData.offsetX}px), calc(-50% + ${this.textElementData.offsetY}px))`;
            this.textElementData.transform = element.style.transform;
            
            // تحديث موقع العنصر
            this.updateTextElementData();
        };
        
        const dragEnd = () => {
            isDragging = false;
            element.classList.remove('active');
        };
        
        element.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag.bind(this));
        document.addEventListener('mouseup', dragEnd);
        
        element.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag.bind(this), { passive: false });
        document.addEventListener('touchend', dragEnd);
    }
    
    updateTextProp(prop, value) {
        this.textProps[prop] = value;
        
        if (this.currentTextElement) {
            this.updateTextElement();
        }
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
            font: 'Abeezee',
            size: 48,
            color: '#000000',
            strokeWidth: 0,
            strokeColor: '#FFFFFF',
            shadowBlur: 0,
            bgOpacity: 0,
            bgColor: '#000000'
        };
        
        this.textElementData = {
            x: 0,
            y: 0,
            offsetX: 0,
            offsetY: 0,
            width: 0,
            height: 0,
            transform: ''
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
            // إنشاء canvas جديد للتنزيل
            const downloadCanvas = document.createElement('canvas');
            const ctx = downloadCanvas.getContext('2d');
            
            // تحديد أبعاد الصورة النهائية - نفس أبعاد canvas العرض
            if (this.image.isBackground) {
                downloadCanvas.width = this.canvas.width;
                downloadCanvas.height = this.canvas.height;
            } else {
                // استخدام أبعاد canvas العرض للحفاظ على نفس الحجم
                downloadCanvas.width = this.canvas.width;
                downloadCanvas.height = this.canvas.height;
            }
            
            // مسح canvas
            ctx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            
            // رسم الصورة أو الخلفية بنفس الحجم
            if (this.image.isBackground) {
                ctx.fillStyle = this.image.color;
                ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            } else {
                // تطبيق فلتر Blur إذا كان موجوداً
                if (this.filters.blurValue > 0) {
                    ctx.filter = `blur(${this.filters.blurValue}px)`;
                }
                
                // رسم الصورة بنفس الحجم المعروض
                ctx.drawImage(this.image, 0, 0, downloadCanvas.width, downloadCanvas.height);
                ctx.filter = 'none';
            }
            
            // رسم النص إذا كان موجوداً
            if (this.textProps.content && this.textProps.content.trim() !== '' && this.currentTextElement) {
                ctx.save();
                
                // حساب موضع النص بدقة
                let textX, textY;
                
                if (this.currentTextElement) {
                    const elementRect = this.currentTextElement.getBoundingClientRect();
                    const canvasRect = this.canvas.getBoundingClientRect();
                    
                    // تحويل الموقع النسبي من الشاشة إلى canvas التنزيل
                    const relativeX = elementRect.left - canvasRect.left;
                    const relativeY = elementRect.top - canvasRect.top;
                    
                    // حساب النسبة بين canvas العرض وcanvas التنزيل (يجب أن تكون 1:1)
                    const scaleX = downloadCanvas.width / canvasRect.width;
                    const scaleY = downloadCanvas.height / canvasRect.height;
                    
                    // حساب مركز النص
                    textX = (relativeX + elementRect.width / 2) * scaleX;
                    textY = (relativeY + elementRect.height / 2) * scaleY;
                    
                    // إذا كان هناك إزاحة من التحويل، نضيفها
                    if (this.textElementData.offsetX !== 0 || this.textElementData.offsetY !== 0) {
                        textX += this.textElementData.offsetX * scaleX;
                        textY += this.textElementData.offsetY * scaleY;
                    }
                } else {
                    textX = downloadCanvas.width / 2;
                    textY = downloadCanvas.height / 2;
                }
                
                // إعداد حجم الخط
                const fontSize = this.textProps.size * (downloadCanvas.width / this.canvas.width);
                
                // إعداد خصائص النص
                ctx.font = `${fontSize}px "${this.textProps.font}"`;
                ctx.fillStyle = this.textProps.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // تطبيق الظل
                if (this.textProps.shadowBlur > 0) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = this.textProps.shadowBlur * (downloadCanvas.width / this.canvas.width);
                    ctx.shadowOffsetX = 4 * (downloadCanvas.width / this.canvas.width);
                    ctx.shadowOffsetY = 4 * (downloadCanvas.width / this.canvas.width);
                }
                
                // تقسيم النص إلى أسطر (نفس التقسيم المعروض)
                const lines = this.textProps.content.split('\n');
                const lineHeight = fontSize * 1.3;
                const totalHeight = lines.length * lineHeight;
                
                // حساب عرض كل سطر وأقصى عرض
                let maxLineWidth = 0;
                const lineWidths = [];
                
                lines.forEach(line => {
                    const metrics = ctx.measureText(line);
                    const lineWidth = metrics.width;
                    lineWidths.push(lineWidth);
                    if (lineWidth > maxLineWidth) {
                        maxLineWidth = lineWidth;
                    }
                });
                
                // رسم خلفية النص إذا كانت موجودة
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    
                    // إضافة padding
                    const padding = 10 * (downloadCanvas.width / this.canvas.width);
                    ctx.fillRect(
                        textX - maxLineWidth/2 - padding,
                        textY - totalHeight/2 - padding,
                        maxLineWidth + padding * 2,
                        totalHeight + padding * 2
                    );
                }
                
                // رسم كل سطر من النص
                let currentY = textY - totalHeight / 2 + lineHeight / 2;
                
                lines.forEach((line, index) => {
                    const lineX = textX;
                    
                    // رسم الحدود (Stroke)
                    if (this.textProps.strokeWidth > 0) {
                        ctx.strokeStyle = this.textProps.strokeColor;
                        ctx.lineWidth = this.textProps.strokeWidth * 2 * (downloadCanvas.width / this.canvas.width);
                        ctx.strokeText(line, lineX, currentY);
                    }
                    
                    // رسم النص
                    ctx.fillText(line, lineX, currentY);
                    
                    // الانتقال للسطر التالي
                    currentY += lineHeight;
                });
                
                ctx.restore();
            }
            
            // تحميل الصورة
            const link = document.createElement('a');
            link.download = `photo-editor-${Date.now()}.png`;
            link.href = downloadCanvas.toDataURL('image/png', 1.0); // جودة 100%
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Download error:', error);
            const lang = localStorage.getItem('language') || 'en';
            let message = 'Download failed. Please try again.';
            if (lang === 'ar') {
                message = 'فشل التحميل. الرجاء المحاولة مرة أخرى.';
            } else if (lang === 'fr') {
                message = 'Le téléchargement a échoué. Veuillez réessayer.';
            }
            alert(message);
        }
    }
    
    async share() {
        await this.download();
    }
}

window.canvasEditor = new CanvasEditor();
