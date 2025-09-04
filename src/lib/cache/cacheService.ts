/**
 * Cache service for politician data and other frequently accessed information
 */

import { cacheManager } from './cacheManager';
import { Politician } from '../types';

export interface CacheKey {
  politicians: {
    all: string;
    byId: (id: string) => string;
    byCountry: (countryCode: string) => string;
    byState: (stateCode: string) => string;
    search: (query: string) => string;
  };
  countries: {
    all: string;
  };
  states: {
    all: string;
    byCountry: (countryCode: string) => string;
  };
  analytics: {
    popular: string;
    trending: string;
  };
}

export const CACHE_KEYS: CacheKey = {
  politicians: {
    all: 'politicians:all',
    byId: (id: string) => `politicians:id:${id}`,
    byCountry: (countryCode: string) => `politicians:country:${countryCode}`,
    byState: (stateCode: string) => `politicians:state:${stateCode}`,
    search: (query: string) => `politicians:search:${encodeURIComponent(query)}`
  },
  countries: {
    all: 'countries:all'
  },
  states: {
    all: 'states:all',
    byCountry: (countryCode: string) => `states:country:${countryCode}`
  },
  analytics: {
    popular: 'analytics:popular',
    trending: 'analytics:trending'
  }
};

export class CacheService {
  private readonly TTL = {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 2 * 60 * 60 * 1000,  // 2 hours
    VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
  };

  /**
   * Cache politician data
   */
  async cachePolitician(politician: Politician): Promise<void> {
    await cacheManager.set(
      CACHE_KEYS.politicians.byId(politician.id),
      politician,
      this.TTL.MEDIUM
    );
  }

  /**
   * Get cached politician by ID
   */
  async getCachedPolitician(id: string): Promise<Politician | null> {
    return await cacheManager.get<Politician>(CACHE_KEYS.politicians.byId(id));
  }

  /**
   * Cache politicians list
   */
  async cachePoliticians(key: string, politicians: Politician[], ttl?: number): Promise<void> {
    await cacheManager.set(key, politicians, ttl || this.TTL.MEDIUM);
  }

  /**
   * Get cached politicians list
   */
  async getCachedPoliticians(key: string): Promise<Politician[] | null> {
    return await cacheManager.get<Politician[]>(key);
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(query: string, results: Politician[]): Promise<void> {
    await cacheManager.set(
      CACHE_KEYS.politicians.search(query),
      results,
      this.TTL.SHORT // Search results expire quickly
    );
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(query: string): Promise<Politician[] | null> {
    return await cacheManager.get<Politician[]>(CACHE_KEYS.politicians.search(query));
  }

  /**
   * Cache country/state data
   */
  async cacheLocationData(key: string, data: any): Promise<void> {
    await cacheManager.set(key, data, this.TTL.VERY_LONG); // Location data changes rarely
  }

  /**
   * Get cached location data
   */
  async getCachedLocationData<T>(key: string): Promise<T | null> {
    return await cacheManager.get<T>(key);
  }

  /**
   * Cache analytics data
   */
  async cacheAnalytics(key: string, data: any): Promise<void> {
    await cacheManager.set(key, data, this.TTL.SHORT); // Analytics data updates frequently
  }

  /**
   * Get cached analytics data
   */
  async getCachedAnalytics<T>(key: string): Promise<T | null> {
    return await cacheManager.get<T>(key);
  }

  /**
   * Invalidate politician-related cache
   */
  async invalidatePoliticianCache(politicianId?: string): Promise<void> {
    if (politicianId) {
      await cacheManager.invalidate(`politicians:id:${politicianId}`);
    } else {
      await cacheManager.invalidate('politicians:*');
    }
  }

  /**
   * Invalidate search cache
   */
  async invalidateSearchCache(): Promise<void> {
    await cacheManager.invalidate('politicians:search:*');
    await cacheManager.invalidate('search:*');
    await cacheManager.invalidate('suggestions:*');
    await cacheManager.invalidate('recommendations:*');
    await cacheManager.invalidate('related:*');
  }

  /**
   * Generic cache methods for search service
   */
  async get<T>(key: string): Promise<T | null> {
    return await cacheManager.get<T>(key);
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    await cacheManager.set(key, data, ttl || this.TTL.MEDIUM);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    await cacheManager.invalidate(pattern);
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmupCache(): Promise<void> {
    const frequentKeys = [
      CACHE_KEYS.politicians.all,
      CACHE_KEYS.countries.all,
      CACHE_KEYS.states.all,
      CACHE_KEYS.analytics.popular,
      CACHE_KEYS.analytics.trending
    ];

    await cacheManager.warmup(frequentKeys);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheManager.getStats();
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    await cacheManager.clear();
  }
}

// Global cache service instance
export const cacheService = new CacheService();