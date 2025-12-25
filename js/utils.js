// Utility functions

// Format number as currency
function formatCurrency(value, decimals = 4) {
    if (value === null || value === undefined) return '0.0000';
    return parseFloat(value).toFixed(decimals);
}

// Format percentage
function formatPercentage(value) {
    if (value === null || value === undefined) return '0.00';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
}

// Draw mini chart on canvas
function drawMiniChart(canvas, data, isPositive = true) {
    if (!canvas || !data || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get values
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    // Calculate points
    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return { x, y };
    });
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = isPositive ? '#4ade80' : '#f87171';
    ctx.lineWidth = 2;
    
    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.stroke();
}

// Draw detailed chart
function drawDetailChart(canvas, data, isPositive = true) {
    if (!canvas || !data || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get values
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    // Draw grid lines
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Draw y-axis labels
        const value = max - (range / 4) * i;
        ctx.fillStyle = '#b0b0b0';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(4), padding - 5, y + 3);
    }
    
    // Calculate points
    const points = values.map((value, index) => {
        const x = padding + (index / (values.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((value - min) / range) * chartHeight;
        return { x, y };
    });
    
    // Draw area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    
    points.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, isPositive ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = isPositive ? '#4ade80' : '#f87171';
    ctx.lineWidth = 2;
    
    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.stroke();
    
    // Draw current value marker
    const lastPoint = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isPositive ? '#4ade80' : '#f87171';
    ctx.fill();
}

// Local storage helpers
const Storage = {
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
};

// Favorites management
const Favorites = {
    key: 'currency_favorites',
    
    getAll: function() {
        return Storage.get(this.key) || [];
    },
    
    add: function(from, to) {
        const favorites = this.getAll();
        const pair = `${from}/${to}`;
        
        if (!favorites.includes(pair)) {
            favorites.push(pair);
            Storage.set(this.key, favorites);
            return true;
        }
        
        return false;
    },
    
    remove: function(from, to) {
        const favorites = this.getAll();
        const pair = `${from}/${to}`;
        const index = favorites.indexOf(pair);
        
        if (index > -1) {
            favorites.splice(index, 1);
            Storage.set(this.key, favorites);
            return true;
        }
        
        return false;
    },
    
    isFavorite: function(from, to) {
        const favorites = this.getAll();
        const pair = `${from}/${to}`;
        return favorites.includes(pair);
    }
};

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
