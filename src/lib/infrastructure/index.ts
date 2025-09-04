// Infrastructure utilities and exports
export * from '../cache/cacheManager';
export * from '../cache/browserCache';
export * from '../monitoring/errorHandler';
export * from '../monitoring/performanceMonitor';
export * from '../analytics/customAnalytics';

// Initialize infrastructure on client side
if (typeof window !== 'undefined') {
  // Clean up expired cache entries on startup
  import('../cache/browserCache').then(({ browserCache, sessionCache }) => {
    browserCache.cleanup();
    sessionCache.cleanup();
  });

  // Set up periodic cleanup
  setInterval(() => {
    import('../cache/browserCache').then(({ browserCache, sessionCache }) => {
      browserCache.cleanup();
      sessionCache.cleanup();
    });
  }, 1000 * 60 * 10); // Clean up every 10 minutes
}