# ENTEGO STARTUP LOCK v1.0 — GLOBAL CONTINUITY

Owner / Final Authority: Arda
Project: ENTEGO — Entertainment & Rental Marketplace
ACC Code: BZ-02
Official startup command: `KAI ENTEGO START`

## Purpose
This file is the durable boot protocol for ENTEGO. It exists so a new or interrupted conversation can reconstruct the latest safe ENTEGO state from durable sources instead of relying on one chat thread.

## Hard Lock
1. When Arda says `KAI ENTEGO START`, boot ENTEGO only.
2. Do not mix ENTEGO with unrelated ACC businesses, accounting, content channels, comics, or other products.
3. Restore ENTEGO from zero-to-current using the durable source hierarchy below, then continue from the latest safe state.
4. Never invent missing project facts. If data is absent or conflicting, mark it `UNKNOWN` / `CONFLICT` and resolve from Arda or the source of truth.
5. Preserve backward-compatible production behavior unless Arda explicitly approves a breaking change.
6. Never expose or commit signing passwords, keystores, private keys, KYC documents, session tokens, payment secrets, or other credentials.
7. Every material code/release/state change must update a durable current-state source so an abrupt chat interruption does not lose the work.

## Source of Truth — Boot Order
1. Arda's latest explicit ENTEGO instruction.
2. Current `main` branch of `ardarawk-cloud/Entego-PWA`.
3. This `ENTEGO-STARTUP-LOCK.md` protocol.
4. `ENTEGO-CURRENT-STATE.md` for the latest operational checkpoint.
5. `ANDROID-UPDATE-POLICY.md` for Android package/signing/update rules.
6. GitHub Play Store readiness issue(s), release gates, and current open ENTEGO work.
7. Available ENTEGO project conversation context/history.

If two lower sources conflict, the higher source wins. Never silently merge contradictions.

## Product Identity Lock
- Name: ENTEGO
- Positioning: Entertainment & Rental Marketplace
- Core market: Indonesia, starting from Bali use cases
- Core services: entertainment talent and real-world event rentals/services such as DJ, MC, sound system, vehicle/event rental, and related categories
- Trust direction: Verified Partner, ENTEGO Protection, Secure Booking
- Primary user surfaces: Home, Cari, Order, Favorit, Akun
- Repository: `ardarawk-cloud/Entego-PWA`
- Android applicationId: `com.ardacore.entego` — DO NOT CHANGE
- Architecture: PWA + Android/Capacitor + Cloudflare backend

## Android / Release Hard Lock
- v1.0.4 is the stable update-chain baseline.
- Official user-distribution APKs must be stable release builds, never ephemeral debug APKs.
- Future APK updates must keep the same package ID, same stable signing identity, and a higher versionCode.
- Google Play distribution uses signed AAB upload artifacts and Play App Signing rules.
- ENTEGO signing material is private and must never be committed to the public repository.
- Current Play preparation target: v1.1.0 Production Candidate after release-gate completion.

## KYC / Trust Lock
- Supported identity document types: KTP, SIM, PASSPORT.
- Identity documents and selfies are private data and must remain protected.
- Partner payout eligibility is gated by approved identity verification.
- Full identity/bank numbers must not be exposed in normal client summaries/logs.
- KYC submission must persist the current form state before server submission.

## Google Play Readiness Lock
Before calling any build a Play Production Candidate, complete the current Play readiness gate, including at minimum:
- Privacy Policy and Data Safety alignment
- Discoverable in-app account deletion flow
- External account-deletion resource/URL
- Accurate retention disclosures for transaction/KYC records
- Reviewer/demo access where login-gated features require it
- Android permission review
- End-to-end user/partner/admin QA
- Security/privacy checks
- Store listing assets and declarations
- Signed AAB with protected ENTEGO upload key
- unchanged `com.ardacore.entego`
- monotonically higher versionCode

## Startup Procedure
On `KAI ENTEGO START`:
1. Read this startup lock.
2. Read `ENTEGO-CURRENT-STATE.md`.
3. Inspect current repository `main` and latest relevant ENTEGO changes.
4. Read `ANDROID-UPDATE-POLICY.md` when Android/release work is relevant.
5. Read current Play Store readiness issue(s) when Play preparation is relevant.
6. Run an internal ENTEGO STATE CHECK: product, backend, Android, signing/update chain, KYC, Play readiness, current blocker, last safe point.
7. Respond with a compact boot status and continue from the last safe point; do not restart planning from scratch unless Arda asks.

## Continuity Rule
After each material ENTEGO change (code, architecture, release, signing, policy, roadmap, blocker resolution), update `ENTEGO-CURRENT-STATE.md`. This is the checkpoint mechanism for chat interruption/restart.

## Authority
Only Arda can revise or cancel this lock.
