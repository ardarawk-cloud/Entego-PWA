# ENTEGO PWA — FINAL BUILD v1.3

Status: PRODUCTION READY

ENTEGO is a mobile-first Entertainment & Rental Marketplace PWA for Bali.

## Final flow
- Customer: Home → Services/Search → Vendor → Booking → Checkout → Order → Detail/Chat
- Partner: Onboarding → Dashboard → Orders → Accept/Reject → Chat → Start/Complete job → Wallet/Analytics
- Admin demo: Partner verification → Booking/Dispute → Payments → Promo → Users → Reports → CMS
- PWA: installable, standalone portrait mode, service worker, maskable icon, Apple icon, unified ENTEGO header branding

## Build
npm run build

## Cloudflare
Build command: npm run build
Deploy command: npx wrangler deploy

## Release notes
v1.3 locks the complete functional demo flow and final visual baseline. Interactive controls are wired through the app router/state. PWA assets are copied to dist during build.

For an already-installed older PWA, remove the old shortcut/app once after deployment, reload the site, then install ENTEGO again so Android refreshes the icon/manifest.
