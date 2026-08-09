<!-- F07A-2C-4_LOCALIZED_SECONDARY_CANDIDATE_R1 -->

# F07A-2C-4 Secondary Content Localization Candidate

## Scope

This candidate localizes the static UI for Offers, Guides, Support, Device Check, and Package Assistant in Vietnamese, English, and Lao.

## Activation boundary

- Preview route only: `/ui-preview/localized-secondary`.
- Production routes remain unchanged.
- Market routing remains disabled.
- Source guide titles and summaries remain unchanged until CMS localization.
- No price conversion, form submission, cart mutation, order creation, or inventory reservation.

## Views

- `offers`
- `guides`
- `support`
- `device-check`
- `package-assistant`

## Acceptance

The package validates catalog parity, placeholders, Lao Unicode, locale/view preservation, locale-aware links, dynamic-content boundaries, no simulated currency conversion, no submission or commerce mutation, production-route isolation, ESLint, strict TypeScript, Prettier resilience, Next.js build, idempotency, and rollback.
