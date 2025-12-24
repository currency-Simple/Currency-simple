// App settings
let appSettings = {
    darkMode: 'on',
    baseCurrency: 'USD',
    decimals: 4,
    notifications: true
};

// Load settings
export function loadSettings() {
    try {
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            appSettings = { ...appSettings, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    return appSettings;
}

// Save settings
export function saveSettings(settings) {
    try {
        appSettings = { ...appSettings, ...settings };
        localStorage.setItem('appSettings', JSON.stringify(appSettings));
        applySettings();
        showToast('Settings saved');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings', 'error');
    }
}

// Apply settings
export function applySettings() {
    applyDarkMode(appSettings.darkMode);
}

// Apply dark mode
function applyDarkMode(mode) {
    const html = document.documentElement;
    
    if (mode === 'on') {
        html.classList.add('dark-mode');
    } else if (mode === 'off') {
        html.classList.remove('dark-mode');
    } else if (mode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            html.classList.add('dark-mode');
        } else {
            html.classList.remove('dark-mode');
        }
    }
}

// Show toast message
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Initialize settings page
export function initSettingsPage() {
    const darkModeButtons = document.querySelectorAll('.dark-mode-btn');
    
    // Set active button
    darkModeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === appSettings.darkMode) {
            btn.classList.add('active');
        }
        
        // Add click event
        btn.onclick = () => {
            saveSettings({ darkMode: btn.dataset.mode });
            
            // Update buttons
            darkModeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });
    
    // Add events to setting buttons
    const settingButtons = document.querySelectorAll('.setting-btn');
    settingButtons.forEach((btn, index) => {
        btn.onclick = () => {
            if (index === 0) {
                // Rate app button
                showToast('Thank you for rating!');
                // Here you can open app store or rating page
            } else if (index === 1) {
                // Terms and privacy button
                showToast('Opening terms and privacy...');
                window.open('#', '_blank');
            }
        };
    });
    
    // Add hover effects
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Get setting
export function getSetting(key) {
    return appSettings[key];
}

// Initialize settings on app start
export function initSettings() {
    loadSettings();
    applySettings();
    
    // Watch for system preference changes
    if (appSettings.darkMode === 'auto') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (appSettings.darkMode === 'auto') {
                applyDarkMode('auto');
            }
        });
    }
}