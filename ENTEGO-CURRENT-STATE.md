# ENTEGO CURRENT STATE

Checkpoint version: 2026-08-16 / Foundation v2.0 / Pricing Policy v1.0 / Android v1.0.6
Owner: Arda
Startup command: `KAI ENTEGO START`

## Current Phase
ENTEGO is in **Phase 1 Marketplace / Enabler** plus Play Store maturity preparation.

Current Android stable test/distribution build: **v1.0.6 Service Menu + Pricing Floor Update**.
Target after Play-readiness gate completion remains: **v1.1.0 Play Production Candidate**.

## Product / Business Foundation
Official business foundation: `ENTEGO-BUSINESS-FOUNDATION.md`.
Official pricing policy: `ENTEGO-PRICING-POLICY.md`.

ENTEGO long-term identity:

**ENTEGO — Event Ecosystem Platform**

Strategic narrative:
> ENTEGO is building the commerce and operating platform for Indonesia's event economy.

Initial market/use context: Bali / Indonesia.

### ENTEGO Professional Partner Taxonomy — LOCKED
1. **Talent** — DJ, MC, Band, Singer, Dancer, Performer, related talent.
2. **Production** — Sound, Lighting, Stage/Tenda, LED/Visual, Decoration, production support.
3. **Services** — Photography, Video, Makeup, Catering, Transport, supporting event services.
4. **Organizer** — Event Organizer, Wedding Organizer, Party Planner, Corporate Event Planner.
5. **Venue** — Club, Villa, Hotel/Ballroom, Beach Venue, other venues.

EO and WO are official Phase 1 partners. They are **partners first, not default competitors**.

## Business Phase Model
### PHASE 1 — Marketplace / Enabler — CURRENT
Commercial direction:
`Customer → ENTEGO → Professional Partner`

Customer can book individual talent, vendors, organizers, or venues.
Revenue direction:
- commission
- platform / transaction fee where appropriate

Guardrail:
- ENTEGO does not position itself as replacing EO/WO in Phase 1.
- Partner/customer data must not be used to unfairly bypass organizer relationships.

### PHASE 2 — Booking + Package Builder — FUTURE
Core concept: **Build Event Package**.
Architecture preserves room for package owner/lead organizer, components, multi-vendor references, availability, combined price, booking lifecycle, and revenue allocation.
Do not activate before Phase 1 core marketplace operations are stable enough.

### PHASE 3 — ENTEGO Managed Events — FUTURE / ARDA APPROVAL REQUIRED
Commercial direction:
`Customer → ENTEGO as Project Lead → ENTEGO Ecosystem Partners`

Potential revenue:
- management fee
- vendor margin
- applicable platform fee

Guardrail:
- only for customers explicitly requesting ENTEGO full-project management or ENTEGO-owned events
- must not systematically disintermediate/poach EO/WO partner customers
- activation requires explicit Arda decision

Possible later owned-event brands: ENTEGO Sessions, ENTEGO Festival, ENTEGO Wedding Showcase, ENTEGO Creator Events.

## Partner Service Menu — IMPLEMENTED
Partner offering is modeled as **Menu Layanan & Harga** rather than one universal partner price.

Each partner may create multiple customer-facing offers with independent:
- service/package name
- duration or scope
- description/inclusions
- price
- primary/featured status

Example DJ menu supplied by Arda:
- Wedding After Party — Rp3.000.000
- Wedding Full Ceremony — Rp6.000.000
- Club — Rp2.000.000
- Beach Club — Rp1.500.000

These examples are not automatic defaults.

Implementation:
- existing package persistence/backend remains the storage foundation
- `service-menu-flow.js` provides partner/customer service-menu UX
- selected service-menu price flows through booking and checkout
- public partner profile can expose multiple service prices
- customer-facing starting price can be derived from the lowest active menu price

## ENTEGO Pricing Floor — HARD LOCK
Official policy: `ENTEGO-PRICING-POLICY.md`.

Current minimum active customer-facing service price: **Rp1.000.000**.

Rules:
- Rp0 is allowed only as unset/not-yet-priced state.
- positive partner starting price below Rp1.000.000 is rejected.
- service-menu/package price below Rp1.000.000 is rejected.
- UI validation and server/API validation both enforce the floor.
- partners remain free to price above the floor and create multiple service-menu entries.
- no category-specific price matrix is locked yet.
- only Arda may revise/suspend/cancel the pricing-floor rule.

Implementation markers:
- `ENTEGO_SERVICE_MENU_VERSION='1.1'`
- `ENTEGO_MIN_SERVICE_PRICE=1000000`
- partner API `MIN_SERVICE_PRICE=1000000`
- server returns `minimum_service_price` when a positive price is below the floor.

Legal governance:
- before broad public/contractual rollout, final pricing-floor terms and market impact require Indonesian competition-law review.
- do not characterize the policy as an agreement among competing partners to coordinate prices.

## Event Ecosystem Foundation Injection — IMPLEMENTED
Implemented in web/PWA and Android bundle without activating Phase 2/3:
- `event-ecosystem-flow.js` marker `ENTEGO_EVENT_ECOSYSTEM_VERSION='2.0'`
- home identity: Event Ecosystem Platform
- discovery groups: Talent / Production / Services / Organizer / Venue
- EO/WO and Venue in Professional Partner discovery/onboarding
- service discovery grouped by five ecosystem pillars
- search messaging expanded to organizer/venue/production categories
- partner onboarding stores partner group + category
- Package Builder and Managed Events remain inactive
- static/offline shell and manifest aligned to Event Ecosystem positioning

