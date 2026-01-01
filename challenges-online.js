// ============================================
// 🎯 DAILY CHALLENGES (Online)
// ============================================
import { supabase } from '../online/supabase-config.js';

export const DAILY_CHALLENGES = [
  { id: 1, name: 'سريع', description: 'احصل على 500 نقطة', goal: 500, type: 'score', reward: 50, icon: '⚡', difficulty: 'easy' },
  { id: 2, name: 'جامع', description: 'اجمع 100 عملة', goal: 100, type: 'coins', reward: 30, icon: '💰', difficulty: 'easy' },
  { id: 3, name: 'منجم', description: 'أكمل 10 ألعاب', goal: 10, type: 'games', reward: 40, icon: '🎮', difficulty: 'medium' },
  { id: 4, name: 'ماهر', description: 'تجنب 50 عائق', goal: 50, type: 'obstacles', reward: 35, icon: '🚧', difficulty: 'medium' },
  { id: 5, name: 'صبور', description: 'العب لمدة 5 دقائق', goal: 300, type: 'time', reward: 25, icon: '⏱️', difficulty: 'easy' },
  { id: 6, name: 'خبير', description: 'احصل على 1000 نقطة', goal: 1000, type: 'score', reward: 100, icon: '🏆', difficulty: 'hard' },
  { id: 7, name: 'مثالي', description: 'أكمل لعبة مثالية', goal: 1, type: 'perfect', reward: 75, icon: '✨', difficulty: 'hard' }
];

export async function getDailyChallenge(userId) {
  const today = new Date().toDateString();
  const dayIndex = new Date().getDay();
  const challenge = DAILY_CHALLENGES[dayIndex % DAILY_CHALLENGES.length];
  const { data } = await supabase.from('daily_challenge_progress').select('*').eq('user_id', userId).eq('challenge_date', today).single();
  return { challenge, progress: data?.progress || 0, completed: data?.completed || false, claimed: data?.reward_claimed || false };
}

export async function updateChallengeProgress(userId, type, value) {
  const today = new Date().toDateString();
  const current = await getDailyChallenge(userId);
  if (current.challenge.type === type) {
    const newProgress = Math.min(current.progress + value, current.challenge.goal);
    const completed = newProgress >= current.challenge.goal;
    await supabase.from('daily_challenge_progress').upsert({ user_id: userId, challenge_date: today, challenge_id: current.challenge.id, progress: newProgress, completed, updated_at: new Date().toISOString() });
    return { progress: newProgress, completed };
  }
  return current;
}

export async function claimChallengeReward(userId) {
  const today = new Date().toDateString();
  const current = await getDailyChallenge(userId);
  if (!current.completed || current.claimed) return { success: false, error: 'التحدي غير مكتمل أو تم المطالبة بالمكافأة' };
  await supabase.from('daily_challenge_progress').update({ reward_claimed: true }).eq('user_id', userId).eq('challenge_date', today);
  return { success: true, reward: current.challenge.reward, message: `حصلت على ${current.challenge.reward} عملة! 🎉` };
}
