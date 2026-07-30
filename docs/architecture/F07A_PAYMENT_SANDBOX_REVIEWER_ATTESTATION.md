# F07A-3K — Payment Sandbox Reviewer Attestation Candidate R1

## Purpose

F07A-3K consumes the preview-only F07A-3J reviewer assignment and prepares an
unsigned reviewer attestation draft. It does not create a verification decision
or approval.

## Safety boundaries

- reviewer alias remains the opaque `sandbox-reviewer-fixture`;
- no PII or credentials are introduced;
- assignment remains unpersisted;
- attestation remains unsigned, unpersisted, and unsubmitted;
- decision, approval, activation, provider request, settlement, and registry
  mutation artifacts remain absent;
- production and payment execution remain blocked.

## Preview route

`/ui-preview/payment-sandbox-reviewer-attestation`

Views:

- `attestation`
- `eligibility`
- `attestation-envelope`
- `audit`

## Human acceptance

Review Vietnamese, English, and Lao across all four views on desktop and mobile.
Confirm the attestation is prepared but not signed or persisted, the audit is
matched, and no decision or execution action is available.
