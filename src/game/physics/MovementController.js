/**
 * MovementController.js
 * 
 * Handles ball movement physics and controls
 * Manages touch input, velocity, and smooth movement
 */

import GameConfig from '../config/GameConfig';

class MovementController {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.targetX = 0;
    this.isMoving = false;
    this.touchStartX = null;
    this.lastTouchX = null;
  }

  /**
   * Initialize movement controller
   */
  init() {
    this.position = {
      x: GameConfig.ball.initialX,
      y: GameConfig.ball.initialY
    };
    this.velocity = { x: 0, y: 0 };
    this.targetX = GameConfig.ball.initialX;
    this.isMoving = false;
    this.touchStartX = null;
    this.lastTouchX = null;
  }

  /**
   * Handle touch/mouse start
   * @param {number} clientX - X position of touch/click
   */
  handleTouchStart(clientX) {
    this.touchStartX = clientX;
    this.lastTouchX = clientX;
    this.isMoving = true;
  }

  /**
   * Handle touch/mouse move
   * @param {number} clientX - Current X position
   * @param {number} sensitivity - Movement sensitivity (0-1)
   */
  handleTouchMove(clientX, sensitivity = 0.5) {
    if (!this.isMoving || this.touchStartX === null) {
      return;
    }

    const deltaX = clientX - this.lastTouchX;
    this.targetX += deltaX * sensitivity;
    
    // Clamp target X within bounds
    const ballRadius = GameConfig.ball.size / 2;
    const minX = ballRadius;
    const maxX = GameConfig.path.width * 1.5 - ballRadius;
    
    this.targetX = Math.max(minX, Math.min(maxX, this.targetX));
    this.lastTouchX = clientX;
  }

  /**
   * Handle touch/mouse end
   */
  handleTouchEnd() {
    this.isMoving = false;
    this.touchStartX = null;
    this.lastTouchX = null;
  }

  /**
   * Update ball position with smooth interpolation
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime = 1) {
    const friction = GameConfig.ball.friction;
    const maxVelocity = GameConfig.ball.maxVelocity;
    
    // Calculate velocity towards target
    const deltaX = this.targetX - this.position.x;
    this.velocity.x = deltaX * 0.2; // Smooth interpolation
    
    // Apply friction
    this.velocity.x *= friction;
    
    // Clamp velocity
    this.velocity.x = Math.max(
      -maxVelocity, 
      Math.min(maxVelocity, this.velocity.x)
    );
    
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    
    // Ensure position stays within bounds
    const ballRadius = GameConfig.ball.size / 2;
    const minX = ballRadius;
    const maxX = GameConfig.path.width * 1.5 - ballRadius;
    
    this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
  }

  /**
   * Set ball position directly
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    this.targetX = x;
    this.velocity = { x: 0, y: 0 };
  }

  /**
   * Move ball to specific X position
   * @param {number} x - Target X position
   */
  moveToX(x) {
    this.targetX = x;
  }

  /**
   * Get current position
   * @returns {Object} Position {x, y}
   */
  getPosition() {
    return { ...this.position };
  }

  /**
   * Get current velocity
   * @returns {Object} Velocity {x, y}
   */
  getVelocity() {
    return { ...this.velocity };
  }

  /**
   * Get movement direction (-1: left, 0: still, 1: right)
   * @returns {number} Direction
   */
  getDirection() {
    if (Math.abs(this.velocity.x) < 0.1) return 0;
    return this.velocity.x > 0 ? 1 : -1;
  }

  /**
   * Check if ball is moving
   * @returns {boolean} True if moving
   */
  isInMotion() {
    return Math.abs(this.velocity.x) > 0.1;
  }

  /**
   * Apply impulse force to ball
   * @param {number} forceX - Force in X direction
   * @param {number} forceY - Force in Y direction
   */
  applyImpulse(forceX, forceY = 0) {
    this.velocity.x += forceX;
    this.velocity.y += forceY;
  }

  /**
   * Stop all movement
   */
  stop() {
    this.velocity = { x: 0, y: 0 };
    this.targetX = this.position.x;
  }

  /**
   * Get distance to target
   * @returns {number} Distance in pixels
   */
  getDistanceToTarget() {
    return Math.abs(this.targetX - this.position.x);
  }

  /**
   * Check if near target position
   * @param {number} threshold - Distance threshold
   * @returns {boolean} True if near target
   */
  isNearTarget(threshold = 5) {
    return this.getDistanceToTarget() < threshold;
  }

  /**
   * Clamp ball within boundaries
   * @param {number} minX - Minimum X
   * @param {number} maxX - Maximum X
   */
  clampPosition(minX, maxX) {
    this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
    this.targetX = Math.max(minX, Math.min(maxX, this.targetX));
  }

  /**
   * Get movement statistics
   * @returns {Object} Movement stats
   */
  getStats() {
    return {
      position: this.getPosition(),
      velocity: this.getVelocity(),
      targetX: this.targetX,
      isMoving: this.isMoving,
      isInMotion: this.isInMotion(),
      direction: this.getDirection(),
      distanceToTarget: this.getDistanceToTarget()
    };
  }

  /**
   * Smooth damp movement (alternative to lerp)
   * @param {number} current - Current value
   * @param {number} target - Target value
   * @param {number} smoothTime - Time to reach target
   * @param {number} deltaTime - Time delta
   * @returns {number} Smoothed value
   */
  smoothDamp(current, target, smoothTime, deltaTime) {
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    
    const change = current - target;
    const temp = (this.velocity.x + omega * change) * deltaTime;
    
    this.velocity.x = (this.velocity.x - omega * temp) * exp;
    return target + (change + temp) * exp;
  }
}

export default MovementController;
