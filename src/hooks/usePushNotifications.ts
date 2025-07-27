import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    const initializePushNotifications = async () => {
      try {
        // Request permission to use push notifications
        const permStatus = await PushNotifications.requestPermissions();
        
        if (permStatus.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
          
          console.log('Push notifications registered successfully');
          
          toast({
            title: "Ειδοποιήσεις ενεργοποιήθηκαν",
            description: "Θα λαμβάνετε push notifications για τα events των κατοικιδίων σας.",
          });
        } else {
          console.warn('Push notification permission denied');
          toast({
            title: "Άρνηση αδειών",
            description: "Δεν θα λαμβάνετε push notifications.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
        toast({
          title: "Σφάλμα ειδοποιήσεων",
          description: "Υπήρξε πρόβλημα με την ενεργοποίηση των push notifications.",
          variant: "destructive"
        });
      }
    };

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Here you would typically send the token to your backend server
      // to store it and send push notifications later
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

  return { sendTestNotification };
};