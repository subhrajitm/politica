/**
 * React hook for offline functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { OfflineManager } from '@/lib/pwa/OfflineManager';

export interface UseOfflineReturn {
  isOnline: boolean;
  isOffline: boolean;
  syncQueueLength: number;
  isSyncing: boolean;
  
  // Cache operations
  cacheData: (key: string, data: any, type?: string) => Promise<void>;
  getCachedData: (key: string) => Promise<any | null>;
  removeCachedData: (key: string) => Promise<void>;
  
  // Sync operations
  addToSyncQueue: (action: 'create' | 'update' | 'delete', endpoint: string, data?: any) => void;
  forceSync: () => Promise<void>;
  clearSyncQueue: () => void;
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined' && 'navigator' in window) {
      return navigator.onLine;
    }
    // Default to true during SSR
    return true;
  });
  const [syncQueueLength, setSyncQueueLength] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineManager] = useState(() => {
    // Only create OfflineManager on client side
    if (typeof window !== 'undefined') {
      return OfflineManager.getInstance();
    }
    return null;
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !offlineManager) {
      return;
    }

    // Set initial online status
    if ('navigator' in window) {
      setIsOnline(navigator.onLine);
    }

    // Update initial sync queue length
    setSyncQueueLength(offlineManager.getSyncQueueLength());

    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleConnectionRestored = () => {
      setIsOnline(true);
      setIsSyncing(true);
    };

    const handleConnectionLost = () => {
      setIsOnline(false);
      setIsSyncing(false);
    };

    const handleSyncCompleted = (event: CustomEvent) => {
      setIsSyncing(false);
      setSyncQueueLength(offlineManager.getSyncQueueLength());
      
      // Show notification about sync results
      const { synced, failed } = event.detail;
      if (synced > 0) {
        console.log(`Synced ${synced} items successfully`);
      }
      if (failed > 0) {
        console.warn(`Failed to sync ${failed} items`);
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connection-restored', handleConnectionRestored);
    window.addEventListener('connection-lost', handleConnectionLost);
    window.addEventListener('sync-completed', handleSyncCompleted as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection-restored', handleConnectionRestored);
      window.removeEventListener('connection-lost', handleConnectionLost);
      window.removeEventListener('sync-completed', handleSyncCompleted as EventListener);
    };
  }, [offlineManager]);

  const cacheData = useCallback(async (key: string, data: any, type: string = 'general') => {
    if (offlineManager) {
      await offlineManager.cacheData(key, data, type);
    }
  }, [offlineManager]);

  const getCachedData = useCallback(async (key: string) => {
    if (offlineManager) {
      return await offlineManager.getCachedData(key);
    }
    return null;
  }, [offlineManager]);

  const removeCachedData = useCallback(async (key: string) => {
    if (offlineManager) {
      await offlineManager.removeCachedData(key);
    }
  }, [offlineManager]);

  const addToSyncQueue = useCallback((
    action: 'create' | 'update' | 'delete',
    endpoint: string,
    data?: any
  ) => {
    if (offlineManager) {
      offlineManager.addToSyncQueue({
        action,
        endpoint,
        data,
        maxRetries: 3,
      });
      setSyncQueueLength(offlineManager.getSyncQueueLength());
    }
  }, [offlineManager]);

  const forceSync = useCallback(async () => {
    if (!offlineManager) return;
    
    setIsSyncing(true);
    try {
      await offlineManager.forcSync();
    } finally {
      setIsSyncing(false);
      setSyncQueueLength(offlineManager.getSyncQueueLength());
    }
  }, [offlineManager]);

  const clearSyncQueue = useCallback(() => {
    if (offlineManager) {
      offlineManager.clearSyncQueue();
      setSyncQueueLength(0);
    }
  }, [offlineManager]);

  return {
    isOnline,
    isOffline: !isOnline,
    syncQueueLength,
    isSyncing,
    cacheData,
    getCachedData,
    removeCachedData,
    addToSyncQueue,
    forceSync,
    clearSyncQueue,
  };
}

// Hook for offline-first data fetching
export function useOfflineData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cacheType?: string;
    maxAge?: number; // in milliseconds
    fallbackData?: T;
  } = {}
) {
  const [data, setData] = useState<T | null>(options.fallbackData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline, cacheData, getCachedData } = useOffline();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get cached data first
      const cachedData = await getCachedData(key);
      if (cachedData) {
        const cacheAge = Date.now() - cachedData.timestamp;
        const maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes default

        if (cacheAge < maxAge || !isOnline) {
          setData(cachedData.data);
          setLoading(false);
          
          // If online and cache is getting old, fetch in background
          if (isOnline && cacheAge > maxAge / 2) {
            try {
              const freshData = await fetcher();
              await cacheData(key, freshData, options.cacheType);
              setData(freshData);
            } catch (error) {
              // Ignore background fetch errors
              console.warn('Background fetch failed:', error);
            }
          }
          return;
        }
      }

      // Fetch fresh data if online
      if (isOnline) {
        const freshData = await fetcher();
        await cacheData(key, freshData, options.cacheType);
        setData(freshData);
      } else if (!cachedData) {
        throw new Error('No cached data available and device is offline');
      }
    } catch (err) {
      setError(err as Error);
      
      // Try to use cached data as fallback
      const cachedData = await getCachedData(key);
      if (cachedData) {
        setData(cachedData.data);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, isOnline, cacheData, getCachedData, options.cacheType, options.maxAge]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    isStale: !isOnline && data !== null,
  };
}