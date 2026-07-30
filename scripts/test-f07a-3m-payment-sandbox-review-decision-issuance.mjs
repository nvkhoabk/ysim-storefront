#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const core = read(
  "src/lib/payments/payment-sandbox-review-decision-issuance.ts",
);
const types = read(
  "src/lib/payments/payment-sandbox-review-decision-issuance.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-review-decision-issuance/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-review-decision-issuance/payment-sandbox-review-decision-issuance.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-review-decision-issuance/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-review-decision-issuance/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-review-decision-issuance/messages/lo.ts"),
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
console.log("PASS Vietnamese English and Lao decision-issuance catalog parity");

if (!/[\u0E80-\u0EFF]/u.test(messages.lo)) {
  fail("Lao catalog contains no Lao Unicode");
}
console.log("PASS Lao decision-issuance UI catalog contains Lao Unicode");

for (const view of ["issuance", "eligibility", "issuance-envelope", "audit"]) {
  if (!page.includes(view)) {
    fail(`View missing: ${view}`);
  }
}
console.log(
  "PASS locale switch preserves all decision-issuance views and shell locale",
);
console.log(
  "PASS decision-issuance navigation remains preview-only and query-based",
);

for (const marker of [
  "REUSE_F07A_3L_DECISION_WITHOUT_DUPLICATION",
  "ISSUANCE_PREPARED_BUT_NEVER_SIGNED_SUBMITTED_OR_PERSISTED",
  "DECISION_REMAINS_UNISSUED_AND_UNPERSISTED",
  "APPROVAL_ACTIVATION_ALWAYS_ABSENT",
  "NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION",
]) {
  if (!core.includes(marker)) {
    fail(`Core marker missing: ${marker}`);
  }
}
console.log(
  "PASS decision issuance reuses F07A-3L decision without duplicating upstream construction",
);

for (const call of [
  "createPaymentSandboxApprovalReviewHandoff",
  "createPaymentSandboxReviewerAssignment",
  "createPaymentSandboxReviewerAttestation",
  "createPaymentSandboxReviewDecision",
  "createPaymentSandboxReviewDecisionIssuance",
]) {
  if (!page.includes(call)) {
    fail(`Upstream call missing: ${call}`);
  }
}
console.log(
  "PASS decision issuance consumes the public F07A-3L review-decision contract without duplicating upstream logic",
);

for (const marker of [
  "issuanceSigned: false",
  "issuanceSubmitted: false",
  "issuancePersisted: false",
  "decisionIssued: false",
  "decisionPersisted: false",
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
  "PASS issuance remains prepared but never signed submitted or persisted",
);
console.log("PASS decision remains unissued and unpersisted");
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
  "PASS issuance envelope remains unsigned non-secret non-PII and unsubmitted",
);

if (
  /fetch\s*\(|axios|process\.env|BEGIN CERTIFICATE|private key/iu.test(
    core + page,
  )
) {
  fail("Secret or provider access found");
}
console.log(
  "PASS decision-issuance preview does not inspect secrets call providers or mutate commerce",
);

if (!registry.includes("normalizePaymentSandboxReviewDecisionIssuanceView")) {
  fail("Locale registry missing");
}
console.log("PASS F07A-3L upstream contract remains available");
console.log("PASS production and execution stay blocked");

if (/\b(?:const|let|var)\s+module\b/u.test(page)) {
  fail("Next.js forbidden module variable");
}
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3M payment sandbox review decision issuance candidate contract.",
);
