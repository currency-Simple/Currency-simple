// ============================================
// 📊 STATISTICS MANAGER (Online)
// ============================================
import { supabase } from '../online/supabase-config.js';

export async function getPlayerStats(userId) {
  try {
    const { data: sessions } = await supabase.from('game_sessions').select('*').eq('user_id', userId);
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (!sessions || !profile) return null;
    const totalGames = sessions.length;
    const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return {
      totalGames,
      totalScore,
      avgScore: totalGames ? Math.floor(totalScore / totalGames) : 0,
      bestScore: profile.best_score || 0,
      totalPlayTime: totalDuration,
      avgPlayTime: totalGames ? Math.floor(totalDuration / totalGames) : 0,
      level: profile.level || 1,
      winRate: calculateWinRate(sessions, profile.best_score),
      perfectGames: sessions.filter(s => s.perfect).length,
      lastPlayed: sessions.length > 0 ? sessions[0].created_at : null
    };
  } catch (error) {
    console.error('Get player stats error:', error);
    return null;
  }
}

function calculateWinRate(sessions, bestScore) {
  if (!sessions || sessions.length === 0) return 0;
  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const wins = sessions.filter(s => s.score >= avgScore).length;
  return ((wins / sessions.length) * 100).toFixed(1);
}

export async function getGlobalStats() {
  try {
    const { data } = await supabase.from('profiles').select('best_score, total_games, level, total_score');
    if (!data || data.length === 0) return null;
    return {
      totalPlayers: data.length,
      totalGames: data.reduce((sum, p) => sum + (p.total_games || 0), 0),
      averageScore: Math.floor(data.reduce((sum, p) => sum + (p.best_score || 0), 0) / data.length),
      highestScore: Math.max(...data.map(p => p.best_score || 0)),
      averageLevel: Math.floor(data.reduce((sum, p) => sum + (p.level || 1), 0) / data.length),
      totalScore: data.reduce((sum, p) => sum + (p.total_score || 0), 0)
    };
  } catch (error) {
    console.error('Get global stats error:', error);
    return null;
  }
}

export async function getRecentGames(userId, limit = 10) {
  try {
    const { data, error } = await supabase.from('game_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (error) return { success: false, data: [] };
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
}
