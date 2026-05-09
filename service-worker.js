const CACHE_NAME = "raller-ai-cache-v1"; // Change this for updates
const urlsToCache = [
  "/", // Root or index.html
  "index.html",
  "manifest.json",
  "style.css", // Add your CSS file (if any)
  "icon-192.png", // Icon file for your app
  "icon-512.png"  // Another icon file for your app
];

// Event: Install Service Worker and Cache Files
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install Event Initiated");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching Files...");
      return cache.addAll(urlsToCache);
    })
  );
});

// Event: Fetch Files from Cache or Network
self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] Fetch Event for:", event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If cache hit, return cached response
      return response || fetch(event.request);
    })
  );
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
            console.log("[Service Worker] Deleting Cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
