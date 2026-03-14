/**
 * Service Worker for Form Analyzer PWA
 * Handles caching with proper versioning for iOS compatibility
 */

const CACHE_NAME = 'form-analyzer-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Skip MediaPipe CDN requests (always fetch fresh)
  if (request.url.includes('cdn.jsdelivr.net')) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If it's a navigation request, return index.html
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          
          throw new Error('Network and cache both failed');
        });
      })
  );
});

// Message event - handle skip waiting from client
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
