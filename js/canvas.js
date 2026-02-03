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
            flipV: false
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
        
        // استخدام حجم أكبر للخلفيات
        let width = 1080;
        const [w, h] = ratio.split(':').map(Number);
        let height = (width * h) / w;
        
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
                
                // عرض الصورة بحجمها الطبيعي بدون تصغير
                let width = this.image.width;
                let height = this.image.height;
                
                // فقط في حالة كانت الصورة أكبر من الشاشة بشكل مبالغ فيه
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
    
    formatTextWithLineBreaks(text) {
        const words = text.trim().split(/\s+/);
        const lines = [];
        
        for (let i = 0; i < words.length; i += 4) {
            const line = words.slice(i, i + 4).join(' ');
            lines.push(line);
        }
        
        return lines.join('\n');
    }
    
    updateText(content) {
        const formattedContent = this.formatTextWithLineBreaks(content);
        this.textProps.content = formattedContent;
        
        if (formattedContent && !this.currentTextElement) {
            this.createTextElement();
        } else if (this.currentTextElement) {
            this.updateTextElement();
        } else if (!formattedContent && this.currentTextElement) {
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
        
        this.applyTextStyle(textEl);
        this.canvasWrapper.appendChild(textEl);
        this.currentTextElement = textEl;
        
        this.makeDraggable(textEl);
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
        
        if (this.textProps.flipV) {
            const currentTransform = element.style.transform || 'translate(-50%, -50%)';
            if (!currentTransform.includes('scaleY')) {
                element.style.transform = currentTransform + ' scaleY(-1)';
            }
        } else {
            element.style.transform = element.style.transform.replace(' scaleY(-1)', '');
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
            const baseTransform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
            const scaleTransform = el.style.transform.includes('scaleY') ? ' scaleY(-1)' : '';
            el.style.transform = baseTransform + scaleTransform;
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
            flipV: false
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
    
    async downloadDirectCanvas() {
        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (this.image.isBackground) {
                tempCtx.fillStyle = this.image.color;
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            } else {
                if (this.filters.blurValue > 0) {
                    tempCtx.filter = `blur(${this.filters.blurValue}px)`;
                }
                tempCtx.drawImage(this.image, 0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.filter = 'none';
            }
            
            if (this.currentTextElement && this.textProps.content) {
                const rect = this.currentTextElement.getBoundingClientRect();
                const canvasRect = this.canvas.getBoundingClientRect();
                
                const x = (rect.left - canvasRect.left + rect.width / 2) * (this.canvas.width / canvasRect.width);
                const y = (rect.top - canvasRect.top + rect.height / 2) * (this.canvas.height / canvasRect.height);
                
                if (this.textProps.bgOpacity > 0) {
                    const hex = this.textProps.bgColor;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const opacity = this.textProps.bgOpacity / 100;
                    
                    tempCtx.save();
                    tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    
                    const lines = this.textProps.content.split('\n');
                    const fontSize = this.textProps.size * (this.canvas.width / canvasRect.width);
                    tempCtx.font = `${this.textProps.isBold ? 'bold' : 'normal'} ${this.textProps.isItalic ? 'italic' : 'normal'} ${fontSize}px "${this.textProps.font}"`;
                    
                    const lineHeight = fontSize * 1.3;
                    const maxWidth = Math.max(...lines.map(line => tempCtx.measureText(line).width));
                    const totalHeight = lines.length * lineHeight;
                    
                    tempCtx.fillRect(x - maxWidth / 2 - 10, y - totalHeight / 2 - 10, maxWidth + 20, totalHeight + 20);
                    tempCtx.restore();
                }
                
                tempCtx.save();
                tempCtx.textAlign = 'center';
                tempCtx.textBaseline = 'middle';
                
                const fontSize = this.textProps.size * (this.canvas.width / canvasRect.width);
                tempCtx.font = `${this.textProps.isBold ? 'bold' : 'normal'} ${this.textProps.isItalic ? 'italic' : 'normal'} ${fontSize}px "${this.textProps.font}"`;
                tempCtx.fillStyle = this.textProps.color;
                
                if (this.textProps.strokeWidth > 0) {
                    tempCtx.strokeStyle = this.textProps.strokeColor;
                    tempCtx.lineWidth = this.textProps.strokeWidth * (this.canvas.width / canvasRect.width);
                }
                
                if (this.textProps.shadowBlur > 0) {
                    tempCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    tempCtx.shadowBlur = this.textProps.shadowBlur;
                    tempCtx.shadowOffsetX = 4;
                    tempCtx.shadowOffsetY = 4;
                }
                
                const lines = this.textProps.content.split('\n');
                const lineHeight = fontSize * 1.3;
                const startY = y - ((lines.length - 1) * lineHeight) / 2;
                
                lines.forEach((line, index) => {
                    const lineY = startY + (index * lineHeight);
                    if (this.textProps.strokeWidth > 0) {
                        tempCtx.strokeText(line, x, lineY);
                    }
                    tempCtx.fillText(line, x, lineY);
                });
                
                tempCtx.restore();
            }
            
            return tempCanvas;
        } catch (error) {
            console.error('Direct canvas method failed:', error);
            return null;
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
        let finalCanvas = null;
        
        try {
            try {
                const allTexts = this.canvasWrapper.querySelectorAll('.draggable-text');
                allTexts.forEach(text => text.classList.remove('active'));
                
                const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
                
                const wrapperRect = this.canvasWrapper.getBoundingClientRect();
                
                finalCanvas = await html2canvas(this.canvasWrapper, {
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
                
                console.log('Using html2canvas method');
            } catch (html2canvasError) {
                console.warn('html2canvas failed, trying direct canvas method...', html2canvasError);
                
                finalCanvas = await this.downloadDirectCanvas();
                if (finalCanvas) {
                    console.log('Using direct canvas method');
                }
            }
            
            if (!finalCanvas) {
                throw new Error('Failed to create canvas');
            }
            
            if (window.Android && typeof window.Android.saveImage === 'function') {
                try {
                    const dataUrl = finalCanvas.toDataURL('image/png', 1.0);
                    const base64data = dataUrl.split(',')[1];
                    window.Android.saveImage(base64data, filename);
                    console.log('Downloaded via Android Interface');
                    return;
                } catch (androidError) {
                    console.warn('Android method failed, trying next method...', androidError);
                }
            }
            
            try {
                const blob = await new Promise((resolve, reject) => {
                    finalCanvas.toBlob(blob => {
                        if (blob) resolve(blob);
                        else reject(new Error('Blob creation failed'));
                    }, 'image/png', 1.0);
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
                    
                    console.log('Downloaded via Blob method');
                    return;
                }
            } catch (blobError) {
                console.warn('Blob method failed, trying next method...', blobError);
            }
            
            try {
                const dataUrl = finalCanvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                }, 1000);
                
                console.log('Downloaded via DataURL method');
                return;
            } catch (dataUrlError) {
                console.warn('DataURL method failed, trying next method...', dataUrlError);
            }
            
            try {
                const dataUrl = finalCanvas.toDataURL('image/png', 1.0);
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>Download Image - ${filename}</title>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 20px;
                                        background: #000;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        justify-content: center;
                                        min-height: 100vh;
                                        font-family: Arial, sans-serif;
                                    }
                                    img {
                                        max-width: 90%;
                                        height: auto;
                                        box-shadow: 0 4px 20px rgba(255,255,255,0.3);
                                        margin-bottom: 20px;
                                    }
                                    .instructions {
                                        color: white;
                                        text-align: center;
                                        margin: 20px 0;
                                    }
                                    .download-btn {
                                        display: inline-block;
                                        margin: 10px;
                                        padding: 15px 30px;
                                        background: #4CAF50;
                                        color: white;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        font-size: 16px;
                                        cursor: pointer;
                                        border: none;
                                    }
                                    .download-btn:hover {
                                        background: #45a049;
                                    }
                                </style>
                            </head>
                            <body>
                                <img src="${dataUrl}" alt="Edited Image" id="downloadImage"/>
                                <div class="instructions">
                                    <p><strong>Method 1:</strong> Right-click on the image and select "Save Image As..."</p>
                                    <p><strong>Method 2:</strong> Click the download button below</p>
                                    <p><strong>Method 3:</strong> Long press the image (mobile) and save</p>
                                </div>
                                <a href="${dataUrl}" download="${filename}" class="download-btn">💾 Download Image</a>
                                <button onclick="window.close()" class="download-btn" style="background: #f44336;">✖ Close</button>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                    console.log('Opened in new window for manual download');
                    return;
                }
            } catch (windowError) {
                console.warn('New window method failed...', windowError);
            }
            
            try {
                const blob = await new Promise(resolve => {
                    finalCanvas.toBlob(resolve, 'image/png', 1.0);
                });
                
                if (navigator.clipboard && blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    
                    const lang = localStorage.getItem('language') || 'en';
                    let message = 'Image copied to clipboard! You can paste it anywhere.';
                    if (lang === 'ar') {
                        message = 'تم نسخ الصورة إلى الحافظة! يمكنك لصقها في أي مكان.';
                    } else if (lang === 'fr') {
                        message = 'Image copiée dans le presse-papiers! Vous pouvez la coller n\'importe où.';
                    }
                    alert(message);
                    console.log('Copied to clipboard');
                    return;
                }
            } catch (clipboardError) {
                console.warn('Clipboard method failed...', clipboardError);
            }
            
            throw new Error('All download methods failed');
            
        } catch (error) {
            console.error('Download error:', error);
            const lang = localStorage.getItem('language') || 'en';
            let message = 'Failed to save image. Please try:\n1. Take a screenshot\n2. Try a different browser\n3. Check browser permissions';
            if (lang === 'ar') {
                message = 'فشل حفظ الصورة. يرجى المحاولة:\n1. أخذ لقطة شاشة\n2. تجربة متصفح آخر\n3. التحقق من أذونات المتصفح';
            } else if (lang === 'fr') {
                message = 'Échec de l\'enregistrement. Veuillez essayer:\n1. Prendre une capture d\'écran\n2. Essayer un autre navigateur\n3. Vérifier les permissions';
            }
            alert(message);
        }
    }
}

window.canvasEditor = new CanvasEditor();
