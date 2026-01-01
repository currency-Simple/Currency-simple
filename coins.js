// ============================================
// 💰 COINS MANAGER
// ============================================
// إدارة نظام العملات والمعاملات

import { supabase } from '../online/supabase-config.js';
import { getCurrentUser } from '../online/auth-manager.js';

// 💎 فئات العملات
export const COIN_TYPES = {
  BRONZE: { value: 1, color: '#CD7F32', emoji: '🪙' },
  SILVER: { value: 5, color: '#C0C0C0', emoji: '💿' },
  GOLD: { value: 10, color: '#FFD700', emoji: '💰' },
  DIAMOND: { value: 50, color: '#B9F2FF', emoji: '💎' }
};

// 🎯 مصادر الحصول على العملات
export const COIN_SOURCES = {
  GAME_SCORE: 'من النقاط',
  DAILY_REWARD: 'مكافأة يومية',
  ACHIEVEMENT: 'إنجاز',
  CHALLENGE: 'تحدي',
  PURCHASE: 'شراء',
  GIFT: 'هدية',
  BONUS: 'مكافأة'
};

// 💰 مدير العملات
export class CoinManager {
  constructor() {
    this.balance = 0;
    this.totalEarned = 0;
    this.totalSpent = 0;
    this.history = [];
    this.userId = null;
  }

