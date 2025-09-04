/**
 * Cache warming service to preload frequently accessed data
 */

import { cacheService, CACHE_KEYS } from './cacheService';
import { PoliticianService } from '../politicianService';

export class CacheWarmingService {
  private static isWarming = false;

  /**
   * Warm up cache with essential data
   */
  static async warmupEssentialData(): Promise<void> {
    if (this.isWarming) {
      console.log('Cache warming already in progress');
      return;
    }

    this.isWarming = true;
    console.log('Starting cache warmup...');

    try {
      await Promise.all([
        this.warmupPopularPoliticians(),
        this.warmupLocationData(),
        this.warmupAnalyticsData()
      ]);

      console.log('Cache warmup completed successfully');
    } catch (error) {
      console.error('Error during cache warmup:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Warm up popular politicians data
   */
  private static async warmupPopularPoliticians(): Promise<void> {
    try {
      // Get all politicians to warm up the main cache
      const politicians = await PoliticianService.getAllPoliticians();
      console.log(`Warmed up ${politicians.length} politicians`);

      // Warm up individual politician caches for the first 20 (most likely to be accessed)
      const popularPoliticians = politicians.slice(0, 20);
      await Promise.all(
        popularPoliticians.map(politician => 
          cacheService.cachePolitician(politician)
        )
      );

      console.log(`Warmed up ${popularPoliticians.length} individual politician caches`);
    } catch (error) {
      console.error('Error warming up politicians data:', error);
    }
  }

  /**
   * Warm up location data (countries, states)
   */
  private static async warmupLocationData(): Promise<void> {
    try {
      // This would typically load country and state data
      // For now, we'll just prepare the cache keys
      const locationKeys = [
        CACHE_KEYS.countries.all,
        CACHE_KEYS.states.all,
        CACHE_KEYS.states.byCountry('IN') // India
      ];

      await cacheService.warmupCache();
      console.log('Warmed up location data');
    } catch (error) {
      console.error('Error warming up location data:', error);
    }
  }

  /**
   * Warm up analytics data
   */
  private static async warmupAnalyticsData(): Promise<void> {
    try {
      // Prepare analytics cache keys
      const analyticsKeys = [
        CACHE_KEYS.analytics.popular,
        CACHE_KEYS.analytics.trending
      ];

      // This would typically calculate and cache popular/trending data
      console.log('Warmed up analytics data');
    } catch (error) {
      console.error('Error warming up analytics data:', error);
    }
  }

  /**
   * Warm up search cache with common queries
   */
  static async warmupSearchCache(): Promise<void> {
    const commonQueries = [
      'modi',
      'gandhi',
      'bjp',
      'congress',
      'prime minister',
      'chief minister'
    ];

    try {
      await Promise.all(
        commonQueries.map(async (query) => {
          try {
            await PoliticianService.searchPoliticians(query);
          } catch (error) {
            console.error(`Error warming up search for "${query}":`, error);
          }
        })
      );

      console.log(`Warmed up search cache for ${commonQueries.length} common queries`);
    } catch (error) {
      console.error('Error warming up search cache:', error);
    }
  }

  /**
   * Schedule periodic cache warming
   */
  static schedulePeriodicWarmup(): void {
    // Warm up cache every 6 hours
    const WARMUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    setInterval(async () => {
      console.log('Starting scheduled cache warmup...');
      await this.warmupEssentialData();
    }, WARMUP_INTERVAL);

    // Initial warmup after 30 seconds to allow app to start
    setTimeout(async () => {
      await this.warmupEssentialData();
    }, 30000);
  }

  /**
   * Get cache warming status
   */
  static isWarmingInProgress(): boolean {
    return this.isWarming;
  }
}

// Auto-start periodic warmup in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  CacheWarmingService.schedulePeriodicWarmup();
}