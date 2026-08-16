# ENTEGO CURRENT STATE

Checkpoint version: 2026-08-16 / Foundation v2.0 / Pricing Policy v1.0 / Android v1.0.7 Core Catalog Fix
Owner: Arda
Startup command: `KAI ENTEGO START`

## Current Phase
ENTEGO is in **Phase 1 Marketplace / Enabler** plus Play Store maturity preparation.

Current verified Android stable test/distribution build: **v1.0.7 Core Catalog Fix**.
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

## Event Ecosystem Core Catalog — VERIFIED v1.0.7
The five-pillar catalog is now compiled into the **core Vite bundle**, not dependent only on a lazy/injected UI module.

Core customer catalog:
1. Talent
2. Production
3. Services
4. Organizer
5. Venue

Organizer contains:
- Event Organizer
- Wedding Organizer
- Party Planner
- Corporate Event Planner

Venue contains Club, Villa, Hotel/Ballroom, Beach Venue, and Venue Lainnya.

### Root cause of missing EO/WO in v1.0.6
Real-device screenshots showed `Semua Layanan` still rendering the legacy hard-coded groups **Entertainment / Creative / Rental**.

Two causes were identified and corrected:
1. the legacy `main.js` services renderer was still embedded in the core application path, while Event Ecosystem had initially been added as an overlay/lazy module;
2. the service worker precache included `/main.js?v=84`, but Vite outputs the compiled entry under `/assets/...`; a failed new worker installation could therefore leave an older worker/cache controlling the app.

### v1.0.7 core/cache fix
- Vite pre-transform recognizes `main.js` even when requested with query strings.
- legacy `services()` catalog is replaced in the core bundle.
- transform fails if legacy Entertainment/Creative/Rental catalog survives.
- core catalog marker: `globalThis.ENTEGO_CORE_CATALOG_VERSION="2.2"`.
- production bundle names are versioned as `assets/index-v85.js` and `assets/index-v85.css` to escape stale cached asset names.
- service worker cache generation: `entego-v85`.
- service worker precache no longer includes nonexistent source `/main.js?v=85`.
- hard CI verification requires Organizer, Event Organizer, Wedding Organizer, Party Planner, Corporate Event Planner and Venue in the compiled core bundle.
- hard CI verification rejects the legacy grouped catalog and the old Rp900.000 mock price.

### Final APK internal inspection
The privately signed final APK was opened and inspected after signing.
Verified inside `assets/public/assets/index-v85.js`:
- `ENTEGO PROFESSIONAL PARTNER` present
- Organizer present
- Event Organizer present
- Wedding Organizer present
- Party Planner present
- Corporate Event Planner present
- Venue Lainnya present
- legacy `Entertainment / Creative / Rental` grouped catalog absent
- old `price:900000` marker absent

Verified inside `assets/public/sw.js`:
- cache generation `entego-v85` present
- bad `/main.js?v=85` precache entry absent

## Repository / Runtime
- Repo: `ardarawk-cloud/Entego-PWA`
- Default branch: `main`
- Tech: PWA + Capacitor Android + Cloudflare backend.
- Android package/applicationId: `com.ardacore.entego` — HARD LOCK.
- Capacitor app name: ENTEGO.
- Android web contents debugging disabled in production config.

## Android Stable Release Chain
### Current verified stable build
- Version: **v1.0.7**
- versionCode: **110001**
- applicationId: `com.ardacore.entego`
- core catalog: **2.2**
- asset generation: **v85**
- minimum service price: `1000000`
- verified build workflow: `ENTEGO v1.0.7 CORE CATALOG FIX`
- GitHub Actions run: `31937931309` — SUCCESS
- protected-signing artifact ID: `9261217286`

### Signing verification
Protected candidate was privately signed with the existing ENTEGO stable/upload identity.
- v1 signature: false
- v2 signature: true
- v3 signature: true
- v4 signature: false
- signer certificate SHA-256: `32d3bbe17fb9675b3b60d32cc027c8b97a34c9e6750814fc43ab798e0d9c31de`
- signer matches the v1.0.4/v1.0.5/v1.0.6 stable update chain.

Therefore v1.0.7 can update the existing stable ENTEGO installation in place as long as the installed copy belongs to the same stable signing chain and has a lower versionCode.

### Distribution files produced
- Stable update APK: `ENTEGO-Android-v1.0.7-CORE-CATALOG-FIX-STABLE-UPDATEABLE.apk`
- Play upload AAB: `ENTEGO-Android-v1.0.7-CORE-CATALOG-FIX-PLAY-UPLOAD.aab`

The signed AAB is for Play preparation/testing. **v1.0.7 is not labeled Play Production Candidate** because Play-readiness P0 is not yet complete.

`ANDROID-UPDATE-POLICY.md` remains authoritative for signing/update-chain principles. Future Android workflow versionCodes must remain above **110001**.

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
- Phase 1 Professional Partner taxonomy is compiled into the application core.
- Organizer is customer-visible by design and contains EO + WO + Party Planner + Corporate Event Planner.
- Venue is included in the core service catalog.
- Partner **Menu Layanan & Harga** is implemented.
- Pricing Policy v1.0 is locked at minimum **Rp1.000.000** for positive active partner prices, enforced client + server.
- v1.0.7 Core Catalog Fix passed hard bundle verification and Android build.
- final v1.0.7 APK was privately signed and internally inspected after signing.
- v1.0.7 signer matches the established stable ENTEGO update chain.
- Phase 2 Package Builder remains future.
- Phase 3 Managed Events remains future and requires explicit Arda approval.
- next maturity phase remains Privacy Policy + Account Deletion + Data Safety readiness, followed by full Android QA and store assets.

## Continuity Instruction
After every material ENTEGO change, update this file so `KAI ENTEGO START` can resume from the latest safe point after a new chat or interruption.
