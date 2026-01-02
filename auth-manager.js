// ============================================
// 🔗 OAUTH FUNCTIONS (أضف في نهاية الملف)
// ============================================

// 🔵 GitHub OAuth
export async function signInWithGitHub() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin + '/',
                queryParams: { prompt: 'login' }
            }
        });
        
        if (error) throw error;
        return { success: true, data };
        
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return { 
            success: false, 
            error: error.message || 'GitHub login failed' 
        };
    }
}

// 🔵 Google OAuth
export async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });
        
        if (error) throw error;
        return { success: true, data };
        
    } catch (error) {
        console.error('Google OAuth error:', error);
        return { 
            success: false, 
            error: error.message || 'Google login failed' 
        };
    }
}

// 🔵 Discord OAuth
export async function signInWithDiscord() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: window.location.origin + '/'
            }
        });
        
        if (error) throw error;
        return { success: true, data };
        
    } catch (error) {
        console.error('Discord OAuth error:', error);
        return { 
            success: false, 
            error: error.message || 'Discord login failed' 
        };
    }
}

// دالة عامة لـ OAuth
export async function signInWithOAuth(provider) {
    switch (provider) {
        case 'github':
            return await signInWithGitHub();
        case 'google':
            return await signInWithGoogle();
        case 'discord':
            return await signInWithDiscord();
        default:
            return { 
                success: false, 
                error: 'Provider not supported' 
            };
    }
}
