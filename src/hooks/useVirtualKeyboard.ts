import { useEffect, useState } from 'react';

export const useVirtualKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleViewportChange = () => {
      // Visual Viewport API detection
      if ('visualViewport' in window && window.visualViewport) {
        const viewport = window.visualViewport as any;
        const heightDifference = window.innerHeight - viewport.height;
        setKeyboardHeight(heightDifference);
        setIsKeyboardOpen(heightDifference > 150);
      } else {
        // Fallback for older browsers
        const heightDifference = window.screen.height - window.innerHeight;
        setKeyboardHeight(heightDifference);
        setIsKeyboardOpen(heightDifference > 150);
      }
    };

    // Visual Viewport API
    if ('visualViewport' in window && window.visualViewport) {
      const viewport = window.visualViewport as any;
      viewport.addEventListener('resize', handleViewportChange);
      return () => viewport.removeEventListener('resize', handleViewportChange);
    } else {
      // Fallback
      window.addEventListener('resize', handleViewportChange);
      return () => window.removeEventListener('resize', handleViewportChange);
    }
  }, []);

  return { keyboardHeight, isKeyboardOpen };
};