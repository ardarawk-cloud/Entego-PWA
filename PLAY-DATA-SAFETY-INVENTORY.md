# ENTEGO — Google Play Data Safety Inventory

Status: working inventory for Play Console submission
Baseline reviewed: Android v1.0.12 / API worker v63
Last review: 2026-09-16

## Product scope
ENTEGO is a marketplace/enabler for real-world event services. Current payment flows are for real-world services. Wallet remains inactive for normal Customer accounts and must not be declared as a live financial product until a dedicated Customer KYC + ledger backend exists.

## Data categories observed in current source

### Account / personal information
- Display name
- Email
- Internal user ID
- Account role and status
- Account creation timestamp

Purpose: account management, authentication, marketplace operation, support, security.

### Booking / transaction data
- Service/vendor/package selected
- Event date/time
- User-entered event location
- Booking notes
- Transaction amount, currency, method/provider status
- Refund/dispute/completion status
- Reviews/ratings

Purpose: booking fulfillment, payments/reconciliation, refund/dispute handling, audit, support.

Important: ENTEGO currently states check-in does not use GPS. Event location is entered by the user for fulfillment. Before final Play Console submission, confirm how Google Play expects manually entered event addresses to map to its Location category.

### Communications
- Booking chat content
- Support & Safety case subject/description/status/resolution

Purpose: user-to-partner communication, support, safety, dispute handling.

### Partner business data
- Business/profile name and description
- Service categories and service menu
- Pricing
- Portfolio media
- Operational status

Purpose: marketplace listing and fulfillment.

### Identity / KYC data — Partner flow
- Identity document type: KTP / SIM / Passport
- Private identity-document media
- Selfie media
- Identity verification status/review metadata
- Limited payout metadata including last-4 model; full identity/account number is not intended to be stored in payout metadata form

Purpose: identity verification, fraud prevention, payout eligibility, trust and safety.

Storage rule: identity media uses private storage binding `ENT_IDENTITY_MEDIA` and must not be exposed as public marketplace media.

### Payment data
ENTEGO uses provider-hosted checkout and stores transaction/payment state required for booking operations. Current product design must not claim to store full payment-card credentials.

For Data Safety classification, distinguish:
- Purchase history / transaction history: collected.
- Full card/payment credential data: not collected by ENTEGO app if checkout remains provider-hosted.

### Technical / security data
- Authentication sessions/tokens required to maintain sessions
- Rate-limit/security state
- Operational/audit events needed for account, support, dispute and fraud controls

Session tokens must never be exposed in user data exports or logs.

## Sharing model to verify before Play submission
Possible processors/service providers required for operation:
- Hosting/runtime/storage provider
- Hosted payment provider
- Infrastructure used for identity media storage

Counterparty sharing should be limited to information required to fulfill an event. Private KYC documents, internal IDs, session tokens and full financial credentials must not be exposed to counterparties.

## Data deletion / retention declaration
Users have an in-app Support & Safety path for `account_closure`. Server logic blocks closure while active bookings, disputes or pending refunds remain. A public privacy policy and public account-removal resource are included in the Play-readiness branch.

On approved closure, the operational policy is to delete or anonymize profile data that is no longer required. Records may be retained when necessary for active/completed transactions, refunds, disputes, fraud prevention, audit, accounting, security, or applicable legal obligations. Final Play Console wording must exactly match the production operating procedure.

## Collection flags requiring final console confirmation
Do not submit the Play Console form solely from this document. Before submission, verify production runtime, processor configuration and final policies for:
- Whether manually typed event address is declared under Precise Location.
- Whether portfolio/KYC uploads map to Photos and Videos or Files and Docs in the current Play form.
- Whether support/chat data maps to Messages or Other user-generated content.
- Whether transaction records require Financial info and/or Purchase history declaration.
- Whether diagnostics/crash data are collected by any infrastructure not represented in this repository.
- Whether any advertising/analytics SDK is introduced before release.

## Hard prohibitions for submission accuracy
- Do not declare Customer Wallet as live while its backend/ledger is inactive.
- Do not declare GPS collection if ENTEGO continues not to acquire GPS location.
- Do not claim KYC media is public.
- Do not claim account data is deleted instantly when operational/legal retention applies.
- Do not claim data is not collected if the production backend persists it.
