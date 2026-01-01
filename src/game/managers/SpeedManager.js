/**
 * SpeedManager.js
 * 
 * Manages game speed progression and calculations
 * Speed increases by 20% every 10 triangles, starting at 300%
 */

import GameConfig from '../config/GameConfig';

class SpeedManager {
  constructor() {
    this.currentSpeed = 0;
    this.baseSpeed = GameConfig.speed.base;
    this.trianglesPassed = 0;
    this.speedHistory = [];
    this.manualSpeedBoost = 1.0;
  }

  /**
   * Initialize speed manager
   */
  init() {
    this.currentSpeed = this.calculateSpeed(0);
    this.trianglesPassed = 0;
    this.speedHistory = [this.currentSpeed];
    this.manualSpeedBoost = 1.0;
  }

  /**
   * Calculate speed based on triangles passed
   * Formula: speed = baseSpeed × (3 + 0.2 × floor(trianglesPassed / 10)) × manualBoost
   * @param {number} trianglesPassed - Number of triangles passed
   * @returns {number} Calculated speed
   */
  calculateSpeed(trianglesPassed) {
    const increases = Math.floor(trianglesPassed / GameConfig.speed.increaseInterval);
    const speedMultiplier = 
      GameConfig.speed.initialMultiplier + 
      (increases * GameConfig.speed.increaseRate);
    
    let speed = this.baseSpeed * speedMultiplier * this.manualSpeedBoost;
    
    // Apply max speed cap
    if (speed > GameConfig.speed.maxSpeed) {
      speed = GameConfig.speed.maxSpeed;
    }
    
    return speed;
  }

  /**
   * Update speed based on triangles passed
   * @param {number} trianglesPassed - Current triangles passed
   * @returns {boolean} True if speed changed
   */
  update(trianglesPassed) {
    const oldSpeed = this.currentSpeed;
    this.trianglesPassed = trianglesPassed;
    this.currentSpeed = this.calculateSpeed(trianglesPassed);
    
    const speedChanged = oldSpeed !== this.currentSpeed;
    
    if (speedChanged) {
      this.speedHistory.push(this.currentSpeed);
    }
    
    return speedChanged;
  }

  /**
   * Get current speed
   * @returns {number} Current speed value
   */
  getCurrentSpeed() {
    return this.currentSpeed;
  }

  /**
   * Get speed as percentage of base speed
   * @returns {number} Speed percentage
   */
  getSpeedPercentage() {
    return Math.round((this.currentSpeed / this.baseSpeed) * 100);
  }

  /**
   * Get speed multiplier
   * @returns {number} Current speed multiplier
   */
  getSpeedMultiplier() {
    return this.currentSpeed / this.baseSpeed;
  }

  /**
   * Apply manual speed boost
   * @param {number} boostMultiplier - Boost multiplier (e.g., 1.5 for 50% boost)
   */
  applySpeedBoost(boostMultiplier = 1.5) {
    this.manualSpeedBoost *= boostMultiplier;
    this.currentSpeed = this.calculateSpeed(this.trianglesPassed);
  }

  /**
   * Reset manual speed boost
   */
  resetSpeedBoost() {
    this.manualSpeedBoost = 1.0;
    this.currentSpeed = this.calculateSpeed(this.trianglesPassed);
  }

  /**
   * Get next speed milestone
   * @returns {Object} Next milestone info {triangles, speed, percentage}
   */
  getNextMilestone() {
    const currentInterval = Math.floor(
      this.trianglesPassed / GameConfig.speed.increaseInterval
    );
    const nextMilestoneTriangles = 
      (currentInterval + 1) * GameConfig.speed.increaseInterval;
    const nextSpeed = this.calculateSpeed(nextMilestoneTriangles);
    
    return {
      triangles: nextMilestoneTriangles,
      remaining: nextMilestoneTriangles - this.trianglesPassed,
      speed: nextSpeed,
      percentage: Math.round((nextSpeed / this.baseSpeed) * 100)
    };
  }

  /**
   * Check if at max speed
   * @returns {boolean} True if at maximum speed
   */
  isAtMaxSpeed() {
    return this.currentSpeed >= GameConfig.speed.maxSpeed;
  }

  /**
   * Get speed statistics
   * @returns {Object} Speed statistics
   */
  getStats() {
    return {
      current: this.currentSpeed,
      percentage: this.getSpeedPercentage(),
      multiplier: this.getSpeedMultiplier().toFixed(2),
      base: this.baseSpeed,
      max: GameConfig.speed.maxSpeed,
      isMaxed: this.isAtMaxSpeed(),
      manualBoost: this.manualSpeedBoost,
      history: [...this.speedHistory]
    };
  }

  /**
   * Calculate time to reach certain speed
   * @param {number} targetSpeed - Target speed value
   * @returns {number} Triangles needed to reach target
   */
  trianglesToReachSpeed(targetSpeed) {
    if (targetSpeed <= this.currentSpeed) {
      return 0;
    }
    
    const targetMultiplier = targetSpeed / this.baseSpeed;
    const increasesNeeded = Math.ceil(
      (targetMultiplier - GameConfig.speed.initialMultiplier) / 
      GameConfig.speed.increaseRate
    );
    
    const trianglesNeeded = 
      increasesNeeded * GameConfig.speed.increaseInterval;
    
    return Math.max(0, trianglesNeeded - this.trianglesPassed);
  }

  /**
   * Get average speed over game
   * @returns {number} Average speed
   */
  getAverageSpeed() {
    if (this.speedHistory.length === 0) {
      return 0;
    }
    
    const sum = this.speedHistory.reduce((acc, speed) => acc + speed, 0);
    return sum / this.speedHistory.length;
  }

  /**
   * Interpolate speed for smooth transitions
   * @param {number} targetSpeed - Target speed
   * @param {number} delta - Time delta
   * @param {number} smoothness - Smoothness factor (0-1)
   * @returns {number} Interpolated speed
   */
  interpolateSpeed(targetSpeed, delta, smoothness = 0.1) {
    return this.currentSpeed + (targetSpeed - this.currentSpeed) * smoothness * delta;
  }

  /**
   * Export speed data
   * @returns {string} JSON string of speed data
   */
  exportData() {
    return JSON.stringify({
      stats: this.getStats(),
      milestone: this.getNextMilestone(),
      trianglesPassed: this.trianglesPassed
    }, null, 2);
  }
}

export default SpeedManager;
