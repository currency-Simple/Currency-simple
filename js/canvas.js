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
            maxWidth: 400
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
    
    createBackground(color, ratio) {
        this.selectedBgColor = color;
        this.selectedRatio = ratio;
        
        const maxWidth = window.innerWidth - 32;
        const maxHeight = window.innerHeight - 300;
        
        let width, height;
        const [w, h] = ratio.split(':').map(Number);
        
        width = 600;
        height = (width * h) / w;
        
        if (width > maxWidth) {
            width = maxWidth;
            height = (width * h) / w;
        }
        if (height > maxHeight) {
            height = maxHeight;
            width = (height * w) / h;
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
        
        // مربع تحكم مع مقابض في الزوايا
        const resizeBox = document.createElement('div');
        resizeBox.className = 'resize-box';
        
        const handleNW = document.createElement('div');
        handleNW.className = 'resize-handle nw';
        const handleNE = document.createElement('div');
        handleNE.className = 'resize-handle ne';
        const handleSW = document.createElement('div');
        handleSW.className = 'resize-handle sw';
        const handleSE = document.createElement('div');
        handleSE.className = 'resize-handle se';
        
        resizeBox.appendChild(handleNW);
        resizeBox.appendChild(handleNE);
        resizeBox.appendChild(handleSW);
        resizeBox.appendChild(handleSE);
        textEl.appendChild(resizeBox);
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        this.makeDraggable(textEl);
        this.makeResizable(textEl, resizeBox);
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
        
        // تحديث مربع التحكم
        const resizeBox = element.querySelector('.resize-box');
        if (resizeBox) {
            setTimeout(() => {
                const rect = element.getBoundingClientRect();
                resizeBox.style.width = rect.width + 'px';
                resizeBox.style.height = rect.height + 'px';
                resizeBox.style.left = '0';
                resizeBox.style.top = '0';
            }, 10);
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
            if (e.target.classList.contains('resize-handle') || e.target.classList.contains('resize-box')) {
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
            el.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
        }
    }
    
    makeResizable(element, resizeBox) {
        const handles = resizeBox.querySelectorAll('.resize-handle');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, currentHandle;
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', startResize);
            handle.addEventListener('touchstart', startResize, { passive: false });
        });
        
        function startResize(e) {
            isResizing = true;
            currentHandle = e.target;
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;
            startWidth = element.offsetWidth;
            startHeight = element.offsetHeight;
            element.classList.add('active');
            e.stopPropagation();
            e.preventDefault();
        }
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('touchmove', resize, { passive: false });
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchend', stopResize);
        
        function resize(e) {
            if (!isResizing) return;
            e.preventDefault();
            
            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;
            
            let newWidth = startWidth;
            
            if (currentHandle.classList.contains('ne') || currentHandle.classList.contains('se')) {
                newWidth = startWidth + diffX;
            } else if (currentHandle.classList.contains('nw') || currentHandle.classList.contains('sw')) {
                newWidth = startWidth - diffX;
            }
            
            const canvas = document.getElementById('canvas');
            newWidth = Math.max(100, Math.min(newWidth, canvas.width - 40));
            
            window.canvasEditor.textProps.maxWidth = newWidth;
            element.style.maxWidth = newWidth + 'px';
            
            setTimeout(() => {
                const rect = element.getBoundingClientRect();
                resizeBox.style.width = rect.width + 'px';
                resizeBox.style.height = rect.height + 'px';
            }, 0);
        }
        
        function stopResize() {
            if (isResizing) {
                isResizing = false;
                currentHandle = null;
                element.classList.remove('active');
            }
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
            bgColor: '#000000',
            isBold: false,
            isItalic: false,
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
        
        try {
            const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
            
            const hadActiveClass = this.currentTextElement?.classList.contains('active');
            if (hadActiveClass) {
                this.currentTextElement.classList.remove('active');
            }
            
            const wrapperRect = this.canvasWrapper.getBoundingClientRect();
            
            const canvas = await html2canvas(this.canvasWrapper, {
                backgroundColor: null,
                scale: 3,
                useCORS: true,
                allowTaint: true,
                logging: false,
                imageTimeout: 0,
                removeContainer: false,
                width: wrapperRect.width,
                height: wrapperRect.height,
                windowWidth: wrapperRect.width,
                windowHeight: wrapperRect.height,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: -window.scrollY
            });
            
            if (hadActiveClass && this.currentTextElement) {
                this.currentTextElement.classList.add('active');
            }
            
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
            }, 'image/png', 1.0);
            
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
            
            const wrapperRect = this.canvasWrapper.getBoundingClientRect();
            
            const canvas = await html2canvas(this.canvasWrapper, {
                backgroundColor: null,
                scale: 3,
                useCORS: true,
                allowTaint: true,
                logging: false,
                imageTimeout: 0,
                removeContainer: false,
                width: wrapperRect.width,
                height: wrapperRect.height,
                windowWidth: wrapperRect.width,
                windowHeight: wrapperRect.height,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: -window.scrollY
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
