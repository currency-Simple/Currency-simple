/**
 * useGameState.js
 * 
 * Custom React hook for managing game state
 */

import { useState, useCallback, useEffect } from 'react';
import StateManager from '../game/managers/StateManager';
import ScoreManager from '../game/managers/ScoreManager';
import SpeedManager from '../game/managers/SpeedManager';
import MovementController from '../game/physics/MovementController';
import GameConfig from '../game/config/GameConfig';

const useGameState = () => {
  const [stateManager] = useState(() => new StateManager());
  const [scoreManager] = useState(() => new ScoreManager());
  const [speedManager] = useState(() => new SpeedManager());
  const [movementController] = useState(() => new MovementController());
  
  const [gameState, setGameState] = useState(GameConfig.states.MENU);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });

  // Initialize managers
  useEffect(() => {
    // Add state change listener
    stateManager.addListener('main', (newState) => {
      setGameState(newState);
    });

    return () => {
      stateManager.removeListener('main');
    };
  }, [stateManager]);

  // Start new game
  const startGame = useCallback(() => {
    scoreManager.init();
    speedManager.init();
    movementController.init();
    stateManager.startGame();
    
    setScore(0);
    setSpeed(speedManager.getCurrentSpeed());
    setBallPosition(movementController.getPosition());
  }, [scoreManager, speedManager, movementController, stateManager]);

  // Pause game
  const pauseGame = useCallback(() => {
    stateManager.togglePause();
  }, [stateManager]);

  // End game
  const endGame = useCallback(() => {
    scoreManager.endGame();
    stateManager.endGame();
  }, [scoreManager, stateManager]);

  // Go to menu
  const goToMenu = useCallback(() => {
    stateManager.goToMenu();
  }, [stateManager]);

  // Update score
  const addScore = useCallback(() => {
    scoreManager.addTriangle();
    setScore(scoreManager.score);
    
    // Update speed
    const speedChanged = speedManager.update(scoreManager.trianglesPassed);
    if (speedChanged) {
      setSpeed(speedManager.getCurrentSpeed());
    }
  }, [scoreManager, speedManager]);

  // Move ball
  const moveBall = useCallback((clientX, sensitivity) => {
    movementController.handleTouchMove(clientX, sensitivity);
    movementController.update();
    setBallPosition(movementController.getPosition());
  }, [movementController]);

  // Touch handlers
  const handleTouchStart = useCallback((clientX) => {
    movementController.handleTouchStart(clientX);
  }, [movementController]);

  const handleTouchMove = useCallback((clientX) => {
    moveBall(clientX, 0.5);
  }, [moveBall]);

  const handleTouchEnd = useCallback(() => {
    movementController.handleTouchEnd();
  }, [movementController]);

  return {
    // State
    gameState,
    score,
    speed,
    ballPosition,
    
    // Managers
    stateManager,
    scoreManager,
    speedManager,
    movementController,
    
    // Actions
    startGame,
    pauseGame,
    endGame,
    goToMenu,
    addScore,
    moveBall,
    
    // Touch handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Helper methods
    isPlaying: () => stateManager.isPlaying(),
    isPaused: () => stateManager.isPaused(),
    isGameOver: () => stateManager.isGameOver(),
    isInMenu: () => stateManager.isInMenu(),
    
    // Stats
    getStats: () => ({
      score: scoreManager.getStats(),
      speed: speedManager.getStats(),
      state: stateManager.getStats()
    })
  };
};

export default useGameState;
