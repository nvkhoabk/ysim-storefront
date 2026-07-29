# F07A-2B R2 — Global Shell Localization Candidate

## Purpose

This package creates localized Vietnamese, English, and Lao header/navigation/footer configuration and a full-shell preview without activating production routing or replacing the production shell.

## Market pairing

| Locale | Market      | Currency |
| ------ | ----------- | -------- |
| `vi`   | `vi-vn`     | `VND`    |
| `en`   | `en-global` | `USD`    |
| `lo`   | `lo-la`     | `LAK`    |

## Runtime scope

- Independent shell-message catalog with key, placeholder, empty-value, and unsafe-HTML validation.
- Locale-aware navigation and footer configuration.
- Locale-prefixed internal links preserving query strings and fragments.
- Language options derived from the canonical market registry: `vi`, `en`, and `lo` only.
- Preview route: `/ui-preview/localized-shell?locale=vi|en|lo`.
- Accessibility-label bundle prepared for shared-component activation in F07A-2B R2.

## Safety boundary

R1 does not modify `src/app/layout.tsx`, `src/app/page.tsx`, production navigation components, market proxy behavior, payment APIs, WooCommerce, GPay, or Gigago. `YSIM_MARKET_ROUTING_ENABLED` must remain `false`.

## Next activation step

F07A-2B R2 will inject the localized labels into shared shell components, add an explicit market selector, set the production document language, make internal links locale-aware at runtime, and complete visual/accessibility regression before public routing is enabled.

## R2 package lifecycle hardening

- Strict TypeScript fixture validation runs during package self-test.
- Automatic rollback is allowed while package files are dirty after formatting or failed validation.
- A guarded recovery step removes only known untracked R1 residue at the accepted baseline.
