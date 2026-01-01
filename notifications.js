// ============================================
// 🔔 NOTIFICATIONS MANAGER
// ============================================

export class NotificationManager {
  constructor() {
    this.queue = [];
    this.showing = false;
    this.container = null;
    this.init();
  }

  init() {
    if (!document.getElementById('notification-container')) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('notification-container');
    }
  }

  show(message, type = 'info', duration = 3000, options = {}) {
    this.queue.push({ message, type, duration, options });
    if (!this.showing) this.processQueue();
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.showing = false;
      return;
    }
    this.showing = true;
    const { message, type, duration, options } = this.queue.shift();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      padding: 15px 20px;
      background: ${this.getBackgroundColor(type)};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 200px;
      max-width: 400px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    const icon = document.createElement('span');
    icon.textContent = this.getIcon(type, options.icon);
    icon.style.fontSize = '24px';
    
    const text = document.createElement('span');
    text.textContent = message;
    text.style.flex = '1';
    
    notification.appendChild(icon);
    notification.appendChild(text);
    
    if (options.action) {
      const button = document.createElement('button');
      button.textContent = options.action.text;
      button.style.cssText = 'background: rgba(255,255,255,0.2); border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;';
      button.onclick = options.action.callback;
      notification.appendChild(button);
    }
    
    this.container.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
        this.processQueue();
      }, 300);
    }, duration);
  }

  getBackgroundColor(type) {
    const colors = {
      info: '#4ECDC4',
      success: '#51CF66',
      error: '#FF6B6B',
      warning: '#FFA94D',
      achievement: '#FFD700'
    };
    return colors[type] || colors.info;
  }

  getIcon(type, customIcon) {
    if (customIcon) return customIcon;
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      achievement: '🏆'
    };
    return icons[type] || icons.info;
  }

  clear() {
    this.queue = [];
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export const notificationManager = new NotificationManager();
