# ENTEGO Event Ecosystem Cache Hotfix v82

Date: 2026-08-16
Owner: Arda
Status: IMPLEMENTED / VERIFIED BUILD

## User-reported symptom
On Android ENTEGO, `Semua Layanan` still displayed the legacy groups `Entertainment / Creative / Rental` and did not visibly show the new Phase 1 Event Ecosystem groups including Organizer / EO / WO / Venue.

## Root cause
The service worker still used cache `entego-v77` and shell URLs such as `route-loader-flow.js?v=77`, allowing an upgraded Android install to keep loading an older route loader even though newer Event Ecosystem modules existed in the repository.

## Fix
- Service-worker cache bumped to `entego-v82`.
- Legacy caches are deleted on service-worker activation.
- `index.html` asset versions bumped to v82.
- Event Ecosystem module is loaded directly from `index.html` as `/event-ecosystem-flow.js?v=82`, not only through lazy route loading.
- Service-worker shell includes the v82 Event Ecosystem asset.
- Main/route loader URLs are cache-busted with v82.

## Expected customer UI
`Semua Layanan` should expose the official Phase 1 Professional Partner structure:
1. Talent
2. Production
3. Services
4. Organizer — including Event Organizer and Wedding Organizer
5. Venue

## Android hotfix build
- versionName: 1.0.6
- versionCode: 100050
- applicationId: `com.ardacore.entego`
- commit: `6213b48e20d7406d2097dfd589d9470fe751e11f`
- workflow run: `31936204130`
- build result: SUCCESS
- signed locally using the existing protected ENTEGO stable signing identity.
- signer certificate SHA-256 remains `32d3bbe17fb9675b3b60d32cc027c8b97a34c9e6750814fc43ab798e0d9c31de`.
- APK signature verification: v2=true, v3=true.

This hotfix can update prior stable v1.0.6 builds in place because versionCode increased and the package/signing identity remains unchanged.
