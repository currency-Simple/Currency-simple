/**
 * StateManager.js
 * 
 * Manages game state transitions and validation
 */

import GameConfig from '../config/GameConfig';

class StateManager {
  constructor() {
    this.currentState = GameConfig.states.MENU;
    this.previousState = null;
    this.stateHistory = [];
    this.stateStartTime = Date.now();
    this.listeners = new Map();
  }

  /**
   * Change game state
   * @param {string} newState - New state to transition to
   * @returns {boolean} True if state changed successfully
   */
  setState(newState) {
    // Validate state
    if (!this.isValidState(newState)) {
      console.warn(`Invalid state: ${newState}`);
      return false;
    }

    // Check if state is actually changing
    if (this.currentState === newState) {
      return false;
    }

    // Store previous state
    this.previousState = this.currentState;
    
    // Add to history
    this.stateHistory.push({
      state: this.currentState,
      duration: Date.now() - this.stateStartTime,
      timestamp: Date.now()
    });

    // Update state
    this.currentState = newState;
    this.stateStartTime = Date.now();

    // Notify listeners
    this.notifyListeners(newState, this.previousState);

    if (GameConfig.debug.logEvents) {
      console.log(`State changed: ${this.previousState} → ${newState}`);
    }

    return true;
  }

  /**
   * Get current state
   * @returns {string} Current state
   */
  getState() {
    return this.currentState;
  }

  /**
   * Get previous state
   * @returns {string|null} Previous state
   */
  getPreviousState() {
    return this.previousState;
  }

  /**
   * Check if current state matches
   * @param {string} state - State to check
   * @returns {boolean} True if matches
   */
  isState(state) {
    return this.currentState === state;
  }

  /**
   * Check if state is valid
   * @param {string} state - State to validate
   * @returns {boolean} True if valid
   */
  isValidState(state) {
    return Object.values(GameConfig.states).includes(state);
  }

  /**
   * Go back to previous state
   * @returns {boolean} True if successfully went back
   */
  goBack() {
    if (this.previousState) {
      return this.setState(this.previousState);
    }
    return false;
  }

  /**
   * Get time in current state
   * @returns {number} Time in milliseconds
   */
  getTimeInState() {
    return Date.now() - this.stateStartTime;
  }

  /**
   * Check if game is playing
   * @returns {boolean} True if in playing state
   */
  isPlaying() {
    return this.currentState === GameConfig.states.PLAYING;
  }

  /**
   * Check if game is paused
   * @returns {boolean} True if in paused state
   */
  isPaused() {
    return this.currentState === GameConfig.states.PAUSED;
  }

  /**
   * Check if in menu
   * @returns {boolean} True if in menu state
   */
  isInMenu() {
    return this.currentState === GameConfig.states.MENU;
  }

  /**
   * Check if game is over
   * @returns {boolean} True if in game over state
   */
  isGameOver() {
    return this.currentState === GameConfig.states.GAME_OVER;
  }

  /**
   * Check if game is active (playing or paused)
   * @returns {boolean} True if game is active
   */
  isGameActive() {
    return this.isPlaying() || this.isPaused();
  }

  /**
   * Toggle between playing and paused
   */
  togglePause() {
    if (this.isPlaying()) {
      this.setState(GameConfig.states.PAUSED);
    } else if (this.isPaused()) {
      this.setState(GameConfig.states.PLAYING);
    }
  }

  /**
   * Start new game
   */
  startGame() {
    this.setState(GameConfig.states.PLAYING);
  }

  /**
   * End game
   */
  endGame() {
    this.setState(GameConfig.states.GAME_OVER);
  }

  /**
   * Return to menu
   */
  goToMenu() {
    this.setState(GameConfig.states.MENU);
  }

  /**
   * Reset state manager
   */
  reset() {
    this.currentState = GameConfig.states.MENU;
    this.previousState = null;
    this.stateStartTime = Date.now();
  }

  /**
   * Add state change listener
   * @param {string} id - Listener ID
   * @param {Function} callback - Callback function (newState, oldState) => void
   */
  addListener(id, callback) {
    this.listeners.set(id, callback);
  }

  /**
   * Remove state change listener
   * @param {string} id - Listener ID
   */
  removeListener(id) {
    this.listeners.delete(id);
  }

  /**
   * Notify all listeners of state change
   * @param {string} newState - New state
   * @param {string} oldState - Old state
   */
  notifyListeners(newState, oldState) {
    this.listeners.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Get state history
   * @returns {Array} Array of state history entries
   */
  getHistory() {
    return [...this.stateHistory];
  }

  /**
   * Get statistics about state usage
   * @returns {Object} State statistics
   */
  getStats() {
    const stats = {};
    
    // Calculate total time in each state
    this.stateHistory.forEach(entry => {
      if (!stats[entry.state]) {
        stats[entry.state] = {
          count: 0,
          totalTime: 0,
          averageTime: 0
        };
      }
      stats[entry.state].count++;
      stats[entry.state].totalTime += entry.duration;
    });

    // Calculate averages
    Object.keys(stats).forEach(state => {
      stats[state].averageTime = 
        stats[state].totalTime / stats[state].count;
    });

    return {
      currentState: this.currentState,
      timeInCurrentState: this.getTimeInState(),
      stateStats: stats,
      totalStateChanges: this.stateHistory.length
    };
  }

  /**
   * Export state data
   * @returns {string} JSON string of state data
   */
  exportData() {
    return JSON.stringify({
      current: this.currentState,
      previous: this.previousState,
      timeInState: this.getTimeInState(),
      history: this.stateHistory,
      stats: this.getStats()
    }, null, 2);
  }

  /**
   * Can transition from current state to target state
   * @param {string} targetState - Target state
   * @returns {boolean} True if transition is allowed
   */
  canTransitionTo(targetState) {
    // Define allowed transitions
    const allowedTransitions = {
      [GameConfig.states.MENU]: [
        GameConfig.states.PLAYING
      ],
      [GameConfig.states.PLAYING]: [
        GameConfig.states.PAUSED,
        GameConfig.states.GAME_OVER,
        GameConfig.states.MENU
      ],
      [GameConfig.states.PAUSED]: [
        GameConfig.states.PLAYING,
        GameConfig.states.MENU,
        GameConfig.states.GAME_OVER
      ],
      [GameConfig.states.GAME_OVER]: [
        GameConfig.states.MENU,
        GameConfig.states.PLAYING
      ]
    };

    const allowed = allowedTransitions[this.currentState] || [];
    return allowed.includes(targetState);
  }
}

export default StateManager;
