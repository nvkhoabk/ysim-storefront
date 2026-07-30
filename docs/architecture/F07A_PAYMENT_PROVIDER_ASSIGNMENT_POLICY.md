<!-- F07A-3D_PAYMENT_PROVIDER_ASSIGNMENT_POLICY_CANDIDATE_R1 -->

# F07A-3D Payment Provider Assignment Policy

## Purpose

F07A-3D defines a preview-only provider assignment policy on top of the immutable F07A-3C currency transaction binding. It determines the intended provider family for each market and currency without enabling provider execution.

## Policy matrix

| Market      | Locale | Currency | Candidate provider          | Runtime adapter state |
| ----------- | ------ | -------- | --------------------------- | --------------------- |
| `vi-vn`     | `vi`   | `VND`    | GPay QR (`gpay_gateway_qr`) | Runtime registered    |
| `en-global` | `en`   | `USD`    | OnePay international card   | Adapter disabled      |
| `lo-la`     | `lo`   | `LAK`    | uMoney wallet               | Adapter missing       |

## Safety boundary

- The F07A-3C payment draft remains unassigned and immutable.
- F07A-3D creates a separate assignment candidate and settlement draft.
- Provider execution is always disabled.
- No provider request, settlement instruction, payment session, order mutation, or fulfillment action is created.
- The production payment registry and existing provider implementations are not modified.
- OnePay and uMoney remain blocked until their adapters and sandbox contracts are explicitly accepted.

## Next boundary

A later package may implement provider adapter readiness and sandbox execution gates. That work must not reuse this preview policy as an authorization to execute payments.
