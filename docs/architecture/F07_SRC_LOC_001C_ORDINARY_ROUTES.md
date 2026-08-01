# F07-SRC-LOC-001C — Ordinary-route localization integration

## Scope

This source integration carries the accepted Vietnamese, English and Lao
localization catalogs from the preview-only F07A chain into the ordinary
Storefront request lifecycle.

- Proxy strips every client-supplied `x-ysim-*` header, then forwards the selected
  locale and original public pathname only after a localized URL has passed the
  existing routing decision. App Router accepts that context only when it carries
  the matching server-only internal token.
- The root document resolves `lang`, direction, message catalogs and localized
  shell configuration from those internal request headers.
- PageShell consumers inherit localized navigation, footer, accessibility
  labels and market-mode language switching without changing commerce calls.
- The main catalog, product, destination, cart and checkout routes participate
  in locale-aware canonical and `hreflang` metadata.
- Product-content requests use the resolved request locale instead of a fixed
  Vietnamese constant.
- Loading, not-found, route-error and emergency-error states use reviewed
  Vietnamese, English and Lao copy.
- The ordinary Home, catalog, destination, product, cart, checkout and checkout
  success bodies consume reviewed catalogs; unprefixed requests retain the
  Vietnamese legacy rollback path.

## Activation boundary

`YSIM_MARKET_ROUTING_ENABLED` remains off by default. Activation additionally
requires `YSIM_MARKET_INTERNAL_TOKEN` with at least 32 characters, so the routing
layer fails closed when its trust boundary is not configured. This source package does
not change environment files, active source, `.next`, PM2, nginx, WordPress,
WooCommerce or provider configuration. It performs no order, payment,
fulfillment or email action.

## Currency and provider boundary

The resolved shell preserves the approved locale/market/currency identity:
`vi-vn/VND`, `en-global/USD`, and `lo-la/LAK`. Existing commerce amounts remain
source-authoritative. This package does not introduce an FX rate, settlement
instruction, OnePay execution or uMoney execution. Public routing must remain
disabled until the later immutable build, ordinary-route UAT and commerce
currency/provider gates prove those flows end to end.

## Metadata boundary

Localized alternates are emitted only when Proxy supplied an internal locale
header. With routing disabled, the current unprefixed metadata behavior is
preserved. The public-path header accepts only same-origin absolute pathnames,
so it cannot create an external canonical.

## Evidence

The source package must pass the accepted format-debt invariant, TypeScript,
ESLint, all inherited F07A localization regressions, the new ordinary-route
matrix, production build and secret/PII/provider-payload scan before it can be
submitted for source-owner and Product/QA review.
