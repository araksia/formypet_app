// iOS Push Notification Debug Utilities
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { iOSLogger } from './iOSLogger';

export class iOSPushDebug {
  
  static async forceTokenRefresh() {
    iOSLogger.log('🍎 Force Token Refresh Started');
    
    try {
      // Check if we're on iOS
      if (Capacitor.getPlatform() !== 'ios') {
        iOSLogger.log('❌ Not on iOS platform');
        return { success: false, error: 'Not on iOS' };
      }

      // Remove all existing listeners first
      await PushNotifications.removeAllListeners();
      iOSLogger.log('🍎 Removed all existing listeners');

      // Check current permissions before doing anything
      const initialPermissions = await PushNotifications.checkPermissions();
      iOSLogger.log('🍎 Initial permissions check', {
        receive: initialPermissions.receive
      });

      if (initialPermissions.receive !== 'granted') {
        // Request permissions
        const newPermissions = await PushNotifications.requestPermissions();
        iOSLogger.log('🍎 Requested new permissions', {
          receive: newPermissions.receive
        });
        
        if (newPermissions.receive !== 'granted') {
          return { 
            success: false, 
            error: 'Permissions not granted',
            permissions: newPermissions 
          };
        }
      }

      // Add a timeout promise to see if registration event fires
      let tokenReceived = false;
      const registrationPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!tokenReceived) {
            iOSLogger.error('🍎 Registration timeout - no token received in 10 seconds', {
              entitlementCheck: 'Make sure App.entitlements has aps-environment set to development',
              bundleIdCheck: 'Verify bundle ID matches Apple Developer Console',
              certificateCheck: 'APNs certificate/key might be missing',
              suggestion: 'Run: npx cap sync ios && npx cap run ios to rebuild with new entitlements'
            });
            reject(new Error('Registration timeout - iOS might not be requesting permissions or token'));
          }
        }, 10000);

        PushNotifications.addListener('registration', (token) => {
          clearTimeout(timeout);
          tokenReceived = true;
          iOSLogger.log('🍎 Registration promise resolved with token!', {
            tokenLength: token.value?.length,
            tokenExists: !!token.value,
            tokenType: typeof token.value,
            tokenPreview: token.value ? `${token.value.substring(0, 20)}...` : 'no token'
          });
          resolve(token);
        });

        PushNotifications.addListener('registrationError', (error) => {
          clearTimeout(timeout);
          iOSLogger.error('🍎 Registration promise rejected with error', {
            error: error.error,
            fullError: JSON.stringify(error),
            possibleCauses: [
              'Missing APNs certificate/key in Apple Developer Console',
              'Incorrect bundle ID configuration', 
              'App not properly signed',
              'Entitlements file misconfigured'
            ]
          });
          reject(error);
        });
      });

      // Register for push notifications
      iOSLogger.log('🍎 About to call PushNotifications.register()');
      await PushNotifications.register();
      iOSLogger.log('🍎 PushNotifications.register() call completed - waiting for token...');

      // Wait for registration or timeout
      try {
        const receivedToken = await registrationPromise as { value: string };
        iOSLogger.log('🍎 Registration completed successfully', {
          tokenLength: receivedToken?.value?.length
        });
      } catch (regError: any) {
        iOSLogger.error('🍎 Registration failed or timed out', {
          error: regError.message,
          tokenReceived,
          suggestion: 'Check iOS settings, app permissions, or Apple Developer setup'
        });
        return {
          success: false,
          error: `Registration failed: ${regError.message}`,
          suggestion: 'Check iOS Notification settings in System Preferences'
        };
      }

      return { 
        success: true, 
        message: 'Force refresh initiated with timeout monitoring',
        permissions: initialPermissions 
      };

    } catch (error) {
      iOSLogger.error('🍎 Force refresh failed', {
        error: error.message,
        stack: error.stack
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  static async debugTokenStatus() {
    iOSLogger.log('🍎 Debug Token Status Started');
    
    try {
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        iOSLogger.error('🍎 User auth error', { error: userError.message });
        return { success: false, error: 'Auth error: ' + userError.message };
      }

      if (!user) {
        iOSLogger.log('🍎 No authenticated user found');
        return { success: false, error: 'No authenticated user' };
      }

      // Check existing tokens
      const { data: tokens, error: tokensError } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'ios')
        .eq('is_active', true);

      if (tokensError) {
        iOSLogger.error('🍎 Error fetching tokens', { error: tokensError.message });
        return { success: false, error: 'Tokens fetch error: ' + tokensError.message };
      }

      iOSLogger.log('🍎 Current iOS tokens', {
        userEmail: user.email,
        userId: user.id,
        tokenCount: tokens?.length || 0,
        tokens: tokens?.map(t => ({
          id: t.id,
          created: t.created_at,
          updated: t.updated_at,
          tokenPreview: t.token?.substring(0, 20) + '...'
        }))
      });

      // Check permissions
      const permissions = await PushNotifications.checkPermissions();
      iOSLogger.log('🍎 Current push permissions', {
        receive: permissions.receive
      });

      return {
        success: true,
        user: {
          email: user.email,
          id: user.id
        },
        tokens: tokens || [],
        permissions,
        platform: Capacitor.getPlatform(),
        isNative: Capacitor.isNativePlatform()
      };

    } catch (error) {
      iOSLogger.error('🍎 Debug status failed', {
        error: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  }
}

// Make it available globally for iOS to call
declare global {
  interface Window {
    iOSPushDebug: typeof iOSPushDebug;
  }
}

if (typeof window !== 'undefined') {
  window.iOSPushDebug = iOSPushDebug;
}