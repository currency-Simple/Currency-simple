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
            bgColor: '#000000',
            isBold: false,
            isItalic: false,
            flipH: false,
            flipV: false,
            maxWidth: 400 // عرض النص الافتراضي
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
        textEl.style.maxWidth = this.textProps.maxWidth + 'px';
        
        // إضافة مقابض التحكم في العرض
        const leftHandle = document.createElement('div');
        leftHandle.className = 'resize-handle left';
        const rightHandle = document.createElement('div');
        rightHandle.className = 'resize-handle right';
        
        textEl.appendChild(leftHandle);
        textEl.appendChild(rightHandle);
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        this.makeDraggable(textEl);
        this.makeResizable(textEl, leftHandle, rightHandle);
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
        element.style.color = this.textProps.color;
        element.style.whiteSpace = 'pre-wrap';
        element.style.wordWrap = 'break-word';
        element.style.maxWidth = this.textProps.maxWidth + 'px';
        
        // تطبيق القلب
        let transforms = [];
        if (this.textProps.flipH) {
            transforms.push('scaleX(-1)');
        }
        if (this.textProps.flipV) {
            transforms.push('scaleY(-1)');
        }
        
        const currentTransform = element.style.transform || 'translate(-50%, -50%)';
        const baseTransform = currentTransform.includes('translate') ? currentTransform.split(')')[0] + ')' : 'translate(-50%, -50%)';
        
        if (transforms.length > 0) {
            element.style.transform = baseTransform + ' ' + transforms.join(' ');
        } else {
            element.style.transform = baseTransform;
        }
        
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
            // تجاهل إذا كان الحدث من المقابض
            if (e.target.classList.contains('resize-handle')) {
                return;
            }
            
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
            const currentTransform = el.style.transform || '';
            let baseTransform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
            
            // الحفاظ على القلب
            if (currentTransform.includes('scale')) {
                const scaleMatch = currentTransform.match(/scale[XY]\([^)]+\)/g);
                if (scaleMatch) {
                    baseTransform += ' ' + scaleMatch.join(' ');
                }
            }
            
            el.style.transform = baseTransform;
        }
    }
    
    makeResizable(element, leftHandle, rightHandle) {
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        let resizingSide = '';
        
        const startResize = (e, side) => {
            isResizing = true;
            resizingSide = side;
            startX = e.clientX || e.touches[0].clientX;
            startWidth = element.offsetWidth;
            element.classList.add('active');
            e.stopPropagation();
            e.preventDefault();
        };
        
        const resize = (e) => {
            if (!isResizing) return;
            
            e.preventDefault();
            const currentX = e.clientX || e.touches[0].clientX;
            const diff = currentX - startX;
            
            let newWidth;
            if (resizingSide === 'right') {
                newWidth = startWidth + diff;
            } else {
                newWidth = startWidth - diff;
            }
            
            // الحد الأدنى والأقصى للعرض
            newWidth = Math.max(100, Math.min(newWidth, this.canvas.width - 40));
            
            this.textProps.maxWidth = newWidth;
            element.style.maxWidth = newWidth + 'px';
        };
        
        const stopResize = () => {
            if (isResizing) {
                isResizing = false;
                resizingSide = '';
                element.classList.remove('active');
            }
        };
        
        leftHandle.addEventListener('mousedown', (e) => startResize(e, 'left'));
        leftHandle.addEventListener('touchstart', (e) => startResize(e, 'left'), { passive: false });
        
        rightHandle.addEventListener('mousedown', (e) => startResize(e, 'right'));
        rightHandle.addEventListener('touchstart', (e) => startResize(e, 'right'), { passive: false });
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('touchmove', resize, { passive: false });
        
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchend', stopResize);
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
            bgColor: '#000000',
            isBold: false,
            isItalic: false,
            flipH: false,
            flipV: false,
            maxWidth: 400
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
            
            // إعادة تعيين أزرار التنسيق
            document.getElementById('boldBtn')?.classList.remove('active');
            document.getElementById('italicBtn')?.classList.remove('active');
            document.getElementById('flipHBtn')?.classList.remove('active');
            document.getElementById('flipVBtn')?.classList.remove('active');
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
            // استخدام html2canvas لالتقاط الصورة بأعلى جودة
            const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
            
            // إخفاء الحدود والمقابض مؤقتاً
            const hadActiveClass = this.currentTextElement?.classList.contains('active');
            if (hadActiveClass) {
                this.currentTextElement.classList.remove('active');
            }
            
            // التقاط بجودة عالية جداً (scale: 4 للحصول على أعلى جودة)
            const canvas = await html2canvas(this.canvasWrapper, {
                backgroundColor: null,
                scale: 4, // جودة عالية جداً (4x)
                useCORS: true,
                allowTaint: true,
                logging: false,
                imageTimeout: 0,
                removeContainer: false,
                windowWidth: this.canvasWrapper.scrollWidth,
                windowHeight: this.canvasWrapper.scrollHeight
            });
            
            // إعادة الحدود إذا كانت موجودة
            if (hadActiveClass && this.currentTextElement) {
                this.currentTextElement.classList.add('active');
            }
            
            // تحويل إلى blob وتنزيل بجودة قصوى
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                link.download = `edited-photo-${timestamp}.png`;
                link.href = url;
                
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 1000);
            }, 'image/png', 1.0); // جودة 100%
            
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
            const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
            
            const hadActiveClass = this.currentTextElement?.classList.contains('active');
            if (hadActiveClass) {
                this.currentTextElement.classList.remove('active');
            }
            
            const canvas = await html2canvas(this.canvasWrapper, {
                backgroundColor: null,
                scale: 4,
                useCORS: true,
                allowTaint: true,
                logging: false,
                imageTimeout: 0,
                removeContainer: false,
                windowWidth: this.canvasWrapper.scrollWidth,
                windowHeight: this.canvasWrapper.scrollHeight
            });
            
            if (hadActiveClass && this.currentTextElement) {
                this.currentTextElement.classList.add('active');
            }
            
            if (navigator.share && navigator.canShare) {
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/png', 1.0);
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
