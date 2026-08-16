# ENTEGO CURRENT STATE

Checkpoint version: 2026-08-16 / Foundation v2.0
Owner: Arda
Startup command: `KAI ENTEGO START`

## Current Phase
ENTEGO is in **Phase 1 Marketplace / Enabler** plus Play Store maturity preparation. Stable Android baseline exists; next Android objective remains v1.1.0 Play Production Candidate.

## Product / Business Foundation
Official business foundation: `ENTEGO-BUSINESS-FOUNDATION.md`.

ENTEGO is no longer defined narrowly as a DJ/talent booking app. Long-term identity is:

**ENTEGO — Event Ecosystem Platform**

Strategic narrative:
> ENTEGO is building the commerce and operating platform for Indonesia's event economy.

Initial market/use context: Bali / Indonesia.

### Customer can ultimately access
- DJ / MC / Band / Dancer / live performer
- sound / lighting / stage / LED / decoration
- photography / videography / makeup / catering / transport
- Event Organizer
- Wedding Organizer
- party/corporate planners
- venue
- other event support vendors
- future multi-vendor event packages
- future ENTEGO Managed Events

Main current app tabs remain: Home, Cari, Order, Favorit, Akun.
Trust direction remains: Verified Partner, ENTEGO Protection, Secure Booking.

## ENTEGO Professional Partner Taxonomy — LOCKED FOUNDATION
1. **Talent** — DJ, MC, Band, Dancer, Performer, related talent.
2. **Production** — Sound, Lighting, Stage, LED, Decoration, production support.
3. **Services** — Photo, Video, Makeup, Catering, Transport, supporting services.
4. **Organizer** — EO, WO, Party Planner, Corporate Event Planner.
5. **Venue** — Club, Villa, Hotel, Ballroom, Beach Venue, other venues.

EO and WO are official ENTEGO partner categories from Phase 1. They are **partners first, not default competitors**.

## Business Phase Model
### PHASE 1 — Marketplace / Enabler — CURRENT
Commercial direction:
`Customer → ENTEGO → Professional Partner`

Customer books individual talent, vendors, organizers, or venues.
Revenue direction:
- commission
- platform / transaction fee where appropriate

Guardrail:
- ENTEGO must not position itself as replacing EO/WO in this phase.
- Partner/customer data must not be used to unfairly bypass organizer relationships.

### PHASE 2 — Booking + Package Builder — FUTURE
Core concept: **Build Event Package**.

A lead organizer/partner may combine venue, entertainment, photo/video, decoration, production, transport, etc. into one customer-facing package and price.

Architecture should preserve future support for:
- package owner / lead organizer
- package components
- multi-vendor references
- availability
- combined package price
- package booking lifecycle
- revenue allocation

Do not activate before Phase 1 core marketplace operations are stable enough.

### PHASE 3 — ENTEGO Managed Events — FUTURE / ARDA APPROVAL REQUIRED
Customer can give ENTEGO a whole-event brief/budget instead of selecting vendors one by one.

Commercial direction:
`Customer → ENTEGO as Project Lead → ENTEGO Ecosystem Partners`

Potential revenue direction:
- management fee
- vendor margin
- applicable platform fee

Guardrail:
- only for customers explicitly requesting ENTEGO full-project management or ENTEGO-owned events
- must not systematically disintermediate/poach EO/WO partner customers
- activation requires explicit Arda decision

Possible later demand-creation brands: ENTEGO Sessions, ENTEGO Festival, ENTEGO Wedding Showcase, ENTEGO Creator Events.

## Repository / Runtime
- Repo: `ardarawk-cloud/Entego-PWA`
- Default branch: `main`
- Tech: PWA + Capacitor Android + Cloudflare backend.
- Android package/applicationId: `com.ardacore.entego`.
- Capacitor app name: ENTEGO.
- Android web contents debugging disabled in production config.

## Android Stable Baseline
- Stable baseline: v1.0.4.
- Stable baseline versionCode: 100004.
- Direct stable APK update chain uses the protected ENTEGO signing identity.
- Stable APK verified with APK Signature Scheme v2 + v3.
- Old v1.0.3 debug signature differs from v1.0.4 stable; one migration uninstall was required for that transition only.
- Future stable sideload APKs: same applicationId + same signing identity + higher versionCode => update in place.
- Google Play users should update through Google Play / Play App Signing channel.
- Stable workflow: `.github/workflows/android-stable-apk.yml`.
- `ANDROID-UPDATE-POLICY.md` is authoritative for update-chain rules.

