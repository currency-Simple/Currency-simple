// ============================================
// ⚽ BALLS MANAGER
// ============================================
// إدارة أنواع الكرات المختلفة

export const BALLS = [
  {
    id: 0,
    name: 'كرة افتراضية',
    nameEn: 'Default Ball',
    color: '#4ECDC4',
    price: 0,
    unlocked: true,
    rarity: 'common',
    emoji: '⚽',
    stats: {
      speed: 5,
      control: 5,
      bounce: 5
    },
    description: 'الكرة الأساسية للعبة'
  },
  {
    id: 1,
    name: 'كرة نارية',
    nameEn: 'Fire Ball',
    color: '#FF6B6B',
    price: 150,
    unlocked: false,
    rarity: 'rare',
    emoji: '🔥',
    stats: {
      speed: 8,
      control: 4,
      bounce: 6
    },
    description: 'سرعة عالية مع تأثيرات نارية'
  },
  {
    id: 2,
    name: 'كرة ماسية',
    nameEn: 'Diamond Ball',
    color: '#B9F2FF',
    price: 500,
    unlocked: false,
    rarity: 'epic',
    emoji: '💎',
    stats: {
      speed: 6,
      control: 9,
      bounce: 7
    },
    description: 'تحكم ممتاز ومكافآت مضاعفة'
  },
  {
    id: 3,
    name: 'كرة ذهبية',
    nameEn: 'Golden Ball',
    color: '#FFD700',
    price: 1000,
    unlocked: false,
    rarity: 'legendary',
    emoji: '👑',
    stats: {
      speed: 7,
      control: 7,
      bounce: 9
    },
    description: 'كرة أسطورية تجلب حظاً وفيراً',
    specialAbility: 'double_coins'
  },
  {
    id: 4,
    name: 'كرة قوس قزح',
    nameEn: 'Rainbow Ball',
    color: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #FFE66D)',
    price: 800,
    unlocked: false,
    rarity: 'epic',
    emoji: '🌈',
    stats: {
      speed: 6,
      control: 8,
      bounce: 8
    },
    description: 'كرة متعددة الألوان مع مسار رائع'
  }
];

// 🎨 الحصول على كرة بالـ ID
export function getBallById(id) {
  return BALLS.find(ball => ball.id === id) || BALLS[0];
}

// 🔓 فتح كرة جديدة
export function unlockBall(ballId, currentCoins) {
  const ball = getBallById(ballId);
  
  if (!ball) {
    return { success: false, error: 'الكرة غير موجودة' };
  }
  
  if (ball.unlocked) {
    return { success: false, error: 'الكرة مفتوحة بالفعل' };
  }
  
  if (currentCoins < ball.price) {
    return { 
      success: false, 
      error: `تحتاج ${ball.price - currentCoins} عملة إضافية` 
    };
  }
  
  return { 
    success: true, 
    ball,
    coinsSpent: ball.price,
    message: `تم فتح ${ball.name}! 🎉`
  };
}

// 📊 إحصائيات الكرات
export function getBallStats() {
  return {
    total: BALLS.length,
    unlocked: BALLS.filter(b => b.unlocked).length,
    locked: BALLS.filter(b => !b.unlocked).length,
    byRarity: {
      common: BALLS.filter(b => b.rarity === 'common').length,
      rare: BALLS.filter(b => b.rarity === 'rare').length,
      epic: BALLS.filter(b => b.rarity === 'epic').length,
      legendary: BALLS.filter(b => b.rarity === 'legendary').length
    }
  };
}

// 🎯 ترتيب الكرات
export function sortBalls(criteria = 'price') {
  const sorted = [...BALLS];
  
  switch (criteria) {
    case 'price':
      return sorted.sort((a, b) => a.price - b.price);
    case 'rarity':
      const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
      return sorted.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    case 'speed':
      return sorted.sort((a, b) => b.stats.speed - a.stats.speed);
    case 'control':
      return sorted.sort((a, b) => b.stats.control - a.stats.control);
    default:
      return sorted;
  }
}

// 🎨 الحصول على لون الندرة
export function getRarityColor(rarity) {
  const colors = {
    common: '#FFFFFF',
    rare: '#4ECDC4',
    epic: '#B565F2',
    legendary: '#FFD700'
  };
  return colors[rarity] || colors.common;
}

// ✅ استخدام:
// import { BALLS, getBallById, unlockBall } from './balls.js';
