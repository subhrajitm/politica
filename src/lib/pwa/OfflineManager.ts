/**
 * Offline Manager - Handles offline functionality and data synchronization
 */

export interface OfflineData {
  id: string;
  type: 'politician' | 'search' | 'user_action';
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = true; // Default to true for SSR
  private syncInProgress: boolean = false;

  private constructor() {
    this.init();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private init(): void {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Set initial online status
    if ('navigator' in window) {
      this.isOnline = navigator.onLine;
    }

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Load sync queue from localStorage
    this.loadSyncQueue();

    // Start periodic sync attempts when online
    if (this.isOnline) {
      this.startPeriodicSync();
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    console.log('Connection restored - starting sync');
    this.syncOfflineData();
    this.startPeriodicSync();
    
    // Notify components about online status
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('connection-restored'));
    }
  }

  private handleOffline(): void {
    this.isOnline = false;
    console.log('Connection lost - entering offline mode');
    
    // Notify components about offline status
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('connection-lost'));
    }
  }

  // Cache management
  async cacheData(key: string, data: any, type: string = 'general'): Promise<void> {
    // Only cache on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const offlineData: OfflineData = {
        id: key,
        type: type as any,
        data,
        timestamp: Date.now(),
        synced: this.isOnline,
      };

      localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
      
      // Also cache in IndexedDB for larger data
      if (typeof data === 'object' && JSON.stringify(data).length > 5000) {
        await this.cacheInIndexedDB(key, offlineData);
      }
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  async getCachedData(key: string): Promise<any | null> {
    // Only get cached data on client side
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      // Try localStorage first
      const cached = localStorage.getItem(`offline_${key}`);
      if (cached) {
        const offlineData: OfflineData = JSON.parse(cached);
        return offlineData.data;
      }

      // Try IndexedDB for larger data
      const indexedData = await this.getCachedFromIndexedDB(key);
      return indexedData?.data || null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  async removeCachedData(key: string): Promise<void> {
    // Only remove cached data on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(`offline_${key}`);
      await this.removeFromIndexedDB(key);
    } catch (error) {
      console.error('Failed to remove cached data:', error);
    }
  }

  // Sync queue management
  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: item.maxRetries || 3,
    };

    this.syncQueue.push(syncItem);
    this.saveSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.syncOfflineData();
    }
  }

  private async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Starting sync of ${this.syncQueue.length} items`);

    const itemsToSync = [...this.syncQueue];
    const syncedItems: string[] = [];
    const failedItems: SyncQueueItem[] = [];

    for (const item of itemsToSync) {
      try {
        const success = await this.syncItem(item);
        if (success) {
          syncedItems.push(item.id);
        } else {
          item.retryCount++;
          if (item.retryCount < item.maxRetries) {
            failedItems.push(item);
          } else {
            console.error('Max retries reached for sync item:', item);
          }
        }
      } catch (error) {
        console.error('Sync error for item:', item, error);
        item.retryCount++;
        if (item.retryCount < item.maxRetries) {
          failedItems.push(item);
        }
      }
    }

    // Update sync queue
    this.syncQueue = failedItems;
    this.saveSyncQueue();

    console.log(`Sync completed: ${syncedItems.length} synced, ${failedItems.length} failed`);
    this.syncInProgress = false;

    // Notify about sync completion
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sync-completed', {
        detail: { synced: syncedItems.length, failed: failedItems.length }
      }));
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      const response = await fetch(item.endpoint, {
        method: this.getHttpMethod(item.action),
        headers: {
          'Content-Type': 'application/json',
        },
        body: item.data ? JSON.stringify(item.data) : undefined,
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync item:', error);
      return false;
    }
  }

  private getHttpMethod(action: string): string {
    switch (action) {
      case 'create': return 'POST';
      case 'update': return 'PUT';
      case 'delete': return 'DELETE';
      default: return 'POST';
    }
  }

  private loadSyncQueue(): void {
    // Only load on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const saved = localStorage.getItem('sync_queue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private saveSyncQueue(): void {
    // Only save on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress && this.syncQueue.length > 0) {
        this.syncOfflineData();
      }
    }, 30000);
  }

  // IndexedDB operations for larger data
  private async cacheInIndexedDB(key: string, data: OfflineData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PolitiFindOffline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offline_data'], 'readwrite');
        const store = transaction.objectStore('offline_data');
        
        const putRequest = store.put({ ...data, key });
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('offline_data')) {
          const store = db.createObjectStore('offline_data', { keyPath: 'key' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async getCachedFromIndexedDB(key: string): Promise<OfflineData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PolitiFindOffline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offline_data'], 'readonly');
        const store = transaction.objectStore('offline_data');
        
        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  private async removeFromIndexedDB(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PolitiFindOffline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offline_data'], 'readwrite');
        const store = transaction.objectStore('offline_data');
        
        const deleteRequest = store.delete(key);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  // Public API
  isOffline(): boolean {
    return !this.isOnline;
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  forcSync(): Promise<void> {
    return this.syncOfflineData();
  }

  clearSyncQueue(): void {
    this.syncQueue = [];
    this.saveSyncQueue();
  }
}

export default OfflineManager;