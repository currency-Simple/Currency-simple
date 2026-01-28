class GalleryManager {
    constructor() {
        this.categoriesGrid = document.getElementById('categoriesGrid');
        this.galleryGrid = document.getElementById('galleryGrid');
        this.galleryTitle = document.getElementById('galleryTitle');
        
        this.currentCategory = null;
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMorePhotos = true;
        this.loadingElement = null;
        this.photosBuffer = [];
        
        this.init();
    }
    
    init() {
        this.loadCategories();
        
        document.getElementById('galleryBackBtn').addEventListener('click', () => {
            window.app.switchPage('categories');
        });
    }
    
    async loadCategories() {
        // لا نحذف المحتوى الموجود، فقط نتحقق إذا كان فارغاً
        if (this.categoriesGrid.children.length === 0) {
            for (const category of CATEGORIES) {
                const card = await this.createCategoryCard(category);
                this.categoriesGrid.appendChild(card);
            }
        }
    }
    
    async createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'category-card';
        
        try {
            const response = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(category.query)}&per_page=1&orientation=portrait`,
                {
                    headers: {
                        'Authorization': PEXELS_API_KEY
                    }
                }
            );
            
            const data = await response.json();
            const imageUrl = data.photos[0]?.src.medium || '';
            
            card.innerHTML = `
                <img src="${imageUrl}" alt="${category.name}" loading="lazy">
                <div class="overlay">
                    <span class="category-name">${category.name}</span>
                </div>
            `;
        } catch (error) {
            card.innerHTML = `
                <div class="overlay" style="background: var(--bg-tertiary); min-height: 150px; display: flex; align-items: center; justify-content: center;">
                    <span class="category-name">${category.name}</span>
                </div>
            `;
        }
        
        card.addEventListener('click', () => {
            this.openCategory(category);
        });
        
        return card;
    }
    
    openCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.hasMorePhotos = true;
        this.photosBuffer = [];
        this.galleryTitle.textContent = category.name;
        
        // مسح كل شيء
        this.galleryGrid.innerHTML = '';
        
        // إضافة Loading indicator
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'loading';
        this.loadingElement.innerHTML = '<div class="spinner"></div>';
        this.galleryGrid.appendChild(this.loadingElement);
        
        // الانتقال للصفحة
        window.app.switchPage('gallery');
        
        // تحميل أول دفعة
        this.loadPhotos();
        
        // إعداد Infinite Scroll
        this.setupInfiniteScroll();
    }
    
    setupInfiniteScroll() {
        // إزالة المستمع القديم إن وجد
        if (this.scrollHandler) {
            this.galleryGrid.removeEventListener('scroll', this.scrollHandler);
        }
        
        // إضافة مستمع جديد - Pinterest style
        this.scrollHandler = () => {
            const scrollTop = this.galleryGrid.scrollTop;
            const scrollHeight = this.galleryGrid.scrollHeight;
            const clientHeight = this.galleryGrid.clientHeight;
            
            // عندما يصل المستخدم لـ 400px من النهاية - تحميل مبكر للسلاسة
            if (scrollTop + clientHeight >= scrollHeight - 400) {
                if (!this.isLoading && this.hasMorePhotos) {
                    this.loadMorePhotos();
                }
            }
        };
        
        this.galleryGrid.addEventListener('scroll', this.scrollHandler);
    }
    
    async loadPhotos() {
        if (this.isLoading || !this.hasMorePhotos) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            // تحميل 15 صورة في كل مرة لتجربة Pinterest السلسة
            const response = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(this.currentCategory.query)}&per_page=15&page=${this.currentPage}&orientation=portrait`,
                {
                    headers: {
                        'Authorization': PEXELS_API_KEY
                    }
                }
            );
            
            if (!response.ok) throw new Error('Failed to fetch');
            
            const data = await response.json();
            
            if (!data.photos || data.photos.length === 0) {
                this.hasMorePhotos = false;
                this.hideLoading();
                
                if (this.currentPage === 1) {
                    this.showNoPhotos();
                }
            } else {
                this.displayPhotos(data.photos);
                
                // إذا كانت أقل من 15 صورة، معناها انتهت الصور
                if (data.photos.length < 15) {
                    this.hasMorePhotos = false;
                }
            }
        } catch (error) {
            console.error('Error:', error);
            this.hasMorePhotos = false;
            
            if (this.currentPage === 1) {
                this.showError();
            }
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }
    
    loadMorePhotos() {
        this.currentPage++;
        this.loadPhotos();
    }
    
    displayPhotos(photos) {
        // Pinterest-style: إضافة الصور مباشرة قبل عنصر Loading
        photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            // استخدام الصورة الأصلية بدون تحديد الارتفاع
            item.innerHTML = `<img src="${photo.src.large}" alt="${photo.alt || ''}" loading="lazy">`;
            
            item.addEventListener('click', () => {
                window.selectedImageUrl = photo.src.large2x;
                window.app.switchPage('editor');
                if (window.canvasEditor) {
                    window.canvasEditor.loadImage(photo.src.large2x);
                }
            });
            
            // إضافة الصورة قبل عنصر Loading
            this.galleryGrid.insertBefore(item, this.loadingElement);
        });
    }
    
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.classList.add('hidden');
        }
    }
    
    showNoPhotos() {
        const noPhotos = document.createElement('div');
        noPhotos.style.width = '100%';
        noPhotos.style.textAlign = 'center';
        noPhotos.style.color = 'var(--text-secondary)';
        noPhotos.style.padding = '40px';
        noPhotos.style.breakInside = 'avoid';
        noPhotos.textContent = 'No images found';
        this.galleryGrid.insertBefore(noPhotos, this.loadingElement);
    }
    
    showError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.width = '100%';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '40px';
        errorDiv.style.breakInside = 'avoid';
        errorDiv.innerHTML = `
            <p style="color: var(--text-primary); margin-bottom: 16px;">Error loading photos</p>
            <button onclick="location.reload()" style="padding: 12px 24px; background: var(--accent); color: var(--bg-primary); border: none; border-radius: 8px; cursor: pointer;">Retry</button>
        `;
        this.galleryGrid.insertBefore(errorDiv, this.loadingElement);
    }
}

window.galleryManager = new GalleryManager();
