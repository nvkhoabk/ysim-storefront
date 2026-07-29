# F07A-2B R2 — Functional Shared-Shell Localization

## Purpose

This revision activates the previously accepted Vietnamese, English, and Lao shell label bundle inside the shared header, navigation, footer, mobile menu, cart, and accessibility components. It also makes the language selector controlled by the active locale.

## Market pairing

| Locale | Market      | Currency |
| ------ | ----------- | -------- |
| `vi`   | `vi-vn`     | `VND`    |
| `en`   | `en-global` | `USD`    |
| `lo`   | `lo-la`     | `LAK`    |

## Runtime behavior

- `PageShell` accepts `shellLabels`, `locale`, and a serializable language-switch configuration.
- Shared components no longer own Vietnamese shell literals.
- The preview selector is controlled by the current `locale` and navigates by updating the preview query parameter.
- A dormant `market` switch mode is prepared to call `POST /api/preferences/market`; it is not enabled by the production shell in this revision.
- Existing production routes continue to use Vietnamese defaults from the canonical Vietnamese shell catalog.
- Brand names, application-store names, payment method names, and technical identifiers remain unchanged.

## Preview route

`/ui-preview/localized-shell?locale=vi|en|lo`

The preview passes the selected shell bundle into `PageShell`, including all visible and accessibility labels. Switching the header selector updates the preview locale and visible currency pairing.

## Safety boundary

This revision does not modify `src/app/layout.tsx`, `src/app/page.tsx`, `src/proxy.ts`, payment APIs, checkout, cart behavior, WooCommerce, GPay, Gigago, Nginx, or PM2. Public market routing remains disabled with `YSIM_MARKET_ROUTING_ENABLED=false`.

## Acceptance

- No known Vietnamese shell literals remain in shared shell components.
- Header, mobile navigation, cart, quick access, announcement, footer, trust features, and accessibility labels use the active bundle.
- The language selector uses `value={currentLocale}` rather than `defaultValue`.
- Preview switching works for `vi`, `en`, and `lo`.
- The market preference API integration path exists but remains inactive unless an explicit `market` switch mode is supplied.
- TypeScript, ESLint, production build, Windows contract, Linux contract, and sandbox visual regression must pass before acceptance.

## R2 installer correction

Announcement dismissal state uses `useSyncExternalStore` rather than synchronous state updates inside an effect. The package runs the repository ESLint configuration against the payload before applying source files.
