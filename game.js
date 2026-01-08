// منطق اللعبة الرئيسي

const GameApp = {
  currentUser: null,
  currentLevel: null,
  levelNumber: 1,
  attempts: 0,
  hintsUsed: 0,
  score: 0,
  answerSlots: [],
  letterTiles: [],

  // تهيئة اللعبة
  async init() {
    try {
      Utils.showLoading();

      // التحقق من المصادقة
      this.currentUser = await Auth.requireAuth();
      if (!this.currentUser) return;

      // الحصول على رقم المرحلة من URL
      this.levelNumber = parseInt(Utils.getUrlParameter('level')) || 1;

      // تحميل بيانات المرحلة
      await this.loadLevel();

      // تهيئة اللعبة
      this.setupGame();

      // تهيئة الأحداث
      this.setupEventListeners();

      Utils.hideLoading();
    } catch (error) {
      console.error('Error initializing game:', error);
      Utils.hideLoading();
      Utils.showError(ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },

  // تحميل بيانات المرحلة
  async loadLevel() {
    try {
      this.currentLevel = await Database.getLevelData(this.levelNumber);
      
      if (!this.currentLevel) {
        throw new Error(ERROR_MESSAGES.INVALID_LEVEL);
      }

      // إعادة تعيين البيانات
      this.attempts = 0;
      this.hintsUsed = 0;
      this.score = 0;

    } catch (error) {
      console.error('Error loading level:', error);
      throw error;
    }
  },

  // إعداد اللعبة
  setupGame() {
    // عرض معلومات المرحلة
    this.displayLevelInfo();

    // عرض الصورة
    this.displayImage();

    // إنشاء خانات الإجابة
    this.createAnswerSlots();

    // إنشاء بطاقات الحروف
    this.createLetterTiles();

    // تهيئة السحب والإفلات
    DragDrop.init(this.answerSlots, this.letterTiles);
  },

  // عرض معلومات المرحلة
  displayLevelInfo() {
    const currentLevelEl = document.getElementById('currentLevel');
    const attemptsLeftEl = document.getElementById('attemptsLeft');
    const currentScoreEl = document.getElementById('currentScore');

    if (currentLevelEl) {
      currentLevelEl.textContent = this.levelNumber;
    }

    if (attemptsLeftEl) {
      attemptsLeftEl.textContent = GAME_CONFIG.MAX_ATTEMPTS;
    }

    if (currentScoreEl) {
      currentScoreEl.textContent = 0;
    }
  },

  // عرض الصورة
  displayImage() {
    const levelImage = document.getElementById('levelImage');
    
    if (levelImage) {
      levelImage.src = this.currentLevel.image_url;
      levelImage.alt = `مرحلة ${this.levelNumber}`;
    }
  },

  // إنشاء خانات الإجابة
  createAnswerSlots() {
    const answerSlotsContainer = document.getElementById('answerSlots');
    if (!answerSlotsContainer) return;

    answerSlotsContainer.innerHTML = '';
    this.answerSlots = [];

    const answerLength = this.currentLevel.answer.length;

    for (let i = 0; i < answerLength; i++) {
      const slot = document.createElement('div');
      slot.className = 'answer-slot';
      slot.dataset.index = i;
      answerSlotsContainer.appendChild(slot);
      this.answerSlots.push(slot);
    }
  },

  // إنشاء بطاقات الحروف
  createLetterTiles() {
    const lettersContainer = document.getElementById('lettersContainer');
    if (!lettersContainer) return;

    lettersContainer.innerHTML = '';
    this.letterTiles = [];

    // خلط الحروف
    const shuffledLetters = Utils.shuffleArray(
      this.currentLevel.shuffled_letters.split('')
    );

    shuffledLetters.forEach((letter, index) => {
      const tile = document.createElement('div');
      tile.className = 'letter-tile';
      tile.textContent = letter;
      tile.dataset.letter = letter;
      tile.dataset.index = index;
      
      lettersContainer.appendChild(tile);
      this.letterTiles.push(tile);
    });
  },

  // التحقق من الإجابة
  checkAnswer() {
    const userAnswer = DragDrop.getCurrentAnswer();
    const correctAnswer = this.currentLevel.answer;

    // التحقق من اكتمال الإجابة
    if (userAnswer.includes('') || userAnswer.length !== correctAnswer.length) {
      Utils.showError('يرجى إكمال جميع الحروف');
      return;
    }

    this.attempts++;

    // التحقق من صحة الإجابة
    if (Utils.checkAnswer(userAnswer, correctAnswer)) {
      this.handleSuccess();
    } else {
      this.handleFailure();
    }
  },

  // معالجة النجاح
  async handleSuccess() {
    Utils.celebrateSuccess();
    DragDrop.disable();

    // حساب النقاط والنجوم
    const stars = Utils.calculateStars(this.attempts);
    this.score = Utils.calculateScore(this.attempts, this.hintsUsed);

    // حفظ التقدم
    await this.saveProgress(stars);

    // عرض نافذة النجاح
    await Utils.delay(1000);
    this.showSuccessModal(stars);
  },

  // معالجة الفشل
  handleFailure() {
    Utils.showFailAnimation();

    const attemptsLeft = GAME_CONFIG.MAX_ATTEMPTS - this.attempts;
    const attemptsLeftEl = document.getElementById('attemptsLeft');
    
    if (attemptsLeftEl) {
      attemptsLeftEl.textContent = attemptsLeft;
    }

    if (attemptsLeft > 0) {
      // لا يزال هناك محاولات
      Utils.showError(`إجابة خاطئة! تبقى ${attemptsLeft} محاولات`);
      DragDrop.clearAnswer();
    } else {
      // نفذت المحاولات
      DragDrop.disable();
      setTimeout(() => this.showFailModal(), 1000);
    }
  },

  // حفظ التقدم
  async saveProgress(stars) {
    try {
      const userId = Auth.getUserId();
      
      const progressData = {
        level_number: this.levelNumber,
        is_completed: true,
        stars: stars,
        score: this.score
      };

      await Database.saveLevelProgress(userId, progressData);

      // التحقق من الإنجازات
      await Database.checkAchievements(userId, this.levelNumber, stars, this.score);

    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },

  // عرض نافذة النجاح
  showSuccessModal(stars) {
    const modal = document.getElementById('successModal');
    const successStars = document.getElementById('successStars');
    const successScore = document.getElementById('successScore');
    const successAttempts = document.getElementById('successAttempts');

    if (!modal) return;

    // عرض النجوم
    if (successStars) {
      successStars.innerHTML = '';
      for (let i = 0; i < stars; i++) {
        successStars.innerHTML += '<i class="fas fa-star"></i>';
      }
    }

    if (successScore) {
      successScore.textContent = this.score;
    }

    if (successAttempts) {
      successAttempts.textContent = this.attempts;
    }

    modal.classList.add('active');
  },

  // عرض نافذة الفشل
  showFailModal() {
    const modal = document.getElementById('failModal');
    const correctAnswerText = document.getElementById('correctAnswerText');

    if (!modal) return;

    if (correctAnswerText) {
      correctAnswerText.textContent = this.currentLevel.answer;
    }

    modal.classList.add('active');
  },

  // إعادة اللعب
  async replay() {
    location.reload();
  },

  // المرحلة التالية
  goToNextLevel() {
    const nextLevel = this.levelNumber + 1;
    window.location.href = `game.html?level=${nextLevel}`;
  },

  // العودة للوحة التحكم
  goToDashboard() {
    window.location.href = 'dashboard.html';
  },

  // مسح الإجابة
  clearAnswer() {
    DragDrop.clearAnswer();
  },

  // عرض التلميح
  showHint() {
    const modal = document.getElementById('hintModal');
    const hintText = document.getElementById('hintText');

    if (!modal || !hintText) return;

    hintText.textContent = this.currentLevel.hint;
    modal.classList.add('active');
  },

  // قبول التلميح
  acceptHint() {
    this.hintsUsed++;
    
    const modal = document.getElementById('hintModal');
    if (modal) {
      modal.classList.remove('active');
    }

    Utils.showError(`تم خصم ${Math.abs(GAME_CONFIG.POINTS.HINT_PENALTY)} نقطة`);
  },

  // إغلاق نافذة التلميح
  closeHint() {
    const modal = document.getElementById('hintModal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  // تهيئة مستمعي الأحداث
  setupEventListeners() {
    // زر الرجوع
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goToDashboard());
    }

    // زر التحقق
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => this.checkAnswer());
    }

    // زر المسح
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAnswer());
    }

    // زر التلميح
    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => this.showHint());
    }

    // أزرار نافذة النجاح
    const replayBtn = document.getElementById('replayBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    
    if (replayBtn) {
      replayBtn.addEventListener('click', () => this.replay());
    }
    
    if (nextLevelBtn) {
      nextLevelBtn.addEventListener('click', () => this.goToNextLevel());
    }

    // أزرار نافذة الفشل
    const retryBtn = document.getElementById('retryBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.replay());
    }
    
    if (backToDashboardBtn) {
      backToDashboardBtn.addEventListener('click', () => this.goToDashboard());
    }

    // أزرار التلميح
    const acceptHintBtn = document.getElementById('acceptHintBtn');
    const closeHint = document.getElementById('closeHint');
    
    if (acceptHintBtn) {
      acceptHintBtn.addEventListener('click', () => this.acceptHint());
    }
    
    if (closeHint) {
      closeHint.addEventListener('click', () => this.closeHint());
    }
  }
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  GameApp.init();
});