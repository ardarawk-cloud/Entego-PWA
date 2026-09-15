# ENTEGO — Play Production Submission Checklist

Date: 2026-09-16
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
- [x] Existing Admin Support flow can review/resolve closure cases.
- [x] Data Safety source inventory drafted.
- [x] Android permission audit baseline drafted.
- [x] Capacitor production config disables debug logging and WebView debugging.
- [x] CI requires public privacy/removal resources and production Android config.

## B. Must be live before Play submission
- [ ] Merge reviewed source to `main`.
- [ ] Deploy public web build.
- [ ] Verify `/privacy.html` loads publicly without authentication.
- [ ] Verify `/account-removal.html` loads publicly without authentication.
- [ ] Verify account-removal path works in a browser without requiring an APK reinstall.
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
- [ ] Confirm `applicationId=com.ardacore.entego`.
- [ ] Confirm versionCode is greater than every prior stable release.
- [ ] Inspect final merged manifest permissions.
- [ ] Confirm no unjustified location, microphone, contacts, call-log, SMS, phone-state, Bluetooth or sensor permissions.
- [ ] Confirm camera permission appears only as required by current KYC/media capture behavior.
- [ ] Confirm release WebView debugging is disabled.
- [ ] Confirm production logging behavior.
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
- [ ] Confirm 512×512 Play Store icon.
- [ ] Create/approve 1024×500 feature graphic.
- [ ] Capture current production UI phone screenshots.
- [ ] Finalize Indonesian short/full description.
- [ ] Finalize English short/full description.

## Release gate
Do not label ENTEGO `v1.1.0 Play Production Candidate` until Sections B–E are complete, critical real-device flows have evidence, and the final AAB passes protected-signing/update-chain verification.
