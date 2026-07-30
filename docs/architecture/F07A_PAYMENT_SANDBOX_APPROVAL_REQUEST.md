// F07A-3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_CANDIDATE_R1

# F07A-3H Payment Sandbox Approval Request

## Purpose

Prepare a deterministic, unsigned, preview-only sandbox approval request packet after the independent evidence review candidate in F07A-3G.

## Boundaries

- Reuse the immutable F07A-3G verification review.
- Preserve provider, market, currency, amount, snapshot, evidence bundle, review items, references, and fingerprints.
- GPay remains blocked until every independent review item has a verification decision and reviewer attestation.
- OnePay and uMoney remain blocked by their adapter states.
- Do not submit an approval request or create an approval decision.
- Do not create reviewer identity, approver identity, approval token, activation token, provider request, settlement instruction, or registry mutation.
- Do not read `.env`, `/etc/ysim/secrets`, credentials, certificate bodies, private keys, or API keys.
- Do not modify production routes, payment providers, cart, checkout, order, fulfillment, or inventory.

## Candidate views

- Request packet
- Approval prerequisites
- Approval draft
- Integrity audit
