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

      // Add fresh listeners
      PushNotifications.addListener('registration', async (token) => {
        iOSLogger.log('🍎 NEW Token Received in Force Refresh!', {
          tokenLength: token.value?.length,
          tokenPreview: token.value?.substring(0, 20) + '...'
        });

        // Try to save token immediately
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            iOSLogger.error('🍎 No user found during force refresh', {});
            return;
          }

          iOSLogger.log('🍎 Saving token during force refresh', {
            userEmail: user.email,
            userId: user.id
          });

          const { data, error } = await supabase.rpc('save_push_token', {
            token_value: token.value,
            platform_value: 'ios',
            device_info_value: {
              platform: 'ios',
              timestamp: new Date().toISOString(),
              force_refresh: true,
              user_agent: navigator.userAgent,
              token_length: token.value?.length
            }
          });

          if (error) {
            iOSLogger.error('🍎 Force refresh token save failed', {
              error: error.message
            });
          } else {
            iOSLogger.log('🍎 Force refresh token saved successfully!', {
              tokenId: data
            });
          }
        } catch (saveError) {
          iOSLogger.error('🍎 Exception during force token save', {
            error: saveError.message
          });
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        iOSLogger.error('🍎 Force refresh registration error', {
          error: error.error,
          fullError: JSON.stringify(error)
        });
      });

      // Check permissions first
      const permissions = await PushNotifications.checkPermissions();
      iOSLogger.log('🍎 Current permissions during force refresh', {
        receive: permissions.receive
      });

      if (permissions.receive !== 'granted') {
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

      // Register for push notifications
      await PushNotifications.register();
      iOSLogger.log('🍎 Registration call completed during force refresh');

      return { 
        success: true, 
        message: 'Force refresh initiated',
        permissions 
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