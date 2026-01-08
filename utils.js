// دوال مساعدة عامة

const Utils = {
  // عرض/إخفاء مؤشر التحميل
  showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('active');
    }
  },

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  },

  // عرض رسالة خطأ
  showError(message) {
    const toast = document.getElementById('errorToast');
    const messageEl = document.getElementById('errorMessage');
    
    if (toast && messageEl) {
      messageEl.textContent = message;
      toast.classList.add('active');
      
      setTimeout(() => {
        toast.classList.remove('active');
      }, 5000);
    } else {
      alert(message);
    }
  },

  // خلط مصفوفة (Shuffle)
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // تخزين بيانات محلية
  setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  getLocalStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // الحصول على معامل URL
  getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  // تنسيق التاريخ
  formatDate(date) {
    const d = new Date(date);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return d.toLocaleDateString('ar-SA', options);
  },

  // حساب النجوم بناءً على المحاولات
  calculateStars(attempts) {
    if (attempts === 1) return 3;
    if (attempts === 2) return 2;
    return 1;
  },

  // حساب النقاط بناءً على الأداء
  calculateScore(attempts, hintsUsed) {
    let score = 0;
    
    if (attempts === 1) {
      score = GAME_CONFIG.POINTS.FIRST_TRY;
    } else if (attempts === 2) {
      score = GAME_CONFIG.POINTS.SECOND_TRY;
    } else {
      score = GAME_CONFIG.POINTS.THIRD_TRY;
    }
    
    // خصم نقاط التلميحات
    score -= hintsUsed * Math.abs(GAME_CONFIG.POINTS.HINT_PENALTY);
    
    return Math.max(0, score);
  },

  // تحويل النص العربي إلى حروف منفصلة
  arabicToLetters(text) {
    return text.split('');
  },

  // إزالة التشكيل من النص العربي
  removeDiacritics(text) {
    return text.replace(/[\u064B-\u065F]/g, '');
  },

  // التحقق من صحة الإجابة
  checkAnswer(userAnswer, correctAnswer) {
    const cleanUser = this.removeDiacritics(userAnswer.trim().toLowerCase());
    const cleanCorrect = this.removeDiacritics(correctAnswer.trim().toLowerCase());
    return cleanUser === cleanCorrect;
  },

  // تأخير (Delay)
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // تشغيل صوت
  playSound(soundName) {
    if (!GAME_CONFIG.SOUND.ENABLED) return;
    
    try {
      const audio = new Audio(`${PATHS.SOUNDS}${soundName}.mp3`);
      audio.volume = GAME_CONFIG.SOUND.VOLUME;
      audio.play().catch(err => console.log('Sound play failed:', err));
    } catch (error) {
      console.log('Sound not available:', soundName);
    }
  },

  // أنيميشن النجاح
  celebrateSuccess() {
    this.playSound('success');
    // يمكن إضافة Confetti هنا
  },

  // أنيميشن الفشل
  showFailAnimation() {
    this.playSound('fail');
  },

  // تحميل ملف JSON
  async loadJSON(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading JSON:', error);
      throw error;
    }
  },

  // تنسيق الأرقام
  formatNumber(num) {
    return num.toLocaleString('ar-SA');
  },

  // التحقق من الاتصال بالإنترنت
  isOnline() {
    return navigator.onLine;
  },

  // نسخ نص إلى الحافظة
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  },

  // إنشاء ID فريد
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // ضغط صورة
  async compressImage(file, maxWidth = 800) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.8);
        };
      };
    });
  },

  // التحقق من صحة البريد الإلكتروني
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // دالة debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // دالة throttle
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}