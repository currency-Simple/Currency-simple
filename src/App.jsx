/**
 * App.jsx
 * 
 * Main application component
 */

import React, { useState, useEffect } from 'react';
import GameCanvas from './components/Game/GameCanvas';
import MenuScreen from './components/UI/MenuScreen';
import GameOverScreen from './components/UI/GameOverScreen';
import PauseScreen from './components/UI/PauseScreen';
import useGameState from './hooks/useGameState';
import GameConfig from './game/config/GameConfig';
import './styles/globals.css';

function App() {
  const gameState = useGameState();
  const [selectedBall, setSelectedBall] = useState(0);
  const [selectedPath, setSelectedPath] = useState(0);

  // Handle game state UI rendering
  const renderGameState = () => {
    switch (gameState.gameState) {
      case GameConfig.states.MENU:
        return (
          <MenuScreen
            selectedBall={selectedBall}
            setSelectedBall={setSelectedBall}
            selectedPath={selectedPath}
            setSelectedPath={setSelectedPath}
            onStart={() => gameState.startGame()}
          />
        );

      case GameConfig.states.PLAYING:
      case GameConfig.states.PAUSED:
        return (
          <>
            <GameCanvas
              gameState={gameState}
              selectedBall={selectedBall}
              selectedPath={selectedPath}
            />
            {gameState.gameState === GameConfig.states.PAUSED && (
              <PauseScreen
                onResume={() => gameState.pauseGame()}
                onMenu={() => gameState.goToMenu()}
              />
            )}
          </>
        );

      case GameConfig.states.GAME_OVER:
        return (
          <GameOverScreen
            score={gameState.score}
            stats={gameState.getStats()}
            onRestart={() => gameState.startGame()}
            onMenu={() => gameState.goToMenu()}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {renderGameState()}
    </div>
  );
}

export default App;
