# ENTEGO CURRENT STATE

Checkpoint: 2026-08-17 / Event Ecosystem v3 / Android v1.0.11
Owner / Final Authority: Arda
Startup command: `KAI ENTEGO START`
Status: LAST VERIFIED SAFE POINT

## Current Phase
ENTEGO remains in **Phase 1 — Marketplace / Enabler** plus Google Play maturity preparation.

Current verified Android distribution baseline: **v1.0.11 — Logout Reliability + Partner Checkbox Alignment**.
Target after Play-readiness P0/P1 gates are complete remains: **v1.1.0 Play Production Candidate**.

## Official Foundation Files
- `ENTEGO-BUSINESS-FOUNDATION.md`
- `ENTEGO-PRICING-POLICY.md`
- `ENTEGO-SERVICE-TAXONOMY.md`
- `ENTEGO-MARKETING-POLICY.md`
- `ANDROID-UPDATE-POLICY.md`

## Product Identity
**ENTEGO — Event Ecosystem Platform**

Strategic narrative:
> ENTEGO is building the commerce and operating platform for Indonesia's event economy.

Phase model:
1. Phase 1 — Marketplace / Enabler — ACTIVE
2. Phase 2 — Booking + Package Builder — FUTURE
3. Phase 3 — ENTEGO Managed Events — FUTURE / explicit Arda approval required

EO/WO remain Professional Partners first. ENTEGO must not use Phase 1 to systematically disintermediate organizer partners.

## Service Taxonomy v1.0 — LOCKED
Customer discovery uses 9 main categories:
1. Talent
2. Production
3. Photo & Creative
4. Beauty & Styling
5. Food & Hospitality
6. Organizer
7. Venue
8. Rental & Transport
9. Decoration & Event Support

`MUA` is officially included under **Beauty & Styling**.

Discovery behavior:
- `Semua` shows all service types.
- selecting one main category shows only service types belonging to that category.
- selecting a service type discovers partners whose primary service OR additional services include that service.

Visual rule:
- category icons are a primary face of the APK
- relevant category-specific icons
- premium consistent icon family
- monochrome black/dark default
- avoid generic repeated icons across unrelated categories

## Home v1.0.9 — CORE OVERRIDE / RETAINED
Current Home remains the v1.0.9 core design:
- ENTEGO master logo preserved in top bar
- compact Event Ecosystem hero
- CTA `Jelajahi Layanan` / `Daftar Mitra`
- trust markers
- `Jelajahi Kategori` 3×3 grid
- category-specific monochrome icons
- `Layanan Populer`

Core markers retained in v1.0.11:
- `globalThis.ENTEGO_HOME_VERSION="1.0.9"`
- `globalThis.ENTEGO_CORE_CATALOG_VERSION="3.1"`
- core asset generation `v87`

## Logo Hard Lock — VERIFIED
Authoritative asset: `logo-header.png`.

Rules:
- original/master ENTEGO pin-play logo must remain stable across updates
- do not replace with fallback/generic branding unless Arda explicitly revises it
- v1.0.11 retains `/logo-header.png?v=87`
- final v1.0.11 APK directly verified to contain `assets/public/logo-header.png`

## Multi-Service Partner Model — IMPLEMENTED
Hard model:
`1 Partner Account → 1 Business Profile → Primary Service → Many Services Offered → Many Service Menu Items / Prices`

Category is a discovery tool, not an account boundary.

Example: Mr Brown Sound System may keep one account while offering Sound System + Lighting + DJ Equipment/CDJ + LED + Stage + Genset.

Implementation:
- `partner-category-flow.js` now `ENTEGO_PARTNER_CATEGORY_VERSION='2.1'`
- `entego_partner_services` stores additional selected services
- backend `services_json` persists multi-service profile data
- customer directory can match primary or additional services

### Partner checkbox UI v2.1
Arda reported the Android multi-service checkbox grid looked zigzag when labels had different lengths.

v1.0.11 fixes this using fixed checkbox/text columns and equal-height service cards:
- two-column service grid
- each row uses `grid-template-columns:20px minmax(0,1fr)`
- minimum row height `48px`
- checkbox fixed to 18×18 px and vertically centered
- long service names wrap without shifting checkbox position

## Menu Layanan & Harga — IMPLEMENTED
Each partner may create multiple customer-facing menu items with independent name, scope/duration, description, price, and featured state.

Examples approved by Arda:
- Wedding After Party — Rp3.000.000
- Wedding Full Ceremony — Rp6.000.000
- Club — Rp2.000.000
- Beach Club — Rp1.500.000

## ENTEGO Pricing Floor — HARD LOCK
Current minimum positive active customer-facing service price: **Rp1.000.000**.

Rules:
- Rp0 only means unset/not-yet-priced
- positive starting price below Rp1.000.000 is rejected
- menu/package price below Rp1.000.000 is rejected
- client + server enforce the floor
- partner remains free to price above the floor

## ENTEGO Marketing v1.0 — FOUNDATION IMPLEMENTED
Directions:
1. ENTEGO Boost
2. ENTEGO Promo
3. ENTEGO Campaign

