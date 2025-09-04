/**
 * PWA Manager - Handles Progressive Web App functionality
 */

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAManager {
  isInstallable(): boolean;
  isInstalled(): boolean;
  promptInstall(): Promise<boolean>;
  updateServiceWorker(): Promise<void>;
  registerServiceWorker(): Promise<ServiceWorkerRegistration | null>;
  unregisterServiceWorker(): Promise<boolean>;
  getInstallPrompt(): PWAInstallPrompt | null;
}

class PWAManagerImpl implements PWAManager {
  private installPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      this.notifyInstallAvailable();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.notifyAppInstalled();
    });

    // Register service worker
    this.registerServiceWorker();
  }

  isInstallable(): boolean {
    return this.installPrompt !== null;
  }

  isInstalled(): boolean {
    // Check if app is running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.installPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error prompting for install:', error);
      return false;
    }
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('Service Worker registered successfully');

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      
      // If there's a waiting service worker, activate it
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  async unregisterServiceWorker(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  getInstallPrompt(): PWAInstallPrompt | null {
    return this.installPrompt;
  }

  private notifyInstallAvailable(): void {
    // Dispatch custom event for install availability
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private notifyAppInstalled(): void {
    // Dispatch custom event for app installation
    window.dispatchEvent(new CustomEvent('pwa-app-installed'));
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for update availability
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }
}

// Singleton instance
let pwaManager: PWAManager | null = null;

export function getPWAManager(): PWAManager {
  if (!pwaManager) {
    pwaManager = new PWAManagerImpl();
  }
  return pwaManager;
}

// Push notification utilities
export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;

  constructor(registration: ServiceWorkerRegistration | null) {
    this.registration = registration;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    return await Notification.requestPermission();
  }

  async subscribe(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        return await subscription.unsubscribe();
      }
      return true;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
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

export function getPushNotificationManager(registration: ServiceWorkerRegistration | null): PushNotificationManager {
  return new PushNotificationManager(registration);
}