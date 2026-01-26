// config.js - إعدادات Supabase

const SUPABASE_CONFIG = {
    url: 'https://byxbwljcwevywrgjuvkn.supabase.co', // ضع رابط مشروعك هنا
    anonKey: 'sb_publishable_zWY6EAOczT_nhiscFxqHQA_hboO8gpf' // ضع المفتاح هنا
};

// تهيئة Supabase Client
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// دوال المصادقة
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
    }
};

// دوال قاعدة البيانات
const Database = {
    // جلب جميع الفئات
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    // جلب صور فئة معينة
    async getCategoryImages(categoryId) {
        const { data, error } = await supabase
            .from('images')
            .select('*')
            .eq('category_id', categoryId)
            .order('id', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    // حفظ صورة معدلة للمستخدم
    async saveUserImage(userId, imageData) {
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
