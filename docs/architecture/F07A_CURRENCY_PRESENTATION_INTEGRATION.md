// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1

# F07A-3B Currency Presentation Integration Candidate

## Purpose

This add-only candidate proves that Home, Listing, Detail, and Transaction UI contexts can consume the shared F07A-3A currency quote and immutable display snapshot without duplicating rates or conversion logic.

## Boundaries

- Preview route only: `/ui-preview/currency-presentation-integration`.
- Source VND remains authoritative.
- Display values remain fixture-only and non-settlement.
- F07A-3A quote and snapshot APIs are reused directly.
- No production page, cart, checkout, payment, order, fulfillment, inventory, or FX-provider integration is modified.

## Views

- `home`
- `listing`
- `detail`
- `transaction`
