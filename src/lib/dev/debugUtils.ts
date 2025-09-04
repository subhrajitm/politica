import { errorLogger } from '../monitoring/errorHandler';
import { performanceMonitor } from '../monitoring/performanceMonitor';
import { analytics } from '../analytics/customAnalytics';
import { memoryCache, politicianCache, searchCache } from '../cache/cacheManager';
import { browserCache, sessionCache } from '../cache/browserCache';

// Development utilities for debugging and monitoring
export class DevUtils {
  static logSystemStatus(): void {
    if (process.env.NODE_ENV !== 'development') return;

    console.group('🔧 System Status');
    
    // Cache status
    console.group('💾 Cache Status');
    console.log('Memory Cache:', memoryCache.getStats());
    console.log('Politician Cache:', politicianCache.getStats());
    console.log('Search Cache:', searchCache.getStats());
    console.log('Browser Cache Size:', browserCache.size());
    console.log('Session Cache Size:', sessionCache.size());
    console.groupEnd();

    // Error status
    console.group('🚨 Error Status');
    console.log('Error Stats:', errorLogger.getStats());
    console.log('Unresolved Errors:', errorLogger.getUnresolvedLogs().length);
    console.groupEnd();

    // Performance status
    console.group('📊 Performance Status');
    const report = performanceMonitor.generateReport();
    console.log('Web Vitals:', report.webVitals);
    console.log('Recent API Calls:', report.apiCalls.slice(0, 5));
    console.log('Performance Budget:', performanceMonitor.checkPerformanceBudget());
    console.groupEnd();

    // Analytics status
    console.group('📈 Analytics Status');
    console.log('Session Stats:', analytics.getSessionStats());
    console.log('Stored Events:', analytics.getStoredEvents().length);
    console.groupEnd();

    console.groupEnd();
  }

  static clearAllData(): void {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('🧹 Clearing all development data...');
    
    // Clear caches
    memoryCache.clear();
    politicianCache.clear();
    searchCache.clear();
    browserCache.clear();
    sessionCache.clear();

    // Clear error logs
    errorLogger.clearLogs();

    // Clear performance data
    performanceMonitor.clearData();

    // Clear analytics
    analytics.clearStoredEvents();

    console.log('✅ All development data cleared');
  }

  static simulateError(severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    if (process.env.NODE_ENV !== 'development') return;

    const { AppError, ErrorSeverity } = require('../monitoring/errorHandler');
    
    const severityMap = {
      low: ErrorSeverity.LOW,
      medium: ErrorSeverity.MEDIUM,
      high: ErrorSeverity.HIGH,
      critical: ErrorSeverity.CRITICAL,
    };

    const error = new AppError(
      `Simulated ${severity} error for testing`,
      'SIMULATED_ERROR',
      severityMap[severity],
      {
        component: 'DevUtils',
        action: 'simulate_error',
        metadata: { simulated: true },
      }
    );

    errorLogger.log(error);
    console.log(`🎭 Simulated ${severity} error`);
  }

  static simulateSlowAPI(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const startTime = Date.now();
    setTimeout(() => {
      const duration = Date.now() - startTime + 3000; // Simulate 3+ second delay
      performanceMonitor.trackAPICall('/api/slow-endpoint', duration, 200, 'GET');
      console.log('🐌 Simulated slow API call');
    }, 100);
  }

  static trackTestEvent(): void {
    if (process.env.NODE_ENV !== 'development') return;

    analytics.track('dev_test_event', {
      timestamp: new Date().toISOString(),
      random: Math.random(),
    });
    console.log('📊 Tracked test analytics event');
  }

  static exportDebugData(): string {
    if (process.env.NODE_ENV !== 'development') return '';

    const debugData = {
      timestamp: new Date().toISOString(),
      cacheStats: {
        memory: memoryCache.getStats(),
        politician: politicianCache.getStats(),
        search: searchCache.getStats(),
        browser: browserCache.size(),
        session: sessionCache.size(),
      },
      errorStats: errorLogger.getStats(),
      performanceReport: performanceMonitor.generateReport(),
      analyticsStats: analytics.getSessionStats(),
      storedEvents: analytics.getStoredEvents().slice(0, 10), // Last 10 events
    };

    const dataStr = JSON.stringify(debugData, null, 2);
    console.log('📋 Debug data exported to console');
    return dataStr;
  }
}

// Make DevUtils available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).DevUtils = DevUtils;
  console.log('🔧 DevUtils available globally. Try DevUtils.logSystemStatus()');
}