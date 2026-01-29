class CanvasEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.canvasWrapper = null;
        this.image = null;
        this.imageObj = new Image();
        
        this.currentTextElement = null;
        this.selectedBgColor = '#FFFFFF';
        
        // لتخزين موقع النص بدقة
        this.textTransform = {
            translateX: 0,
            translateY: 0,
            elementWidth: 0,
            elementHeight: 0
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
            bgColor: '#000000',
            textAlign: 'center',
            lineHeight: 1.3
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
        
        // إضافة حدث لتحديث موقع النص عند تغيير الحجم
        window.addEventListener('resize', () => {
            if (this.currentTextElement) {
                this.updateTextElementPosition();
            }
        });
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
                
                resolve();
            };
            
            this.imageObj.onerror = reject;
            this.imageObj.src = url;
        });
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
        textEl.style.position = 'absolute';
        
        // البدء من مركز الصورة
        textEl.style.left = '50%';
        textEl.style.top = '50%';
        textEl.style.transform = 'translate(-50%, -50%)';
        
        this.textTransform.translateX = 0;
        this.textTransform.translateY = 0;
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        // تحديث أبعاد العنصر
        setTimeout(() => {
            this.updateTextElementMetrics();
        }, 50);
        
        this.makeDraggable(textEl);
    }
    
    applyTextStyle(element) {
        // تعيين النص مع الحفاظ على الأسطر
        element.textContent = this.textProps.content;
        element.style.fontFamily = `"${this.textProps.font}"`;
        element.style.fontSize = `${this.textProps.size}px`;
        element.style.color = this.textProps.color;
        element.style.whiteSpace = 'pre-wrap'; // هذا يحافظ على فواصل الأسطر
        element.style.wordWrap = 'break-word';
        element.style.textAlign = this.textProps.textAlign;
        element.style.lineHeight = this.textProps.lineHeight.toString();
        element.style.width = 'auto';
        element.style.maxWidth = '90%';
        element.style.minWidth = '100px';
        element.style.padding = '10px';
        
        // الحدود (Stroke)
        if (this.textProps.strokeWidth > 0) {
            element.style.webkitTextStroke = `${this.textProps.strokeWidth}px ${this.textProps.strokeColor}`;
            element.style.textStroke = `${this.textProps.strokeWidth}px ${this.textProps.strokeColor}`;
        } else {
            element.style.webkitTextStroke = '';
            element.style.textStroke = '';
        }
        
        // الظل
        if (this.textProps.shadowBlur > 0) {
            element.style.textShadow = `4px 4px ${this.textProps.shadowBlur}px rgba(0, 0, 0, 0.8)`;
        } else {
            element.style.textShadow = '';
        }
        
        // خلفية النص
        if (this.textProps.bgOpacity > 0) {
            const hex = this.textProps.bgColor;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const opacity = this.textProps.bgOpacity / 100;
            element.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            element.style.borderRadius = '8px';
        } else {
            element.style.backgroundColor = 'transparent';
        }
    }
    
    updateTextElement() {
        if (!this.currentTextElement) return;
        
        this.applyTextStyle(this.currentTextElement);
        
        // تحديث الأبعاد بعد تغيير النص
        setTimeout(() => {
            this.updateTextElementMetrics();
        }, 50);
    }
    
    updateTextElementMetrics() {
        if (!this.currentTextElement) return;
        
        const rect = this.currentTextElement.getBoundingClientRect();
        this.textTransform.elementWidth = rect.width;
        this.textTransform.elementHeight = rect.height;
    }
    
    updateTextElementPosition() {
        if (!this.currentTextElement) return;
        
        this.currentTextElement.style.transform = `translate(calc(-50% + ${this.textTransform.translateX}px), calc(-50% + ${this.textTransform.translateY}px))`;
    }
    
    makeDraggable(element) {
        let isDragging = false;
        let startX, startY;
        let startTranslateX, startTranslateY;
        
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
            
            startTranslateX = this.textTransform.translateX;
            startTranslateY = this.textTransform.translateY;
            
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
            
            this.textTransform.translateX = startTranslateX + deltaX;
            this.textTransform.translateY = startTranslateY + deltaY;
            
            this.updateTextElementPosition();
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
            bgColor: '#000000',
            textAlign: 'center',
            lineHeight: 1.3
        };
        
        this.textTransform = {
            translateX: 0,
            translateY: 0,
            elementWidth: 0,
            elementHeight: 0
        };
        
        this.filters = {
            blurValue: 0
        };
        
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
            // إنشاء canvas للتنزيل
            const downloadCanvas = document.createElement('canvas');
            const ctx = downloadCanvas.getContext('2d');
            
            // استخدام أبعاد canvas العرض
            downloadCanvas.width = this.canvas.width;
            downloadCanvas.height = this.canvas.height;
            
            // رسم الخلفية أو الصورة
            ctx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            
            if (this.image.isBackground) {
                ctx.fillStyle = this.image.color;
                ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            } else {
                if (this.filters.blurValue > 0) {
                    ctx.filter = `blur(${this.filters.blurValue}px)`;
                }
                
                ctx.drawImage(this.image, 0, 0, downloadCanvas.width, downloadCanvas.height);
                ctx.filter = 'none';
            }
            
            // إذا كان هناك نص، نرسمه
            if (this.textProps.content && this.textProps.content.trim() !== '' && this.currentTextElement) {
                ctx.save();
                
                // حساب موضع النص بدقة
                const canvasRect = this.canvas.getBoundingClientRect();
                const textRect = this.currentTextElement.getBoundingClientRect();
                
                // حساب النسبة بين canvas والعرض الفعلي
                const scaleX = downloadCanvas.width / canvasRect.width;
                const scaleY = downloadCanvas.height / canvasRect.height;
                
                // حساب مركز النص مع الأخذ في الاعتبار الإزاحة
                const centerX = canvasRect.width / 2;
                const centerY = canvasRect.height / 2;
                
                // حساب موقع النص النهائي
                let finalX = centerX + this.textTransform.translateX;
                let finalY = centerY + this.textTransform.translateY;
                
                // تحويل إلى إحداثيات canvas التنزيل
                finalX *= scaleX;
                finalY *= scaleY;
                
                // حجم الخط بعد التحجيم
                const fontSize = this.textProps.size * scaleX;
                
                // إعداد الخط
                ctx.font = `${fontSize}px "${this.textProps.font}"`;
                ctx.fillStyle = this.textProps.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // تطبيق الظل
                if (this.textProps.shadowBlur > 0) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = this.textProps.shadowBlur * scaleX;
                    ctx.shadowOffsetX = 4 * scaleX;
                    ctx.shadowOffsetY = 4 * scaleY;
                }
                
                // تقسيم النص إلى أسطر - هذا هو المفتاح!
                const lines = this.textProps.content.split('\n');
                const lineHeight = fontSize * this.textProps.lineHeight;
                
                // حساب أبعاد النص الكلية
                let maxLineWidth = 0;
                lines.forEach(line => {
                    const metrics = ctx.measureText(line);
                    if (metrics.width > maxLineWidth) {
                        maxLineWidth = metrics.width;
                    }
                });
                
                const totalHeight = lines.length * lineHeight;
                
                // رسم خلفية النص
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    
                    // إضافة padding
                    const padding = 10 * scaleX;
                    ctx.fillRect(
                        finalX - maxLineWidth/2 - padding,
                        finalY - totalHeight/2 - padding,
                        maxLineWidth + padding * 2,
                        totalHeight + padding * 2
                    );
                }
                
                // رسم كل سطر من النص
                let currentY = finalY - totalHeight/2 + lineHeight/2;
                
                lines.forEach((line, index) => {
                    // رسم الحدود (Stroke)
                    if (this.textProps.strokeWidth > 0) {
                        ctx.strokeStyle = this.textProps.strokeColor;
                        ctx.lineWidth = this.textProps.strokeWidth * 2 * scaleX;
                        ctx.strokeText(line, finalX, currentY);
                    }
                    
                    // رسم النص
                    ctx.fillText(line, finalX, currentY);
                    
                    // الانتقال للسطر التالي
                    currentY += lineHeight;
                });
                
                ctx.restore();
            }
            
            // تحميل الصورة
            const link = document.createElement('a');
            link.download = `photo-editor-${Date.now()}.png`;
            link.href = downloadCanvas.toDataURL('image/png', 1.0);
            
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
            
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
