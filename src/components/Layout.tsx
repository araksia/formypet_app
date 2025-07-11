
import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
