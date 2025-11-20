// Service Worker for Smart Service Hub PWA
const CACHE_NAME = 'smart-service-hub-v1'
const RUNTIME_CACHE = 'smart-service-hub-runtime-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets')
      return cache.addAll(ASSETS_TO_CACHE)
    }).then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API calls - let them go to network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE)
            cache.then((c) => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Return cached API response if network fails
          return caches.match(request)
        })
    )
    return
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response
            }

            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // Return offline page if available
            return caches.match('/offline.html')
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings())
  }
})

async function syncBookings() {
  try {
    const cache = await caches.open(RUNTIME_CACHE)
    const requests = await cache.keys()
    
    for (const request of requests) {
      if (request.url.includes('/api/bookings')) {
        try {
          const response = await fetch(request)
          if (response.ok) {
            await cache.put(request, response)
          }
        } catch (error) {
          console.log('Sync failed:', error)
        }
      }
    }
  } catch (error) {
    console.log('Background sync error:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    tag: 'notification',
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification('Smart Service Hub', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

console.log('Service Worker loaded')
