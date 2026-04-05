// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SERVICE WORKER — Rep Counter PWA
//  Gère le timer de repos en arrière-plan + notifications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CACHE_NAME = "rep-counter-v1";
const ASSETS = ["/", "/index.html", "/manifest.json"];

// ── Installation ──
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activation ──
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch (cache first pour les assets) ──
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TIMER DE REPOS EN ARRIÈRE-PLAN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let restTimer = null;

self.addEventListener("message", (e) => {
  const { type, payload } = e.data || {};

  // Démarrer le timer de repos
  if (type === "START_REST") {
    const { duration, exerciseName } = payload;
    const endTime = Date.now() + duration * 1000;

    // Annuler un timer précédent si existant
    if (restTimer) clearTimeout(restTimer);

    restTimer = setTimeout(() => {
      // Envoyer notification
      self.registration.showNotification("💥 C'EST PARTI !", {
        body: `Repos terminé — ${exerciseName}`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "rest-done",
        renotify: true,
        requireInteraction: false,
        vibrate: [200, 100, 200, 100, 400],
        data: { url: "/" },
        actions: [
          { action: "open", title: "Ouvrir l'app" }
        ]
      });

      // Informer l'app si elle est ouverte
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "REST_DONE" }));
      });

      restTimer = null;
    }, duration * 1000);

    // Confirmer à l'app
    e.source?.postMessage({ type: "REST_STARTED", endTime });
  }

  // Annuler le timer (si l'utilisateur passe la séance)
  if (type === "CANCEL_REST") {
    if (restTimer) {
      clearTimeout(restTimer);
      restTimer = null;
    }
  }
});

// ── Clic sur la notification ──
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Si l'app est déjà ouverte, la mettre au premier plan
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      // Sinon l'ouvrir
      return self.clients.openWindow("/");
    })
  );
});