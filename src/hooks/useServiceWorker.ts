import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

export const useServiceWorker = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('🔧 ForMyPet: Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      setRegistration(registration);
      setIsInstalled(true);

      console.log('✅ ForMyPet: Service worker registered successfully');

      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 ForMyPet: Service worker update found');
        
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('🆕 ForMyPet: Service worker update available');
                setUpdateAvailable(true);
                setIsWaiting(true);
                
                toast({
                  title: "Νέα έκδοση διαθέσιμη",
                  description: "Κάντε κλικ για ενημέρωση της εφαρμογής",
                  duration: 10000
                });
              } else {
                // First time install
                console.log('🎉 ForMyPet: Service worker installed for first time');
                toast({
                  title: "Εφαρμογή εγκαταστάθηκε",
                  description: "Η εφαρμογή είναι τώρα διαθέσιμη offline",
                  duration: 5000
                });
              }
            }
          });
        }
      });

      // Listen for controller change (when update is applied)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 ForMyPet: Service worker controller changed');
        setUpdateAvailable(false);
        setIsWaiting(false);
        
        toast({
          title: "Εφαρμογή ενημερώθηκε",
          description: "Η εφαρμογή ενημερώθηκε στην τελευταία έκδοση",
          duration: 3000
        });
      });

      // Check if there's already a waiting worker
      if (registration.waiting) {
        setIsWaiting(true);
        setUpdateAvailable(true);
      }

    } catch (error) {
      console.error('❌ ForMyPet: Service worker registration failed:', error);
      
      toast({
        title: "Αποτυχία εγκατάστασης",
        description: "Η offline λειτουργικότητα δεν είναι διαθέσιμη",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      console.log('🔄 ForMyPet: Updating service worker...');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const unregisterServiceWorker = async () => {
    if (registration) {
      console.log('🗑️ ForMyPet: Unregistering service worker...');
      const result = await registration.unregister();
      
      if (result) {
        setRegistration(null);
        setIsInstalled(false);
        setIsWaiting(false);
        setUpdateAvailable(false);
        
        toast({
          title: "Service Worker αφαιρέθηκε",
          description: "Η offline λειτουργικότητα απενεργοποιήθηκε",
          duration: 3000
        });
      }
    }
  };

  // Get cache size for debugging
  const getCacheSize = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }
        
        return {
          totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
          cacheCount: cacheNames.length
        };
      } catch (error) {
        console.error('Failed to calculate cache size:', error);
        return null;
      }
    }
    return null;
  };

  // Clear all caches
  const clearCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        toast({
          title: "Cache διαγράφηκε",
          description: "Όλα τα cached δεδομένα διαγράφηκαν",
          duration: 3000
        });
        
        return true;
      } catch (error) {
        console.error('Failed to clear caches:', error);
        toast({
          title: "Αποτυχία διαγραφής",
          description: "Δεν ήταν δυνατή η διαγραφή του cache",
          variant: "destructive",
          duration: 3000
        });
        return false;
      }
    }
    return false;
  };

  return {
    registration,
    isInstalled,
    isWaiting,
    updateAvailable,
    updateServiceWorker,
    unregisterServiceWorker,
    getCacheSize,
    clearCaches
  };
};