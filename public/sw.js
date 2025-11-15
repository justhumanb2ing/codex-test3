const CACHE_NAME = "codex-offline-cache-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || request.url.startsWith("chrome-extension")) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        if (
          response &&
          response.status === 200 &&
          response.type === "basic" &&
          !request.url.includes("/_next/")
        ) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return cached ?? Response.error();
      }
    }),
  );
});

self.addEventListener("message", (event) => {
  if (
    event.data &&
    typeof event.data === "object" &&
    event.data.type === "SHOW_NOTIFICATION"
  ) {
    const { title, options } = event.data.payload ?? {};
    if (title) {
      self.registration.showNotification(title, options ?? {});
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  const actionUrl = event.notification?.data?.actionUrl;
  event.notification?.close();

  if (!actionUrl) {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const openedClient = clientList.find(
          (client) => "focus" in client && client.url === actionUrl
        );
        if (openedClient && "focus" in openedClient) {
          return openedClient.focus();
        }
        if (clients.openWindow) {
          return clients.openWindow(actionUrl);
        }
        return undefined;
      })
  );
});
