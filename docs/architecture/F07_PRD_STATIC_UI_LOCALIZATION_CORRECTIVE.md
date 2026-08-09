# F07 production static UI localization corrective

Package lineage: `F07-PRD-DEP-002F-R1` → `F07-PRD-DEP-002G-R1`.

## Scope

This corrective completes the visible static interface copy for Vietnamese,
English, and Lao across the promoted refactor routes. It covers Hero search and
fallback media, destination and product cards, rails, eSIM country/region/global
states, the production support email card, destination trust features, and the
static controls and usage notes around dynamic product pages.

WooCommerce product titles and other catalog-authored product content are not
translated by this corrective:

```text
WOOCOMMERCE_CATALOG_LANGUAGE_NORMALIZATION=DEFERRED_NON_BLOCKING
```

## Runtime gates

- Six default-locale redirects remain permanent redirects to `/vi`.
- The 18-page `6 × 3` locale matrix remains available and uses the refactor UI.
- Twelve corrected static-copy surfaces are checked with locale-specific
  sentinels.
- Six eSIM interaction states cover region and global panels for `vi/en/lo`.
- Three representative dynamic product pages check localized static controls;
  product titles remain unchanged.
- Canonical, hreflang, internal links, and production preview isolation remain
  mandatory.

## Safety boundary

All 14 production commerce execution flags remain `false`. The audit uses GET
requests only and does not submit checkout, create an order, call a payment or
fulfillment provider, or send customer email. Deployment retains the immutable
`002F-R1` release as the automatic rollback preimage.
