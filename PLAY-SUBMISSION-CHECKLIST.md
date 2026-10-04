# ENTEGO — Play Production Submission Checklist

Date: 2026-10-04
Target: v1.1.0 Play Production Candidate
Package hard lock: `com.ardacore.entego`

This checklist separates work that is implemented in source from work that must be completed in Google Play Console or with physical Android evidence.

## A. Source / public web readiness
- [x] Public Privacy Policy source added at `/privacy.html`.
- [x] Privacy Policy discloses account, booking, payment, Partner KYC, support/chat, security and retention behavior.
- [x] Public account-removal resource added at `/account-removal.html`.
- [x] External resource points to ENTEGO Web Support so a user does not need to reinstall the APK to start a closure request.
- [x] Existing in-app Support & Safety flow includes `Permintaan Penutupan Akun` and persists requests server-side with a Case ID.
- [x] Existing server closure guard prevents closure while active booking/dispute/pending refund obligations remain.
- [x] Admin Support flow can review closure cases and API worker v64 performs guarded irreversible closure/anonymization.
- [x] Approved Partner closure deletes private KYC media before account closure and fails closed if deletion storage is unavailable.
- [x] Closed accounts have sessions revoked and cannot be reactivated through normal Admin status controls.
- [x] Data Safety source inventory drafted.
- [x] Android permission audit baseline drafted.
- [x] Capacitor production config disables debug logging and WebView debugging.
- [x] CI requires public privacy/removal resources and production Android config.

## B. Must be live before Play submission
- [x] Merge reviewed source to `main`.
- [x] Deploy public web build.
- [x] Verify `/privacy.html` loads publicly without authentication.
- [x] Verify `/account-removal.html` loads publicly without authentication.
- [x] Verify account-removal path works in a browser without requiring an APK reinstall.
- [ ] Verify in-app Support & Safety account-closure request on production backend.
- [ ] Verify Admin can receive and process a closure case.

## C. Google Play Console — manual account actions
- [ ] Enter public Privacy Policy URL.
- [ ] Enter public account-deletion web resource URL.
- [ ] Complete Data Safety form from the verified production runtime, not assumptions.
- [ ] Complete Data deletion questions accurately.
- [ ] Complete Financial Features declaration accurately for the current real-world service scope.
- [ ] Confirm Ads declaration.
- [ ] Confirm Target audience and content declarations.
- [ ] Complete Content rating questionnaire.
- [ ] Add support contact details.
- [ ] Add app-access/reviewer instructions for protected Customer and Partner flows.

Reviewer passwords, OTP secrets, private identity documents, signing keys and payment secrets must never be committed to this repository.

## D. Android generated-package audit
- [ ] Build candidate AAB with protected ENTEGO signing identity.
- [x] Confirm `applicationId=com.ardacore.entego`.
- [x] Confirm generated v1.0.13 versionCode is greater than the signed v1.0.12 baseline.
- [x] Inspect generated release merged manifest permissions.
- [x] Confirm no unjustified location, microphone, contacts, call-log, SMS, phone-state, Bluetooth or sensor permissions.
- [ ] Confirm camera permission appears only as required by current KYC/media capture behavior.
- [x] Confirm release WebView debugging is disabled.
- [x] Confirm production logging behavior.
- [ ] Retain checksum and signing certificate evidence.

## E. Real Android critical-flow evidence
Test on physical devices before Production Candidate status:

### Customer
- [ ] Register / login.
- [ ] Browse/search services.
- [ ] Open partner/service detail.
- [ ] Create booking using reviewer-safe/test procedure.
- [ ] Exercise payment state using the approved non-destructive test procedure.
- [ ] Open transaction/order history.
- [ ] Complete service/review lifecycle where test environment permits.
- [ ] Open Privacy Policy from the intended in-app route.
- [ ] Submit a test Support & Safety case.
- [ ] Validate account-closure request path and blocker messaging without deleting a real production account used for operations.

### Partner
- [ ] Partner onboarding.
- [ ] Profile and multi-service setup.
- [ ] Service menu / pricing floor.
- [ ] KYC capture permission UX.
- [ ] Listing/order acceptance.
- [ ] Fulfillment/completion.
- [ ] Payout eligibility remains verification-gated.

### Admin
- [ ] Verification review.
- [ ] Support case review.
- [ ] Dispute/refund operation.
- [ ] Account restriction/reactivation audit.
- [ ] Closure-case handling.

### Device/runtime quality
- [ ] Android back-button navigation.
- [ ] Route restoration after process interruption.
- [ ] Offline/slow-network states.
- [ ] Session expiry and recovery.
- [ ] Camera permission denied / granted flows.
- [ ] Camera/photo upload on supported Android versions.
- [ ] No location permission prompt during normal use.
- [ ] Accessibility pass: touch targets, labels, focus and contrast.

## F. Store assets
- [ ] Confirm final adaptive icon rendering on Android launcher shapes.
- [ ] Confirm final splash rendering.
- [x] Confirm 512×512 Play Store icon and 512×512 maskable icon sources.
- [ ] Create/approve 1024×500 feature graphic.
- [x] Capture current production UI phone screenshots at 1080×1920 (Home, Services, Explore, Account).
- [x] Prepare Indonesian short/full description in `PLAY-STORE-LISTING.md`.
- [x] Prepare English short/full description in `PLAY-STORE-LISTING.md`.

## Automated production evidence
- [x] ENTEGO CI passes on current main.
- [x] Cloudflare Worker dry-run passes with API worker v64.
- [x] Browser-based LIVE SMOKE passes against deployed v92/v64 runtime.
- [x] Android-sized browser diagnostic passes against deployed v92/v64 runtime.
- [x] Client recovery smoke passes.
- [x] Stable Android v1.0.13 APK/AAB build passes before signing.
- [x] Play screenshot capture workflow passes and publishes `ENTEGO-Play-Store-Screenshots-v92`.
- [ ] Stable signing step remains blocked until the existing ENTEGO signing key is restored to protected GitHub secrets.

## Release gate
Do not label ENTEGO `v1.1.0 Play Production Candidate` until Sections B–E are complete, critical real-device flows have evidence, and the final AAB passes protected-signing/update-chain verification.
