<!-- F07A-3F_PAYMENT_OPERATIONAL_EVIDENCE_MANIFEST_CANDIDATE_R1 -->

# F07A-3F Payment Operational Evidence Manifest

## Purpose

F07A-3F defines a typed, auditable manifest for non-secret sandbox evidence references. It reuses F07A-3E readiness and does not infer that a captured reference has been independently verified.

## Evidence keys

1. Credential and certificate configuration evidence.
2. Callback and return contract evidence.
3. Idempotency evidence.
4. Reconciliation and recovery evidence.

## Candidate outcomes

| Market      | Provider state          | Evidence outcome                                                                         |
| ----------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| `vi-vn`     | GPay runtime registered | Four candidate references captured; independent verification and approval still required |
| `en-global` | OnePay adapter disabled | Evidence intake blocked by adapter state                                                 |
| `lo-la`     | uMoney adapter missing  | Evidence intake blocked by adapter state                                                 |

## Evidence boundary

- Records contain reference IDs and deterministic fingerprints only.
- Records never contain secret values, certificate bodies, API keys, tokens, endpoint credentials, or customer data.
- All references are scoped to `sandbox` and marked `captured-unverified`.
- Capturing a reference does not pass a readiness gate and does not create approval.
- Production and execution eligibility remain false.

## Safety boundary

No provider call, payment session, activation token, approval token, settlement instruction, registry mutation, checkout mutation, order mutation, fulfillment mutation, or inventory mutation is created.

## Next boundary

A later package may independently verify evidence references and prepare an explicit GPay sandbox approval candidate. Verification must remain separate from evidence capture.
