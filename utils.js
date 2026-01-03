// ==================== UTILS.JS - وظائف مساعدة ====================

// ==================== التخزين المحلي ====================
const LocalStorage = {
    // حفظ بيانات
    set(key, value) {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(key, data);
            return true;
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
            return false;
        }
    },
    
    // جلب بيانات
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('❌ Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    // حذف بيانات
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('❌ Error removing from localStorage:', error);
            return false;
        }
    },
    
    // مسح كل البيانات
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('❌ Error clearing localStorage:', error);
            return false;
        }
    }
};

// ==================== العمليات الرياضية ====================
const MathUtils = {
    // رقم عشوائي بين min و max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // رقم عشوائي صحيح
    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    },
    
    // تقريب إلى عدد معين من الأرقام العشرية
    round(value, decimals = 2) {
        const multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    },
    
    // تحويل نسبة مئوية إلى قيمة
    percentToValue(percent, total) {
        return (percent / 100) * total;
    },
    
    // تحويل قيمة إلى نسبة مئوية
    valueToPercent(value, total) {
        return (value / total) * 100;
    },
    
    // حساب المسافة بين نقطتين
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    // تحديد قيمة بين حد أدنى وأقصى
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // استيفاء خطي
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
};

// ==================== التعامل مع الوقت ====================
const TimeUtils = {
    // تنسيق الوقت (ms إلى mm:ss)
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // تنسيق التاريخ
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // الوقت النسبي (منذ كم من الوقت)
    timeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return 'الآن';
        if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
        if (diffHour < 24) return `منذ ${diffHour} ساعة`;
        if (diffDay < 7) return `منذ ${diffDay} يوم`;
        return this.formatDate(date);
    },
    
    // تأخير (Promise)
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ==================== التعامل مع النصوص ====================
const StringUtils = {
    // اختصار النص
    truncate(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    },
    
    // تحويل إلى حالة عنوان
    titleCase(text) {
        return text.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },
    
    // إزالة المسافات الزائدة
    cleanSpaces(text) {
        return text.replace(/\s+/g, ' ').trim();
    },
    
    // تحويل إلى slug
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    },
    
    // تنسيق الأرقام
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
};

// ==================== فحص الاصطدام ====================
const CollisionUtils = {
    // فحص اصطدام دوائر
    circleCircle(x1, y1, r1, x2, y2, r2) {
        const distance = MathUtils.distance(x1, y1, x2, y2);
        return distance < r1 + r2;
    },
    
    // فحص اصطدام مربعات
    rectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    },
    
    // فحص اصطدام دائرة ومربع
    circleRect(cx, cy, radius, rx, ry, rw, rh) {
        const testX = MathUtils.clamp(cx, rx, rx + rw);
        const testY = MathUtils.clamp(cy, ry, ry + rh);
        const distance = MathUtils.distance(cx, cy, testX, testY);
        return distance <= radius;
    },
    
    // فحص نقطة داخل دائرة
    pointInCircle(px, py, cx, cy, radius) {
        return MathUtils.distance(px, py, cx, cy) <= radius;
    },
    
    // فحص نقطة داخل مربع
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw &&
               py >= ry && py <= ry + rh;
    }
};

// ==================== الرسوم المتحركة ====================
const AnimationUtils = {
    // تلاشي ظهور
    fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            element.style.opacity = Math.min(progress, 1);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    },
    
    // تلاشي اختفاء
    fadeOut(element, duration = 300) {
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            element.style.opacity = 1 - Math.min(progress, 1);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        requestAnimationFrame(animate);
    },
    
    // انزلاق للأسفل
    slideDown(element, duration = 300) {
        element.style.maxHeight = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const height = element.scrollHeight;
        let start = null;
        
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            element.style.maxHeight = (height * Math.min(progress, 1)) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.maxHeight = 'none';
            }
        }
        requestAnimationFrame(animate);
    },
    
    // اهتزاز
    shake(element, intensity = 5, duration = 500) {
        const originalTransform = element.style.transform || '';
        let start = null;
        
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            if (progress < 1) {
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
            }
        }
        requestAnimationFrame(animate);
    }
};

// ==================== معالج الأحداث ====================
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
    
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}

// ==================== التحقق من الصحة ====================
const ValidationUtils = {
    // التحقق من البريد الإلكتروني
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // التحقق من كلمة المرور
    isValidPassword(password, minLength = 6) {
        return password && password.length >= minLength;
    },
    
    // التحقق من اسم المستخدم
    isValidUsername(username) {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(username);
    },
    
    // التحقق من URL
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// ==================== متصفح ====================
const BrowserUtils = {
    // نسخ إلى الحافظة
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('❌ Error copying to clipboard:', error);
            return false;
        }
    },
    
    // مشاركة (Web Share API)
    async share(data) {
        if (!navigator.share) {
            console.warn('⚠️ Web Share API not supported');
            return false;
        }
        
        try {
            await navigator.share(data);
            return true;
        } catch (error) {
            console.error('❌ Error sharing:', error);
            return false;
        }
    },
    
    // اهتزاز
    vibrate(pattern = 200) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
            return true;
        }
        return false;
    },
    
    // ملء الشاشة
    async requestFullscreen(element = document.documentElement) {
        try {
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
            return true;
        } catch (error) {
            console.error('❌ Error requesting fullscreen:', error);
            return false;
        }
    }
};

// ==================== تصدير الوظائف ====================
window.LocalStorage = LocalStorage;
window.MathUtils = MathUtils;
window.TimeUtils = TimeUtils;
window.StringUtils = StringUtils;
window.CollisionUtils = CollisionUtils;
window.AnimationUtils = AnimationUtils;
window.EventEmitter = EventEmitter;
window.ValidationUtils = ValidationUtils;
window.BrowserUtils = BrowserUtils;

console.log('✅ Utils.js loaded successfully');
