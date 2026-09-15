# ENTEGO — Android Permission Audit

Review date: 2026-09-16
Package: `com.ardacore.entego`
Target SDK: API 36

## Source-level findings
- Capacitor Android is used.
- `@capacitor/camera` is installed for identity/media capture.
- Mixed content is disabled.
- WebView debugging is disabled.
- ENTEGO does not intentionally use GPS for check-in.
- No product requirement currently justifies contacts, microphone, SMS, phone-state, call-log, background location, or Bluetooth permissions.

## Required release audit
The final merged Android manifest from the generated Capacitor project must be checked for every release. Any dangerous permission not required by an active ENTEGO feature must be removed or blocked before Play submission.

Expected/possibly justified permissions must be validated against the generated release manifest rather than assumed from dependencies:
- Internet/network access required for ENTEGO.
- Camera/media access only as required by the active camera/KYC upload implementation and current Android API behavior.

## Explicitly unexpected without a new approved feature
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- RECORD_AUDIO
- READ_CONTACTS / WRITE_CONTACTS
- READ_CALL_LOG / WRITE_CALL_LOG
- READ_PHONE_STATE
- CALL_PHONE
- SEND_SMS / READ_SMS / RECEIVE_SMS
- BLUETOOTH_SCAN / BLUETOOTH_CONNECT
- BODY_SENSORS

If any of the above appears in the merged release manifest, release must stop until its source and necessity are explained.

## Release evidence to retain
For the Play Production Candidate retain:
1. generated merged manifest or permission dump;
2. list of permissions with feature justification;
3. screenshots/runtime evidence for camera permission behavior on supported Android versions;
4. confirmation that denied camera/media permission fails safely;
5. confirmation there is no location prompt when using ENTEGO normally.

## Current gate
Documentation/audit baseline is complete. Runtime permission evidence remains required from the generated release package and real Android devices before calling v1.1.0 a Play Production Candidate.