## KYC / Identity
- Supported IDs: KTP, SIM, PASSPORT.
- Frontend current KYC files include `identity-center-flow.js` and `identity-submit-hotfix-flow.js`.
- Current submit hotfix marker: `IDENTITY_SUBMIT_HOTFIX_VERSION='78'`.
- Submit flow saves current form data before final KYC submission.
- Private identity media uses protected backend storage.
- Payout eligibility requires approved identity verification.

## Privacy / Support Existing State
- `privacy-center-flow.js` provides user data summary and account-closure eligibility visibility.
- `support-center-flow.js` provides server-backed support/safety cases including account closure requests.
- Current closure flow is review/obligation guarded; Play compliance work must make deletion/request UX and external deletion resource explicit and policy-aligned.

## Google Play Readiness
Tracking issue: #2 — `Play Store Readiness v1.1.0 — Production Candidate`.

P0 priorities:
1. Publish complete public Privacy Policy and expose it inside app.
2. Build accurate Data Safety inventory/declarations.
3. Make in-app account deletion request clearly discoverable.
4. Provide external/web deletion request resource for Play Console.
5. Define deletion vs retained transaction/KYC records and disclose retention.
6. Prepare reviewer/demo access and sign-in instructions.
7. Audit/remove unnecessary Android permissions.
8. Confirm payment flows remain real-world services; separately review any future digital goods/subscriptions for Play Billing.
9. Complete required Play declarations accurately.

P1 product QA:
- User flow: register → login → profile → search → booking → payment → completion → review.
- Partner flow: onboarding → KYC → listing → accept booking → fulfillment → payout eligibility.
- Admin flow: verification → support → disputes/refunds → account closure cases.
- Offline/slow network, session expiry, back navigation, camera/photo upload, crash recovery, accessibility.

P1 security/privacy:
- Threat model auth/session, KYC media, booking/payment APIs, admin routes.
- Sensitive endpoint rate limits.
- No secrets in public repo.
- No sensitive KYC/session/payment data in logs.
- Security headers and production logging policy checks.

P2 Store package:
- Adaptive icon + splash.
- Store icon 512×512.
- Feature graphic 1024×500.
- Real phone screenshots.
- Short/full descriptions ID/EN.
- Support email, privacy URL, account deletion URL.
- Content rating, target audience, ads declarations.

## Legal / KBLI State
- KBLI 2025 is the current official BPS classification framework and replaces KBLI 2020.
- Old KBLI 2020 `82302 Jasa Penyelenggara Event Khusus (Special Event)` must not be automatically reused for a future ENTEGO entity.
- No specific ENTEGO KBLI code is locked yet.
- Candidate codes mentioned informally, including `90391` and `9690`, remain **UNVERIFIED FOR ENTEGO** until mapped to ENTEGO's final legal activities using official BPS/OSS definitions in force at incorporation/licensing time.
- Final legal activity mapping must distinguish marketplace/platform activities from organizer/managed-event/owned-event and other operating activities.

## Current Release Gate
Do not label a build `Play Production Candidate` until all P0 items are complete, critical flows pass on real Android devices, the AAB is signed with the protected ENTEGO upload key, applicationId remains unchanged, and versionCode is higher than the prior release.

## Last Safe Point
- Business Foundation v2.0 locked: ENTEGO = Event Ecosystem Platform.
- EO + WO added to the official Phase 1 Professional Partner foundation.
- Professional Partner top-level taxonomy locked: Talent / Production / Services / Organizer / Venue.
- Phase 1 Marketplace / Enabler is current.
- Phase 2 Package Builder is future.
- Phase 3 Managed Events is future and requires explicit Arda approval.
- Stable Android v1.0.4 remains the updateable baseline.
- Play upload AAB v1.0.4 exists as a valid upload artifact, but is not the final mature Play release candidate.
- Decision remains: mature ENTEGO further before public Play release.
- Next implementation phase remains Privacy Policy + Account Deletion + Data Safety readiness, while preserving the new partner taxonomy in future product changes.

## Continuity Instruction
After every material ENTEGO change, update this file so `KAI ENTEGO START` can resume from the latest safe point after a new chat or interruption.
