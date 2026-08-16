# ENTEGO CURRENT STATE

Checkpoint: 2026-08-17 / Event Ecosystem v3 / Android v1.0.10
Owner / Final Authority: Arda
Startup command: `KAI ENTEGO START`
Status: LAST VERIFIED SAFE POINT

## Current Phase
ENTEGO remains in **Phase 1 — Marketplace / Enabler** plus Google Play maturity preparation.

Current verified Android distribution baseline: **v1.0.10 — KYC Last-4 Validation Fix**.
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

## Home v1.0.9 — CORE OVERRIDE / VERIFIED
The previous Home visually remained too close to the legacy large-hero shell even after taxonomy updates. v1.0.9 fixes this at the **core Vite bundle renderer**, not by a cosmetic overlay.

Current Home structure:
- ENTEGO master logo preserved in top bar
- compact premium Event Ecosystem hero
- CTA `Jelajahi Layanan` and `Daftar Mitra`
- trust markers: Verified Partner / ENTEGO Protection / Secure Booking
- `Jelajahi Kategori` displayed prominently on Home
- premium 3×3 category grid for all 9 main categories
- category-specific monochrome SVG icons
- `Layanan Populer`: DJ, MUA, Sound System, Photographer, Wedding Organizer, Villa

Core markers retained in v1.0.10:
- `globalThis.ENTEGO_HOME_VERSION="1.0.9"`
- `globalThis.ENTEGO_CORE_CATALOG_VERSION="3.1"`
- core asset generation `v87`

## Logo Hard Lock — VERIFIED
Arda explicitly requires the original/master ENTEGO pin-play logo to remain stable across updates.

Current authoritative asset:
- `logo-header.png`

Safeguards retained in v1.0.10:
- core bundle references `/logo-header.png?v=87`
- static shell contains explicit `ENTEGO_LOGO_LOCK='/logo-header.png?v=87'`
- service worker precaches `/logo-header.png?v=87`
- final Android APK contains `assets/public/logo-header.png`

Do not replace the master logo with fallback/generic branding unless Arda explicitly revises it.

## Multi-Service Partner Model — IMPLEMENTED
Hard model:
`1 Partner Account → 1 Business Profile → Primary Service → Many Services Offered → Many Service Menu Items / Prices`

Category is a customer discovery tool, not an account boundary.

Example:
Mr Brown Sound System may keep one account and offer Sound System + Lighting + DJ Equipment/CDJ + LED + Stage + Genset. The same profile can be discovered from each relevant service without creating duplicate partner accounts.

Implementation:
- `partner-category-flow.js` marker `ENTEGO_PARTNER_CATEGORY_VERSION='2.0'`
- local partner service selection key: `entego_partner_services`
- onboarding supports one primary service + multiple additional services
- `server-partner-flow.js` sends `services[]` with partner profile
- `partner-store-v3.js` persists `services_json`
- directory search can match primary category OR additional services
- public/directory partner remains one business identity

## Menu Layanan & Harga — IMPLEMENTED
Each partner may create multiple customer-facing service menu items with independent name, scope/duration, description, price, and featured status.

Example supplied by Arda:
- Wedding After Party — Rp3.000.000
- Wedding Full Ceremony — Rp6.000.000
- Club — Rp2.000.000
- Beach Club — Rp1.500.000

These are examples, not automatic defaults.

## ENTEGO Pricing Floor — HARD LOCK
Current minimum positive active customer-facing service price: **Rp1.000.000**.

Rules:
- Rp0 is allowed only as unset/not-yet-priced state.
- positive starting price below Rp1.000.000 is rejected.
- service-menu/package price below Rp1.000.000 is rejected.
- client + server enforce the floor.
- partner may price freely above the floor.
- category-specific floors are not locked yet.

## ENTEGO Marketing v1.0 — FOUNDATION IMPLEMENTED
Three directions are locked:
1. **ENTEGO Boost** — paid/sponsored visibility for selected service + relevant area.
2. **ENTEGO Promo** — partner-funded promotion; final price must remain >= active price floor.
3. **ENTEGO Campaign** — ENTEGO-created thematic campaigns.

Trust firewall:
- Sponsored placement must be clearly labelled.
- Verified/KYC/rating/reviews are not for sale.
- paid visibility must not silently replace organic quality/relevance.

Current implementation is foundation/draft UX only. It does not falsely charge or activate paid Boost before ENTEGO billing exists.

## KYC / Identity v1.0.10 — VERIFIED
Android v1.0.9 exposed a misleading KYC UX: the field `4 digit terakhir rekening` used gray placeholder text `5678`. This could visually appear to be a filled value while the actual input value remained empty, causing the submit validator to return the generic `identity_details_required` message.

v1.0.10 fixes this without weakening backend KYC requirements.

