# ENTEGO — Google Play Reviewer Guide

Date: 2026-10-04
Package: `com.ardacore.entego`
Production web runtime: `https://entego-pwa.ardarawk.workers.dev`

This document is a source-controlled reviewer procedure only. **Do not commit reviewer passwords, OTP secrets, identity documents, payment secrets, or Android signing material here.** Actual credentials belong only in Google Play Console App Access.

## Public resources
- Privacy Policy: `https://entego-pwa.ardarawk.workers.dev/privacy.html`
- Account deletion / removal: `https://entego-pwa.ardarawk.workers.dev/account-removal.html`
- Legal & Company: `https://entego-pwa.ardarawk.workers.dev/legal.html`

## Product scope for review
ENTEGO is a marketplace/enabler for **real-world event services**. Current public categories include talent, production, photo & creative, beauty & styling, food & hospitality, organizers, venues, rental & transport, and event support.

Customer Wallet must not be described as a live financial product. Its backend/ledger is not active for normal Customer accounts.

## Customer reviewer path
1. Open ENTEGO and choose **Akun**.
2. Sign in with the Customer reviewer credentials supplied privately in Play Console App Access.
3. Browse Home / Semua Layanan / Jelajahi.
4. Open a partner/service and inspect the booking flow.
5. Use only the approved reviewer-safe payment/test procedure; do not create a real financial obligation unless explicitly authorized.
6. Open Order/transaction history where test data is available.
7. Open Account → Privacy & Data / Support & Safety.
8. Confirm Privacy Policy and Account Removal resources are reachable.
9. For deletion-path review, submit an account-closure case only with the dedicated disposable reviewer account.

## Partner reviewer path
1. Sign in with the Partner reviewer credentials supplied privately in Play Console App Access.
2. Open Dashboard Mitra / onboarding.
3. Review profile, service menu, pricing and portfolio flows.
4. Review KYC UX. Supported identity-document types are KTP, SIM and Passport.
5. KYC media is private and is not public marketplace media.
6. Payout eligibility remains gated by approved identity verification.
7. Camera access is relevant to identity/media capture. ENTEGO does not intentionally use GPS for event check-in.

## Account deletion behavior
- User starts a request through Support & Safety → **Permintaan Penutupan Akun**.
- Closure is blocked while an active booking, open dispute or pending refund exists.
- Admin closure is a double-confirmed server action.
- Approved closure revokes sessions, closes the account, anonymizes/minimizes account/profile/chat/support data, and deletes Partner private KYC media before closure.
- Historical transaction/audit linkage may remain where required for transaction history, fraud prevention, audit, accounting, security or applicable legal obligations.

## Reviewer safety
- Do not use a real operational account for destructive account-closure testing.
- Do not upload real identity documents unless a dedicated authorized test identity procedure exists.
- Do not use production payment credentials for reviewer testing.
- Do not expect Customer Wallet functionality; it is not active.

## Current automated evidence
Current main is checked by:
- ENTEGO CI
- Cloudflare Worker dry-run
- browser-based ENTEGO LIVE SMOKE
- Android-sized browser runtime diagnostic
- client recovery smoke
- Android stable release build + permission audit
- Google Play screenshot/icon audit

Physical-device critical-flow QA and Play Console declarations remain separate release gates.
