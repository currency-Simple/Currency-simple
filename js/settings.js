// ============================================
// SETTINGS SYSTEM (نظام الإعدادات)
// ============================================

class SettingsSystem {
    constructor() {
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            effectsEnabled: true,
            particlesEnabled: true,
            vibrationEnabled: true,
            graphicsQuality: 'high', // low, medium, high
            cameraShake: true,
            speedDisplay: true
        };
        
        this.load();
    }

    // تبديل إعداد معين
    toggle(settingName) {
        if (this.settings.hasOwnProperty(settingName)) {
            this.settings[settingName] = !this.settings[settingName];
            this.save();
            this.renderPanel();
            this.applySettings();
            return this.settings[settingName];
        }
        return null;
    }

    // تعيين قيمة لإعداد
    set(settingName, value) {
        if (this.settings.hasOwnProperty(settingName)) {
            this.settings[settingName] = value;
            this.save();
            this.renderPanel();
            this.applySettings();
        }
    }

    // الحصول على قيمة إعداد
    get(settingName) {
        return this.settings[settingName];
    }

    // تطبيق الإعدادات على اللعبة
    applySettings() {
        // تطبيق جودة الرسومات
        if (typeof applyGraphicsSettings === 'function') {
            applyGraphicsSettings(this.settings.graphicsQuality);
        }

        // إخفاء/إظهار عرض السرعة
        const speedIndicator = document.querySelector('.speed-indicator');
        if (speedIndicator) {
            speedIndicator.style.display = this.settings.speedDisplay ? 'inline-block' : 'none';
        }
    }

    // عرض الواجهة
    renderPanel() {
        const panel = document.getElementById('settings-panel');
        if (!panel) return;
        
        panel.innerHTML = `
            <div class="panel-header">
                <h3>⚙️ الإعدادات</h3>
                <button class="close-panel" onclick="closePanel('settings-panel')">✕</button>
            </div>
            <div class="panel-content">
                ${this.createSettingItem('🔊', 'الصوت', 'soundEnabled')}
                ${this.createSettingItem('🎵', 'الموسيقى', 'musicEnabled')}
                ${this.createSettingItem('✨', 'التأثيرات', 'effectsEnabled')}
                ${this.createSettingItem('💫', 'الجزيئات', 'particlesEnabled')}
                ${this.createSettingItem('📳', 'الاهتزاز', 'vibrationEnabled')}
                ${this.createSettingItem('📹', 'اهتزاز الكاميرا', 'cameraShake')}
                ${this.createSettingItem('📊', 'عرض السرعة', 'speedDisplay')}
                
                <div class="setting-section">
                    <h4>🎨 جودة الرسومات</h4>
                    <div class="quality-buttons">
                        ${this.createQualityButton('low', 'منخفضة')}
                        ${this.createQualityButton('medium', 'متوسطة')}
                        ${this.createQualityButton('high', 'عالية')}
                    </div>
                </div>

                <div class="setting-section">
                    <button class="reset-btn" id="reset-settings-btn">
                        🔄 إعادة تعيين الإعدادات
                    </button>
                </div>

                <div class="setting-section">
                    <button class="danger-btn" id="reset-data-btn">
                        ⚠️ حذف جميع البيانات
                    </button>
                </div>
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        this.attachEventListeners();
    }

    // إنشاء عنصر إعداد
    createSettingItem(icon, label, settingName) {
        const isActive = this.settings[settingName];
        return `
            <div class="setting-item">
                <label>
                    <span class="setting-icon">${icon}</span>
                    <span class="setting-label">${label}</span>
                </label>
                <button class="toggle-btn ${isActive ? 'active' : ''}" 
                        data-setting="${settingName}">
                    ${isActive ? 'تشغيل' : 'إيقاف'}
                </button>
            </div>
        `;
    }

    // إنشاء زر جودة
    createQualityButton(quality, label) {
        const isActive = this.settings.graphicsQuality === quality;
        return `
            <button class="quality-btn ${isActive ? 'active' : ''}" 
                    data-quality="${quality}">
                ${label}
            </button>
        `;
    }

    // ربط مستمعي الأحداث
    attachEventListeners() {
        // أزرار التبديل
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const setting = btn.dataset.setting;
                this.toggle(setting);
            });
        });

        // أزرار الجودة
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quality = btn.dataset.quality;
                this.set('graphicsQuality', quality);
            });
        });

        // زر إعادة التعيين
        const resetBtn = document.getElementById('reset-settings-btn');
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
