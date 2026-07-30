// F07A-3G_PAYMENT_EVIDENCE_VERIFICATION_REVIEW_CANDIDATE_R1

# F07A-3G Payment Evidence Verification Review

## Purpose

Create a preview-only independent manual review packet for the non-secret sandbox evidence references captured by F07A-3F.

## Boundaries

- Reuse the immutable F07A-3F operational evidence manifest.
- Preserve provider, market, currency, amount, snapshot, evidence keys, reference IDs, and reference fingerprints.
- GPay review items remain `pending-independent-review`.
- OnePay and uMoney remain blocked by their adapter states.
- Do not create reviewer identity, reviewer attestation, verification decision, approval, activation, provider request, settlement instruction, or registry mutation.
- Do not read `.env`, `/etc/ysim/secrets`, credentials, certificate bodies, private keys, or API keys.
- Do not modify production routes, payment providers, cart, checkout, order, fulfillment, or inventory.

## Candidate views

- Review queue
- Verification checklist
- Decision draft
- Integrity audit
