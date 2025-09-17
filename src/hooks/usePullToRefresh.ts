import React, { useState, useRef, useCallback } from 'react';

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
}

interface PullToRefreshOptions {
  threshold?: number;
  maxDistance?: number;
  onRefresh?: () => Promise<void> | void;
}

export const usePullToRefresh = (options: PullToRefreshOptions = {}) => {
  const { threshold = 80, maxDistance = 120, onRefresh } = options;
  
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false,
  });

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const scrollElement = useRef<Element | null>(null);

  const isAtTop = useCallback(() => {
    if (scrollElement.current) {
      return scrollElement.current.scrollTop <= 0;
    }
    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isAtTop()) return;
    
    startY.current = e.touches[0].clientY;
    scrollElement.current = e.currentTarget.closest('[data-scroll]') || document.documentElement;
  }, [isAtTop]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isAtTop() || state.isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    if (deltaY > 0) {
      e.preventDefault();
      const pullDistance = Math.min(deltaY * 0.5, maxDistance);
      const canRefresh = pullDistance >= threshold;
      
      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
        canRefresh,
      }));
    }
  }, [isAtTop, state.isRefreshing, threshold, maxDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!state.isPulling) return;
    
    if (state.canRefresh && onRefresh) {
      setState(prev => ({ 
        ...prev, 
        isRefreshing: true, 
        isPulling: false,
        pullDistance: threshold 
      }));
      
      try {
        await onRefresh();
      } finally {
        setState(prev => ({ 
          ...prev, 
          isRefreshing: false, 
          pullDistance: 0, 
          canRefresh: false 
        }));
      }
    } else {
      setState(prev => ({ 
        ...prev, 
        isPulling: false, 
        pullDistance: 0, 
        canRefresh: false 
      }));
    }
  }, [state.isPulling, state.canRefresh, onRefresh, threshold]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isAtTop()) return;
    
    startY.current = e.clientY;
    scrollElement.current = e.currentTarget.closest('[data-scroll]') || document.documentElement;
  }, [isAtTop]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isAtTop() || state.isRefreshing) return;
    
    currentY.current = e.clientY;
    const deltaY = currentY.current - startY.current;
    
    if (deltaY > 0 && e.buttons === 1) {
      e.preventDefault();
      const pullDistance = Math.min(deltaY * 0.5, maxDistance);
      const canRefresh = pullDistance >= threshold;
      
      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
        canRefresh,
      }));
    }
  }, [isAtTop, state.isRefreshing, threshold, maxDistance]);

  const handleMouseUp = useCallback(async () => {
    if (!state.isPulling) return;
    
    if (state.canRefresh && onRefresh) {
      setState(prev => ({ 
        ...prev, 
        isRefreshing: true, 
        isPulling: false,
        pullDistance: threshold 
      }));
      
      try {
        await onRefresh();
      } finally {
        setState(prev => ({ 
          ...prev, 
          isRefreshing: false, 
          pullDistance: 0, 
          canRefresh: false 
        }));
      }
    } else {
      setState(prev => ({ 
        ...prev, 
        isPulling: false, 
        pullDistance: 0, 
        canRefresh: false 
      }));
    }
  }, [state.isPulling, state.canRefresh, onRefresh, threshold]);

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
  };
};