// ============================================
// SPEEDBALL 3D - STATISTICS
// ============================================

class StatsManager {
    constructor() {
        this.stats = {
            totalGames: 0,
            highestScore: 0,
            totalTriangles: 0
        };
        this.load();
    }

    addGame(score, triangles) {
        this.stats.totalGames++;
        this.stats.totalTriangles += triangles;
        if (score > this.stats.highestScore) {
            this.stats.highestScore = score;
        }
        this.save();
    }

    getStats() {
        return { ...this.stats };
    }

    save() {
        try {
            localStorage.setItem('speedballStats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Stats save failed');
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('speedballStats');
            if (saved) {
                this.stats = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Stats load failed');
        }
    }
}

function updateStatsDisplay() {
    if (!window.game) return;
    const stats = window.game.statsManager.getStats();
    
    const totalGames = document.getElementById('totalGames');
    const highestScore = document.getElementById('highestScore');
    const totalTriangles = document.getElementById('totalTriangles');
    
    if (totalGames) totalGames.textContent = stats.totalGames;
    if (highestScore) highestScore.textContent = stats.highestScore;
    if (totalTriangles) totalTriangles.textContent = stats.totalTriangles;
}

function resetStats() {
    if (confirm('Reset all statistics?')) {
        if (window.game && window.game.statsManager) {
            window.game.statsManager.stats = {
                totalGames: 0,
                highestScore: 0,
                totalTriangles: 0
            };
            window.game.statsManager.save();
            updateStatsDisplay();
            alert('Statistics reset!');
        }
    }
}

console.log('✅ STATS loaded');