## Repository / Runtime
- Repo: `ardarawk-cloud/Entego-PWA`
- Default branch: `main`
- Tech: PWA + Capacitor Android + Cloudflare backend.
- Android package/applicationId: `com.ardacore.entego` — HARD LOCK.
- Capacitor app name: ENTEGO.
- Android web contents debugging disabled in production config.

## Android Stable Release Chain
### Current stable build
- Version: **v1.0.6**
- versionCode: **100046**
- applicationId: `com.ardacore.entego`
- foundation marker: `event-ecosystem-v2`
- partner service menu: `1.1`
- minimum service price: `1000000`
- build commit: `d4357d260bdc52bed2b2d8194a31dbd081fb760c`
- GitHub Actions run: `31935361032` — build steps SUCCESS
- protected-signing artifact ID: `9260503304`

### Signing verification
Protected candidate was privately signed with the existing ENTEGO stable/upload identity.
- v1 signature: false
- v2 signature: true
- v3 signature: true
- v4 signature: false
- signer certificate SHA-256: `32d3bbe17fb9675b3b60d32cc027c8b97a34c9e6750814fc43ab798e0d9c31de`
- signer matches the v1.0.4/v1.0.5 stable update chain.

Therefore v1.0.6 can update v1.0.5/v1.0.4 in place when installed through the same stable sideload chain and Android versionCode rules are satisfied.

### Distribution files produced
- Stable update APK: `ENTEGO-Android-v1.0.6-STABLE-UPDATEABLE.apk`
- Play upload AAB: `ENTEGO-Android-v1.0.6-PLAY-UPLOAD.aab`

The signed AAB is for future Play testing/upload preparation. **v1.0.6 is not labeled Play Production Candidate** because the Play-readiness P0 gate is not yet complete.

Stable workflow: `.github/workflows/android-stable-apk.yml`.
`ANDROID-UPDATE-POLICY.md` remains authoritative for update-chain rules.

## KYC / Identity
- Supported IDs: KTP, SIM, PASSPORT.
- KYC frontend includes `identity-center-flow.js` and `identity-submit-hotfix-flow.js`.
- submit hotfix marker: `IDENTITY_SUBMIT_HOTFIX_VERSION='78'`.
- submit flow saves current form data before final submission.
- private identity media uses protected backend storage.
- payout eligibility requires approved identity verification.

## Privacy / Support Existing State
- `privacy-center-flow.js` provides user data summary and account-closure eligibility visibility.
- `support-center-flow.js` provides server-backed support/safety cases including account closure requests.
- Play compliance work still must make deletion/request UX and external deletion resource explicit and policy-aligned.

## Google Play Readiness
Tracking issue: #2 — `Play Store Readiness v1.1.0 — Production Candidate`.

P0 priorities:
1. complete public Privacy Policy and expose it inside app
2. accurate Data Safety inventory/declarations
3. discoverable in-app account deletion request
4. external/web deletion request resource
5. retention disclosures for transaction/KYC records
6. reviewer/demo access and sign-in instructions
7. Android permission audit
8. payment-policy review for current real-world services and any future digital products
9. required Play declarations

P1 QA:
- User: register → login → profile → discovery → service selection → booking → payment → completion → review.
- Partner: onboarding → KYC → service menu/pricing → availability → listing → accept booking → fulfillment → payout eligibility.
- Admin: verification → support → disputes/refunds → account closure cases.
- offline/slow network, session expiry, back navigation, camera/photo upload, crash recovery, accessibility.

P1 security/privacy:
- threat model auth/session, KYC media, booking/payment APIs, admin routes
- rate-limit sensitive endpoints
- no secrets/private signing material in public repo
- no KYC/session/payment secrets in logs
- security headers and production logging checks

P2 Store package:
- final adaptive icon + splash
- store icon 512×512
- feature graphic 1024×500
- real production phone screenshots
- short/full descriptions ID/EN
- support email, privacy URL, account deletion URL
- content rating, target audience, ads declarations

## Legal / KBLI State
- KBLI 2025 is the current official BPS classification framework replacing KBLI 2020.
- old KBLI 2020 `82302 Jasa Penyelenggara Event Khusus (Special Event)` must not be automatically reused for a future ENTEGO entity.
- no specific ENTEGO KBLI code is locked yet.
- final mapping must distinguish marketplace/platform activities from organizer/managed-event/owned-event and other activities.

## Current Release Gate
Do not label a build `Play Production Candidate` until all P0 items are complete, critical flows pass on real Android devices, the AAB is signed with the protected ENTEGO upload key, `applicationId` remains unchanged, and `versionCode` is higher than the prior release.

## Last Safe Point
- Business Foundation v2.0 locked: ENTEGO = Event Ecosystem Platform.
- Phase 1 Professional Partner taxonomy is present in the app/APK.
- EO + WO + Venue are included in Phase 1 partner/discovery foundation.
- Partner **Menu Layanan & Harga** is implemented.
- Pricing Policy v1.0 is locked at minimum **Rp1.000.000** for positive active partner prices, enforced client + server.
- v1.0.6 stable APK has been built, privately signed, and verified in the stable update chain.
- v1.0.6 signed AAB has been produced for future Play testing/upload preparation.
- Phase 2 Package Builder remains future.
- Phase 3 Managed Events remains future and requires explicit Arda approval.
- next maturity phase remains Privacy Policy + Account Deletion + Data Safety readiness, followed by full Android QA and store assets.

## Continuity Instruction
After every material ENTEGO change, update this file so `KAI ENTEGO START` can resume from the latest safe point after a new chat or interruption.
