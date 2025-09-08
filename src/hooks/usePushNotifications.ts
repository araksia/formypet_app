import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { remoteLogger } from '@/utils/remoteLogger';
import { iOSLogger } from '@/utils/iOSLogger';

export const usePushNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    const isIOS = Capacitor.getPlatform() === 'ios';
    const isNative = Capacitor.isNativePlatform();
    
    console.log('🔔 ForMyPet: usePushNotifications useEffect started');
    console.log('🔔 ForMyPet: Platform:', Capacitor.getPlatform());
    console.log('🔔 ForMyPet: isNativePlatform:', isNative);
    console.log('🔔 ForMyPet: User Agent:', navigator.userAgent);
    console.log('🔔 ForMyPet: iOS Detection:', /iPad|iPhone|iPod/.test(navigator.userAgent));
    
    // Use iOS logger for iOS debugging
    if (isIOS) {
      iOSLogger.log('🍎 iOS Push Notifications Starting', {
        platform: Capacitor.getPlatform(),
        isNative: isNative,
        userAgent: navigator.userAgent
      });
    }
    
    remoteLogger.info(`usePushNotifications started - Platform: ${Capacitor.getPlatform()}, Native: ${isNative}, UserAgent: ${navigator.userAgent}`, "PushNotifications");
    
    if (!isNative) {
      console.log('🔔 ForMyPet: Push notifications not available on web platform');
      remoteLogger.info("Push notifications not available on web platform", "PushNotifications");
      
      // Show a toast to inform user they need the mobile app
      toast({
        title: "📱 Mobile App Required",
        description: "Τα push notifications δουλεύουν μόνο στη mobile εφαρμογή στο iPhone/Android",
        duration: 8000
      });
      return;
    }

    // Comprehensive debug at start
    const runComprehensiveDebug = async () => {
      console.log('🔔 ForMyPet: Running comprehensive debug...');
      try {
        const { data: debugData, error: debugError } = await supabase.functions.invoke('comprehensive-push-debug', {
          body: {
            action: 'full_debug',
            platform_info: {
              platform: Capacitor.getPlatform(),
              isNative: Capacitor.isNativePlatform(),
              userAgent: navigator.userAgent,
              isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
            },
            user_info: {
              timestamp: new Date().toISOString()
            }
          }
        });
        
        console.log('🔔 ForMyPet: Comprehensive debug result:', debugData);
        if (debugError) {
          console.error('🔔 ForMyPet: Debug error:', debugError);
        }
        
        // Show debug results to user
        if (debugData) {
          const summary = debugData.summary;
          toast({
            title: "🔧 Debug Results",
            description: `Auth: ${summary?.authenticated ? '✅' : '❌'}, Tokens: ${summary?.hasTokens ? '✅' : '❌'}, Can Save: ${summary?.canSaveTokens ? '✅' : '❌'}`,
            duration: 10000
          });
        }
      } catch (error) {
        console.error('🔔 ForMyPet: Debug exception:', error);
        toast({
          title: "❌ Debug Failed",
          description: `Debug error: ${error.message}`,
          variant: "destructive",
          duration: 5000
        });
      }
    };
    
    // Run debug first
    runComprehensiveDebug();

    const initializePushNotifications = async () => {
      try {
        console.log('🔔 ForMyPet: Initializing push notifications...');
        
        // iOS specific logging
        if (isIOS) {
          iOSLogger.log('🍎 iOS Initializing Push Notifications', {
            platform: Capacitor.getPlatform(),
            isNative: isNative
          });
        }
        
        remoteLogger.info("Initializing push notifications", "PushNotifications");
        
        // Έλεγχος τρέχουσας κατάστασης permissions πρώτα
        const currentStatus = await PushNotifications.checkPermissions();
        console.log('🔔 ForMyPet: Current permission status:', currentStatus);
        
        // iOS specific permission logging
        if (isIOS) {
          iOSLogger.log('🍎 iOS Permission Status', {
            receive: currentStatus.receive,
            statusObject: JSON.stringify(currentStatus)
          });
        }
        
        remoteLogger.info(`Current permission status: ${JSON.stringify(currentStatus)}`, "PushNotifications");
        
        // Report current status to user
        toast({
          title: "🔔 Push Notifications Status",
          description: `Receive: ${currentStatus.receive}, Platform: ${Capacitor.getPlatform()}`,
          duration: 5000
        });
        
        if (currentStatus.receive !== 'granted') {
          console.log('🔔 ForMyPet: No permissions granted, requesting...');
          remoteLogger.info("No permissions granted, requesting permissions", "PushNotifications");
          
          toast({
            title: "📱 Requesting Permissions",
            description: "Ζητάμε άδειες για push notifications...",
            duration: 3000
          });
          
          // Αίτηση permissions μόνο αν δεν τα έχουμε ήδη
          const permStatus = await PushNotifications.requestPermissions();
          console.log('🔔 ForMyPet: Requested permission status:', permStatus);
          remoteLogger.info(`Requested permission status: ${JSON.stringify(permStatus)}`, "PushNotifications");
          
          if (permStatus.receive === 'granted') {
            console.log('🔔 ForMyPet: Permissions granted, registering for push notifications...');
            remoteLogger.info("Permissions granted, registering for push notifications", "PushNotifications");
            
            toast({
              title: "✅ Permissions Granted",
              description: "Άδειες δόθηκαν! Κάνουμε register...",
              duration: 3000
            });
            
            await PushNotifications.register();
            console.log('🔔 ForMyPet: Push notifications registered successfully after permission grant');
            remoteLogger.info("Push notifications registered successfully after permission grant", "PushNotifications");
          } else {
            console.log('🔔 ForMyPet: Push notification permissions denied by user');
            remoteLogger.info("Push notification permissions denied by user", "PushNotifications");
            toast({
              title: "❌ Permissions Denied",
              description: `Δεν δόθηκαν άδειες: ${JSON.stringify(permStatus)}`,
              variant: "destructive",
              duration: 8000
            });
            return;
          }
        } else {
          console.log('🔔 ForMyPet: Already have permissions, registering directly...');
          remoteLogger.info("Already have permissions, registering directly", "PushNotifications");
          
          toast({
            title: "✅ Have Permissions",
            description: "Έχουμε ήδη άδειες! Κάνουμε register...",
            duration: 3000
          });
          
          // Αν έχουμε ήδη permissions, κάνε register
          await PushNotifications.register();
          console.log('🔔 ForMyPet: Push notifications registered successfully with existing permissions');
          remoteLogger.info("Push notifications registered successfully with existing permissions", "PushNotifications");
        }
      } catch (error) {
        console.error('🔔 ForMyPet: Error initializing push notifications:', error);
        remoteLogger.error(`Error initializing push notifications: ${JSON.stringify(error)}`, "PushNotifications");
        toast({
          title: "❌ Push Notification Error",
          description: `Σφάλμα αρχικοποίησης: ${error.message}`,
          variant: "destructive",
          duration: 10000
        });
      }
    };

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
      const isIOS = Capacitor.getPlatform() === 'ios';
      
      console.log('🔔 ForMyPet: Push registration success, token: ' + token.value);
      console.log('🔔 ForMyPet: Token length:', token.value?.length);
      console.log('🔔 ForMyPet: Token preview:', token.value?.substring(0, 20) + '...');
      console.log('🔔 ForMyPet: Full token (for debug):', token.value);
      
      // iOS specific logging
      if (isIOS) {
        iOSLogger.log('🍎 iOS Token Received!', {
          tokenLength: token.value?.length,
          tokenPreview: token.value?.substring(0, 20) + '...',
          platform: Capacitor.getPlatform(),
          timestamp: new Date().toISOString()
        });
      }
      
      remoteLogger.info(`Push registration success, token: ${token.value.substring(0, 10)}...`, "PushNotifications");
      
      // Show immediate feedback
      toast({
        title: "✅ Push Token Received",
        description: `📱 iPhone token λήφθηκε (${token.value?.length} chars)`,
        duration: 4000
      });
      
      try {
        console.log('🔔 ForMyPet: Getting current user for token save...');
        
        // Use the save_push_token database function
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔔 ForMyPet: Current user:', user?.email);
        console.log('🔔 ForMyPet: Current user ID:', user?.id);
        console.log('🔔 ForMyPet: User object:', JSON.stringify(user, null, 2));
        remoteLogger.info(`Current user: ${user?.email || 'none'}, ID: ${user?.id || 'none'}`, "PushNotifications");
        
        if (!user) {
          console.error('🔔 ForMyPet: No authenticated user found for token registration');
          remoteLogger.error("No authenticated user found for token registration", "PushNotifications");
          
          // Try debug function to understand the issue
          console.log('🔔 ForMyPet: Calling debug function to diagnose auth issue...');
          const { data: debugData, error: debugError } = await supabase.functions.invoke('debug-token-save', {
            body: {
              token: token.value,
              platform: Capacitor.getPlatform(),
              device_info: {
                platform: Capacitor.getPlatform(),
                timestamp: new Date().toISOString(),
                is_native: Capacitor.isNativePlatform(),
                user_agent: navigator.userAgent,
                token_length: token.value?.length
              }
            }
          });
          
          console.log('🔔 ForMyPet: Debug result:', debugData);
          console.log('🔔 ForMyPet: Debug error:', debugError);
          
          toast({
            title: "❌ Χρήστης δεν συνδεδεμένος",
            description: `Δεν βρέθηκε συνδεδεμένος χρήστης για αποθήκευση token. Debug: ${debugData?.debug_info?.userAuthenticated ? 'Auth OK' : 'Auth Failed'}`,
            variant: "destructive",
            duration: 8000
          });
          return;
        }
        
        console.log('🔔 ForMyPet: Calling save_push_token with token:', token.value.substring(0, 10) + '...');
        console.log('🔔 ForMyPet: Platform:', Capacitor.getPlatform());
        console.log('🔔 ForMyPet: Native platform:', Capacitor.isNativePlatform());
        
        // iOS specific logging before save
        if (isIOS) {
          iOSLogger.log('🍎 iOS Starting Token Save', {
            userEmail: user.email,
            userId: user.id,
            tokenLength: token.value?.length,
            platform: Capacitor.getPlatform()
          });
        }
        
        remoteLogger.info(`Calling save_push_token for user ${user.email}`, "PushNotifications");
        
        toast({
          title: "💾 Αποθήκευση Token",
          description: "Αποθηκεύουμε το token στη βάση...",
          duration: 3000
        });
        
        const { data, error } = await supabase.rpc('save_push_token', {
          token_value: token.value,
          platform_value: Capacitor.getPlatform(),
          device_info_value: {
            platform: Capacitor.getPlatform(),
            timestamp: new Date().toISOString(),
            is_native: Capacitor.isNativePlatform(),
            user_agent: navigator.userAgent,
            token_length: token.value?.length
          }
        });
        
        console.log('🔔 ForMyPet: save_push_token response - data:', data);
        console.log('🔔 ForMyPet: save_push_token response - error:', error);
        
        // iOS specific logging after save
        if (isIOS) {
          iOSLogger.log('🍎 iOS Token Save Result', {
            success: !error,
            data: data,
            error: error?.message || null
          });
        }
        
        if (error) {
          console.error('🔔 ForMyPet: Error saving push token:', error);
          console.error('🔔 ForMyPet: Error details:', JSON.stringify(error, null, 2));
          remoteLogger.error(`Error saving push token: ${error.message}`, "PushNotifications");
          toast({
            title: "❌ Σφάλμα αποθήκευσης token",
            description: `RPC Error: ${error.message}`,
            variant: "destructive",
            duration: 5000
          });
        } else {
          console.log('🔔 ForMyPet: Push token saved to database successfully. Response:', data);
          remoteLogger.info(`Push token saved to database successfully: ${data}`, "PushNotifications");
          toast({
            title: "✅ Token αποθηκεύτηκε επιτυχώς!",
            description: `Το push notification token αποθηκεύτηκε στη βάση! ID: ${data}`,
            duration: 5000
          });
        }
      } catch (error) {
        console.error('🔔 ForMyPet: Exception saving push token:', error);
        console.error('🔔 ForMyPet: Exception details:', JSON.stringify(error, null, 2));
        remoteLogger.error(`Exception saving push token: ${error.message}`, "PushNotifications");
        toast({
          title: "❌ Εξαίρεση αποθήκευσης",
          description: `Exception: ${error.message}`,
          variant: "destructive",
          duration: 5000
        });
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error) => {
      const isIOS = Capacitor.getPlatform() === 'ios';
      
      console.error('🔔 ForMyPet: Error on registration:', JSON.stringify(error));
      
      // iOS specific error logging
      if (isIOS) {
        iOSLogger.error('🍎 iOS Registration Error', {
          error: error.error,
          fullError: JSON.stringify(error),
          platform: Capacitor.getPlatform()
        });
      }
      
      remoteLogger.error(`Registration error: ${JSON.stringify(error)}`, "PushNotifications");
      toast({
        title: "❌ Σφάλμα εγγραφής",
        description: `Δεν μπόρεσε να γίνει εγγραφή για push notifications: ${error.error}`,
        variant: "destructive",
        duration: 8000
      });
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('🔔 ForMyPet: Push notification received:', notification);
      remoteLogger.info(`Push notification received: ${notification.title}`, "PushNotifications");
      
      toast({
        title: notification.title || '🔔 Νέα ειδοποίηση',
        description: notification.body || 'Έχετε μια νέα ειδοποίηση',
        duration: 8000
      });
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('🔔 ForMyPet: Push notification action performed:', notification.actionId, notification.inputValue);
      remoteLogger.info(`Push notification action performed: ${notification.actionId}`, "PushNotifications");
      
      // Handle notification tap - you could navigate to specific pages here
      toast({
        title: "🔔 Ειδοποίηση",
        description: "Πατήσατε σε μια ειδοποίηση",
        duration: 5000
      });
    });

    console.log('🔔 ForMyPet: Setting up push notification listeners...');
    remoteLogger.info("Setting up push notification listeners", "PushNotifications");
    initializePushNotifications();

    // Cleanup function
    return () => {
      console.log('🔔 ForMyPet: Cleaning up push notification listeners...');
      remoteLogger.info("Cleaning up push notification listeners", "PushNotifications");
      PushNotifications.removeAllListeners();
    };
  }, [toast]);

  const sendTestNotification = async () => {
    console.log('🔔 ForMyPet: sendTestNotification called');
    remoteLogger.info("sendTestNotification called", "PushNotifications");
    
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "📱 Web Browser",
        description: "Πηγαίνετε στη mobile εφαρμογή iPhone/Android για να δοκιμάσετε τα push notifications",
        variant: "destructive",
        duration: 8000
      });
      return;
    }

    // Test the push notification system directly
    try {
      console.log('🔔 ForMyPet: Testing push notification system...');
      remoteLogger.info("Testing push notification system", "PushNotifications");
      
      toast({
        title: "🧪 Δοκιμάζουμε...",
        description: "Ελέγχουμε το σύστημα push notifications...",
        duration: 3000
      });
      
      const { data, error } = await supabase.functions.invoke('debug-push-test', {
        body: {}
      });

      console.log('🔔 ForMyPet: Test result:', { data, error });
      remoteLogger.info(`Test result: ${JSON.stringify({ data, error })}`, "PushNotifications");

      if (error) {
        console.error('🔔 ForMyPet: Error in test:', error);
        toast({
          title: "❌ Σφάλμα Test",
          description: `Test failed: ${error.message}`,
          variant: "destructive",
          duration: 8000
        });
      } else {
        console.log('🔔 ForMyPet: Test completed:', data);
        
        if (data?.success) {
          toast({
            title: "✅ Test Επιτυχής",
            description: `Firebase configured: ${data.firebaseConfigured ? '✅' : '❌'}, Token found: ${data.tokenFound ? '✅' : '❌'}`,
            duration: 8000
          });
        } else {
          toast({
            title: "❌ Test Failed", 
            description: data?.error || 'Unknown error',
            variant: "destructive",
            duration: 8000
          });
        }
      }
    } catch (error) {
      console.error('🔔 ForMyPet: Error calling test:', error);
      remoteLogger.error(`Error calling test: ${error.message}`, "PushNotifications");
      toast({
        title: "❌ Σφάλμα",
        description: `Γενικό σφάλμα: ${error.message}`,
        variant: "destructive",
        duration: 8000
      });
    }
  };

  const enablePushNotifications = async () => {
    console.log('🔔 ForMyPet: enablePushNotifications called');
    remoteLogger.info("enablePushNotifications called", "PushNotifications");
    
    if (!Capacitor.isNativePlatform()) {
      console.log('🔔 ForMyPet: Not on native platform, showing web message');
      remoteLogger.info("Not on native platform, showing web message", "PushNotifications");
      toast({
        title: "📱 Mobile App Required",
        description: "Οι push notifications είναι διαθέσιμες μόνο στη mobile εφαρμογή iPhone/Android. Κάντε export το project και τρέξτε το με Capacitor.",
        variant: "destructive",
        duration: 10000
      });
      return;
    }

    try {
      console.log('🔔 ForMyPet: Checking current permissions...');
      remoteLogger.info("Checking current permissions for enable", "PushNotifications");
      
      // Έλεγχος τρέχουσας κατάστασης permissions
      const currentStatus = await PushNotifications.checkPermissions();
      console.log('🔔 ForMyPet: Current permission status:', currentStatus);
      remoteLogger.info(`Current permission status for enable: ${JSON.stringify(currentStatus)}`, "PushNotifications");
      
      if (currentStatus.receive === 'granted') {
        console.log('🔔 ForMyPet: Already have permissions, registering...');
        remoteLogger.info("Already have permissions, registering for enable", "PushNotifications");
        // Αν έχουμε ήδη permissions, κάνε register
        await PushNotifications.register();
        console.log('🔔 ForMyPet: Registration completed');
        remoteLogger.info("Registration completed for enable", "PushNotifications");
        toast({
          title: "✅ Ειδοποιήσεις ενεργοποιήθηκαν",
          description: "Θα λαμβάνετε push notifications για τα events των κατοικιδίων σας.",
          duration: 5000
        });
        return;
      }
      
      console.log('🔔 ForMyPet: Requesting permissions...');
      remoteLogger.info("Requesting permissions for enable", "PushNotifications");
      // Αίτηση permissions αν δεν έχουμε
      const permStatus = await PushNotifications.requestPermissions();
      console.log('🔔 ForMyPet: Requested permission status:', permStatus);
      remoteLogger.info(`Requested permission status for enable: ${JSON.stringify(permStatus)}`, "PushNotifications");
      
      if (permStatus.receive === 'granted') {
        console.log('🔔 ForMyPet: Permissions granted, registering...');
        remoteLogger.info("Permissions granted, registering for enable", "PushNotifications");
        await PushNotifications.register();
        console.log('🔔 ForMyPet: Push notifications registered successfully');
        remoteLogger.info("Push notifications registered successfully for enable", "PushNotifications");
        
        toast({
          title: "✅ Ειδοποιήσεις ενεργοποιήθηκαν",
          description: "Θα λαμβάνετε push notifications για τα events των κατοικιδίων σας.",
          duration: 5000
        });
      } else {
        console.log('🔔 ForMyPet: Permissions denied by user');
        remoteLogger.info("Permissions denied by user for enable", "PushNotifications");
        toast({
          title: "❌ Άρνηση αδειών",
          description: "Παρακαλώ ενεργοποιήστε τις ειδοποιήσεις από τις ρυθμίσεις του τηλεφώνου.",
          variant: "destructive",
          duration: 8000
        });
      }
    } catch (error) {
      console.error('🔔 ForMyPet: Error enabling push notifications:', error);
      remoteLogger.error(`Error enabling push notifications: ${error.message}`, "PushNotifications");
      toast({
        title: "❌ Σφάλμα ειδοποιήσεων",
        description: `Υπήρξε πρόβλημα με την ενεργοποίηση των push notifications: ${error.message}`,
        variant: "destructive",
        duration: 8000
      });
    }
  };

  return { sendTestNotification, enablePushNotifications };
};