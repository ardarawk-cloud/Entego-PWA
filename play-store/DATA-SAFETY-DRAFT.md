# ENTEGO — Google Play Data Safety Draft

Status: DRAFT. Re-audit the production backend and every third-party SDK immediately before Play Console submission.

## Account creation
Yes. ENTEGO supports account creation for customer and partner roles.

## Account deletion
- In-app path: Account > Privacy & Data Control > Delete Account.
- External resource: `/delete-account.html`.
- Requests are registered server-side for verification and processing.
- Operational deletion must remove associated user data except records that must be retained for legitimate legal, transaction, dispute, security, fraud-prevention, tax, or accounting purposes.

## Data types currently expected

### Personal info
Expected: Yes.
Examples: display name, email address, account role, account status, profile/business information.
Purpose: account management, marketplace functionality, support, fraud prevention, security.

### User IDs / authentication information
Expected: Yes.
Examples: internal account ID, sessions, password hash/salt.
Purpose: authentication and account security.

### Photos and files
Expected for partner verification: Yes.
Examples: user-selected KTP, SIM, or passport capture/upload; portfolio media where enabled.
Purpose: partner identity verification and marketplace profile functionality.

### Financial / transaction information
Expected: Yes when production booking/payment functions are active.
Examples: booking totals, payment status/method metadata, platform fee, payout/withdrawal records where enabled.
Purpose: transactions, order fulfilment, accounting, fraud prevention, disputes.
Do not declare full payment-card numbers unless the production implementation actually collects them directly.

### App activity / communications
Expected where the feature is active.
Examples: booking/order activity, favourites, ratings, reviews, chat/support messages.
Purpose: marketplace functionality, support, safety, disputes.

### Device or other identifiers
No advertising identifier is intentionally required by the current ENTEGO Android shell. Re-check all SDKs before submission.

### Approximate / precise location
The current UI can contain user-entered event/location information. Do not declare device GPS collection unless the production build actually requests or receives device location.

## Sharing
- Do not declare sale of personal or sensitive user data.
- Cloudflare infrastructure is used for hosting, server execution, security controls, and private storage.
- Payment processors or other service providers must be added to this declaration when actually enabled in production.

## Security practices
- HTTPS transport.
- Secure HttpOnly session cookie.
- Server-side authorization and rate limiting.
- Private storage intended for sensitive identity assets.
- Passwords stored using salted PBKDF2-derived hashes rather than plaintext.

## Mandatory pre-submission audit
1. Inspect every production SDK and network endpoint.
2. Confirm whether payment processor data is collected or shared.
3. Confirm whether chat/support data is persisted.
4. Confirm whether analytics/crash reporting exists.
5. Confirm whether device location, identifiers, contacts, microphone, or other sensitive permissions are used.
6. Make Play Console answers match the public privacy policy exactly.
7. Exercise account deletion end-to-end and confirm the operational purge process works for account, KYC, booking, chat, and partner data.
