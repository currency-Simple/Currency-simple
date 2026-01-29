class CanvasEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.canvasWrapper = null;
        this.image = null;
        this.imageObj = new Image();
        
        this.currentTextElement = null;
        this.selectedBgColor = '#FFFFFF';
        
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
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        
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
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        this.makeDraggable(textEl);
    }
    
    applyTextStyle(element) {
        element.textContent = this.textProps.content;
        element.style.fontFamily = `"${this.textProps.font}", sans-serif`;
        element.style.fontSize = `${this.textProps.size}px`;
        element.style.color = this.textProps.color;
        element.style.whiteSpace = 'pre-wrap';
        element.style.wordWrap = 'break-word';
        
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
            element.style.padding = '10px';
            element.style.borderRadius = '5px';
        } else {
            element.style.backgroundColor = 'transparent';
            element.style.padding = '10px 0';
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
        
        element.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
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
            // 1. إنشاء canvas عالي الجودة
            const tempCanvas = document.createElement('canvas');
            
            // تحديد الأبعاد
            if (this.image.isBackground) {
                tempCanvas.width = this.canvas.width;
                tempCanvas.height = this.canvas.height;
            } else {
                // استخدام الأبعاد الأصلية للجودة
                tempCanvas.width = this.image.naturalWidth || this.image.width;
                tempCanvas.height = this.image.naturalHeight || this.image.height;
            }
            
            const tempCtx = tempCanvas.getContext('2d');
            
            // تعيين جودة عالية
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.textRendering = 'optimizeLegibility';
            
            // 2. رسم الخلفية أو الصورة
            if (this.image.isBackground) {
                tempCtx.fillStyle = this.image.color;
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            } else {
                // حساب نسب التحجيم للجودة العالية
                const scaleX = tempCanvas.width / this.image.width;
                const scaleY = tempCanvas.height / this.image.height;
                
                // تطبيق الفلاتر
                if (this.filters.blurValue > 0) {
                    const scaledBlur = this.filters.blurValue * Math.max(scaleX, scaleY);
                    tempCtx.filter = `blur(${scaledBlur}px)`;
                }
                
                tempCtx.drawImage(this.image, 0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.filter = 'none';
            }
            
            // 3. رسم النص بنفس التنسيق الدقيق
            if (this.currentTextElement && this.textProps.content) {
                tempCtx.save();
                
                // حساب معامل التحجيم الدقيق
                const canvasDisplayRect = this.canvas.getBoundingClientRect();
                const textDisplayRect = this.currentTextElement.getBoundingClientRect();
                
                // نسبة التحويل بين العرض المعروض والعرض الحقيقي
                const scaleX = tempCanvas.width / canvasDisplayRect.width;
                const scaleY = tempCanvas.height / canvasDisplayRect.height;
                
                // حساب موقع النص بدقة
                const x = (textDisplayRect.left - canvasDisplayRect.left) * scaleX;
                const y = (textDisplayRect.top - canvasDisplayRect.top) * scaleY;
                const width = textDisplayRect.width * scaleX;
                const height = textDisplayRect.height * scaleY;
                
                // الحصول على خصائص النص الحقيقية
                const computedStyle = window.getComputedStyle(this.currentTextElement);
                
                // حجم الخط بعد التحجيم
                const scaledFontSize = this.textProps.size * scaleX;
                
                // تعيين خصائص النص
                tempCtx.font = `${scaledFontSize}px "${this.textProps.font}"`;
                tempCtx.fillStyle = this.textProps.color;
                tempCtx.textAlign = 'center';
                tempCtx.textBaseline = 'middle';
                tempCtx.lineJoin = 'round';
                
                // تطبيق خلفية النص إذا كانت موجودة
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    tempCtx.fillRect(x, y, width, height);
                    tempCtx.fillStyle = this.textProps.color;
                }
                
                // تطبيق الظل
                if (this.textProps.shadowBlur > 0) {
                    const scaledShadowBlur = this.textProps.shadowBlur * scaleX;
                    tempCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    tempCtx.shadowBlur = scaledShadowBlur;
                    tempCtx.shadowOffsetX = 4 * scaleX;
                    tempCtx.shadowOffsetY = 4 * scaleY;
                }
                
                // تطبيق Stroke (الحدود)
                if (this.textProps.strokeWidth > 0) {
                    const scaledStrokeWidth = this.textProps.strokeWidth * scaleX;
                    tempCtx.strokeStyle = this.textProps.strokeColor;
                    tempCtx.lineWidth = scaledStrokeWidth * 2;
                    tempCtx.lineJoin = 'round';
                }
                
                // تقسيم النص إلى أسطر (مثل ما يظهر في المحرر)
                const lines = this.textProps.content.split('\n');
                const lineHeight = scaledFontSize * 1.3;
                
                // حساب بداية الكتابة
                let currentY = y + (height - (lines.length * lineHeight)) / 2 + lineHeight / 2;
                
                // رسم كل سطر
                lines.forEach((line, index) => {
                    if (line.trim() === '') return;
                    
                    const centerX = x + (width / 2);
                    
                    // رسم Stroke أولاً إذا كان موجوداً
                    if (this.textProps.strokeWidth > 0) {
                        tempCtx.strokeText(line, centerX, currentY);
                    }
                    
                    // ثم رسم النص نفسه
                    tempCtx.fillText(line, centerX, currentY);
                    
                    currentY += lineHeight;
                });
                
                tempCtx.restore();
            }
            
            // 4. تحميل الصورة بجودة عالية
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `edited-photo-${timestamp}.png`;
            
            // استخدام جودة 1.0 (بدون ضغط)
            link.href = tempCanvas.toDataURL('image/png', 1.0);
            
            // إضافة الرابط والنقر عليه
            document.body.appendChild(link);
            link.click();
            
            // تنظيف بعد ثانية
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 1000);
            
        } catch (error) {
            console.error('Download error:', error);
            const lang = localStorage.getItem('language') || 'en';
            let message = 'Failed to save image. Please try again.';
            if (lang === 'ar') {
                message = 'فشل حفظ الصورة. الرجاء المحاولة مرة أخرى.';
            } else if (lang === 'fr') {
                message = 'Échec de l\'enregistrement de l\'image. Veuillez réessayer.';
            }
            alert(message);
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
            // استخدام نفس منطق التنزيل للحصول على نفس الجودة
            const tempCanvas = document.createElement('canvas');
            
            if (this.image.isBackground) {
                tempCanvas.width = this.canvas.width;
                tempCanvas.height = this.canvas.height;
            } else {
                tempCanvas.width = this.image.naturalWidth || this.image.width;
                tempCanvas.height = this.image.naturalHeight || this.image.height;
            }
            
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.textRendering = 'optimizeLegibility';
            
            if (this.image.isBackground) {
                tempCtx.fillStyle = this.image.color;
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            } else {
                const scaleX = tempCanvas.width / this.image.width;
                const scaleY = tempCanvas.height / this.image.height;
                
                if (this.filters.blurValue > 0) {
                    const scaledBlur = this.filters.blurValue * Math.max(scaleX, scaleY);
                    tempCtx.filter = `blur(${scaledBlur}px)`;
                }
                
                tempCtx.drawImage(this.image, 0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.filter = 'none';
            }
            
            if (this.currentTextElement && this.textProps.content) {
                tempCtx.save();
                
                const canvasDisplayRect = this.canvas.getBoundingClientRect();
                const textDisplayRect = this.currentTextElement.getBoundingClientRect();
                
                const scaleX = tempCanvas.width / canvasDisplayRect.width;
                const scaleY = tempCanvas.height / canvasDisplayRect.height;
                
                const x = (textDisplayRect.left - canvasDisplayRect.left) * scaleX;
                const y = (textDisplayRect.top - canvasDisplayRect.top) * scaleY;
                const width = textDisplayRect.width * scaleX;
                const height = textDisplayRect.height * scaleY;
                
                const scaledFontSize = this.textProps.size * scaleX;
                
                tempCtx.font = `${scaledFontSize}px "${this.textProps.font}"`;
                tempCtx.fillStyle = this.textProps.color;
                tempCtx.textAlign = 'center';
                tempCtx.textBaseline = 'middle';
                tempCtx.lineJoin = 'round';
                
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    tempCtx.fillRect(x, y, width, height);
                    tempCtx.fillStyle = this.textProps.color;
                }
                
                if (this.textProps.shadowBlur > 0) {
                    const scaledShadowBlur = this.textProps.shadowBlur * scaleX;
                    tempCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    tempCtx.shadowBlur = scaledShadowBlur;
                    tempCtx.shadowOffsetX = 4 * scaleX;
                    tempCtx.shadowOffsetY = 4 * scaleY;
                }
                
                if (this.textProps.strokeWidth > 0) {
                    const scaledStrokeWidth = this.textProps.strokeWidth * scaleX;
                    tempCtx.strokeStyle = this.textProps.strokeColor;
                    tempCtx.lineWidth = scaledStrokeWidth * 2;
                }
                
                const lines = this.textProps.content.split('\n');
                const lineHeight = scaledFontSize * 1.3;
                
                let currentY = y + (height - (lines.length * lineHeight)) / 2 + lineHeight / 2;
                
                lines.forEach((line, index) => {
                    if (line.trim() === '') return;
                    
                    const centerX = x + (width / 2);
                    
                    if (this.textProps.strokeWidth > 0) {
                        tempCtx.strokeText(line, centerX, currentY);
                    }
                    
                    tempCtx.fillText(line, centerX, currentY);
                    
                    currentY += lineHeight;
                });
                
                tempCtx.restore();
            }
            
            if (navigator.share && navigator.canShare) {
                const blob = await new Promise(resolve => {
                    tempCanvas.toBlob(resolve, 'image/png', 1.0);
                });
                
                const file = new File([blob], `edited-photo-${Date.now()}.png`, { type: 'image/png' });
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Edited Image',
                        text: 'Check out my edited image!'
                    });
                    return;
                }
            }
            
            this.download();
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                this.download();
            }
        }
    }
}

window.canvasEditor = new CanvasEditor();
