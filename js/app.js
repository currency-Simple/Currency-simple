// Configuration
const PEXELS_API_KEY = '8wFvB5Xc4LSTsiuQVpFoyyqHpdrEi7GVgQR24HiI1sBsK2SAeOPew98m';

const CATEGORIES = [
    { name: 'Cars', query: 'Cars' },
    { name: 'Lions', query: 'Lions' },
    { name: 'Sky', query: 'Sky' },
    { name: 'Forest', query: 'Forest' },
    { name: 'Cities', query: 'Cities' },
    { name: 'Airplane', query: 'Airplane' },
    { name: 'Shore', query: 'Shore' },
    { name: 'Flower', query: 'Flower' },
    { name: 'Buildings', query: 'Buildings' },
    { name: 'Vegetables', query: 'Vegetables' },
    { name: 'Fruits', query: 'Fruits' },
    { name: 'Furniture', query: 'Furniture' },
    { name: 'Children', query: 'Children' },
    { name: 'Food', query: 'Food' },
    { name: 'Motorcycles', query: 'Motorcycles' },
    { name: 'Snow', query: 'Snow' },
    { name: 'Switzerland', query: 'Switzerland' },
    { name: 'Birds', query: 'Birds' }
];

// App State
let currentPage = 'categories';
let currentCategory = null;
let currentImage = null;
let currentTextElement = null;
let textProps = {
    content: '',
    maxWidth: 400,
    isFlipped: false
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    initNavigation();
    initEditor();
    initTextControls();
});

// Navigation
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            switchPage(page);
        });
    });
    
    document.getElementById('galleryBackBtn')?.addEventListener('click', () => {
        switchPage('categories');
    });
    
    document.getElementById('editorBackBtn')?.addEventListener('click', () => {
        switchPage('categories');
    });
}

function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
    
    currentPage = page;
}

// Gallery Functions
async function loadCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';
    
    for (const category of CATEGORIES) {
        try {
            const response = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(category.query)}&per_page=2&orientation=portrait`,
                {
                    headers: { 'Authorization': PEXELS_API_KEY }
                }
            );
            
            const data = await response.json();
            const imageUrl = data.photos?.[1]?.src.medium || data.photos?.[0]?.src.medium || '';
            
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="${category.name}" loading="lazy">
                <div class="overlay">
                    <span class="category-name">${category.name}</span>
                </div>
            `;
            
            card.addEventListener('click', () => openCategory(category));
            grid.appendChild(card);
            
        } catch (error) {
            console.error(`Error loading ${category.name}:`, error);
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <div style="width:100%;height:100%;background:#2a2a2a;display:flex;align-items:center;justify-content:center;">
                    <span class="category-name">${category.name}</span>
                </div>
            `;
            card.addEventListener('click', () => openCategory(category));
            grid.appendChild(card);
        }
    }
}

async function openCategory(category) {
    currentCategory = category;
    document.getElementById('galleryTitle').textContent = category.name;
    
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    switchPage('gallery');
    
    try {
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(category.query)}&per_page=20&orientation=portrait`,
            {
                headers: { 'Authorization': PEXELS_API_KEY }
            }
        );
        
        const data = await response.json();
        grid.innerHTML = '';
        
        if (data.photos && data.photos.length > 0) {
            data.photos.forEach(photo => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `<img src="${photo.src.large}" alt="" loading="lazy">`;
                item.addEventListener('click', () => {
                    loadImageToCanvas(photo.src.large2x);
                    switchPage('editor');
                });
                grid.appendChild(item);
            });
        } else {
            grid.innerHTML = '<div class="loading"><p>No images found</p></div>';
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        grid.innerHTML = '<div class="loading"><p>Error loading images</p></div>';
    }
}

// Editor Functions
function initEditor() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas container
    const container = document.querySelector('.canvas-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-wrapper';
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);
    
    window.canvasContext = ctx;
    window.canvasWrapper = wrapper;
    
    // Text input
    document.getElementById('textInput')?.addEventListener('input', (e) => {
        textProps.content = e.target.value;
        updateText();
    });
    
    // Upload
    document.getElementById('uploadArea')?.addEventListener('click', () => {
        document.getElementById('imageUpload')?.click();
    });
    
    document.getElementById('imageUpload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                loadImageToCanvas(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`${tool}Panel`)?.classList.add('active');
        });
    });
    
    // Download
    document.getElementById('downloadBtn')?.addEventListener('click', downloadImage);
    
    // Reset
    document.getElementById('resetBtn')?.addEventListener('click', () => {
        if (confirm('Reset all edits?')) {
            if (currentTextElement) {
                currentTextElement.remove();
                currentTextElement = null;
            }
            document.getElementById('textInput').value = '';
            textProps = { content: '', maxWidth: 400, isFlipped: false };
        }
    });
    
    // Hide control box when clicking outside
    document.addEventListener('click', (e) => {
        const controlBox = document.getElementById('textControlBox');
        const isText = e.target.closest('.draggable-text');
        const isControl = e.target.closest('.text-control-box');
        
        if (!isText && !isControl) {
            controlBox.classList.remove('active');
        }
    });
}

