<!-- F07A-2C-3_LOCALIZED_DETAIL_CANDIDATE_R4 -->

# F07A-2C-3 — Product and Destination Detail Localization Candidate

## Objective

Provide a preview-only localization candidate for product-detail and destination-detail experiences in Vietnamese, English, and Lao.

## Scope

- Static product-detail headings, attribute labels, purchase-panel labels, delivery and compatibility copy, related-product labels, states, actions, and accessibility text.
- Static destination-detail headings, region and catalog labels, plan-list labels, states, actions, and accessibility text.
- Locale-aware links for product, destination, and listing routes.
- Shared localized shell from F07A-2B.
- Preview route: `/ui-preview/localized-details?locale=vi|en|lo&view=product|destination`.

## Explicit boundaries

- Production `/esim/[slug]` and `/destinations/[slug]` route files are unchanged.
- Product and destination names, descriptions, network names, and source attributes are not fabricated or translated by this candidate.
- No price is displayed and no VND/USD/LAK conversion is simulated.
- Add-to-cart and buy-now controls are disabled; the preview does not mutate cart, order, allocation, or inventory state.
- WooCommerce product and taxonomy localization remains a later workstream.
- Public market routing remains disabled.

## Acceptance

- Dictionary key and placeholder parity across `vi`, `en`, and `lo`.
- Lao Unicode content.
- Locale switch preserves the selected detail view.
- Internal links carry a locale prefix.
- Dynamic source content remains unchanged.
- Production detail routes remain untouched.
- Existing F07A-2A, F07A-2B, F07A-2C-1, and F07A-2C-2 contracts continue to pass.
- ESLint zero warnings, strict TypeScript, and Next.js production build pass.
