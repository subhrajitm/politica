/**
 * Code splitting utilities and dynamic imports
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { performanceMonitor } from './monitoring/performanceMonitor';

/**
 * Enhanced lazy loading with performance tracking
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): LazyExoticComponent<T> {
  return lazy(async () => {
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Track component loading performance
      performanceMonitor.trackUserInteraction(
        'component_load',
        loadTime,
        componentName
      );
      
      console.log(`📦 Loaded component "${componentName}" in ${loadTime.toFixed(2)}ms`);
      
      return module;
    } catch (error) {
      console.error(`❌ Failed to load component "${componentName}":`, error);
      throw error;
    }
  });
}

/**
 * Preload components for better performance
 */
export function preloadComponent(importFn: () => Promise<any>): Promise<any> {
  return importFn().catch(error => {
    console.warn('Failed to preload component:', error);
  });
}

/**
 * Route-based code splitting configuration
 */
export const ROUTE_COMPONENTS = {
  // Admin routes
  AdminSettings: () => createLazyComponent(
    () => import('../app/admin/settings/page'),
    'AdminSettings'
  ),
  AdminErrors: () => createLazyComponent(
    () => import('../app/admin/errors/page'),
    'AdminErrors'
  ),
  
  // PWA routes
  OfflinePage: () => createLazyComponent(
    () => import('../app/offline/page'),
    'OfflinePage'
  ),
};

/**
 * Feature-based code splitting
 */
export const FEATURE_COMPONENTS = {
  // Admin components
  CacheMonitoringDashboard: () => createLazyComponent(
    () => import('../components/admin/CacheMonitoringDashboard'),
    'CacheMonitoringDashboard'
  ),
  PerformanceDashboard: () => createLazyComponent(
    () => import('../components/admin/PerformanceDashboard'),
    'PerformanceDashboard'
  ),
  
  // PWA components
  PWAInstallBanner: () => createLazyComponent(
    () => import('../components/pwa/PWAInstallBanner'),
    'PWAInstallBanner'
  ),
  PWAUpdateNotification: () => createLazyComponent(
    () => import('../components/pwa/PWAUpdateNotification'),
    'PWAUpdateNotification'
  ),
  OfflineIndicator: () => createLazyComponent(
    () => import('../components/pwa/OfflineIndicator'),
    'OfflineIndicator'
  ),
  
  // Mobile components
  MobileNavigation: () => createLazyComponent(
    () => import('../components/mobile/MobileNavigation'),
    'MobileNavigation'
  ),
  MobileSearch: () => createLazyComponent(
    () => import('../components/mobile/MobileSearch'),
    'MobileSearch'
  ),
  
  // Search components
  IntelligentSearchInterface: () => createLazyComponent(
    () => import('../components/search/IntelligentSearchInterface'),
    'IntelligentSearchInterface'
  ),
  AutocompleteSearch: () => createLazyComponent(
    () => import('../components/search/AutocompleteSearch'),
    'AutocompleteSearch'
  ),
  
  // Realtime components
  RealtimeDemo: () => createLazyComponent(
    () => import('../components/realtime/RealtimeDemo'),
    'RealtimeDemo'
  ),
  NotificationCenter: () => createLazyComponent(
    () => import('../components/realtime/NotificationCenter'),
    'NotificationCenter'
  ),
};

/**
 * Utility-based code splitting
 */
export const UTILITY_MODULES = {
  // Heavy utilities
  assetOptimization: () => import('../lib/assetOptimization'),
  cdn: () => import('../lib/cdn'),
  
  // PWA utilities
  pwaManager: () => import('../lib/pwa/PWAManager'),
  offlineManager: () => import('../lib/pwa/OfflineManager'),
  backgroundSyncService: () => import('../lib/pwa/BackgroundSyncService'),
  
  // Monitoring utilities
  errorTracker: () => import('../lib/monitoring/ErrorTracker'),
  performanceMonitor: () => import('../lib/monitoring/performanceMonitor'),
  
  // Cache utilities
  cacheManager: () => import('../lib/cache/cacheManager'),
  cacheService: () => import('../lib/cache/cacheService'),
  
  // Search utilities
  searchService: () => import('../lib/searchService'),
  nlpProcessor: () => import('../lib/nlpProcessor'),
  recommendationEngine: () => import('../lib/recommendationEngine'),
};

