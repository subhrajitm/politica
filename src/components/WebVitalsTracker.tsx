/**
 * Web Vitals tracking component for Core Web Vitals monitoring
 */

'use client';

import { useEffect } from 'react';
import { performanceMonitor } from '../lib/monitoring/performanceMonitor';

interface WebVitalsTrackerProps {
  reportWebVitals?: (metric: any) => void;
  enableConsoleLogging?: boolean;
  enableAnalytics?: boolean;
}

export function WebVitalsTracker({
  reportWebVitals,
  enableConsoleLogging = true,
  enableAnalytics = true,
}: WebVitalsTrackerProps = {}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Import web-vitals library dynamically
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const handleMetric = (metric: any) => {
        // Log to console if enabled
        if (enableConsoleLogging) {
          console.log(`📊 ${metric.name}:`, metric.value, metric);
        }

        // Send to performance monitor
        performanceMonitor.trackPageLoad(window.location.pathname, {
          [metric.name]: metric.value,
        });

        // Send to analytics if enabled
        if (enableAnalytics && typeof gtag !== 'undefined') {
          gtag('event', metric.name, {
            event_category: 'Web Vitals',
            event_label: metric.id,
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            non_interaction: true,
          });
        }

        // Custom reporting function
        reportWebVitals?.(metric);

        // Store in localStorage for analysis
        storeWebVital(metric);
      };

      // Track all Core Web Vitals
      getCLS(handleMetric);
      getFID(handleMetric);
      getFCP(handleMetric);
      getLCP(handleMetric);
      getTTFB(handleMetric);
    }).catch(error => {
      console.warn('Failed to load web-vitals library:', error);
    });
  }, [reportWebVitals, enableConsoleLogging, enableAnalytics]);

  return null; // This component doesn't render anything
}

/**
 * Store Web Vital metric in localStorage
 */
function storeWebVital(metric: any): void {
  try {
    const key = 'pf_web_vitals';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    const vitalData = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: getVitalRating(metric.name, metric.value),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType,
    };
    
    existing.unshift(vitalData);
    
    // Keep only the last 100 entries
    const toStore = existing.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(toStore));
  } catch (error) {
    console.warn('Failed to store Web Vital:', error);
  }
}

/**
 * Get rating for Web Vital metric
 */
function getVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Hook for accessing Web Vitals data
 */
export function useWebVitals() {
  const getStoredVitals = () => {
    try {
      return JSON.parse(localStorage.getItem('pf_web_vitals') || '[]');
    } catch (error) {
      console.warn('Failed to get stored Web Vitals:', error);
      return [];
    }
  };

  const clearStoredVitals = () => {
    try {
      localStorage.removeItem('pf_web_vitals');
    } catch (error) {
      console.warn('Failed to clear stored Web Vitals:', error);
    }
  };

  const getVitalsReport = () => {
    const vitals = getStoredVitals();
    const report: Record<string, any> = {};

    vitals.forEach((vital: any) => {
      if (!report[vital.name]) {
        report[vital.name] = {
          name: vital.name,
          values: [],
          average: 0,
          latest: null,
          rating: 'good',
        };
      }

      report[vital.name].values.push(vital.value);
      if (!report[vital.name].latest || vital.timestamp > report[vital.name].latest.timestamp) {
        report[vital.name].latest = vital;
      }
    });

    // Calculate averages and ratings
    Object.values(report).forEach((metric: any) => {
      metric.average = metric.values.reduce((sum: number, val: number) => sum + val, 0) / metric.values.length;
      metric.rating = getVitalRating(metric.name, metric.average);
    });

    return report;
  };

  return {
    getStoredVitals,
    clearStoredVitals,
    getVitalsReport,
  };
}

/**
 * Performance budget checker component
 */
export function PerformanceBudgetChecker() {
  useEffect(() => {
    const checkBudget = () => {
      const budget = performanceMonitor.checkPerformanceBudget();
      
      if (!budget.passed) {
        console.warn('⚠️ Performance budget violations:', budget.violations);
        
        // You could send this to an analytics service or error tracking
        budget.violations.forEach(violation => {
          console.warn(`📊 Budget violation: ${violation}`);
        });
      } else {
        console.log('✅ Performance budget passed');
      }
    };

    // Check budget after page load
    if (document.readyState === 'complete') {
      setTimeout(checkBudget, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkBudget, 1000);
      });
    }
  }, []);

  return null;
}

/**
 * Real-time performance monitor component
 */
export function RealTimePerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Log low FPS
        if (fps < 30) {
          console.warn(`🐌 Low FPS detected: ${fps}`);
        }
        
        // Store FPS data
        try {
          const fpsData = {
            fps,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          };
          
          const key = 'pf_fps_data';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.unshift(fpsData);
          
          // Keep only the last 50 entries
          const toStore = existing.slice(0, 50);
          localStorage.setItem(key, JSON.stringify(toStore));
        } catch (error) {
          console.warn('Failed to store FPS data:', error);
        }
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Monitor memory usage
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        
        // Warn about high memory usage
        if (usedMB > 100) {
          console.warn(`🧠 High memory usage: ${usedMB}MB / ${totalMB}MB`);
        }
      }
    };

    const memoryInterval = setInterval(monitorMemory, 30000); // Check every 30 seconds

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return null;
}