# ENTEGO CURRENT STATE

Checkpoint: 2026-08-17 / Event Ecosystem v3 / Android v1.0.12
Owner / Final Authority: Arda
Startup command: `KAI ENTEGO START`
Status: LAST VERIFIED SAFE POINT

## Current Phase
ENTEGO remains in **Phase 1 — Marketplace / Enabler** plus Google Play maturity preparation.

Current verified Android distribution baseline: **v1.0.12 — Account Role UX + Home Copy Polish**.
Target after Play-readiness P0/P1 gates are complete remains: **v1.1.0 Play Production Candidate**.

## Product Identity
**ENTEGO — Event Ecosystem Platform**

Strategic narrative:
> ENTEGO is building the commerce and operating platform for Indonesia's event economy.

Phase model:
1. Phase 1 — Marketplace / Enabler — ACTIVE
2. Phase 2 — Booking + Package Builder — FUTURE
3. Phase 3 — ENTEGO Managed Events — FUTURE / explicit Arda approval required

EO/WO remain Professional Partners first. ENTEGO must not use Phase 1 to systematically disintermediate organizer partners.

## Official Foundation Files
- `ENTEGO-BUSINESS-FOUNDATION.md`
- `ENTEGO-PRICING-POLICY.md`
- `ENTEGO-SERVICE-TAXONOMY.md`
- `ENTEGO-MARKETING-POLICY.md`
- `ANDROID-UPDATE-POLICY.md`

## Service Taxonomy — LOCKED
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

`MUA` is officially under **Beauty & Styling**.

Discovery behavior:
- `Semua` shows all service types.
- selecting one main category shows only its service types.
- selecting a service discovers partners whose primary OR additional services include it.
- category is a discovery tool, not an account boundary.

Visual rule:
- category icons are a primary face of the APK.
- use relevant category-specific icons.
- premium consistent icon family.
- monochrome black/dark default.
- avoid generic repeated icons across unrelated categories.
- category labels use Title Case.

## Multi-Service Partner Model — IMPLEMENTED
Hard model:
`1 Partner Account → 1 Business Profile → Primary Service → Many Services Offered → Many Service Menu Items / Prices`

Example: Mr Brown Sound System can keep one profile while offering Sound System + Lighting + DJ Equipment/CDJ + LED + Stage + Genset.

Implementation:
- `partner-category-flow.js` → `ENTEGO_PARTNER_CATEGORY_VERSION='2.1'`
- selected services stored in `entego_partner_services`
- backend persists `services_json`
- directory can match primary or additional services
- checkbox UI uses fixed columns/equal-height rows so long labels do not create zigzag alignment

## Menu Layanan & Harga — IMPLEMENTED
Each partner may create multiple customer-facing service menu items with independent name, scope/duration, description, price, and featured state.

Approved examples:
- Wedding After Party — Rp3.000.000
- Wedding Full Ceremony — Rp6.000.000
- Club — Rp2.000.000
- Beach Club — Rp1.500.000

## ENTEGO Pricing Floor — HARD LOCK
Minimum positive active customer-facing service price: **Rp1.000.000**.

Rules:
- Rp0 only means unset/not-yet-priced.
- positive starting/menu price below Rp1.000.000 is rejected.
- client + server enforce the floor.
- partner remains free to price above the floor.

## ENTEGO Marketing — FOUNDATION IMPLEMENTED
Directions:
1. ENTEGO Boost
2. ENTEGO Promo
3. ENTEGO Campaign

Trust firewall:
- Sponsored placement must be labelled.
- Verified/KYC/rating/reviews are not for sale.
- paid visibility must not silently replace organic quality/relevance.
- current implementation remains foundation/draft UX only; no fake paid billing.

## Home + Logo — VERIFIED
Home core remains based on v1.0.9 architecture with the master ENTEGO logo, Event Ecosystem hero, CTA, trust markers, 3×3 category grid, category-specific monochrome icons, and popular services.

### v1.0.12 copy polish
Arda requested the hero wording and category capitalization be refined.

Current headline:
**`Semua Kebutuhan Event, Satu Aplikasi`**

Rules:
- headline uses capitalized words but remains visually restrained, not oversized.
- runtime target around `clamp(24px,7vw,28px)`.
- category names use Title Case.
- `home-copy-flow.js` marker: `ENTEGO_HOME_COPY_VERSION='1.0'`.

### Logo Hard Lock
Authoritative asset: `logo-header.png`.

Do not replace, remove, or fall back to generic branding unless Arda explicitly revises it.
Current APK retains `assets/public/logo-header.png` and `/logo-header.png?v=87` references.

## Account Role UX v1.0.12 — IMPLEMENTED
Account menu is role-aware and authenticated-only.

Logged out:
- Account page should show Login/Register flow, not customer financial/account utility rows.

Customer after login:
- Riwayat Transaksi
- Metode Pembayaran
- Alamat Tersimpan
- Voucher & Promo
- ENTEGO Wallet — CONDITIONAL, see hard Wallet rule below
- Jadi Mitra ENTEGO
- Pengaturan
- Bantuan & Keamanan

Partner after login:
- Dashboard Mitra
- Order & Riwayat
- Pengaturan
- Bantuan & Keamanan

Admin after login:
- Admin Control Center
- Pengaturan
- Bantuan & Keamanan

Visual rule:
- each account function uses a relevant, distinct monochrome SVG icon.
- do not reuse the generic sparkle icon for unrelated account functions.

