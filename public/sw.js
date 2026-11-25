// ChillyMZ service worker: streak reminder notifications only (no offline caching).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  const base = self.registration.scope;
  e.waitUntil(self.registration.showNotification(d.title || 'ChillyMZ', {
    body: d.body || 'Rate a chapter today to keep your streak.',
    icon: base + 'icon-192.png', badge: base + 'icon-192.png',
    tag: d.tag || 'streak', renotify: true,
    data: { url: d.url || base }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.startsWith(self.registration.scope) && 'focus' in c) { c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
