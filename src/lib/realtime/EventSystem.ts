/**
 * Real-time Event System
 * Implements event-driven architecture with pub/sub patterns for real-time updates
 */

import { WebSocketManager } from './WebSocketManager';
import { connectionPool } from './ConnectionPool';

export interface RealtimeEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  broadcast: boolean;
  metadata?: Record<string, any>;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  filter?: EventFilter;
  priority: number;
}

export interface EventFilter {
  userId?: string;
  metadata?: Record<string, any>;
  condition?: (event: RealtimeEvent) => boolean;
}

export type EventHandler = (event: RealtimeEvent) => void | Promise<void>;
export type EventMiddleware = (event: RealtimeEvent, next: () => void) => void;

export interface EventSystemConfig {
  wsUrl?: string;
  enablePersistence?: boolean;
  maxEventHistory?: number;
  retryAttempts?: number;
  batchSize?: number;
}

export class EventSystem {
  private wsManager: WebSocketManager | null = null;
  private subscriptions: Map<string, Set<EventSubscription>> = new Map();
  private eventHistory: RealtimeEvent[] = [];
  private middleware: EventMiddleware[] = [];
  private config: Required<EventSystemConfig>;
  private subscriptionCounter = 0;
  private isConnected = false;

  constructor(config: EventSystemConfig = {}) {
    this.config = {
      wsUrl: config.wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      enablePersistence: config.enablePersistence ?? true,
      maxEventHistory: config.maxEventHistory || 1000,
      retryAttempts: config.retryAttempts || 3,
      batchSize: config.batchSize || 10,
    };
  }

  /**
   * Initialize the event system
   */
  async initialize(): Promise<void> {
    try {
      this.wsManager = await connectionPool.getConnection(this.config.wsUrl, ['events']);
      
      // Subscribe to all real-time events
      this.wsManager.subscribe('event', this.handleIncomingEvent.bind(this));
      this.wsManager.subscribe('batch_events', this.handleBatchEvents.bind(this));
      
      // Monitor connection status
      this.wsManager.onConnectionChange((health) => {
        this.isConnected = health.isConnected;
        if (health.isConnected) {
          this.emit('system:connected', {});
        } else {
          this.emit('system:disconnected', {});
        }
      });

      this.isConnected = this.wsManager.getHealth().isConnected;
      
    } catch (error) {
      console.error('Failed to initialize event system:', error);
      throw error;
    }
  }

