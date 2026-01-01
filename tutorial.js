// ============================================
// 📚 TUTORIAL SYSTEM
// ============================================

export const TUTORIAL_STEPS = [
  { title: 'مرحباً! 👋', text: 'مرحباً بك في Speedball 3D! لعبة كرة سريعة مثيرة', target: null },
  { title: 'التحكم 🎮', text: 'استخدم الأسهم أو اللمس للتحكم بالكرة يميناً ويساراً', target: '.game-controls' },
  { title: 'العملات 💰', text: 'اجمع العملات لفتح كرات وطرق جديدة رائعة', target: '#coins' },
  { title: 'النقاط 🎯', text: 'احصل على أعلى نقاط ممكنة وتجنب العوائق', target: '#best-score' },
  { title: 'المتصدرين 🏆', text: 'تنافس مع اللاعبين من جميع أنحاء العالم', target: '#btn-leaderboard' }
];

export class TutorialManager {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.overlay = null;
  }

  start() {
    if (localStorage.getItem('tutorial_completed')) {
      return;
    }
    this.currentStep = 0;
    this.isActive = true;
    this.showStep();
  }

  showStep() {
    if (this.currentStep >= TUTORIAL_STEPS.length) {
      this.complete();
      return;
    }
    
    const step = TUTORIAL_STEPS[this.currentStep];
    
    if (this.overlay) this.overlay.remove();
    
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const box = document.createElement('div');
    box.className = 'tutorial-box';
    box.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 30px;
      border-radius: 12px;
      max-width: 400px;
      text-align: center;
      color: white;
    `;
    
    const title = document.createElement('h3');
    title.textContent = step.title;
    title.style.cssText = 'font-size: 24px; margin-bottom: 15px;';
    
    const text = document.createElement('p');
    text.textContent = step.text;
    text.style.cssText = 'font-size: 16px; margin-bottom: 20px; line-height: 1.5;';
    
    const progress = document.createElement('div');
    progress.textContent = `${this.currentStep + 1} / ${TUTORIAL_STEPS.length}`;
    progress.style.cssText = 'font-size: 14px; opacity: 0.7; margin-bottom: 15px;';
    
    const button = document.createElement('button');
    button.textContent = this.currentStep < TUTORIAL_STEPS.length - 1 ? 'التالي ←' : 'ابدأ! 🚀';
    button.style.cssText = `
      background: #4ECDC4;
      border: none;
      padding: 12px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      color: #000;
    `;
    button.onclick = () => this.next();
    
    const skipButton = document.createElement('button');
    skipButton.textContent = 'تخطي';
    skipButton.style.cssText = `
      background: transparent;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      color: white;
      margin-right: 10px;
    `;
    skipButton.onclick = () => this.skip();
    
    box.appendChild(title);
    box.appendChild(text);
    box.appendChild(progress);
    box.appendChild(skipButton);
    box.appendChild(button);
    this.overlay.appendChild(box);
    
    document.body.appendChild(this.overlay);
    
    if (step.target) {
      const target = document.querySelector(step.target);
      if (target) {
        target.style.position = 'relative';
        target.style.zIndex = '9999';
      }
    }
  }

  next() {
    this.currentStep++;
    this.showStep();
  }

  skip() {
    this.complete();
  }

  complete() {
    if (this.overlay) this.overlay.remove();
    this.isActive = false;
    localStorage.setItem('tutorial_completed', 'true');
  }

  reset() {
    localStorage.removeItem('tutorial_completed');
  }
}

export const tutorialManager = new TutorialManager();

export function showTutorial() {
  tutorialManager.start();
}
