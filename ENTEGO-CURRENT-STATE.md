# ENTEGO CURRENT STATE

Checkpoint: 2026-08-16 / Event Ecosystem v3 / Android v1.0.8
Owner / Final Authority: Arda
Startup command: `KAI ENTEGO START`
Status: LAST VERIFIED SAFE POINT

## Current Phase
ENTEGO remains in **Phase 1 — Marketplace / Enabler** plus Google Play maturity preparation.

Current verified Android distribution baseline: **v1.0.8 — Discovery, Multi-Service & Marketing Foundation**.
Target after Play-readiness P0/P1 gates remain complete: **v1.1.0 Play Production Candidate**.

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
- selected customer service is passed to `/api/directory?category=...`
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
Three product directions are locked:
1. **ENTEGO Boost** — paid/sponsored visibility for selected service + relevant area.
2. **ENTEGO Promo** — partner-funded promotion on a service-menu item; final price must remain >= active price floor.
3. **ENTEGO Campaign** — ENTEGO-created thematic campaigns.

Trust firewall:
- Sponsored placement must be clearly labelled.
- Verified badge is not for sale.
- KYC approval is not for sale.
- rating/reviews are not for sale.
- paid visibility must not silently replace organic quality/relevance.

Current APK implementation is **foundation/draft UX only**. It does not falsely activate or charge paid Boost before ENTEGO billing/campaign activation exists.

Implementation marker:
- `partner-marketing-flow.js` → `ENTEGO_MARKETING_VERSION='1.0'`

## Android v1.0.8 — VERIFIED
GitHub Actions run: `31953989977` — SUCCESS
Build commit: `90ffc58557ee94d684e37bd8bc9e77bc83b44ef0`
Protected candidate artifact: `9265468382`

Android identity:
- applicationId: `com.ardacore.entego` — HARD LOCK
- versionName: `1.0.8`
- versionCode: `120079`
- target SDK: API 36
- asset generation/cache: v86

Update-chain note:
- v1.0.7 Core Catalog Fix used versionCode `110001`.
- v1.0.8 moved to the `120xxx` versionCode range so it can update over the current stable chain.

Private final signing verification:
- APK Signature v1: false
- v2: true
- v3: true
- v4: false
- signer certificate SHA-256: `32d3bbe17fb9675b3b60d32cc027c8b97a34c9e6750814fc43ab798e0d9c31de`
- signer matches the existing ENTEGO stable sideload/update identity.

Final produced files:
- `ENTEGO-Android-v1.0.8-STABLE-UPDATEABLE.apk`
- `ENTEGO-Android-v1.0.8-PLAY-UPLOAD.aab`

APK content gates verified directly inside the final APK:
- core asset `assets/public/assets/index-v86.js`
- Event Ecosystem v3 flow present
- MUA + 9-category taxonomy present
- category filtering markers present
- multi-service onboarding present
- Marketing foundation present
- legacy core catalog not accepted by CI

## KYC / Identity
- supported identity types: KTP, SIM, PASSPORT
- private KYC media storage remains protected
- partner payout eligibility requires approved identity verification
- submit hotfix remains active

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
9. Play declarations including Financial Features declaration

Do **not** call v1.0.8 a Play Production Candidate. It is the latest stable product-development baseline.

## Last Safe Point
- Event Ecosystem v3 taxonomy locked and implemented.
- MUA included.
- premium monochrome category icon direction locked and implemented in discovery flow.
- `Semua` / category-specific filtering implemented.
- one partner can persist and expose multiple services.
- partner directory can match additional services.
- Menu Layanan & Harga remains active.
- Rp1.000.000 pricing floor remains active client + server.
- ENTEGO Marketing Boost / Promo / Campaign foundation is locked and present as non-billing draft UX.
- Android v1.0.8 built, content-gated, privately signed, and verified in the stable update chain.
- Phase 2 Package Builder remains future.
- Phase 3 Managed Events remains future and requires explicit Arda approval.
- next major maturity work remains Privacy Policy + Account Deletion + Data Safety, then full Android QA and store assets.

## Continuity Instruction
On `KAI ENTEGO START`, boot only ENTEGO, read this Current State plus the official foundation/policy files, inspect current `main`, and continue from this Last Safe Point. Do not mix other ACC projects into ENTEGO. Do not invent missing state; mark unknown/conflict and resolve from repository/current state before changing production.