Future account utilities that do not yet have production backends (e.g. saved address/voucher/settings/wallet ledger) must show a controlled ENTEGO notice rather than navigating to a broken/unknown route.

## Customer Wallet Identity Gate — HARD LOCK
Arda explicitly requires:
> **ENTEGO Wallet for a Customer only appears after the Customer has completed identity verification and that verification is approved.**

Important distinction:
- generic auth field `user.verified` MUST NOT be used as Customer KYC proof.
- current auth registration can mark customer accounts verified for normal account purposes; this is not identity/KYC approval.
- Wallet requires a dedicated Customer identity/KYC approved status.
- UI visibility is currently gated by the dedicated cache/status concept `entego_customer_identity_status_cache === 'approved'`.
- Wallet backend/ledger is NOT active yet, so no fake balance or financial operation may be exposed.
- security enforcement for a future live Wallet must be server-side; local UI state alone is never sufficient.

### Current limitation / next required feature
Existing `identity-api.js` is partner-oriented and includes payout/bank requirements. A dedicated Customer KYC flow/backend is **not yet implemented**. Therefore normal Customer accounts in v1.0.12 do not automatically gain Wallet access; Wallet remains hidden until the dedicated Customer ID verification system is built and approved.

## KYC / Identity — PARTNER FLOW RETAINED
Partner KYC remains:
- KTP, SIM, PASSPORT
- private identity document + selfie storage
- payout eligibility requires approved verification
- no full ID/account number in metadata form
- `IDENTITY_SUBMIT_HOTFIX_VERSION='79'`
- explicit last-4 validation
- draft persistence across camera/re-render

## Logout Reliability — RETAINED
`logout-hotfix-flow.js` marker `ENTEGO_LOGOUT_HOTFIX_VERSION='1.1'` remains active:
- delegated logout handler survives Account DOM re-render
- local auth state clears immediately
- stale auth rehydrate cannot immediately restore logged-out UI
- server `/api/auth/logout` is still attempted
- intentional Login/Register releases the logout guard

## Delivery / Cache Generation v90
v1.0.12 uses:
- `route-loader-flow.js` → `RL_VERSION='90'`
- service worker cache → `entego-v90`
- directory cache → `entego-directory-v90`
- boot version → `90`
- Home copy module → v90
- Account Role UX module → v90

## Android v1.0.12 — VERIFIED
GitHub Actions run: `32019743662` — SUCCESS
Build commit: `1cd1a85b35c4ec56d38913387e9ef1e6afbec025`
Protected candidate artifact: `9284958446`

Android identity:
- applicationId: `com.ardacore.entego` — HARD LOCK
- versionName: `1.0.12`
- versionCode: `130101`
- target SDK: API 36
- Home/core asset generation: v87
- account/home/lazy-loader/service-worker generation: v90

Update chain:
- v1.0.7: `110001`
- v1.0.8: `120079`
- v1.0.9: `130087`
- v1.0.10: `130089`
- v1.0.11: `130091`
- v1.0.12: `130101`

Private final signing verification:
- APK Signature v1: false
- v2: true
- v3: true
- v4: false
- signer certificate SHA-256: `32d3bbe17fb9675b3b60d32cc027c8b97a34c9e6750814fc43ab798e0d9c31de`
- signer matches existing ENTEGO stable sideload/update identity
- AAB jarsigner verification passed

Final files:
- `ENTEGO-Android-v1.0.12-STABLE-UPDATEABLE.apk`
- `ENTEGO-Android-v1.0.12-PLAY-UPLOAD.aab`

Final APK directly inspected and verified to contain:
- `assets/public/account-role-ux-flow.js`
- `ENTEGO_ACCOUNT_ROLE_UX_VERSION='1.0'`
- Customer Wallet identity-approved visibility gate
- role-specific Customer / Partner / Admin menu copy
- distinct monochrome account icons
- `assets/public/home-copy-flow.js`
- headline `Semua Kebutuhan Event, Satu Aplikasi`
- `assets/public/route-loader-flow.js` with `RL_VERSION='90'`
- `assets/public/sw.js` with `entego-v90`
- `assets/public/assets/index-v87.js`
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

Do **not** call v1.0.12 a Play Production Candidate. It is the current stable product-development baseline.

## Last Safe Point
- Event Ecosystem v3 taxonomy locked and implemented.
- MUA / EO / WO included.
- multi-service partner model active.
- Partner checkbox UI aligned in v2.1.
- Menu Layanan & Harga active.
- Rp1.000.000 price floor active client + server.
- Marketing Boost / Promo / Campaign foundation retained.
- Home headline capitalization and category Title Case polished.
- master ENTEGO logo hard-locked and verified.
- authenticated role-aware Account UX added.
- Customer Wallet hard-locked behind dedicated Customer identity/KYC approval and remains hidden by default until that system exists.
- Partner KYC v79 retained.
- Logout reliability v1.1 retained.
- Android v1.0.12 built, content-gated, privately signed, and verified in stable update chain.
- Phase 2 Package Builder remains future.
- Phase 3 Managed Events remains future and requires explicit Arda approval.
- next maturity work: dedicated Customer KYC architecture if Wallet is prioritized, plus Play Privacy Policy + Account Deletion + Data Safety.

## Continuity Instruction
On `KAI ENTEGO START`, boot only ENTEGO, read this Current State plus official foundation/policy files, inspect current `main`, and continue from this Last Safe Point. Do not mix other ACC projects into ENTEGO. Do not invent missing state; mark unknown/conflict and resolve from repository/current state before changing production.
