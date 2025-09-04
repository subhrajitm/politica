/**
 * Supabase Realtime Integration
 * Integrates Supabase Realtime with custom WebSocket layer for hybrid real-time system
 */

import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { eventSystem } from './EventSystem';
import { politicianEventManager } from './PoliticianEvents';
import { notificationSystem } from './NotificationSystem';

export interface SupabaseRealtimeConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableCustomWebSocket: boolean;
  tables: string[];
  channels: string[];
}

export interface DatabaseChangeEvent {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  old: Record<string, any> | null;
  new: Record<string, any> | null;
  timestamp: string;
}

export class SupabaseRealtimeIntegration {
  private supabase: ReturnType<typeof createClient>;
  private channels: Map<string, RealtimeChannel> = new Map();
  private config: SupabaseRealtimeConfig;
  private isInitialized = false;
  private consistencyChecks: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: SupabaseRealtimeConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  /**
   * Initialize Supabase Realtime integration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize custom event system if enabled
      if (this.config.enableCustomWebSocket) {
        await eventSystem.initialize();
        await politicianEventManager.initialize();
        await notificationSystem.initialize();
      }

      // Set up database change listeners
      await this.setupDatabaseListeners();

      // Set up custom channels
      await this.setupCustomChannels();

      // Start consistency monitoring
      this.startConsistencyMonitoring();

      this.isInitialized = true;
      console.log('Supabase Realtime integration initialized');

    } catch (error) {
      console.error('Failed to initialize Supabase Realtime integration:', error);
      throw error;
    }
  }

  /**
   * Set up database change listeners
   */
  private async setupDatabaseListeners(): Promise<void> {
    for (const table of this.config.tables) {
      const channel = this.supabase
        .channel(`db-changes-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => this.handleDatabaseChange(table, payload)
        );

      await channel.subscribe((status) => {
        console.log(`Database listener for ${table}:`, status);
      });

      this.channels.set(`db-${table}`, channel);
    }
  }

  /**
   * Set up custom channels for application-specific events
   */
  private async setupCustomChannels(): Promise<void> {
    for (const channelName of this.config.channels) {
      const channel = this.supabase
        .channel(channelName)
        .on('broadcast', { event: '*' }, (payload) => {
          this.handleCustomChannelEvent(channelName, payload);
        });

      await channel.subscribe((status) => {
        console.log(`Custom channel ${channelName}:`, status);
      });

      this.channels.set(channelName, channel);
    }
  }

  /**
   * Handle database changes from Supabase Realtime
   */
  private async handleDatabaseChange(
    table: string,
    payload: RealtimePostgresChangesPayload<Record<string, any>>
  ): Promise<void> {
    const changeEvent: DatabaseChangeEvent = {
      table,
      eventType: payload.eventType,
      old: payload.old,
      new: payload.new,
      timestamp: new Date().toISOString(),
    };

    // Emit to custom event system
    if (this.config.enableCustomWebSocket) {
      await eventSystem.emit(`db:${table}:${payload.eventType.toLowerCase()}`, changeEvent, {
        broadcast: true,
        metadata: { table, eventType: payload.eventType },
      });
    }

    // Handle specific table changes
    switch (table) {
      case 'politicians':
        await this.handlePoliticianChange(changeEvent);
        break;
      case 'politician_news':
        await this.handleNewsChange(changeEvent);
        break;
      case 'user_interactions':
        await this.handleInteractionChange(changeEvent);
        break;
      default:
        console.log(`Unhandled table change: ${table}`, changeEvent);
    }

    // Schedule consistency check
    this.scheduleConsistencyCheck(table, changeEvent);
  }

  /**
   * Handle politician data changes
   */
  private async handlePoliticianChange(event: DatabaseChangeEvent): Promise<void> {
    if (!this.config.enableCustomWebSocket) return;

    switch (event.eventType) {
      case 'UPDATE':
        if (event.old && event.new) {
          const changes = this.detectChanges(event.old, event.new);
          if (changes.length > 0) {
            await politicianEventManager.emitPoliticianUpdate(
              event.new.id,
              changes,
              'system', // In real app, this would be the actual user
              true
            );

            // Show notification for significant changes
            const significantFields = ['name', 'position', 'party', 'status'];
            const hasSignificantChange = changes.some(change => 
              significantFields.includes(change.field)
            );

            if (hasSignificantChange) {
              notificationSystem.info(
                'Politician Updated',
                `${event.new.name || 'A politician'} has been updated`,
                {
                  metadata: { politicianId: event.new.id },
                  broadcast: true,
                }
              );
            }
          }
        }
        break;

      case 'INSERT':
        if (event.new) {
          notificationSystem.success(
            'New Politician Added',
            `${event.new.name || 'A new politician'} has been added to the database`,
            {
              metadata: { politicianId: event.new.id },
              broadcast: true,
            }
          );
        }
        break;

      case 'DELETE':
        if (event.old) {
          notificationSystem.warning(
            'Politician Removed',
            `${event.old.name || 'A politician'} has been removed from the database`,
            {
              metadata: { politicianId: event.old.id },
              broadcast: true,
            }
          );
        }
        break;
    }
  }

  /**
   * Handle news changes
   */
  private async handleNewsChange(event: DatabaseChangeEvent): Promise<void> {
    if (!this.config.enableCustomWebSocket) return;

    if (event.eventType === 'INSERT' && event.new) {
      await politicianEventManager.emitNewsUpdate(
        event.new.politician_id,
        {
          id: event.new.id,
          title: event.new.title,
          summary: event.new.summary,
          source: event.new.source,
          publishedAt: new Date(event.new.published_at).getTime(),
        },
        true
      );
    }
  }

  /**
   * Handle user interaction changes
   */
  private async handleInteractionChange(event: DatabaseChangeEvent): Promise<void> {
    if (!this.config.enableCustomWebSocket) return;

    if (event.eventType === 'INSERT' && event.new) {
      await politicianEventManager.emitPoliticianActivity(
        event.new.politician_id,
        event.new.interaction_type,
        event.new.user_id,
        event.new.metadata
      );
    }
  }

  /**
   * Handle custom channel events
   */
  private async handleCustomChannelEvent(channelName: string, payload: any): Promise<void> {
    if (this.config.enableCustomWebSocket) {
      await eventSystem.emit(`channel:${channelName}`, payload.payload, {
        broadcast: false, // Already broadcasted via Supabase
        metadata: { channel: channelName },
      });
    }
  }

  /**
   * Broadcast event to Supabase channel
   */
  async broadcastToChannel(channelName: string, event: string, payload: any): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  }

  /**
   * Subscribe to database changes for a specific table
   */
  subscribeToTable(
    table: string,
    callback: (event: DatabaseChangeEvent) => void,
    eventType?: 'INSERT' | 'UPDATE' | 'DELETE'
  ): () => void {
    const eventName = eventType 
      ? `db:${table}:${eventType.toLowerCase()}`
      : `db:${table}:*`;

    if (this.config.enableCustomWebSocket) {
      const subscriptionId = eventSystem.subscribe(eventName, (event) => {
        callback(event.payload as DatabaseChangeEvent);
      });

      return () => eventSystem.unsubscribe(subscriptionId);
    }

    // Fallback to direct Supabase subscription
    const channel = this.supabase
      .channel(`custom-${table}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: eventType || '*',
          schema: 'public',
          table,
        },
        (payload) => {
          const changeEvent: DatabaseChangeEvent = {
            table,
            eventType: payload.eventType,
            old: payload.old,
            new: payload.new,
            timestamp: new Date().toISOString(),
          };
          callback(changeEvent);
        }
      );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    supabase: string;
    customWebSocket: boolean;
    channels: string[];
  } {
    const channelStatuses = Array.from(this.channels.entries()).map(([name, channel]) => ({
      name,
      status: (channel as any).state || 'unknown',
    }));

    return {
      supabase: this.supabase.realtime.isConnected() ? 'connected' : 'disconnected',
      customWebSocket: this.config.enableCustomWebSocket && eventSystem.getStats().isConnected,
      channels: channelStatuses.map(c => `${c.name}: ${c.status}`),
    };
  }

