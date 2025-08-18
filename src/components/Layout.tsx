
import React from 'react';
import Navigation from './Navigation';
import OfflineIndicator from './OfflineIndicator';
import { useOnline } from '../hooks/useOnline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isOnline = useOnline();

  if (!isOnline) {
    return <OfflineIndicator />;
  }

  return (
    <div className="min-h-screen bg-background safe-area-top">
      <main className="pb-16 safe-area-left safe-area-right">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
