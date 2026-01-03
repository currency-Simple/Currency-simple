// ============================================
// SPEEDBALL 3D - GAME DATA
// ============================================

class GameData {
    constructor() {
        this.data = {
            currentSession: {
                score: 0,
                triangles: 0
            }
        };
    }

    addScore(points) {
        this.data.currentSession.score += points;
    }

    save() {
        // Will be implemented later
    }
}

console.log('✅ GAME-DATA loaded');
