/**
 * Connection Pool Tests
 */

import { ConnectionPool } from '../ConnectionPool';
import { WebSocketManager } from '../WebSocketManager';

// Mock WebSocketManager
jest.mock('../WebSocketManager');

const MockWebSocketManager = WebSocketManager as jest.MockedClass<typeof WebSocketManager>;

describe('ConnectionPool', () => {
  let pool: ConnectionPool;

  beforeEach(() => {
    pool = new ConnectionPool({
      maxConnections: 3,
      connectionTimeout: 1000,
      healthCheckInterval: 500,
    });

    // Reset mock
    MockWebSocketManager.mockClear();
  });

  afterEach(() => {
    pool.destroy();
  });

  describe('Connection Management', () => {
    test('should create new connection for unique URL', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockGetHealth = jest.fn().mockReturnValue({ isConnected: true });
      
      MockWebSocketManager.mockImplementation(() => ({
        connect: mockConnect,
        getHealth: mockGetHealth,
        onConnectionChange: jest.fn(),
        disconnect: jest.fn(),
      } as any));

      const manager = await pool.getConnection('ws://localhost:3001', ['channel1']);

      expect(MockWebSocketManager).toHaveBeenCalledWith({
        url: 'ws://localhost:3001',
        reconnectInterval: 3000,
        maxReconnectAttempts: 10,
        heartbeatInterval: 30000,
        connectionTimeout: 10000,
      });
      expect(mockConnect).toHaveBeenCalled();
      expect(manager).toBeDefined();
    });

    test('should reuse existing connection for same URL', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockGetHealth = jest.fn().mockReturnValue({ isConnected: true });
      
      MockWebSocketManager.mockImplementation(() => ({
        connect: mockConnect,
        getHealth: mockGetHealth,
        onConnectionChange: jest.fn(),
        disconnect: jest.fn(),
        config: { url: 'ws://localhost:3001' },
      } as any));

      const manager1 = await pool.getConnection('ws://localhost:3001', ['channel1']);
      const manager2 = await pool.getConnection('ws://localhost:3001', ['channel2']);

      expect(MockWebSocketManager).toHaveBeenCalledTimes(1);
      expect(manager1).toBe(manager2);
    });

    test('should remove least recently used connection when at max capacity', async () => {
      const disconnectCalls: jest.Mock[] = [];
      
      MockWebSocketManager.mockImplementation((config) => {
        const mockDisconnect = jest.fn();
        disconnectCalls.push(mockDisconnect);
        
        return {
          connect: jest.fn().mockResolvedValue(undefined),
          getHealth: jest.fn().mockReturnValue({ isConnected: true }),
          onConnectionChange: jest.fn(),
          disconnect: mockDisconnect,
          config,
        } as any;
      });

      // Create max connections
      await pool.getConnection('ws://localhost:3001');
      await pool.getConnection('ws://localhost:3002');
      await pool.getConnection('ws://localhost:3003');

      // This should trigger LRU removal
      await pool.getConnection('ws://localhost:3004');

      // At least one disconnect should have been called
      const totalDisconnectCalls = disconnectCalls.reduce((sum, mock) => sum + mock.mock.calls.length, 0);
      expect(totalDisconnectCalls).toBeGreaterThanOrEqual(1);
      expect(MockWebSocketManager).toHaveBeenCalledTimes(4);
    });

    test('should handle connection failures', async () => {
      const mockConnect = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      MockWebSocketManager.mockImplementation(() => ({
        connect: mockConnect,
        getHealth: jest.fn().mockReturnValue({ isConnected: false }),
        onConnectionChange: jest.fn(),
        disconnect: jest.fn(),
      } as any));

      await expect(pool.getConnection('ws://invalid-url')).rejects.toThrow('Connection failed');
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should provide accurate connection statistics', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockGetHealth = jest.fn()
        .mockReturnValueOnce({ isConnected: true, latency: 50 })
        .mockReturnValueOnce({ isConnected: false, latency: 200 })
        .mockReturnValueOnce({ isConnected: true, latency: 100 });
      
      MockWebSocketManager.mockImplementation(() => ({
        connect: mockConnect,
        getHealth: mockGetHealth,
        onConnectionChange: jest.fn(),
        disconnect: jest.fn(),
        config: { url: 'ws://test' },
      } as any));

      await pool.getConnection('ws://localhost:3001');
      await pool.getConnection('ws://localhost:3002');
      await pool.getConnection('ws://localhost:3003');

      const stats = pool.getStats();

      expect(stats.totalConnections).toBe(3);
      expect(stats.activeConnections).toBe(2);
      expect(stats.failedConnections).toBe(1);
      expect(stats.averageLatency).toBeCloseTo(116.67, 1); // (50 + 200 + 100) / 3
    });

    test('should provide connection health information', async () => {
      const mockHealth = { isConnected: true, latency: 50, connectionQuality: 'excellent' };
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockGetHealth = jest.fn().mockReturnValue(mockHealth);
      
      MockWebSocketManager.mockImplementation(() => ({
        connect: mockConnect,
        getHealth: mockGetHealth,
        onConnectionChange: jest.fn(),
        disconnect: jest.fn(),
        config: { url: 'ws://test' },
      } as any));

      await pool.getConnection('ws://localhost:3001');

      const healthMap = pool.getConnectionsHealth();
      expect(healthMap.size).toBe(1);
      expect(Array.from(healthMap.values())[0]).toEqual(mockHealth);
    });
  });

  describe('Connection Cleanup', () => {
    test('should clean up idle connections', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockGetHealth = jest.fn().mockReturnValue({ isConnected: true });
      const mockDisconnect = jest.fn();
      
      MockWebSocketManager.mockImplementation(() => ({
        connect: mockConnect,
        getHealth: mockGetHealth,
        onConnectionChange: jest.fn(),
        disconnect: mockDisconnect,
        config: { url: 'ws://test' },
      } as any));

      await pool.getConnection('ws://localhost:3001');

      // Wait for cleanup interval + timeout
      await new Promise(resolve => setTimeout(resolve, 1600));

      expect(mockDisconnect).toHaveBeenCalled();
    });

    test('should remove specific connection', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockGetHealth = jest.fn().mockReturnValue({ isConnected: true });
      const mockDisconnect = jest.fn();
      
      MockWebSocketManager.mockImplementation(() => ({
        connect: mockConnect,
        getHealth: mockGetHealth,
        onConnectionChange: jest.fn(),
        disconnect: mockDisconnect,
        config: { url: 'ws://test' },
      } as any));

      await pool.getConnection('ws://localhost:3001');

      const stats = pool.getStats();
      expect(stats.totalConnections).toBe(1);

      // Remove connection (we need to access private connections map for testing)
      const connections = (pool as any).connections;
      const connectionId = Array.from(connections.keys())[0];
      pool.removeConnection(connectionId);

      expect(mockDisconnect).toHaveBeenCalled();
      expect(pool.getStats().totalConnections).toBe(0);
    });
  });

  describe('Destruction', () => {
    test('should properly destroy pool and cleanup all connections', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockGetHealth = jest.fn().mockReturnValue({ isConnected: true });
      const mockDisconnect = jest.fn();
      
      MockWebSocketManager.mockImplementation(() => ({
        connect: mockConnect,
        getHealth: mockGetHealth,
        onConnectionChange: jest.fn(),
        disconnect: mockDisconnect,
        config: { url: 'ws://test' },
      } as any));

      await pool.getConnection('ws://localhost:3001');
      await pool.getConnection('ws://localhost:3002');

      pool.destroy();

      expect(mockDisconnect).toHaveBeenCalledTimes(2);
      expect(pool.getStats().totalConnections).toBe(0);
    });
  });
});