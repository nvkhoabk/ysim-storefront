<!-- F07A-2E-1_DYNAMIC_CONTENT_LOCALIZATION_CANDIDATE_R1 -->

# F07A-2E-1 Dynamic Commerce Content Localization Candidate

This add-only candidate defines a preview-only localization boundary for dynamic product, destination, and guide content in Vietnamese, English, and Lao under `/ui-preview/localized-dynamic-content`.

## Authority boundary

- WooCommerce remains authoritative for product IDs, SKUs, prices, stock, variation IDs, and purchasability.
- WordPress remains authoritative for guide identity, slug, publication state, and media ownership.
- The localization layer may overlay text fields only: title, summary, description, and image alternative text.
- No machine translation or runtime content generation is allowed.
- Missing locale records resolve through an explicit fallback that returns requested locale, resolved locale, status, and reason.

## Views

- `product`
- `destination`
- `guide`
- `fallback`

## Safety

The candidate does not call live WooCommerce, WordPress, payment, order, fulfillment, inventory, or content mutation APIs. It does not convert prices or change production adapters.

## Acceptance

Catalog parity, Lao Unicode, explicit locale records, stable authority fields, deterministic fallback provenance, preview-only routing, semantic Prettier resilience, ESLint, strict TypeScript, Next.js build, idempotency, rollback, and 12-URL HTTP probing.
