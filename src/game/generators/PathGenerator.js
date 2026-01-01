/**
 * PathGenerator.js
 * 
 * Generates different types of paths for the game
 * Each path type creates a unique gameplay experience
 */

import GameConfig from '../config/GameConfig';

class PathGenerator {
  /**
   * Generate a path based on type
   * @param {number} type - Path type index (0-9)
   * @param {number} startY - Starting Y position
   * @returns {Array} Array of path segments
   */
  static generatePath(type, startY) {
    const pathTypes = [
      this.straightPath,
      this.curvedPath,
      this.zigzagPath,
      this.wavyPath,
      this.spiralPath,
      this.jumpPath,
      this.narrowPath,
      this.splitPath,
      this.circularPath,
      this.randomPath
    ];

    const pathFunction = pathTypes[type % 10];
    return pathFunction.call(this, startY);
  }

  /**
   * Path Type 1: Straight Path
   * Classic straight corridor
   */
  static straightPath(startY) {
    const segments = [];
    const { width, height, spacing } = GameConfig.triangle;
    
    for (let i = 0; i < 10; i++) {
      segments.push({
        x: GameConfig.ball.initialX,
        y: startY - i * spacing,
        rotation: 0,
        width: width,
        type: 'straight'
      });
    }
    
    return segments;
  }

  /**
   * Path Type 2: Curved Path
   * Smooth sinusoidal curves
   */
  static curvedPath(startY) {
    const segments = [];
    const { width, spacing } = GameConfig.triangle;
    const amplitude = 80;
    const frequency = 0.5;
    
    for (let i = 0; i < 10; i++) {
      const angle = i * frequency;
      const xOffset = Math.sin(angle) * amplitude;
      
      segments.push({
        x: GameConfig.ball.initialX + xOffset,
        y: startY - i * spacing,
        rotation: Math.sin(angle) * 15,
        width: width,
        type: 'curved'
      });
    }
    
    return segments;
  }

  /**
   * Path Type 3: Zigzag Path
   * Sharp alternating turns
   */
  static zigzagPath(startY) {
    const segments = [];
    const { width, spacing } = GameConfig.triangle;
    const offset = 60;
    
    for (let i = 0; i < 10; i++) {
      const direction = i % 2 === 0 ? -1 : 1;
      
      segments.push({
        x: GameConfig.ball.initialX + (direction * offset),
        y: startY - i * spacing,
        rotation: direction * 20,
        width: width,
        type: 'zigzag'
      });
    }
    
    return segments;
  }

  /**
   * Path Type 4: Wavy Path
   * Flowing wave patterns
   */
  static wavyPath(startY) {
    const segments = [];
    const { width, spacing } = GameConfig.triangle;
    const amplitude = 100;
    const frequency = 0.8;
    
    for (let i = 0; i < 10; i++) {
      const angle = i * frequency;
      const xOffset = Math.sin(angle) * amplitude;
      
      segments.push({
        x: GameConfig.ball.initialX + xOffset,
        y: startY - i * spacing,
        rotation: Math.cos(angle) * 20,
        width: width,
        type: 'wavy'
      });
    }
    
    return segments;
  }

  /**
   * Path Type 5: Spiral Path
   * Circular spiral motion
   */
  static spiralPath(startY) {
    const segments = [];
    const { width, spacing } = GameConfig.triangle;
    const baseRadius = 50;
    const radiusIncrease = 5;
    
    for (let i = 0; i < 10; i++) {
      const angle = i * 0.6;
      const radius = baseRadius + (i * radiusIncrease);
      const xOffset = Math.cos(angle) * radius;
      
      segments.push({
        x: GameConfig.ball.initialX + xOffset,
        y: startY - i * spacing,
        rotation: angle * (180 / Math.PI),
        width: width,
        type: 'spiral'
      });
    }
    
    return segments;
  }

