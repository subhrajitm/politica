/**
 * React hook for cache management
 */

import { useCallback, useEffect, useState } from 'react';
import { cacheService } from '../lib/cache/cacheService';
import { CacheStats } from '../lib/cache/cacheManager';

export interface UseCacheOptions {
  autoWarmup?: boolean;
  refreshInterval?: number;
}

export function useCache(options: UseCacheOptions = {}) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get cache statistics
  const refreshStats = useCallback(() => {
    const currentStats = cacheService.getCacheStats();
    setStats(currentStats);
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    setIsLoading(true);
    try {
      await cacheService.clearCache();
      refreshStats();
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  // Warm up cache
  const warmupCache = useCallback(async () => {
    setIsLoading(true);
    try {
      await cacheService.warmupCache();
      refreshStats();
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  // Invalidate politician cache
  const invalidatePoliticianCache = useCallback(async (politicianId?: string) => {
    setIsLoading(true);
    try {
      await cacheService.invalidatePoliticianCache(politicianId);
      refreshStats();
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  // Invalidate search cache
  const invalidateSearchCache = useCallback(async () => {
    setIsLoading(true);
    try {
      await cacheService.invalidateSearchCache();
      refreshStats();
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  // Auto warmup on mount
  useEffect(() => {
    if (options.autoWarmup) {
      warmupCache();
    } else {
      refreshStats();
    }
  }, [options.autoWarmup, warmupCache, refreshStats]);

  // Refresh stats periodically
  useEffect(() => {
    if (options.refreshInterval) {
      const interval = setInterval(refreshStats, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [options.refreshInterval, refreshStats]);

  return {
    stats,
    isLoading,
    refreshStats,
    clearCache,
    warmupCache,
    invalidatePoliticianCache,
    invalidateSearchCache
  };
}

/**
 * Hook for caching data with automatic cache management
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled && options.enabled !== undefined) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to get from cache first
      const cachedData = await cacheService.getCachedLocationData<T>(key);
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        return;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      setData(freshData);

      // Cache the fresh data
      await cacheService.cacheLocationData(key, freshData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(async () => {
    await cacheService.invalidatePoliticianCache();
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate
  };
}