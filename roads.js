// ============================================
// 🛣️ ROADS MANAGER
// ============================================
// إدارة أنواع الطرق المختلفة

export const ROADS = [
  {
    id: 0,
    name: 'طريق افتراضي',
    nameEn: 'Default Road',
    color: '#00FF88',
    secondaryColor: '#004D2C',
    price: 0,
    unlocked: true,
    rarity: 'common',
    emoji: '🛣️',
    pattern: 'lines',
    lanes: 3,
    stats: {
      difficulty: 5,
      speed: 5,
      obstacles: 5
    },
    description: 'الطريق الأساسي للعبة',
    theme: {
      background: '#000000',
      obstacles: '#FF6B6B',
      effects: 'none'
    }
  },
  {
    id: 1,
    name: 'طريق ناري',
    nameEn: 'Fire Road',
    color: '#FF6B6B',
    secondaryColor: '#8B0000',
    price: 200,
    unlocked: false,
    rarity: 'rare',
    emoji: '🔥',
    pattern: 'flames',
    lanes: 3,
    stats: {
      difficulty: 7,
      speed: 8,
      obstacles: 6
    },
    description: 'طريق ساخن مع تأثيرات نارية',
    theme: {
      background: '#1A0000',
      obstacles: '#FFD700',
      effects: 'flames'
    },
    specialEffect: 'fire_particles'
  },
  {
    id: 2,
    name: 'طريق جليدي',
    nameEn: 'Ice Road',
    color: '#B9F2FF',
    secondaryColor: '#4D9FB8',
    price: 400,
    unlocked: false,
    rarity: 'epic',
    emoji: '❄️',
    pattern: 'frozen',
    lanes: 3,
    stats: {
      difficulty: 8,
      speed: 6,
      obstacles: 7
    },
    description: 'طريق منزلق مع بلورات جليدية',
    theme: {
      background: '#001A33',
      obstacles: '#FFFFFF',
      effects: 'snow'
    },
    specialEffect: 'ice_crystals'
  },
  {
    id: 3,
    name: 'طريق ذهبي',
    nameEn: 'Golden Road',
    color: '#FFD700',
    secondaryColor: '#B8860B',
    price: 800,
    unlocked: false,
    rarity: 'legendary',
    emoji: '👑',
    pattern: 'golden',
    lanes: 3,
    stats: {
      difficulty: 6,
      speed: 7,
      obstacles: 5
    },
    description: 'طريق أسطوري يمنح عملات إضافية',
    theme: {
      background: '#1A1000',
      obstacles: '#FF6B6B',
      effects: 'sparkles'
    },
    specialEffect: 'coin_rain',
    specialAbility: 'double_coins'
  },
  {
    id: 4,
    name: 'طريق نيون',
    nameEn: 'Neon Road',
    color: '#00FFFF',
    secondaryColor: '#FF00FF',
    price: 600,
    unlocked: false,
    rarity: 'epic',
    emoji: '🌟',
    pattern: 'neon',
    lanes: 3,
    stats: {
      difficulty: 7,
      speed: 9,
      obstacles: 6
    },
    description: 'طريق مستقبلي بأضواء نيون',
    theme: {
      background: '#0A0A1A',
      obstacles: '#FF00FF',
      effects: 'neon_glow'
    },
    specialEffect: 'neon_trails'
  },
  {
    id: 5,
    name: 'طريق الفضاء',
    nameEn: 'Space Road',
    color: '#1E1E3F',
    secondaryColor: '#4B0082',
    price: 1000,
    unlocked: false,
    rarity: 'legendary',
    emoji: '🚀',
    pattern: 'stars',
    lanes: 3,
    stats: {
      difficulty: 9,
      speed: 10,
      obstacles: 8
    },
    description: 'طريق في الفضاء الخارجي مع نجوم وكواكب',
    theme: {
      background: '#000011',
      obstacles: '#8A2BE2',
      effects: 'stars'
    },
    specialEffect: 'space_dust',
    specialAbility: 'low_gravity'
  }
];

// 🎯 الحصول على طريق بالـ ID
export function getRoadById(id) {
  return ROADS.find(road => road.id === id) || ROADS[0];
}

