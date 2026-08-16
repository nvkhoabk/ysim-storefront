<!-- F07A-1A_MARKET_DOMAIN_V1 -->

# F07A — YSim Market Domain Model

## Scope of F07A-1A

This package establishes a pure domain foundation only. It does not change public routes,
checkout, WooCommerce, WordPress, payment providers, cookies in the browser, or Cloudflare
configuration.

## Market profile

Language and display currency are one indivisible market choice.

| Market      | Locale | Display currency | IP countries              | Role            |
| ----------- | ------ | ---------------- | ------------------------- | --------------- |
| `vi-vn`     | `vi`   | `VND`            | `VN`                      | Default         |
| `en-global` | `en`   | `USD`            | All other known countries | Global fallback |
| `lo-la`     | `lo`   | `LAK`            | `LA`                      | Laos            |

Adding a market means adding one registry record with its language, currency and country
codes. The resolver does not contain country-specific `if` statements.

## Resolution precedence

1. Supported locale in the URL.
2. Valid `ysim_market` cookie set by an explicit user choice.
3. Country mapping from trusted edge geolocation.
4. A known but unmapped country uses `en-global`.
5. Missing, invalid, `XX` or `T1` country uses the default `vi-vn` market.

Automatic IP detection does not create a preference cookie. A later routing slice will create
the cookie only when a user explicitly selects a market.

## Currency boundaries

- WooCommerce remains the VND catalog and business-calculation source in this phase.
- VND, USD and LAK here are display-domain definitions, not provider settlement changes.
- Money conversion uses integer minor units and a rational decimal rate represented by
  `numerator / denominator`.
- Conversion rounds half away from zero.
- Every future order must snapshot the rate source, version and effective time.

## Validation guarantees

Registry construction fails for duplicate market IDs, locales or country mappings; invalid ISO
currency/country formats; missing default/global fallback markets; and a non-global market
without a country mapping.

## Deferred slices

- F07A-1B: proxy routing, edge country header and explicit preference cookie.
- F07A-1C: FX configuration and price presentation.
- F07A-1D: WordPress/WooCommerce multilingual content.
- F07A-1E: checkout and immutable order market/FX snapshots.
