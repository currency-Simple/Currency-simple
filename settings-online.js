// ============================================
// ⚙️ SETTINGS MANAGER (Online)
// ============================================
import { supabase } from '../online/supabase-config.js';

export class SettingsManager {
  constructor() {
    this.settings = this.getDefaultSettings();
  }

  getDefaultSettings() {
    return {
      sound: { enabled: true, volume: 0.7 },
      music: { enabled: true, volume: 0.5 },
      vibration: { enabled: true },
      graphics: { quality: 'high', particles: true, shadows: true, effects: true },
      gameplay: { difficulty: 'medium', controlSensitivity: 0.5, autoSave: true },
      language: 'ar',
      theme: 'dark',
      notifications: { achievements: true, challenges: true, leaderboard: true }
    };
  }

  async load(userId = null) {
    const localSettings = localStorage.getItem('game_settings');
    if (localSettings) {
      this.settings = { ...this.settings, ...JSON.parse(localSettings) };
    }
    if (userId) {
      const { data } = await supabase.from('user_settings').select('settings').eq('user_id', userId).single();
      if (data?.settings) {
        this.settings = { ...this.settings, ...data.settings };
      }
    }
    return this.settings;
  }

  async save(userId = null) {
    localStorage.setItem('game_settings', JSON.stringify(this.settings));
    if (userId) {
      await supabase.from('user_settings').upsert({ user_id: userId, settings: this.settings, updated_at: new Date().toISOString() });
    }
    return { success: true };
  }

  update(category, key, value) {
    if (this.settings[category]) {
      this.settings[category][key] = value;
      this.save();
      return true;
    }
    return false;
  }

  get(category, key) {
    return this.settings[category]?.[key];
  }

  reset() {
    this.settings = this.getDefaultSettings();
    this.save();
    return this.settings;
  }

  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  import(settingsJson) {
    try {
      const imported = JSON.parse(settingsJson);
      this.settings = { ...this.getDefaultSettings(), ...imported };
      this.save();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'بيانات غير صالحة' };
    }
  }
}
