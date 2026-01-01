// ============================================
// ✨ PARTICLE SYSTEM
// ============================================
// نظام جزيئات متقدم للتأثيرات البصرية

export class Particle {
  constructor(x, y, options = {}) {
    // الموقع
    this.x = x;
    this.y = y;
    
    // السرعة
    this.vx = options.vx || (Math.random() - 0.5) * 5;
    this.vy = options.vy || (Math.random() - 0.5) * 5;
    
    // التسارع
    this.ax = options.ax || 0;
    this.ay = options.ay || 0;
    
    // الخصائص البصرية
    this.size = options.size || 4;
    this.maxSize = this.size;
    this.minSize = options.minSize || 0;
    this.color = options.color || '#FFFFFF';
    this.alpha = options.alpha !== undefined ? options.alpha : 1.0;
    
    // العمر
    this.life = options.life || 1.0;
    this.maxLife = this.life;
    this.decay = options.decay || 0.02;
    
    // الفيزياء
    this.gravity = options.gravity !== undefined ? options.gravity : 0.1;
    this.friction = options.friction !== undefined ? options.friction : 0.98;
    this.bounce = options.bounce !== undefined ? options.bounce : 0;
    
    // الدوران
    this.rotation = options.rotation || 0;
    this.rotationSpeed = options.rotationSpeed || 0;
    
    // الشكل
    this.shape = options.shape || 'circle'; // circle, square, triangle, star
    
    // التلاشي
    this.fadeIn = options.fadeIn || false;
    this.fadeOut = options.fadeOut !== undefined ? options.fadeOut : true;
    
    // الحدود
    this.bounds = options.bounds || null;
  }
  
  update(deltaTime = 1) {
    // تحديث السرعة بالتسارع
    this.vx += this.ax * deltaTime;
    this.vy += this.ay * deltaTime;
    
    // تطبيق الجاذبية
    this.vy += this.gravity * deltaTime;
    
    // تطبيق الاحتكاك
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // تحديث الموقع
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // تحديث الدوران
    this.rotation += this.rotationSpeed * deltaTime;
    
    // تحديث الحياة
    this.life -= this.decay * deltaTime;
    
    // تحديث الشفافية والحجم
    const lifeRatio = this.life / this.maxLife;
    
    if (this.fadeOut) {
      this.alpha = lifeRatio;
    }
    
    if (this.fadeIn && lifeRatio > 0.8) {
      this.alpha = 1 - ((lifeRatio - 0.8) / 0.2);
    }
    
    this.size = this.minSize + (this.maxSize - this.minSize) * lifeRatio;
    
    // التحقق من الحدود والارتداد
    if (this.bounds && this.bounce > 0) {
      if (this.x < this.bounds.left || this.x > this.bounds.right) {
        this.vx *= -this.bounce;
        this.x = Math.max(this.bounds.left, Math.min(this.bounds.right, this.x));
      }
      if (this.y < this.bounds.top || this.y > this.bounds.bottom) {
        this.vy *= -this.bounce;
        this.y = Math.max(this.bounds.top, Math.min(this.bounds.bottom, this.y));
      }
    }
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    
    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'square':
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'star':
        this.drawStar(ctx, this.size);
        break;
        
      case 'line':
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }
  
  drawStar(ctx, size) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / spikes) * i;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
  
  isDead() {
    return this.life <= 0;
  }
}