// 🔓 فتح طريق جديد
export function unlockRoad(roadId, currentCoins) {
  const road = getRoadById(roadId);
  
  if (!road) {
    return { success: false, error: 'الطريق غير موجود' };
  }
  
  if (road.unlocked) {
    return { success: false, error: 'الطريق مفتوح بالفعل' };
  }
  
  if (currentCoins < road.price) {
    return { 
      success: false, 
      error: `تحتاج ${road.price - currentCoins} عملة إضافية`,
      needed: road.price - currentCoins
    };
  }
  
  return { 
    success: true, 
    road,
    coinsSpent: road.price,
    message: `تم فتح ${road.name}! 🎉`
  };
}

// 📊 إحصائيات الطرق
export function getRoadStats() {
  return {
    total: ROADS.length,
    unlocked: ROADS.filter(r => r.unlocked).length,
    locked: ROADS.filter(r => !r.unlocked).length,
    byRarity: {
      common: ROADS.filter(r => r.rarity === 'common').length,
      rare: ROADS.filter(r => r.rarity === 'rare').length,
      epic: ROADS.filter(r => r.rarity === 'epic').length,
      legendary: ROADS.filter(r => r.rarity === 'legendary').length
    },
    totalValue: ROADS.reduce((sum, r) => sum + r.price, 0)
  };
}

