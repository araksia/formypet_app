
import React from 'react';
import Navigation from './Navigation';
import Header from './Header';
import OfflineIndicator from './OfflineIndicator';
import { OfflineStatusBar } from './OfflineStatusBar';
import { useOnline } from '../hooks/useOnline';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const isOnline = useOnline();
  const { isKeyboardOpen, keyboardHeight } = useVirtualKeyboard();
  const location = useLocation();
  
  // Temporarily disable offline functionality to fix the React hooks error
  // TODO: Re-enable once the hooks issue is resolved
  // useOfflineData({ 
  //   userId: user?.id,
  //   autoDownload: true 
  // });

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
    <div className="min-h-screen bg-background text-foreground safe-area-top safe-area-left safe-area-right">
      <OfflineStatusBar />
      <Header 
        title={getPageTitle()}
        showNotifications={true}
        showProfile={true}
      />
      <main 
        className="px-4 pb-nav main-content pt-20"
        style={{
          minHeight: 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
        }}
      >
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