  /**
   * Subscribe to events
   */
  subscribe(
    eventType: string, 
    handler: EventHandler, 
    options: { filter?: EventFilter; priority?: number } = {}
  ): string {
    const subscription: EventSubscription = {
      id: `sub_${++this.subscriptionCounter}`,
      eventType,
      handler,
      filter: options.filter,
      priority: options.priority || 0,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }

    this.subscriptions.get(eventType)!.add(subscription);

    // Sort by priority (higher priority first)
    const sortedSubscriptions = Array.from(this.subscriptions.get(eventType)!)
      .sort((a, b) => b.priority - a.priority);
    
    this.subscriptions.set(eventType, new Set(sortedSubscriptions));

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.subscriptions) {
      for (const subscription of subscriptions) {
        if (subscription.id === subscriptionId) {
          subscriptions.delete(subscription);
          if (subscriptions.size === 0) {
            this.subscriptions.delete(eventType);
          }
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Emit an event
   */
  async emit(eventType: string, payload: any, options: {
    userId?: string;
    broadcast?: boolean;
    metadata?: Record<string, any>;
  } = {}): Promise<void> {
    const event: RealtimeEvent = {
      id: this.generateEventId(),
      type: eventType,
      payload,
      timestamp: Date.now(),
      userId: options.userId,
      broadcast: options.broadcast ?? false,
      metadata: options.metadata,
    };

    // Store in history if persistence is enabled
    if (this.config.enablePersistence) {
      this.addToHistory(event);
    }

    // Process through middleware
    await this.processMiddleware(event);

    // Handle locally
    await this.handleEvent(event);

    // Broadcast if requested and connected
    if (event.broadcast && this.isConnected && this.wsManager) {
      this.wsManager.send('event', event);
    }
  }

  /**
   * Emit multiple events in a batch
   */
  async emitBatch(events: Array<{
    type: string;
    payload: any;
    options?: {
      userId?: string;
      broadcast?: boolean;
      metadata?: Record<string, any>;
    };
  }>): Promise<void> {
    const realtimeEvents: RealtimeEvent[] = events.map(({ type, payload, options = {} }) => ({
      id: this.generateEventId(),
      type,
      payload,
      timestamp: Date.now(),
      userId: options.userId,
      broadcast: options.broadcast ?? false,
      metadata: options.metadata,
    }));

    // Process each event
    for (const event of realtimeEvents) {
      if (this.config.enablePersistence) {
        this.addToHistory(event);
      }
      await this.processMiddleware(event);
      await this.handleEvent(event);
    }

    // Broadcast batch if any events need broadcasting
    const broadcastEvents = realtimeEvents.filter(e => e.broadcast);
    if (broadcastEvents.length > 0 && this.isConnected && this.wsManager) {
      this.wsManager.send('batch_events', broadcastEvents);
    }
  }

  /**
   * Add middleware
   */
  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Get event history
   */
  getHistory(eventType?: string, limit?: number): RealtimeEvent[] {
    let history = this.eventHistory;
    
    if (eventType) {
      history = history.filter(event => event.type === eventType);
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return [...history];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get subscription statistics
   */
  getStats(): {
    totalSubscriptions: number;
    eventTypes: string[];
    historySize: number;
    isConnected: boolean;
  } {
    const totalSubscriptions = Array.from(this.subscriptions.values())
      .reduce((sum, subs) => sum + subs.size, 0);
    
    return {
      totalSubscriptions,
      eventTypes: Array.from(this.subscriptions.keys()),
      historySize: this.eventHistory.length,
      isConnected: this.isConnected,
    };
  }

  /**
   * Handle incoming WebSocket events
   */
  private async handleIncomingEvent(eventData: RealtimeEvent): Promise<void> {
    if (this.config.enablePersistence) {
      this.addToHistory(eventData);
    }
    
    await this.processMiddleware(eventData);
    await this.handleEvent(eventData);
  }

  /**
   * Handle batch events from WebSocket
   */
  private async handleBatchEvents(events: RealtimeEvent[]): Promise<void> {
    for (const event of events) {
      await this.handleIncomingEvent(event);
    }
  }

  /**
   * Handle a single event
   */
  private async handleEvent(event: RealtimeEvent): Promise<void> {
    const subscriptions = this.subscriptions.get(event.type);
    if (!subscriptions) return;

    const promises: Promise<void>[] = [];

    for (const subscription of subscriptions) {
      // Apply filter if present
      if (subscription.filter && !this.matchesFilter(event, subscription.filter)) {
        continue;
      }

      // Execute handler
      const promise = this.executeHandler(subscription.handler, event);
      promises.push(promise);
    }

    // Wait for all handlers to complete
    await Promise.allSettled(promises);
  }

  /**
   * Process event through middleware
   */
  private async processMiddleware(event: RealtimeEvent): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= this.middleware.length) return;
      
      const middleware = this.middleware[index++];
      await middleware(event, next);
    };

    await next();
  }

  /**
   * Execute event handler with error handling
   */
  private async executeHandler(handler: EventHandler, event: RealtimeEvent): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      console.error('Error in event handler:', error);
      // Emit error event
      this.emit('system:handler_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventType: event.type,
        eventId: event.id,
      });
    }
  }

  /**
   * Check if event matches filter
   */
  private matchesFilter(event: RealtimeEvent, filter: EventFilter): boolean {
    if (filter.userId && event.userId !== filter.userId) {
      return false;
    }

    if (filter.metadata) {
      for (const [key, value] of Object.entries(filter.metadata)) {
        if (event.metadata?.[key] !== value) {
          return false;
        }
      }
    }

    if (filter.condition && !filter.condition(event)) {
      return false;
    }

    return true;
  }

  /**
   * Add event to history
   */
  private addToHistory(event: RealtimeEvent): void {
    this.eventHistory.push(event);
    
    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.config.maxEventHistory) {
      this.eventHistory = this.eventHistory.slice(-this.config.maxEventHistory);
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.subscriptions.clear();
    this.eventHistory = [];
    this.middleware = [];
    this.isConnected = false;
  }
}

// Singleton instance for global use
export const eventSystem = new EventSystem();