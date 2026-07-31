# F07A-3Q — Payment Sandbox Activation Candidate

## Purpose

F07A-3Q consumes the accepted F07A-3P approval-token candidate and prepares a
preview-only activation candidate.

The candidate:

- reuses the F07A-3P public approval-token contract;
- keeps the opaque reviewer alias `sandbox-reviewer-fixture`;
- prepares activation metadata but never creates or persists activation;
- leaves the approval token uncreated, unsigned, and unpersisted;
- produces an unsigned, non-secret, non-PII, unsubmitted envelope;
- exposes Vietnamese, English, and Lao preview views;
- keeps activation token, provider request, settlement, and registry mutation absent.

## Preview route

`/ui-preview/payment-sandbox-activation-candidate`

Views:

- `activation`
- `eligibility`
- `activation-envelope`
- `audit`

## Safety

The create-activation action is disabled. This package does not inspect secrets,
call payment providers, or mutate commerce state.
