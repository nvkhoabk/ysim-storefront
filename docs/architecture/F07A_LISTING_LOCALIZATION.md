<!-- F07A-2C-2_LOCALIZED_LISTING_CANDIDATE_R1 -->

# F07A-2C-2 — eSIM and Destination Listing Localization Candidate

## Objective

Provide a preview-only localization candidate for the `/esim` and `/destinations` listing experiences in Vietnamese, English, and Lao.

## Scope

- Static listing headings, descriptions, tabs, filters, sorting, result summaries, empty states, loading/error copy, actions, and accessibility labels.
- Locale-aware links for listing routes and detail-route candidates.
- Shared localized shell from F07A-2B.
- Preview route: `/ui-preview/localized-listings?locale=vi|en|lo&view=esim|destinations`.

## Explicit boundaries

- Production `/esim` and `/destinations` route files are unchanged.
- Product names and destination names from the catalog source are not fabricated or translated by this candidate.
- No price is displayed and no VND/USD/LAK conversion is simulated.
- WooCommerce taxonomy/product localization remains a later workstream.
- Public market routing remains disabled.

## Acceptance

- Dictionary key and placeholder parity across `vi`, `en`, and `lo`.
- Lao Unicode content.
- Locale switch preserves the selected listing view.
- All internal candidate links carry a locale prefix.
- Dynamic source titles remain unchanged.
- Existing F07A-2A, F07A-2B, and F07A-2C-1 contracts continue to pass.
- ESLint zero warnings, strict TypeScript, and Next.js production build pass.
