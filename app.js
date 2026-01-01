// ============================================
// 🎮 SPEEDBALL 3D - MAIN APP
// ============================================

import { getCurrentUser } from './online/auth-manager.js';
import { GameDataManager } from './core/game-data-online.js';
import { Game } from './core/game.js';
import { audioManager } from './systems/audio-manager.js';
import { initializeSounds } from './systems/sound-effects.js';
import { uiManager } from './ui/ui-main.js';
import { authUI } from './ui/auth-ui.js';
import { profileUI } from './ui/profile-ui.js';
import { loadTheme } from './ui/themes-online.js';
import { tutorialManager } from './ui/tutorial.js';
import { notificationManager } from './ui/notifications.js';

class SpeedballApp {
  constructor() {
    this.user = null;
    this.gameData = new GameDataManager();
    this.game = null;
    this.initialized = false;
  }

  async init() {
    console.log('🎮 Initializing Speedball 3D...');
    uiManager.showLoading('جاري التحميل...');

    try {
      // تحميل المستخدم
      this.user = await getCurrentUser();
      
      // تهيئة الواجهة
      this.setupUI();
      
      // تحميل البيانات
      if (this.user) {
        await this.gameData.load(this.user.id);
        await loadTheme(this.user.id);
        this.updateUserInfo();
      } else {
        await this.gameData.load(null);
      }
      
      // تحميل الأصوات
      await this.loadAudio();
      
      // تهيئة اللعبة
      this.initGame();
      
      // إعداد الأحداث
      this.setupEvents();
      
      this.initialized = true;
      uiManager.hideLoading();
      
      // عرض الشاشة الرئيسية
      if (this.user) {
        uiManager.showScreen('menu');
      } else {
        uiManager.showScreen('auth');
      }
      
      console.log('✅ Game initialized!');
      
      // عرض الدليل للاعبين الجدد
      if (this.user && !localStorage.getItem('tutorial_completed')) {
        setTimeout(() => tutorialManager.start(), 1000);
      }
      
    } catch (error) {
      console.error('Initialization error:', error);
      uiManager.hideLoading();
      notificationManager.show('حدث خطأ في التحميل', 'error');
    }
  }

  setupUI() {
    // تسجيل الشاشات
    uiManager.registerScreen('menu', document.getElementById('menu-screen'));
    uiManager.registerScreen('auth', document.getElementById('auth-screen'));
    uiManager.registerScreen('game', document.getElementById('game-screen'));
    uiManager.registerScreen('profile', document.getElementById('profile-screen'));
    uiManager.registerScreen('leaderboard', document.getElementById('leaderboard-screen'));
    uiManager.registerScreen('settings', document.getElementById('settings-screen'));
    
    // تهيئة واجهة المصادقة
    authUI.init();
  }

  async loadAudio() {
    console.log('🔊 Loading audio...');
    try {
      await initializeSounds();
      console.log('✅ Audio loaded!');
    } catch (error) {
      console.error('Audio loading failed:', error);
    }
  }

  initGame() {
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.game = new Game(canvas);
    }
  }

  setupEvents() {
    // أزرار القائمة
    document.getElementById('btn-play')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-profile')?.addEventListener('click', () => this.showProfile());
    document.getElementById('btn-leaderboard')?.addEventListener('click', () => this.showLeaderboard());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.showSettings());
    
    // أزرار الرجوع
    document.getElementById('profile-back')?.addEventListener('click', () => uiManager.showScreen('menu'));
    document.getElementById('leaderboard-back')?.addEventListener('click', () => uiManager.showScreen('menu'));
    document.getElementById('settings-back')?.addEventListener('click', () => uiManager.showScreen('menu'));
    document.getElementById('auth-back')?.addEventListener('click', () => uiManager.showScreen('menu'));
    
    // أزرار اللعبة
    document.getElementById('btn-pause')?.addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-resume')?.addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-quit')?.addEventListener('click', () => this.quitGame());
    document.getElementById('btn-play-again')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-menu')?.addEventListener('click', () => uiManager.showScreen('menu'));
    
    // تغيير حجم النافذة
    window.addEventListener('resize', () => {
      if (this.game) {
        const canvas = document.getElementById('game-canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }

  updateUserInfo() {
    const data = this.gameData.getData();
    uiManager.updateUI('best-score', data.bestScore);
    uiManager.updateUI('coins', data.coins);
    
    const userInfo = document.getElementById('user-info');
    if (userInfo && this.user) {
      userInfo.innerHTML = `
        <span>مرحباً، ${this.user.email.split('@')[0]}!</span>
        <button onclick="app.logout()">تسجيل خروج</button>
      `;
    }
  }

  startGame() {
    if (!this.user) {
      notificationManager.show('يجب تسجيل الدخول أولاً', 'warning');
      uiManager.showScreen('auth');
      return;
    }
    
    uiManager.showScreen('game');
    audioManager.playMusic('game_music');
    
    if (this.game) {
      this.game.start(this.user.id);
    }
  }

  pauseGame() {
    if (this.game) {
      this.game.pause();
      document.getElementById('pause-menu')?.classList.add('active');
    }
  }

  resumeGame() {
    if (this.game) {
      this.game.resume();
      document.getElementById('pause-menu')?.classList.remove('active');
    }
  }

  quitGame() {
    if (this.game) {
      this.game.end();
    }
    uiManager.showScreen('menu');
    audioManager.playMusic('menu_music');
  }

  async showProfile() {
    if (!this.user) {
      notificationManager.show('يجب تسجيل الدخول أولاً', 'warning');
      uiManager.showScreen('auth');
      return;
    }
    
    uiManager.showScreen('profile');
    await profileUI.render(this.user.id);
  }

  showLeaderboard() {
    uiManager.showScreen('leaderboard');
  }

  showSettings() {
    uiManager.showScreen('settings');
  }

  async logout() {
    const { signOut } = await import('./online/auth-manager.js');
    await signOut();
    window.location.reload();
  }
}

// إنشاء وتشغيل التطبيق
const app = new SpeedballApp();
window.app = app;

window.addEventListener('DOMContentLoaded', () => {
  app.init();
});

export default app;
