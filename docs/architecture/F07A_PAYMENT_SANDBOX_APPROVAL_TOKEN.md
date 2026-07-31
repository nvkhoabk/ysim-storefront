# F07A-3P — Payment Sandbox Approval Token Candidate

## Purpose

F07A-3P consumes the accepted F07A-3O approval issuance packet and prepares a
preview-only approval token candidate.

The candidate:

- reuses the public F07A-3O issuance contract;
- retains the opaque reviewer alias `sandbox-reviewer-fixture`;
- prepares a deterministic token candidate identifier;
- never creates, signs, or persists an approval token;
- keeps the approval record uncreated and unpersisted;
- keeps activation, provider request, settlement, and registry mutation absent;
- exposes Vietnamese, English, and Lao preview views.

## Preview route

`/ui-preview/payment-sandbox-approval-token`

Views:

- `token`
- `eligibility`
- `token-envelope`
- `audit`

## Safety

This package is UI-preview-only. It does not inspect secrets, call a payment
provider, mutate commerce state, create an approval record, create an approval
token, create activation, or enable production execution.
