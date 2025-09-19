// Service Worker for ForMyPet App
const CACHE_NAME = 'formypet-v1';
const STATIC_CACHE = 'formypet-static-v1';
const DYNAMIC_CACHE = 'formypet-dynamic-v1';
const IMAGE_CACHE = 'formypet-images-v1';

// Cache size limits (in bytes)
const CACHE_SIZE_LIMITS = {
  [STATIC_CACHE]: 10 * 1024 * 1024, // 10MB
  [DYNAMIC_CACHE]: 15 * 1024 * 1024, // 15MB  
  [IMAGE_CACHE]: 50 * 1024 * 1024, // 50MB
};

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/app-icon.png',
  '/notification-icon.png',
  '/splash-paws.png',
  // Core app assets will be cached dynamically
];

// API routes that should work offline with cached data
const API_ROUTES = [
  '/api/pets',
  '/api/events', 
  '/api/expenses',
  '/api/achievements'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 ForMyPet SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 ForMyPet SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ ForMyPet SW: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ ForMyPet SW: Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 ForMyPet SW: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
              console.log('🗑️ ForMyPet SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ ForMyPet SW: Cleanup complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    // API requests - network first, cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/i)) {
    // Images - cache first with size management
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.match(/\.(js|css|woff2?)$/)) {
    // Static assets - cache first
    event.respondWith(handleStaticAsset(request));
  } else {
    // App shell - cache first, network fallback
    event.respondWith(handleAppShell(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    console.log('🌐 ForMyPet SW: API request:', request.url);
    
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('📥 ForMyPet SW: API response cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 ForMyPet SW: Network failed, trying cache for:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('💾 ForMyPet SW: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'No network connection and no cached data available',
        offline: true 
      }), 
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('💾 ForMyPet SW: Serving static asset from cache:', request.url);
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    console.log('🌐 ForMyPet SW: Fetching static asset from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('📥 ForMyPet SW: Static asset cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ ForMyPet SW: Failed to fetch static asset:', request.url, error);
    // Could return a fallback asset here
    throw error;
  }
}

// Handle image requests with intelligent caching
async function handleImageRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('💾 ForMyPet SW: Serving image from cache:', request.url);
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    console.log('🌐 ForMyPet SW: Fetching image from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Check if it's a reasonable size to cache (< 5MB per image)
      const contentLength = networkResponse.headers.get('content-length');
      const imageSize = contentLength ? parseInt(contentLength) : 0;
      
      if (imageSize < 5 * 1024 * 1024) { // 5MB limit per image
        const cache = await caches.open(IMAGE_CACHE);
        
        // Check cache size and clean if needed
        await manageCacheSize(IMAGE_CACHE, CACHE_SIZE_LIMITS[IMAGE_CACHE]);
        
        cache.put(request, networkResponse.clone());
        console.log('📥 ForMyPet SW: Image cached:', request.url, `(${(imageSize / 1024).toFixed(1)}KB)`);
      } else {
        console.log('⚠️ ForMyPet SW: Image too large to cache:', request.url, `(${(imageSize / 1024 / 1024).toFixed(1)}MB)`);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ ForMyPet SW: Failed to fetch image:', request.url, error);
    
    // Return a fallback image for pet avatars
    if (request.url.includes('avatar') || request.url.includes('pet')) {
      return new Response(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#f3f4f6"/>
          <text x="100" y="100" text-anchor="middle" dy="0.35em" font-family="system-ui, sans-serif" font-size="60">🐾</text>
        </svg>
      `, {
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    
    throw error;
  }
}

// Manage cache size by removing oldest entries
async function manageCacheSize(cacheName, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    if (requests.length === 0) return;
    
    // Calculate current cache size
    let totalSize = 0;
    const entries = [];
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const size = response.headers.get('content-length');
        const entrySize = size ? parseInt(size) : 10000; // Estimate 10KB if unknown
        totalSize += entrySize;
        
        entries.push({
          request,
          size: entrySize,
          date: new Date(response.headers.get('date') || Date.now())
        });
      }
    }
    
    // If cache is too large, remove oldest entries
    if (totalSize > maxSize) {
      console.log(`🧹 ForMyPet SW: Cache ${cacheName} is ${(totalSize / 1024 / 1024).toFixed(1)}MB, cleaning up...`);
      
      // Sort by date (oldest first)
      entries.sort((a, b) => a.date - b.date);
      
      let removedSize = 0;
      const targetSize = maxSize * 0.8; // Remove until we're at 80% of limit
      
      for (const entry of entries) {
        if (totalSize - removedSize <= targetSize) break;
        
        await cache.delete(entry.request);
        removedSize += entry.size;
        console.log(`🗑️ ForMyPet SW: Removed cached item: ${entry.request.url}`);
      }
      
      console.log(`✅ ForMyPet SW: Cache cleanup complete. Removed ${(removedSize / 1024 / 1024).toFixed(1)}MB`);
    }
  } catch (error) {
    console.error(`❌ ForMyPet SW: Cache size management failed for ${cacheName}:`, error);
  }

// Handle app shell with cache-first strategy
async function handleAppShell(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('💾 ForMyPet SW: Serving app shell from cache:', request.url);
      
      // Update cache in background
      fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const cache = caches.open(DYNAMIC_CACHE);
          cache.then(c => c.put(request, networkResponse));
        }
      }).catch(() => {
        // Network update failed, but we have cache
      });
      
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    console.log('🌐 ForMyPet SW: Fetching app shell from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('📥 ForMyPet SW: App shell cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 ForMyPet SW: Network failed for app shell:', request.url);
    
    // Return the main app shell for navigation requests
    const cachedAppShell = await caches.match('/');
    if (cachedAppShell) {
      console.log('💾 ForMyPet SW: Serving root app shell for navigation');
      return cachedAppShell;
    }
    
    // No app shell available - return offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ForMyPet - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: #f8fafc; 
            }
            .container { 
              max-width: 400px; 
              margin: 0 auto; 
              background: white; 
              padding: 2rem; 
              border-radius: 1rem; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
            }
            .emoji { font-size: 3rem; margin-bottom: 1rem; }
            h1 { color: #1f2937; margin-bottom: 0.5rem; }
            p { color: #6b7280; margin-bottom: 1.5rem; }
            .btn { 
              background: #3b82f6; 
              color: white; 
              padding: 0.75rem 1.5rem; 
              border: none; 
              border-radius: 0.5rem; 
              cursor: pointer; 
              text-decoration: none; 
              display: inline-block; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">🐕💤</div>
            <h1>ForMyPet</h1>
            <p>Δεν υπάρχει σύνδεση στο διαδίκτυο. Παρακαλώ ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.</p>
            <button class="btn" onclick="window.location.reload()">Δοκιμή ξανά</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for queued actions
self.addEventListener('sync', (event) => {
  console.log('🔄 ForMyPet SW: Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncQueuedData());
  }
});

// Sync queued data when back online
async function syncQueuedData() {
  try {
    // Get queued data from IndexedDB or localStorage
    const queuedActions = await getQueuedActions();
    
    for (const action of queuedActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove from queue on success
        await removeFromQueue(action.id);
        console.log('✅ ForMyPet SW: Synced queued action:', action.id);
      } catch (error) {
        console.error('❌ ForMyPet SW: Failed to sync action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('❌ ForMyPet SW: Background sync failed:', error);
  }
}

// Helper functions for queue management (to be implemented with IndexedDB)
async function getQueuedActions() {
  // TODO: Implement with IndexedDB
  return [];
}

async function removeFromQueue(actionId) {
  // TODO: Implement with IndexedDB
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 ForMyPet SW: Push notification received');
  
  const options = {
    body: 'You have a new notification from ForMyPet',
    icon: '/app-icon.png',
    badge: '/notification-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    }
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data.url = data.url || options.data.url;
  }
  
  event.waitUntil(
    self.registration.showNotification('ForMyPet', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 ForMyPet SW: Notification clicked');
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if app is already open
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('🎉 ForMyPet SW: Service Worker loaded successfully');