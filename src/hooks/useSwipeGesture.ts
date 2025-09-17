import React, { useState, useRef, useCallback } from 'react';

interface SwipeGestureState {
  isRevealed: boolean;
  translateX: number;
  isDragging: boolean;
}

interface SwipeGestureOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const useSwipeGesture = (options: SwipeGestureOptions = {}) => {
  const { threshold = 80, onSwipeLeft, onSwipeRight } = options;
  const [state, setState] = useState<SwipeGestureState>({
    isRevealed: false,
    translateX: 0,
    isDragging: false,
  });

  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const initialTranslate = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    initialTranslate.current = state.translateX;
    setState(prev => ({ ...prev, isDragging: true }));
  }, [state.translateX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    const newTranslateX = initialTranslate.current + deltaX;
    
    // Constrain movement: only allow swipe left (negative values) up to -120px
    const constrainedTranslateX = Math.max(Math.min(newTranslateX, 0), -120);
    
    setState(prev => ({ ...prev, translateX: constrainedTranslateX }));
  }, [state.isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!state.isDragging) return;

    const deltaX = currentX.current - startX.current;
    
    setState(prev => ({ ...prev, isDragging: false }));

    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        // Swipe left - reveal actions
        setState(prev => ({ ...prev, isRevealed: true, translateX: -120 }));
        onSwipeLeft?.();
      } else {
        // Swipe right - hide actions
        setState(prev => ({ ...prev, isRevealed: false, translateX: 0 }));
        onSwipeRight?.();
      }
    } else {
      // Snap back to previous state
      if (state.isRevealed) {
        setState(prev => ({ ...prev, translateX: -120 }));
      } else {
        setState(prev => ({ ...prev, translateX: 0 }));
      }
    }
  }, [state.isDragging, state.isRevealed, threshold, onSwipeLeft, onSwipeRight]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    initialTranslate.current = state.translateX;
    setState(prev => ({ ...prev, isDragging: true }));
  }, [state.translateX]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.isDragging) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    const newTranslateX = initialTranslate.current + deltaX;
    
    const constrainedTranslateX = Math.max(Math.min(newTranslateX, 0), -120);
    
    setState(prev => ({ ...prev, translateX: constrainedTranslateX }));
  }, [state.isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!state.isDragging) return;

    const deltaX = currentX.current - startX.current;
    
    setState(prev => ({ ...prev, isDragging: false }));

    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        setState(prev => ({ ...prev, isRevealed: true, translateX: -120 }));
        onSwipeLeft?.();
      } else {
        setState(prev => ({ ...prev, isRevealed: false, translateX: 0 }));
        onSwipeRight?.();
      }
    } else {
      if (state.isRevealed) {
        setState(prev => ({ ...prev, translateX: -120 }));
      } else {
        setState(prev => ({ ...prev, translateX: 0 }));
      }
    }
  }, [state.isDragging, state.isRevealed, threshold, onSwipeLeft, onSwipeRight]);

  const resetSwipe = useCallback(() => {
    setState({ isRevealed: false, translateX: 0, isDragging: false });
  }, []);

  return {
    ...state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
    resetSwipe,
  };
};