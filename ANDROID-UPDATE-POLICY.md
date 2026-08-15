# ENTEGO Android Update Policy

Official ENTEGO APKs distributed to testers or users must be updateable in place.

## Hard rules

1. Keep the Android application ID fixed at `com.ardacore.entego`.
2. Never distribute CI debug APKs as official tester/user builds.
3. Official APK/AAB packages must be release-signed with the same protected ENTEGO signing/upload key used for the stable track.
4. Every newer build must use a strictly higher Android `versionCode`.
5. `versionName` follows the human release sequence (`1.0.4`, `1.0.5`, and so on).
6. The stable GitHub workflow is `.github/workflows/android-stable-apk.yml`.
7. Signing material must never be committed to the repository. Store it only as protected GitHub Actions secrets or use protected offline signing.

## Migration note

Historical ENTEGO debug APKs were signed with temporary debug certificates. Android cannot install a stable release-signed APK over a differently signed debug APK. A tester who has one of those historical debug APKs may need to uninstall it once before installing the first stable baseline. After the stable baseline is installed, future stable builds using the same package ID, signing key, and a higher versionCode install as normal updates without uninstalling the app.

## Stable track

Baseline: `v1.0.4`

The stable workflow derives a monotonically increasing versionCode from its own GitHub Actions run number with a `100000` offset, preventing accidental downgrade below historical test builds.
