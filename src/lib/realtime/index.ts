/**
 * Real-time WebSocket System
 * Exports all WebSocket-related functionality
 */

export { WebSocketManager } from './WebSocketManager';
export type { 
  WebSocketConfig, 
  ConnectionHealth, 
  WebSocketMessage, 
  WebSocketEventHandler, 
  ConnectionEventHandler 
} from './WebSocketManager';

export { ConnectionPool, connectionPool } from './ConnectionPool';
export type { 
  PoolConfig, 
  PoolStats, 
  ConnectionInfo 
} from './ConnectionPool';

export { ConnectionDiagnostics } from './ConnectionDiagnostics';
export type { 
  DiagnosticTest, 
  DiagnosticResult, 
  NetworkDiagnostics, 
  PerformanceDiagnostics, 
  ErrorDiagnostics 
} from './ConnectionDiagnostics';

export { EventSystem, eventSystem } from './EventSystem';
export type {
  RealtimeEvent,
  EventSubscription,
  EventFilter,
  EventHandler,
  EventMiddleware,
  EventSystemConfig
} from './EventSystem';

export { PoliticianEventManager, politicianEventManager } from './PoliticianEvents';
export type {
  PoliticianUpdateEvent,
  PoliticianActivityEvent,
  NewsUpdateEvent,
  TrendingUpdateEvent
} from './PoliticianEvents';

export { NotificationSystem, notificationSystem } from './NotificationSystem';
export type {
  Notification,
  NotificationAction,
  NotificationConfig,
  NotificationHandler
} from './NotificationSystem';

export { SupabaseRealtimeIntegration, supabaseRealtimeIntegration } from './SupabaseRealtimeIntegration';
export type {
  SupabaseRealtimeConfig,
  DatabaseChangeEvent
} from './SupabaseRealtimeIntegration';

// Re-export hooks
export { useWebSocket, useWebSocketEvent, useWebSocketHealth } from '../../hooks/use-websocket';
export type { UseWebSocketOptions, UseWebSocketReturn } from '../../hooks/use-websocket';

export { 
  useRealtime, 
  useDatabaseChanges, 
  usePoliticianRealtime, 
  useNotifications, 
  useBroadcast, 
  useConnectionHealth 
} from '../../hooks/use-realtime';
export type { UseRealtimeOptions, UseRealtimeReturn } from '../../hooks/use-realtime';