  /**
   * Detect changes between old and new records
   */
  private detectChanges(
    oldRecord: Record<string, any>,
    newRecord: Record<string, any>
  ): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    for (const [key, newValue] of Object.entries(newRecord)) {
      const oldValue = oldRecord[key];
      if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue,
          newValue,
        });
      }
    }

    return changes;
  }

  /**
   * Schedule consistency check for data synchronization
   */
  private scheduleConsistencyCheck(table: string, event: DatabaseChangeEvent): void {
    const checkId = `${table}-${event.eventType}-${Date.now()}`;
    
    // Clear existing check for this table
    const existingCheck = this.consistencyChecks.get(table);
    if (existingCheck) {
      clearTimeout(existingCheck);
    }

    // Schedule new check
    const timeout = setTimeout(async () => {
      await this.performConsistencyCheck(table, event);
      this.consistencyChecks.delete(table);
    }, 5000); // Check after 5 seconds

    this.consistencyChecks.set(table, timeout);
  }

  /**
   * Perform data consistency check
   */
  private async performConsistencyCheck(table: string, event: DatabaseChangeEvent): Promise<void> {
    try {
      // In a real implementation, this would verify data consistency
      // between Supabase and any cached data in the custom WebSocket layer
      
      console.log(`Performing consistency check for ${table}`, {
        eventType: event.eventType,
        timestamp: event.timestamp,
      });

      // Example: Verify politician data consistency
      if (table === 'politicians' && event.new?.id) {
        const { data, error } = await this.supabase
          .from('politicians')
          .select('*')
          .eq('id', event.new.id)
          .single();

        if (error) {
          console.error('Consistency check failed:', error);
          return;
        }

        // Compare with cached data and emit correction events if needed
        if (this.config.enableCustomWebSocket) {
          await eventSystem.emit('system:consistency_check', {
            table,
            recordId: event.new.id,
            currentData: data,
            status: 'verified',
          });
        }
      }

    } catch (error) {
      console.error('Consistency check error:', error);
    }
  }

  /**
   * Start consistency monitoring
   */
  private startConsistencyMonitoring(): void {
    // Monitor connection health every 30 seconds
    setInterval(() => {
      const status = this.getConnectionStatus();
      
      if (this.config.enableCustomWebSocket) {
        eventSystem.emit('system:connection_status', status);
      }

      // Log connection issues
      if (status.supabase === 'disconnected') {
        console.warn('Supabase Realtime disconnected');
      }

    }, 30000);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    // Clear consistency checks
    for (const timeout of this.consistencyChecks.values()) {
      clearTimeout(timeout);
    }
    this.consistencyChecks.clear();

    // Unsubscribe from all channels
    for (const channel of this.channels.values()) {
      await channel.unsubscribe();
    }
    this.channels.clear();

    this.isInitialized = false;
  }
}

// Create singleton instance
export const supabaseRealtimeIntegration = new SupabaseRealtimeIntegration({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  enableCustomWebSocket: true,
  tables: ['politicians', 'politician_news', 'user_interactions'],
  channels: ['politician_updates', 'system_notifications'],
});