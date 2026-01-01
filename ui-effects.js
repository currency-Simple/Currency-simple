// ============================================
// ✨ UI EFFECTS
// ============================================

export const UIEffects = {
  confetti(x = window.innerWidth / 2, y = 0, count = 50) {
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = x + (Math.random() - 0.5) * 100 + 'px';
      confetti.style.top = y + 'px';
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.textContent = `
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          z-index: 9999;
          animation: confetti-fall linear forwards;
        }
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  },

  ripple(element, event) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = element.getBoundingClientRect();
    ripple.style.left = (event.clientX - rect.left) + 'px';
    ripple.style.top = (event.clientY - rect.top) + 'px';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          width: 100px;
          height: 100px;
          margin-left: -50px;
          margin-top: -50px;
          animation: ripple-animation 0.6s;
          pointer-events: none;
        }
        @keyframes ripple-animation {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  },

  flash(element, color = '#FFFFFF', duration = 200) {
    const original = element.style.backgroundColor;
    element.style.transition = `background-color ${duration}ms`;
    element.style.backgroundColor = color;
    setTimeout(() => {
      element.style.backgroundColor = original;
    }, duration);
  },

  glow(element, color = '#4ECDC4', duration = 1000) {
    element.style.transition = `box-shadow ${duration}ms`;
    element.style.boxShadow = `0 0 20px ${color}`;
    setTimeout(() => {
      element.style.boxShadow = '';
    }, duration);
  },

  typewriter(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
  }
};

export default UIEffects;
