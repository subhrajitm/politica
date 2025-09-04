/**
 * Initialize all performance optimizations
 */

import { initializeAssetOptimizations } from './assetOptimization';
import { initializeCodeSplitting } from './codeSplitting';
import { CacheWarmingService } from './cache/cacheWarmingService';

/**
 * Initialize all performance optimizations
 */
export function initializePerformanceOptimizations(): void {
  if (typeof window === 'undefined') return;

  console.log('🚀 Initializing performance optimizations...');

  try {
    // Initialize asset optimizations
    initializeAssetOptimizations();

    // Initialize code splitting optimizations
    initializeCodeSplitting();

    // Start cache warming service
    CacheWarmingService.schedulePeriodicWarmup();

    // Set up performance monitoring
    setupPerformanceMonitoring();

    console.log('✅ Performance optimizations initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize performance optimizations:', error);
  }
}

/**
 * Set up performance monitoring
 */
function setupPerformanceMonitoring(): void {
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('🐌 Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });
        }
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task observer not supported');
    }
  }

  // Monitor unload events for cleanup
  window.addEventListener('beforeunload', () => {
    // Perform any cleanup here
    console.log('🧹 Cleaning up performance monitoring');
  });

  // Monitor visibility changes for performance optimization
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('📱 Page hidden - pausing non-critical operations');
      // Pause non-critical operations
    } else {
      console.log('📱 Page visible - resuming operations');
      // Resume operations
    }
  });
}

/**
 * Performance optimization recommendations
 */
export function getPerformanceRecommendations(): string[] {
  const recommendations: string[] = [];

  // Check if service worker is registered
  if (!('serviceWorker' in navigator)) {
    recommendations.push('Service Worker not supported - offline functionality unavailable');
  }

  // Check connection type
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      recommendations.push('Slow connection detected - consider reducing image quality');
    }
    
    if (connection.saveData) {
      recommendations.push('Data saver mode detected - optimize for minimal data usage');
    }
  }

  // Check memory constraints
  if ('deviceMemory' in navigator) {
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory < 4) {
      recommendations.push('Low memory device detected - reduce cache size and optimize memory usage');
    }
  }

  // Check hardware concurrency
  if (navigator.hardwareConcurrency < 4) {
    recommendations.push('Limited CPU cores detected - optimize heavy computations');
  }

  return recommendations;
}

/**
 * Apply performance optimizations based on device capabilities
 */
export function applyAdaptiveOptimizations(): void {
  const recommendations = getPerformanceRecommendations();
  
  recommendations.forEach(recommendation => {
    console.log('💡 Performance recommendation:', recommendation);
  });

  // Apply optimizations based on device capabilities
  const connection = (navigator as any).connection;
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    // Reduce image quality for slow connections
    document.documentElement.style.setProperty('--image-quality', '60');
  }

  if (connection?.saveData) {
    // Enable data saver mode
    document.documentElement.classList.add('data-saver');
  }

  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) {
    // Reduce cache size for low memory devices
    document.documentElement.classList.add('low-memory');
  }
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializePerformanceOptimizations();
      applyAdaptiveOptimizations();
    });
  } else {
    initializePerformanceOptimizations();
    applyAdaptiveOptimizations();
  }
}