// 🎯 ترتيب الطرق
export function sortRoads(criteria = 'price') {
  const sorted = [...ROADS];
  
  switch (criteria) {
    case 'price':
      return sorted.sort((a, b) => a.price - b.price);
      
    case 'rarity':
      const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
      return sorted.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
      
    case 'difficulty':
      return sorted.sort((a, b) => b.stats.difficulty - a.stats.difficulty);
      
    case 'speed':
      return sorted.sort((a, b) => b.stats.speed - a.stats.speed);
      
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      
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

// 🎨 رسم نمط الطريق
export function drawRoadPattern(ctx, road, width, height, scrollY) {
  // خلفية الطريق
  ctx.fillStyle = road.theme.background;
  ctx.fillRect(0, 0, width, height);
  
  switch (road.pattern) {
    case 'lines':
      drawLinesPattern(ctx, road, width, height, scrollY);
      break;
      
    case 'flames':
      drawFlamesPattern(ctx, road, width, height, scrollY);
      break;
      
    case 'frozen':
      drawFrozenPattern(ctx, road, width, height, scrollY);
      break;
      
    case 'golden':
      drawGoldenPattern(ctx, road, width, height, scrollY);
      break;
      
    case 'neon':
      drawNeonPattern(ctx, road, width, height, scrollY);
      break;
      
    case 'stars':
      drawStarsPattern(ctx, road, width, height, scrollY);
      break;
      
    default:
      drawLinesPattern(ctx, road, width, height, scrollY);
  }
}

// 📏 رسم نمط الخطوط (افتراضي)
function drawLinesPattern(ctx, road, width, height, scrollY) {
  const laneWidth = width / road.lanes;
  
  ctx.strokeStyle = road.color;
  ctx.lineWidth = 4;
  ctx.setLineDash([30, 30]);
  ctx.lineDashOffset = -scrollY;
  
  // خطوط الممرات
  for (let i = 1; i < road.lanes; i++) {
    const x = laneWidth * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // حواف الطريق
  ctx.strokeStyle = road.secondaryColor;
  ctx.lineWidth = 8;
  ctx.setLineDash([]);
  
  ctx.strokeRect(5, 0, width - 10, height);
}

// 🔥 رسم نمط النار
function drawFlamesPattern(ctx, road, width, height, scrollY) {
  drawLinesPattern(ctx, road, width, height, scrollY);
  
  // إضافة جزيئات نارية
  const flameCount = 20;
  for (let i = 0; i < flameCount; i++) {
    const x = (i * width / flameCount) + (scrollY % 100);
    const y = Math.sin(scrollY * 0.01 + i) * 20 + height / 2;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
    gradient.addColorStop(0, '#FF6B6BFF');
    gradient.addColorStop(0.5, '#FF4500AA');
    gradient.addColorStop(1, '#FF450000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ❄️ رسم نمط الجليد
function drawFrozenPattern(ctx, road, width, height, scrollY) {
  drawLinesPattern(ctx, road, width, height, scrollY);
  
  // بلورات جليدية
  const crystalCount = 15;
  for (let i = 0; i < crystalCount; i++) {
    const x = (i * width / crystalCount) + ((scrollY * 0.5) % 100);
    const y = (scrollY * 0.3 + i * 50) % height;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(scrollY * 0.001);
    
    // رسم بلورة
    ctx.strokeStyle = road.color + 'AA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI * 2 / 6) * j;
      const px = Math.cos(angle) * 15;
      const py = Math.sin(angle) * 15;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }
}

// 👑 رسم نمط ذهبي
function drawGoldenPattern(ctx, road, width, height, scrollY) {
  drawLinesPattern(ctx, road, width, height, scrollY);
  
  // جزيئات ذهبية متلألئة
  const sparkleCount = 30;
  for (let i = 0; i < sparkleCount; i++) {
    const x = Math.random() * width;
    const y = (scrollY + i * 30) % height;
    const size = Math.random() * 4 + 2;
    const alpha = Math.sin(scrollY * 0.05 + i) * 0.5 + 0.5;
    
    ctx.fillStyle = road.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 💫 رسم نمط نيون
function drawNeonPattern(ctx, road, width, height, scrollY) {
  // خطوط نيون متوهجة
  const laneWidth = width / road.lanes;
  
  for (let i = 1; i < road.lanes; i++) {
    const x = laneWidth * i;
    
    // توهج
    ctx.shadowBlur = 20;
    ctx.shadowColor = road.color;
    ctx.strokeStyle = road.color;
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -scrollY;
    
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }
}

// 🌌 رسم نمط النجوم
function drawStarsPattern(ctx, road, width, height, scrollY) {
  drawLinesPattern(ctx, road, width, height, scrollY);
  
  // نجوم متحركة
  const starCount = 50;
  for (let i = 0; i < starCount; i++) {
    const x = (i * 17 * width / starCount) % width;
    const y = (scrollY * 0.2 + i * 20) % height;
    const size = Math.random() * 2 + 1;
    const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;
    
    ctx.fillStyle = '#FFFFFF' + Math.floor(twinkle * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 🌟 الحصول على التأثيرات الخاصة
export function getRoadSpecialEffects(roadId) {
  const road = getRoadById(roadId);
  
  if (!road || !road.specialEffect) {
    return null;
  }
  
  return {
    type: road.specialEffect,
    ability: road.specialAbility || null,
    description: road.description
  };
}

// 🎨 تطبيق ثيم الطريق على اللعبة
export function applyRoadTheme(road) {
  return {
    backgroundColor: road.theme.background,
    obstacleColor: road.theme.obstacles,
    effectsEnabled: road.theme.effects !== 'none',
    effectType: road.theme.effects
  };
}

// 📈 حساب صعوبة الطريق
export function calculateRoadDifficulty(road) {
  const weights = {
    difficulty: 0.4,
    speed: 0.3,
    obstacles: 0.3
  };
  
  const score = 
    road.stats.difficulty * weights.difficulty +
    road.stats.speed * weights.speed +
    road.stats.obstacles * weights.obstacles;
  
  return {
    score: score.toFixed(1),
    level: score < 5 ? 'سهل' : score < 7 ? 'متوسط' : score < 9 ? 'صعب' : 'خبير'
  };
}

// 🎁 مكافآت الطريق
export function getRoadRewards(road) {
  const baseReward = 10;
  const rarityMultiplier = {
    common: 1,
    rare: 1.5,
    epic: 2,
    legendary: 3
  };
  
  const coinBonus = baseReward * (rarityMultiplier[road.rarity] || 1);
  const hasSpecialAbility = !!road.specialAbility;
  
  return {
    coinBonus: Math.floor(coinBonus),
    hasSpecialAbility,
    specialAbility: road.specialAbility || null,
    description: road.specialAbility === 'double_coins' 
      ? 'عملات مضاعفة' 
      : road.specialAbility === 'low_gravity' 
        ? 'جاذبية منخفضة' 
        : null
  };
}

// ✅ استخدام:
// import { ROADS, getRoadById, unlockRoad, drawRoadPattern } from './roads.js';
// const road = getRoadById(1);
// const result = unlockRoad(1, currentCoins);
