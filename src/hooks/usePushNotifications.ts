import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔔 usePushNotifications useEffect started');
    console.log('🔔 Platform:', Capacitor.getPlatform());
    console.log('🔔 isNativePlatform:', Capacitor.isNativePlatform());
    
    if (!Capacitor.isNativePlatform()) {
      console.log('🔔 Push notifications not available on web platform - tokens will only be saved on mobile app');
      toast({
        title: "Push Notifications",
        description: "Τα push notifications λειτουργούν μόνο στη mobile εφαρμογή. Στο web δεν αποθηκεύονται tokens.",
      });
      return;
    }

    const initializePushNotifications = async () => {
      try {
        console.log('Initializing push notifications...');
        
        // Έλεγχος τρέχουσας κατάστασης permissions πρώτα
        const currentStatus = await PushNotifications.checkPermissions();
        console.log('Current permission status:', currentStatus);
        
        if (currentStatus.receive !== 'granted') {
          // Αίτηση permissions μόνο αν δεν τα έχουμε ήδη
          const permStatus = await PushNotifications.requestPermissions();
          console.log('Requested permission status:', permStatus);
          
          if (permStatus.receive === 'granted') {
            await PushNotifications.register();
            console.log('Push notifications registered successfully after permission grant');
          } else {
            console.log('Push notification permissions denied');
            return;
          }
        } else {
          // Αν έχουμε ήδη permissions, κάνε register
          await PushNotifications.register();
          console.log('Push notifications registered successfully with existing permissions');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      
      try {
        // Use the save_push_token database function
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);
        
        if (user) {
          console.log('Calling save_push_token with:', {
            token_value: token.value,
            platform_value: 'mobile',
            device_info_value: {}
          });
          
          const { data, error } = await supabase.rpc('save_push_token', {
            token_value: token.value,
            platform_value: 'mobile',
            device_info_value: {}
          });
          
          if (error) {
            console.error('Error saving push token:', error);
            toast({
              title: "Σφάλμα αποθήκευσης token",
              description: `Δεν μπόρεσε να αποθηκευτεί το push token: ${error.message}`,
              variant: "destructive"
            });
          } else {
            console.log('Push token saved to database successfully:', data);
            toast({
              title: "Token αποθηκεύτηκε",
              description: "Το push notification token αποθηκεύτηκε επιτυχώς",
            });
          }
        } else {
          console.error('No authenticated user found');
          toast({
            title: "Σφάλμα",
            description: "Δεν βρέθηκε συνδεδεμένος χρήστης",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error saving push token:', error);
        toast({
          title: "Σφάλμα",
          description: `Γενικό σφάλμα: ${error.message}`,
          variant: "destructive"
        });
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
      toast({
        title: "Σφάλμα εγγραφής",
        description: "Δεν μπόρεσε να γίνει εγγραφή για push notifications.",
        variant: "destructive"
      });
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      
      toast({
        title: notification.title || 'Νέα ειδοποίηση',
        description: notification.body || 'Έχετε μια νέα ειδοποίηση',
      });
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed: ', notification.actionId, notification.inputValue);
      
      // Handle notification tap - you could navigate to specific pages here
      toast({
        title: "Ειδοποίηση",
        description: "Πατήσατε σε μια ειδοποίηση",
      });
    });

    initializePushNotifications();

    // Cleanup function
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [toast]);

  const sendTestNotification = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Test ειδοποίηση",
        description: "Αυτό είναι ένα test για push notifications (μόνο σε web).",
      });
      return;
    }

    // In a real app, you would send this to your backend server
    // which would then send the push notification via FCM/APNS
    toast({
      title: "Test στάλθηκε",
      description: "Το test push notification στάλθηκε.",
    });
  };

  const enablePushNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Test ειδοποίηση",
        description: "Οι push notifications είναι διαθέσιμες μόνο στη mobile εφαρμογή.",
      });
      return;
    }

    try {
      // Έλεγχος τρέχουσας κατάστασης permissions
      const currentStatus = await PushNotifications.checkPermissions();
      console.log('Current permission status:', currentStatus);
      
      if (currentStatus.receive === 'granted') {
        // Αν έχουμε ήδη permissions, κάνε register
        await PushNotifications.register();
        toast({
          title: "Ειδοποιήσεις ενεργοποιήθηκαν",
          description: "Θα λαμβάνετε push notifications για τα events των κατοικιδίων σας.",
        });
        return;
      }
      
      // Αίτηση permissions αν δεν έχουμε
      const permStatus = await PushNotifications.requestPermissions();
      console.log('Requested permission status:', permStatus);
      
      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
        console.log('Push notifications registered successfully');
        
        toast({
          title: "Ειδοποιήσεις ενεργοποιήθηκαν",
          description: "Θα λαμβάνετε push notifications για τα events των κατοικιδίων σας.",
        });
      } else {
        toast({
          title: "Άρνηση αδειών",
          description: "Παρακαλώ ενεργοποιήστε τις ειδοποιήσεις από τις ρυθμίσεις του τηλεφώνου.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast({
        title: "Σφάλμα ειδοποιήσεων",
        description: "Υπήρξε πρόβλημα με την ενεργοποίηση των push notifications.",
        variant: "destructive"
      });
    }
  };

  return { sendTestNotification, enablePushNotifications };
};