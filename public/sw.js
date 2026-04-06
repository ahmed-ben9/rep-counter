const CACHE_NAME = "rep-counter-v8";
const ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// ── Web Push (VAPID) ──
self.addEventListener("push", (e) => {
  let data = { title: "💥 C'EST PARTI !", body: "Repos terminé — reprends la série !" };
  try { data = e.data.json(); } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "rest-done",
      renotify: true,
      vibrate: [200, 100, 200, 100, 400],
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow("/");
    })
  );
});

// ── Fallback timer message ──
let restTimer = null;
self.addEventListener("message", (e) => {
  const { type, payload } = e.data || {};
  if (type === "START_REST") {
    if (restTimer) clearTimeout(restTimer);
    restTimer = setTimeout(() => {
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: "REST_DONE" }));
      });
      restTimer = null;
    }, payload.duration * 1000);
  }
  if (type === "CANCEL_REST") {
    if (restTimer) { clearTimeout(restTimer); restTimer = null; }
  }
});
