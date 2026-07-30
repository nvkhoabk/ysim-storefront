# F07A-3M — Payment Sandbox Review Decision Issuance Candidate

## Purpose

F07A-3M consumes the accepted F07A-3L review decision and prepares a
preview-only issuance packet.

The candidate:

- reuses the F07A-3L public decision contract;
- keeps the reviewer alias `sandbox-reviewer-fixture`;
- prepares issuance metadata without issuing the decision;
- leaves the decision unissued and unpersisted;
- produces an unsigned, non-secret, non-PII, unsubmitted envelope;
- exposes Vietnamese, English, and Lao preview views;
- keeps approval, activation, provider request, settlement, and registry
  mutation absent.

## Non-goals

This package does not issue or persist a review decision. It does not create an
approval record, token, activation, provider request, settlement instruction,
or production eligibility.

## Preview route

`/ui-preview/payment-sandbox-review-decision-issuance`

Views:

- `issuance`
- `eligibility`
- `issuance-envelope`
- `audit`

## Safety

The issue-decision action is disabled. The package does not inspect secrets,
call providers, or mutate commerce state.
