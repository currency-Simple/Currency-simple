class App {
    constructor() {
        this.currentPage = 'categories';
        this.pages = {
            categories: document.getElementById('categoriesPage'),
            gallery: document.getElementById('galleryPage'),
            editor: document.getElementById('editorPage'),
            settings: document.getElementById('settingsPage')
        };
        
        this.init();
    }
    
    init() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.switchPage(page);
            });
        });
        
        document.getElementById('editorBackBtn').addEventListener('click', () => {
            this.switchPage('categories');
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
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
        
        document.getElementById('downloadBtn').addEventListener('click', () => {
            if (window.canvasEditor) {
                window.canvasEditor.download();
            }
        });
        
        document.getElementById('shareBtn').addEventListener('click', () => {
            if (window.canvasEditor) {
                window.canvasEditor.share();
            }
        });
        
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
                window.langManager.change(lang);
                
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        this.loadTheme();
        this.loadLanguage();
        this.initDrawer();
    }
    
    switchPage(page) {
        Object.values(this.pages).forEach(p => p.classList.remove('active'));
        
        if (this.pages[page]) {
            this.pages[page].classList.add('active');
            this.currentPage = page;
        }
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });
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
        const handle = drawer.querySelector('.drawer-handle');
        
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

window.app = new App();

window.addEventListener('beforeunload', (e) => {
    if (window.app.currentPage === 'editor' && window.canvasEditor.image) {
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
