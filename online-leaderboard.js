// ============================================
// 🏆 ONLINE LEADERBOARD
// ============================================
// لوحة المتصدرين العالمية مع تحديثات مباشرة

import { supabase } from './supabase-config.js';
import { getCurrentUser } from './auth-manager.js';

// 📊 جلب أفضل 100 لاعب عالمياً
export async function getGlobalLeaderboard(limit = 100) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        username,
        avatar_url,
        country_code,
        best_score,
        total_score,
        total_games,
        level,
        updated_at
      `)
      .order('best_score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Leaderboard error:', error);
      return { success: false, data: [], error: 'فشل جلب البيانات' };
    }
    
    // إضافة الترتيب
    const leaderboard = data.map((player, index) => ({
      ...player,
      rank: index + 1,
      medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
    }));
    
    return { success: true, data: leaderboard, error: null };
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    return { success: false, data: [], error: 'حدث خطأ غير متوقع' };
  }
}

// 🔍 جلب ترتيب لاعب محدد
export async function getPlayerRank(userId) {
  try {
    // جلب جميع اللاعبين مرتبين
    const { data: allPlayers, error } = await supabase
      .from('profiles')
      .select('user_id, best_score')
      .order('best_score', { ascending: false });
    
    if (error) {
      console.error('Rank error:', error);
      return { rank: 0, totalPlayers: 0 };
    }
    
    // إيجاد ترتيب اللاعب
    const rank = allPlayers.findIndex(p => p.user_id === userId) + 1;
    
    return {
      rank: rank || 0,
      totalPlayers: allPlayers.length,
      percentage: rank ? ((1 - rank / allPlayers.length) * 100).toFixed(1) : 0
    };
    
  } catch (error) {
    console.error('Rank error:', error);
    return { rank: 0, totalPlayers: 0, percentage: 0 };
  }
}

// 🌍 جلب أفضل لاعبين من دولة معينة
export async function getCountryLeaderboard(countryCode, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('country_code', countryCode)
      .order('best_score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Country leaderboard error:', error);
      return { success: false, data: [], error: 'فشل جلب البيانات' };
    }
    
    const leaderboard = data.map((player, index) => ({
      ...player,
      rank: index + 1
    }));
    
    return { success: true, data: leaderboard, error: null };
    
  } catch (error) {
    console.error('Country leaderboard error:', error);
    return { success: false, data: [], error: 'حدث خطأ غير متوقع' };
  }
}

// 👥 جلب أصدقاء اللاعب (أعلى 20 لاعب قريب منه)
export async function getNearbyPlayers(userId, range = 10) {
  try {
    // جلب نقاط اللاعب الحالي
    const { data: currentPlayer } = await supabase
      .from('profiles')
      .select('best_score')
      .eq('user_id', userId)
      .single();
    
    if (!currentPlayer) {
      return { success: false, data: [] };
    }
    
    const score = currentPlayer.best_score;
    
    // جلب اللاعبين القريبين
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .gte('best_score', score - 50)
      .lte('best_score', score + 50)
      .order('best_score', { ascending: false })
      .limit(range * 2);
    
    if (error) {
      return { success: false, data: [] };
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error('Nearby players error:', error);
    return { success: false, data: [] };
  }
}

// 📈 تحديث نقاط اللاعب في اللوحة
export async function updateLeaderboardScore(userId, newScore, gameData = {}) {
  try {
    // جلب البيانات الحالية
    const { data: currentData } = await supabase
      .from('profiles')
      .select('best_score, total_score, total_games, level')
      .eq('user_id', userId)
      .single();
    
    if (!currentData) {
      return { success: false, error: 'ملف اللاعب غير موجود' };
    }
    
    // حساب البيانات الجديدة
    const bestScore = Math.max(currentData.best_score || 0, newScore);
    const totalScore = (currentData.total_score || 0) + newScore;
    const totalGames = (currentData.total_games || 0) + 1;
    const avgScore = Math.floor(totalScore / totalGames);
    
    // حساب المستوى (كل 1000 نقطة = مستوى)
    const newLevel = Math.floor(totalScore / 1000) + 1;
    
    // تحديث البيانات
    const { error } = await supabase
      .from('profiles')
      .update({
        best_score: bestScore,
        total_score: totalScore,
        total_games: totalGames,
        level: newLevel,
        last_score: newScore,
        avg_score: avgScore,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Update score error:', error);
      return { success: false, error: 'فشل تحديث النقاط' };
    }
    
    // التحقق من تحطيم الرقم القياسي
    const isNewRecord = newScore > (currentData.best_score || 0);
    
    // حساب الترتيب الجديد
    const rankData = await getPlayerRank(userId);
    
    return { 
      success: true, 
      isNewRecord,
      bestScore,
      rank: rankData.rank,
      levelUp: newLevel > (currentData.level || 1),
      newLevel
    };
    
  } catch (error) {
    console.error('Update leaderboard error:', error);
    return { success: false, error: 'حدث خطأ في التحديث' };
  }
}

// 🔥 جلب أفضل سجلات اليوم
export async function getDailyLeaders(limit = 10) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        score,
        user_id,
        created_at,
        profiles (username, avatar_url, country_code)
      `)
      .gte('created_at', today.toISOString())
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) {
      return { success: false, data: [] };
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error('Daily leaders error:', error);
    return { success: false, data: [] };
  }
}

