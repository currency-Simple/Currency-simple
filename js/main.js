class App {
    constructor() {
        this.currentPage = 'editor';
        this.pages = {
            editor: document.getElementById('editorPage'),
            settings: document.getElementById('settingsPage')
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (window.canvasEditor && window.canvasEditor.image) {
                    const lang = localStorage.getItem('language') || 'en';
                    let message = 'Are you sure you want to reset all edits?';
                    
                    if (lang === 'ar') {
                        message = 'هل أنت متأكد من إعادة تعيين جميع التعديلات؟';
                    } else if (lang === 'fr') {
                        message = 'Êtes-vous sûr de vouloir réinitialiser toutes les modifications?';
                    }
                    
                    if (confirm(message)) {
                        window.canvasEditor.reset();
                    }
                }
            });
        }
        
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (window.canvasEditor) {
                    window.canvasEditor.download();
                }
            });
        }
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }
        
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                this.closeSettings();
            });
        }
        
        const settingsPage = document.getElementById('settingsPage');
        if (settingsPage) {
            settingsPage.addEventListener('click', (e) => {
                if (e.target === settingsPage) {
                    this.closeSettings();
                }
            });
        }
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.changeTheme(theme);
                
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (window.langManager) {
                    window.langManager.change(lang);
                }
                
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        this.loadTheme();
        this.loadLanguage();
        this.initDrawer();
    }
    
    openSettings() {
        if (this.pages.settings) {
            this.pages.settings.classList.add('active');
        }
    }
    
    closeSettings() {
        if (this.pages.settings) {
            this.pages.settings.classList.remove('active');
        }
    }
    
    changeTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        });
    }
    
    loadLanguage() {
        const savedLang = localStorage.getItem('language') || 'en';
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === savedLang);
        });
    }
    
    initDrawer() {
        const drawer = document.getElementById('toolsDrawer');
        if (!drawer) return;
        
        const handle = drawer.querySelector('.drawer-handle');
        if (!handle) return;
        
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        const handleStart = (e) => {
            isDragging = true;
            startY = e.clientY || e.touches[0].clientY;
            drawer.style.transition = 'none';
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            
            currentY = e.clientY || e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 0) {
                drawer.style.transform = `translateY(${diff}px)`;
            }
        };
        
        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            
            drawer.style.transition = 'transform 0.3s ease';
            
            const diff = currentY - startY;
            
            if (diff > 100) {
                drawer.style.transform = 'translateY(calc(100% - 60px))';
            } else {
                drawer.style.transform = 'translateY(0)';
            }
        };
        
        handle.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        
        handle.addEventListener('touchstart', handleStart, { passive: true });
        document.addEventListener('touchmove', handleMove, { passive: true });
        document.addEventListener('touchend', handleEnd);
        
        handle.addEventListener('click', () => {
            const current = drawer.style.transform;
            if (current.includes('calc')) {
                drawer.style.transform = 'translateY(0)';
            } else {
                drawer.style.transform = 'translateY(calc(100% - 60px))';
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}

window.addEventListener('beforeunload', (e) => {
    if (window.canvasEditor && window.canvasEditor.image) {
        e.preventDefault();
        e.returnValue = '';
    }
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.canvasEditor && window.canvasEditor.image) {
            window.canvasEditor.render();
        }
    }, 250);
});

console.log('%c🎨 Professional Photo Editor', 'font-size: 20px; font-weight: bold;');
console.log('%c✨ Ready to use', 'font-size: 14px; color: #0f0;');
