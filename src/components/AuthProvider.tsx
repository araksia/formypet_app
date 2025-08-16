import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAnalytics, analyticsEvents } from '@/hooks/useAnalytics';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { trackEvent, setUserId } = useAnalytics();

  // Initialize push notifications when user is authenticated
  usePushNotifications();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST (this is critical)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Defer profile update to avoid deadlock
        if (event === 'SIGNED_IN' && session?.user) {
          // Track login event
          trackEvent(analyticsEvents.USER_LOGIN, {
            method: 'email',
            user_id: session.user.id
          });
          
          // Set analytics user ID
          setUserId(session.user.id);
          
          setTimeout(async () => {
            try {
              console.log('Updating profile for user:', session.user.email);
              await supabase
                .from('profiles')
                .upsert({
                  user_id: session.user.id,
                  email: session.user.email,
                  display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
                }, {
                  onConflict: 'user_id'
                });
            } catch (error) {
              console.error('Error updating profile:', error);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session (no timeout needed)
    const getSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        } else {
          console.log('Existing session found:', session?.user?.email || 'none');
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Track logout event
    if (user) {
      trackEvent(analyticsEvents.USER_LOGOUT, {
        user_id: user.id
      });
    }
    
    await supabase.auth.signOut();
    // Force reload to clear all state
    window.location.href = '/login';
  };


  const value = {
    user,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};