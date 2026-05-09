const CACHE_NAME = "raller-ai-cache-v1";
const urlsToCache = [
  "/",
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
];

// Event: Install Service Worker and Cache Files
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install Event Initiated");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching Files...");
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn("[Service Worker] Some files could not be cached:", err);
        // Don't fail the install if some files are missing
      });
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Event: Fetch Files from Cache or Network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle external requests (like Jotform) - go online first
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful external requests
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if offline
          return caches.match(request);
        })
    );
  } else {
    // Handle local requests - cache first strategy
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
  }
});

// Event: Remove Old Caches on Activation
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate Event Initiated");
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("[Service Worker] Deleting Old Cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of pages immediately
});
