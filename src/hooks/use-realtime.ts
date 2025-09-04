/**
 * React Hook for Hybrid Realtime System
 * Provides easy integration with both Supabase Realtime and custom WebSocket layer
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabaseRealtimeIntegration, DatabaseChangeEvent } from '@/lib/realtime/SupabaseRealtimeIntegration';
import { politicianEventManager, PoliticianActivityEvent, PoliticianUpdateEvent } from '@/lib/realtime/PoliticianEvents';
import { notificationSystem, Notification } from '@/lib/realtime/NotificationSystem';

export interface UseRealtimeOptions {
  autoConnect?: boolean;
  enableNotifications?: boolean;
}

export interface UseRealtimeReturn {
  isConnected: boolean;
  connectionStatus: any;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

/**
 * Main realtime hook
 */
export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const { autoConnect = true, enableNotifications = true } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const initializationRef = useRef(false);

  const connect = useCallback(async () => {
    if (initializationRef.current) return;
    
    try {
      setError(null);
      initializationRef.current = true;

      await supabaseRealtimeIntegration.initialize();
      
      if (enableNotifications) {
        await notificationSystem.initialize();
      }

      setIsConnected(true);
      
      // Monitor connection status
      const statusInterval = setInterval(() => {
        const status = supabaseRealtimeIntegration.getConnectionStatus();
        setConnectionStatus(status);
        setIsConnected(status.supabase === 'connected');
      }, 5000);

      return () => clearInterval(statusInterval);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Connection failed');
      setError(error);
      setIsConnected(false);
      initializationRef.current = false;
    }
  }, [enableNotifications]);

  const disconnect = useCallback(async () => {
    try {
      await supabaseRealtimeIntegration.destroy();
      setIsConnected(false);
      setConnectionStatus(null);
      initializationRef.current = false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Disconnect failed');
      setError(error);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (initializationRef.current) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
  };
}

/**
 * Hook for subscribing to database changes
 */
export function useDatabaseChanges(
  table: string,
  callback: (event: DatabaseChangeEvent) => void,
  eventType?: 'INSERT' | 'UPDATE' | 'DELETE'
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      try {
        await supabaseRealtimeIntegration.initialize();
        
        unsubscribe = supabaseRealtimeIntegration.subscribeToTable(
          table,
          (event) => callbackRef.current(event),
          eventType
        );
      } catch (error) {
        console.error('Failed to subscribe to database changes:', error);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [table, eventType]);
}

/**
 * Hook for politician-specific realtime updates
 */
export function usePoliticianRealtime(politicianId: string) {
  const [lastUpdate, setLastUpdate] = useState<PoliticianUpdateEvent | null>(null);
  const [recentActivity, setRecentActivity] = useState<PoliticianActivityEvent[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let subscriptions: string[] = [];

    const setupPoliticianSubscriptions = async () => {
      try {
        await politicianEventManager.initialize();

        // Subscribe to updates
        const updateSub = politicianEventManager.subscribeToPoliticianUpdates(
          politicianId,
          (event) => {
            setLastUpdate(event);
            setIsActive(true);
            setTimeout(() => setIsActive(false), 5000); // Show active for 5 seconds
          }
        );

        // Subscribe to activity
        const activitySub = politicianEventManager.subscribeToPoliticianActivity(
          politicianId,
          (event) => {
            setRecentActivity(prev => {
              const newActivity = [event, ...prev].slice(0, 10); // Keep last 10 activities
              return newActivity;
            });
          }
        );

        subscriptions = [updateSub, activitySub];

      } catch (error) {
        console.error('Failed to setup politician subscriptions:', error);
      }
    };

    setupPoliticianSubscriptions();

    return () => {
      subscriptions.forEach(sub => politicianEventManager.unsubscribe(sub));
    };
  }, [politicianId]);

  // Emit view activity when component mounts
  useEffect(() => {
    const emitViewActivity = async () => {
      try {
        await politicianEventManager.initialize();
        await politicianEventManager.emitPoliticianActivity(
          politicianId,
          'view',
          'current-user' // In real app, this would be the actual user ID
        );
      } catch (error) {
        console.error('Failed to emit view activity:', error);
      }
    };

    emitViewActivity();
  }, [politicianId]);

  return {
    lastUpdate,
    recentActivity,
    isActive,
    activityCount: recentActivity.length,
  };
}

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupNotifications = async () => {
      try {
        await notificationSystem.initialize();

        // Subscribe to notification updates
        unsubscribe = notificationSystem.subscribe((notification) => {
          if (notification.read) {
            // Remove dismissed notification
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          } else {
            // Add or update notification
            setNotifications(prev => {
              const existing = prev.find(n => n.id === notification.id);
              if (existing) {
                return prev.map(n => n.id === notification.id ? notification : n);
              }
              return [notification, ...prev];
            });
          }
        });

        // Load existing notifications
        const existing = notificationSystem.getAll();
        setNotifications(existing);

      } catch (error) {
        console.error('Failed to setup notifications:', error);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const showNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options?: any
  ) => {
    return notificationSystem.show(type, title, message, options);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    return notificationSystem.dismiss(id);
  }, []);

  const markAsRead = useCallback((id: string) => {
    return notificationSystem.markAsRead(id);
  }, []);

  const clearAll = useCallback(() => {
    notificationSystem.clearAll();
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    showNotification,
    dismissNotification,
    markAsRead,
    clearAll,
  };
}

/**
 * Hook for broadcasting events to other users
 */
export function useBroadcast() {
  const broadcastToChannel = useCallback(async (
    channelName: string,
    event: string,
    payload: any
  ) => {
    try {
      await supabaseRealtimeIntegration.broadcastToChannel(channelName, event, payload);
    } catch (error) {
      console.error('Failed to broadcast event:', error);
    }
  }, []);

  const broadcastPoliticianUpdate = useCallback(async (
    politicianId: string,
    changes: any[],
    updatedBy: string
  ) => {
    try {
      await politicianEventManager.emitPoliticianUpdate(politicianId, changes, updatedBy, true);
    } catch (error) {
      console.error('Failed to broadcast politician update:', error);
    }
  }, []);

  return {
    broadcastToChannel,
    broadcastPoliticianUpdate,
  };
}

/**
 * Hook for connection health monitoring
 */
export function useConnectionHealth() {
  const [health, setHealth] = useState<any>(null);
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    const checkHealth = () => {
      const status = supabaseRealtimeIntegration.getConnectionStatus();
      setHealth(status);
      setIsHealthy(
        status.supabase === 'connected' && 
        (status.customWebSocket === true || status.customWebSocket === false) // Either enabled and connected, or disabled
      );
    };

    // Check immediately
    checkHealth();

    // Check every 10 seconds
    const interval = setInterval(checkHealth, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    health,
    isHealthy,
    isSupabaseConnected: health?.supabase === 'connected',
    isWebSocketConnected: health?.customWebSocket === true,
  };
}