// ============================================
// 🔐 AUTH UI
// ============================================
import { signUp, signIn, signOut, validateEmail, validatePassword } from '../online/auth-manager.js';

export class AuthUI {
  constructor() {
    this.mode = 'login';
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = document.getElementById('auth-form');
    const toggleLink = document.getElementById('auth-toggle-link');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');

    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    toggleLink?.addEventListener('click', (e) => this.toggleMode(e));
    emailInput?.addEventListener('input', () => this.validateEmailInput());
    passwordInput?.addEventListener('input', () => this.validatePasswordInput());
  }

  async handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    const submitBtn = document.getElementById('auth-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري التحميل...';

    let result;
    if (this.mode === 'login') {
      result = await signIn(email, password);
    } else {
      result = await signUp(email, password);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = this.mode === 'login' ? 'دخول' : 'تسجيل';

    this.showMessage(result.message || result.error, result.success ? 'success' : 'error');

    if (result.success) {
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  toggleMode(e) {
    e.preventDefault();
    this.mode = this.mode === 'login' ? 'signup' : 'login';
    document.getElementById('auth-title').textContent = this.mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب';
    document.getElementById('auth-submit-text').textContent = this.mode === 'login' ? 'دخول' : 'تسجيل';
    document.getElementById('auth-toggle-text').textContent = this.mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟';
    document.getElementById('auth-toggle-link').textContent = this.mode === 'login' ? 'سجل الآن' : 'سجل دخول';
  }

  validateEmailInput() {
    const input = document.getElementById('auth-email');
    const hint = document.getElementById('email-hint');
    const validation = validateEmail(input.value);
    hint.textContent = validation.message;
    hint.className = validation.valid ? 'input-hint success' : 'input-hint error';
  }

  validatePasswordInput() {
    const input = document.getElementById('auth-password');
    const hint = document.getElementById('password-hint');
    const strength = document.getElementById('password-strength');
    const validation = validatePassword(input.value);
    hint.textContent = validation.message;
    hint.className = validation.valid ? 'input-hint success' : 'input-hint error';
    if (strength) {
      const bar = strength.querySelector('.password-strength-bar') || strength;
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
}

export const authUI = new AuthUI();
