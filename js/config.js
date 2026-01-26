// config.js - إعدادات Supabase

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // ضع رابط مشروعك هنا
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // ضع المفتاح هنا
};

// التطبيق يعمل بوضعين:
// 1. بدون تسجيل دخول (Guest Mode) - الافتراضي
// 2. مع تسجيل دخول (User Mode) - اختياري

let isGuestMode = true;

// تهيئة Supabase Client
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// دوال المصادقة (اختيارية)
const Auth = {
    // تسجيل حساب جديد
    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    // تسجيل الدخول
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    // تسجيل دخول بجوجل
    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google'
        });
        if (error) throw error;
        return data;
    },

    // تسجيل الخروج
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // الحصول على المستخدم الحالي
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // الاستماع لتغييرات المصادقة
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },

    // التحقق من وضع الضيف
    isGuest() {
        return isGuestMode;
    },

    // التبديل إلى وضع المستخدم
    enableUserMode() {
        isGuestMode = false;
    },

    // التبديل إلى وضع الضيف
    enableGuestMode() {
        isGuestMode = true;
    }
};

// دوال قاعدة البيانات
const Database = {
    // جلب جميع الفئات (متاح للجميع)
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    // جلب صور فئة معينة (متاح للجميع)
    async getCategoryImages(categoryId) {
        const { data, error } = await supabase
            .from('images')
            .select('*')
            .eq('category_id', categoryId)
            .order('id', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    // حفظ صورة معدلة للمستخدم (يتطلب تسجيل دخول)
    async saveUserImage(userId, imageData) {
        if (isGuestMode) {
            // في وضع الضيف، نحفظ في localStorage
            const guestImages = JSON.parse(localStorage.getItem('guestImages') || '[]');
            const newImage = {
                id: Date.now(),
                image_url: imageData.url,
                edited_data: imageData.edits,
                created_at: new Date().toISOString()
            };
            guestImages.push(newImage);
            localStorage.setItem('guestImages', JSON.stringify(guestImages));
            return newImage;
        }

        // في وضع المستخدم، نحفظ في Supabase
        const { data, error } = await supabase
            .from('user_images')
            .insert({
                user_id: userId,
                image_url: imageData.url,
                edited_data: imageData.edits,
                created_at: new Date().toISOString()
            });
        
        if (error) throw error;
        return data;
    },

    // جلب صور المستخدم المحفوظة
    async getUserImages(userId) {
        if (isGuestMode) {
            // في وضع الضيف، نجلب من localStorage
            return JSON.parse(localStorage.getItem('guestImages') || '[]');
        }

        // في وضع المستخدم، نجلب من Supabase
        const { data, error } = await supabase
            .from('user_images')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    // رفع صورة إلى Storage
    async uploadImage(file, path) {
        const { data, error } = await supabase.storage
            .from('images')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        // الحصول على رابط الصورة العام
        const { data: publicURL } = supabase.storage
            .from('images')
            .getPublicUrl(path);
        
        return publicURL.publicUrl;
    }
};

// تصدير للاستخدام العام
window.Auth = Auth;
window.Database = Database;
window.supabase = supabase;
