export interface WebVitals {
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  TTFB?: number; // Time to First Byte
}

export interface PerformanceMetrics {
  pageLoad: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
}

export interface APICallMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: Date;
  size?: number;
}

export interface UserInteractionMetrics {
  action: string;
  element?: string;
  duration: number;
  timestamp: Date;
  page: string;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceReport {
  pageMetrics: PerformanceMetrics;
  apiCalls: APICallMetrics[];
  userInteractions: UserInteractionMetrics[];
  webVitals: WebVitals;
  resourceTiming: PerformanceResourceTiming[];
  memoryUsage?: MemoryInfo;
}

export class PerformanceMonitor {
  private apiCalls: APICallMetrics[] = [];
  private userInteractions: UserInteractionMetrics[] = [];
  private webVitals: WebVitals = {};
  private maxEntries = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeNavigationTiming();
      this.initializeResourceTiming();
    }
  }

  private initializeWebVitals(): void {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.webVitals.LCP = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.webVitals.FID = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.webVitals.CLS = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // First Contentful Paint
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.webVitals.FCP = entry.startTime;
        }
      });
    }
  }

  private initializeNavigationTiming(): void {
    if ('performance' in window && 'timing' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = performance.timing;
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            this.webVitals.TTFB = navigation.responseStart - navigation.requestStart;
          }
        }, 0);
      });
    }
  }

  private initializeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        // Store resource timing data for analysis
        this.persistResourceTiming(entries as PerformanceResourceTiming[]);
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  trackPageLoad(page: string, metrics: WebVitals): void {
    const performanceData = {
      page,
      metrics,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection,
    };

    this.persistPerformanceData('page_load', performanceData);
    console.log('📊 Page Load Metrics:', performanceData);
  }

  trackAPICall(endpoint: string, duration: number, status: number, method: string = 'GET', size?: number): void {
    const apiCall: APICallMetrics = {
      endpoint,
      method,
      duration,
      status,
      timestamp: new Date(),
      size,
    };

    this.apiCalls.unshift(apiCall);
    
    // Keep only recent API calls
    if (this.apiCalls.length > this.maxEntries) {
      this.apiCalls = this.apiCalls.slice(0, this.maxEntries);
    }

    // Log slow API calls
    if (duration > 2000) {
      console.warn('🐌 Slow API call detected:', apiCall);
    }

    this.persistPerformanceData('api_call', apiCall);
  }

  trackUserInteraction(action: string, duration: number, element?: string): void {
    const interaction: UserInteractionMetrics = {
      action,
      element,
      duration,
      timestamp: new Date(),
      page: window.location.pathname,
    };

    this.userInteractions.unshift(interaction);
    
    // Keep only recent interactions
    if (this.userInteractions.length > this.maxEntries) {
      this.userInteractions = this.userInteractions.slice(0, this.maxEntries);
    }

    // Log slow interactions
    if (duration > 100) {
      console.warn('🐌 Slow interaction detected:', interaction);
    }

    this.persistPerformanceData('user_interaction', interaction);
  }

  generateReport(): PerformanceReport {
    const pageMetrics = this.getPageMetrics();
    const resourceTiming = this.getResourceTiming();
    const memoryUsage = this.getMemoryUsage();

    return {
      pageMetrics,
      apiCalls: [...this.apiCalls],
      userInteractions: [...this.userInteractions],
      webVitals: { ...this.webVitals },
      resourceTiming,
      memoryUsage,
    };
  }

  private getPageMetrics(): PerformanceMetrics {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return {} as PerformanceMetrics;
    }

    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.webVitals.FCP || 0,
      largestContentfulPaint: this.webVitals.LCP,
      firstInputDelay: this.webVitals.FID,
      cumulativeLayoutShift: this.webVitals.CLS,
      timeToInteractive: navigation ? navigation.domInteractive - navigation.fetchStart : undefined,
    };
  }

  private getFirstPaint(): number {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint?.startTime || 0;
    }
    return 0;
  }

  private getResourceTiming(): PerformanceResourceTiming[] {
    if ('performance' in window && 'getEntriesByType' in performance) {
      return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    }
    return [];
  }

  private getMemoryUsage(): MemoryInfo | undefined {
    if ('performance' in window && 'memory' in performance) {
      return (performance as any).memory;
    }
    return undefined;
  }

  private persistPerformanceData(type: string, data: any): void {
    if (typeof window === 'undefined') return;

    try {
      const key = `pf_perf_${type}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift({ ...data, id: Date.now() });
      
      // Keep only the last 50 entries per type
      const toStore = existing.slice(0, 50);
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to persist performance data:', error);
    }
  }

  private persistResourceTiming(entries: PerformanceResourceTiming[]): void {
    // Analyze resource timing for optimization opportunities
    entries.forEach(entry => {
      const duration = entry.responseEnd - entry.requestStart;
      
      // Flag slow resources
      if (duration > 1000) {
        console.warn('🐌 Slow resource detected:', {
          name: entry.name,
          duration,
          size: entry.transferSize,
          type: entry.initiatorType,
        });
      }
    });
  }

  // Performance budget monitoring
  checkPerformanceBudget(): {
    passed: boolean;
    violations: string[];
  } {
    const violations: string[] = [];
    const metrics = this.getPageMetrics();

    // Performance budget thresholds
    const budgets = {
      pageLoad: 3000, // 3 seconds
      firstContentfulPaint: 1500, // 1.5 seconds
      largestContentfulPaint: 2500, // 2.5 seconds
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1, // 0.1
    };

    if (metrics.pageLoad > budgets.pageLoad) {
      violations.push(`Page load time (${metrics.pageLoad}ms) exceeds budget (${budgets.pageLoad}ms)`);
    }

    if (metrics.firstContentfulPaint > budgets.firstContentfulPaint) {
      violations.push(`FCP (${metrics.firstContentfulPaint}ms) exceeds budget (${budgets.firstContentfulPaint}ms)`);
    }

    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > budgets.largestContentfulPaint) {
      violations.push(`LCP (${metrics.largestContentfulPaint}ms) exceeds budget (${budgets.largestContentfulPaint}ms)`);
    }

    if (metrics.firstInputDelay && metrics.firstInputDelay > budgets.firstInputDelay) {
      violations.push(`FID (${metrics.firstInputDelay}ms) exceeds budget (${budgets.firstInputDelay}ms)`);
    }

    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > budgets.cumulativeLayoutShift) {
      violations.push(`CLS (${metrics.cumulativeLayoutShift}) exceeds budget (${budgets.cumulativeLayoutShift})`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  clearData(): void {
    this.apiCalls = [];
    this.userInteractions = [];
    this.webVitals = {};

    if (typeof window !== 'undefined') {
      const keys = ['pf_perf_page_load', 'pf_perf_api_call', 'pf_perf_user_interaction'];
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-track page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.trackPageLoad(window.location.pathname, performanceMonitor['webVitals']);
    }, 1000);
  });
}