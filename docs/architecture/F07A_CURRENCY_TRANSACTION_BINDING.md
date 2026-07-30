<!-- F07A-3C_CURRENCY_TRANSACTION_BINDING_CANDIDATE_R1 -->

# F07A-3C Currency Transaction Binding Candidate

## Purpose

Provide a preview-only immutable binding between the F07A-3B transaction presentation, checkout lock, an unassigned payment draft, a preview order record, and an integrity audit.

## Authority boundaries

- F07A-3A owns quote creation, exact conversion, expiry, and price snapshots.
- F07A-3B owns shared presentation models.
- F07A-3C only binds the transaction presentation to preview lifecycle records.
- Source VND remains authoritative.
- Payment provider, requested provider currency, requested provider amount, and settlement instructions remain unassigned.

## Safety

The candidate does not call live FX, GPay, OnePay, uMoney, cart, checkout, order, fulfillment, or inventory APIs. It does not modify production routes.
