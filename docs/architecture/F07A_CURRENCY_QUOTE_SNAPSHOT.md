// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1

# F07A-3A Currency Quote and Price Snapshot Candidate

## Purpose

This package adds a preview-only candidate for exact currency conversion, quote provenance, quote expiry, and immutable display snapshots for the existing VI/VND, EN/USD, and LO/LAK markets.

## Safety boundary

- The authoritative source price remains VND.
- Rates are deterministic fixtures and are not live FX data.
- Conversion uses the existing BigInt-based `src/lib/market/money.ts` implementation.
- The snapshot is display metadata, not a payment or settlement instruction.
- No production cart, checkout, payment, order, fulfillment, pricing adapter, or inventory file is modified.

## Preview

`/ui-preview/currency-quote-snapshot?locale=vi&view=quote`

Views: `quote`, `rounding`, `snapshot`, and `expired`.

## Follow-up

A later package must define the production FX source, refresh SLA, failure policy, audit persistence, order repricing, customer reconfirmation, and settlement-currency rules before production activation.
