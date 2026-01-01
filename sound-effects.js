// ============================================
// 🔊 SOUND EFFECTS
// ============================================
// تعريف جميع المؤثرات الصوتية في اللعبة

import { audioManager } from './audio-manager.js';

// 📋 قائمة المؤثرات الصوتية
export const SOUND_EFFECTS = {
  // 🎮 أصوات اللعبة الأساسية
  bounce: {
    src: 'assets/sounds/bounce.mp3',
    volume: 0.6,
    category: 'gameplay',
    description: 'صوت ارتداد الكرة'
  },
  
  hit: {
    src: 'assets/sounds/hit.mp3',
    volume: 0.7,
    category: 'gameplay',
    description: 'صوت اصطدام بعائق'
  },
  
  coin: {
    src: 'assets/sounds/coin.mp3',
    volume: 0.5,
    category: 'gameplay',
    description: 'صوت جمع عملة'
  },
  
  speedup: {
    src: 'assets/sounds/speedup.mp3',
    volume: 0.6,
    category: 'gameplay',
    description: 'صوت تسارع'
  },
  
  // 🖱️ أصوات الواجهة
  click: {
    src: 'assets/sounds/click.mp3',
    volume: 0.3,
    category: 'ui',
    description: 'صوت نقر زر'
  },
  
  hover: {
    src: 'assets/sounds/hover.mp3',
    volume: 0.2,
    category: 'ui',
    description: 'صوت تمرير فوق زر'
  },
  
  swipe: {
    src: 'assets/sounds/swipe.mp3',
    volume: 0.4,
    category: 'ui',
    description: 'صوت تبديل شاشة'
  },
  
  select: {
    src: 'assets/sounds/select.mp3',
    volume: 0.4,
    category: 'ui',
    description: 'صوت اختيار عنصر'
  },
  
  back: {
    src: 'assets/sounds/back.mp3',
    volume: 0.3,
    category: 'ui',
    description: 'صوت رجوع'
  },
  
  // 🎯 أصوات النتائج
  win: {
    src: 'assets/sounds/win.mp3',
    volume: 0.8,
    category: 'result',
    description: 'صوت فوز'
  },
  
  lose: {
    src: 'assets/sounds/lose.mp3',
    volume: 0.7,
    category: 'result',
    description: 'صوت خسارة'
  },
  
  gameover: {
    src: 'assets/sounds/gameover.mp3',
    volume: 0.8,
    category: 'result',
    description: 'صوت نهاية اللعبة'
  },
  
  perfect: {
    src: 'assets/sounds/perfect.mp3',
    volume: 0.9,
    category: 'result',
    description: 'صوت لعبة مثالية'
  },
  
  // 🏆 أصوات الإنجازات
  achievement: {
    src: 'assets/sounds/achievement.mp3',
    volume: 0.9,
    category: 'achievement',
    description: 'صوت إنجاز جديد'
  },
  
  levelup: {
    src: 'assets/sounds/levelup.mp3',
    volume: 0.8,
    category: 'achievement',
    description: 'صوت ارتقاء مستوى'
  },
  
  unlock: {
    src: 'assets/sounds/unlock.mp3',
    volume: 0.7,
    category: 'achievement',
    description: 'صوت فتح عنصر جديد'
  },
  
  record: {
    src: 'assets/sounds/record.mp3',
    volume: 0.9,
    category: 'achievement',
    description: 'صوت رقم قياسي جديد'
  },
  
  // 🎵 الموسيقى الخلفية
  menu_music: {
    src: 'assets/music/menu.mp3',
    volume: 0.4,
    loop: true,
    category: 'music',
    description: 'موسيقى القائمة'
  },
  
  game_music: {
    src: 'assets/music/game.mp3',
    volume: 0.3,
    loop: true,
    category: 'music',
    description: 'موسيقى اللعب'
  },
  
  game_music_intense: {
    src: 'assets/music/game-intense.mp3',
    volume: 0.35,
    loop: true,
    category: 'music',
    description: 'موسيقى مكثفة'
  }
};

// 🔄 تحميل جميع الأصوات
export async function initializeSounds() {
  try {
    console.log('🔊 Loading sound effects...');
    
    const soundPromises = [];
    let loaded = 0;
    const total = Object.keys(SOUND_EFFECTS).length;
    
    // تحميل كل صوت
    for (const [name, config] of Object.entries(SOUND_EFFECTS)) {
      const promise = (async () => {
        try {
          if (config.loop && config.category === 'music') {
            await audioManager.loadMusic(name, config.src, config);
          } else {
            await audioManager.loadSound(name, config.src, config);
          }
          
          loaded++;
          const progress = Math.floor((loaded / total) * 100);
          console.log(`✓ Loaded: ${name} (${progress}%)`);
          
        } catch (error) {
          console.error(`✗ Failed to load: ${name}`, error);
        }
      })();
      
      soundPromises.push(promise);
    }
    
    await Promise.all(soundPromises);
    
    console.log('✅ All sounds loaded!');
    return { success: true, loaded, total };
    
  } catch (error) {
    console.error('Failed to initialize sounds:', error);
    return { success: false, error: error.message };
  }
}

