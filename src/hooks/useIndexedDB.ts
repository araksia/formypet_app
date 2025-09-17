import { useState, useCallback, useEffect } from 'react';

interface StoredData<T = any> {
  id: string;
  data: T;
  timestamp: number;
  synced: boolean;
  deleted?: boolean;
  version?: number;
}

interface UseIndexedDBOptions {
  dbName: string;
  version: number;
  stores: string[];
}

export const useIndexedDB = ({ dbName, version, stores }: UseIndexedDBOptions) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(dbName, version);
        
        request.onerror = () => {
          setError(`Failed to open database: ${request.error?.message}`);
        };
        
        request.onsuccess = () => {
          const database = request.result;
          setDb(database);
          setIsReady(true);
          console.log('📦 IndexedDB ready:', dbName);
        };
        
        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores for each table
          stores.forEach(storeName => {
            if (!database.objectStoreNames.contains(storeName)) {
              const store = database.createObjectStore(storeName, { keyPath: 'id' });
              store.createIndex('timestamp', 'timestamp', { unique: false });
              store.createIndex('synced', 'synced', { unique: false });
              console.log(`📋 Created store: ${storeName}`);
            }
          });
        };
      } catch (err) {
        setError(`Database initialization failed: ${err}`);
      }
    };

    initDB();
  }, [dbName, version, stores]);

  // Store data
  const store = useCallback(async <T>(
    storeName: string, 
    data: T & { id?: string }, 
    options?: { synced?: boolean }
  ): Promise<string> => {
    if (!db) throw new Error('Database not ready');

    const id = data.id || crypto.randomUUID();
    const storedData: StoredData<T> = {
      id,
      data: { ...data, id },
      timestamp: Date.now(),
      synced: options?.synced || false,
      version: 1
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(storedData);

      request.onsuccess = () => {
        console.log(`💾 Stored ${storeName}:`, id);
        resolve(id);
      };
      
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get data by ID
  const get = useCallback(async <T>(
    storeName: string, 
    id: string
  ): Promise<T | null> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as StoredData<T> | undefined;
        resolve(result?.deleted ? null : (result?.data || null));
      };
      
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get all data from store
  const getAll = useCallback(async <T>(
    storeName: string,
    options?: { 
      includeDeleted?: boolean;
      unsyncedOnly?: boolean;
    }
  ): Promise<T[]> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as StoredData<T>[];
        
        // Filter based on options
        if (!options?.includeDeleted) {
          results = results.filter(item => !item.deleted);
        }
        
        if (options?.unsyncedOnly) {
          results = results.filter(item => !item.synced);
        }

        // Sort by timestamp (newest first)
        results.sort((a, b) => b.timestamp - a.timestamp);
        
        resolve(results.map(item => item.data));
      };
      
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Update data
  const update = useCallback(async <T>(
    storeName: string,
    id: string,
    updates: Partial<T>,
    options?: { synced?: boolean }
  ): Promise<void> => {
    if (!db) throw new Error('Database not ready');

    const existing = await get<T>(storeName, id);
    if (!existing) throw new Error('Item not found');

    const updatedData = { ...existing, ...updates, id };
    await store(storeName, updatedData, options);
  }, [db, get, store]);

  // Soft delete (mark as deleted)
  const softDelete = useCallback(async (
    storeName: string,
    id: string
  ): Promise<void> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const getRequest = objectStore.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.deleted = true;
          data.synced = false;
          data.timestamp = Date.now();
          
          const putRequest = objectStore.put(data);
          putRequest.onsuccess = () => {
            console.log(`🗑️ Soft deleted ${storeName}:`, id);
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Already deleted or doesn't exist
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }, [db]);

  // Hard delete (remove completely)
  const hardDelete = useCallback(async (
    storeName: string,
    id: string
  ): Promise<void> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`💥 Hard deleted ${storeName}:`, id);
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Mark as synced
  const markSynced = useCallback(async (
    storeName: string,
    id: string
  ): Promise<void> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const getRequest = objectStore.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = objectStore.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }, [db]);

  // Clear all data from store
  const clear = useCallback(async (storeName: string): Promise<void> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`🧹 Cleared store: ${storeName}`);
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  return {
    isReady,
    error,
    store,
    get,
    getAll,
    update,
    softDelete,
    hardDelete,
    markSynced,
    clear
  };
};