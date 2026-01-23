// نظام سحب الأدوات الجانبية
let toolSidebar = null;
let isSidebarOpen = false;

// إنشاء شريط الأدوات الجانبي
function createToolSidebar() {
    const existingSidebar = document.querySelector('.tool-sidebar');
    if (existingSidebar) {
        existingSidebar.remove();
    }
    
    const sidebar = document.createElement('div');
    sidebar.className = 'tool-sidebar collapsed';
    sidebar.innerHTML = `
        <button class="tool-sidebar-toggle" onclick="toggleToolSidebar()">
            <span class="material-symbols-outlined">chevron_right</span>
        </button>
        
        <!-- قسم الألوان -->
        <div class="tool-sidebar-section">
            <h4>ألوان النص</h4>
            <div class="color-sidebar-grid" id="textColorSidebar"></div>
        </div>
        
        <!-- قسم الخطوط -->
        <div class="tool-sidebar-section">
            <h4>الخط</h4>
            <select class="sidebar-select" id="sidebarFontFamily" onchange="updateFontFromSidebar()" style="
                width: 100%;
                padding: 8px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: var(--card-bg);
                color: var(--text-color);
                font-size: 12px;
            ">
                <option value="'Amiri', serif">محمد</option>
                <option value="'Lateef', serif">Lateef</option>
                <option value="'Noto Kufi Arabic', sans-serif">Noto Arabic</option>
                <option value="'Cairo', sans-serif">Cairo</option>
                <option value="'Tajawal', sans-serif">Tajawal</option>
            </select>
        </div>
        
        <!-- قسم حجم الخط -->
        <div class="tool-sidebar-section">
            <h4>حجم الخط</h4>
            <div class="slider-sidebar">
                <input type="range" class="sidebar-slider" id="sidebarFontSize" 
                       min="20" max="120" value="48" oninput="updateFontSizeFromSidebar(this.value)">
                <div class="slider-value" id="sidebarFontSizeValue">48</div>
            </div>
        </div>
        
        <!-- قسم الحواف -->
        <div class="tool-sidebar-section">
            <h4>حواف النص</h4>
            <div class="slider-sidebar">
                <input type="range" class="sidebar-slider" id="sidebarStrokeWidth" 
                       min="0" max="10" value="3" oninput="updateStrokeFromSidebar(this.value)">
                <div class="slider-value" id="sidebarStrokeValue">3</div>
            </div>
            <div class="color-sidebar-grid" id="strokeColorSidebar" style="margin-top: 10px;"></div>
        </div>
        
        <!-- قسم التأثيرات -->
        <div class="tool-sidebar-section">
            <h4>التأثيرات</h4>
            <div class="tool-sidebar-grid">
                <button class="tool-sidebar-item" onclick="toggleEffect('shadow')" id="shadowBtn">
                    <span class="material-symbols-outlined">shadow</span>
                    <span>ظل</span>
                </button>
                <button class="tool-sidebar-item" onclick="toggleEffect('background')" id="bgBtn">
                    <span class="material-symbols-outlined">format_color_fill</span>
                    <span>خلفية</span>
                </button>
                <button class="tool-sidebar-item" onclick="showMoreEffects()">
                    <span class="material-symbols-outlined">more_horiz</span>
                    <span>المزيد</span>
                </button>
            </div>
        </div>
        
        <!-- قسم ألوان خلفية النص -->
        <div class="tool-sidebar-section">
            <h4>لون الخلفية</h4>
            <div class="color-sidebar-grid" id="bgColorSidebar"></div>
        </div>
    `;
    
    document.body.appendChild(sidebar);
    toolSidebar = sidebar;
    
    // تهيئة الألوان
    initializeSidebarColors();
    
    return sidebar;
}

// تهيئة ألوان الشريط الجانبي
function initializeSidebarColors() {
    const textColors = document.getElementById('textColorSidebar');
    const strokeColors = document.getElementById('strokeColorSidebar');
    const bgColors = document.getElementById('bgColorSidebar');
    
    if (textColors && window.COLORS) {
        textColors.innerHTML = '';
        // عرض 16 لون فقط للشريط الجانبي
        window.COLORS.slice(0, 16).forEach(color => {
            const item = document.createElement('div');
            item.className = 'color-sidebar-item';
            item.style.backgroundColor = color;
            item.onclick = () => {
                window.currentTextColor = color;
                if (typeof setTextColor === 'function') {
                    setTextColor(color);
                }
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            };
            textColors.appendChild(item);
        });
    }
    
    if (strokeColors && window.COLORS) {
        strokeColors.innerHTML = '';
        window.COLORS.slice(16, 32).forEach(color => {
            const item = document.createElement('div');
            item.className = 'color-sidebar-item';
            item.style.backgroundColor = color;
            item.onclick = () => {
                window.currentStrokeColor = color;
                if (typeof setStrokeColor === 'function') {
                    setStrokeColor(color);
                }
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            };
            strokeColors.appendChild(item);
        });
    }
    
    if (bgColors && window.COLORS) {
        bgColors.innerHTML = '';
        window.COLORS.slice(32, 48).forEach(color => {
            const item = document.createElement('div');
            item.className = 'color-sidebar-item';
            item.style.backgroundColor = color;
            item.onclick = () => {
                window.currentCardColor = color;
                if (typeof setCardColor === 'function') {
                    setCardColor(color);
                }
                if (window.currentText && window.currentText.trim() !== '') {
                    renderFullCanvas();
                }
            };
            bgColors.appendChild(item);
        });
    }
}

