/**
 * WebSocket Manager Tests
 */

import { WebSocketManager, WebSocketConfig } from '../WebSocketManager';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  protocols: string[];
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string, protocols: string[] = []) {
    this.url = url;
    this.protocols = protocols;
    
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    
    // Echo back pong for ping messages
    try {
      const message = JSON.parse(data);
      if (message.type === 'ping') {
        setTimeout(() => {
          if (this.onmessage) {
            this.onmessage(new MessageEvent('message', {
              data: JSON.stringify({ type: 'pong', timestamp: Date.now() })
            }));
          }
        }, 5);
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: 1000, reason: 'Normal closure' }));
    }
  }

  // Simulate connection error
  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  // Simulate message reception
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }
}

// Mock global WebSocket
(global as any).WebSocket = MockWebSocket;

describe('WebSocketManager', () => {
  let manager: WebSocketManager;
  const config: WebSocketConfig = {
    url: 'ws://localhost:3001',
    reconnectInterval: 100,
    maxReconnectAttempts: 3,
    heartbeatInterval: 1000,
    connectionTimeout: 5000,
  };

  beforeEach(() => {
    manager = new WebSocketManager(config);
  });

  afterEach(() => {
    manager.disconnect();
  });

  describe('Connection Management', () => {
    test('should connect successfully', async () => {
      await expect(manager.connect()).resolves.toBeUndefined();
      expect(manager.getHealth().isConnected).toBe(true);
    });

    test('should handle connection timeout', async () => {
      // Mock WebSocket that never opens
      (global as any).WebSocket = class {
        readyState = 0;
        url: string;
        protocols: string[];
        onopen: ((event: Event) => void) | null = null;
        onclose: ((event: CloseEvent) => void) | null = null;
        onmessage: ((event: MessageEvent) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;

        constructor(url: string, protocols: string[] = []) {
          this.url = url;
          this.protocols = protocols;
          // Don't simulate opening - will timeout
        }

        send() {}
        close() {}
      };

      const shortTimeoutManager = new WebSocketManager({
        ...config,
        connectionTimeout: 100,
      });

      await expect(shortTimeoutManager.connect()).rejects.toThrow('Connection timeout');
    });

    test('should disconnect properly', async () => {
      await manager.connect();
      expect(manager.getHealth().isConnected).toBe(true);
      
      manager.disconnect();
      expect(manager.getHealth().isConnected).toBe(false);
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      await manager.connect();
    });

    test('should send messages when connected', () => {
      const sendSpy = jest.spyOn(manager['ws']!, 'send');
      
      manager.send('test', { data: 'hello' });
      
      expect(sendSpy).toHaveBeenCalledWith(
        expect.stringContaining('"type":"test"')
      );
      expect(sendSpy).toHaveBeenCalledWith(
        expect.stringContaining('"payload":{"data":"hello"}')
      );
    });

    test('should queue messages when disconnected', () => {
      manager.disconnect();
      
      manager.send('test', { data: 'queued' });
      
      // Message should be queued
      expect(manager['messageQueue']).toHaveLength(1);
      expect(manager['messageQueue'][0].type).toBe('test');
    });

    test('should handle incoming messages', async () => {
      const handler = jest.fn();
      manager.subscribe('test_event', handler);

      // Simulate incoming message
      const mockWs = manager['ws'] as any;
      mockWs.simulateMessage({ type: 'test_event', payload: { data: 'received' } });

      expect(handler).toHaveBeenCalledWith({ data: 'received' });
    });
  });

  describe('Event Subscription', () => {
    beforeEach(async () => {
      await manager.connect();
    });

    test('should subscribe and unsubscribe to events', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      manager.subscribe('test', handler1);
      manager.subscribe('test', handler2);

      // Simulate message
      const mockWs = manager['ws'] as any;
      mockWs.simulateMessage({ type: 'test', payload: 'data' });

      expect(handler1).toHaveBeenCalledWith('data');
      expect(handler2).toHaveBeenCalledWith('data');

      // Unsubscribe one handler
      manager.unsubscribe('test', handler1);
      mockWs.simulateMessage({ type: 'test', payload: 'data2' });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(2);
    });

    test('should unsubscribe all handlers for event type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      manager.subscribe('test', handler1);
      manager.subscribe('test', handler2);

      manager.unsubscribe('test');

      // Simulate message
      const mockWs = manager['ws'] as any;
      mockWs.simulateMessage({ type: 'test', payload: 'data' });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      await manager.connect();
    });

    test('should track connection health', () => {
      const health = manager.getHealth();
      
      expect(health.isConnected).toBe(true);
      expect(health.reconnectAttempts).toBe(0);
      expect(health.connectionQuality).toBe('excellent');
    });

    test('should handle heartbeat responses', async () => {
      // Manually trigger heartbeat
      manager.send('ping', {});
      
      // Wait for pong response
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const health = manager.getHealth();
      expect(health.lastPong).toBeGreaterThan(0);
    });

    test('should notify connection change handlers', async () => {
      const handler = jest.fn();
      manager.onConnectionChange(handler);

      manager.disconnect();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ isConnected: false })
      );
    });
  });

  describe('Reconnection Logic', () => {
    test('should attempt reconnection on unexpected disconnect', async () => {
      await manager.connect();
      
      const reconnectSpy = jest.spyOn(manager as any, 'attemptReconnection');
      
      // Simulate unexpected disconnect
      const mockWs = manager['ws'] as any;
      mockWs.readyState = MockWebSocket.CLOSED;
      mockWs.onclose(new CloseEvent('close', { code: 1006, reason: 'Abnormal closure' }));

      expect(reconnectSpy).toHaveBeenCalled();
    });

    test('should not reconnect on normal closure', async () => {
      await manager.connect();
      
      const reconnectSpy = jest.spyOn(manager as any, 'attemptReconnection');
      
      // Simulate normal disconnect
      const mockWs = manager['ws'] as any;
      mockWs.readyState = MockWebSocket.CLOSED;
      mockWs.onclose(new CloseEvent('close', { code: 1000, reason: 'Normal closure' }));

      expect(reconnectSpy).not.toHaveBeenCalled();
    });

    test('should stop reconnecting after max attempts', async () => {
      const shortRetryManager = new WebSocketManager({
        ...config,
        maxReconnectAttempts: 2,
        reconnectInterval: 50,
      });

      // Mock WebSocket to always fail
      (global as any).WebSocket = class {
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Event('error'));
            }
          }, 10);
        }
        close() {}
        onerror: ((event: Event) => void) | null = null;
      };

      try {
        await shortRetryManager.connect();
      } catch (e) {
        // Expected to fail
      }

      // Wait for reconnection attempts
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(shortRetryManager.getHealth().reconnectAttempts).toBeLessThanOrEqual(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle WebSocket errors gracefully', async () => {
      await manager.connect();
      
      const mockWs = manager['ws'] as any;
      if (mockWs && mockWs.simulateError) {
        mockWs.simulateError();
      }

      // Should not throw
      expect(() => manager.getHealth()).not.toThrow();
    });

    test('should handle malformed messages', async () => {
      await manager.connect();
      
      const handler = jest.fn();
      manager.subscribe('test', handler);

      // Simulate malformed message
      const mockWs = manager['ws'] as any;
      if (mockWs && mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', { data: 'invalid json' }));
      }

      // Should not crash and handler should not be called
      expect(handler).not.toHaveBeenCalled();
    });
  });
});