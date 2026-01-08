// عمليات قاعدة البيانات باستخدام Supabase

const Database = {
  // جلب تقدم المستخدم
  async getUserProgress(userId) {
    try {
      // للضيوف، استخدم localStorage
      if (Auth.isGuest()) {
        return Utils.getLocalStorage('guest_progress') || {
          levels: [],
          total_score: 0,
          current_level: 1
        };
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('level_number', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }
  },

  // حفظ تقدم المرحلة
  async saveLevelProgress(userId, levelData) {
    try {
      // للضيوف، استخدم localStorage
      if (Auth.isGuest()) {
        let progress = Utils.getLocalStorage('guest_progress') || {
          levels: [],
          total_score: 0,
          current_level: 1
        };

        // تحديث أو إضافة المرحلة
        const existingIndex = progress.levels.findIndex(
          l => l.level_number === levelData.level_number
        );

        if (existingIndex >= 0) {
          // تحديث المرحلة الموجودة
          const existing = progress.levels[existingIndex];
          if (levelData.score > existing.score) {
            progress.levels[existingIndex] = { ...existing, ...levelData };
          }
        } else {
          progress.levels.push(levelData);
        }

        // تحديث المجموع
        progress.total_score = progress.levels.reduce((sum, l) => sum + (l.score || 0), 0);
        progress.current_level = Math.max(
          progress.current_level,
          levelData.level_number + (levelData.is_completed ? 1 : 0)
        );

        Utils.setLocalStorage('guest_progress', progress);
        return levelData;
      }

      // للمستخدمين المسجلين
      const progressData = {
        user_id: userId,
        level_number: levelData.level_number,
        is_completed: levelData.is_completed || false,
        stars: levelData.stars || 0,
        score: levelData.score || 0,
        completed_at: levelData.is_completed ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('user_progress')
        .upsert(progressData, { 
          onConflict: 'user_id,level_number',
          returning: 'representation'
        })
        .select()
        .single();

      if (error) throw error;

      // تحديث بيانات المستخدم
      await this.updateUserStats(userId);

      return data;
    } catch (error) {
      console.error('Error saving level progress:', error);
      throw error;
    }
  },

  // تحديث إحصائيات المستخدم
  async updateUserStats(userId) {
    try {
      if (Auth.isGuest()) return;

      // حساب المجموع والمستوى الحالي
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('score, level_number, is_completed')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      const totalScore = progressData.reduce((sum, p) => sum + (p.score || 0), 0);
      const completedLevels = progressData.filter(p => p.is_completed);
      const currentLevel = completedLevels.length > 0 
        ? Math.max(...completedLevels.map(p => p.level_number)) + 1 
        : 1;

      // تحديث جدول المستخدمين
      const { error: updateError } = await supabase
        .from('users')
        .update({
          total_score: totalScore,
          current_level: currentLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  },

  // جلب بيانات المستخدم
  async getUserData(userId) {
    try {
      if (Auth.isGuest()) {
        const guestUser = Utils.getLocalStorage('guest_user');
        const guestProgress = Utils.getLocalStorage('guest_progress') || {
          total_score: 0,
          current_level: 1
        };
        
        return {
          ...guestUser,
          ...guestProgress
        };
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  // جلب الإنجازات
  async getUserAchievements(userId) {
    try {
      if (Auth.isGuest()) {
        return Utils.getLocalStorage('guest_achievements') || [];
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },

  // إضافة إنجاز
  async unlockAchievement(userId, achievementId) {
    try {
      if (Auth.isGuest()) {
        let achievements = Utils.getLocalStorage('guest_achievements') || [];
        
        // التحقق من وجود الإنجاز
        if (achievements.some(a => a.achievement_id === achievementId)) {
          return null;
        }

        const newAchievement = {
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        };

        achievements.push(newAchievement);
        Utils.setLocalStorage('guest_achievements', achievements);
        return newAchievement;
      }

      const achievementData = {
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_achievements')
        .insert(achievementData)
        .select()
        .single();

      if (error) {
        // إذا كان الإنجاز موجود مسبقاً
        if (error.code === '23505') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return null;
    }
  },

  // التحقق من الإنجازات بعد إكمال مرحلة
  async checkAchievements(userId, levelNumber, stars, score) {
    try {
      const progress = await this.getUserProgress(userId);
      const completedLevels = progress.filter(p => p.is_completed).length;
      const unlockedAchievements = [];

      // إنجاز: إكمال 10 مراحل
      if (completedLevels >= 10) {
        const achievement = await this.unlockAchievement(userId, 'complete_10_levels');
        if (achievement) unlockedAchievements.push(achievement);
      }

      // إنجاز: إكمال 25 مرحلة
      if (completedLevels >= 25) {
        const achievement = await this.unlockAchievement(userId, 'complete_25_levels');
        if (achievement) unlockedAchievements.push(achievement);
      }

      // إنجاز: الحصول على 3 نجوم
      if (stars === 3) {
        const achievement = await this.unlockAchievement(userId, 'perfect_level');
        if (achievement) unlockedAchievements.push(achievement);
      }

      // إنجاز: جمع 1000 نقطة
      const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0);
      if (totalScore >= 1000) {
        const achievement = await this.unlockAchievement(userId, 'score_1000');
        if (achievement) unlockedAchievements.push(achievement);
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },

  // جلب لوحة الصدارة
  async getLeaderboard(limit = 10) {
    try {
      if (Auth.isGuest()) {
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select('username, avatar_url, total_score, current_level')
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // جلب بيانات مرحلة محددة
  async getLevelData(levelNumber) {
    try {
      const levels = await Utils.loadJSON(`${PATHS.DATA}levels.json`);
      return levels.find(l => l.level_number === levelNumber) || null;
    } catch (error) {
      console.error('Error loading level data:', error);
      throw error;
    }
  },

  // جلب جميع المراحل
  async getAllLevels() {
    try {
      return await Utils.loadJSON(`${PATHS.DATA}levels.json`);
    } catch (error) {
      console.error('Error loading all levels:', error);
      throw error;
    }
  },

  // جلب بيانات الإنجازات
  async getAchievementsData() {
    try {
      return await Utils.loadJSON(`${PATHS.DATA}achievements.json`);
    } catch (error) {
      console.error('Error loading achievements data:', error);
      return [];
    }
  }
};

// تصدير
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Database;
}