import { useState, useEffect, useCallback } from 'react';
import { useOnline } from './useOnline';
import { useToast } from './use-toast';

interface QueuedAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'pet' | 'event' | 'expense' | 'medical_record';
  data: any;
  url: string;
  method: string;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [syncing, setSyncing] = useState(false);
  const isOnline = useOnline();
  const { toast } = useToast();

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('formypet-offline-queue');
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Failed to load offline queue:', error);
        localStorage.removeItem('formypet-offline-queue');
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('formypet-offline-queue', JSON.stringify(queue));
  }, [queue]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncing) {
      syncQueue();
    }
  }, [isOnline, queue.length, syncing]);

  // Add action to queue
  const queueAction = useCallback((action: Omit<QueuedAction, 'id' | 'timestamp'>) => {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setQueue(prev => [...prev, queuedAction]);
    
    toast({
      title: "Αποθηκεύτηκε offline",
      description: "Η ενέργεια θα συγχρονιστεί όταν επιστρέψει η σύνδεση",
      duration: 3000
    });

    // Try to sync immediately if online
    if (isOnline) {
      syncQueue();
    }

    return queuedAction.id;
  }, [isOnline, toast]);

  // Sync all queued actions
  const syncQueue = useCallback(async () => {
    if (syncing || queue.length === 0 || !isOnline) return;

    setSyncing(true);
    
    try {
      const results = await Promise.allSettled(
        queue.map(async (action) => {
          const response = await fetch(action.url, {
            method: action.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
            },
            body: action.data ? JSON.stringify(action.data) : undefined
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return { action, success: true };
        })
      );

      const successful = results
        .filter((result): result is PromiseFulfilledResult<{ action: QueuedAction; success: boolean }> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value.action.id);

      const failed = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .length;

      // Remove successful actions from queue
      setQueue(prev => prev.filter(action => !successful.includes(action.id)));

      if (successful.length > 0) {
        toast({
          title: "Συγχρονισμός επιτυχής",
          description: `${successful.length} ενέργειες συγχρονίστηκαν επιτυχώς`,
          duration: 3000
        });
      }

      if (failed > 0) {
        toast({
          title: "Αποτυχία συγχρονισμού",
          description: `${failed} ενέργειες απέτυχαν να συγχρονιστούν`,
          variant: "destructive",
          duration: 5000
        });
      }

      // Register background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await (registration as any).sync.register('sync-data');
        } catch (error) {
          console.log('Background sync not available:', error);
        }
      }
      
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Σφάλμα συγχρονισμού", 
        description: "Δοκιμάστε ξανά αργότερα",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setSyncing(false);
    }
  }, [queue, syncing, isOnline, toast]);

  // Remove action from queue
  const removeFromQueue = useCallback((actionId: string) => {
    setQueue(prev => prev.filter(action => action.id !== actionId));
  }, []);

  // Clear all queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem('formypet-offline-queue');
  }, []);

  // Get cached data from localStorage
  const getCachedData = useCallback(<T>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(`formypet-cache-${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Consider data fresh for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }, []);

  // Cache data to localStorage
  const setCachedData = useCallback(<T>(key: string, data: T) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`formypet-cache-${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  // Enhanced fetch with offline support
  const offlineFetch = useCallback(async <T>(
    url: string, 
    options: RequestInit = {},
    cacheKey?: string
  ): Promise<T> => {
    try {
      if (!isOnline && cacheKey) {
        const cached = getCachedData<T>(cacheKey);
        if (cached) {
          return cached;
        }
        throw new Error('No cached data available offline');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful GET requests
      if (options.method === 'GET' || !options.method) {
        if (cacheKey) {
          setCachedData(cacheKey, data);
        }
      }

      return data;
    } catch (error) {
      // If network request fails and we have cached data, return it
      if (cacheKey) {
        const cached = getCachedData<T>(cacheKey);
        if (cached) {
          console.log('Network failed, returning cached data');
          return cached;
        }
      }
      throw error;
    }
  }, [isOnline, getCachedData, setCachedData]);

  return {
    queue,
    syncing,
    queueAction,
    syncQueue,
    removeFromQueue,
    clearQueue,
    getCachedData,
    setCachedData,
    offlineFetch,
    hasQueuedActions: queue.length > 0
  };
};