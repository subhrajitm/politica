// Basic service worker to prevent 404 errors
// This is a minimal service worker that doesn't do anything
// but prevents the browser from showing 404 errors

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(self.clients.claim());
});

// No fetch event listener - let all requests go through normally
