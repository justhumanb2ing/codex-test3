self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
