
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
    <div className="min-h-screen bg-background text-foreground">
      <main 
        className="pt-20 pb-20 px-4"
        style={{ 
          minHeight: '100vh',
          paddingBottom: isKeyboardOpen ? `${keyboardHeight + 80}px` : '80px'
        }}
      >
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