function loadImageToCanvas(url) {
    const canvas = document.getElementById('canvas');
    const ctx = window.canvasContext;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
        currentImage = img;
        
        const maxWidth = window.innerWidth - 32;
        const maxHeight = window.innerHeight - 300;
        
        let width = img.width;
        let height = img.height;
        const ratio = width / height;
        
        if (width > maxWidth) {
            width = maxWidth;
            height = width / ratio;
        }
        if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
    };
    
    img.src = url;
}

function updateText() {
    if (!textProps.content && currentTextElement) {
        currentTextElement.remove();
        currentTextElement = null;
        return;
    }
    
    if (textProps.content && !currentTextElement) {
        createTextElement();
    } else if (currentTextElement) {
        const textNode = currentTextElement.childNodes[0];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = textProps.content;
        }
    }
}

function createTextElement() {
    const textEl = document.createElement('div');
    textEl.className = 'draggable-text';
    textEl.textContent = textProps.content;
    textEl.style.left = '50%';
    textEl.style.top = '50%';
    textEl.style.transform = 'translate(-50%, -50%)';
    textEl.style.fontSize = '48px';
    textEl.style.color = '#fff';
    textEl.style.fontWeight = 'bold';
    textEl.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    textEl.style.maxWidth = textProps.maxWidth + 'px';
    
    textEl.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('textControlBox').classList.add('active');
    });
    
    makeDraggable(textEl);
    
    window.canvasWrapper.appendChild(textEl);
    currentTextElement = textEl;
}

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY;
    let currentX = 0, currentY = 0;
    
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        isDragging = true;
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        startX = clientX - currentX;
        startY = clientY - currentY;
    }
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        currentX = clientX - startX;
        currentY = clientY - startY;
        
        const baseTransform = 'translate(-50%, -50%)';
        const moveTransform = `translate(${currentX}px, ${currentY}px)`;
        const flipTransform = textProps.isFlipped ? ' scaleX(-1)' : '';
        element.style.transform = `${baseTransform} ${moveTransform}${flipTransform}`;
    }
    
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('touchend', () => isDragging = false);
}

// Text Controls
function initTextControls() {
    document.getElementById('flipTextBtn')?.addEventListener('click', () => {
        if (!currentTextElement) return;
        textProps.isFlipped = !textProps.isFlipped;
        const transform = currentTextElement.style.transform;
        if (textProps.isFlipped) {
            currentTextElement.style.transform = transform + ' scaleX(-1)';
        } else {
            currentTextElement.style.transform = transform.replace(' scaleX(-1)', '');
        }
    });
    
    document.getElementById('duplicateTextBtn')?.addEventListener('click', () => {
        if (!currentTextElement) return;
        const clone = currentTextElement.cloneNode(true);
        const rect = currentTextElement.getBoundingClientRect();
        clone.style.left = (parseFloat(currentTextElement.style.left) + 5) + '%';
        clone.style.top = (parseFloat(currentTextElement.style.top) + 5) + '%';
        makeDraggable(clone);
        clone.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('textControlBox').classList.add('active');
            currentTextElement = clone;
        });
        window.canvasWrapper.appendChild(clone);
    });
    
    let isExpanded = true;
    document.getElementById('expandTextBtn')?.addEventListener('click', () => {
        if (!currentTextElement) return;
        if (isExpanded) {
            textProps.maxWidth = Math.max(100, textProps.maxWidth - 50);
        } else {
            textProps.maxWidth = Math.min(600, textProps.maxWidth + 50);
        }
        currentTextElement.style.maxWidth = textProps.maxWidth + 'px';
        isExpanded = !isExpanded;
    });
}

// Download
async function downloadImage() {
    if (!currentImage) {
        alert('Please load an image first');
        return;
    }
    
    try {
        const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
        
        // Hide control box
        document.getElementById('textControlBox').classList.remove('active');
        
        const wrapper = window.canvasWrapper;
        const canvas = await html2canvas(wrapper, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `edited-photo-${Date.now()}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to save image');
    }
}

console.log('✅ Photo Editor Ready');
