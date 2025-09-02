
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
        className={`pt-8 pb-nav safe-area-left safe-area-right keyboard-adjust ${isKeyboardOpen ? 'mb-4' : ''}`}
        style={{ 
          transform: isKeyboardOpen ? `translateY(-${Math.max(0, keyboardHeight - 100)}px)` : 'none',
          minHeight: isKeyboardOpen ? 'auto' : '100vh',
          paddingTop: 'max(2rem, env(safe-area-inset-top) + 1rem)',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))'
        }}
      >
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
