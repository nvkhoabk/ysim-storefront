# F07A-3L — Payment Sandbox Review Decision Candidate

## Purpose

F07A-3L consumes the accepted F07A-3K reviewer attestation and prepares a
preview-only proposed review decision.

The candidate:

- reuses the F07A-3K public attestation contract;
- keeps the opaque reviewer alias `sandbox-reviewer-fixture`;
- prepares `sandbox-approval-recommended-preview-only`;
- never issues or persists a decision;
- exposes an unsigned, non-secret, non-PII, unsubmitted envelope;
- supports Vietnamese, English, and Lao UI previews;
- keeps approval, activation, provider request, settlement, and registry
  mutation absent.

## Preview route

`/ui-preview/payment-sandbox-review-decision`

Views:

- `decision`
- `eligibility`
- `decision-envelope`
- `audit`

## Safety boundary

The issue-decision action is disabled. This package does not inspect secrets,
call providers, or mutate commerce state.