/**
 * Preload strategy for critical routes
 */
export class PreloadStrategy {
  private static preloadedRoutes = new Set<string>();
  
  /**
   * Preload components based on user behavior
   */
  static async preloadOnHover(componentKey: keyof typeof ROUTE_COMPONENTS): Promise<void> {
    if (this.preloadedRoutes.has(componentKey)) return;
    
    try {
      const component = ROUTE_COMPONENTS[componentKey]();
      await preloadComponent(() => Promise.resolve({ default: component }));
      this.preloadedRoutes.add(componentKey);
    } catch (error) {
      console.warn(`Failed to preload ${componentKey}:`, error);
    }
  }
  
  /**
   * Preload components on idle
   */
  static preloadOnIdle(componentKeys: Array<keyof typeof ROUTE_COMPONENTS>): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        componentKeys.forEach(key => this.preloadOnHover(key));
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        componentKeys.forEach(key => this.preloadOnHover(key));
      }, 2000);
    }
  }
  
  /**
   * Preload based on route prediction
   */
  static preloadPredictedRoutes(currentRoute: string): void {
    const predictions = this.getPredictedRoutes(currentRoute);
    this.preloadOnIdle(predictions);
  }
  
  private static getPredictedRoutes(currentRoute: string): Array<keyof typeof ROUTE_COMPONENTS> {
    const routePredictions: Record<string, Array<keyof typeof ROUTE_COMPONENTS>> = {
      '/admin': ['AdminSettings', 'AdminErrors'],
      '/admin/settings': ['AdminErrors'],
      '/offline': ['OfflinePage'],
    };
    
    return routePredictions[currentRoute] || [];
  }
}

/**
 * Bundle analyzer helper
 */
export class BundleAnalyzer {
  /**
   * Track bundle sizes and loading times
   */
  static trackBundleLoad(bundleName: string, size: number, loadTime: number): void {
    const data = {
      bundleName,
      size,
      loadTime,
      timestamp: new Date(),
      url: window.location.href,
    };
    
    performanceMonitor.trackUserInteraction(
      'bundle_load',
      loadTime,
      bundleName
    );
    
    // Store bundle analytics
    this.storeBundleAnalytics(data);
    
    // Warn about large bundles
    if (size > 500 * 1024) { // 500KB
      console.warn(`📦 Large bundle detected: ${bundleName} (${(size / 1024).toFixed(2)}KB)`);
    }
    
    // Warn about slow loading bundles
    if (loadTime > 1000) { // 1 second
      console.warn(`🐌 Slow bundle load: ${bundleName} (${loadTime.toFixed(2)}ms)`);
    }
  }
  
  private static storeBundleAnalytics(data: any): void {
    try {
      const key = 'pf_bundle_analytics';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(data);
      
      // Keep only the last 100 entries
      const toStore = existing.slice(0, 100);
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to store bundle analytics:', error);
    }
  }
  
  /**
   * Get bundle analytics report
   */
  static getBundleReport(): any[] {
    try {
      return JSON.parse(localStorage.getItem('pf_bundle_analytics') || '[]');
    } catch (error) {
      console.warn('Failed to get bundle report:', error);
      return [];
    }
  }
}

/**
 * Dynamic import with retry logic
 */
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Dynamic import failed (attempt ${i + 1}/${maxRetries}):`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Initialize code splitting optimizations
 */
export function initializeCodeSplitting(): void {
  if (typeof window === 'undefined') return;
  
  // Preload critical components on idle
  PreloadStrategy.preloadOnIdle(['AdminSettings', 'OfflinePage']);
  
  // Set up route-based preloading
  const currentRoute = window.location.pathname;
  PreloadStrategy.preloadPredictedRoutes(currentRoute);
  
  // Monitor bundle performance
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('chunk') || entry.name.includes('bundle')) {
        BundleAnalyzer.trackBundleLoad(
          entry.name,
          (entry as any).transferSize || 0,
          entry.duration
        );
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
  
  console.log('🚀 Code splitting optimizations initialized');
}