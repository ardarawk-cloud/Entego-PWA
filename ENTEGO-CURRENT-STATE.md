# ENTEGO CURRENT STATE

Checkpoint version: 2026-08-16
Owner: Arda
Startup command: `KAI ENTEGO START`

## Current Phase
ENTEGO is in Play Store maturity preparation. Stable Android baseline exists; next objective is v1.1.0 Play Production Candidate.

## Product
- ENTEGO = Indonesian entertainment talent + event rental marketplace.
- Initial market/use context: Bali / Indonesia.
- Examples: DJ, MC, sound system, event rental, vehicle/event-related services.
- Main tabs: Home, Cari, Order, Favorit, Akun.
- Trust direction: Verified Partner, ENTEGO Protection, Secure Booking.

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

## Current Release Gate
Do not label a build `Play Production Candidate` until all P0 items are complete, critical flows pass on real Android devices, the AAB is signed with the protected ENTEGO upload key, applicationId remains unchanged, and versionCode is higher than the prior release.

## Last Safe Point
- Stable Android v1.0.4 exists and is the updateable baseline.
- Play upload AAB v1.0.4 exists as a valid upload artifact, but should not be treated as the final mature Play release candidate.
- Play Console registration process has been reviewed; developer registration requires payment before full console access.
- Decision: mature ENTEGO further before public Play release.
- Next implementation phase: Privacy Policy + Account Deletion + Data Safety readiness, followed by end-to-end QA and store assets.

## Continuity Instruction
After every material ENTEGO change, update this file so `KAI ENTEGO START` can resume from the latest safe point after a new chat or interruption.
