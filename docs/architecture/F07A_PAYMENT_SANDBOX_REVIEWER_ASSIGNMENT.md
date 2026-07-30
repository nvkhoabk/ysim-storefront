# F07A-3J — Payment Sandbox Reviewer Assignment Candidate R1

## Purpose

F07A-3J consumes the read-only F07A-3I review handoff and prepares a deterministic reviewer-assignment candidate for sandbox inspection.

The assignment candidate:

- reuses the public F07A-3I handoff and audit contract;
- retains the four review-item bindings;
- uses one opaque fixture alias with no PII or credential material;
- creates an unsigned, non-secret, non-PII, unsubmitted and unpersisted assignment envelope;
- provides Vietnamese, English and Lao preview views;
- keeps review decision, reviewer attestation, approval, activation, provider request, settlement instruction and registry mutation absent.

## Non-goals

This package does not:

- persist a reviewer assignment;
- use a real employee identity, email address or account;
- create a review decision or reviewer attestation;
- authorize or submit an approval request;
- read API keys, certificates, private keys or provider credentials;
- call GPay, OnePay, uMoney, WooCommerce or any fulfillment provider;
- alter payment registry, cart, order, fulfillment, settlement or inventory state;
- enable production or payment execution.

## Preview route

`/ui-preview/payment-sandbox-reviewer-assignment`

Views:

- `assignment`
- `eligibility`
- `assignment-envelope`
- `audit`

## Creator-standard evidence

This release follows YSIM-PCS-001 v1.4.0 and carries forward the regression gates for repository-native Next.js ESLint, Node-entry TypeScript invocation, paths containing spaces, ownership-safe repeated installation and partial-state rejection.

## Release packaging correction R2

The package semantic contract uses TypeScript AST traversal rather than whitespace-sensitive source fragments. Repository Prettier may change dynamic-import and call layout without invalidating the upstream reuse contract.

## R3 deployment correction

The R3 release carries the Windows PowerShell archive-extraction, package-root discovery, user-profile path and actual-runner lifecycle regression gates introduced by INC-20260730-F07A3J-02.

## R4 path-budget correction

R4 carries the Windows legacy path-budget, compact workspace, short archive
root, pre-extraction target projection and no-partial-extraction gates from
INC-20260730-F07A3J-03.
