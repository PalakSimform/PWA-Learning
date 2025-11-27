const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `pwa-demo-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pwa-dynamic-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/db.js',
  '/manifest.json'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', event);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event - Multiple caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-first strategy for static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
  // Network-first for API calls
  else if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request));
  }
  // Stale-while-revalidate for images
  else if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Network with fallback for everything else
  else {
    event.respondWith(networkWithFallback(request));
  }
});

// Caching Strategies

// 1. Cache First (good for static assets)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request);
}

// 2. Network First (good for dynamic content)
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || new Response('Offline - No cached data', { status: 503 });
  }
}

// 3. Stale While Revalidate (good for images)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });

  return cached || fetchPromise;
}

// 4. Network with Cache Fallback
async function networkWithFallback(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Return offline page if available
    return caches.match('/index.html');
  }
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  try {
    const db = await openIndexedDB();
    const messages = await getAllPendingMessages(db);
    
    console.log('[SW] Background Sync triggered!');
    console.log('[SW] Pending messages to sync:', messages.length);
    
    if (messages.length === 0) {
      console.log('[SW] No messages to sync');
      return;
    }
    
    for (const message of messages) {
      try {
        console.log('[SW] Syncing message:', message.text);
        console.log('[SW] Message was queued at:', new Date(message.timestamp).toLocaleString());
        
        // Check if online (if offline, this will fail and retry later)
        const response = await fetch('/manifest.json', { method: 'HEAD' });
        if (!response.ok) throw new Error('Offline');
        
        console.log('[SW] Connection verified, syncing to "server"...');
        
        // Delete synced message
        await deleteMessage(db, message.id);
        
        // Calculate how long the message was waiting
        const queuedTime = new Date(message.timestamp).getTime();
        const waitTime = Date.now() - queuedTime;
        const waitSeconds = Math.round(waitTime / 1000);
        
        // Notify user of success with timing info
        await self.registration.showNotification('Background Sync Complete!', {
          body: `Message "${message.text}" synced after ${waitSeconds} second${waitSeconds !== 1 ? 's' : ''}!`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png',
          tag: 'sync-notification',
          requireInteraction: false,
          vibrate: [200, 100, 200]
        });
        
        console.log('[SW] Message synced successfully after', waitSeconds, 'seconds');
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
        // Don't delete the message if sync fails - it will retry
        throw error; // This will cause the sync to be retried
      }
    }
    
    // Notify all clients to update UI
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_COMPLETE' });
    });
    
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error; // Retry sync
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const data = event.data ? event.data.json() : {
    title: 'New Notification',
    body: 'You have a new message!',
    icon: '/icons/icon-192.png'
  };

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// IndexedDB Helper Functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PWADemoDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllPendingMessages(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteMessage(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