// 🌟 نظام الجزيئات
export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 1000;
    this.emitters = [];
  }
  
  // 💥 إطلاق جزيئات
  emit(x, y, options = {}) {
    const count = options.count || 10;
    const spread = options.spread !== undefined ? options.spread : Math.PI * 2;
    const speed = options.speed || 5;
    const baseAngle = options.angle || 0;
    
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      const velocity = speed * (0.5 + Math.random() * 0.5);
      
      const particle = new Particle(x, y, {
        ...options,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        bounds: this.canvas ? {
          left: 0,
          right: this.canvas.width,
          top: 0,
          bottom: this.canvas.height
        } : null
      });
      
      this.particles.push(particle);
    }
  }
  
  // 🎆 انفجار
  explode(x, y, options = {}) {
    this.emit(x, y, {
      count: options.count || 30,
      spread: Math.PI * 2,
      speed: options.speed || 8,
      color: options.color || '#FF6B6B',
      size: options.size || 6,
      gravity: options.gravity !== undefined ? options.gravity : 0.2,
      life: options.life || 1.5,
      shape: options.shape || 'circle'
    });
  }
  
  // ✨ تأثير النجوم
  sparkle(x, y, options = {}) {
    this.emit(x, y, {
      count: options.count || 15,
      spread: Math.PI * 2,
      speed: options.speed || 3,
      color: options.color || '#FFD700',
      size: options.size || 4,
      gravity: -0.05,
      life: options.life || 1.0,
      shape: 'star',
      rotationSpeed: 0.1
    });
  }
  
  // 🌊 تأثير الدخان
  smoke(x, y, options = {}) {
    this.emit(x, y, {
      count: options.count || 5,
      spread: Math.PI / 4,
      speed: options.speed || 2,
      angle: -Math.PI / 2,
      color: options.color || '#888888',
      size: options.size || 10,
      maxSize: 15,
      gravity: -0.05,
      life: options.life || 2.0,
      decay: 0.01,
      shape: 'circle',
      alpha: 0.3
    });
  }
  
  // 💫 أثر متابع (Trail)
  trail(x, y, options = {}) {
    this.emit(x, y, {
      count: options.count || 3,
      spread: Math.PI / 8,
      speed: options.speed || 1,
      color: options.color || '#4ECDC4',
      size: options.size || 5,
      gravity: 0,
      life: options.life || 0.5,
      decay: 0.05,
      shape: 'circle'
    });
  }
  
  // 🎊 تأثير الكونفيتي
  confetti(x, y, options = {}) {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
    
    for (let i = 0; i < (options.count || 50); i++) {
      this.emit(x, y, {
        count: 1,
        spread: Math.PI * 2,
        speed: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        gravity: 0.3,
        life: 3.0,
        decay: 0.015,
        shape: Math.random() > 0.5 ? 'square' : 'circle',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        bounce: 0.6
      });
    }
  }
  
  // 💰 تأثير العملات
  coinEffect(x, y, options = {}) {
    this.emit(x, y, {
      count: options.count || 10,
      spread: Math.PI,
      speed: options.speed || 4,
      angle: -Math.PI / 2,
      color: options.color || '#FFD700',
      size: options.size || 8,
      gravity: 0.3,
      life: options.life || 1.5,
      shape: 'circle'
    });
  }
  
  // 🔥 تأثير النار
  fire(x, y, options = {}) {
    const colors = ['#FF4500', '#FF6347', '#FFA500', '#FFD700'];
    
    for (let i = 0; i < (options.count || 5); i++) {
      this.emit(x, y, {
        count: 1,
        spread: Math.PI / 6,
        speed: Math.random() * 3 + 2,
        angle: -Math.PI / 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        gravity: -0.2,
        life: 0.8,
        decay: 0.03,
        shape: 'circle',
        alpha: 0.7
      });
    }
  }
  
  // ⚡ تأثير البرق
  lightning(x1, y1, x2, y2, options = {}) {
    const segments = options.segments || 10;
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;
    
    for (let i = 0; i <= segments; i++) {
      const x = x1 + dx * i + (Math.random() - 0.5) * 20;
      const y = y1 + dy * i + (Math.random() - 0.5) * 20;
      
      this.emit(x, y, {
        count: 2,
        spread: Math.PI,
        speed: 1,
        color: options.color || '#00FFFF',
        size: 3,
        gravity: 0,
        life: 0.3,
        decay: 0.1,
        shape: 'circle'
      });
    }
  }
  
  // 🔄 تحديث جميع الجزيئات
  update(deltaTime = 1) {
    // تحديث جميع الجزيئات
    this.particles.forEach(particle => particle.update(deltaTime));
    
    // إزالة الجزيئات الميتة
    this.particles = this.particles.filter(particle => !particle.isDead());
    
    // تحديث المُصدرات
    this.emitters.forEach(emitter => emitter.update(deltaTime));
  }
  
  // 🎨 رسم جميع الجزيئات
  draw() {
    this.particles.forEach(particle => particle.draw(this.ctx));
  }
  
  // 🧹 تنظيف جميع الجزيئات
  clear() {
    this.particles = [];
  }
  
  // 📊 الحصول على الإحصائيات
  getStats() {
    return {
      activeParticles: this.particles.length,
      maxParticles: this.maxParticles,
      activeEmitters: this.emitters.length
    };
  }
  
  // ⚙️ تعيين الحد الأقصى للجزيئات
  setMaxParticles(max) {
    this.maxParticles = max;
  }
}

// 🎯 مُصدر جزيئات (Emitter)
export class ParticleEmitter {
  constructor(x, y, particleSystem, options = {}) {
    this.x = x;
    this.y = y;
    this.particleSystem = particleSystem;
    
    this.rate = options.rate || 0.1; // جزيئات في الثانية
    this.emitOptions = options.emitOptions || {};
    this.active = true;
    this.timer = 0;
    this.lifetime = options.lifetime || -1; // -1 = لا نهائي
    this.age = 0;
  }
  
  update(deltaTime) {
    if (!this.active) return;
    
    this.age += deltaTime;
    
    if (this.lifetime > 0 && this.age >= this.lifetime) {
      this.active = false;
      return;
    }
    
    this.timer += deltaTime;
    const interval = 1 / this.rate;
    
    while (this.timer >= interval) {
      this.particleSystem.emit(this.x, this.y, this.emitOptions);
      this.timer -= interval;
    }
  }
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  stop() {
    this.active = false;
  }
  
  start() {
    this.active = true;
    this.age = 0;
  }
}

// ✅ استخدام:
// import { ParticleSystem } from './particles.js';
// 
// const particles = new ParticleSystem(canvas);
// particles.explode(x, y, { color: '#FF6B6B', count: 30 });
// particles.update();
// particles.draw();
