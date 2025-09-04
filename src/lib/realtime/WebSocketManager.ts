/**
 * WebSocket Connection Manager
 * Handles WebSocket connections with auto-reconnection, health monitoring, and connection pooling
 */

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

export interface ConnectionHealth {
  isConnected: boolean;
  lastPing: number;
  lastPong: number;
  latency: number;
  reconnectAttempts: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
}

export type WebSocketEventHandler = (data: any) => void;
export type ConnectionEventHandler = (health: ConnectionHealth) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private connectionHandlers: Set<ConnectionEventHandler> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private health: ConnectionHealth;
  private messageQueue: WebSocketMessage[] = [];
  private isReconnecting = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      protocols: config.protocols || [],
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      connectionTimeout: config.connectionTimeout || 10000,
    };

    this.health = {
      isConnected: false,
      lastPing: 0,
      lastPong: 0,
      latency: 0,
      reconnectAttempts: 0,
      connectionQuality: 'disconnected',
    };
  }

  /**
   * Establish WebSocket connection
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, this.config.connectionTimeout);

        this.ws.onopen = () => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          this.health.isConnected = true;
          this.health.reconnectAttempts = 0;
          this.updateConnectionQuality();
          this.startHeartbeat();
          this.processMessageQueue();
          this.notifyConnectionHandlers();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          this.handleDisconnection(event);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Close WebSocket connection
   */
  disconnect(): void {
    this.isReconnecting = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.health.isConnected = false;
    this.health.connectionQuality = 'disconnected';
    this.notifyConnectionHandlers();
  }

  /**
   * Subscribe to WebSocket events
   */
  subscribe(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  /**
   * Unsubscribe from WebSocket events
   */
  unsubscribe(eventType: string, handler?: WebSocketEventHandler): void {
    if (!handler) {
      this.eventHandlers.delete(eventType);
      return;
    }

    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  /**
   * Send message through WebSocket
   */
  send(type: string, payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later delivery
      this.messageQueue.push(message);
    }
  }

  /**
   * Subscribe to connection health updates
   */
  onConnectionChange(handler: ConnectionEventHandler): void {
    this.connectionHandlers.add(handler);
  }

  /**
   * Unsubscribe from connection health updates
   */
  offConnectionChange(handler: ConnectionEventHandler): void {
    this.connectionHandlers.delete(handler);
  }

  /**
   * Get current connection health
   */
  getHealth(): ConnectionHealth {
    return { ...this.health };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);

      // Handle pong responses for heartbeat
      if (message.type === 'pong') {
        this.health.lastPong = Date.now();
        this.health.latency = this.health.lastPong - this.health.lastPing;
        this.updateConnectionQuality();
        this.notifyConnectionHandlers();
        return;
      }

      // Notify event handlers
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.payload);
          } catch (error) {
            console.error('Error in WebSocket event handler:', error);
          }
        });
      }

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnection(event: CloseEvent): void {
    this.health.isConnected = false;
    this.health.connectionQuality = 'disconnected';
    this.stopHeartbeat();
    this.notifyConnectionHandlers();

    // Attempt reconnection if not manually closed
    if (!this.isReconnecting && event.code !== 1000) {
      this.attemptReconnection();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private async attemptReconnection(): Promise<void> {
    if (this.isReconnecting || this.health.reconnectAttempts >= this.config.maxReconnectAttempts) {
      return;
    }

    this.isReconnecting = true;
    this.health.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.health.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
        this.isReconnecting = false;
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.isReconnecting = false;
        this.attemptReconnection();
      }
    }, delay);
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.health.lastPing = Date.now();
        this.send('ping', {});
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Update connection quality based on latency and connection status
   */
  private updateConnectionQuality(): void {
    if (!this.health.isConnected) {
      this.health.connectionQuality = 'disconnected';
    } else if (this.health.latency < 100) {
      this.health.connectionQuality = 'excellent';
    } else if (this.health.latency < 300) {
      this.health.connectionQuality = 'good';
    } else {
      this.health.connectionQuality = 'poor';
    }
  }

  /**
   * Notify connection health handlers
   */
  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(this.getHealth());
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}