// ============================================
// 💾 GAME DATA MANAGER (Online)
// ============================================
// إدارة بيانات اللعبة مع المزامنة السحابية

import { supabase } from '../online/supabase-config.js';
import { getCurrentUser } from '../online/auth-manager.js';
import { saveGameProgress, loadGameProgress } from '../online/online-save.js';
import { CoinManager } from './coins.js';
import { BALLS } from './balls.js';
import { ROADS } from './roads.js';

// 🎮 مدير بيانات اللعبة
export class GameDataManager {
  constructor() {
    this.data = this.getDefaultData();
    this.userId = null;
    this.coinManager = new CoinManager();
    this.isDirty = false; // هل هناك تغييرات غير محفوظة
    this.lastSaveTime = null;
  }

  // 📋 البيانات الافتراضية
  getDefaultData() {
    return {
      // العملات
      coins: 100, // عملات ترحيبية
      
      // النقاط
      bestScore: 0,
      totalScore: 0,
      currentScore: 0,
      
      // الألعاب
      totalGames: 0,
      gamesWon: 0,
      gamesLost: 0,
      
      // الكرات
      unlockedBalls: [0], // الكرة الافتراضية مفتوحة
      currentBall: 0,
      favoriteBall: 0,
      
      // الطرق
      unlockedRoads: [0], // الطريق الافتراضي مفتوح
      currentRoad: 0,
      favoriteRoad: 0,
      
      // الإعدادات
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        difficulty: 'medium',
        language: 'ar',
        theme: 'dark'
      },
      
      // الإحصائيات
      statistics: {
        playTime: 0, // بالثواني
        longestSession: 0,
        totalCoinsCollected: 0,
        totalObstaclesAvoided: 0,
        perfectGames: 0,
        comboRecord: 0
      },
      
      // الإنجازات
      achievements: [],
      
      // التحديات
      completedChallenges: [],
      dailyChallengeStreak: 0,
      lastChallengeDate: null,
      
      // معلومات الحفظ
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 🔄 تحميل البيانات
  async load(userId) {
    try {
      this.userId = userId;

      if (!userId) {
        // تحميل من التخزين المحلي
        const localData = localStorage.getItem('game_data_local');
        if (localData) {
          this.data = { ...this.data, ...JSON.parse(localData) };
        }
        return { success: true, source: 'local' };
      }

      // تحميل من السحابة
      const cloudData = await loadGameProgress();

      if (cloudData) {
        // دمج البيانات السحابية مع الافتراضية
        this.data = this.mergeData(this.data, cloudData);
        
        // تحميل رصيد العملات
        await this.coinManager.load(userId);
        this.data.coins = this.coinManager.getBalance();

        this.lastSaveTime = new Date();

        return { 
          success: true, 
          source: 'cloud',
          data: this.data 
        };
      } else {
        // إنشاء بيانات جديدة في السحابة
        await this.save();
        return { success: true, source: 'new' };
      }

    } catch (error) {
      console.error('Load game data error:', error);
      
      // محاولة التحميل من النسخة الاحتياطية
      const backup = localStorage.getItem('game_data_backup');
      if (backup) {
        this.data = JSON.parse(backup);
        return { success: true, source: 'backup' };
      }

      return { success: false, error: 'فشل تحميل البيانات' };
    }
  }

  // 💾 حفظ البيانات
  async save(force = false) {
    try {
      // التحقق من وجود تغييرات
      if (!force && !this.isDirty) {
        return { success: true, message: 'لا توجد تغييرات للحفظ' };
      }

      this.data.updatedAt = new Date().toISOString();

      // حفظ محلياً أولاً
      localStorage.setItem('game_data_backup', JSON.stringify(this.data));

      // حفظ في السحابة
      if (this.userId) {
        const result = await saveGameProgress(this.data);
        
        if (result.success) {
          // حفظ رصيد العملات
          await this.coinManager.save();
          
          this.isDirty = false;
          this.lastSaveTime = new Date();

          return { 
            success: true, 
            message: 'تم الحفظ بنجاح',
            timestamp: this.lastSaveTime
          };
        } else {
          return result;
        }
      } else {
        // حفظ محلي فقط
        localStorage.setItem('game_data_local', JSON.stringify(this.data));
        this.isDirty = false;
        
        return { 
          success: true, 
          message: 'تم الحفظ محلياً',
          note: 'سجل دخول للحفظ في السحابة'
        };
      }

    } catch (error) {
      console.error('Save game data error:', error);
      return { success: false, error: 'فشل الحفظ' };
    }
  }

  // 🔀 دمج البيانات
  mergeData(defaultData, cloudData) {
    return {
      ...defaultData,
      ...cloudData,
      // التأكد من عدم فقدان البيانات المهمة
      coins: Math.max(defaultData.coins || 0, cloudData.coins || 0),
      bestScore: Math.max(defaultData.bestScore || 0, cloudData.best_score || 0),
      totalScore: Math.max(defaultData.totalScore || 0, cloudData.total_score || 0),
      unlockedBalls: [...new Set([
        ...(defaultData.unlockedBalls || [0]),
        ...(cloudData.unlocked_balls || [0])
      ])],
      unlockedRoads: [...new Set([
        ...(defaultData.unlockedRoads || [0]),
        ...(cloudData.unlocked_roads || [0])
      ])],
      achievements: [...new Set([
        ...(defaultData.achievements || []),
        ...(cloudData.achievements || [])
      ])],
      settings: {
        ...defaultData.settings,
        ...(cloudData.settings || {})
      },
      statistics: {
        ...defaultData.statistics,
        ...(cloudData.statistics || {})
      }
    };
  }

  // 🎮 تحديث بعد اللعبة
  async updateAfterGame(gameResult) {
    try {
      const { score, duration, coinsEarned, obstaclesAvoided, isPerfect } = gameResult;

      // تحديث النقاط
      this.data.currentScore = score;
      if (score > this.data.bestScore) {
        this.data.bestScore = score;
      }
      this.data.totalScore += score;

      // تحديث عدد الألعاب
      this.data.totalGames++;
      if (score > 0) {
        this.data.gamesWon++;
      } else {
        this.data.gamesLost++;
      }

      // تحديث العملات
      if (coinsEarned > 0) {
        await this.coinManager.add(coinsEarned, 'GAME_SCORE', { score });
        this.data.coins = this.coinManager.getBalance();
      }

      // تحديث الإحصائيات
      this.data.statistics.playTime += duration;
      this.data.statistics.longestSession = Math.max(
        this.data.statistics.longestSession,
        duration
      );
      this.data.statistics.totalCoinsCollected += coinsEarned;
      this.data.statistics.totalObstaclesAvoided += obstaclesAvoided || 0;
      
      if (isPerfect) {
        this.data.statistics.perfectGames++;
      }

      this.markDirty();
      await this.save();

      return { success: true, data: this.data };

    } catch (error) {
      console.error('Update after game error:', error);
      return { success: false, error: 'فشل تحديث البيانات' };
    }
  }

  // ⚽ فتح كرة جديدة
  async unlockBall(ballId) {
    try {
      const ball = BALLS.find(b => b.id === ballId);
      
      if (!ball) {
        return { success: false, error: 'الكرة غير موجودة' };
      }

      if (this.data.unlockedBalls.includes(ballId)) {
        return { success: false, error: 'الكرة مفتوحة بالفعل' };
      }

      // التحقق من العملات
      const result = await this.coinManager.spend(ball.price, `فتح ${ball.name}`);
      
      if (!result.success) {
        return result;
      }

      // فتح الكرة
      this.data.unlockedBalls.push(ballId);
      this.data.coins = this.coinManager.getBalance();
      
      this.markDirty();
      await this.save();

      return {
        success: true,
        ball,
        message: `تم فتح ${ball.name}! 🎉`,
        coinsRemaining: this.data.coins
      };

    } catch (error) {
      console.error('Unlock ball error:', error);
      return { success: false, error: 'فشل فتح الكرة' };
    }
  }

  // 🛣️ فتح طريق جديد
  async unlockRoad(roadId) {
    try {
      const road = ROADS.find(r => r.id === roadId);
      
      if (!road) {
        return { success: false, error: 'الطريق غير موجود' };
      }

      if (this.data.unlockedRoads.includes(roadId)) {
        return { success: false, error: 'الطريق مفتوح بالفعل' };
      }

      // التحقق من العملات
      const result = await this.coinManager.spend(road.price, `فتح ${road.name}`);
      
      if (!result.success) {
        return result;
      }

      // فتح الطريق
      this.data.unlockedRoads.push(roadId);
      this.data.coins = this.coinManager.getBalance();
      
      this.markDirty();
      await this.save();

      return {
        success: true,
        road,
        message: `تم فتح ${road.name}! 🎉`,
        coinsRemaining: this.data.coins
      };

    } catch (error) {
      console.error('Unlock road error:', error);
      return { success: false, error: 'فشل فتح الطريق' };
    }
  }

  // ⚙️ تحديث الإعدادات
  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.markDirty();
    return this.data.settings;
  }

