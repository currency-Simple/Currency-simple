// ============================================
// SPEEDBALL 3D - SETTINGS MANAGER
// ============================================

class SettingsManager {
    constructor() {
        this.settings = {
            audio: {
                musicVolume: 70,
                sfxVolume: 80,
                enabled: true
            },
            graphics: {
                quality: 'medium',
                particleEffects: true,
                glowEffects: true,
                shadows: true,
                trailEffects: true
            },
            gameplay: {
                difficulty: 'normal',
                showHints: true,
                vibration: true
            },
            controls: {
                sensitivity: 'normal',
                invertControls: false
            }
        };
        this.load();
        this.applySettings();
    }

    updateAudio(key, value) {
        this.settings.audio[key] = value;
        this.applyAudioSettings();
        this.save();
    }

    updateGraphics(key, value) {
        this.settings.graphics[key] = value;
        this.applyGraphicsSettings();
        this.save();
    }

    updateGameplay(key, value) {
        this.settings.gameplay[key] = value;
        this.save();
    }

    updateControls(key, value) {
        this.settings.controls[key] = value;
        this.save();
    }

    applySettings() {
        this.applyAudioSettings();
        this.applyGraphicsSettings();
    }

    applyAudioSettings() {
        CONFIG.AUDIO.MUSIC_VOLUME = this.settings.audio.musicVolume / 100;
        CONFIG.AUDIO.SFX_VOLUME = this.settings.audio.sfxVolume / 100;
        CONFIG.AUDIO.ENABLED = this.settings.audio.enabled;
    }

    applyGraphicsSettings() {
        CONFIG.GRAPHICS.QUALITY = this.settings.graphics.quality;
        CONFIG.GRAPHICS.PARTICLE_EFFECTS = this.settings.graphics.particleEffects;
        CONFIG.GRAPHICS.GLOW_EFFECTS = this.settings.graphics.glowEffects;
        CONFIG.GRAPHICS.SHADOWS = this.settings.graphics.shadows;
        CONFIG.GRAPHICS.TRAIL_EFFECTS = this.settings.graphics.trailEffects;
    }

    getSettings() {
        return { ...this.settings };
    }

    save() {
        try {
            localStorage.setItem('speedballSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('speedballSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    reset() {
        this.settings = {
            audio: {
                musicVolume: 70,
                sfxVolume: 80,
                enabled: true
            },
            graphics: {
                quality: 'medium',
                particleEffects: true,
                glowEffects: true,
                shadows: true,
                trailEffects: true
            },
            gameplay: {
                difficulty: 'normal',
                showHints: true,
                vibration: true
            },
            controls: {
                sensitivity: 'normal',
                invertControls: false
            }
        };
        this.applySettings();
        this.save();
    }
}

// Settings UI Handlers
function initializeSettingsUI() {
    const musicSlider = document.getElementById('musicVolume');
    const sfxSlider = document.getElementById('sfxVolume');
    const graphicsSelect = document.getElementById('graphicsQuality');
    const particleCheckbox = document.getElementById('particleEffects');

    if (game && game.settingsManager) {
        const settings = game.settingsManager.getSettings();

        // Set initial values
        if (musicSlider) {
            musicSlider.value = settings.audio.musicVolume;
            document.getElementById('musicVolumeValue').textContent = settings.audio.musicVolume + '%';

            musicSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('musicVolumeValue').textContent = value + '%';
                game.settingsManager.updateAudio('musicVolume', value);
            });
        }

        if (sfxSlider) {
            sfxSlider.value = settings.audio.sfxVolume;
            document.getElementById('sfxVolumeValue').textContent = settings.audio.sfxVolume + '%';

            sfxSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('sfxVolumeValue').textContent = value + '%';
                game.settingsManager.updateAudio('sfxVolume', value);
            });
        }

        if (graphicsSelect) {
            graphicsSelect.value = settings.graphics.quality;
            graphicsSelect.addEventListener('change', (e) => {
                game.settingsManager.updateGraphics('quality', e.target.value);
            });
        }

        if (particleCheckbox) {
            particleCheckbox.checked = settings.graphics.particleEffects;
            particleCheckbox.addEventListener('change', (e) => {
                game.settingsManager.updateGraphics('particleEffects', e.target.checked);
            });
        }
    }
}

// Call when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeSettingsUI, 100);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsManager, initializeSettingsUI };
}('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('هل تريد إعادة تعيين جميع الإعدادات؟')) {
                    this.reset();
                    alert('تم إعادة تعيين الإعدادات! ✅');
                }
            });
        }

        // زر حذف البيانات
        const deleteBtn = document.getElementById('reset-data-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('⚠️ هل أنت متأكد؟ سيتم حذف جميع تقدمك!')) {
                    if (confirm('⚠️⚠️ هذا الإجراء لا يمكن التراجع عنه!')) {
                        this.deleteAllData();
                        alert('تم حذف جميع البيانات! سيتم إعادة تحميل الصفحة...');
                        setTimeout(() => location.reload(), 1000);
                    }
                }
            });
        }
    }

    // إعادة تعيين الإعدادات
    reset() {
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            effectsEnabled: true,
            particlesEnabled: true,
            vibrationEnabled: true,
            graphicsQuality: 'high',
            cameraShake: true,
            speedDisplay: true
        };
        this.save();
        this.renderPanel();
        this.applySettings();
    }

    // حذف جميع البيانات
    deleteAllData() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Could not delete data');
        }
    }

    // حفظ البيانات
    save() {
        try {
            localStorage.setItem('rushSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings');
        }
    }

    // تحميل البيانات
    load() {
        try {
            const saved = localStorage.getItem('rushSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load settings');
        }
    }
}

// إنشاء نسخة عامة
const settingsSystem = new SettingsSystem();