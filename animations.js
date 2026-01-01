// ============================================
// ✨ ANIMATIONS LIBRARY
// ============================================
// مكتبة الرسوم المتحركة للواجهة

// 🎭 دوال الرسوم المتحركة الأساسية
export const Animations = {
  
  // 📥 تلاشي للظهور
  fadeIn(element, duration = 300, callback) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    }
    
    requestAnimationFrame(animate);
  },
  
  // 📤 تلاشي للاختفاء
  fadeOut(element, duration = 300, callback) {
    if (!element) return;
    
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = initialOpacity * (1 - progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        if (callback) callback();
      }
    }
    
    requestAnimationFrame(animate);
  },
  
  // ➡️ انزلاق للداخل
  slideIn(element, direction = 'left', duration = 300, callback) {
    if (!element) return;
    
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)'
    };
    
    element.style.transform = transforms[direction] || transforms.left;
    element.style.display = 'block';
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
      element.style.transform = 'translate(0, 0)';
      element.style.opacity = '1';
      
      setTimeout(() => {
        element.style.transition = '';
        if (callback) callback();
      }, duration);
    }, 10);
  },
  
  // ⬅️ انزلاق للخارج
  slideOut(element, direction = 'left', duration = 300, callback) {
    if (!element) return;
    
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)'
    };
    
    element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;
    element.style.transform = transforms[direction] || transforms.left;
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.display = 'none';
      element.style.transition = '';
      if (callback) callback();
    }, duration);
  },
  
  // 🎯 نطة (Bounce)
  bounce(element, scale = 1.2, duration = 300) {
    if (!element) return;
    
    const originalTransform = element.style.transform || '';
    
    element.style.transition = `transform ${duration / 2}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
    element.style.transform = `${originalTransform} scale(${scale})`;
    
    setTimeout(() => {
      element.style.transform = originalTransform;
      
      setTimeout(() => {
        element.style.transition = '';
      }, duration / 2);
    }, duration / 2);
  },
  
  // 🔄 اهتزاز
  shake(element, intensity = 10, duration = 300) {
    if (!element) return;
    
    const originalTransform = element.style.transform || '';
    const startTime = Date.now();
    
    function animate() {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);
        const x = (Math.random() - 0.5) * currentIntensity * 2;
        const y = (Math.random() - 0.5) * currentIntensity * 2;
        
        element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
        requestAnimationFrame(animate);
      } else {
        element.style.transform = originalTransform;
      }
    }
    
    animate();
  },
  
  // 💓 نبضة
  pulse(element, duration = 1000, iterations = 'infinite') {
    if (!element) return;
    
    element.style.animation = `pulse ${duration}ms ease-in-out ${iterations}`;
    
    // إنشاء keyframes إذا لم تكن موجودة
    if (!document.getElementById('pulse-keyframes')) {
      const style = document.createElement('style');
      style.id = 'pulse-keyframes';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  // 🌀 دوران
  rotate(element, degrees = 360, duration = 1000, iterations = 1) {
    if (!element) return;
    
    element.style.animation = `rotate ${duration}ms linear ${iterations === 'infinite' ? 'infinite' : iterations}`;
    
    if (!document.getElementById('rotate-keyframes')) {
      const style = document.createElement('style');
      style.id = 'rotate-keyframes';
      style.textContent = `
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(${degrees}deg); }
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  // 🔢 عداد صاعد
  countUp(element, start, end, duration = 1000, callback) {
    if (!element) return;
    
    const startTime = Date.now();
    const range = end - start;
    
    function update() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // تطبيق easing (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + range * easedProgress);
      
      element.textContent = current.toLocaleString('ar');
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = end.toLocaleString('ar');
        if (callback) callback();
      }
    }
    
    update();
  },
  
  // 📏 شريط تقدم
  progressBar(element, targetPercent, duration = 1000, callback) {
    if (!element) return;
    
    const startWidth = parseFloat(element.style.width) || 0;
    const startTime = Date.now();
    
    function update() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentWidth = startWidth + (targetPercent - startWidth) * progress;
      element.style.width = currentWidth + '%';
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else if (callback) {
        callback();
      }
    }
    
    update();
  },
  
  // 💫 تأثير الريبل (موجة)
  ripple(element, event) {
    if (!element) return;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    // إنشاء CSS إذا لم يكن موجود
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }
        @keyframes ripple-animation {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => ripple.remove(), 600);
  },
  
  // 🌊 تأثير موجي
  wave(elements, delay = 100) {
    if (!elements || !elements.length) return;
    
    elements.forEach((element, index) => {
      setTimeout(() => {
        this.bounce(element, 1.1, 300);
      }, index * delay);
    });
  },
  
  // 📺 تأثير الظهور بالتكبير
  zoomIn(element, duration = 300, callback) {
    if (!element) return;
    
    element.style.transform = 'scale(0)';
    element.style.opacity = '0';
    element.style.display = 'block';
    
    setTimeout(() => {
      element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity ${duration}ms ease-out`;
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
      
      setTimeout(() => {
        element.style.transition = '';
        if (callback) callback();
      }, duration);
    }, 10);
  },
  
  // 🎯 تأثير الاختفاء بالتصغير
  zoomOut(element, duration = 300, callback) {
    if (!element) return;
    
    element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;
    element.style.transform = 'scale(0)';
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.display = 'none';
      element.style.transition = '';
      element.style.transform = 'scale(1)';
      if (callback) callback();
    }, duration);
  },
  
  // 🎨 تأثير تغيير اللون
  colorTransition(element, fromColor, toColor, duration = 500) {
    if (!element) return;
    
    element.style.transition = `color ${duration}ms ease, background-color ${duration}ms ease`;
    element.style.color = toColor;
    element.style.backgroundColor = toColor;
  },
  
  // 🔝 تمرير سلس
  smoothScroll(element, target, duration = 500) {
    if (!element) return;
    
    const start = element.scrollTop;
    const distance = target - start;
    const startTime = Date.now();
    
    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuad(progress);
      
      element.scrollTop = start + distance * eased;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    animate();
  }
};

// 🎬 مدير تسلسل الرسوم المتحركة
export class AnimationSequence {
  constructor() {
    this.queue = [];
    this.isPlaying = false;
  }
  
  add(animation, delay = 0) {
    this.queue.push({ animation, delay });
    return this;
  }
  
  async play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    for (const { animation, delay } of this.queue) {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await new Promise(resolve => {
        animation(resolve);
      });
    }
    
    this.isPlaying = false;
    this.queue = [];
  }
  
  clear() {
    this.queue = [];
  }
}

// 🎯 دوال مساعدة لـ Easing
export const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  bounce: t => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
};

// ✅ استخدام:
// import { Animations, AnimationSequence } from './animations.js';
// Animations.fadeIn(element, 300);
// Animations.countUp(element, 0, 1000, 2000);
