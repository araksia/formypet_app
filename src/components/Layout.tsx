
import React from 'react';
import Navigation from './Navigation';
import OfflineIndicator from './OfflineIndicator';
import { useOnline } from '../hooks/useOnline';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isOnline = useOnline();
  const { isKeyboardOpen, keyboardHeight } = useVirtualKeyboard();

  if (!isOnline) {
    return <OfflineIndicator />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main 
        className={`keyboard-adjust ${isKeyboardOpen ? 'mb-4' : ''}`}
        style={{ 
          transform: isKeyboardOpen ? `translateY(-${Math.max(0, keyboardHeight - 100)}px)` : 'none',
          minHeight: isKeyboardOpen ? 'auto' : '100vh',
          paddingTop: 'calc(5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
