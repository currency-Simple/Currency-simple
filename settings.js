// ============================================
// SPEEDBALL 3D - SETTINGS
// ============================================

class SettingsManager {
    constructor() {
        this.settings = {
            audio: {
                musicVolume: 70,
                sfxVolume: 80
            },
            graphics: {
                quality: 'medium',
                particleEffects: true
            }
        };
        this.applySettings();
    }

    applySettings() {
        CONFIG.AUDIO.MUSIC_VOLUME = this.settings.audio.musicVolume / 100;
        CONFIG.AUDIO.SFX_VOLUME = this.settings.audio.sfxVolume / 100;
        CONFIG.GRAPHICS.PARTICLE_EFFECTS = this.settings.graphics.particleEffects;
    }

    getSettings() {
        return { ...this.settings };
    }
}

console.log('✅ SETTINGS loaded');
