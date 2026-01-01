// ============================================
// 🏆 ACHIEVEMENTS SYSTEM (Online)
// ============================================
import { supabase } from '../online/supabase-config.js';
import { getCurrentUser } from '../online/auth-manager.js';

export const ACHIEVEMENTS = [
  { id: 1, name: 'البداية', description: 'لعب أول لعبة', icon: '🎮', points: 10, requirement: { type: 'games', value: 1 }, rarity: 'common' },
  { id: 2, name: 'المبتدئ', description: 'احصل على 50 نقطة', icon: '⭐', points: 20, requirement: { type: 'score', value: 50 }, rarity: 'common' },
  { id: 3, name: 'المحترف', description: 'احصل على 500 نقطة', icon: '🔥', points: 50, requirement: { type: 'score', value: 500 }, rarity: 'rare' },
  { id: 4, name: 'الخبير', description: 'احصل على 1000 نقطة', icon: '💎', points: 100, requirement: { type: 'score', value: 1000 }, rarity: 'epic' },
  { id: 5, name: 'الأسطورة', description: 'احصل على 5000 نقطة', icon: '👑', points: 200, requirement: { type: 'score', value: 5000 }, rarity: 'legendary' },
  { id: 6, name: 'جامع العملات', description: 'اجمع 1000 عملة', icon: '💰', points: 50, requirement: { type: 'coins', value: 1000 }, rarity: 'rare' },
  { id: 7, name: 'ماراثون', description: 'العب 100 لعبة', icon: '🏃', points: 100, requirement: { type: 'games', value: 100 }, rarity: 'epic' },
  { id: 8, name: 'مثابر', description: 'سلسلة 7 أيام', icon: '📅', points: 75, requirement: { type: 'streak', value: 7 }, rarity: 'rare' },
  { id: 9, name: 'جامع الكرات', description: 'افتح جميع الكرات', icon: '⚽', points: 150, requirement: { type: 'balls', value: 'all' }, rarity: 'epic' },
  { id: 10, name: 'مستكشف الطرق', description: 'افتح جميع الطرق', icon: '🛣️', points: 150, requirement: { type: 'roads', value: 'all' }, rarity: 'epic' }
];

export async function unlockAchievement(userId, achievementId) {
  try {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return { success: false, error: 'الإنجاز غير موجود' };
    const { error } = await supabase.from('user_achievements').insert({ user_id: userId, achievement_id: achievementId, unlocked_at: new Date().toISOString() });
    if (error) {
      if (error.code === '23505') return { success: false, error: 'الإنجاز مفتوح بالفعل' };
      return { success: false, error: 'فشل فتح الإنجاز' };
    }
    return { success: true, achievement, message: `إنجاز جديد: ${achievement.name}! ${achievement.icon}`, points: achievement.points };
  } catch (error) {
    return { success: false, error: 'حدث خطأ' };
  }
}

export async function getUserAchievements(userId) {
  try {
    const { data, error } = await supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', userId);
    if (error) return { success: false, data: [] };
    const achievementsWithDetails = data.map(ua => ({ ...ACHIEVEMENTS.find(a => a.id === ua.achievement_id), unlockedAt: ua.unlocked_at }));
    return { success: true, data: achievementsWithDetails };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function checkAchievements(userId, gameData) {
  const toUnlock = [];
  for (const achievement of ACHIEVEMENTS) {
    const { type, value } = achievement.requirement;
    let met = false;
    switch (type) {
      case 'games': met = gameData.totalGames >= value; break;
      case 'score': met = gameData.bestScore >= value; break;
      case 'coins': met = gameData.coins >= value; break;
      case 'streak': met = gameData.dailyChallengeStreak >= value; break;
      case 'balls': met = gameData.unlockedBalls.length >= (value === 'all' ? 5 : value); break;
      case 'roads': met = gameData.unlockedRoads.length >= (value === 'all' ? 6 : value); break;
    }
    if (met && !gameData.achievements.includes(achievement.id)) {
      const result = await unlockAchievement(userId, achievement.id);
      if (result.success) toUnlock.push(achievement);
    }
  }
  return toUnlock;
}
