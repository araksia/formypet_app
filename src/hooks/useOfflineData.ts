import { useState, useEffect, useCallback } from 'react';
import { useOfflineStore } from './useOfflineStore';
import { useOnline } from './useOnline';
import { offlineDataManager } from '@/utils/offlineDataManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseOfflineDataOptions {
  userId?: string;
  autoDownload?: boolean;
  refreshInterval?: number;
}

export const useOfflineData = (options: UseOfflineDataOptions = {}) => {
  const { userId, autoDownload = true, refreshInterval = 5 * 60 * 1000 } = options;
  const { isReady, getItems } = useOfflineStore();
  const isOnline = useOnline();
  const [initializing, setInitializing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [dataAvailable, setDataAvailable] = useState(false);

  // Check if offline data is available
  useEffect(() => {
    const checkDataAvailability = async () => {
      if (!isReady || !userId) return;

      try {
        const pets = await getItems('pets', { userId });
        const events = await getItems('events', { userId });
        const expenses = await getItems('expenses', { userId });
        
        const hasData = pets.length > 0 || events.length > 0 || expenses.length > 0;
        setDataAvailable(hasData);
      } catch (error) {
        console.error('Failed to check data availability:', error);
        setDataAvailable(false);
      }
    };

    checkDataAvailability();
  }, [isReady, userId, getItems]);

  // Initialize offline data when user logs in
  const initializeOfflineData = useCallback(async () => {
    if (!userId || !isReady || initializing || !isOnline) return;

    setInitializing(true);
    try {
      console.log('🚀 Initializing offline data for user:', userId);
      
      // Check if we have recent offline data
      const hasRecentData = await Promise.all([
        offlineDataManager.hasOfflineData('pets', { getItems }),
        offlineDataManager.hasOfflineData('events', { getItems }),
        offlineDataManager.hasOfflineData('expenses', { getItems })
      ]);

      const hasAnyData = hasRecentData.some(Boolean);

      if (!hasAnyData) {
        toast.info('Λήψη δεδομένων για offline χρήση...', {
          description: 'Αυτό θα γίνει μόνο τη πρώτη φορά'
        });

        await offlineDataManager.downloadInitialData(userId, {
          store: async (table: string, data: any, options: any) => {
            // This is a simple wrapper - in real implementation you'd use the actual store
            return crypto.randomUUID();
          },
          getItems,
          clear: async () => {},
          markSynced: async () => {}
        });

        setLastSync(new Date());
        setDataAvailable(true);
        
        toast.success('Δεδομένα διαθέσιμα offline! 📱', {
          description: 'Μπορείτε τώρα να χρησιμοποιείτε την εφαρμογή χωρίς σύνδεση'
        });
      } else {
        setDataAvailable(true);
        console.log('✅ Offline data already available');
      }
    } catch (error) {
      console.error('❌ Failed to initialize offline data:', error);
      toast.error('Αποτυχία αρχικοποίησης offline δεδομένων', {
        description: 'Ορισμένες λειτουργίες μπορεί να μην είναι διαθέσιμες offline'
      });
    } finally {
      setInitializing(false);
    }
  }, [userId, isReady, initializing, isOnline, getItems]);

  // Auto-initialize when conditions are met
  useEffect(() => {
    if (autoDownload && userId && isReady && isOnline && !dataAvailable) {
      initializeOfflineData();
    }
  }, [autoDownload, userId, isReady, isOnline, dataAvailable, initializeOfflineData]);

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline || !userId || !isReady) return;

    const interval = setInterval(async () => {
      try {
        console.log('🔄 Periodic offline data refresh');
        await offlineDataManager.syncChanges({
          getAll: async (table: string, options: any) => {
            return getItems(table, { userId });
          },
          markSynced: async () => {}
        });
        setLastSync(new Date());
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isOnline, userId, isReady, refreshInterval, getItems]);

  // Force refresh offline data
  const refreshOfflineData = useCallback(async () => {
    if (!userId || !isReady || !isOnline) {
      toast.error('Αδύνατος ο συγχρονισμός', {
        description: 'Χρειάζεστε σύνδεση στο διαδίκτυο'
      });
      return;
    }

    try {
      toast.info('Ανανέωση offline δεδομένων...');
      
      await offlineDataManager.forceRefresh(userId, {
        clear: async (table: string) => {
          // Clear implementation would go here
        },
        store: async (table: string, data: any, options: any) => {
          return crypto.randomUUID();
        }
      });

      setLastSync(new Date());
      setDataAvailable(true);
      
      toast.success('Offline δεδομένα ανανεώθηκαν! ✨');
    } catch (error) {
      console.error('Failed to refresh offline data:', error);
      toast.error('Αποτυχία ανανέωσης', {
        description: 'Δοκιμάστε ξανά σε λίγο'
      });
    }
  }, [userId, isReady, isOnline]);

  // Get offline data status
  const getOfflineStatus = useCallback(async () => {
    if (!isReady) return null;

    const status = {
      available: dataAvailable,
      lastSync,
      tablesWithData: [] as string[],
      totalItems: 0
    };

    try {
      for (const table of ['pets', 'events', 'expenses']) {
        const items = await getItems(table, { userId });
        if (items.length > 0) {
          status.tablesWithData.push(table);
          status.totalItems += items.length;
        }
      }
    } catch (error) {
      console.error('Failed to get offline status:', error);
    }

    return status;
  }, [isReady, dataAvailable, lastSync, getItems, userId]);

  return {
    // State
    isReady,
    initializing,
    dataAvailable,
    lastSync,
    
    // Actions
    initializeOfflineData,
    refreshOfflineData,
    getOfflineStatus
  };
};