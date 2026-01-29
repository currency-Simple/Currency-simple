// canvas.js محدث
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
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        this.makeDraggable(textEl);
    }
    
    applyTextStyle(element) {
        element.textContent = this.textProps.content;
        element.style.fontFamily = `"${this.textProps.font}"`;
        element.style.fontSize = `${this.textProps.size}px`;
        element.style.color = this.textProps.color;
        
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
            // إنشاء canvas جديد بدقة عالية
            const outputCanvas = document.createElement('canvas');
            const ctx = outputCanvas.getContext('2d');
            
            // تعيين الأبعاد الأصلية للصورة
            if (this.image.isBackground) {
                outputCanvas.width = this.canvas.width;
                outputCanvas.height = this.canvas.height;
                
                // رسم الخلفية
                ctx.fillStyle = this.image.color;
                ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
            } else {
                // استخدام الأبعاد الأصلية للصورة لجودة أفضل
                outputCanvas.width = this.image.width;
                outputCanvas.height = this.image.height;
                
                // رسم الصورة الأصلية
                ctx.drawImage(this.image, 0, 0, outputCanvas.width, outputCanvas.height);
            }
            
            // تطبيق الفلاتر
            if (this.filters.blurValue > 0) {
                ctx.filter = `blur(${this.filters.blurValue}px)`;
                // إعادة رسم الصورة مع الفلتر
                if (this.image.isBackground) {
                    ctx.fillStyle = this.image.color;
                    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
                } else {
                    ctx.drawImage(this.image, 0, 0, outputCanvas.width, outputCanvas.height);
                }
                ctx.filter = 'none';
            }
            
            // إذا كان هناك نص، نرسمه مباشرة على Canvas
            if (this.currentTextElement && this.textProps.content) {
                const textEl = this.currentTextElement;
                const computedStyle = window.getComputedStyle(textEl);
                const textRect = textEl.getBoundingClientRect();
                const canvasRect = this.canvas.getBoundingClientRect();
                
                // حساب موضع النص نسبةً للصورة
                const scaleX = outputCanvas.width / canvasRect.width;
                const scaleY = outputCanvas.height / canvasRect.height;
                
                const x = (textRect.left - canvasRect.left) * scaleX;
                const y = (textRect.top - canvasRect.top) * scaleY;
                const width = textRect.width * scaleX;
                const height = textRect.height * scaleY;
                
                // الحصول على التحويل الحالي للنص
                const transform = textEl.style.transform || '';
                const translateMatch = transform.match(/translate\(calc\(-50% \+ (-?\d+(\.\d+)?)px\), calc\(-50% \+ (-?\d+(\.\d+)?)px\)\)/);
                
                let finalX = x;
                let finalY = y;
                
                if (translateMatch) {
                    const offsetX = parseFloat(translateMatch[1]) * scaleX;
                    const offsetY = parseFloat(translateMatch[3]) * scaleY;
                    finalX = (canvasRect.width / 2 + offsetX - width / 2) * scaleX;
                    finalY = (canvasRect.height / 2 + offsetY - height / 2) * scaleY;
                } else {
                    finalX = (canvasRect.width / 2 - width / 2) * scaleX;
                    finalY = (canvasRect.height / 2 - height / 2) * scaleY;
                }
                
                // حفظ حالة canvas
                ctx.save();
                
                // رسم خلفية النص
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    ctx.fillRect(finalX, finalY, width, height);
                }
                
                // إعداد خصائص النص
                const fontSize = this.textProps.size * scaleX;
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
                
                // تقسيم النص إلى أسطر
                const lines = this.textProps.content.split('\n');
                const lineHeight = fontSize * 1.3;
                const totalHeight = lines.length * lineHeight;
                let currentY = finalY + (height - totalHeight) / 2 + lineHeight / 2;
                
                // رسم كل سطر
                lines.forEach(line => {
                    const lineX = finalX + width / 2;
                    
                    // رسم الحدود (Stroke)
                    if (this.textProps.strokeWidth > 0) {
                        ctx.strokeStyle = this.textProps.strokeColor;
                        ctx.lineWidth = this.textProps.strokeWidth * 2 * scaleX;
                        ctx.strokeText(line, lineX, currentY);
                    }
                    
                    // رسم النص
                    ctx.fillText(line, lineX, currentY);
                    currentY += lineHeight;
                });
                
                // استعادة حالة canvas
                ctx.restore();
            }
            
            // تحميل الصورة
            const link = document.createElement('a');
            link.download = `photo-editor-${Date.now()}.png`;
            link.href = outputCanvas.toDataURL('image/png', 1.0); // جودة 100%
            
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
            // نفس منطق التنزيل ولكن للمشاركة
            const outputCanvas = document.createElement('canvas');
            const ctx = outputCanvas.getContext('2d');
            
            if (this.image.isBackground) {
                outputCanvas.width = this.canvas.width;
                outputCanvas.height = this.canvas.height;
                ctx.fillStyle = this.image.color;
                ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
            } else {
                outputCanvas.width = this.image.width;
                outputCanvas.height = this.image.height;
                ctx.drawImage(this.image, 0, 0, outputCanvas.width, outputCanvas.height);
            }
            
            if (this.filters.blurValue > 0) {
                ctx.filter = `blur(${this.filters.blurValue}px)`;
                if (this.image.isBackground) {
                    ctx.fillStyle = this.image.color;
                    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
                } else {
                    ctx.drawImage(this.image, 0, 0, outputCanvas.width, outputCanvas.height);
                }
                ctx.filter = 'none';
            }
            
            if (this.currentTextElement && this.textProps.content) {
                const textEl = this.currentTextElement;
                const computedStyle = window.getComputedStyle(textEl);
                const textRect = textEl.getBoundingClientRect();
                const canvasRect = this.canvas.getBoundingClientRect();
                
                const scaleX = outputCanvas.width / canvasRect.width;
                const scaleY = outputCanvas.height / canvasRect.height;
                
                const x = (textRect.left - canvasRect.left) * scaleX;
                const y = (textRect.top - canvasRect.top) * scaleY;
                const width = textRect.width * scaleX;
                const height = textRect.height * scaleY;
                
                const transform = textEl.style.transform || '';
                const translateMatch = transform.match(/translate\(calc\(-50% \+ (-?\d+(\.\d+)?)px\), calc\(-50% \+ (-?\d+(\.\d+)?)px\)\)/);
                
                let finalX = x;
                let finalY = y;
                
                if (translateMatch) {
                    const offsetX = parseFloat(translateMatch[1]) * scaleX;
                    const offsetY = parseFloat(translateMatch[3]) * scaleY;
                    finalX = (canvasRect.width / 2 + offsetX - width / 2) * scaleX;
                    finalY = (canvasRect.height / 2 + offsetY - height / 2) * scaleY;
                } else {
                    finalX = (canvasRect.width / 2 - width / 2) * scaleX;
                    finalY = (canvasRect.height / 2 - height / 2) * scaleY;
                }
                
                ctx.save();
                
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    ctx.fillRect(finalX, finalY, width, height);
                }
                
                const fontSize = this.textProps.size * scaleX;
                ctx.font = `${fontSize}px "${this.textProps.font}"`;
                ctx.fillStyle = this.textProps.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                if (this.textProps.shadowBlur > 0) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = this.textProps.shadowBlur * scaleX;
                    ctx.shadowOffsetX = 4 * scaleX;
                    ctx.shadowOffsetY = 4 * scaleY;
                }
                
                const lines = this.textProps.content.split('\n');
                const lineHeight = fontSize * 1.3;
                const totalHeight = lines.length * lineHeight;
                let currentY = finalY + (height - totalHeight) / 2 + lineHeight / 2;
                
                lines.forEach(line => {
                    const lineX = finalX + width / 2;
                    
                    if (this.textProps.strokeWidth > 0) {
                        ctx.strokeStyle = this.textProps.strokeColor;
                        ctx.lineWidth = this.textProps.strokeWidth * 2 * scaleX;
                        ctx.strokeText(line, lineX, currentY);
                    }
                    
                    ctx.fillText(line, lineX, currentY);
                    currentY += lineHeight;
                });
                
                ctx.restore();
            }
            
            // محاولة استخدام Web Share API
            if (navigator.share && navigator.canShare) {
                const blob = await new Promise(resolve => {
                    outputCanvas.toBlob(resolve, 'image/png', 1.0);
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
            
            // إذا فشل المشاركة، نستخدم التنزيل
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
