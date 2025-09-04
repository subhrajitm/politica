/**
 * Politician-specific Real-time Events
 * Handles real-time updates for politician data and related notifications
 */

import { eventSystem, RealtimeEvent } from './EventSystem';

export interface PoliticianUpdateEvent {
  politicianId: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  updatedBy: string;
  timestamp: number;
}

export interface PoliticianActivityEvent {
  politicianId: string;
  activityType: 'view' | 'favorite' | 'share' | 'comment';
  userId: string;
  metadata?: Record<string, any>;
}

export interface NewsUpdateEvent {
  politicianId: string;
  newsItem: {
    id: string;
    title: string;
    summary: string;
    source: string;
    publishedAt: number;
  };
}

export interface TrendingUpdateEvent {
  politicianId: string;
  trendingScore: number;
  rank: number;
  category: 'rising' | 'trending' | 'declining';
}

export class PoliticianEventManager {
  private initialized = false;

  /**
   * Initialize politician event system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await eventSystem.initialize();

    // Set up middleware for politician events
    eventSystem.use(this.politicianEventMiddleware.bind(this));

    this.initialized = true;
  }

  /**
   * Emit politician data update event
   */
  async emitPoliticianUpdate(
    politicianId: string,
    changes: PoliticianUpdateEvent['changes'],
    updatedBy: string,
    broadcast = true
  ): Promise<void> {
    const payload: PoliticianUpdateEvent = {
      politicianId,
      changes,
      updatedBy,
      timestamp: Date.now(),
    };

    await eventSystem.emit('politician:updated', payload, {
      broadcast,
      metadata: { politicianId },
    });
  }

  /**
   * Emit politician activity event
   */
  async emitPoliticianActivity(
    politicianId: string,
    activityType: PoliticianActivityEvent['activityType'],
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const payload: PoliticianActivityEvent = {
      politicianId,
      activityType,
      userId,
      metadata,
    };

    await eventSystem.emit('politician:activity', payload, {
      userId,
      broadcast: true,
      metadata: { politicianId, activityType },
    });
  }

  /**
   * Emit news update for politician
   */
  async emitNewsUpdate(
    politicianId: string,
    newsItem: NewsUpdateEvent['newsItem'],
    broadcast = true
  ): Promise<void> {
    const payload: NewsUpdateEvent = {
      politicianId,
      newsItem,
    };

    await eventSystem.emit('politician:news', payload, {
      broadcast,
      metadata: { politicianId },
    });
  }

  /**
   * Emit trending update
   */
  async emitTrendingUpdate(
    politicianId: string,
    trendingScore: number,
    rank: number,
    category: TrendingUpdateEvent['category']
  ): Promise<void> {
    const payload: TrendingUpdateEvent = {
      politicianId,
      trendingScore,
      rank,
      category,
    };

    await eventSystem.emit('politician:trending', payload, {
      broadcast: true,
      metadata: { politicianId, category },
    });
  }

  /**
   * Subscribe to politician updates
   */
  subscribeToPoliticianUpdates(
    politicianId: string,
    handler: (event: PoliticianUpdateEvent) => void
  ): string {
    return eventSystem.subscribe('politician:updated', (event) => {
      handler(event.payload as PoliticianUpdateEvent);
    }, {
      filter: {
        metadata: { politicianId },
      },
    });
  }

  /**
   * Subscribe to politician activity
   */
  subscribeToPoliticianActivity(
    politicianId: string,
    handler: (event: PoliticianActivityEvent) => void,
    activityType?: PoliticianActivityEvent['activityType']
  ): string {
    return eventSystem.subscribe('politician:activity', (event) => {
      handler(event.payload as PoliticianActivityEvent);
    }, {
      filter: {
        metadata: { politicianId },
        condition: activityType 
          ? (event) => (event.payload as PoliticianActivityEvent).activityType === activityType
          : undefined,
      },
    });
  }

  /**
   * Subscribe to news updates
   */
  subscribeToNewsUpdates(
    politicianId: string,
    handler: (event: NewsUpdateEvent) => void
  ): string {
    return eventSystem.subscribe('politician:news', (event) => {
      handler(event.payload as NewsUpdateEvent);
    }, {
      filter: {
        metadata: { politicianId },
      },
    });
  }

  /**
   * Subscribe to trending updates
   */
  subscribeToTrendingUpdates(
    handler: (event: TrendingUpdateEvent) => void,
    category?: TrendingUpdateEvent['category']
  ): string {
    return eventSystem.subscribe('politician:trending', (event) => {
      handler(event.payload as TrendingUpdateEvent);
    }, {
      filter: category ? {
        metadata: { category },
      } : undefined,
    });
  }

  /**
   * Subscribe to all politician events for a specific politician
   */
  subscribeToAllPoliticianEvents(
    politicianId: string,
    handlers: {
      onUpdate?: (event: PoliticianUpdateEvent) => void;
      onActivity?: (event: PoliticianActivityEvent) => void;
      onNews?: (event: NewsUpdateEvent) => void;
      onTrending?: (event: TrendingUpdateEvent) => void;
    }
  ): string[] {
    const subscriptions: string[] = [];

    if (handlers.onUpdate) {
      subscriptions.push(this.subscribeToPoliticianUpdates(politicianId, handlers.onUpdate));
    }

    if (handlers.onActivity) {
      subscriptions.push(this.subscribeToPoliticianActivity(politicianId, handlers.onActivity));
    }

    if (handlers.onNews) {
      subscriptions.push(this.subscribeToNewsUpdates(politicianId, handlers.onNews));
    }

    if (handlers.onTrending) {
      subscriptions.push(this.subscribeToTrendingUpdates(handlers.onTrending));
    }

    return subscriptions;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    return eventSystem.unsubscribe(subscriptionId);
  }

  /**
   * Unsubscribe from multiple events
   */
  unsubscribeAll(subscriptionIds: string[]): void {
    subscriptionIds.forEach(id => this.unsubscribe(id));
  }

  /**
   * Get politician event statistics
   */
  getPoliticianEventStats(politicianId: string): {
    updates: number;
    activities: number;
    news: number;
    trending: number;
  } {
    const history = eventSystem.getHistory();
    
    const politicianEvents = history.filter(event => 
      event.metadata?.politicianId === politicianId
    );

    return {
      updates: politicianEvents.filter(e => e.type === 'politician:updated').length,
      activities: politicianEvents.filter(e => e.type === 'politician:activity').length,
      news: politicianEvents.filter(e => e.type === 'politician:news').length,
      trending: politicianEvents.filter(e => e.type === 'politician:trending').length,
    };
  }

  /**
   * Middleware for politician events
   */
  private politicianEventMiddleware(event: RealtimeEvent, next: () => void): void {
    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    // Add politician-specific metadata
    if (event.type.startsWith('politician:')) {
      const payload = event.payload as any;
      if (payload.politicianId && !event.metadata?.politicianId) {
        event.metadata = {
          ...event.metadata,
          politicianId: payload.politicianId,
        };
      }
    }

    // Log important events
    if (['politician:updated', 'politician:news'].includes(event.type)) {
      console.log(`Politician event: ${event.type}`, {
        id: event.id,
        politicianId: event.metadata?.politicianId,
        timestamp: new Date(event.timestamp).toISOString(),
      });
    }

    next();
  }
}

// Singleton instance
export const politicianEventManager = new PoliticianEventManager();