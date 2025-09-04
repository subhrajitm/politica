// Simple test to verify infrastructure components are working
import { memoryCache, politicianCache, searchCache } from './cacheManager';
import { browserCache } from './browserCache';
import { errorLogger, AppError, ErrorSeverity } from './errorHandler';
import { performanceMonitor } from './performanceMonitor';
import { analytics } from './customAnalytics';

export async function testInfrastructure(): Promise<{
  success: boolean;
  results: Record<string, boolean>;
  errors: string[];
}> {
  const results: Record<string, boolean> = {};
  const errors: string[] = [];

  try {
    // Test memory cache
    await memoryCache.set('test_key', 'test_value');
    const cachedValue = await memoryCache.get('test_key');
    results.memoryCache = cachedValue === 'test_value';
    if (!results.memoryCache) {
      errors.push('Memory cache test failed');
    }

    // Test politician cache
    await politicianCache.set('politician_1', { id: '1', name: 'Test Politician' });
    const politician = await politicianCache.get('politician_1');
    results.politicianCache = politician?.id === '1';
    if (!results.politicianCache) {
      errors.push('Politician cache test failed');
    }

    // Test search cache
    await searchCache.set('search_test', ['result1', 'result2']);
    const searchResults = await searchCache.get('search_test');
    results.searchCache = Array.isArray(searchResults) && searchResults.length === 2;
    if (!results.searchCache) {
      errors.push('Search cache test failed');
    }

    // Test browser cache (only in browser environment)
    if (typeof window !== 'undefined') {
      browserCache.set('browser_test', 'browser_value');
      const browserValue = browserCache.get('browser_test');
      results.browserCache = browserValue === 'browser_value';
      if (!results.browserCache) {
        errors.push('Browser cache test failed');
      }
    } else {
      results.browserCache = true; // Skip in server environment
    }

    // Test error logger
    const testError = new AppError(
      'Test error',
      'TEST_ERROR',
      ErrorSeverity.LOW,
      { component: 'InfrastructureTest', action: 'test' }
    );
    const errorId = errorLogger.log(testError);
    results.errorLogger = typeof errorId === 'string' && errorId.length > 0;
    if (!results.errorLogger) {
      errors.push('Error logger test failed');
    }

    // Test performance monitor
    performanceMonitor.trackAPICall('/test/endpoint', 100, 200, 'GET');
    const report = performanceMonitor.generateReport();
    results.performanceMonitor = report.apiCalls.length > 0;
    if (!results.performanceMonitor) {
      errors.push('Performance monitor test failed');
    }

    // Test analytics
    analytics.track('test_event', { test: true });
    const sessionStats = analytics.getSessionStats();
    results.analytics = sessionStats.eventCount > 0;
    if (!results.analytics) {
      errors.push('Analytics test failed');
    }

    // Clean up test data
    memoryCache.delete('test_key');
    politicianCache.delete('politician_1');
    searchCache.delete('search_test');
    if (typeof window !== 'undefined') {
      browserCache.remove('browser_test');
    }

    const success = Object.values(results).every(result => result === true);

    return {
      success,
      results,
      errors,
    };
  } catch (error) {
    errors.push(`Infrastructure test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      results,
      errors,
    };
  }
}

// Export for development use
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testInfrastructure = testInfrastructure;
}