  // 🔄 تحميل الرصيد
  async load(userId) {
    try {
      this.userId = userId;

      const { data, error } = await supabase
        .from('game_saves')
        .select('coins, total_coins_earned, total_coins_spent')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Load coins error:', error);
        return false;
      }

      if (data) {
        this.balance = data.coins || 0;
        this.totalEarned = data.total_coins_earned || 0;
        this.totalSpent = data.total_coins_spent || 0;
      }

      return true;

    } catch (error) {
      console.error('Load coins error:', error);
      return false;
    }
  }

  // 💾 حفظ الرصيد
  async save() {
    try {
      if (!this.userId) {
        console.error('No user ID for saving coins');
        return false;
      }

      const { error } = await supabase
        .from('game_saves')
        .upsert({
          user_id: this.userId,
          coins: this.balance,
          total_coins_earned: this.totalEarned,
          total_coins_spent: this.totalSpent,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Save coins error:', error);
        return false;
      }

      // حفظ نسخة احتياطية محلية
      localStorage.setItem('coins_backup', JSON.stringify({
        balance: this.balance,
        totalEarned: this.totalEarned,
        totalSpent: this.totalSpent
      }));

      return true;

    } catch (error) {
      console.error('Save coins error:', error);
      return false;
    }
  }

  // ➕ إضافة عملات
  async add(amount, source = COIN_SOURCES.GAME_SCORE, metadata = {}) {
    try {
      if (amount <= 0) {
        return { success: false, error: 'الكمية يجب أن تكون أكبر من صفر' };
      }

      this.balance += amount;
      this.totalEarned += amount;

      // إضافة للسجل
      this.history.push({
        type: 'earn',
        amount,
        source,
        balance: this.balance,
        timestamp: new Date().toISOString(),
        metadata
      });

      // حفظ التغييرات
      await this.save();

      // تسجيل المعاملة
      await this.logTransaction('earn', amount, source, metadata);

      return {
        success: true,
        amount,
        newBalance: this.balance,
        message: `حصلت على ${amount} عملة! 💰`
      };

    } catch (error) {
      console.error('Add coins error:', error);
      return { success: false, error: 'فشل إضافة العملات' };
    }
  }

  // ➖ إنفاق عملات
  async spend(amount, purpose, metadata = {}) {
    try {
      if (amount <= 0) {
        return { success: false, error: 'الكمية يجب أن تكون أكبر من صفر' };
      }

      if (this.balance < amount) {
        return {
          success: false,
          error: `عملات غير كافية. تحتاج ${amount - this.balance} عملة إضافية`,
          needed: amount - this.balance,
          current: this.balance
        };
      }

      this.balance -= amount;
      this.totalSpent += amount;

      // إضافة للسجل
      this.history.push({
        type: 'spend',
        amount,
        purpose,
        balance: this.balance,
        timestamp: new Date().toISOString(),
        metadata
      });

      // حفظ التغييرات
      await this.save();

      // تسجيل المعاملة
      await this.logTransaction('spend', amount, purpose, metadata);

      return {
        success: true,
        amount,
        remaining: this.balance,
        message: `تم إنفاق ${amount} عملة`
      };

    } catch (error) {
      console.error('Spend coins error:', error);
      return { success: false, error: 'فشل إنفاق العملات' };
    }
  }

  // 🔄 تحويل عملات (للمستقبل)
  async transfer(recipientId, amount) {
    try {
      if (amount <= 0) {
        return { success: false, error: 'الكمية غير صالحة' };
      }

      if (this.balance < amount) {
        return { success: false, error: 'عملات غير كافية' };
      }

      // خصم من المرسل
      this.balance -= amount;
      await this.save();

      // إضافة للمستقبل
      const { error } = await supabase
        .from('game_saves')
        .update({ coins: supabase.raw(`coins + ${amount}`) })
        .eq('user_id', recipientId);

      if (error) {
        // إرجاع العملات في حالة الفشل
        this.balance += amount;
        await this.save();
        return { success: false, error: 'فشل التحويل' };
      }

      return {
        success: true,
        amount,
        remaining: this.balance,
        message: `تم تحويل ${amount} عملة بنجاح`
      };

    } catch (error) {
      console.error('Transfer coins error:', error);
      return { success: false, error: 'فشل التحويل' };
    }
  }

  // 📊 تسجيل المعاملة
  async logTransaction(type, amount, purpose, metadata = {}) {
    try {
      if (!this.userId) return;

      const { error } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: this.userId,
          type,
          amount,
          purpose,
          balance_after: this.balance,
          metadata: JSON.stringify(metadata),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Log transaction error:', error);
      }

    } catch (error) {
      console.error('Log transaction error:', error);
    }
  }

  // 📈 جلب سجل المعاملات
  async getTransactionHistory(limit = 50) {
    try {
      if (!this.userId) {
        return { success: false, data: [] };
      }

      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get history error:', error);
        return { success: false, data: [] };
      }

      return { success: true, data };

    } catch (error) {
      console.error('Get history error:', error);
      return { success: false, data: [] };
    }
  }

  // 💰 الحصول على الرصيد
  getBalance() {
    return this.balance;
  }

  // 📊 الحصول على الإحصائيات
  getStats() {
    return {
      balance: this.balance,
      totalEarned: this.totalEarned,
      totalSpent: this.totalSpent,
      netGain: this.totalEarned - this.totalSpent,
      transactions: this.history.length
    };
  }

  // ✅ التحقق من كفاية الرصيد
  canAfford(amount) {
    return this.balance >= amount;
  }

  // 🎁 مكافأة يومية
  async claimDailyReward() {
    try {
      if (!this.userId) {
        return { success: false, error: 'يجب تسجيل الدخول' };
      }

      // التحقق من آخر مطالبة
      const { data: lastClaim } = await supabase
        .from('daily_rewards')
        .select('claimed_at')
        .eq('user_id', this.userId)
        .order('claimed_at', { ascending: false })
        .limit(1)
        .single();

      if (lastClaim) {
        const lastClaimDate = new Date(lastClaim.claimed_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (lastClaimDate >= today) {
          return {
            success: false,
            error: 'لقد حصلت على المكافأة اليومية بالفعل',
            nextClaimTime: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
        }
      }

      // منح المكافأة (50 عملة يومياً)
      const rewardAmount = 50;
      const result = await this.add(rewardAmount, COIN_SOURCES.DAILY_REWARD);

      if (result.success) {
        // تسجيل المطالبة
        await supabase
          .from('daily_rewards')
          .insert({
            user_id: this.userId,
            amount: rewardAmount,
            claimed_at: new Date().toISOString()
          });

        return {
          success: true,
          amount: rewardAmount,
          message: `مبروك! حصلت على ${rewardAmount} عملة 🎉`
        };
      }

      return result;

    } catch (error) {
      console.error('Daily reward error:', error);
      return { success: false, error: 'فشل المطالبة بالمكافأة' };
    }
  }

  // 🎲 عجلة الحظ
  async spinLuckyWheel() {
    try {
      const cost = 10;

      if (this.balance < cost) {
        return {
          success: false,
          error: `تحتاج ${cost} عملات لتدوير العجلة`
        };
      }

      // خصم التكلفة
      await this.spend(cost, 'عجلة الحظ');

      // جوائز محتملة
      const prizes = [
        { amount: 5, probability: 0.3 },
        { amount: 15, probability: 0.25 },
        { amount: 30, probability: 0.2 },
        { amount: 50, probability: 0.15 },
        { amount: 100, probability: 0.08 },
        { amount: 200, probability: 0.02 }
      ];

      // اختيار جائزة
      const rand = Math.random();
      let cumulative = 0;
      let wonPrize = prizes[0];

      for (const prize of prizes) {
        cumulative += prize.probability;
        if (rand <= cumulative) {
          wonPrize = prize;
          break;
        }
      }

      // منح الجائزة
      await this.add(wonPrize.amount, COIN_SOURCES.BONUS, { source: 'lucky_wheel' });

      return {
        success: true,
        prize: wonPrize.amount,
        profit: wonPrize.amount - cost,
        message: `ربحت ${wonPrize.amount} عملة! 🎰`
      };

    } catch (error) {
      console.error('Lucky wheel error:', error);
      return { success: false, error: 'فشل تدوير العجلة' };
    }
  }

  // 🎁 هدية من صديق
  async receiveGift(amount, senderId) {
    return await this.add(amount, COIN_SOURCES.GIFT, { sender_id: senderId });
  }

  // 🔄 إعادة تعيين (للمطورين فقط)
  reset() {
    this.balance = 0;
    this.totalEarned = 0;
    this.totalSpent = 0;
    this.history = [];
  }
}

// 🎨 تنسيق عرض العملات
export function formatCoins(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  }
  return amount.toLocaleString('ar');
}

// 💎 اختيار نوع العملة حسب القيمة
export function getCoinType(value) {
  if (value >= 50) return COIN_TYPES.DIAMOND;
  if (value >= 10) return COIN_TYPES.GOLD;
  if (value >= 5) return COIN_TYPES.SILVER;
  return COIN_TYPES.BRONZE;
}

// 🎯 حساب العملات من النقاط
export function calculateCoinsFromScore(score) {
  // كل 10 نقاط = 1 عملة
  const baseCoins = Math.floor(score / 10);
  
  // مكافآت إضافية
  const bonuses = {
    score100: score >= 100 ? 10 : 0,
    score500: score >= 500 ? 50 : 0,
    score1000: score >= 1000 ? 100 : 0
  };
  
  const totalBonuses = Object.values(bonuses).reduce((sum, b) => sum + b, 0);
  
  return {
    base: baseCoins,
    bonuses,
    total: baseCoins + totalBonuses
  };
}

// ✅ استخدام:
// import { CoinManager, formatCoins, calculateCoinsFromScore } from './coins.js';
// 
// const coinManager = new CoinManager();
// await coinManager.load(userId);
// const result = await coinManager.add(100, COIN_SOURCES.GAME_SCORE);
