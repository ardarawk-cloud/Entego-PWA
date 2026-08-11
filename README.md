# ENTEGO PWA LOGO FIX v1.1

Perbaikan:
- Logo header rusak/ENT dihapus.
- Dedicated header logo PNG.
- PWA icons 192/512 digenerate ulang.
- Android maskable icon ditambahkan.
- Apple touch icon ditambahkan.
- Manifest dibangun ulang.
- Cache icon dibump ke v11.
- Service worker dibump ke entego-v11.

Cloudflare:
Build command: npm run build
Deploy command: npx wrangler deploy

Setelah deploy:
Hapus shortcut/PWA ENTEGO lama dari HP, refresh situs, lalu Tambahkan ke Desktop lagi agar Android membaca icon baru.
