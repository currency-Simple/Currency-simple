// ============================================
// 💾 ONLINE SAVE MANAGER
// ============================================
// حفظ ومزامنة بيانات اللعبة السحابية

import { supabase } from './supabase-config.js';
import { getCurrentUser } from './auth-manager.js';

// 🎮 حفظ تقدم اللعبة
export async function saveGameProgress(gameData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    const saveData = {
      user_id: user.id,
      coins: gameData.coins || 0,
      best_score: gameData.bestScore || 0,
      total_balls: gameData.totalBalls || 1,
      unlocked_balls: gameData.unlockedBalls || [],
      unlocked_roads: gameData.unlockedRoads || [],
      current_ball: gameData.currentBall || 0,
      current_road: gameData.currentRoad || 0,
      settings: gameData.settings || {},
      achievements: gameData.achievements || [],
      statistics: gameData.statistics || {},
      last_save: new Date().toISOString()
    };

    const { error } = await supabase
      .from('game_saves')
      .upsert(saveData, { onConflict: 'user_id' });

    if (error) {
      console.error('Save error:', error);
      return { success: false, error: 'فشل الحفظ' };
    }

    // حفظ نسخة محلية احتياطية
    localStorage.setItem('game_backup', JSON.stringify(saveData));

    return { success: true, message: 'تم الحفظ بنجاح ✓' };

  } catch (error) {
    console.error('Save game error:', error);
    return { success: false, error: 'حدث خطأ في الحفظ' };
  }
}

// 📥 تحميل تقدم اللعبة
export async function loadGameProgress() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // تحميل من التخزين المحلي
      const backup = localStorage.getItem('game_backup');
      return backup ? JSON.parse(backup) : null;
    }

    const { data, error } = await supabase
      .from('game_saves')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Load error:', error);
      // محاولة التحميل من النسخة الاحتياطية
      const backup = localStorage.getItem('game_backup');
      return backup ? JSON.parse(backup) : null;
    }

    // حفظ نسخة محلية
    if (data) {
      localStorage.setItem('game_backup', JSON.stringify(data));
    }

    return data;

  } catch (error) {
    console.error('Load game error:', error);
    const backup = localStorage.getItem('game_backup');
    return backup ? JSON.parse(backup) : null;
  }
}

// 🔄 مزامنة تلقائية كل 30 ثانية
let autoSaveInterval = null;

export function startAutoSave(gameDataGetter, interval = 30000) {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }

  autoSaveInterval = setInterval(async () => {
    const gameData = gameDataGetter();
    const result = await saveGameProgress(gameData);
    
    if (result.success) {
      console.log('🔄 Auto-saved:', new Date().toLocaleTimeString('ar'));
    }
  }, interval);

  return () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
    }
  };
}

// 🛑 إيقاف الحفظ التلقائي
export function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// 📊 حفظ جلسة لعبة
export async function saveGameSession(sessionData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        score: sessionData.score,
        duration: sessionData.duration,
        balls_used: sessionData.ballsUsed,
        coins_earned: sessionData.coinsEarned,
        road_type: sessionData.roadType,
        ball_type: sessionData.ballType,
        created_at: new Date().toISOString()
      });

    return { success: !error };

  } catch (error) {
    console.error('Save session error:', error);
    return { success: false };
  }
}

// 📈 جلب تاريخ الجلسات
export async function getGameSessions(limit = 50) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: [] };

    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, data: [] };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Get sessions error:', error);
    return { success: false, data: [] };
  }
}

// 🔀 دمج البيانات (محلي + سحابي)
export async function mergeGameData(localData, cloudData) {
  const merged = {
    coins: Math.max(localData.coins || 0, cloudData.coins || 0),
    bestScore: Math.max(localData.bestScore || 0, cloudData.best_score || 0),
    totalBalls: Math.max(localData.totalBalls || 1, cloudData.total_balls || 1),
    unlockedBalls: [...new Set([
      ...(localData.unlockedBalls || []),
      ...(cloudData.unlocked_balls || [])
    ])],
    unlockedRoads: [...new Set([
      ...(localData.unlockedRoads || []),
      ...(cloudData.unlocked_roads || [])
    ])],
    achievements: [...new Set([
      ...(localData.achievements || []),
      ...(cloudData.achievements || [])
    ])],
    settings: { ...cloudData.settings, ...localData.settings },
    statistics: mergeStatistics(localData.statistics, cloudData.statistics)
  };

  return merged;
}

// 📊 دمج الإحصائيات
function mergeStatistics(local, cloud) {
  return {
    totalGames: (local?.totalGames || 0) + (cloud?.totalGames || 0),
    totalScore: (local?.totalScore || 0) + (cloud?.totalScore || 0),
    totalCoins: (local?.totalCoins || 0) + (cloud?.totalCoins || 0),
    playTime: (local?.playTime || 0) + (cloud?.playTime || 0)
  };
}

// 🗑️ حذف البيانات السحابية
export async function deleteCloudSave() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from('game_saves')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: 'فشل الحذف' };
    }

    return { success: true, message: 'تم حذف البيانات السحابية' };

  } catch (error) {
    console.error('Delete save error:', error);
    return { success: false, error: 'حدث خطأ في الحذف' };
  }
}

// 💾 تصدير البيانات
export async function exportGameData() {
  try {
    const data = await loadGameProgress();
    if (!data) return null;

    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      game_data: data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speedball3d_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, message: 'تم التصدير بنجاح' };

  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: 'فشل التصدير' };
  }
}

// 📤 استيراد البيانات
export async function importGameData(file) {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    if (!importData.game_data) {
      return { success: false, error: 'ملف غير صالح' };
    }

    const result = await saveGameProgress(importData.game_data);
    
    if (result.success) {
      return { success: true, message: 'تم الاستيراد بنجاح', data: importData.game_data };
    }

    return result;

  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: 'فشل الاستيراد' };
  }
}

// 🔍 التحقق من وجود بيانات سحابية
export async function hasCloudSave() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('game_saves')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    return !error && data !== null;

  } catch (error) {
    return false;
  }
}

// ✅ استخدام:
// import { saveGameProgress, loadGameProgress, startAutoSave } from './online-save.js';
// await saveGameProgress(gameData);
// const stopAuto = startAutoSave(() => gameData, 30000);
