# F07 production UI and locale promotion

## Scope

F07-PRD-DEP-002F promotes one coherent UI-Refactor surface and first-class
Vietnamese, English, and Lao routes:

- real App Router routes under `/vi`, `/en`, and `/lo`;
- permanent redirects from ordinary public GET/HEAD routes to `/vi`;
- one refactor mode for the ten reviewed production route families;
- production-only isolation of page and API routes under `ui-preview`;
- locale-aware shell navigation, language switching, canonical URLs, and
  `hreflang` alternates;
- route, link, UI marker, metadata, desktop, and mobile acceptance gates.

## Explicit deferral

`WOOCOMMERCE_CATALOG_LANGUAGE_NORMALIZATION=DEFERRED_NON_BLOCKING`

Product titles and descriptions originate in the WooCommerce catalog plugin.
Mixed source languages are not corrected or used as an acceptance blocker in
002F. Product IDs, SKUs, prices, stock, variations, and purchasability remain
owned by WooCommerce and are not mutated by this promotion.

## Safety boundary

- All production commerce execution flags remain false.
- No payment, supplier, fulfillment, order submission, or customer email is
  executed by the promotion or its acceptance audit.
- Rollback is the immutable release preimage, not per-route UI flags.
- Static assets below `/ui-preview` remain readable when they are referenced by
  reviewed production compositions; preview pages and preview APIs do not.
