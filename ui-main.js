// ============================================
// 🎨 UI MANAGER
// ============================================
import { Animations } from '../systems/animations.js';
import { audioManager } from '../systems/audio-manager.js';

export class UIManager {
  constructor() {
    this.screens = new Map();
    this.currentScreen = null;
    this.isTransitioning = false;
  }

  registerScreen(name, element) {
    if (!element) {
      console.error(`Screen element not found: ${name}`);
      return;
    }
    this.screens.set(name, element);
  }

  showScreen(name, transition = 'fade', duration = 300) {
    if (this.isTransitioning) return;
    const screen = this.screens.get(name);
    if (!screen) {
      console.error(`Screen not found: ${name}`);
      return;
    }
    this.isTransitioning = true;
    if (this.currentScreen) {
      const current = this.screens.get(this.currentScreen);
      if (current) {
        switch (transition) {
          case 'fade':
            Animations.fadeOut(current, duration, () => {
              Animations.fadeIn(screen, duration, () => {
                this.isTransitioning = false;
              });
            });
            break;
          case 'slide':
            Animations.slideOut(current, 'left', duration, () => {
              Animations.slideIn(screen, 'right', duration, () => {
                this.isTransitioning = false;
              });
            });
            break;
          default:
            current.classList.remove('active');
            screen.classList.add('active');
            this.isTransitioning = false;
        }
      }
    } else {
      Animations.fadeIn(screen, duration, () => {
        this.isTransitioning = false;
      });
    }
    this.currentScreen = name;
    if (audioManager) audioManager.playSound('swipe');
  }

  hideScreen(name) {
    const screen = this.screens.get(name);
    if (screen) {
      screen.classList.remove('active');
    }
  }

  updateUI(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      if (typeof content === 'number') {
        Animations.countUp(element, parseInt(element.textContent) || 0, content, 500);
      } else {
        element.textContent = content;
      }
    }
  }

  updateHTML(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  }

  showLoading(message = 'جاري التحميل...') {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.querySelector('p').textContent = message;
      loading.classList.add('active');
    }
  }

  hideLoading() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      Animations.fadeOut(loading, 300, () => {
        loading.classList.remove('active');
      });
    }
  }

  showMessage(message, type = 'info', duration = 3000) {
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast ${type}`;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    setTimeout(() => messageEl.classList.add('show'), 10);
    setTimeout(() => {
      messageEl.classList.remove('show');
      setTimeout(() => messageEl.remove(), 300);
    }, duration);
  }

  getCurrentScreen() {
    return this.currentScreen;
  }
}

export const uiManager = new UIManager();
