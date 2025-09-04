/**
 * React hook for PWA functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { getPWAManager, getPushNotificationManager, type PWAManager, type PushNotificationManager } from '@/lib/pwa/PWAManager';

export interface UsePWAReturn {
  // Installation
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<boolean>;
  
  // Service Worker
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
  updateServiceWorker: () => Promise<void>;
  
  // Push Notifications
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToPush: (vapidKey: string) => Promise<PushSubscription | null>;
  unsubscribeFromPush: () => Promise<boolean>;
  
  // Update management
  isUpdateAvailable: boolean;
  applyUpdate: () => Promise<void>;
}

export function usePWA(): UsePWAReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isServiceWorkerSupported] = useState('serviceWorker' in navigator);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [pwaManager] = useState<PWAManager>(() => getPWAManager());
  const [pushManager, setPushManager] = useState<PushNotificationManager | null>(null);

  useEffect(() => {
    // Initialize PWA state
    setIsInstallable(pwaManager.isInstallable());
    setIsInstalled(pwaManager.isInstalled());
    
    // Initialize notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Register service worker and get push manager
    pwaManager.registerServiceWorker().then((registration) => {
      setIsServiceWorkerRegistered(!!registration);
      if (registration) {
        setPushManager(getPushNotificationManager(registration));
      }
    });

    // Listen for PWA events
    const handleInstallAvailable = () => {
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
    };

    const handleUpdateAvailable = () => {
      setIsUpdateAvailable(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-app-installed', handleAppInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, [pwaManager]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const result = await pwaManager.promptInstall();
    if (result) {
      setIsInstallable(false);
      setIsInstalled(true);
    }
    return result;
  }, [pwaManager]);

  const updateServiceWorker = useCallback(async (): Promise<void> => {
    await pwaManager.updateServiceWorker();
    setIsUpdateAvailable(false);
    // Reload the page to activate the new service worker
    window.location.reload();
  }, [pwaManager]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!pushManager) {
      throw new Error('Push manager not available');
    }

    const permission = await pushManager.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }, [pushManager]);

  const subscribeToPush = useCallback(async (vapidKey: string): Promise<PushSubscription | null> => {
    if (!pushManager) {
      throw new Error('Push manager not available');
    }

    if (notificationPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return null;
      }
    }

    return await pushManager.subscribe(vapidKey);
  }, [pushManager, notificationPermission, requestNotificationPermission]);

  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!pushManager) {
      return false;
    }

    return await pushManager.unsubscribe();
  }, [pushManager]);

  const applyUpdate = useCallback(async (): Promise<void> => {
    await updateServiceWorker();
  }, [updateServiceWorker]);

  return {
    // Installation
    isInstallable,
    isInstalled,
    promptInstall,
    
    // Service Worker
    isServiceWorkerSupported,
    isServiceWorkerRegistered,
    updateServiceWorker,
    
    // Push Notifications
    notificationPermission,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    
    // Update management
    isUpdateAvailable,
    applyUpdate,
  };
}

// Utility hook for detecting PWA display mode
export function usePWADisplayMode() {
  const [displayMode, setDisplayMode] = useState<'browser' | 'standalone' | 'minimal-ui' | 'fullscreen'>('browser');

  useEffect(() => {
    const getDisplayMode = () => {
      if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'fullscreen';
      }
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
      }
      if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
      }
      return 'browser';
    };

    setDisplayMode(getDisplayMode());

    // Listen for display mode changes
    const mediaQueries = [
      window.matchMedia('(display-mode: fullscreen)'),
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: minimal-ui)'),
    ];

    const handleChange = () => {
      setDisplayMode(getDisplayMode());
    };

    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
    };
  }, []);

  return displayMode;
}

// Hook for PWA installation banner
export function usePWAInstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';
    setBannerDismissed(dismissed);

    // Show banner if installable and not dismissed
    setShowBanner(isInstallable && !dismissed && !isInstalled);
  }, [isInstallable, isInstalled]);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    setBannerDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  }, []);

  const install = useCallback(async () => {
    const success = await promptInstall();
    if (success) {
      setShowBanner(false);
    }
    return success;
  }, [promptInstall]);

  return {
    showBanner,
    dismissBanner,
    install,
  };
}