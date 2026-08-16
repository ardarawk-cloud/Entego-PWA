# ENTEGO STARTUP LOCK v1.1 — GLOBAL CONTINUITY

Owner / Final Authority: Arda
Project: ENTEGO — Event Ecosystem Platform
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
7. Every material code/release/state/business-foundation change must update a durable current-state source so an abrupt chat interruption does not lose the work.

## Source of Truth — Boot Order
1. Arda's latest explicit ENTEGO instruction.
2. Current `main` branch of `ardarawk-cloud/Entego-PWA`.
3. This `ENTEGO-STARTUP-LOCK.md` protocol.
4. `ENTEGO-BUSINESS-FOUNDATION.md` for official business model, ecosystem, partner categories, phase guards, and revenue direction.
5. `ENTEGO-CURRENT-STATE.md` for the latest operational checkpoint.
6. `ANDROID-UPDATE-POLICY.md` for Android package/signing/update rules.
7. GitHub Play Store readiness issue(s), release gates, and current open ENTEGO work.
8. Available ENTEGO project conversation context/history.

If two lower sources conflict, the higher source wins. Never silently merge contradictions.

## Product Identity Lock
- Name: ENTEGO
- Long-term identity: **Event Ecosystem Platform**
- Current operating phase: marketplace / enabler for real-world event services
- Core market: Indonesia, starting from Bali use cases
- Strategic narrative: ENTEGO is building the commerce and operating platform for Indonesia's event economy.
- Trust direction: Verified Partner, ENTEGO Protection, Secure Booking
- Primary user surfaces: Home, Cari, Order, Favorit, Akun
- Repository: `ardarawk-cloud/Entego-PWA`
- Android applicationId: `com.ardacore.entego` — DO NOT CHANGE
- Architecture: PWA + Android/Capacitor + Cloudflare backend

## Professional Partner Foundation Lock
ENTEGO Professional Partner taxonomy must preserve these top-level groups:
1. Talent — DJ, MC, Band, Dancer, Performer, related talent
2. Production — Sound, Lighting, Stage, LED, Decoration, production support
3. Services — Photo, Video, Makeup, Catering, Transport, supporting services
4. Organizer — EO, WO, Party Planner, Corporate Event Planner
5. Venue — Club, Villa, Hotel, Ballroom, Beach Venue, other venues

EO and WO are official partner categories from Phase 1 and are partners first, not default competitors.

## Business Phase Hard Lock
### Phase 1 — Marketplace / Enabler
- Customer books individual talent/vendors/organizers/venues.
- ENTEGO monetization direction: commission and/or platform/transaction fee.
- Do not position ENTEGO as replacing EO/WO.

### Phase 2 — Booking + Package Builder
- Allow a lead organizer/partner to build multi-vendor Event Packages.
- Preserve organizer attribution/package ownership and multi-vendor structure.
- Do not activate until Phase 1 core operations are stable enough.

### Phase 3 — ENTEGO Managed Events
- Customer may give ENTEGO an event brief/budget instead of selecting vendors one by one.
- ENTEGO may act as Project Lead and source partners from the ecosystem.
- Potential revenue direction: management fee + vendor margin + applicable platform fee.
- Managed Events is only for customers who explicitly request ENTEGO full-project management or ENTEGO-owned events.
- Never use Managed Events to systematically disintermediate or poach EO/WO partner customers.
- Activation requires explicit Arda approval.

Future demand-creation concepts may include ENTEGO Sessions, ENTEGO Festival, ENTEGO Wedding Showcase, and ENTEGO Creator Events, but these are not Phase 1 dependencies.

## Legal / KBLI Governance Lock
- KBLI 2025 is the current classification framework to consult for future legal setup.
- Do not blindly reuse old KBLI 2020 code `82302` for future ENTEGO licensing.
- Do not permanently lock an ENTEGO KBLI code until the final legal activities are defined and verified against official BPS/OSS definitions then in force.
- Informal candidate codes such as `90391` or `9690` remain UNVERIFIED FOR ENTEGO until directly confirmed for the precise activity.

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
2. Read `ENTEGO-BUSINESS-FOUNDATION.md`.
3. Read `ENTEGO-CURRENT-STATE.md`.
4. Inspect current repository `main` and latest relevant ENTEGO changes.
5. Read `ANDROID-UPDATE-POLICY.md` when Android/release work is relevant.
6. Read current Play Store readiness issue(s) when Play preparation is relevant.
7. Run an internal ENTEGO STATE CHECK: business phase, product, partner ecosystem, backend, Android, signing/update chain, KYC, Play readiness, current blocker, last safe point.
8. Respond with a compact boot status and continue from the last safe point; do not restart planning from scratch unless Arda asks.

## Continuity Rule
After each material ENTEGO change (business foundation, code, architecture, release, signing, policy, roadmap, blocker resolution), update `ENTEGO-CURRENT-STATE.md`. This is the checkpoint mechanism for chat interruption/restart.

## Authority
Only Arda can revise or cancel this lock.