  // 🏆 إضافة إنجاز
  addAchievement(achievementId) {
    if (!this.data.achievements.includes(achievementId)) {
      this.data.achievements.push(achievementId);
      this.markDirty();
      return true;
    }
    return false;
  }

  // 📊 الحصول على البيانات
  getData() {
    return { ...this.data };
  }

  // 🔄 وضع علامة على التغييرات
  markDirty() {
    this.isDirty = true;
  }

  // 🧹 إعادة تعيين البيانات
  async reset() {
    this.data = this.getDefaultData();
    this.coinManager.reset();
    this.isDirty = true;
    await this.save(true);
    
    return { success: true, message: 'تم إعادة تعيين البيانات' };
  }

  // 📤 تصدير البيانات
  exportData() {
    return {
      version: this.data.version,
      exportedAt: new Date().toISOString(),
      gameData: this.data
    };
  }

  // 📥 استيراد البيانات
  async importData(importedData) {
    try {
      if (!importedData.gameData) {
        return { success: false, error: 'بيانات غير صالحة' };
      }

      this.data = this.mergeData(this.data, importedData.gameData);
      this.markDirty();
      await this.save(true);

      return { success: true, message: 'تم الاستيراد بنجاح' };

    } catch (error) {
      console.error('Import data error:', error);
      return { success: false, error: 'فشل الاستيراد' };
    }
  }
}

// 📊 الحصول على إحصائيات سريعة
export function getQuickStats(gameData) {
  return {
    level: Math.floor(gameData.totalScore / 1000) + 1,
    winRate: gameData.totalGames > 0 
      ? ((gameData.gamesWon / gameData.totalGames) * 100).toFixed(1) 
      : 0,
    avgScore: gameData.totalGames > 0 
      ? Math.floor(gameData.totalScore / gameData.totalGames) 
      : 0,
    playTimeHours: (gameData.statistics.playTime / 3600).toFixed(1)
  };
}

// ✅ استخدام:
// import { GameDataManager } from './game-data-online.js';
// 
// const gameData = new GameDataManager();
// await gameData.load(userId);
// await gameData.updateAfterGame({ score: 150, duration: 60, coinsEarned: 15 });
