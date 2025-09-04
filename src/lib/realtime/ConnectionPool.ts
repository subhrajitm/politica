/**
 * WebSocket Connection Pool Manager
 * Manages multiple WebSocket connections for different channels and features
 */

import { WebSocketManager, WebSocketConfig, ConnectionHealth } from './WebSocketManager';

export interface PoolConfig {
  maxConnections: number;
  connectionTimeout: number;
  healthCheckInterval: number;
}

export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  failedConnections: number;
  averageLatency: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
}

export interface ConnectionInfo {
  id: string;
  manager: WebSocketManager;
  channels: Set<string>;
  lastUsed: number;
  health: ConnectionHealth;
}

export class ConnectionPool {
  private connections: Map<string, ConnectionInfo> = new Map();
  private config: PoolConfig;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private connectionCounter = 0;

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = {
      maxConnections: config.maxConnections || 5,
      connectionTimeout: config.connectionTimeout || 300000, // 5 minutes
      healthCheckInterval: config.healthCheckInterval || 60000, // 1 minute
    };

    this.startHealthCheck();
  }

  /**
   * Get or create a WebSocket connection for a specific endpoint
   */
  async getConnection(url: string, channels: string[] = []): Promise<WebSocketManager> {
    // Try to find existing connection for the same URL
    const existingConnection = this.findConnectionByUrl(url);
    if (existingConnection) {
      // Update channels and last used time
      channels.forEach(channel => existingConnection.channels.add(channel));
      existingConnection.lastUsed = Date.now();
      return existingConnection.manager;
    }

    // Create new connection if under limit
    if (this.connections.size < this.config.maxConnections) {
      return this.createConnection(url, channels);
    }

    // Remove least recently used connection and create new one
    this.removeLeastRecentlyUsed();
    return this.createConnection(url, channels);
  }

  /**
   * Create a new WebSocket connection
   */
  private async createConnection(url: string, channels: string[]): Promise<WebSocketManager> {
    const connectionId = `conn_${++this.connectionCounter}`;
    
    const config: WebSocketConfig = {
      url,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
    };

    const manager = new WebSocketManager(config);
    
    const connectionInfo: ConnectionInfo = {
      id: connectionId,
      manager,
      channels: new Set(channels),
      lastUsed: Date.now(),
      health: manager.getHealth(),
    };

    // Subscribe to health updates
    manager.onConnectionChange((health) => {
      connectionInfo.health = health;
    });

    try {
      await manager.connect();
      this.connections.set(connectionId, connectionInfo);
      return manager;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      throw error;
    }
  }

  /**
   * Find existing connection by URL
   */
  private findConnectionByUrl(url: string): ConnectionInfo | null {
    for (const connection of this.connections.values()) {
      if (connection.manager['config']?.url === url && connection.health.isConnected) {
        return connection;
      }
    }
    return null;
  }

  /**
   * Remove least recently used connection
   */
  private removeLeastRecentlyUsed(): void {
    let oldestConnection: ConnectionInfo | null = null;
    let oldestTime = Date.now();

    for (const connection of this.connections.values()) {
      if (connection.lastUsed < oldestTime) {
        oldestTime = connection.lastUsed;
        oldestConnection = connection;
      }
    }

    if (oldestConnection) {
      this.removeConnection(oldestConnection.id);
    }
  }

  /**
   * Remove a specific connection
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.manager.disconnect();
      this.connections.delete(connectionId);
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): PoolStats {
    const connections = Array.from(this.connections.values());
    const activeConnections = connections.filter(c => c.health.isConnected).length;
    const failedConnections = connections.filter(c => !c.health.isConnected).length;
    
    const totalLatency = connections.reduce((sum, c) => sum + c.health.latency, 0);
    const averageLatency = connections.length > 0 ? totalLatency / connections.length : 0;

    let connectionQuality: 'excellent' | 'good' | 'poor' | 'critical' = 'excellent';
    if (failedConnections > connections.length * 0.5) {
      connectionQuality = 'critical';
    } else if (averageLatency > 500) {
      connectionQuality = 'poor';
    } else if (averageLatency > 200) {
      connectionQuality = 'good';
    }

    return {
      totalConnections: connections.length,
      activeConnections,
      idleConnections: connections.length - activeConnections - failedConnections,
      failedConnections,
      averageLatency,
      connectionQuality,
    };
  }

  /**
   * Get all connection health information
   */
  getConnectionsHealth(): Map<string, ConnectionHealth> {
    const healthMap = new Map<string, ConnectionHealth>();
    for (const [id, connection] of this.connections) {
      healthMap.set(id, connection.health);
    }
    return healthMap;
  }

  /**
   * Clean up idle connections
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const connectionsToRemove: string[] = [];

    for (const [id, connection] of this.connections) {
      const idleTime = now - connection.lastUsed;
      if (idleTime > this.config.connectionTimeout) {
        connectionsToRemove.push(id);
      }
    }

    connectionsToRemove.forEach(id => this.removeConnection(id));
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.cleanupIdleConnections();
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health checks and cleanup
   */
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Disconnect all connections
    for (const connection of this.connections.values()) {
      connection.manager.disconnect();
    }

    this.connections.clear();
  }
}

// Singleton instance for global use
export const connectionPool = new ConnectionPool();