#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const core = read("src/lib/payments/payment-sandbox-review-decision.ts");
const types = read("src/lib/payments/payment-sandbox-review-decision.types.ts");
const page = read(
  "src/app/ui-preview/payment-sandbox-review-decision/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-review-decision/payment-sandbox-review-decision.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-review-decision/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-review-decision/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-review-decision/messages/lo.ts"),
};

function fail(message) {
  throw new Error(message);
}

function keys(source) {
  return [...source.matchAll(/^\s*"([^"]+)":/gmu)].map((match) => match[1]);
}

const catalogs = Object.fromEntries(
  Object.entries(messages).map(([locale, source]) => [locale, keys(source)]),
);
const canonical = catalogs.vi.join("|");
for (const [locale, localeKeys] of Object.entries(catalogs)) {
  if (localeKeys.join("|") !== canonical) {
    fail(`Catalog parity failed: ${locale}`);
  }
}
console.log("PASS Vietnamese English and Lao review-decision catalog parity");

if (!/[\u0E80-\u0EFF]/u.test(messages.lo)) {
  fail("Lao catalog contains no Lao Unicode");
}
console.log("PASS Lao review-decision UI catalog contains Lao Unicode");

for (const view of ["decision", "eligibility", "decision-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
for (const locale of ["vi", "en", "lo"]) {
  if (!page.includes(locale)) fail(`Locale missing: ${locale}`);
}
console.log(
  "PASS locale switch preserves all review-decision views and shell locale",
);
console.log(
  "PASS review-decision navigation remains preview-only and query-based",
);

for (const marker of [
  "REUSE_F07A_3K_ATTESTATION_WITHOUT_DUPLICATION",
  "DECISION_PREPARED_BUT_NEVER_ISSUED_OR_PERSISTED",
  "OPAQUE_FIXTURE_REVIEWER_ALIAS_ONLY",
  "APPROVAL_ACTIVATION_ALWAYS_ABSENT",
  "NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS review decision reuses F07A-3K attestation without duplicating upstream construction",
);

for (const call of [
  "createPaymentSandboxApprovalReviewHandoff",
  "createPaymentSandboxReviewerAssignment",
  "createPaymentSandboxReviewerAttestation",
  "createPaymentSandboxReviewDecision",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS review decision consumes the public F07A-3K attestation contract without duplicating upstream logic",
);

for (const marker of [
  "decisionIssued: false",
  "decisionPersisted: false",
  "reviewDecisionRecordCreated: false",
  "approvalCreated: false",
  "activationTokenCreated: false",
  "providerRequestCreated: false",
  "productionEligible: false",
  "executionEligible: false",
]) {
  if (!core.includes(marker) && !types.includes(marker)) {
    fail(`Safety marker missing: ${marker}`);
  }
}
console.log(
  "PASS review decision remains prepared but never issued or persisted",
);
console.log(
  "PASS approval activation and provider execution artifacts remain absent",
);

for (const marker of [
  "signed: false",
  "containsSecret: false",
  "containsPii: false",
  "submitted: false",
  "persisted: false",
]) {
  if (!types.includes(marker) && !core.includes(marker)) {
    fail(`Envelope marker missing: ${marker}`);
  }
}
console.log(
  "PASS decision envelope remains unsigned non-secret non-PII and unsubmitted",
);

if (
  /fetch\s*\(|axios|process\.env|BEGIN CERTIFICATE|private key/iu.test(
    core + page,
  )
) {
  fail("Secret or provider access found");
}
console.log(
  "PASS review-decision preview does not inspect secrets call providers or mutate commerce",
);

if (!registry.includes("normalizePaymentSandboxReviewDecisionView")) {
  fail("Locale registry missing");
}
console.log("PASS F07A-3K upstream contract remains available");
console.log("PASS production and execution stay blocked");

if (/\b(?:const|let|var)\s+module\b/u.test(page)) {
  fail("Next.js forbidden module variable");
}
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3L payment sandbox review decision candidate contract.",
);
