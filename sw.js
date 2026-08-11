const CACHE="entego-v12";const ASSETS=["/","/manifest.webmanifest?v=12","/icon-192.png?v=12","/icon-512.png?v=12","/icon-maskable-512.png?v=12","/apple-touch-icon.png?v=12","/logo-header.png?v=12"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match("/"))));});