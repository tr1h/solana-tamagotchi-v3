// ============================================
// SERVICE WORKER - PWA SUPPORT
// ============================================

const CACHE_NAME = 'solana-tamagotchi-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/mobile.css',
    '/css/animations.css',
    '/js/utils.js',
    '/js/wallet.js',
    '/js/game.js',
    '/js/achievements.js',
    '/js/ui.js',
    '/js/database.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
];

// Install event - cache files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
        .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome extensions
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    // Skip Solana RPC and Firebase
    if (
        event.request.url.includes('solana.com') ||
        event.request.url.includes('firebase') ||
        event.request.url.includes('firestore')
    ) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Return offline page or fallback
                return caches.match('/index.html');
            })
    );
});

// Background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-game-data') {
        event.waitUntil(syncGameData());
    }
});

// Sync game data
async function syncGameData() {
    try {
        // Get pending sync data from IndexedDB
        const db = await openDB();
        const tx = db.transaction('syncQueue', 'readonly');
        const store = tx.objectStore('syncQueue');
        const pendingData = await store.getAll();
        
        // Sync each item
        for (const item of pendingData) {
            await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
            });
            
            // Remove from queue
            const deleteTx = db.transaction('syncQueue', 'readwrite');
            await deleteTx.objectStore('syncQueue').delete(item.id);
        }
        
        console.log('Game data synced successfully');
    } catch (error) {
        console.error('Failed to sync game data:', error);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Your pet needs attention!',
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        vibrate: [200, 100, 200],
        tag: 'pet-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'feed',
                title: 'Feed Pet',
                icon: '/icons/feed.png'
            },
            {
                action: 'play',
                title: 'Play',
                icon: '/icons/play.png'
            }
        ],
        data: {
            url: '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('🐾 Solana Tamagotchi', options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'feed') {
        event.waitUntil(
            clients.openWindow('/?action=feed')
        );
    } else if (event.action === 'play') {
        event.waitUntil(
            clients.openWindow('/?action=play')
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handler
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(event.data.urls))
        );
    }
});

// Periodic sync (for background updates)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-pet-stats') {
        event.waitUntil(updatePetStats());
    }
});

// Update pet stats in background
async function updatePetStats() {
    try {
        const clients = await self.clients.matchAll();
        
        clients.forEach((client) => {
            client.postMessage({
                type: 'UPDATE_PET_STATS',
                timestamp: Date.now()
            });
        });
    } catch (error) {
        console.error('Failed to update pet stats:', error);
    }
}

// IndexedDB helper
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TamagotchiDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
            
            if (!db.objectStoreNames.contains('gameData')) {
                db.createObjectStore('gameData', { keyPath: 'key' });
            }
        };
    });
}

// Log version
console.log(`Service Worker ${CACHE_NAME} loaded`);




