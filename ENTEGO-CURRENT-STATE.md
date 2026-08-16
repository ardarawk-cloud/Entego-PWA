# ENTEGO CURRENT STATE

Checkpoint version: 2026-08-16 / Foundation v2.0 / Android v1.0.5
Owner: Arda
Startup command: `KAI ENTEGO START`

## Current Phase
ENTEGO is in **Phase 1 Marketplace / Enabler** plus Play Store maturity preparation.

Current Android stable test/distribution build: **v1.0.5 Foundation Update**.
Target after Play-readiness gate completion remains: **v1.1.0 Play Production Candidate**.

## Product / Business Foundation
Official business foundation: `ENTEGO-BUSINESS-FOUNDATION.md`.

ENTEGO is not defined narrowly as a DJ/talent booking app. Long-term identity:

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

Architecture should preserve future support for package owner/lead organizer, components, multi-vendor references, availability, combined price, package booking lifecycle, and revenue allocation.

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

## v1.0.5 Foundation Injection — IMPLEMENTED
The Phase 1 Event Ecosystem foundation is now injected into the web/PWA and Android bundle without activating Phase 2/3 operations.

Implemented:
- new `event-ecosystem-flow.js` with marker `ENTEGO_EVENT_ECOSYSTEM_VERSION='2.0'`
- home identity changed toward `ENTEGO • Event Ecosystem Platform`
- customer discovery surfaces now expose top-level groups: Talent / Production / Services / Organizer / Venue
- EO/WO are visible as Professional Partner categories
- Venue is visible as a Professional Partner category
- service discovery page is grouped by the five taxonomy pillars
- search messaging includes EO / WO / venue / event-production categories
- partner onboarding category selector now uses grouped Professional Partner categories
- partner onboarding stores `entego_partner_group` in addition to the specific category
- organizer messaging explicitly treats EO/WO as ENTEGO partners
- Package Builder and Managed Events remain deliberately inactive
- static/offline shell and PWA manifest now identify ENTEGO as an Event Ecosystem Platform

## Repository / Runtime
- Repo: `ardarawk-cloud/Entego-PWA`
- Default branch: `main`
- Tech: PWA + Capacitor Android + Cloudflare backend.
- Android package/applicationId: `com.ardacore.entego` — HARD LOCK.
- Capacitor app name: ENTEGO.
- Android web contents debugging disabled in production config.

## Android Stable Release Chain
### Current stable build
- Version: **v1.0.5**
- versionCode: **100039**
- applicationId: `com.ardacore.entego`
- foundation marker: `event-ecosystem-v2`
- build commit: `1bceccfbad1ac6dc9bc4ac2830f6d14fc6757a97`
- GitHub Actions run: `31934772024` — SUCCESS
- protected-signing artifact ID: `9260347000`

### Signing verification
- v1 signature: false
- v2 signature: true
- v3 signature: true
- v4 signature: false
- signer certificate SHA-256: `32d3bbe17fb9675b3b60d32cc027c8b97a34c9e6750814fc43ab798e0d9c31de`
- v1.0.5 signer matches the v1.0.4 stable signer.

Therefore v1.0.5 can update v1.0.4 in place when installed through the same stable sideload chain.

### Distribution files produced
- Stable update APK: `ENTEGO-Android-v1.0.5-STABLE-UPDATEABLE.apk`
- Play upload AAB: `ENTEGO-Android-v1.0.5-PLAY-UPLOAD.aab`

The AAB is a valid signed Play upload artifact but **v1.0.5 is not labeled Play Production Candidate** because the Play-readiness P0 gate is not yet complete.

Stable workflow: `.github/workflows/android-stable-apk.yml`.
`ANDROID-UPDATE-POLICY.md` remains authoritative for update-chain rules.

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

P1 QA:
- User: register → login → profile → discovery → booking → payment → completion → review.
- Partner: onboarding → KYC → listing → accept booking → fulfillment → payout eligibility.
- Admin: verification → support → disputes/refunds → account closure cases.
- Offline/slow network, session expiry, back navigation, camera/photo upload, crash recovery, accessibility.

P1 security/privacy:
- threat model auth/session, KYC media, booking/payment APIs, admin routes
- rate-limit sensitive endpoints consistently
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
- Old KBLI 2020 `82302 Jasa Penyelenggara Event Khusus (Special Event)` must not be automatically reused for a future ENTEGO entity.
- No specific ENTEGO KBLI code is locked yet.
- Candidate codes mentioned informally remain **UNVERIFIED FOR ENTEGO** until mapped to ENTEGO's final legal activities using official BPS/OSS definitions in force at incorporation/licensing time.
- Final mapping must distinguish marketplace/platform activities from organizer/managed-event/owned-event and other activities.

## Current Release Gate
Do not label a build `Play Production Candidate` until all P0 items are complete, critical flows pass on real Android devices, the AAB is signed with the protected ENTEGO upload key, `applicationId` remains unchanged, and `versionCode` is higher than the prior release.

## Last Safe Point
- Business Foundation v2.0 locked: ENTEGO = Event Ecosystem Platform.
- Phase 1 Professional Partner taxonomy is now present in the app/APK.
- EO + WO + Venue are injected into Phase 1 partner/discovery foundation.
- v1.0.5 stable APK has been built, privately signed, and verified as an update over v1.0.4.
- v1.0.5 signed AAB has also been produced for future Play testing/upload use.
- Phase 2 Package Builder remains future.
- Phase 3 Managed Events remains future and requires explicit Arda approval.
- Next maturity phase: Privacy Policy + Account Deletion + Data Safety readiness, followed by full Android QA and store assets.

## Continuity Instruction
After every material ENTEGO change, update this file so `KAI ENTEGO START` can resume from the latest safe point after a new chat or interruption.
