/**
 * React Hook for WebSocket Management
 * Provides easy-to-use WebSocket functionality with automatic cleanup
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketManager, ConnectionHealth, WebSocketEventHandler } from '@/lib/realtime/WebSocketManager';
import { connectionPool } from '@/lib/realtime/ConnectionPool';

export interface UseWebSocketOptions {
  url?: string;
  channels?: string[];
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionHealth: ConnectionHealth;
  connect: () => Promise<void>;
  disconnect: () => void;
  send: (type: string, payload: any) => void;
  subscribe: (eventType: string, handler: WebSocketEventHandler) => void;
  unsubscribe: (eventType: string, handler?: WebSocketEventHandler) => void;
  lastMessage: any;
  error: Error | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    channels = [],
    autoConnect = true,
    reconnectOnMount = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>({
    isConnected: false,
    lastPing: 0,
    lastPong: 0,
    latency: 0,
    reconnectAttempts: 0,
    connectionQuality: 'disconnected',
  });
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const managerRef = useRef<WebSocketManager | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<WebSocketEventHandler>>>(new Map());

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async () => {
    try {
      setError(null);
      const manager = await connectionPool.getConnection(url, channels);
      managerRef.current = manager;

      // Subscribe to connection health updates
      manager.onConnectionChange((health) => {
        setConnectionHealth(health);
        setIsConnected(health.isConnected);
      });

      // Re-subscribe to all event handlers
      for (const [eventType, handlers] of eventHandlersRef.current) {
        for (const handler of handlers) {
          manager.subscribe(eventType, handler);
        }
      }

      setIsConnected(manager.getHealth().isConnected);
      setConnectionHealth(manager.getHealth());

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Connection failed');
      setError(error);
      setIsConnected(false);
    }
  }, [url, channels]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect();
      managerRef.current = null;
    }
    setIsConnected(false);
    setConnectionHealth(prev => ({ ...prev, isConnected: false, connectionQuality: 'disconnected' }));
  }, []);

  /**
   * Send message through WebSocket
   */
  const send = useCallback((type: string, payload: any) => {
    if (managerRef.current) {
      managerRef.current.send(type, payload);
    } else {
      console.warn('WebSocket not connected. Message queued for later delivery.');
    }
  }, []);

  /**
   * Subscribe to WebSocket events
   */
  const subscribe = useCallback((eventType: string, handler: WebSocketEventHandler) => {
    // Store handler reference for reconnection
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)!.add(handler);

    // Create wrapper handler to update lastMessage
    const wrappedHandler: WebSocketEventHandler = (data) => {
      setLastMessage({ type: eventType, data, timestamp: Date.now() });
      handler(data);
    };

    // Subscribe to manager if connected
    if (managerRef.current) {
      managerRef.current.subscribe(eventType, wrappedHandler);
    }

    // Return cleanup function
    return () => {
      eventHandlersRef.current.get(eventType)?.delete(handler);
      if (managerRef.current) {
        managerRef.current.unsubscribe(eventType, wrappedHandler);
      }
    };
  }, []);

  /**
   * Unsubscribe from WebSocket events
   */
  const unsubscribe = useCallback((eventType: string, handler?: WebSocketEventHandler) => {
    if (handler) {
      eventHandlersRef.current.get(eventType)?.delete(handler);
    } else {
      eventHandlersRef.current.delete(eventType);
    }

    if (managerRef.current) {
      managerRef.current.unsubscribe(eventType, handler);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Reconnect when URL or channels change
  useEffect(() => {
    if (reconnectOnMount && managerRef.current) {
      disconnect();
      setTimeout(() => connect(), 100);
    }
  }, [url, channels, reconnectOnMount, connect, disconnect]);

  return {
    isConnected,
    connectionHealth,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    lastMessage,
    error,
  };
}

/**
 * Hook for subscribing to specific WebSocket events
 */
export function useWebSocketEvent(
  eventType: string,
  handler: WebSocketEventHandler,
  options: UseWebSocketOptions = {}
) {
  const { subscribe, unsubscribe, ...websocket } = useWebSocket(options);

  useEffect(() => {
    const cleanup = subscribe(eventType, handler);
    return cleanup;
  }, [eventType, handler, subscribe]);

  return websocket;
}

/**
 * Hook for WebSocket connection health monitoring
 */
export function useWebSocketHealth(options: UseWebSocketOptions = {}) {
  const { connectionHealth, isConnected } = useWebSocket({ ...options, autoConnect: false });
  
  return {
    health: connectionHealth,
    isConnected,
    isHealthy: connectionHealth.connectionQuality !== 'poor' && connectionHealth.connectionQuality !== 'disconnected',
    latency: connectionHealth.latency,
    quality: connectionHealth.connectionQuality,
  };
}