/**
 * Real-time Data Synchronization Integration Tests
 * Tests the complete real-time system including Supabase integration
 */

import { EventSystem } from '../EventSystem';
import { PoliticianEventManager } from '../PoliticianEvents';
import { NotificationSystem } from '../NotificationSystem';

// Mock Supabase client
const mockSupabaseClient = {
  channel: jest.fn(),
  realtime: {
    isConnected: jest.fn().mockReturnValue(true),
  },
};

const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockImplementation((callback) => {
    callback('SUBSCRIBED');
    return Promise.resolve();
  }),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
  send: jest.fn().mockResolvedValue(undefined),
};

// Mock createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('Real-time Data Synchronization Integration', () => {
  let eventSystem: EventSystem;
  let politicianEventManager: PoliticianEventManager;
  let notificationSystem: NotificationSystem;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockSupabaseClient.channel.mockReturnValue(mockChannel);

    // Create fresh instances
    eventSystem = new EventSystem();
    politicianEventManager = new PoliticianEventManager();
    notificationSystem = new NotificationSystem();
  });

  afterEach(() => {
    eventSystem.destroy();
    notificationSystem.clearAll();
  });

  describe('Event System Integration', () => {
    test('should initialize event system successfully', async () => {
      // Mock WebSocket connection
      (global as any).WebSocket = class MockWebSocket {
        readyState = 1; // OPEN
        onopen: ((event: Event) => void) | null = null;
        onmessage: ((event: MessageEvent) => void) | null = null;
        onclose: ((event: CloseEvent) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;

        constructor() {
          setTimeout(() => {
            if (this.onopen) {
              this.onopen(new Event('open'));
            }
          }, 10);
        }

        send() {}
        close() {}
      };

      await expect(eventSystem.initialize()).resolves.toBeUndefined();
      expect(eventSystem.getStats().isConnected).toBe(true);
    });

    test('should handle event subscription and emission', async () => {
      const handler = jest.fn();
      
      // Subscribe to event
      const subscriptionId = eventSystem.subscribe('test:event', handler);
      
      // Emit event
      await eventSystem.emit('test:event', { message: 'Hello World' });
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          payload: { message: 'Hello World' },
        })
      );

      // Unsubscribe
      expect(eventSystem.unsubscribe(subscriptionId)).toBe(true);
    });

    test('should handle batch events', async () => {
      const handler = jest.fn();
      eventSystem.subscribe('batch:test', handler);

      await eventSystem.emitBatch([
        { type: 'batch:test', payload: { id: 1 } },
        { type: 'batch:test', payload: { id: 2 } },
        { type: 'batch:test', payload: { id: 3 } },
      ]);

      expect(handler).toHaveBeenCalledTimes(3);
    });

    test('should apply event filters correctly', async () => {
      const handler = jest.fn();
      
      eventSystem.subscribe('filtered:event', handler, {
        filter: {
          userId: 'user123',
          condition: (event) => event.payload.priority === 'high',
        },
      });

      // Should not trigger (wrong user)
      await eventSystem.emit('filtered:event', { priority: 'high' }, { userId: 'user456' });
      expect(handler).not.toHaveBeenCalled();

      // Should not trigger (wrong priority)
      await eventSystem.emit('filtered:event', { priority: 'low' }, { userId: 'user123' });
      expect(handler).not.toHaveBeenCalled();

      // Should trigger (matches filter)
      await eventSystem.emit('filtered:event', { priority: 'high' }, { userId: 'user123' });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Politician Event Management', () => {
    test('should emit and handle politician updates', async () => {
      const updateHandler = jest.fn();
      
      await politicianEventManager.initialize();
      
      const subscriptionId = politicianEventManager.subscribeToPoliticianUpdates(
        'politician123',
        updateHandler
      );

      await politicianEventManager.emitPoliticianUpdate(
        'politician123',
        [{ field: 'name', oldValue: 'Old Name', newValue: 'New Name' }],
        'admin',
        false
      );

      expect(updateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          politicianId: 'politician123',
          changes: [{ field: 'name', oldValue: 'Old Name', newValue: 'New Name' }],
          updatedBy: 'admin',
        })
      );

      politicianEventManager.unsubscribe(subscriptionId);
    });

    test('should emit and handle politician activity', async () => {
      const activityHandler = jest.fn();
      
      await politicianEventManager.initialize();
      
      const subscriptionId = politicianEventManager.subscribeToPoliticianActivity(
        'politician123',
        activityHandler
      );

      await politicianEventManager.emitPoliticianActivity(
        'politician123',
        'view',
        'user456',
        { source: 'profile_page' }
      );

      expect(activityHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          politicianId: 'politician123',
          activityType: 'view',
          userId: 'user456',
          metadata: { source: 'profile_page' },
        })
      );

      politicianEventManager.unsubscribe(subscriptionId);
    });

    test('should handle news updates', async () => {
      const newsHandler = jest.fn();
      
      await politicianEventManager.initialize();
      
      const subscriptionId = politicianEventManager.subscribeToNewsUpdates(
        'politician123',
        newsHandler
      );

      const newsItem = {
        id: 'news123',
        title: 'Breaking News',
        summary: 'Important update',
        source: 'News Source',
        publishedAt: Date.now(),
      };

      await politicianEventManager.emitNewsUpdate('politician123', newsItem);

      expect(newsHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          politicianId: 'politician123',
          newsItem,
        })
      );

      politicianEventManager.unsubscribe(subscriptionId);
    });

    test('should provide politician event statistics', async () => {
      await politicianEventManager.initialize();

      // Emit various events
      await politicianEventManager.emitPoliticianUpdate('pol1', [], 'admin');
      await politicianEventManager.emitPoliticianActivity('pol1', 'view', 'user1');
      await politicianEventManager.emitNewsUpdate('pol1', {
        id: 'news1',
        title: 'News',
        summary: 'Summary',
        source: 'Source',
        publishedAt: Date.now(),
      });

      const stats = politicianEventManager.getPoliticianEventStats('pol1');
      
      expect(stats.updates).toBe(1);
      expect(stats.activities).toBe(1);
      expect(stats.news).toBe(1);
    });
  });

  describe('Notification System', () => {
    test('should show and manage notifications', async () => {
      const handler = jest.fn();
      
      await notificationSystem.initialize();
      const unsubscribe = notificationSystem.subscribe(handler);

      const notificationId = notificationSystem.success(
        'Test Success',
        'This is a test notification'
      );

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Test Success',
          message: 'This is a test notification',
          read: false,
        })
      );

      // Mark as read
      notificationSystem.markAsRead(notificationId);
      
      // Dismiss
      const dismissed = notificationSystem.dismiss(notificationId);
      expect(dismissed).toBe(true);

      unsubscribe();
    });

    test('should handle different notification types', async () => {
      await notificationSystem.initialize();

      const infoId = notificationSystem.info('Info', 'Info message');
      const successId = notificationSystem.success('Success', 'Success message');
      const warningId = notificationSystem.warning('Warning', 'Warning message');
      const errorId = notificationSystem.error('Error', 'Error message');

      const notifications = notificationSystem.getAll();
      expect(notifications).toHaveLength(4);

      const types = notifications.map(n => n.type);
      expect(types).toContain('info');
      expect(types).toContain('success');
      expect(types).toContain('warning');
      expect(types).toContain('error');
    });

    test('should provide notification statistics', async () => {
      await notificationSystem.initialize();

      notificationSystem.info('Info 1', 'Message 1');
      notificationSystem.success('Success 1', 'Message 2');
      notificationSystem.warning('Warning 1', 'Message 3');

      const stats = notificationSystem.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(3);
      expect(stats.byType.info).toBe(1);
      expect(stats.byType.success).toBe(1);
      expect(stats.byType.warning).toBe(1);
    });

    test('should handle notification actions', async () => {
      const actionHandler = jest.fn();
      
      await notificationSystem.initialize();

      notificationSystem.info('Action Test', 'Test with actions', {
        actions: [
          {
            id: 'test_action',
            label: 'Test Action',
            action: actionHandler,
          },
        ],
      });

      const notifications = notificationSystem.getAll();
      const notification = notifications[0];
      
      expect(notification.actions).toHaveLength(1);
      expect(notification.actions![0].label).toBe('Test Action');

      // Execute action
      notification.actions![0].action();
      expect(actionHandler).toHaveBeenCalled();
    });
  });

  describe('Data Consistency', () => {
    test('should maintain event order', async () => {
      const events: any[] = [];
      const handler = (event: any) => events.push(event);
      
      eventSystem.subscribe('order:test', handler);

      // Emit events in sequence
      for (let i = 0; i < 5; i++) {
        await eventSystem.emit('order:test', { sequence: i });
      }

      // Check order is maintained
      for (let i = 0; i < 5; i++) {
        expect(events[i].payload.sequence).toBe(i);
      }
    });

    test('should handle concurrent events', async () => {
      const events: any[] = [];
      const handler = (event: any) => events.push(event);
      
      eventSystem.subscribe('concurrent:test', handler);

      // Emit multiple events concurrently
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(eventSystem.emit('concurrent:test', { id: i }));
      }

      await Promise.all(promises);

      // All events should be received
      expect(events).toHaveLength(10);
      
      // All IDs should be present
      const ids = events.map(e => e.payload.id).sort((a, b) => a - b);
      expect(ids).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    test('should handle event history correctly', async () => {
      // Emit several events
      for (let i = 0; i < 5; i++) {
        await eventSystem.emit('history:test', { sequence: i });
      }

      const allHistory = eventSystem.getHistory();
      const filteredHistory = eventSystem.getHistory('history:test');
      const limitedHistory = eventSystem.getHistory('history:test', 3);

      expect(allHistory.length).toBeGreaterThanOrEqual(5);
      expect(filteredHistory).toHaveLength(5);
      expect(limitedHistory).toHaveLength(3);

      // Check sequence order in limited history (should be last 3)
      expect(limitedHistory[0].payload.sequence).toBe(2);
      expect(limitedHistory[1].payload.sequence).toBe(3);
      expect(limitedHistory[2].payload.sequence).toBe(4);
    });
  });

  describe('Error Handling', () => {
    test('should handle subscription errors gracefully', async () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });

      const normalHandler = jest.fn();

      eventSystem.subscribe('error:test', errorHandler);
      eventSystem.subscribe('error:test', normalHandler);

      // Should not throw despite error in one handler
      await expect(eventSystem.emit('error:test', { data: 'test' })).resolves.toBeUndefined();

      // Normal handler should still be called
      expect(normalHandler).toHaveBeenCalled();
    });

    test('should handle invalid event data', async () => {
      const handler = jest.fn();
      eventSystem.subscribe('invalid:test', handler);

      // Should handle undefined payload
      await eventSystem.emit('invalid:test', undefined);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: undefined,
        })
      );

      // Should handle null payload
      await eventSystem.emit('invalid:test', null);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: null,
        })
      );
    });
  });

  describe('Performance', () => {
    test('should handle high-frequency events', async () => {
      const handler = jest.fn();
      eventSystem.subscribe('performance:test', handler);

      const startTime = Date.now();
      
      // Emit 1000 events
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(eventSystem.emit('performance:test', { id: i }));
      }

      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(handler).toHaveBeenCalledTimes(1000);
    });

    test('should handle many subscribers efficiently', async () => {
      const handlers = [];
      
      // Create 100 subscribers
      for (let i = 0; i < 100; i++) {
        const handler = jest.fn();
        handlers.push(handler);
        eventSystem.subscribe('many:subscribers', handler);
      }

      const startTime = Date.now();
      
      // Emit single event to all subscribers
      await eventSystem.emit('many:subscribers', { message: 'broadcast' });
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete quickly
      expect(duration).toBeLessThan(1000); // 1 second
      
      // All handlers should be called
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledTimes(1);
      });
    });
  });
});