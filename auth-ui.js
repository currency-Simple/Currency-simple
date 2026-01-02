// ============================================
// 🎨 AUTH UI (مع OAuth)
// ============================================

class AuthUI {
  constructor() {
    this.mode = 'login';
  }

  init() {
    this.setupEventListeners();
    this.checkOAuthCallback();
  }

  setupEventListeners() {
    const form = document.getElementById('auth-form');
    const toggleLink = document.getElementById('auth-toggle-link');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');

    // OAuth Buttons
    const googleBtn = document.getElementById('btn-google');
    const githubBtn = document.getElementById('btn-github');
    const discordBtn = document.getElementById('btn-discord');

    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    toggleLink?.addEventListener('click', (e) => this.toggleMode(e));
    emailInput?.addEventListener('input', () => this.validateEmailInput());
    passwordInput?.addEventListener('input', () => this.validatePasswordInput());

    // OAuth Events
    googleBtn?.addEventListener('click', () => this.handleGoogleSignIn());
    githubBtn?.addEventListener('click', () => this.handleGithubSignIn());
    discordBtn?.addEventListener('click', () => this.handleDiscordSignIn());
  }

  async handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    const submitBtn = document.getElementById('auth-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>جاري التحميل...</span>';

    let result;
    if (this.mode === 'login') {
      result = await window.authManager.signIn(email, password);
    } else {
      result = await window.authManager.signUp(email, password);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    this.showMessage(result.message || result.error, result.success ? 'success' : 'error');

    if (result.success) {
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  async handleGoogleSignIn() {
    this.showMessage('جاري التحويل إلى Google...', 'info');
    const result = await window.authManager.signInWithGoogle();
    if (!result.success) {
      this.showMessage(result.error, 'error');
    }
  }

  async handleGithubSignIn() {
    this.showMessage('جاري التحويل إلى GitHub...', 'info');
    const result = await window.authManager.signInWithGithub();
    if (!result.success) {
      this.showMessage(result.error, 'error');
    }
  }

  async handleDiscordSignIn() {
    this.showMessage('جاري التحويل إلى Discord...', 'info');
    const result = await window.authManager.signInWithDiscord();
    if (!result.success) {
      this.showMessage(result.error, 'error');
    }
  }

  toggleMode(e) {
    e.preventDefault();
    this.mode = this.mode === 'login' ? 'signup' : 'login';
    
    document.getElementById('auth-title').textContent = 
      this.mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب';
    
    document.getElementById('auth-submit-text').textContent = 
      this.mode === 'login' ? 'دخول' : 'تسجيل';
    
    document.getElementById('auth-toggle-text').textContent = 
      this.mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟';
    
    document.getElementById('auth-toggle-link').textContent = 
      this.mode === 'login' ? 'سجل الآن' : 'سجل دخول';
  }

  validateEmailInput() {
    const input = document.getElementById('auth-email');
    const hint = document.getElementById('email-hint');
    const validation = window.authManager.validateEmail(input.value);
    
    hint.textContent = validation.message;
    hint.className = validation.valid ? 'input-hint success' : 'input-hint error';
  }

  validatePasswordInput() {
    const input = document.getElementById('auth-password');
    const hint = document.getElementById('password-hint');
    const bar = document.getElementById('password-strength');
    const validation = window.authManager.validatePassword(input.value);
    
    hint.textContent = validation.message;
    hint.className = validation.valid ? 'input-hint success' : 'input-hint error';
    
    if (bar) {
      bar.style.width = validation.strength + '%';
      bar.className = 'password-strength-bar';
      if (validation.strength > 80) bar.classList.add('strong');
      else if (validation.strength > 50) bar.classList.add('medium');
      else bar.classList.add('weak');
    }
  }

  showMessage(message, type = 'info') {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.className = `auth-message ${type}`;
      messageEl.style.display = 'block';
      setTimeout(() => messageEl.style.display = 'none', 5000);
    }
  }

  async checkOAuthCallback() {
    // التحقق من وجود معاملات OAuth في URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') || window.location.hash.includes('access_token')) {
      console.log('OAuth callback detected');
      this.showMessage('جاري التحقق...', 'info');
      
      const result = await window.authManager.handleOAuthCallback();
      
      if (result.success) {
        this.showMessage(result.message, 'success');
        setTimeout(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.reload();
        }, 1000);
      } else {
        this.showMessage(result.error || 'فشل التحقق', 'error');
      }
    }
  }
}

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
  window.authUI = new AuthUI();
}

console.log('✅ Auth UI loaded with OAuth support');
