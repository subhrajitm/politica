/**
 * Push Notification Service for PWA
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidPublicKey: string | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  setVapidPublicKey(key: string): void {
    this.vapidPublicKey = key;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notifications are blocked. Please enable them in browser settings.');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      image: payload.image,
      data: payload.data,
      actions: payload.actions,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
      timestamp: payload.timestamp || Date.now(),
    };

    // Use service worker if available, otherwise use browser notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title: payload.title,
          options
        }
      });
    } else {
      new Notification(payload.title, options);
    }
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.vapidPublicKey) {
      throw new Error('VAPID public key not set');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(subscription);
        
        // Unsubscribe locally
        return await subscription.unsubscribe();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error);
      // Don't throw here as we still want to unsubscribe locally
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  politicianUpdate: (politicianName: string, updateType: string): NotificationPayload => ({
    title: 'Politician Update',
    body: `${politicianName} has a new ${updateType}`,
    icon: '/icons/icon-192x192.png',
    tag: 'politician-update',
    data: { type: 'politician-update', politicianName, updateType },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }),

  newsAlert: (headline: string): NotificationPayload => ({
    title: 'Breaking News',
    body: headline,
    icon: '/icons/icon-192x192.png',
    tag: 'news-alert',
    requireInteraction: true,
    data: { type: 'news-alert', headline },
    actions: [
      { action: 'read', title: 'Read More' },
      { action: 'save', title: 'Save for Later' }
    ]
  }),

  favoriteUpdate: (politicianName: string): NotificationPayload => ({
    title: 'Favorite Politician Update',
    body: `New information available for ${politicianName}`,
    icon: '/icons/icon-192x192.png',
    tag: 'favorite-update',
    data: { type: 'favorite-update', politicianName },
    actions: [
      { action: 'view', title: 'View Profile' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }),

  systemNotification: (message: string): NotificationPayload => ({
    title: 'PolitiFind',
    body: message,
    icon: '/icons/icon-192x192.png',
    tag: 'system-notification',
    data: { type: 'system-notification', message }
  })
};

export default PushNotificationService;