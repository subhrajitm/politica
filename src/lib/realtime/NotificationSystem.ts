/**
 * Live Notification System
 * Handles real-time notifications for users
 */

import { eventSystem } from './EventSystem';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  userId?: string;
  read: boolean;
  persistent: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void | Promise<void>;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationConfig {
  maxNotifications: number;
  defaultDuration: number;
  enableSound: boolean;
  enablePersistence: boolean;
}

export type NotificationHandler = (notification: Notification) => void;

export class NotificationSystem {
  private notifications: Map<string, Notification> = new Map();
  private handlers: Set<NotificationHandler> = new Set();
  private config: NotificationConfig;
  private notificationCounter = 0;
  private initialized = false;

  constructor(config: Partial<NotificationConfig> = {}) {
    this.config = {
      maxNotifications: config.maxNotifications || 50,
      defaultDuration: config.defaultDuration || 5000,
      enableSound: config.enableSound ?? true,
      enablePersistence: config.enablePersistence ?? true,
    };
  }

  /**
   * Initialize notification system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await eventSystem.initialize();

    // Subscribe to notification events
    eventSystem.subscribe('notification:show', (event) => {
      this.handleNotificationEvent(event.payload);
    });

    eventSystem.subscribe('notification:dismiss', (event) => {
      this.dismiss(event.payload.notificationId);
    });

    eventSystem.subscribe('notification:clear_all', () => {
      this.clearAll();
    });

    // Subscribe to politician events for automatic notifications
    this.setupPoliticianNotifications();

    this.initialized = true;
  }

  /**
   * Show a notification
   */
  show(
    type: Notification['type'],
    title: string,
    message: string,
    options: {
      userId?: string;
      persistent?: boolean;
      duration?: number;
      actions?: NotificationAction[];
      metadata?: Record<string, any>;
      broadcast?: boolean;
    } = {}
  ): string {
    const notification: Notification = {
      id: this.generateNotificationId(),
      type,
      title,
      message,
      timestamp: Date.now(),
      userId: options.userId,
      read: false,
      persistent: options.persistent ?? false,
      actions: options.actions,
      metadata: options.metadata,
    };

    // Add to local storage
    this.notifications.set(notification.id, notification);

    // Trim notifications if exceeding max
    this.trimNotifications();

    // Notify handlers
    this.notifyHandlers(notification);

    // Play sound if enabled
    if (this.config.enableSound) {
      this.playNotificationSound(type);
    }

    // Auto-dismiss if not persistent
    if (!notification.persistent) {
      const duration = options.duration || this.config.defaultDuration;
      setTimeout(() => {
        this.dismiss(notification.id);
      }, duration);
    }

    // Broadcast if requested
    if (options.broadcast) {
      eventSystem.emit('notification:show', notification, {
        broadcast: true,
        userId: options.userId,
      });
    }

    return notification.id;
  }

  /**
   * Show success notification
   */
  success(title: string, message: string, options?: Parameters<typeof this.show>[3]): string {
    return this.show('success', title, message, options);
  }

  /**
   * Show info notification
   */
  info(title: string, message: string, options?: Parameters<typeof this.show>[3]): string {
    return this.show('info', title, message, options);
  }

  /**
   * Show warning notification
   */
  warning(title: string, message: string, options?: Parameters<typeof this.show>[3]): string {
    return this.show('warning', title, message, options);
  }

  /**
   * Show error notification
   */
  error(title: string, message: string, options?: Parameters<typeof this.show>[3]): string {
    return this.show('error', title, message, { ...options, persistent: true });
  }

  /**
   * Dismiss a notification
   */
  dismiss(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    this.notifications.delete(notificationId);
    
    // Notify handlers about dismissal
    this.handlers.forEach(handler => {
      try {
        handler({ ...notification, read: true } as Notification);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });

    return true;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.read = true;
    this.notifications.set(notificationId, notification);
    
    return true;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    for (const [id, notification] of this.notifications) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.clear();
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get unread notifications
   */
  getUnread(): Notification[] {
    return this.getAll().filter(n => !n.read);
  }

  /**
   * Get notifications for specific user
   */
  getForUser(userId: string): Notification[] {
    return this.getAll().filter(n => n.userId === userId);
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(handler: NotificationHandler): () => void {
    this.handlers.add(handler);
    
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Get notification statistics
   */
  getStats(): {
    total: number;
    unread: number;
    byType: Record<Notification['type'], number>;
  } {
    const notifications = this.getAll();
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<Notification['type'], number>);

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType,
    };
  }

  /**
   * Handle incoming notification events
   */
  private handleNotificationEvent(notification: Notification): void {
    // Add to local storage
    this.notifications.set(notification.id, notification);
    this.trimNotifications();

    // Notify handlers
    this.notifyHandlers(notification);

    // Play sound if enabled
    if (this.config.enableSound) {
      this.playNotificationSound(notification.type);
    }
  }

  /**
   * Setup automatic notifications for politician events
   */
  private setupPoliticianNotifications(): void {
    // Politician updated
    eventSystem.subscribe('politician:updated', (event) => {
      const payload = event.payload as any;
      this.info(
        'Politician Updated',
        `Information for politician has been updated`,
        {
          metadata: { politicianId: payload.politicianId },
          duration: 3000,
        }
      );
    });

    // News updates
    eventSystem.subscribe('politician:news', (event) => {
      const payload = event.payload as any;
      this.info(
        'News Update',
        `New article: ${payload.newsItem.title}`,
        {
          metadata: { politicianId: payload.politicianId },
          actions: [{
            id: 'view_news',
            label: 'View Article',
            action: () => {
              // Navigate to news article
              window.open(payload.newsItem.url, '_blank');
            },
          }],
        }
      );
    });

    // Trending updates
    eventSystem.subscribe('politician:trending', (event) => {
      const payload = event.payload as any;
      if (payload.category === 'rising') {
        this.info(
          'Trending Alert',
          `A politician is trending up in popularity`,
          {
            metadata: { politicianId: payload.politicianId },
            duration: 4000,
          }
        );
      }
    });

    // System events
    eventSystem.subscribe('system:connected', () => {
      this.success('Connected', 'Real-time updates are now active', {
        duration: 2000,
      });
    });

    eventSystem.subscribe('system:disconnected', () => {
      this.warning('Disconnected', 'Real-time updates are temporarily unavailable', {
        persistent: true,
      });
    });
  }

  /**
   * Notify all handlers
   */
  private notifyHandlers(notification: Notification): void {
    this.handlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });
  }

  /**
   * Trim notifications to max limit
   */
  private trimNotifications(): void {
    if (this.notifications.size <= this.config.maxNotifications) return;

    const notifications = this.getAll();
    const toRemove = notifications.slice(this.config.maxNotifications);
    
    toRemove.forEach(notification => {
      this.notifications.delete(notification.id);
    });
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(type: Notification['type']): void {
    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Different frequencies for different notification types
      const frequencies = {
        info: 800,
        success: 1000,
        warning: 600,
        error: 400,
      };

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

    } catch (error) {
      // Silently fail if audio is not supported
      console.debug('Notification sound failed:', error);
    }
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${++this.notificationCounter}`;
  }
}

// Singleton instance
export const notificationSystem = new NotificationSystem();