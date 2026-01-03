// ============================================
// SPEEDBALL 3D - GAME DATA MANAGEMENT
// ============================================

class GameData {
    constructor() {
        this.data = {
            currentSession: {
                score: 0,
                triangles: 0,
                coins: 0,
                startTime: null,
                duration: 0
            },
            allTime: {
                totalScore: 0,
                totalTriangles: 0,
                totalCoins: 0,
                totalGames: 0,
                totalPlaytime: 0,
                highestScore: 0,
                longestGame: 0
            },
            history: [] // Last 10 games
        };
        this.load();
    }

    startSession() {
        this.data.currentSession = {
            score: 0,
            triangles: 0,
            coins: 0,
            startTime: Date.now(),
            duration: 0
        };
    }

    addScore(points) {
        this.data.currentSession.score += points;
    }

    addTriangle() {
        this.data.currentSession.triangles++;
    }

    addCoin(value = 1) {
        this.data.currentSession.coins += value;
    }

    endSession() {
        const session = this.data.currentSession;
        session.duration = Math.floor((Date.now() - session.startTime) / 1000);

        // Update all-time stats
        this.data.allTime.totalScore += session.score;
        this.data.allTime.totalTriangles += session.triangles;
        this.data.allTime.totalCoins += session.coins;
        this.data.allTime.totalGames++;
        this.data.allTime.totalPlaytime += session.duration;

        if (session.score > this.data.allTime.highestScore) {
            this.data.allTime.highestScore = session.score;
        }

        if (session.duration > this.data.allTime.longestGame) {
            this.data.allTime.longestGame = session.duration;
        }

        // Add to history
        this.data.history.unshift({
            score: session.score,
            triangles: session.triangles,
            coins: session.coins,
            duration: session.duration,
            date: new Date().toISOString()
        });

        // Keep only last 10 games
        if (this.data.history.length > 10) {
            this.data.history = this.data.history.slice(0, 10);
        }

        this.save();
    }

    getSessionData() {
        return { ...this.data.currentSession };
    }

    getAllTimeData() {
        return { ...this.data.allTime };
    }

    getHistory() {
        return [...this.data.history];
    }

    getAverages() {
        const games = this.data.allTime.totalGames;
        if (games === 0) return null;

        return {
            avgScore: Math.floor(this.data.allTime.totalScore / games),
            avgTriangles: Math.floor(this.data.allTime.totalTriangles / games),
            avgCoins: Math.floor(this.data.allTime.totalCoins / games),
            avgDuration: Math.floor(this.data.allTime.totalPlaytime / games)
        };
    }

    save() {
        try {
            localStorage.setItem('speedballGameData', JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save game data:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('speedballGameData');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load game data:', e);
        }
    }

    reset() {
        this.data = {
            currentSession: {
                score: 0,
                triangles: 0,
                coins: 0,
                startTime: null,
                duration: 0
            },
            allTime: {
                totalScore: 0,
                totalTriangles: 0,
                totalCoins: 0,
                totalGames: 0,
                totalPlaytime: 0,
                highestScore: 0,
                longestGame: 0
            },
            history: []
        };
        this.save();
    }

    export() {
        return JSON.stringify(this.data, null, 2);
    }

    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.data = imported;
            this.save();
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameData };
}  localStorage.setItem('rushGameData', JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save game data');
    }
}

function loadGameData() {
    try {
        const saved = localStorage.getItem('rushGameData');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Restore unlocked status
            if (data.balls) {
                data.balls.forEach((savedBall, index) => {
                    if (BALLS_DATA[index]) {
                        BALLS_DATA[index].unlocked = savedBall.unlocked;
                    }
                });
            }
            
            if (data.roads) {
                data.roads.forEach((savedRoad, index) => {
                    if (ROADS_DATA[index]) {
                        ROADS_DATA[index].unlocked = savedRoad.unlocked;
                    }
                });
            }
            
            selectedBall = data.selectedBall || 'ball_default';
            selectedRoad = data.selectedRoad || 'road_default';
            playerCoins = data.coins || 0;
            
            console.log('Game data loaded successfully');
        }
    } catch (e) {
        console.warn('Could not load game data');
    }
}

// Load data on startup
loadGameData();