/**
 * useTouch.js
 * 
 * Custom React hook for handling touch and mouse input
 */

import { useCallback, useRef } from 'react';

const useTouch = (onStart, onMove, onEnd) => {
  const isTouching = useRef(false);

  const handleStart = useCallback((e) => {
    e.preventDefault();
    isTouching.current = true;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    onStart && onStart(clientX);
  }, [onStart]);

  const handleMove = useCallback((e) => {
    if (!isTouching.current) return;
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    onMove && onMove(clientX);
  }, [onMove]);

  const handleEnd = useCallback((e) => {
    e.preventDefault();
    isTouching.current = false;
    onEnd && onEnd();
  }, [onEnd]);

  const handlers = {
    // Touch events
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    
    // Mouse events (for desktop)
    onMouseDown: handleStart,
    onMouseMove: handleMove,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd
  };

  return handlers;
};

export default useTouch;
