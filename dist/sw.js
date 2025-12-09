const CACHE_NAME = "pir-motion-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/main.tsx",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Motion Detected";
  const options = {
    body: data.body || "PIR sensor triggered",
    icon: "/pir_icon.png",
    badge: "/pir_icon.png",
    vibrate: [200, 100, 200],
    tag: "motion-detection",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});












