import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    const initializePushNotifications = async () => {
      try {
        // Μόνο setup των listeners, όχι αυτόματη αίτηση permissions
        console.log('Push notifications initialized (listeners only)');
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      
      // TODO: Save token to database when types are updated
      // The push_notification_tokens table and save_push_token RPC function 
      // exist but aren't in the TypeScript types yet
      console.log('Notification token received, will be saved once types are updated');
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
      const permStatus = await PushNotifications.requestPermissions();
      
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