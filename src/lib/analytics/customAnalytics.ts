export interface AnalyticsEvent {
  eventId: string;
  eventType: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  context: EventContext;
}

export interface EventContext {
  page: string;
  userAgent: string;
  referrer: string;
  viewport: {
    width: number;
    height: number;
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
  };
}

export interface AnalyticsConfig {
  enableConsoleLogging?: boolean;
  enableLocalStorage?: boolean;
  batchSize?: number;
  flushInterval?: number; // in milliseconds
}

export class CustomAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private config: AnalyticsConfig;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: AnalyticsConfig = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableLocalStorage: true,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    this.sessionId = this.generateSessionId();
    
    if (typeof window !== 'undefined') {
      this.startFlushTimer();
      this.setupPageUnloadHandler();
    }
  }

  track(eventType: string, properties: Record<string, any> = {}, userId?: string): void {
    const event: AnalyticsEvent = {
      eventId: this.generateEventId(),
      eventType,
      userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      properties,
      context: this.getEventContext(),
    };

    this.events.push(event);

    if (this.config.enableConsoleLogging) {
      console.log('📈 Analytics Event:', event);
    }

    // Auto-flush if batch size is reached
    if (this.events.length >= (this.config.batchSize || 50)) {
      this.flush();
    }
  }

  // Convenience methods for common events
  trackPageView(page: string, userId?: string): void {
    this.track('page_view', { page }, userId);
  }

  trackUserAction(action: string, target?: string, userId?: string): void {
    this.track('user_action', { action, target }, userId);
  }

  trackSearch(query: string, results: number, userId?: string): void {
    this.track('search', { query, results }, userId);
  }

  trackPoliticianView(politicianId: string, politicianName: string, userId?: string): void {
    this.track('politician_view', { politicianId, politicianName }, userId);
  }

  trackFavorite(politicianId: string, action: 'add' | 'remove', userId?: string): void {
    this.track('favorite', { politicianId, action }, userId);
  }

  trackError(error: string, severity: string, context?: Record<string, any>): void {
    this.track('error', { error, severity, ...context });
  }

  trackPerformance(metric: string, value: number, context?: Record<string, any>): void {
    this.track('performance', { metric, value, ...context });
  }

  private getEventContext(): EventContext {
    if (typeof window === 'undefined') {
      return {} as EventContext;
    }

    return {
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      device: this.getDeviceInfo(),
    };
  }

  private getDeviceInfo(): EventContext['device'] {
    if (typeof window === 'undefined') {
      return { type: 'desktop', os: 'unknown', browser: 'unknown' };
    }

    const userAgent = navigator.userAgent;
    
    // Device type detection
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad|Android(?!.*Mobile)/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // OS detection
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Browser detection
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return { type: deviceType, os, browser };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private setupPageUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Also flush on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  flush(): void {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    if (this.config.enableLocalStorage) {
      this.persistEvents(eventsToFlush);
    }

    // In a real implementation, you would send these to your analytics backend
    console.log('📊 Flushing analytics events:', eventsToFlush.length);
  }

  private persistEvents(events: AnalyticsEvent[]): void {
    if (typeof window === 'undefined') return;

    try {
      const existingEvents = JSON.parse(
        localStorage.getItem('pf_analytics_events') || '[]'
      );
      
      const allEvents = [...events, ...existingEvents];
      
      // Keep only the last 500 events
      const eventsToStore = allEvents.slice(0, 500);
      
      localStorage.setItem('pf_analytics_events', JSON.stringify(eventsToStore));
    } catch (error) {
      console.warn('Failed to persist analytics events:', error);
    }
  }

  getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('pf_analytics_events') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve stored analytics events:', error);
      return [];
    }
  }

  clearStoredEvents(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pf_analytics_events');
    }
    this.events = [];
  }

  getSessionStats(): {
    sessionId: string;
    eventCount: number;
    sessionDuration: number;
    pageViews: number;
    userActions: number;
  } {
    const storedEvents = this.getStoredEvents();
    const sessionEvents = storedEvents.filter(event => event.sessionId === this.sessionId);
    
    const pageViews = sessionEvents.filter(event => event.eventType === 'page_view').length;
    const userActions = sessionEvents.filter(event => event.eventType === 'user_action').length;
    
    const firstEvent = sessionEvents[sessionEvents.length - 1];
    const lastEvent = sessionEvents[0];
    
    const sessionDuration = firstEvent && lastEvent 
      ? new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()
      : 0;

    return {
      sessionId: this.sessionId,
      eventCount: sessionEvents.length,
      sessionDuration,
      pageViews,
      userActions,
    };
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Global analytics instance
export const analytics = new CustomAnalytics({
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  batchSize: 25,
  flushInterval: 30000,
});

// Auto-track page views
if (typeof window !== 'undefined') {
  // Track initial page view
  analytics.trackPageView(window.location.pathname);
  
  // Track page views on navigation (for SPA)
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      analytics.trackPageView(currentPath);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}