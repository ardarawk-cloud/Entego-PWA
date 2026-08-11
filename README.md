# ENTEGO PWA STATIC ASSET FIX v1.2

Root cause fixed:
Vite only bundled the app into dist. The flat-root PWA assets were not copied
into dist, so the header logo and install icon could fall back/break.

v1.2 copies manifest, service worker, all icons, Apple icon and header logo
into dist after vite build.

Cloudflare:
Build command: npm run build
Deploy command: npx wrangler deploy

After deploy:
- remove old installed ENTEGO shortcut once
- reload ENTEGO
- Add to Home Screen again
