/**
 * Service Worker for PWA functionality, asset caching and offline functionality
 */

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `politifind-assets-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `politifind-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `politifind-dynamic-v${CACHE_VERSION}`;
const OFFLINE_CACHE_NAME = `politifind-offline-v${CACHE_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/browserconfig.xml',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Critical pages to cache for offline access
const OFFLINE_PAGES = [
  '/',
  '/browse',
  '/favourites',
  '/offline',
];

// API endpoints to cache
const CACHE_API_PATTERNS = [
  '/api/politicians',
  '/api/search',
  '/api/settings',
];

// Cache strategies for different asset types
const CACHE_STRATEGIES = {
  images: 'cache-first',
  api: 'network-first',
  static: 'cache-first',
  pages: 'network-first',
};

// Install event - cache static assets and offline pages
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          console.log('Caching static assets...');
          return cache.addAll(STATIC_ASSETS);
        }),
      
      // Cache offline pages
      caches.open(OFFLINE_CACHE_NAME)
        .then((cache) => {
          console.log('Caching offline pages...');
          return cache.addAll(OFFLINE_PAGES);
        })
    ])
    .then(() => {
      console.log('All assets cached successfully');
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('Failed to cache assets:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  const currentCaches = [CACHE_NAME, STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, OFFLINE_CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy based on request type
  let strategy = 'network-first';
  let cacheName = DYNAMIC_CACHE_NAME;
  
  if (isImageRequest(request)) {
    strategy = CACHE_STRATEGIES.images;
    cacheName = CACHE_NAME;
  } else if (isAPIRequest(request)) {
    strategy = CACHE_STRATEGIES.api;
    cacheName = DYNAMIC_CACHE_NAME;
  } else if (isStaticAsset(request)) {
    strategy = CACHE_STRATEGIES.static;
    cacheName = STATIC_CACHE_NAME;
  } else if (isPageRequest(request)) {
    strategy = CACHE_STRATEGIES.pages;
    cacheName = DYNAMIC_CACHE_NAME;
  }
  
  // Apply the determined strategy
  if (strategy === 'cache-first') {
    event.respondWith(cacheFirst(request, cacheName));
  } else if (strategy === 'network-first') {
    event.respondWith(networkFirst(request, cacheName));
  }
});

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    
    // Try to return cached version as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network request failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Helper functions to determine request types
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(new URL(request.url).pathname);
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         request.url.includes('supabase.co');
}

function isStaticAsset(request) {
  return request.destination === 'font' ||
         request.destination === 'style' ||
         request.destination === 'script' ||
         /\.(css|js|woff|woff2|ttf|otf)$/i.test(new URL(request.url).pathname);
}

function isPageRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Performing background sync...');
  
  try {
    // Get background sync tasks from localStorage
    const tasks = getBackgroundSyncTasks();
    
    if (tasks.length === 0) {
      console.log('No background sync tasks to process');
      return;
    }

    console.log(`Processing ${tasks.length} background sync tasks`);
    
    const completedTasks = [];
    const failedTasks = [];

    for (const task of tasks) {
      try {
        const success = await processBackgroundSyncTask(task);
        if (success) {
          completedTasks.push(task.id);
        } else {
          task.retries = (task.retries || 0) + 1;
          if (task.retries < (task.maxRetries || 3)) {
            failedTasks.push(task);
          }
        }
      } catch (error) {
        console.error('Error processing background sync task:', error);
        task.retries = (task.retries || 0) + 1;
        if (task.retries < (task.maxRetries || 3)) {
          failedTasks.push(task);
        }
      }
    }

    // Update tasks in localStorage
    saveBackgroundSyncTasks(failedTasks);
    
    console.log(`Background sync completed: ${completedTasks.length} successful, ${failedTasks.length} failed`);
    
    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        payload: { completed: completedTasks.length, failed: failedTasks.length }
      });
    });
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function getBackgroundSyncTasks() {
  try {
    const tasks = self.localStorage?.getItem('background_sync_tasks');
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Failed to get background sync tasks:', error);
    return [];
  }
}

function saveBackgroundSyncTasks(tasks) {
  try {
    if (self.localStorage) {
      self.localStorage.setItem('background_sync_tasks', JSON.stringify(tasks));
    }
  } catch (error) {
    console.error('Failed to save background sync tasks:', error);
  }
}

async function processBackgroundSyncTask(task) {
  const { type, action, data } = task;
  
  let endpoint;
  let method = 'POST';
  
  switch (type) {
    case 'favourite':
      endpoint = action === 'add' ? '/api/favourites/add' : '/api/favourites/remove';
      break;
    case 'search':
      endpoint = '/api/search/history';
      break;
    case 'interaction':
      endpoint = '/api/interactions/track';
      break;
    case 'settings':
      endpoint = '/api/settings';
      method = 'PUT';
      break;
    default:
      console.warn('Unknown background sync task type:', type);
      return false;
  }
  
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to process background sync task:', error);
    return false;
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    image: data.image,
    data: data.data,
    actions: data.actions,
    tag: data.tag,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    timestamp: data.timestamp || Date.now(),
    vibrate: data.vibrate || [200, 100, 200],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  let url = '/';
  
  if (event.action) {
    // Handle action clicks
    console.log('Notification action clicked:', event.action);
    
    switch (event.action) {
      case 'view':
        url = data.url || '/';
        break;
      case 'read':
        url = data.url || '/';
        break;
      case 'save':
        // Handle save action
        url = '/favourites';
        break;
      case 'dismiss':
        return; // Just close, don't open anything
      default:
        url = data.url || '/';
    }
  } else {
    // Handle notification click
    url = data.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Message handling for PWA features
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'SHOW_NOTIFICATION':
      if (payload && payload.title) {
        self.registration.showNotification(payload.title, payload.options);
      }
      break;
      
    case 'CACHE_URLS':
      if (payload && payload.urls) {
        cacheUrls(payload.urls);
      }
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Helper function to cache specific URLs
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    await cache.addAll(urls);
    console.log('URLs cached successfully:', urls);
  } catch (error) {
    console.error('Failed to cache URLs:', error);
  }
}

// Helper function to get cache status
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = keys.length;
    }
    
    return status;
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return {};
  }
}

console.log('Service Worker loaded successfully');