Trust firewall:
- Sponsored placement must be labelled
- Verified/KYC/rating/reviews are not for sale
- paid visibility must not silently replace organic quality/relevance
- current implementation remains foundation/draft UX only; no fake paid billing

## KYC / Identity v1.0.10 — RETAINED
The v1.0.10 KYC last-4 fix remains active in v1.0.11:
- KTP, SIM, PASSPORT supported
- private KYC media storage
- exact 4-character identity suffix / 4-digit bank suffix requirements
- `IDENTITY_SUBMIT_HOTFIX_VERSION='79'`
- placeholder `Masukkan 4 digit terakhir`
- field-specific validation/focus
- unfinished KYC draft preserved across camera/re-render via session storage
- full identity number and full bank account number remain rejected from metadata form

## Logout Reliability v1.0.11 — VERIFIED
Arda supplied an Android reproduction video where tapping `Keluar` visually pressed the button but the Account screen remained logged in.

Server logout already existed, but client logout depended on a direct handler attached to a specific Account-panel DOM instance. Re-render/stale auth refresh could make the logout transition unreliable.

v1.0.11 adds defense-in-depth client logout:
- `logout-hotfix-flow.js`
- marker `ENTEGO_LOGOUT_HOTFIX_VERSION='1.1'`
- delegated capture-level handler catches `#entegoLogout` even after panel re-render
- local account state is cleared immediately
- `entego_force_logged_out` blocks stale auth rehydrate from restoring the just-logged-out panel
- `/api/auth/logout` is still attempted with credentials to invalidate the server session/cookie
- route moves to Home via `location.replace`
- intentional Login/Register clears the logout guard so users can sign in again normally

Delivery generation:
- `route-loader-flow.js` → `RL_VERSION='89'`
- service worker cache → `entego-v89`
- directory cache → `entego-directory-v89`
- logout hotfix is loaded globally and explicitly included in the shell

## Android v1.0.11 — VERIFIED
GitHub Actions run: `31962051364` — SUCCESS
Build commit: `24fbe80fb280edee79193f32097fe3b6be7977c7`
Protected candidate artifact: `9267520255`

Android identity:
- applicationId: `com.ardacore.entego` — HARD LOCK
- versionName: `1.0.11`
- versionCode: `130091`
- target SDK: API 36
- Home/core asset generation: `v87`
- auth/UI/lazy-loader/service-worker generation: `v89`

Update chain:
- v1.0.7: versionCode `110001`
- v1.0.8: `120079`
- v1.0.9: `130087`
- v1.0.10: `130089`
- v1.0.11: `130091`

Private final signing verification:
- APK Signature v1: false
- v2: true
- v3: true
- v4: false
- signer certificate SHA-256: `32d3bbe17fb9675b3b60d32cc027c8b97a34c9e6750814fc43ab798e0d9c31de`
- signer matches existing ENTEGO stable sideload/update identity
- AAB jarsigner verification passed

Final produced files:
- `ENTEGO-Android-v1.0.11-STABLE-UPDATEABLE.apk`
- `ENTEGO-Android-v1.0.11-PLAY-UPLOAD.aab`

Final APK directly inspected after signing and verified to contain:
- `assets/public/logout-hotfix-flow.js` with logout v1.1
- `assets/public/partner-category-flow.js` with UI v2.1 and aligned checkbox grid
- `assets/public/route-loader-flow.js` with `RL_VERSION='89'`
- `assets/public/sw.js` with `entego-v89`
- `assets/public/assets/index-v87.js` with Home v1.0.9 marker
- `assets/public/logo-header.png`

## Google Play Readiness — NOT YET COMPLETE
Tracking issue: #2 — `Play Store Readiness v1.1.0 — Production Candidate`.

P0 remains:
1. public Privacy Policy + in-app access
2. accurate Data Safety inventory/declarations
3. clear in-app account deletion request
4. external account-deletion web resource
5. retention disclosures for transaction/KYC data
6. permanent reviewer/demo access and sign-in instructions
7. Android permission audit
8. payment-policy review for future digital products
9. required Play declarations

Do **not** call v1.0.11 a Play Production Candidate. It is the current stable product-development baseline.

## Last Safe Point
- Event Ecosystem v3 taxonomy locked and implemented
- MUA / EO / WO included
- Home v1.0.9 retained
- master ENTEGO logo hard-locked and verified in final APK
- category-specific discovery and multi-service partners active
- Partner checkbox layout fixed/aligned in v2.1
- Menu Layanan & Harga active
- Rp1.000.000 price floor active client + server
- Marketing Boost / Promo / Campaign foundation retained
- KYC v79 retained
- Logout reliability hotfix v1.1 added and packaged
- Android v1.0.11 built, content-gated, privately signed, and verified in stable update chain
- Phase 2 Package Builder remains future
- Phase 3 Managed Events remains future and requires explicit Arda approval
- next major maturity work remains Privacy Policy + Account Deletion + Data Safety, then full Android QA/store assets

## Continuity Instruction
On `KAI ENTEGO START`, boot only ENTEGO, read this Current State plus official foundation/policy files, inspect current `main`, and continue from this Last Safe Point. Do not mix other ACC projects into ENTEGO. Do not invent missing state; mark unknown/conflict and resolve from repository/current state before changing production.
