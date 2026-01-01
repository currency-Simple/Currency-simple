// ============================================
// 🎨 THEMES MANAGER (Online)
// ============================================
import { supabase } from '../online/supabase-config.js';

export const THEMES = {
  dark: {
    name: 'الوضع الداكن',
    bg: '#000000',
    fg: '#FFFFFF',
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
    accent: '#FFE66D',
    icon: '🌙'
  },
  light: {
    name: 'الوضع الفاتح',
    bg: '#FFFFFF',
    fg: '#000000',
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
    accent: '#FFE66D',
    icon: '☀️'
  },
  neon: {
    name: 'نيون',
    bg: '#0A0A1A',
    fg: '#00FFFF',
    primary: '#FF00FF',
    secondary: '#00FF00',
    accent: '#FFFF00',
    icon: '💫'
  },
  sunset: {
    name: 'غروب',
    bg: '#1A0A0A',
    fg: '#FFE6D5',
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#FDC830',
    icon: '🌅'
  },
  ocean: {
    name: 'محيط',
    bg: '#001F3F',
    fg: '#E0F7FA',
    primary: '#00BCD4',
    secondary: '#0097A7',
    accent: '#80DEEA',
    icon: '🌊'
  }
};

export function applyTheme(themeName) {
  const theme = THEMES[themeName] || THEMES.dark;
  document.documentElement.style.setProperty('--bg-color', theme.bg);
  document.documentElement.style.setProperty('--fg-color', theme.fg);
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--accent-color', theme.accent);
  localStorage.setItem('selected_theme', themeName);
}

export async function saveTheme(userId, themeName) {
  try {
    await supabase.from('profiles').update({ theme_preference: themeName }).eq('user_id', userId);
    applyTheme(themeName);
    return { success: true };
  } catch (error) {
    console.error('Save theme error:', error);
    return { success: false };
  }
}

export async function loadTheme(userId) {
  try {
    if (userId) {
      const { data } = await supabase.from('profiles').select('theme_preference').eq('user_id', userId).single();
      if (data?.theme_preference) {
        applyTheme(data.theme_preference);
        return data.theme_preference;
      }
    }
    const saved = localStorage.getItem('selected_theme');
    applyTheme(saved || 'dark');
    return saved || 'dark';
  } catch (error) {
    applyTheme('dark');
    return 'dark';
  }
}

export function getAvailableThemes() {
  return Object.entries(THEMES).map(([key, theme]) => ({
    key,
    name: theme.name,
    icon: theme.icon,
    colors: { bg: theme.bg, primary: theme.primary }
  }));
}
