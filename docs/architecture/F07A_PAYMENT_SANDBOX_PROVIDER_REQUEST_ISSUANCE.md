# F07A-3T — Payment Sandbox Provider Request Issuance Candidate

## Purpose

F07A-3T consumes the accepted F07A-3S provider request candidate and prepares a preview-only issuance candidate.

The candidate never issues, signs, submits, or persists a provider request. It does not inspect secrets, call a provider, create settlement instructions, mutate the registry, or change commerce state.

## Preview route

`/ui-preview/payment-sandbox-provider-request-issuance`

Views: `issuance`, `eligibility`, `issuance-envelope`, `audit`.
