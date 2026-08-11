const CACHE="entego-v11";const ASSETS=["/","/manifest.webmanifest?v=11","/icon-192.png?v=11","/icon-512.png?v=11","/icon-maskable-512.png?v=11","/apple-touch-icon.png?v=11","/logo-header.png?v=11"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match("/"))));});