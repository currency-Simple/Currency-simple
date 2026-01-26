// js/supabase.js
const SUPABASE_CONFIG = {
    URL: 'https://your-project.supabase.co',
    KEY: 'your-anon-key'
};

class ImageDatabase {
    constructor() {
        this.supabase = null;
        this.init();
    }

    async init() {
        try {
            // تحميل Supabase من CDN
            if (!window.supabase) {
                await this.loadSupabase();
            }
            
            this.supabase = window.supabase.createClient(
                SUPABASE_CONFIG.URL,
                SUPABASE_CONFIG.KEY
            );
            
            console.log('✅ Supabase connected');
        } catch (error) {
            console.log('⚠️ Using local mode');
            this.supabase = null;
        }
    }

    async loadSupabase() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ██████████████████████████████████████████████████████████████████████████████
    // 📂 جلب الفئات والصور
    // ██████████████████████████████████████████████████████████████████████████████

    async getCategories() {
        // إذا لم يكن Supabase متصلًا، استخدم البيانات المحلية
        if (!this.supabase) {
            return this.getLocalCategories();
        }

        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('id');

            if (error) throw error;

            // حفظ في localStorage للاستخدام اللاحق
            localStorage.setItem('categories', JSON.stringify(data));
            return data;
            
        } catch (error) {
            console.error('Error fetching categories:', error);
            return this.getLocalCategories();
        }
    }

    async getCategoryImages(categoryId) {
        if (!this.supabase) {
            return this.getLocalImages(categoryId);
        }

        try {
            const { data, error } = await this.supabase
                .from('images')
                .select('*')
                .eq('category_id', categoryId)
                .order('id');

            if (error) throw error;

            localStorage.setItem(`images_${categoryId}`, JSON.stringify(data));
            return data;
            
        } catch (error) {
            console.error('Error fetching images:', error);
            return this.getLocalImages(categoryId);
        }
    }

    // ██████████████████████████████████████████████████████████████████████████████
    // 💾 حفظ المشاريع
    // ██████████████████████████████████████████████████████████████████████████████

    async saveProject(projectData) {
        const project = {
            name: projectData.name || 'مشروع جديد',
            image: projectData.image,
            text: projectData.text,
            settings: projectData.settings,
            created_at: new Date().toISOString()
        };

        // تخزين محلي دائمًا
        this.saveLocalProject(project);

        // محاولة رفع إلى Supabase إذا كان متصلاً
        if (this.supabase) {
            try {
                await this.supabase
                    .from('projects')
                    .insert([project]);
                console.log('✅ Project saved to Supabase');
            } catch (error) {
                console.log('⚠️ Project saved locally only');
            }
        }

        return project;
    }

    async getProjects() {
        if (this.supabase) {
            try {
                const { data } = await this.supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });
                return data || [];
            } catch (error) {
                // إذا فشل، استرجع من localStorage
            }
        }

        return this.getLocalProjects();
    }

    // ██████████████████████████████████████████████████████████████████████████████
    // 📁 البيانات المحلية (وضع عدم الاتصال)
    // ██████████████████████████████████████████████████████████████████████████████

    getLocalCategories() {
        const saved = localStorage.getItem('categories');
        if (saved) return JSON.parse(saved);
        
        // بيانات تجريبية
        return [
            {
                id: 1,
                name: "الطبيعة",
                cover_image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=500&fit=crop"
            },
            {
                id: 2,
                name: "المدن",
                cover_image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=500&fit=crop"
            },
            {
                id: 3,
                name: "الفن",
                cover_image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=500&fit=crop"
            },
            {
                id: 4,
                name: "الحيوانات",
                cover_image: "https://images.unsplash.com/photo-1514888286974-6d03bde4ba48?w=400&h=500&fit=crop"
            }
        ];
    }

    getLocalImages(categoryId) {
        const saved = localStorage.getItem(`images_${categoryId}`);
        if (saved) return JSON.parse(saved);
        
        // صور تجريبية
        return Array.from({ length: 9 }, (_, i) => ({
            id: i + 1,
            title: `صورة ${i + 1}`,
            url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=300&h=400&fit=crop`,
            category_id: categoryId
        }));
    }

    saveLocalProject(project) {
        const projects = this.getLocalProjects();
        projects.unshift(project);
        localStorage.setItem('user_projects', JSON.stringify(projects.slice(0, 50))); // حفظ 50 مشروع فقط
    }

    getLocalProjects() {
        return JSON.parse(localStorage.getItem('user_projects') || '[]');
    }

    // ██████████████████████████████████████████████████████████████████████████████
    // ⬆️ رفع الصور إلى Supabase Storage
    // ██████████████████████████████████████████████████████████████████████████████

    async uploadImage(file) {
        if (!this.supabase) {
            // إذا لم يكن Supabase متصلاً، استخدم Data URL
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        try {
            const fileName = `user_${Date.now()}_${file.name}`;
            
            const { data, error } = await this.supabase.storage
                .from('user_images')
                .upload(fileName, file);

            if (error) throw error;

            // الحصول على رابط عام للصورة
            const { data: { publicUrl } } = this.supabase.storage
                .from('user_images')
                .getPublicUrl(fileName);

            return publicUrl;
            
        } catch (error) {
            console.error('Error uploading image:', error);
            // استخدام Data URL كبديل
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }
    }
}

// إنشاء نسخة واحدة عالمية
window.imageDB = new ImageDatabase();
