# F07A-3R — Payment Sandbox Activation Token Candidate

F07A-3R consumes the F07A-3Q activation candidate and prepares a preview-only activation token candidate.

The package does not create, sign, submit, or persist an activation token. It does not create a provider request, settlement instruction, registry mutation, order change, fulfillment change, or inventory change.

Preview route: `/ui-preview/payment-sandbox-activation-token`

Views: `token`, `eligibility`, `token-envelope`, `audit`.
