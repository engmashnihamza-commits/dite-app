/* Service Worker — يعطي التطبيق القدرة على العمل بدون إنترنت */
const CACHE  = 'diet-app-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];

/* التثبيت: تحميل كل الملفات إلى الكاش */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.log('Cache install:', err))
  );
  self.skipWaiting();
});

/* التنشيط: حذف الكاشات القديمة */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* الجلب: من الكاش أولاً، ثم الشبكة */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(networkRes => {
        const copy = networkRes.clone();
        caches.open(CACHE)
          .then(cache => cache.put(event.request, copy))
          .catch(() => {});
        return networkRes;
      }).catch(() => {
        /* إذا فشل كل شيء وكان الطلب صفحة → ارجع لصفحة التطبيق */
        if (event.request.mode === 'navigate'){
          return caches.match('./index.html');
        }
      });
    })
  );
});