KYC safeguards:
- supported identity types remain KTP, SIM, PASSPORT
- private KYC media storage remains protected
- partner payout eligibility still requires approved identity verification
- full identity number and full bank account number remain rejected by the KYC metadata form
- `bankAccountLast4` still requires exactly 4 digits

Client hotfix:
- `IDENTITY_SUBMIT_HOTFIX_VERSION='79'`
- misleading `5678` placeholder is replaced at runtime with `Masukkan 4 digit terakhir`
- validation is field-specific and focuses/highlights the actual missing field
- missing account suffix message explicitly states that the former gray text was only an example, not stored data
- unfinished KYC form values are preserved in session storage across camera/DOM re-render flows
- draft is cleared after successful KYC submission

Cache delivery:
- `route-loader-flow.js` → `RL_VERSION='88'`
- service-worker cache → `entego-v88`
- directory cache → `entego-directory-v88`
- source boot loads `/route-loader-flow.js?v=88` and `/sw.js?v=88`

## Android v1.0.10 — VERIFIED
GitHub Actions run: `31959783871` — SUCCESS
Build commit: `5d59cacedd50d0f73d8fe5e85c7cd4c6f88c0f61`
Protected candidate artifact: `9266958100`

Android identity:
- applicationId: `com.ardacore.entego` — HARD LOCK
- versionName: `1.0.10`
- versionCode: `130089`
- target SDK: API 36
- Home/core asset generation: `v87`
- KYC/lazy-loader/service-worker generation: `v88`

Update chain:
- v1.0.7 Core Catalog Fix: versionCode `110001`
- v1.0.8: versionCode `120079`
- v1.0.9: versionCode `130087`
- v1.0.10: versionCode `130089`

Private final signing verification:
- APK Signature v1: false
- v2: true
- v3: true
- v4: false
- signer certificate SHA-256: `32d3bbe17fb9675b3b60d32cc027c8b97a34c9e6750814fc43ab798e0d9c31de`
- signer matches the existing ENTEGO stable sideload/update identity.

Final produced files:
- `ENTEGO-Android-v1.0.10-STABLE-UPDATEABLE.apk`
- `ENTEGO-Android-v1.0.10-PLAY-UPLOAD.aab`

Final APK was inspected directly after signing and verified to contain:
- `assets/public/identity-submit-hotfix-flow.js`
- `IDENTITY_SUBMIT_HOTFIX_VERSION='79'`
- runtime placeholder text `Masukkan 4 digit terakhir`
- explicit missing-last4 guidance
- `assets/public/route-loader-flow.js` with `RL_VERSION='88'`
- `assets/public/sw.js` with `entego-v88`
- `assets/public/assets/index-v87.js` with Home marker `globalThis.ENTEGO_HOME_VERSION="1.0.9"`
- `assets/public/logo-header.png`

Therefore the KYC fix, Home baseline, and master logo were confirmed inside the actual distributed APK, not merely in source code.

## Google Play Readiness — NOT YET COMPLETE
Tracking issue: #2 — `Play Store Readiness v1.1.0 — Production Candidate`.

P0 remains:
1. complete public Privacy Policy + in-app access
2. accurate Data Safety inventory/declarations
3. clear in-app account deletion request
4. external account-deletion web resource
5. retention disclosures for transaction/KYC data
6. permanent reviewer/demo access and sign-in instructions
7. Android permission audit
8. payment-policy review for future digital products
9. required Play declarations

Do **not** call v1.0.10 a Play Production Candidate. It is the latest stable product-development baseline.

## Last Safe Point
- Event Ecosystem v3 taxonomy locked and implemented.
- MUA included.
- premium monochrome category icon direction locked.
- Home redesigned at core bundle level with 3×3 category grid.
- master ENTEGO logo hard-locked and verified inside final APK.
- `Semua` / category-specific filtering implemented.
- one partner can persist and expose multiple services.
- Menu Layanan & Harga remains active.
- Rp1.000.000 pricing floor remains active client + server.
- Boost / Promo / Campaign marketing foundation remains active as non-billing draft UX.
- KYC last-4 UX bug fixed with field-specific validation and session draft preservation.
- Android v1.0.10 built, content-gated, privately signed, and verified in the stable update chain.
- Phase 2 Package Builder remains future.
- Phase 3 Managed Events remains future and requires explicit Arda approval.
- next major maturity work remains Privacy Policy + Account Deletion + Data Safety, then full Android QA and store assets.

## Continuity Instruction
On `KAI ENTEGO START`, boot only ENTEGO, read this Current State plus official foundation/policy files, inspect current `main`, and continue from this Last Safe Point. Do not mix other ACC projects into ENTEGO. Do not invent missing state; mark unknown/conflict and resolve from repository/current state before changing production.