  /**
   * Path Type 6: Jump Path
   * Platforms with gaps
   */
  static jumpPath(startY) {
    const segments = [];
    const { width, spacing } = GameConfig.triangle;
    const jumpSpacing = 120;
    
    for (let i = 0; i < 10; i++) {
      const xOffset = i % 3 === 0 ? (Math.random() - 0.5) * 100 : 0;
      
      segments.push({
        x: GameConfig.ball.initialX + xOffset,
        y: startY - i * jumpSpacing,
        rotation: 0,
        width: width,
        type: 'jump'
      });
    }
    
    return segments;
  }

  /**
   * Path Type 7: Narrow Path
   * Progressively narrowing corridor
   */
  static narrowPath(startY) {
    const segments = [];
    const { width, spacing, minWidth } = GameConfig.triangle;
    const widthDecrease = (width - minWidth) / 10;
    
    for (let i = 0; i < 10; i++) {
      segments.push({
        x: GameConfig.ball.initialX,
        y: startY - i * spacing,
        rotation: 0,
        width: width - (i * widthDecrease),
        type: 'narrow'
      });
    }
    
    return segments;
  }

  /**
   * Path Type 8: Split Path
   * Branching paths
   */
  static splitPath(startY) {
    const segments = [];
    const { width, spacing } = GameConfig.triangle;
    const splitOffset = 50;
    
    for (let i = 0; i < 10; i++) {
      if (i % 3 === 0) {
        // Create split
        segments.push({
          x: GameConfig.ball.initialX - splitOffset,
          y: startY - i * spacing,
          rotation: -15,
          width: width * 0.7,
          type: 'split-left'
        });
        segments.push({
          x: GameConfig.ball.initialX + splitOffset,
          y: startY - i * spacing,
          rotation: 15,
          width: width * 0.7,
          type: 'split-right'
        });
      } else {
        // Single path
        segments.push({
          x: GameConfig.ball.initialX,
          y: startY - i * spacing,
          rotation: 0,
          width: width,
          type: 'split-center'
        });
      }
    }
    
    return segments;
  }

  /**
   * Path Type 9: Circular Path
   * Full circular loops
   */
  static circularPath(startY) {
    const segments = [];
    const { width, spacing } = GameConfig.triangle;
    const radius = 80;
    
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const xOffset = Math.cos(angle) * radius;
      
      segments.push({
        x: GameConfig.ball.initialX + xOffset,
        y: startY - i * spacing,
        rotation: angle * (180 / Math.PI),
        width: width,
        type: 'circular'
      });
    }
    
    return segments;
  }

  /**
   * Path Type 10: Random Path
   * Unpredictable dynamic paths
   */
  static randomPath(startY) {
    const segments = [];
    const { width, spacing } = GameConfig.triangle;
    let lastX = GameConfig.ball.initialX;
    const maxOffset = 120;
    const smoothness = 0.3;
    
    for (let i = 0; i < 10; i++) {
      const randomOffset = (Math.random() - 0.5) * maxOffset;
      const targetX = lastX + randomOffset;
      const smoothX = lastX + (targetX - lastX) * smoothness;
      const finalX = Math.max(60, Math.min(240, smoothX));
      
      segments.push({
        x: finalX,
        y: startY - i * spacing,
        rotation: (finalX - lastX) * 0.3,
        width: width + (Math.random() - 0.5) * 20,
        type: 'random'
      });
      
      lastX = finalX;
    }
    
    return segments;
  }

  /**
   * Get path name by type
   * @param {number} type - Path type index
   * @returns {string} Path name
   */
  static getPathName(type) {
    const names = [
      'Straight',
      'Curved',
      'Zigzag',
      'Wavy',
      'Spiral',
      'Jump',
      'Narrow',
      'Split',
      'Circular',
      'Random'
    ];
    return names[type % 10];
  }

  /**
   * Get path difficulty
   * @param {number} type - Path type index
   * @returns {number} Difficulty rating (1-5)
   */
  static getPathDifficulty(type) {
    const difficulties = [1, 2, 3, 3, 4, 4, 5, 4, 5, 5];
    return difficulties[type % 10];
  }
}

export default PathGenerator;