// 🎮 دوال مساعدة للتشغيل السريع
export const SoundPlayer = {
  // أصوات اللعب
  playBounce() {
    audioManager.playSound('bounce');
  },
  
  playHit() {
    audioManager.playSound('hit');
  },
  
  playCoin() {
    audioManager.playSound('coin');
  },
  
  playSpeedup() {
    audioManager.playSound('speedup');
  },
  
  // أصوات الواجهة
  playClick() {
    audioManager.playSound('click');
  },
  
  playHover() {
    audioManager.playSound('hover');
  },
  
  playSwipe() {
    audioManager.playSound('swipe');
  },
  
  playSelect() {
    audioManager.playSound('select');
  },
  
  playBack() {
    audioManager.playSound('back');
  },
  
  // أصوات النتائج
  playWin() {
    audioManager.playSound('win');
  },
  
  playLose() {
    audioManager.playSound('lose');
  },
  
  playGameOver() {
    audioManager.playSound('gameover');
  },
  
  playPerfect() {
    audioManager.playSound('perfect');
  },
  
  // أصوات الإنجازات
  playAchievement() {
    audioManager.playSound('achievement');
  },
  
  playLevelUp() {
    audioManager.playSound('levelup');
  },
  
  playUnlock() {
    audioManager.playSound('unlock');
  },
  
  playRecord() {
    audioManager.playSound('record');
  },
  
  // الموسيقى
  playMenuMusic() {
    audioManager.playMusic('menu_music', { fadeIn: 1000 });
  },
  
  playGameMusic(intense = false) {
    const musicName = intense ? 'game_music_intense' : 'game_music';
    audioManager.playMusic(musicName, { fadeIn: 1000 });
  },
  
  stopMusic() {
    audioManager.stopMusic(null, { fadeOut: 1000 });
  }
};

// 🎨 تشغيل أصوات متتابعة (Combo)
export function playComboSound(comboCount) {
  const pitchIncrease = Math.min(comboCount * 0.05, 0.5);
  audioManager.playSound('coin', {
    playbackRate: 1 + pitchIncrease
  });
}

// ⚡ تشغيل صوت مع تأثير
export function playSoundWithEffect(soundName, effect = {}) {
  const options = {
    volume: effect.volume,
    playbackRate: effect.pitch || 1.0
  };
  
  audioManager.playSound(soundName, options);
}

// 🔊 تشغيل صوت عشوائي من مجموعة
export function playRandomSound(soundGroup) {
  const sounds = Object.keys(SOUND_EFFECTS).filter(name => 
    SOUND_EFFECTS[name].category === soundGroup
  );
  
  if (sounds.length > 0) {
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    audioManager.playSound(randomSound);
  }
}

// 📊 الحصول على معلومات الأصوات
export function getSoundInfo(soundName) {
  return SOUND_EFFECTS[soundName] || null;
}

// 📋 الحصول على قائمة الأصوات حسب الفئة
export function getSoundsByCategory(category) {
  return Object.entries(SOUND_EFFECTS)
    .filter(([_, config]) => config.category === category)
    .map(([name, config]) => ({ name, ...config }));
}

// 📈 إحصائيات الأصوات
export function getSoundStats() {
  const categories = {};
  
  Object.values(SOUND_EFFECTS).forEach(sound => {
    if (!categories[sound.category]) {
      categories[sound.category] = 0;
    }
    categories[sound.category]++;
  });
  
  return {
    total: Object.keys(SOUND_EFFECTS).length,
    byCategory: categories,
    musicTracks: Object.values(SOUND_EFFECTS).filter(s => s.loop).length
  };
}

// 🎯 تحميل الأصوات الأساسية فقط (للتحميل السريع)
export async function loadEssentialSounds() {
  const essential = ['click', 'bounce', 'coin', 'gameover'];
  
  const promises = essential.map(name => {
    const config = SOUND_EFFECTS[name];
    return audioManager.loadSound(name, config.src, config);
  });
  
  await Promise.all(promises);
  console.log('✅ Essential sounds loaded!');
}

// 🔄 إعادة تحميل صوت معين
export async function reloadSound(soundName) {
  try {
    const config = SOUND_EFFECTS[soundName];
    if (!config) {
      return { success: false, error: 'Sound not found' };
    }
    
    if (config.loop && config.category === 'music') {
      await audioManager.loadMusic(soundName, config.src, config);
    } else {
      await audioManager.loadSound(soundName, config.src, config);
    }
    
    return { success: true, message: `${soundName} reloaded` };
    
  } catch (error) {
    console.error(`Failed to reload ${soundName}:`, error);
    return { success: false, error: error.message };
  }
}

// 🧪 اختبار صوت
export function testSound(soundName) {
  console.log(`🔊 Testing sound: ${soundName}`);
  audioManager.playSound(soundName);
}

// 🎵 تبديل الموسيقى بسلاسة
export async function crossfadeMusic(fromMusic, toMusic, duration = 2000) {
  // إيقاف الموسيقى القديمة مع Fade Out
  if (fromMusic) {
    audioManager.stopMusic(fromMusic, { fadeOut: duration });
  }
  
  // بدء الموسيقى الجديدة مع Fade In
  setTimeout(() => {
    audioManager.playMusic(toMusic, { fadeIn: duration });
  }, duration / 2);
}

// 🎼 تشغيل قائمة تشغيل موسيقية
export class MusicPlaylist {
  constructor(tracks) {
    this.tracks = tracks;
    this.currentIndex = 0;
    this.isPlaying = false;
  }
  
  play() {
    if (this.tracks.length === 0) return;
    
    const currentTrack = this.tracks[this.currentIndex];
    audioManager.playMusic(currentTrack, { restart: true });
    this.isPlaying = true;
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
    this.play();
  }
  
  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    this.play();
  }
  
  stop() {
    audioManager.stopMusic(this.tracks[this.currentIndex]);
    this.isPlaying = false;
  }
}

// ✅ استخدام:
// import { initializeSounds, SoundPlayer } from './sound-effects.js';
// 
// await initializeSounds();
// SoundPlayer.playClick();
// SoundPlayer.playMenuMusic();
