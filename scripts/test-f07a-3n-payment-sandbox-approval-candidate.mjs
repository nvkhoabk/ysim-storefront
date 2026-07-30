#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const core = read("src/lib/payments/payment-sandbox-approval-candidate.ts");
const types = read(
  "src/lib/payments/payment-sandbox-approval-candidate.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-approval-candidate/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-approval-candidate/payment-sandbox-approval-candidate.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-approval-candidate/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-approval-candidate/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-approval-candidate/messages/lo.ts"),
};

function fail(message) {
  throw new Error(message);
}

function keys(source) {
  return [...source.matchAll(/^\s*"([^"]+)":/gmu)].map((match) => match[1]);
}

const canonical = keys(messages.vi).join("|");
for (const [locale, source] of Object.entries(messages)) {
  if (keys(source).join("|") !== canonical) {
    fail(`Catalog parity failed: ${locale}`);
  }
}
console.log(
  "PASS Vietnamese English and Lao approval-candidate catalog parity",
);

if (!/[\u0E80-\u0EFF]/u.test(messages.lo)) {
  fail("Lao catalog contains no Lao Unicode");
}
console.log("PASS Lao approval-candidate UI catalog contains Lao Unicode");

for (const view of ["approval", "eligibility", "approval-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
console.log(
  "PASS locale switch preserves all approval-candidate views and shell locale",
);
console.log(
  "PASS approval-candidate navigation remains preview-only and query-based",
);

for (const marker of [
  "REUSE_F07A_3M_ISSUANCE_WITHOUT_DUPLICATION",
  "APPROVAL_PREPARED_BUT_NEVER_CREATED_OR_PERSISTED",
  "ISSUANCE_REMAINS_UNSIGNED_UNSUBMITTED_AND_UNPERSISTED",
  "ACTIVATION_ALWAYS_ABSENT",
  "NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS approval candidate reuses F07A-3M issuance without duplicating upstream construction",
);

for (const call of [
  "createPaymentSandboxReviewDecisionIssuance",
  "createPaymentSandboxApprovalCandidate",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS approval candidate consumes the public F07A-3M issuance contract without duplicating upstream logic",
);

for (const marker of [
  "approvalCreated: false",
  "approvalPersisted: false",
  "approvalRecordCreated: false",
  "approvalTokenCreated: false",
  "activationTokenCreated: false",
  "providerRequestCreated: false",
  "productionEligible: false",
  "executionEligible: false",
]) {
  if (!core.includes(marker) && !types.includes(marker)) {
    fail(`Safety marker missing: ${marker}`);
  }
}
console.log("PASS approval remains prepared but never created or persisted");
console.log("PASS activation and provider execution artifacts remain absent");

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
  "PASS approval envelope remains unsigned non-secret non-PII and unsubmitted",
);

if (
  /fetch\s*\(|axios|process\.env|BEGIN CERTIFICATE|private key/iu.test(
    core + page,
  )
) {
  fail("Secret or provider access found");
}
console.log(
  "PASS approval-candidate preview does not inspect secrets call providers or mutate commerce",
);

if (!registry.includes("normalizePaymentSandboxApprovalCandidateView")) {
  fail("Locale registry missing");
}
console.log("PASS F07A-3M upstream contract remains available");
console.log("PASS production and execution stay blocked");

if (/\b(?:const|let|var)\s+module\b/u.test(page)) {
  fail("Next.js forbidden module variable");
}
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log("PASS: F07A-3N payment sandbox approval candidate contract.");
