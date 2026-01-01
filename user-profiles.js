// ============================================
// 👤 USER PROFILES MANAGER
// ============================================
// إدارة الملفات الشخصية للاعبين

import { supabase } from './supabase-config.js';
import { getCurrentUser } from './auth-manager.js';

// 📝 إنشاء/تحديث الملف الشخصي
export async function updateProfile(profileData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول' };
    }

    // التحقق من تفرد اسم المستخدم
    if (profileData.username) {
      const isUnique = await checkUsernameUnique(profileData.username, user.id);
      if (!isUnique) {
        return { success: false, error: 'اسم المستخدم محجوز بالفعل' };
      }
    }

    const updateData = {
      user_id: user.id,
      username: profileData.username,
      bio: profileData.bio || null,
      avatar_url: profileData.avatarUrl || null,
      country_code: profileData.countryCode || null,
      favorite_ball: profileData.favoriteBall || null,
      favorite_road: profileData.favoriteRoad || null,
      theme_preference: profileData.themePreference || 'dark',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(updateData, { onConflict: 'user_id' });

    if (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'فشل تحديث الملف الشخصي' };
    }

    return { success: true, message: 'تم التحديث بنجاح ✓' };

  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'حدث خطأ في التحديث' };
  }
}

// 🔍 التحقق من تفرد اسم المستخدم
async function checkUsernameUnique(username, currentUserId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .neq('user_id', currentUserId)
      .single();

    // إذا لم نجد نتيجة، فالاسم متاح
    return error !== null || data === null;

  } catch (error) {
    console.error('Check username error:', error);
    return false;
  }
}

// 📖 جلب الملف الشخصي
export async function getProfile(userId = null) {
  try {
    const targetUserId = userId || (await getCurrentUser())?.id;
    
    if (!targetUserId) {
      return { success: false, data: null, error: 'لا يوجد مستخدم' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return { success: false, data: null, error: 'فشل جلب الملف' };
    }

    // إضافة بيانات محسوبة
    const enrichedProfile = {
      ...data,
      level_progress: calculateLevelProgress(data.total_score),
      rank_badge: getRankBadge(data.level),
      completion_percentage: calculateCompletion(data)
    };

    return { success: true, data: enrichedProfile, error: null };

  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, data: null, error: 'حدث خطأ' };
  }
}

// 🔍 البحث عن لاعبين
export async function searchPlayers(query, limit = 20) {
  try {
    if (!query || query.length < 2) {
      return { success: false, data: [], error: 'أدخل حرفين على الأقل' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, country_code, level, best_score')
      .ilike('username', `%${query}%`)
      .order('best_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      return { success: false, data: [], error: 'فشل البحث' };
    }

    return { success: true, data, error: null };

  } catch (error) {
    console.error('Search players error:', error);
    return { success: false, data: [], error: 'حدث خطأ في البحث' };
  }
}

// 👥 جلب ملفات متعددة
export async function getMultipleProfiles(userIds) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);

    if (error) {
      return { success: false, data: [] };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Get multiple profiles error:', error);
    return { success: false, data: [] };
  }
}

// 📊 حساب تقدم المستوى
function calculateLevelProgress(totalScore) {
  const currentLevelScore = totalScore % 1000;
  const percentage = (currentLevelScore / 1000) * 100;
  const nextLevel = Math.floor(totalScore / 1000) + 2;
  
  return {
    current: currentLevelScore,
    needed: 1000,
    percentage: percentage.toFixed(1),
    nextLevel
  };
}

// 🏅 الحصول على شارة المستوى
function getRankBadge(level) {
  if (level >= 100) return { emoji: '👑', name: 'أسطوري', color: '#FFD700' };
  if (level >= 75) return { emoji: '💎', name: 'ماسي', color: '#B9F2FF' };
  if (level >= 50) return { emoji: '🔥', name: 'محترف', color: '#FF6B6B' };
  if (level >= 25) return { emoji: '⭐', name: 'خبير', color: '#FFE66D' };
  if (level >= 10) return { emoji: '🎯', name: 'متقدم', color: '#4ECDC4' };
  return { emoji: '🌟', name: 'مبتدئ', color: '#95E1D3' };
}

// 📈 حساب نسبة الإكمال
function calculateCompletion(profile) {
  const factors = {
    hasAvatar: profile.avatar_url ? 20 : 0,
    hasCountry: profile.country_code ? 15 : 0,
    hasBio: profile.bio ? 10 : 0,
    gamesPlayed: Math.min((profile.total_games || 0) / 10 * 20, 20),
    levelProgress: Math.min((profile.level || 1) / 50 * 35, 35)
  };

  const total = Object.values(factors).reduce((sum, val) => sum + val, 0);
  return Math.min(Math.round(total), 100);
}

// 🔗 إنشاء رابط للملف الشخصي
export function getProfileShareLink(username) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/profile/${encodeURIComponent(username)}`;
}

// 📸 توليد QR Code للملف الشخصي
export async function generateProfileQR(username) {
  const link = getProfileShareLink(username);
  // يمكن استخدام مكتبة QR code هنا
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
}

// 📊 إحصائيات الملف الشخصي
export async function getProfileStats(userId) {
  try {
    const { data: profile } = await getProfile(userId);
    if (!profile) return null;

    // جلب آخر 10 جلسات
    const { data: recentSessions } = await supabase
      .from('game_sessions')
      .select('score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // حساب الإحصائيات
    const stats = {
      averageScore: profile.data.avg_score || 0,
      bestScore: profile.data.best_score || 0,
      totalGames: profile.data.total_games || 0,
      totalScore: profile.data.total_score || 0,
      level: profile.data.level || 1,
      winRate: calculateWinRate(recentSessions),
      recentForm: calculateRecentForm(recentSessions),
      playStreak: await calculateStreak(userId)
    };

    return stats;

  } catch (error) {
    console.error('Get stats error:', error);
    return null;
  }
}

// 📈 حساب نسبة الفوز
function calculateWinRate(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  
  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const wins = sessions.filter(s => s.score > avgScore).length;
  
  return ((wins / sessions.length) * 100).toFixed(1);
}

// 🔥 حساب الأداء الأخير
function calculateRecentForm(sessions) {
  if (!sessions || sessions.length < 2) return 'جديد';
  
  const recentAvg = sessions.slice(0, 5).reduce((sum, s) => sum + s.score, 0) / 5;
  const olderAvg = sessions.slice(5).reduce((sum, s) => sum + s.score, 0) / sessions.slice(5).length;
  
  const improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (improvement > 20) return 'ممتاز 🔥';
  if (improvement > 0) return 'جيد 📈';
  if (improvement > -20) return 'متوسط ➡️';
  return 'يحتاج تحسين 📉';
}

// 📅 حساب سلسلة اللعب اليومية
async function calculateStreak(userId) {
  try {
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!sessions || sessions.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(sessions[0].created_at);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].created_at);
      sessionDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
        currentDate = sessionDate;
      } else if (dayDiff > 1) {
        break;
      }
    }

    return streak;

  } catch (error) {
    console.error('Calculate streak error:', error);
    return 0;
  }
}

// 🎨 تحديث الثيم المفضل
export async function updateThemePreference(theme) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from('profiles')
      .update({ theme_preference: theme })
      .eq('user_id', user.id);

    return { success: !error };

  } catch (error) {
    console.error('Update theme error:', error);
    return { success: false };
  }
}

// ✅ استخدام:
// import { updateProfile, getProfile, searchPlayers } from './user-profiles.js';
// await updateProfile({ username: 'ProGamer', countryCode: 'SA' });