// تبديل حالة الشريط الجانبي
function toggleToolSidebar() {
    if (!toolSidebar) return;
    
    isSidebarOpen = !isSidebarOpen;
    toolSidebar.classList.toggle('collapsed');
    
    const toggleBtn = toolSidebar.querySelector('.tool-sidebar-toggle span');
    if (toggleBtn) {
        toggleBtn.textContent = isSidebarOpen ? 'chevron_left' : 'chevron_right';
    }
}

// تحديث الخط من الشريط الجانبي
function updateFontFromSidebar() {
    const select = document.getElementById('sidebarFontFamily');
    if (select) {
        const fontSelect = document.getElementById('fontFamily');
        if (fontSelect) {
            fontSelect.value = select.value;
        }
        
        if (window.currentText && window.currentText.trim() !== '') {
            renderFullCanvas();
        }
    }
}

// تحديث حجم الخط من الشريط الجانبي
function updateFontSizeFromSidebar(value) {
    const display = document.getElementById('sidebarFontSizeValue');
    if (display) {
        display.textContent = value;
    }
    
    const fontSizeInput = document.getElementById('fontSize');
    if (fontSizeInput) {
        fontSizeInput.value = value;
        const fontSizeDisplay = document.getElementById('fontSizeDisplay');
        if (fontSizeDisplay) {
            fontSizeDisplay.textContent = value;
        }
    }
    
    if (window.currentText && window.currentText.trim() !== '') {
        renderFullCanvas();
    }
}

// تحديث الحواف من الشريط الجانبي
function updateStrokeFromSidebar(value) {
    const display = document.getElementById('sidebarStrokeValue');
    if (display) {
        display.textContent = value;
    }
    
    const strokeInput = document.getElementById('strokeWidth');
    if (strokeInput) {
        strokeInput.value = value;
        const strokeDisplay = document.getElementById('strokeWidthDisplay');
        if (strokeDisplay) {
            strokeDisplay.textContent = value;
        }
    }
    
    if (window.currentText && window.currentText.trim() !== '') {
        renderFullCanvas();
    }
}

// تبديل التأثيرات
function toggleEffect(effect) {
    const shadowBtn = document.getElementById('shadowBtn');
    const bgBtn = document.getElementById('bgBtn');
    
    if (effect === 'shadow') {
        const shadowEnabled = document.getElementById('shadowEnabled');
        if (shadowEnabled) {
            shadowEnabled.checked = !shadowEnabled.checked;
            shadowBtn.classList.toggle('active', shadowEnabled.checked);
            if (window.currentText && window.currentText.trim() !== '') {
                renderFullCanvas();
            }
        }
    } else if (effect === 'background') {
        const cardEnabled = document.getElementById('cardEnabled');
        if (cardEnabled) {
            cardEnabled.checked = !cardEnabled.checked;
            bgBtn.classList.toggle('active', cardEnabled.checked);
            if (window.currentText && window.currentText.trim() !== '') {
                renderFullCanvas();
            }
        }
    }
}

// إظهار المزيد من التأثيرات
function showMoreEffects() {
    // إظهار لوحة التأثيرات الكاملة
    const effectsPanel = document.getElementById('effectsPanel');
    if (effectsPanel) {
        effectsPanel.classList.add('active');
    }
    
    // إخفاء السايدبار مؤقتاً
    if (toolSidebar) {
        toolSidebar.classList.add('collapsed');
        isSidebarOpen = false;
        const toggleBtn = toolSidebar.querySelector('.tool-sidebar-toggle span');
        if (toggleBtn) {
            toggleBtn.textContent = 'chevron_right';
        }
    }
}

// تهيئة الشريط الجانبي عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        createToolSidebar();
    }, 1000);
});

// تصدير الدوال
window.toggleToolSidebar = toggleToolSidebar;
window.updateFontFromSidebar = updateFontFromSidebar;
window.updateFontSizeFromSidebar = updateFontSizeFromSidebar;
window.updateStrokeFromSidebar = updateStrokeFromSidebar;
window.toggleEffect = toggleEffect;
window.showMoreEffects = showMoreEffects;
