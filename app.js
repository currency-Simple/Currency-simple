// منطق لوحة التحكم (Dashboard)

const DashboardApp = {
  currentUser: null,
  userProgress: [],
  allLevels: [],
  selectedLevel: null,

  // تهيئة التطبيق
  async init() {
    try {
      Utils.showLoading();

      // التحقق من المصادقة
      this.currentUser = await Auth.requireAuth();
      if (!this.currentUser) return;

      // تحميل البيانات
      await this.loadData();

      // عرض البيانات
      this.displayUserInfo();
      this.displayLevels();
      this.displayProgress();

      // تهيئة الأحداث
      this.setupEventListeners();

      Utils.hideLoading();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      Utils.hideLoading();
      Utils.showError(ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },

  // تحميل البيانات
  async loadData() {
    try {
      // جلب المراحل
      this.allLevels = await Database.getAllLevels();

      // جلب تقدم المستخدم
      const userId = Auth.getUserId();
      this.userProgress = await Database.getUserProgress(userId);

      // جلب بيانات المستخدم المحدثة
      this.currentUser = await Database.getUserData(userId);
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  },

  // عرض معلومات المستخدم
  displayUserInfo() {
    const userNameEl = document.getElementById('userName');
    const userScoreEl = document.getElementById('userScore');
    const userLevelEl = document.getElementById('userLevel');
    const userAvatarEl = document.getElementById('userAvatar');

    if (userNameEl) {
      userNameEl.textContent = this.currentUser.username || 'مستخدم';
    }

    if (userScoreEl) {
      userScoreEl.textContent = Utils.formatNumber(this.currentUser.total_score || 0);
    }

    if (userLevelEl) {
      userLevelEl.textContent = this.currentUser.current_level || 1;
    }

    if (userAvatarEl && this.currentUser.avatar_url) {
      userAvatarEl.src = this.currentUser.avatar_url;
    }
  },

  // عرض المراحل
  displayLevels() {
    const levelsGrid = document.getElementById('levelsGrid');
    if (!levelsGrid) return;

    levelsGrid.innerHTML = '';

    const currentLevel = this.currentUser.current_level || 1;

    this.allLevels.forEach(level => {
      const progress = this.userProgress.find(p => p.level_number === level.level_number);
      const isLocked = level.level_number > currentLevel;
      const isCompleted = progress?.is_completed || false;
      const stars = progress?.stars || 0;

      const levelCard = document.createElement('div');
      levelCard.className = `level-card ${isLocked ? 'locked' : ''}`;
      levelCard.dataset.level = level.level_number;

      levelCard.innerHTML = `
        <div class="level-number">${level.level_number}</div>
        <div class="level-stars">
          ${this.renderStars(stars)}
        </div>
        <div class="level-status ${isCompleted ? 'completed' : (isLocked ? 'locked' : '')}">
          ${isCompleted ? 'مكتمل' : (isLocked ? 'مقفل' : 'جديد')}
        </div>
      `;

      if (!isLocked) {
        levelCard.addEventListener('click', () => this.showLevelPreview(level));
      }

      levelsGrid.appendChild(levelCard);
    });
  },

  // عرض النجوم
  renderStars(count) {
    let starsHTML = '';
    for (let i = 0; i < 3; i++) {
      if (i < count) {
        starsHTML += '<i class="fas fa-star"></i>';
      } else {
        starsHTML += '<i class="far fa-star empty"></i>';
      }
    }
    return starsHTML;
  },

  // عرض تفاصيل المرحلة
  showLevelPreview(level) {
    this.selectedLevel = level;
    
    const modal = document.getElementById('levelModal');
    const modalLevelNumber = document.getElementById('modalLevelNumber');
    const modalStars = document.getElementById('modalStars');
    const modalLevelImage = document.getElementById('modalLevelImage');
    const modalDifficulty = document.getElementById('modalDifficulty');
    const modalBestScore = document.getElementById('modalBestScore');

    if (!modal) return;

    // الحصول على تقدم المرحلة
    const progress = this.userProgress.find(p => p.level_number === level.level_number);

    if (modalLevelNumber) {
      modalLevelNumber.textContent = level.level_number;
    }

    if (modalStars) {
      modalStars.innerHTML = this.renderStars(progress?.stars || 0);
    }

    if (modalLevelImage) {
      modalLevelImage.src = level.image_url;
      modalLevelImage.alt = `مرحلة ${level.level_number}`;
    }

    if (modalDifficulty) {
      const difficultyText = {
        easy: 'سهل',
        medium: 'متوسط',
        hard: 'صعب'
      };
      modalDifficulty.textContent = difficultyText[level.difficulty] || 'متوسط';
    }

    if (modalBestScore) {
      modalBestScore.textContent = progress?.score || 0;
    }

    modal.classList.add('active');
  },

  // إخفاء نافذة المرحلة
  hideLevelPreview() {
    const modal = document.getElementById('levelModal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.selectedLevel = null;
  },

  // اللعب
  playLevel() {
    if (this.selectedLevel) {
      window.location.href = `game.html?level=${this.selectedLevel.level_number}`;
    }
  },

  // عرض التقدم
  displayProgress() {
    const completedLevelsEl = document.getElementById('completedLevels');
    const totalLevelsEl = document.getElementById('totalLevels');
    const progressFillEl = document.getElementById('progressFill');

    const completedCount = this.userProgress.filter(p => p.is_completed).length;
    const totalCount = this.allLevels.length;
    const percentage = (completedCount / totalCount) * 100;

    if (completedLevelsEl) {
      completedLevelsEl.textContent = completedCount;
    }

    if (totalLevelsEl) {
      totalLevelsEl.textContent = totalCount;
    }

    if (progressFillEl) {
      progressFillEl.style.width = `${percentage}%`;
      progressFillEl.textContent = `${Math.round(percentage)}%`;
    }
  },

  // عرض الإنجازات
  async showAchievements() {
    const modal = document.getElementById('achievementsModal');
    const achievementsGrid = document.getElementById('achievementsGrid');

    if (!modal || !achievementsGrid) return;

    Utils.showLoading();

    try {
      const userId = Auth.getUserId();
      const userAchievements = await Database.getUserAchievements(userId);
      const allAchievements = await Database.getAchievementsData();

      achievementsGrid.innerHTML = '';

      allAchievements.forEach(achievement => {
        const isUnlocked = userAchievements.some(
          a => a.achievement_id === achievement.id
        );

        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

        achievementCard.innerHTML = `
          <div class="achievement-icon">
            <i class="${achievement.icon}"></i>
          </div>
          <div class="achievement-info">
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
          </div>
          ${isUnlocked ? '<div class="achievement-badge"><i class="fas fa-check"></i></div>' : ''}
        `;

        achievementsGrid.appendChild(achievementCard);
      });

      modal.classList.add('active');
    } catch (error) {
      console.error('Error showing achievements:', error);
      Utils.showError('فشل تحميل الإنجازات');
    } finally {
      Utils.hideLoading();
    }
  },

  // إخفاء الإنجازات
  hideAchievements() {
    const modal = document.getElementById('achievementsModal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  // تهيئة مستمعي الأحداث
  setupEventListeners() {
    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => Auth.signOut());
    }

    // زر الإنجازات
    const achievementsBtn = document.getElementById('achievementsBtn');
    if (achievementsBtn) {
      achievementsBtn.addEventListener('click', () => this.showAchievements());
    }

    // إغلاق نافذة المرحلة
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
      closeModal.addEventListener('click', () => this.hideLevelPreview());
    }

    // زر اللعب
    const playLevelBtn = document.getElementById('playLevelBtn');
    if (playLevelBtn) {
      playLevelBtn.addEventListener('click', () => this.playLevel());
    }

    // إغلاق الإنجازات
    const closeAchievements = document.getElementById('closeAchievements');
    if (closeAchievements) {
      closeAchievements.addEventListener('click', () => this.hideAchievements());
    }

    // إغلاق النوافذ عند النقر خارجها
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  DashboardApp.init();
});