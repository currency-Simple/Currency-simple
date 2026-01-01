// ============================================
// 🔊 AUDIO MANAGER
// ============================================
// إدارة الأصوات والموسيقى

export class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.music = new Map();
    this.currentMusic = null;
    
    // الإعدادات
    this.settings = {
      masterVolume: 0.7,
      soundVolume: 1.0,
      musicVolume: 0.5,
      soundEnabled: true,
      musicEnabled: true
    };
    
    // حالة التحميل
    this.loaded = false;
    this.loadingProgress = 0;
    
    this.loadSettings();
  }

  // 🔄 تحميل الإعدادات
  loadSettings() {
    const saved = localStorage.getItem('audio_settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  // 💾 حفظ الإعدادات
  saveSettings() {
    localStorage.setItem('audio_settings', JSON.stringify(this.settings));
  }

  // 📦 تحميل ملف صوتي
  loadSound(name, src, options = {}) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = options.preload || 'auto';
      audio.loop = options.loop || false;
      
      audio.addEventListener('canplaythrough', () => {
        const soundData = {
          audio,
          volume: options.volume || 1.0,
          category: options.category || 'sound',
          loaded: true
        };
        
        this.sounds.set(name, soundData);
        this.updateVolume(name);
        resolve(soundData);
      });
      
      audio.addEventListener('error', (error) => {
        console.error(`Failed to load sound: ${name}`, error);
        reject(error);
      });
      
      audio.load();
    });
  }

  // 🎵 تحميل موسيقى
  loadMusic(name, src, options = {}) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = options.preload || 'auto';
      audio.loop = true;
      
      audio.addEventListener('canplaythrough', () => {
        const musicData = {
          audio,
          volume: options.volume || 1.0,
          category: 'music',
          loaded: true
        };
        
        this.music.set(name, musicData);
        this.updateVolume(name);
        resolve(musicData);
      });
      
      audio.addEventListener('error', (error) => {
        console.error(`Failed to load music: ${name}`, error);
        reject(error);
      });
      
      audio.load();
    });
  }

  // 📦 تحميل جميع الملفات
  async loadAll(soundsList, musicList) {
    const total = soundsList.length + musicList.length;
    let loaded = 0;
    
    // تحميل الأصوات
    for (const { name, src, options } of soundsList) {
      try {
        await this.loadSound(name, src, options);
        loaded++;
        this.loadingProgress = (loaded / total) * 100;
      } catch (error) {
        console.error(`Failed to load sound: ${name}`);
      }
    }
    
    // تحميل الموسيقى
    for (const { name, src, options } of musicList) {
      try {
        await this.loadMusic(name, src, options);
        loaded++;
        this.loadingProgress = (loaded / total) * 100;
      } catch (error) {
        console.error(`Failed to load music: ${name}`);
      }
    }
    
    this.loaded = true;
    return { success: true, loaded: loaded, total: total };
  }

  // ▶️ تشغيل صوت
  playSound(name, options = {}) {
    if (!this.settings.soundEnabled) return;
    
    const soundData = this.sounds.get(name);
    if (!soundData || !soundData.loaded) {
      console.warn(`Sound not found or not loaded: ${name}`);
      return;
    }
    
    const { audio } = soundData;
    
    // إعادة تشغيل من البداية
    audio.currentTime = 0;
    
    // تطبيق الصوت
    if (options.volume !== undefined) {
      audio.volume = options.volume * this.settings.soundVolume * this.settings.masterVolume;
    }
    
    // معدل التشغيل (السرعة)
    if (options.playbackRate) {
      audio.playbackRate = options.playbackRate;
    }
    
    // تشغيل
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error(`Failed to play sound: ${name}`, error);
      });
    }
    
    // إرجاع معدل التشغيل للطبيعي
    if (options.playbackRate) {
      audio.addEventListener('ended', () => {
        audio.playbackRate = 1.0;
      }, { once: true });
    }
  }

  // 🎵 تشغيل موسيقى
  playMusic(name, options = {}) {
    if (!this.settings.musicEnabled) return;
    
    const musicData = this.music.get(name);
    if (!musicData || !musicData.loaded) {
      console.warn(`Music not found or not loaded: ${name}`);
      return;
    }
    
    // إيقاف الموسيقى الحالية
    if (this.currentMusic && this.currentMusic !== name) {
      this.stopMusic(this.currentMusic, { fadeOut: true });
    }
    
    const { audio } = musicData;
    
    // بدء من البداية أو الاستمرار
    if (options.restart) {
      audio.currentTime = 0;
    }
    
    // التشغيل
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.currentMusic = name;
          
          // تأثير Fade In
          if (options.fadeIn) {
            this.fadeIn(audio, options.fadeIn);
          }
        })
        .catch(error => {
          console.error(`Failed to play music: ${name}`, error);
        });
    }
  }

  // ⏸️ إيقاف مؤقت للموسيقى
  pauseMusic(name) {
    const musicData = name ? this.music.get(name) : this.music.get(this.currentMusic);
    if (musicData && musicData.loaded) {
      musicData.audio.pause();
    }
  }

  // ▶️ استئناف الموسيقى
  resumeMusic(name) {
    const musicData = name ? this.music.get(name) : this.music.get(this.currentMusic);
    if (musicData && musicData.loaded) {
      musicData.audio.play();
    }
  }

  // ⏹️ إيقاف موسيقى
  stopMusic(name, options = {}) {
    const musicData = name ? this.music.get(name) : this.music.get(this.currentMusic);
    if (!musicData || !musicData.loaded) return;
    
    const { audio } = musicData;
    
    if (options.fadeOut) {
      this.fadeOut(audio, options.fadeOut).then(() => {
        audio.pause();
        audio.currentTime = 0;
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
    
    if (this.currentMusic === name) {
      this.currentMusic = null;
    }
  }

  // ⏹️ إيقاف جميع الأصوات
  stopAll() {
    this.sounds.forEach(({ audio }) => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    this.music.forEach(({ audio }) => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    this.currentMusic = null;
  }

  // 🔊 تحديث مستوى الصوت
  updateVolume(name) {
    const soundData = this.sounds.get(name) || this.music.get(name);
    if (!soundData) return;
    
    const { audio, volume, category } = soundData;
    
    if (category === 'music') {
      audio.volume = volume * this.settings.musicVolume * this.settings.masterVolume;
    } else {
      audio.volume = volume * this.settings.soundVolume * this.settings.masterVolume;
    }
  }

  // 🔊 تعيين مستوى الصوت الرئيسي
  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    
    // تحديث جميع الأصوات
    this.sounds.forEach((_, name) => this.updateVolume(name));
    this.music.forEach((_, name) => this.updateVolume(name));
    
    this.saveSettings();
  }

  // 🔊 تعيين مستوى صوت المؤثرات
  setSoundVolume(volume) {
    this.settings.soundVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((_, name) => this.updateVolume(name));
    this.saveSettings();
  }

  // 🎵 تعيين مستوى صوت الموسيقى
  setMusicVolume(volume) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.music.forEach((_, name) => this.updateVolume(name));
    this.saveSettings();
  }

  // 🔇 كتم/إلغاء كتم الأصوات
  toggleSound() {
    this.settings.soundEnabled = !this.settings.soundEnabled;
    this.saveSettings();
    return this.settings.soundEnabled;
  }

  // 🔇 كتم/إلغاء كتم الموسيقى
  toggleMusic() {
    this.settings.musicEnabled = !this.settings.musicEnabled;
    
    if (!this.settings.musicEnabled && this.currentMusic) {
      this.pauseMusic(this.currentMusic);
    } else if (this.settings.musicEnabled && this.currentMusic) {
      this.resumeMusic(this.currentMusic);
    }
    
    this.saveSettings();
    return this.settings.musicEnabled;
  }

  // 📈 Fade In
  fadeIn(audio, duration = 1000) {
    const targetVolume = audio.volume;
    audio.volume = 0;
    
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  // 📉 Fade Out
  fadeOut(audio, duration = 1000) {
    return new Promise(resolve => {
      const startVolume = audio.volume;
      const steps = 50;
      const stepTime = duration / steps;
      const volumeStep = startVolume / steps;
      
      let currentStep = 0;
      
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
        
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, stepTime);
    });
  }

  // 📊 الحصول على حالة التحميل
  getLoadingProgress() {
    return this.loadingProgress;
  }

  // ℹ️ الحصول على الإعدادات
  getSettings() {
    return { ...this.settings };
  }

  // 🧹 تنظيف الموارد
  dispose() {
    this.stopAll();
    
    this.sounds.forEach(({ audio }) => {
      audio.src = '';
      audio.load();
    });
    
    this.music.forEach(({ audio }) => {
      audio.src = '';
      audio.load();
    });
    
    this.sounds.clear();
    this.music.clear();
  }
}

// 🎯 مثيل واحد عام
export const audioManager = new AudioManager();

// ✅ استخدام:
// import { audioManager } from './audio-manager.js';
// 
// await audioManager.loadSound('click', 'assets/sounds/click.mp3');
// audioManager.playSound('click');
// audioManager.playMusic('bgm', { fadeIn: 1000 });
