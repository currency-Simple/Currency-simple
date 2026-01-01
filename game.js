// ============================================
// 🎮 GAME CORE ENGINE
// ============================================
// محرك اللعبة الأساسي - Speedball 3D

import { saveGameSession } from '../online/online-save.js';
import { updateLeaderboardScore } from '../online/online-leaderboard.js';

// ⚙️ إعدادات اللعبة
const GAME_CONFIG = {
  physics: {
    gravity: 0.05,
    friction: 0.98,
    bounceSpeed: 0.3,
    maxSpeed: 0.8
  },
  scoring: {
    pointsPerSecond: 1,
    obstacleBonus: 10,
    comboMultiplier: 1.5,
    perfectBonus: 50
  },
  difficulty: {
    easy: { speed: 1, obstacleFrequency: 0.01 },
    medium: { speed: 1.5, obstacleFrequency: 0.015 },
    hard: { speed: 2, obstacleFrequency: 0.02 }
  }
};

// 🎯 حالة اللعبة
class GameState {
  constructor() {
    this.isPlaying = false;
    this.isPaused = false;
    this.gameOver = false;
    this.score = 0;
    this.startTime = null;
    this.elapsedTime = 0;
    this.difficulty = 'medium';
    this.combo = 0;
    this.perfectStreak = 0;
  }

  reset() {
    this.isPlaying = false;
    this.isPaused = false;
    this.gameOver = false;
    this.score = 0;
    this.startTime = null;
    this.elapsedTime = 0;
    this.combo = 0;
    this.perfectStreak = 0;
  }

  start() {
    this.isPlaying = true;
    this.isPaused = false;
    this.gameOver = false;
    this.startTime = Date.now();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  end() {
    this.isPlaying = false;
    this.gameOver = true;
  }

  updateElapsedTime() {
    if (this.isPlaying && !this.isPaused && this.startTime) {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }
  }
}

// ⚽ الكرة
class Ball {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocityX = 0;
    this.velocityY = 0;
    this.trail = [];
    this.maxTrailLength = 20;
  }

  update() {
    // الجاذبية
    this.velocityY += GAME_CONFIG.physics.gravity;

    // الاحتكاك
    this.velocityX *= GAME_CONFIG.physics.friction;
    this.velocityY *= GAME_CONFIG.physics.friction;

    // الحد الأقصى للسرعة
    const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
    if (speed > GAME_CONFIG.physics.maxSpeed) {
      const ratio = GAME_CONFIG.physics.maxSpeed / speed;
      this.velocityX *= ratio;
      this.velocityY *= ratio;
    }

    // تحديث الموقع
    this.x += this.velocityX;
    this.y += this.velocityY;

    // إضافة للمسار
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }

  move(direction) {
    const moveSpeed = 0.15;
    if (direction === 'left') {
      this.velocityX = -moveSpeed;
    } else if (direction === 'right') {
      this.velocityX = moveSpeed;
    }
  }

  bounce() {
    this.velocityY = -GAME_CONFIG.physics.bounceSpeed;
  }

