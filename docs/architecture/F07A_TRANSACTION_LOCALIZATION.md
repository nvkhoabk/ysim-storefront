<!-- F07A-2D-1_LOCALIZED_TRANSACTION_CANDIDATE_R1 -->

# F07A-2D-1 Transaction Localization Candidate

This add-only candidate localizes the Cart, Checkout, Payment, and Order Result surfaces in Vietnamese, English, and Lao under `/ui-preview/localized-transaction`.

## Safety boundary

- Production transaction routes are unchanged.
- Source catalog prices remain in VND and are not converted.
- The preview does not submit forms or invoke cart, checkout, payment, order, fulfillment, webhook, or inventory APIs.
- Provider and product source names remain unchanged.
- Real eSIM QR and activation data are excluded.

## Views

- `cart`
- `checkout`
- `payment`
- `order-result`

## Acceptance

Catalog parity, placeholder parity, Lao Unicode, locale/view preservation, semantic disabled-control checks, source-money preservation, production-route isolation, ESLint, strict TypeScript, Prettier resilience, Next.js build, idempotency, rollback, and runtime HTTP probing.
