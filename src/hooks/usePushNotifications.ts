import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { remoteLogger } from '@/utils/remoteLogger';

export const usePushNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔔 ForMyPet: usePushNotifications useEffect started');
    console.log('🔔 ForMyPet: Platform:', Capacitor.getPlatform());
    console.log('🔔 ForMyPet: isNativePlatform:', Capacitor.isNativePlatform());
    
    remoteLogger.info(`usePushNotifications started - Platform: ${Capacitor.getPlatform()}, Native: ${Capacitor.isNativePlatform()}`, "PushNotifications");
    
    if (!Capacitor.isNativePlatform()) {
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

    const initializePushNotifications = async () => {
      try {
        console.log('🔔 ForMyPet: Initializing push notifications...');
        remoteLogger.info("Initializing push notifications", "PushNotifications");
        
        // Έλεγχος τρέχουσας κατάστασης permissions πρώτα
        const currentStatus = await PushNotifications.checkPermissions();
        console.log('🔔 ForMyPet: Current permission status:', currentStatus);
        remoteLogger.info(`Current permission status: ${JSON.stringify(currentStatus)}`, "PushNotifications");
        
        if (currentStatus.receive !== 'granted') {
          console.log('🔔 ForMyPet: No permissions granted, requesting...');
          remoteLogger.info("No permissions granted, requesting permissions", "PushNotifications");
          // Αίτηση permissions μόνο αν δεν τα έχουμε ήδη
          const permStatus = await PushNotifications.requestPermissions();
          console.log('🔔 ForMyPet: Requested permission status:', permStatus);
          remoteLogger.info(`Requested permission status: ${JSON.stringify(permStatus)}`, "PushNotifications");
          
          if (permStatus.receive === 'granted') {
            console.log('🔔 ForMyPet: Permissions granted, registering for push notifications...');
            remoteLogger.info("Permissions granted, registering for push notifications", "PushNotifications");
            await PushNotifications.register();
            console.log('🔔 ForMyPet: Push notifications registered successfully after permission grant');
            remoteLogger.info("Push notifications registered successfully after permission grant", "PushNotifications");
          } else {
            console.log('🔔 ForMyPet: Push notification permissions denied by user');
            remoteLogger.info("Push notification permissions denied by user", "PushNotifications");
            toast({
              title: "❌ Permissions Denied",
              description: "Δεν δόθηκαν άδειες για push notifications",
              variant: "destructive",
              duration: 8000
            });
            return;
          }
        } else {
          console.log('🔔 ForMyPet: Already have permissions, registering directly...');
          remoteLogger.info("Already have permissions, registering directly", "PushNotifications");
          // Αν έχουμε ήδη permissions, κάνε register
          await PushNotifications.register();
          console.log('🔔 ForMyPet: Push notifications registered successfully with existing permissions');
          remoteLogger.info("Push notifications registered successfully with existing permissions", "PushNotifications");
        }
      } catch (error) {
        console.error('🔔 ForMyPet: Error initializing push notifications:', error);
        remoteLogger.error(`Error initializing push notifications: ${error.message}`, "PushNotifications");
        toast({
          title: "❌ Push Notification Error",
          description: `Σφάλμα αρχικοποίησης: ${error.message}`,
          variant: "destructive",
          duration: 8000
        });
      }
    };

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
      console.log('🔔 ForMyPet: Push registration success, token: ' + token.value);
      remoteLogger.info(`Push registration success, token: ${token.value.substring(0, 10)}...`, "PushNotifications");
      
      try {
        // Use the save_push_token database function
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔔 ForMyPet: Current user:', user?.email);
        remoteLogger.info(`Current user: ${user?.email || 'none'}`, "PushNotifications");
        
        if (user) {
          console.log('🔔 ForMyPet: Calling save_push_token with token:', token.value.substring(0, 10) + '...');
          remoteLogger.info(`Calling save_push_token for user ${user.email}`, "PushNotifications");
          
          const { data, error } = await supabase.rpc('save_push_token', {
            token_value: token.value,
            platform_value: 'mobile',
            device_info_value: {
              platform: Capacitor.getPlatform(),
              timestamp: new Date().toISOString()
            }
          });
          
          if (error) {
            console.error('🔔 ForMyPet: Error saving push token:', error);
            remoteLogger.error(`Error saving push token: ${error.message}`, "PushNotifications");
            toast({
              title: "Σφάλμα αποθήκευσης token",
              description: `Δεν μπόρεσε να αποθηκευτεί το push token: ${error.message}`,
              variant: "destructive"
            });
          } else {
            console.log('🔔 ForMyPet: Push token saved to database successfully:', data);
            remoteLogger.info(`Push token saved to database successfully: ${data}`, "PushNotifications");
            toast({
              title: "✅ Token αποθηκεύτηκε",
              description: "Το push notification token αποθηκεύτηκε επιτυχώς στη βάση δεδομένων",
              duration: 5000
            });
          }
        } else {
          console.error('🔔 ForMyPet: No authenticated user found for token registration');
          remoteLogger.error("No authenticated user found for token registration", "PushNotifications");
          toast({
            title: "Σφάλμα χρήστη",
            description: "Δεν βρέθηκε συνδεδεμένος χρήστης",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('🔔 ForMyPet: Error saving push token:', error);
        remoteLogger.error(`Error saving push token: ${error.message}`, "PushNotifications");
        toast({
          title: "Σφάλμα",
          description: `Γενικό σφάλμα: ${error.message}`,
          variant: "destructive"
        });
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error) => {
      console.error('🔔 ForMyPet: Error on registration:', JSON.stringify(error));
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
      
      const { data, error } = await supabase.functions.invoke('test-push-direct', {
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