  draw(ctx) {
    // رسم المسار
    if (this.trail.length > 1) {
      ctx.strokeStyle = this.color + '40';
      ctx.lineWidth = this.radius;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.stroke();
    }

    // رسم الكرة
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // توهج
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, this.color + 'FF');
    gradient.addColorStop(0.5, this.color + 'AA');
    gradient.addColorStop(1, this.color + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 🛣️ الطريق
class Road {
  constructor(width, color, pattern = 'default') {
    this.width = width;
    this.color = color;
    this.pattern = pattern;
    this.lanes = 3;
    this.centerX = width / 2;
  }

  draw(ctx, height, scrollY) {
    // خلفية الطريق
    ctx.fillStyle = this.color + '40';
    ctx.fillRect(0, 0, this.width, height);

    // الخطوط
    this.drawLanes(ctx, height, scrollY);
  }

  drawLanes(ctx, height, scrollY) {
    const laneWidth = this.width / this.lanes;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -scrollY;

    for (let i = 1; i < this.lanes; i++) {
      const x = laneWidth * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  getLanePosition(laneIndex) {
    const laneWidth = this.width / this.lanes;
    return laneWidth * laneIndex + laneWidth / 2;
  }
}

// 🚧 العوائق
class Obstacle {
  constructor(x, y, width, height, type = 'triangle') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.passed = false;
    this.color = '#FF6B6B';
  }

  update(speed) {
    this.y += speed;
  }

  isOffScreen(canvasHeight) {
    return this.y > canvasHeight + this.height;
  }

  checkCollision(ball) {
    const dx = ball.x - Math.max(this.x, Math.min(ball.x, this.x + this.width));
    const dy = ball.y - Math.max(this.y, Math.min(ball.y, this.y + this.height));
    return (dx * dx + dy * dy) < (ball.radius * ball.radius);
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    if (this.type === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'rectangle') {
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

// 🎮 محرك اللعبة الرئيسي
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = new GameState();
    this.ball = null;
    this.road = null;
    this.obstacles = [];
    this.scrollY = 0;
    this.userId = null;
    
    this.init();
  }

  init() {
    // إنشاء الكرة
    this.ball = new Ball(
      this.canvas.width / 2,
      this.canvas.height - 100,
      20,
      '#4ECDC4'
    );

    // إنشاء الطريق
    this.road = new Road(this.canvas.width, '#00FF88', 'default');

    // ربط التحكم
    this.setupControls();
  }

  setupControls() {
    // لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
      if (!this.state.isPlaying || this.state.isPaused) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.ball.move('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        this.ball.move('right');
      } else if (e.key === ' ') {
        this.ball.bounce();
      }
    });

    // اللمس للموبايل
    this.canvas.addEventListener('touchstart', (e) => {
      if (!this.state.isPlaying || this.state.isPaused) return;
      
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      
      if (x < this.canvas.width / 2) {
        this.ball.move('left');
      } else {
        this.ball.move('right');
      }
      
      e.preventDefault();
    });
  }

  start(userId) {
    this.userId = userId;
    this.state.reset();
    this.state.start();
    this.obstacles = [];
    this.scrollY = 0;
    
    // إنشاء الكرة من جديد
    this.ball = new Ball(
      this.canvas.width / 2,
      this.canvas.height - 100,
      20,
      '#4ECDC4'
    );
    
    this.gameLoop();
  }

  pause() {
    this.state.pause();
  }

  resume() {
    this.state.resume();
    this.gameLoop();
  }

  async end() {
    this.state.end();
    
    // حفظ الجلسة
    if (this.userId) {
      await saveGameSession({
        score: this.state.score,
        duration: this.state.elapsedTime,
        ballsUsed: 1,
        coinsEarned: Math.floor(this.state.score / 10),
        roadType: 'default',
        ballType: 'default'
      });
      
      // تحديث لوحة المتصدرين
      await updateLeaderboardScore(this.userId, this.state.score);
    }
  }

  gameLoop() {
    if (!this.state.isPlaying || this.state.isPaused) return;

    this.update();
    this.draw();

    if (!this.state.gameOver) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }

  update() {
    // تحديث الوقت
    this.state.updateElapsedTime();

    // تحديث النقاط
    this.state.score += GAME_CONFIG.scoring.pointsPerSecond / 60;

    // تحديث الكرة
    this.ball.update();

    // التحقق من الحدود
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.velocityX = 0;
    }
    if (this.ball.x + this.ball.radius > this.canvas.width) {
      this.ball.x = this.canvas.width - this.ball.radius;
      this.ball.velocityX = 0;
    }

    // التحقق من السقوط
    if (this.ball.y > this.canvas.height + this.ball.radius) {
      this.end();
      return;
    }

    // تحديث التمرير
    this.scrollY += 5;

    // توليد عوائق
    if (Math.random() < GAME_CONFIG.difficulty[this.state.difficulty].obstacleFrequency) {
      this.spawnObstacle();
    }

    // تحديث العوائق
    this.obstacles.forEach((obstacle, index) => {
      obstacle.update(5);

      // التحقق من الاصطدام
      if (obstacle.checkCollision(this.ball)) {
        this.end();
        return;
      }

      // التحقق من المرور
      if (!obstacle.passed && obstacle.y > this.ball.y) {
        obstacle.passed = true;
        this.state.score += GAME_CONFIG.scoring.obstacleBonus;
        this.state.combo++;
      }

      // إزالة العوائق خارج الشاشة
      if (obstacle.isOffScreen(this.canvas.height)) {
        this.obstacles.splice(index, 1);
      }
    });
  }

  spawnObstacle() {
    const lane = Math.floor(Math.random() * this.road.lanes);
    const x = this.road.getLanePosition(lane) - 25;
    const y = -50;
    
    const obstacle = new Obstacle(x, y, 50, 50, 'triangle');
    this.obstacles.push(obstacle);
  }

  draw() {
    // مسح الشاشة
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // رسم الطريق
    this.road.draw(this.ctx, this.canvas.height, this.scrollY);

    // رسم العوائق
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));

    // رسم الكرة
    this.ball.draw(this.ctx);

    // رسم النقاط
    this.drawScore();
  }

  drawScore() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(Math.floor(this.state.score), this.canvas.width - 20, 50);
    
    // الوقت
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`${this.state.elapsedTime}s`, this.canvas.width - 20, 80);
  }
}

// ✅ استخدام:
// import { Game } from './game.js';
// const game = new Game(canvasElement);
// game.start(userId);
