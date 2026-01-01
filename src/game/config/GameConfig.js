/**
 * GameConfig.js
 * 
 * Central configuration file for all game settings
 * Modify these values to adjust gameplay mechanics
 */

const GameConfig = {
  // Speed Settings
  speed: {
    base: 5,                      // Base speed units per frame
    initialMultiplier: 3,         // 300% initial speed
    increaseRate: 0.2,           // 20% increase per interval
    increaseInterval: 10,         // Increase speed every 10 triangles
    maxSpeed: 50                  // Maximum speed cap
  },

  // Ball Settings
  ball: {
    size: 30,                     // Ball diameter in pixels
    initialX: 150,                // Starting X position
    initialY: 500,                // Starting Y position
    friction: 0.95,               // Movement friction (0-1)
    maxVelocity: 15               // Maximum movement speed
  },

  // Triangle/Path Settings
  triangle: {
    width: 80,                    // Default triangle width
    height: 100,                  // Triangle height
    spacing: 100,                 // Vertical spacing between triangles
    minWidth: 40,                 // Minimum width for narrow paths
    maxWidth: 120                 // Maximum width for wide paths
  },

  // Path Generation Settings
  path: {
    width: 200,                   // Total path width
    segmentsVisible: 15,          // Number of visible segments
    generationThreshold: 10,      // Generate new segments when below this
    minSegments: 5,               // Minimum segments per path
    maxSegments: 20               // Maximum segments per path
  },

  // Visual Settings
  colors: {
    balls: [
      '#00ffff',                  // Cyan
      '#ff00ff',                  // Magenta
      '#00ff00',                  // Green
      '#ffff00',                  // Yellow
      '#ffffff'                   // White
    ],
    paths: [
      '#00ffff',                  // Cyan
      '#ff00ff',                  // Magenta
      '#00ff00',                  // Green
      '#ffff00',                  // Yellow
      '#ff0000'                   // Red
    ],
    background: '#000000',        // Black
    ui: {
      primary: '#00ffff',
      secondary: '#888888',
      danger: '#ff0000',
      success: '#00ff00'
    }
  },

  // Collision Settings
  collision: {
    tolerance: 5,                 // Pixel tolerance for collision detection
    checkInterval: 1              // Frames between collision checks
  },

  // UI Settings
  ui: {
    hudHeight: 80,                // Height of HUD area
    buttonSize: 64,               // Control button size
    fontSize: {
      title: 48,
      subtitle: 24,
      score: 36,
      button: 16
    }
  },

  // Game States
  states: {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
  },

  // Animation Settings
  animation: {
    fps: 60,                      // Target frames per second
    transitionDuration: 300,      // UI transition duration (ms)
    glowIntensity: 20             // Neon glow effect intensity
  },

  // Score Settings
  score: {
    pointsPerTriangle: 1,         // Points earned per triangle passed
    bonusMultiplier: 1.5,         // Bonus multiplier for combos
    comboThreshold: 10            // Triangles needed for combo bonus
  },

  // Debug Settings
  debug: {
    enabled: false,               // Enable debug mode
    showFPS: false,               // Show FPS counter
    showCollisionBoxes: false,    // Show collision boundaries
    logEvents: false              // Log game events to console
  }
};

// Freeze configuration to prevent accidental modifications
Object.freeze(GameConfig);

export default GameConfig;
