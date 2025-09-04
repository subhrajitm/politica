// Integration layer for existing services with new infrastructure
import { memoryCache, politicianCache, searchCache } from '../cache/cacheManager';
import { browserCache } from '../cache/browserCache';
import { errorLogger, AppError, ErrorSeverity } from '../monitoring/errorHandler';
import { performanceMonitor } from '../monitoring/performanceMonitor';
import { analytics } from '../analytics/customAnalytics';

// Enhanced service wrapper that adds caching, monitoring, and error handling
export function withInfrastructure<T extends (...args: any[]) => Promise<any>>(
  serviceFn: T,
  options: {
    cacheKey?: (args: Parameters<T>) => string;
    cacheTTL?: number;
    cacheInstance?: typeof memoryCache;
    trackPerformance?: boolean;
    trackAnalytics?: boolean;
    errorContext?: {
      component: string;
      action: string;
    };
  } = {}
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    const cacheKey = options.cacheKey?.(args);
    const cacheInstance = options.cacheInstance || memoryCache;

    try {
      // Try cache first if cache key is provided
      if (cacheKey) {
        const cached = await cacheInstance.get(cacheKey);
        if (cached !== null) {
          if (options.trackPerformance) {
            performanceMonitor.trackAPICall(
              `cached:${options.errorContext?.component || 'unknown'}`,
              Date.now() - startTime,
              200,
              'GET'
            );
          }
          return cached;
        }
      }

      // Execute the original function
      const result = await serviceFn(...args);

      // Cache the result if cache key is provided
      if (cacheKey && result !== null && result !== undefined) {
        await cacheInstance.set(cacheKey, result, options.cacheTTL);
      }

      // Track performance
      if (options.trackPerformance) {
        performanceMonitor.trackAPICall(
          options.errorContext?.component || 'unknown',
          Date.now() - startTime,
          200,
          'GET'
        );
      }

      // Track analytics
      if (options.trackAnalytics && options.errorContext) {
        analytics.track('service_call', {
          component: options.errorContext.component,
          action: options.errorContext.action,
          duration: Date.now() - startTime,
          cached: false,
        });
      }

      return result;
    } catch (error) {
      // Log error with context
      const appError = error instanceof AppError 
        ? error 
        : new AppError(
            error instanceof Error ? error.message : 'Unknown error',
            'SERVICE_ERROR',
            ErrorSeverity.MEDIUM,
            options.errorContext
          );

      errorLogger.log(appError);

      // Track failed performance
      if (options.trackPerformance) {
        performanceMonitor.trackAPICall(
          options.errorContext?.component || 'unknown',
          Date.now() - startTime,
          500,
          'GET'
        );
      }

      // Track error analytics
      if (options.trackAnalytics && options.errorContext) {
        analytics.track('service_error', {
          component: options.errorContext.component,
          action: options.errorContext.action,
          error: appError.code,
          duration: Date.now() - startTime,
        });
      }

      throw appError;
    }
  }) as T;
}

// Utility to enhance existing politician service
export function enhancePoliticianService<T>(service: T): T {
  if (typeof service !== 'object' || service === null) return service;

  const enhanced = { ...service };

  // Enhance each method in the service
  Object.keys(enhanced).forEach(key => {
    const method = (enhanced as any)[key];
    if (typeof method === 'function') {
      (enhanced as any)[key] = withInfrastructure(method, {
        cacheKey: (args) => `politician:${key}:${JSON.stringify(args)}`,
        cacheTTL: 1000 * 60 * 15, // 15 minutes
        cacheInstance: politicianCache,
        trackPerformance: true,
        trackAnalytics: true,
        errorContext: {
          component: 'PoliticianService',
          action: key,
        },
      });
    }
  });

  return enhanced;
}

// Utility to enhance search service
export function enhanceSearchService<T>(service: T): T {
  if (typeof service !== 'object' || service === null) return service;

  const enhanced = { ...service };

  Object.keys(enhanced).forEach(key => {
    const method = (enhanced as any)[key];
    if (typeof method === 'function') {
      (enhanced as any)[key] = withInfrastructure(method, {
        cacheKey: (args) => `search:${key}:${JSON.stringify(args)}`,
        cacheTTL: 1000 * 60 * 5, // 5 minutes for search results
        cacheInstance: searchCache,
        trackPerformance: true,
        trackAnalytics: true,
        errorContext: {
          component: 'SearchService',
          action: key,
        },
      });
    }
  });

  return enhanced;
}

// Browser cache utilities for client-side data
export const clientCache = {
  // Store user preferences
  setUserPreference: (key: string, value: any) => {
    browserCache.set(`pref:${key}`, value, 1000 * 60 * 60 * 24 * 30); // 30 days
  },

  getUserPreference: <T>(key: string, defaultValue?: T): T | null => {
    const value = browserCache.get<T>(`pref:${key}`);
    return value !== null ? value : (defaultValue || null);
  },

  // Store search history
  addSearchHistory: (query: string) => {
    const history = browserCache.get<string[]>('search_history') || [];
    const updatedHistory = [query, ...history.filter(h => h !== query)].slice(0, 10);
    browserCache.set('search_history', updatedHistory, 1000 * 60 * 60 * 24 * 7); // 7 days
  },

  getSearchHistory: (): string[] => {
    return browserCache.get<string[]>('search_history') || [];
  },

  // Store recently viewed politicians
  addRecentlyViewed: (politicianId: string, politicianName: string) => {
    const recent = browserCache.get<Array<{id: string, name: string, timestamp: number}>>('recently_viewed') || [];
    const updated = [
      { id: politicianId, name: politicianName, timestamp: Date.now() },
      ...recent.filter(r => r.id !== politicianId)
    ].slice(0, 20);
    browserCache.set('recently_viewed', updated, 1000 * 60 * 60 * 24 * 7); // 7 days
  },

  getRecentlyViewed: () => {
    return browserCache.get<Array<{id: string, name: string, timestamp: number}>>('recently_viewed') || [];
  },
};