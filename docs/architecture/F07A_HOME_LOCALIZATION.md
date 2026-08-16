<!-- F07A-2C-1_LOCALIZED_HOME_CANDIDATE_R1 -->

# F07A-2C-1 — Localized Home Candidate

## Purpose

This slice adds a preview-only Vietnamese, English, and Lao content catalog for the YSim home page.

## Scope

Added:

- `src/i18n/home/*`
- `src/app/ui-preview/localized-home/page.tsx`
- `scripts/test-f07a-2c-1-home-localization.mjs`

Not modified:

- `src/app/page.tsx`
- production route flags
- market proxy
- WooCommerce product data
- checkout, payment, GPay, or Gigago
- currency conversion

## Localization boundary

Static home-page copy is localized. Dynamic WooCommerce product titles remain source catalog content until the WordPress/WooCommerce localization slice.

The preview deliberately displays source catalog titles with an explicit localized notice. It does not fabricate translated product names.

## Currency boundary

No exchange-rate calculation is present in this slice. The preview exposes the expected market currency but does not display simulated USD or LAK product prices.

## Preview routes

- `/ui-preview/localized-home?locale=vi`
- `/ui-preview/localized-home?locale=en`
- `/ui-preview/localized-home?locale=lo`

The shared language selector preserves the localized-home preview route.

## Activation

This slice is preview-only. Public market routing remains disabled, and the production home page remains unchanged.

## Acceptance

- catalog parity across `vi`, `en`, and `lo`
- placeholder parity
- no unsafe HTML
- Lao Unicode content
- locale-aware internal routes
- explicit dynamic-content boundary
- no simulated currency conversion
- existing F07A-2A and F07A-2B contracts remain green
- ESLint, TypeScript, and Next.js build pass
