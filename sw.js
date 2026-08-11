const CACHE="entego-v16";
const ASSETS=["/","/manifest.webmanifest?v=16","/icon-192.png?v=16","/icon-512.png?v=16","/icon-maskable-512.png?v=16","/apple-touch-icon.png?v=16","/logo-header.png?v=16","/cancel-flow.js?v=16","/final-flow.js?v=16"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("/"))))});