# ENTEGO — Play Store Release Checklist

## Android package
- Application ID: `com.ardacore.entego`
- Store artifact: Android App Bundle (`.aab`)
- Target SDK: 36
- Compile SDK: 36
- Release build: non-debuggable
- Production upload key: required; never commit the keystore or passwords to Git
- Play App Signing: enroll/configure in Play Console before production rollout

## Compliance
- Public privacy policy URL must resolve successfully.
- Privacy policy must be accessible from inside ENTEGO.
- Account deletion must be discoverable inside ENTEGO.
- External account-deletion web resource must work without requiring the app to be installed.
- Complete Data Safety form from the audited production behavior, not from intended behavior.
- Complete Target audience, Ads declaration, App access, Content rating, and other App content declarations in Play Console.
- If review requires a login, provide Google Play review credentials/instructions that reach all gated functionality safely.

## Store listing
- App icon: 512 x 512 PNG, Play-compliant.
- Feature graphic: 1024 x 500 JPEG or 24-bit PNG without alpha.
- Minimum 2 phone screenshots; recommended 4+ high-quality 1080 x 1920 portrait screenshots.
- Screenshots must represent the current production UI.
- Use the ENTEGO navy + orange brand consistently.
- Avoid unsupported safety, ranking, price, popularity, or partner-availability claims.

## Testing
- Internal testing first.
- Closed testing before public production.
- For a new personal developer account created after 13 Nov 2023, current Google Play rules require at least 12 opted-in closed-test users continuously for 14 days before applying for production access.
- Test registration/login, booking, partner onboarding, KYC camera flow, account controls, privacy links, data request form, offline/error states, and Android back navigation.

## Release gate
Do not mark a build `PLAY_READY` until all items below pass:
1. CI build passes.
2. Signed AAB exists.
3. Upload certificate is verified.
4. `applicationId` matches `com.ardacore.entego`.
5. targetSdk is 36.
6. Privacy and deletion pages are live.
7. In-app privacy/delete controls are visible.
8. Data Safety audit is complete.
9. Account-deletion operational purge procedure has been tested end-to-end.
10. Store assets and Play Console declarations are complete.
