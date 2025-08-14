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
        console.log('Initializing push notifications...');
        
        // Αυτόματη αίτηση permissions όταν ανοίγει η εφαρμογή
        const permStatus = await PushNotifications.requestPermissions();
        console.log('Permission status:', permStatus);
        
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
          console.log('Push notifications registered successfully');
        } else {
          console.log('Push notification permissions denied');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      
      try {
        // Use the edge function to save push token since TypeScript types aren't updated yet
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.functions.invoke('send-push-notification', {
            body: {
              action: 'save_token',
              token: token.value,
              platform: 'mobile',
              user_id: user.id
            }
          });
          console.log('Push token saved to database');
        }
      } catch (error) {
        console.error('Error saving push token:', error);
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