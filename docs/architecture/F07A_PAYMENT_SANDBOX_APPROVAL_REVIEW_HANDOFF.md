# F07A-3I — Payment Sandbox Approval Review Handoff R3

## Purpose

F07A-3I turns the preview-only F07A-3H sandbox approval request into a read-only review handoff. It is deliberately narrower than an approval workflow.

The handoff:

- loads the existing F07A-3H request through its public factory;
- retains only explicitly whitelisted non-secret summary fields;
- computes a deterministic fingerprint for the safe summary;
- creates four manual review items;
- exposes an unsigned, non-secret, unsubmitted JSON envelope;
- provides Vietnamese, English, and Lao preview views;
- keeps reviewer identity, review decision, approval, activation, provider request, settlement instruction, and registry mutation absent.

## Non-goals

This package does not:

- assign a reviewer or approver;
- persist an attestation or decision;
- sign or submit an approval request;
- read API keys, certificates, private keys, or provider credentials;
- call GPay, OnePay, uMoney, WooCommerce, or any fulfillment provider;
- alter payment registry, cart, order, fulfillment, settlement, or inventory state;
- enable production or payment execution.

## Review items

1. Request identity.
2. Verification binding.
3. Approval prerequisites.
4. No-execution guardrails.

Every item remains pending manual review when the provider adapter is runtime-registered. Disabled or missing adapters remain explicitly blocked.

## Preview route

`/ui-preview/payment-sandbox-approval-review-handoff`

Views are selected through the `view` query parameter:

- `handoff`
- `checklist`
- `export-envelope`
- `audit`

The route remains preview-only and does not submit data.


## Release packaging correction R3

The preview dynamic-import namespace uses `approvalRequestModule`; the package runs the repository ESLint configuration against all payload files before applying them.