// 📊 إحصائيات اللوحة العامة
export async function getLeaderboardStats() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('best_score, total_games, level');
    
    if (error || !data || data.length === 0) {
      return {
        totalPlayers: 0,
        averageScore: 0,
        totalGames: 0,
        highestScore: 0
      };
    }
    
    const stats = {
      totalPlayers: data.length,
      averageScore: Math.floor(
        data.reduce((sum, p) => sum + (p.best_score || 0), 0) / data.length
      ),
      totalGames: data.reduce((sum, p) => sum + (p.total_games || 0), 0),
      highestScore: Math.max(...data.map(p => p.best_score || 0)),
      averageLevel: Math.floor(
        data.reduce((sum, p) => sum + (p.level || 1), 0) / data.length
      )
    };
    
    return stats;
    
  } catch (error) {
    console.error('Stats error:', error);
    return {
      totalPlayers: 0,
      averageScore: 0,
      totalGames: 0,
      highestScore: 0
    };
  }
}

// 🔔 الاشتراك في التحديثات المباشرة
export function subscribeToLeaderboard(callback) {
  const channel = supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles'
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}

// 🎨 تنسيق بيانات العرض
export function formatLeaderboardEntry(player, currentUserId = null) {
  return {
    ...player,
    isCurrentUser: player.user_id === currentUserId,
    displayName: player.username || 'لاعب مجهول',
    flag: player.country_code ? getCountryFlag(player.country_code) : '🌍',
    scoreFormatted: player.best_score?.toLocaleString('ar') || '0',
    levelBadge: `⭐ ${player.level || 1}`,
    lastActive: formatTimeAgo(player.updated_at)
  };
}

// 🚩 الحصول على علم الدولة
function getCountryFlag(countryCode) {
  const flags = {
    'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬', 'IQ': '🇮🇶',
    'JO': '🇯🇴', 'KW': '🇰🇼', 'LB': '🇱🇧', 'MA': '🇲🇦',
    'OM': '🇴🇲', 'PS': '🇵🇸', 'QA': '🇶🇦', 'SD': '🇸🇩',
    'SY': '🇸🇾', 'TN': '🇹🇳', 'YE': '🇾🇪'
  };
  return flags[countryCode] || '🌍';
}

// ⏰ تنسيق الوقت
function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'الآن';
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  return `منذ ${Math.floor(seconds / 86400)} يوم`;
}

// ✅ استخدام:
// import { getGlobalLeaderboard, updateLeaderboardScore } from './online-leaderboard.js';
// const { data } = await getGlobalLeaderboard(100);
