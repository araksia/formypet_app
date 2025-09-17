import { useState, useCallback, useEffect } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { useOnline } from './useOnline';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  localId: string;
  serverId?: string;
  timestamp: number;
}

const DB_CONFIG = {
  dbName: 'FormyPetOffline',
  version: 1,
  stores: ['pets', 'expenses', 'events', 'profiles', 'sync_queue']
};

export const useOfflineStore = () => {
  const { isReady, store, get, getAll, update, softDelete, markSynced, clear } = useIndexedDB(DB_CONFIG);
  const [syncing, setSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<number>(0);
  const isOnline = useOnline();

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && isReady && !syncing) {
      syncWithServer();
    }
  }, [isOnline, isReady]);

  // Load pending operations count
  useEffect(() => {
    const loadPendingCount = async () => {
      if (isReady) {
        try {
          const operations = await getAll<SyncOperation>('sync_queue');
          setPendingOperations(operations.length);
        } catch (error) {
          console.error('Failed to load pending operations:', error);
        }
      }
    };
    
    loadPendingCount();
  }, [isReady, getAll]);

  // Create item (works offline)
  const createItem = useCallback(async <T extends { id?: string }>(
    table: string,
    data: T
  ): Promise<string> => {
    if (!isReady) throw new Error('Store not ready');

    const localId = crypto.randomUUID();
    const itemWithId = { ...data, id: localId };

    try {
      // Store locally first
      await store(table, itemWithId, { synced: false });

      // Queue for sync
      const syncOp: SyncOperation = {
        type: 'CREATE',
        table,
        data: itemWithId,
        localId,
        timestamp: Date.now()
      };
      await store('sync_queue', syncOp);
      setPendingOperations(prev => prev + 1);

      // Try immediate sync if online
      if (isOnline) {
        syncWithServer();
      } else {
        toast.success('Αποθηκεύτηκε offline', {
          description: `${getTableLabel(table)} θα συγχρονιστεί όταν επιστρέψει η σύνδεση`
        });
      }

      return localId;
    } catch (error) {
      console.error('Failed to create item:', error);
      throw error;
    }
  }, [isReady, store, isOnline]);

  // Update item (works offline)
  const updateItem = useCallback(async <T extends { id: string }>(
    table: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> => {
    if (!isReady) throw new Error('Store not ready');

    try {
      // Update locally first
      await update(table, id, updates, { synced: false });

      // Queue for sync
      const syncOp: SyncOperation = {
        type: 'UPDATE',
        table,
        data: { id, ...updates },
        localId: id,
        serverId: id,
        timestamp: Date.now()
      };
      await store('sync_queue', syncOp);
      setPendingOperations(prev => prev + 1);

      // Try immediate sync if online
      if (isOnline) {
        syncWithServer();
      } else {
        toast.success('Ενημερώθηκε offline', {
          description: `${getTableLabel(table)} θα συγχρονιστεί όταν επιστρέψει η σύνδεση`
        });
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  }, [isReady, update, store, isOnline]);

  // Delete item (works offline)
  const deleteItem = useCallback(async (
    table: string,
    id: string
  ): Promise<void> => {
    if (!isReady) throw new Error('Store not ready');

    try {
      // Soft delete locally
      await softDelete(table, id);

      // Queue for sync
      const syncOp: SyncOperation = {
        type: 'DELETE',
        table,
        data: { id },
        localId: id,
        serverId: id,
        timestamp: Date.now()
      };
      await store('sync_queue', syncOp);
      setPendingOperations(prev => prev + 1);

      // Try immediate sync if online
      if (isOnline) {
        syncWithServer();
      } else {
        toast.success('Διαγράφηκε offline', {
          description: `${getTableLabel(table)} θα συγχρονιστεί όταν επιστρέψει η σύνδεση`
        });
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  }, [isReady, softDelete, store, isOnline]);

  // Get items (from local store)
  const getItems = useCallback(async <T>(
    table: string,
    options?: { userId?: string }
  ): Promise<T[]> => {
    if (!isReady) throw new Error('Store not ready');

    try {
      let items = await getAll<T>(table);
      
      // Filter by user if needed
      if (options?.userId) {
        items = items.filter((item: any) => 
          item.owner_id === options.userId || 
          item.user_id === options.userId
        );
      }

      return items;
    } catch (error) {
      console.error('Failed to get items:', error);
      return [];
    }
  }, [isReady, getAll]);

  // Get single item
  const getItem = useCallback(async <T>(
    table: string,
    id: string
  ): Promise<T | null> => {
    if (!isReady) throw new Error('Store not ready');

    try {
      return await get<T>(table, id);
    } catch (error) {
      console.error('Failed to get item:', error);
      return null;
    }
  }, [isReady, get]);

  // Sync with server
  const syncWithServer = useCallback(async (): Promise<void> => {
    if (!isOnline || !isReady || syncing) return;

    setSyncing(true);
    try {
      const operations = await getAll<SyncOperation>('sync_queue');
      
      if (operations.length === 0) {
        setPendingOperations(0);
        return;
      }

      console.log(`🔄 Syncing ${operations.length} operations...`);

      let successCount = 0;
      let failCount = 0;

      for (const op of operations) {
        try {
          let result;
          
          switch (op.type) {
            case 'CREATE':
              result = await supabase
                .from(op.table)
                .insert(op.data)
                .select()
                .single();
              
              if (result.error) throw result.error;
              
              // Update local item with server ID
              if (result.data?.id !== op.localId) {
                await update(op.table, op.localId, { id: result.data.id }, { synced: true });
              } else {
                await markSynced(op.table, op.localId);
              }
              break;

            case 'UPDATE':
              result = await supabase
                .from(op.table)
                .update(op.data)
                .eq('id', op.serverId || op.localId);
              
              if (result.error) throw result.error;
              await markSynced(op.table, op.localId);
              break;

            case 'DELETE':
              result = await supabase
                .from(op.table)
                .delete()
                .eq('id', op.serverId || op.localId);
              
              if (result.error) throw result.error;
              // Hard delete from local store after successful sync
              await softDelete(op.table, op.localId);
              break;
          }

          // Remove from sync queue
          await softDelete('sync_queue', op.localId);
          successCount++;
          
        } catch (error) {
          console.error('Sync operation failed:', op, error);
          failCount++;
        }
      }

      // Update pending count
      const remainingOps = await getAll<SyncOperation>('sync_queue');
      setPendingOperations(remainingOps.length);

      if (successCount > 0) {
        toast.success(`Συγχρονίστηκε επιτυχώς`, {
          description: `${successCount} ενέργειες συγχρονίστηκαν${failCount > 0 ? `, ${failCount} απέτυχαν` : ''}`
        });
      }

      if (failCount > 0 && successCount === 0) {
        toast.error('Αποτυχία συγχρονισμού', {
          description: 'Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά'
        });
      }

    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Αποτυχία συγχρονισμού', {
        description: 'Κάτι πήγε στραβά κατά τον συγχρονισμό'
      });
    } finally {
      setSyncing(false);
    }
  }, [isOnline, isReady, syncing, getAll, update, markSynced, softDelete]);

  // Clear all offline data
  const clearOfflineData = useCallback(async (): Promise<void> => {
    if (!isReady) return;

    try {
      await Promise.all([
        clear('pets'),
        clear('expenses'),
        clear('events'),
        clear('profiles'),
        clear('sync_queue')
      ]);
      setPendingOperations(0);
      toast.success('Διαγράφηκαν τα offline δεδομένα');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      toast.error('Αποτυχία διαγραφής offline δεδομένων');
    }
  }, [isReady, clear]);

  return {
    isReady,
    syncing,
    pendingOperations,
    createItem,
    updateItem,
    deleteItem,
    getItems,
    getItem,
    syncWithServer,
    clearOfflineData
  };
};

// Helper function to get table labels in Greek
const getTableLabel = (table: string): string => {
  const labels: Record<string, string> = {
    pets: 'Κατοικίδιο',
    expenses: 'Έξοδο',
    events: 'Γεγονός',
    profiles: 'Προφίλ'
  };
  return labels[table] || table;
};