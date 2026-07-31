# F07A-3S — Payment Sandbox Provider Request Candidate

## Purpose

F07A-3S consumes the accepted F07A-3R activation-token candidate and prepares
a preview-only provider request candidate.

The candidate:

- reuses the F07A-3R public activation-token contract;
- keeps the opaque reviewer alias `sandbox-reviewer-fixture`;
- prepares a safe provider request draft;
- never creates, submits, or persists a provider request;
- never calls GPay, OnePay, uMoney, or another provider;
- produces an unsigned, non-secret, non-PII, unsubmitted envelope;
- keeps settlement and registry mutation absent.

## Preview route

`/ui-preview/payment-sandbox-provider-request`

Views:

- `request`
- `eligibility`
- `request-envelope`
- `audit`

## Safety boundary

The create-provider-request action is disabled. The package does not inspect
secrets, call providers, mutate commerce state, or create settlement
instructions.
