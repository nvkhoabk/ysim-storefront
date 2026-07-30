# F07A-3N — Payment Sandbox Approval Candidate

## Purpose

F07A-3N consumes the accepted F07A-3M review-decision issuance and prepares a
preview-only approval candidate.

The candidate:

- reuses the public F07A-3M issuance contract;
- keeps the opaque reviewer alias `sandbox-reviewer-fixture`;
- prepares an approval draft without creating or persisting approval;
- emits an unsigned, non-secret, non-PII, unsubmitted envelope;
- exposes Vietnamese, English, and Lao preview views;
- keeps approval token, activation, provider request, settlement, and registry
  mutation absent.

## Non-goals

This package does not create an operational approval record, approval token,
activation token, provider request, settlement instruction, or production
eligibility.

## Preview route

`/ui-preview/payment-sandbox-approval-candidate`

Views:

- `approval`
- `eligibility`
- `approval-envelope`
- `audit`

## Safety

The create-approval action is disabled. The package does not inspect secrets,
call providers, or mutate commerce state.
