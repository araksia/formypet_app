
import React from 'react';
import Navigation from './Navigation';
import Header from './Header';
import OfflineIndicator from './OfflineIndicator';
import { useOnline } from '../hooks/useOnline';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isOnline = useOnline();
  const { isKeyboardOpen, keyboardHeight } = useVirtualKeyboard();
  const location = useLocation();

  if (!isOnline) {
    return <OfflineIndicator />;
  }

  // Get page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Αρχική';
      case '/pets':
        return 'Κατοικίδια μου';
      case '/calendar':
        return 'Ημερολόγιο';
      case '/expenses':
        return 'Έξοδα';
      case '/achievements':
        return 'Επιτεύγματα';
      case '/settings':
        return 'Ρυθμίσεις';
      case '/profile':
        return 'Προφίλ';
      default:
        return 'ForMyPet';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        title={getPageTitle()}
        showNotifications={true}
        showProfile={true}
      />
      <main 
        className="px-4"
        style={{ 
          minHeight: '100vh',
          paddingTop: '114px', // 84px header + 30px safe area
          paddingBottom: isKeyboardOpen ? `${keyboardHeight + 100}px` : '100px' // 80px nav + 20px safe area
        }}
      >
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
