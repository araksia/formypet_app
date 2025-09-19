import { supabase } from '@/integrations/supabase/client';

export interface OfflineDataConfig {
  table: string;
  columns: string[];
  userIdColumn?: string;
  dependencies?: string[]; // Related tables to also cache
}

// Configuration for tables to cache offline
export const OFFLINE_TABLES: Record<string, OfflineDataConfig> = {
  pets: {
    table: 'pets',
    columns: ['id', 'name', 'species', 'breed', 'gender', 'birth_date', 'weight', 'avatar_url', 'microchip_number', 'owner_id', 'created_at', 'updated_at'],
    userIdColumn: 'owner_id'
  },
  expenses: {
    table: 'expenses',
    columns: ['id', 'amount', 'category', 'description', 'date', 'pet_id', 'user_id', 'created_at', 'updated_at'],
    userIdColumn: 'user_id'
  },
  events: {
    table: 'events',
    columns: ['id', 'title', 'description', 'event_type', 'event_date', 'event_time', 'pet_id', 'user_id', 'created_at', 'updated_at'],
    userIdColumn: 'user_id'
  },
  profiles: {
    table: 'profiles',
    columns: ['id', 'user_id', 'display_name', 'avatar_url', 'bio', 'created_at', 'updated_at'],
    userIdColumn: 'user_id'
  }
};

export class OfflineDataManager {
  private static instance: OfflineDataManager;
  private syncInProgress = false;

  static getInstance(): OfflineDataManager {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  // Download initial data for offline use
  async downloadInitialData(userId: string, offlineStore: any): Promise<void> {
    if (this.syncInProgress) {
      console.log('📥 Download already in progress');
      return;
    }

    this.syncInProgress = true;
    console.log('📥 Downloading initial data for offline use...');

    try {
      for (const [tableName, config] of Object.entries(OFFLINE_TABLES)) {
        await this.downloadTableData(tableName, config, userId, offlineStore);
      }
      
      console.log('✅ Initial data download completed');
    } catch (error) {
      console.error('❌ Failed to download initial data:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Download data for a specific table
  private async downloadTableData(
    tableName: string, 
    config: OfflineDataConfig, 
    userId: string, 
    offlineStore: any
  ): Promise<void> {
    try {
      let query = supabase
        .from(config.table as any)
        .select(config.columns.join(', '));

      // Filter by user if applicable
      if (config.userIdColumn) {
        query = query.eq(config.userIdColumn, userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`❌ Failed to download ${tableName}:`, error);
        return;
      }

      if (data && data.length > 0) {
        // Store each item in offline store
        for (const item of data as any[]) {
          await offlineStore.store(tableName, item, { synced: true });
        }
        
        console.log(`📦 Downloaded ${data.length} ${tableName} items`);
      }
    } catch (error) {
      console.error(`❌ Error downloading ${tableName}:`, error);
    }
  }

  // Sync local changes with server
  async syncChanges(offlineStore: any): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      console.log('🔄 Sync already in progress');
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    console.log('🔄 Syncing local changes with server...');

    let successCount = 0;
    let failedCount = 0;

    try {
      // Get all unsynced data
      for (const tableName of Object.keys(OFFLINE_TABLES)) {
        const unsyncedItems = await offlineStore.getAll(tableName, { unsyncedOnly: true });
        
        for (const item of unsyncedItems) {
          try {
            await this.syncItem(tableName, item, offlineStore);
            successCount++;
          } catch (error) {
            console.error(`❌ Failed to sync ${tableName} item:`, error);
            failedCount++;
          }
        }
      }

      console.log(`✅ Sync completed: ${successCount} success, ${failedCount} failed`);
    } catch (error) {
      console.error('❌ Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }

    return { success: successCount, failed: failedCount };
  }

  // Sync individual item
  private async syncItem(tableName: string, item: any, offlineStore: any): Promise<void> {
    const config = OFFLINE_TABLES[tableName];
    if (!config) return;

    // Check if item exists on server
    const { data: existing } = await supabase
      .from(config.table as any)
      .select('id, updated_at')
      .eq('id', item.id)
      .single();

    if (existing) {
      // Update existing item
      const { error } = await supabase
        .from(config.table as any)
        .update(item)
        .eq('id', item.id);

      if (error) throw error;
    } else {
      // Create new item
      const { error } = await supabase
        .from(config.table as any)
        .insert(item);

      if (error) throw error;
    }

    // Mark as synced in local store
    await offlineStore.markSynced(tableName, item.id);
  }

  // Check if offline data is available
  async hasOfflineData(tableName: string, offlineStore: any): Promise<boolean> {
    try {
      const items = await offlineStore.getAll(tableName);
      return items.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Get data age (how old is the offline data)
  async getDataAge(tableName: string, offlineStore: any): Promise<number> {
    try {
      const items = await offlineStore.getAll(tableName);
      if (items.length === 0) return Infinity;

      const timestamps = items.map((item: any) => item.timestamp || 0);
      const oldestTimestamp = Math.min(...timestamps);
      
      return Date.now() - oldestTimestamp;
    } catch (error) {
      return Infinity;
    }
  }

  // Force refresh data from server
  async forceRefresh(userId: string, offlineStore: any): Promise<void> {
    console.log('🔄 Force refreshing offline data...');
    
    // Clear existing offline data
    for (const tableName of Object.keys(OFFLINE_TABLES)) {
      await offlineStore.clear(tableName);
    }

    // Download fresh data
    await this.downloadInitialData(userId, offlineStore);
  }

  // Get sync status
  getSyncStatus(): { inProgress: boolean } {
    return { inProgress: this.syncInProgress };
  }
}

export const offlineDataManager = OfflineDataManager.getInstance();