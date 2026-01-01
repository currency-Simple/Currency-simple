// ============================================
// 👤 PROFILE UI
// ============================================
import { getProfile } from '../online/user-profiles.js';
import { uploadAvatar } from '../online/avatar-manager.js';
import { getCountryByCode } from '../online/country-selector.js';

export class ProfileUI {
  constructor() {
    this.currentProfile = null;
  }

  async render(userId) {
    const result = await getProfile(userId);
    if (!result.success) {
      console.error('Failed to load profile');
      return;
    }
    this.currentProfile = result.data;
    const container = document.querySelector('.profile-container');
    if (!container) return;

    const country = getCountryByCode(this.currentProfile.country_code);
    
    container.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">
          ${this.currentProfile.avatar_url 
            ? `<img src="${this.currentProfile.avatar_url}" alt="Avatar">` 
            : `<div class="default-avatar">${this.currentProfile.username?.charAt(0) || '?'}</div>`
          }
          <button class="change-avatar-btn" id="change-avatar">📷</button>
        </div>
        <div class="profile-info">
          <h2>${this.currentProfile.username || 'لاعب'}</h2>
          <p class="profile-bio">${this.currentProfile.bio || 'لا توجد سيرة ذاتية'}</p>
          <div class="profile-meta">
            <span>${country ? country.flag + ' ' + country.name : '🌍'}</span>
            <span>المستوى ${this.currentProfile.level || 1}</span>
          </div>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="stat-card">
          <div class="stat-value">${this.currentProfile.best_score || 0}</div>
          <div class="stat-label">أفضل نتيجة</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this.currentProfile.total_games || 0}</div>
          <div class="stat-label">إجمالي الألعاب</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this.currentProfile.level || 1}</div>
          <div class="stat-label">المستوى</div>
        </div>
      </div>
      
      <div class="profile-progress">
        <div class="progress-item">
          <span>التقدم للمستوى التالي</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${this.currentProfile.level_progress?.percentage || 0}%"></div>
          </div>
          <span class="progress-text">${this.currentProfile.level_progress?.current || 0} / ${this.currentProfile.level_progress?.needed || 1000}</span>
        </div>
      </div>
      
      <button class="edit-profile-btn" id="edit-profile">✏️ تعديل الملف الشخصي</button>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('change-avatar')?.addEventListener('click', () => this.showAvatarUploader());
    document.getElementById('edit-profile')?.addEventListener('click', () => this.showEditDialog());
  }

  showAvatarUploader() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const result = await uploadAvatar(file);
        if (result.success) {
          this.showMessage('تم تحديث الصورة!', 'success');
          this.render(this.currentProfile.user_id);
        } else {
          this.showMessage(result.error, 'error');
        }
      }
    };
    input.click();
  }

  showEditDialog() {
    alert('قريباً: نافذة تعديل الملف الشخصي');
  }

  showMessage(message, type) {
    console.log(`[${type}] ${message}`);
  }
}

export const profileUI = new ProfileUI();
