/**
 * ScoreManager.js
 * 
 * Manages game scoring system and statistics
 */

import GameConfig from '../config/GameConfig';

class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.combo = 0;
    this.maxCombo = 0;
    this.trianglesPassed = 0;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Initialize score tracking
   */
  init() {
    this.score = 0;
    this.combo = 0;
    this.trianglesPassed = 0;
    this.startTime = Date.now();
    this.endTime = null;
  }

  /**
   * Add points when passing a triangle
   * @returns {number} Points added
   */
  addTriangle() {
    this.trianglesPassed++;
    this.combo++;
    
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    let points = GameConfig.score.pointsPerTriangle;
    
    // Apply combo bonus
    if (this.combo >= GameConfig.score.comboThreshold) {
      points *= GameConfig.score.bonusMultiplier;
    }

    this.score += points;
    return points;
  }

  /**
   * Reset combo counter
   */
  resetCombo() {
    this.combo = 0;
  }

  /**
   * End game and record time
   */
  endGame() {
    this.endTime = Date.now();
    
    // Update high score if necessary
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  /**
   * Get current game statistics
   * @returns {Object} Game statistics
   */
  getStats() {
    const duration = this.endTime 
      ? (this.endTime - this.startTime) / 1000 
      : (Date.now() - this.startTime) / 1000;

    return {
      score: this.score,
      highScore: this.highScore,
      trianglesPassed: this.trianglesPassed,
      combo: this.combo,
      maxCombo: this.maxCombo,
      duration: Math.round(duration),
      trianglesPerSecond: duration > 0 ? (this.trianglesPassed / duration).toFixed(2) : 0
    };
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore() {
    try {
      localStorage.setItem('rollingBall3D_highScore', this.highScore.toString());
    } catch (error) {
      console.warn('Unable to save high score:', error);
    }
  }

  /**
   * Load high score from localStorage
   * @returns {number} High score
   */
  loadHighScore() {
    try {
      const saved = localStorage.getItem('rollingBall3D_highScore');
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      console.warn('Unable to load high score:', error);
      return 0;
    }
  }

  /**
   * Reset high score
   */
  resetHighScore() {
    this.highScore = 0;
    try {
      localStorage.removeItem('rollingBall3D_highScore');
    } catch (error) {
      console.warn('Unable to reset high score:', error);
    }
  }

  /**
   * Get performance rating based on score
   * @returns {string} Rating (S, A, B, C, D, F)
   */
  getRating() {
    if (this.score >= 200) return 'S';
    if (this.score >= 150) return 'A';
    if (this.score >= 100) return 'B';
    if (this.score >= 50) return 'C';
    if (this.score >= 25) return 'D';
    return 'F';
  }

  /**
   * Get formatted time string
   * @returns {string} Formatted time (MM:SS)
   */
  getFormattedTime() {
    const duration = this.endTime 
      ? (this.endTime - this.startTime) / 1000 
      : (Date.now() - this.startTime) / 1000;

    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate accuracy percentage
   * @param {number} totalTriangles - Total triangles in path
   * @returns {number} Accuracy percentage
   */
  getAccuracy(totalTriangles) {
    if (totalTriangles === 0) return 0;
    return Math.round((this.trianglesPassed / totalTriangles) * 100);
  }

  /**
   * Export statistics as JSON
   * @returns {string} JSON string of stats
   */
  exportStats() {
    return JSON.stringify(this.getStats(), null, 2);
  }
}

export default ScoreManager;
