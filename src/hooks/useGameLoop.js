/**
 * useGameLoop.js
 * 
 * Custom React hook for managing the main game loop
 */

import { useEffect, useRef, useCallback } from 'react';
import GameConfig from '../game/config/GameConfig';

const useGameLoop = (callback, isRunning = true, fps = GameConfig.animation.fps) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const fpsInterval = 1000 / fps;

  const animate = useCallback((time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;

      // Only run callback if enough time has passed (FPS limiting)
      if (deltaTime >= fpsInterval) {
        callback(deltaTime);
        previousTimeRef.current = time - (deltaTime % fpsInterval);
      }
    } else {
      previousTimeRef.current = time;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [callback, fpsInterval]);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [isRunning, animate]);

  return requestRef;
};

export default useGameLoop;
