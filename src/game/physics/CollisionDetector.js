/**
 * CollisionDetector.js
 * 
 * Handles collision detection between ball and triangles
 * Uses bounding box collision detection with tolerance
 */

import GameConfig from '../config/GameConfig';

class CollisionDetector {
  /**
   * Check if ball is colliding with any triangle
   * @param {Object} ball - Ball position {x, y}
   * @param {Array} triangles - Array of triangle objects
   * @returns {boolean} True if collision detected
   */
  static checkCollision(ball, triangles) {
    const ballRadius = GameConfig.ball.size / 2;
    const tolerance = GameConfig.collision.tolerance;

    // Find triangles near the ball's Y position
    const nearbyTriangles = triangles.filter(triangle => {
      const yDistance = Math.abs(triangle.y - ball.y);
      return yDistance < GameConfig.triangle.height;
    });

    // If no triangles nearby, ball has fallen off
    if (nearbyTriangles.length === 0) {
      return false;
    }

    // Check collision with nearby triangles
    for (const triangle of nearbyTriangles) {
      if (this.isPointInTriangle(ball, triangle, ballRadius, tolerance)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if ball center is within triangle bounds
   * @param {Object} ball - Ball position
   * @param {Object} triangle - Triangle object
   * @param {number} ballRadius - Ball radius
   * @param {number} tolerance - Collision tolerance
   * @returns {boolean} True if ball is on triangle
   */
  static isPointInTriangle(ball, triangle, ballRadius, tolerance) {
    const triangleWidth = triangle.width || GameConfig.triangle.width;
    const triangleHeight = GameConfig.triangle.height;

    // Calculate triangle bounds
    const triangleTop = triangle.y - triangleHeight / 2;
    const triangleBottom = triangle.y + triangleHeight / 2;
    const triangleLeft = triangle.x - triangleWidth / 2 - tolerance;
    const triangleRight = triangle.x + triangleWidth / 2 + tolerance;

    // Check if ball bottom is within triangle Y range
    const ballBottom = ball.y + ballRadius;
    const ballTop = ball.y - ballRadius;

    const isInYRange = ballBottom >= triangleTop && ballTop <= triangleBottom;
    
    // Check if ball is within triangle X range
    const isInXRange = ball.x >= triangleLeft && ball.x <= triangleRight;

    return isInYRange && isInXRange;
  }

  /**
   * Get closest triangle to ball
   * @param {Object} ball - Ball position
   * @param {Array} triangles - Array of triangles
   * @returns {Object|null} Closest triangle or null
   */
  static getClosestTriangle(ball, triangles) {
    let closest = null;
    let minDistance = Infinity;

    for (const triangle of triangles) {
      const distance = Math.sqrt(
        Math.pow(triangle.x - ball.x, 2) + 
        Math.pow(triangle.y - ball.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = triangle;
      }
    }

    return closest;
  }

  /**
   * Check if ball is about to fall off
   * @param {Object} ball - Ball position
   * @param {Array} triangles - Array of triangles
   * @returns {boolean} True if ball is in danger
   */
  static isInDanger(ball, triangles) {
    const lookaheadDistance = GameConfig.ball.size * 2;
    const futureBallY = ball.y + lookaheadDistance;

    const futureTriangles = triangles.filter(triangle => {
      return Math.abs(triangle.y - futureBallY) < GameConfig.triangle.height;
    });

    if (futureTriangles.length === 0) {
      return true;
    }

    for (const triangle of futureTriangles) {
      const triangleWidth = triangle.width || GameConfig.triangle.width;
      const left = triangle.x - triangleWidth / 2;
      const right = triangle.x + triangleWidth / 2;

      if (ball.x >= left && ball.x <= right) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get collision boundaries for debugging
   * @param {Object} triangle - Triangle object
   * @returns {Object} Boundary coordinates
   */
  static getCollisionBounds(triangle) {
    const triangleWidth = triangle.width || GameConfig.triangle.width;
    const triangleHeight = GameConfig.triangle.height;

    return {
      top: triangle.y - triangleHeight / 2,
      bottom: triangle.y + triangleHeight / 2,
      left: triangle.x - triangleWidth / 2,
      right: triangle.x + triangleWidth / 2,
      center: { x: triangle.x, y: triangle.y }
    };
  }

  /**
   * Calculate distance between two points
   * @param {Object} point1 - First point {x, y}
   * @param {Object} point2 - Second point {x, y}
   * @returns {number} Distance
   */
  static distance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + 
      Math.pow(point2.y - point1.y, 2)
    );
  }

  /**
   * Check line intersection (for advanced collision)
   * @param {Object} p1 - Line 1 point 1
   * @param {Object} p2 - Line 1 point 2
   * @param {Object} p3 - Line 2 point 1
   * @param {Object} p4 - Line 2 point 2
   * @returns {boolean} True if lines intersect
   */
  static lineIntersection(p1, p2, p3, p4) {
    const denominator = ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y));
    
    if (denominator === 0) {
      return false;
    }

    const ua = (((p4.x - p3.x) * (p1.y - p3.y)) - ((p4.y - p3.y) * (p1.x - p3.x))) / denominator;
    const ub = (((p2.x - p1.x) * (p1.y - p3.y)) - ((p2.y - p1.y) * (p1.x - p3.x))) / denominator;

    return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
  }
}

export default CollisionDetector;
