// School Quest service worker: เน้นเครือข่ายก่อน (อัปเดตไฟล์แล้วเห็นทันที) และใช้แคชเมื่อออฟไลน์
const V = "sq-v4";
const ASSETS = ["./", "index.html", "style.css", "app.js", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;   // Supabase / ฟอนต์ ไม่แตะ
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))
  );
});
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "School Quest ⏰", {
    body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || "sq-daily", data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs =>
    cs.length ? cs[0].focus() : clients.openWindow((e.notification.data && e.notification.data.url) || "./")));
});