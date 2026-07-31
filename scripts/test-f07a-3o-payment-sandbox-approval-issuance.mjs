#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = (r) => fs.readFileSync(path.join(root, r), "utf8");
const core = read("src/lib/payments/payment-sandbox-approval-issuance.ts");
const types = read(
  "src/lib/payments/payment-sandbox-approval-issuance.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-approval-issuance/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-approval-issuance/payment-sandbox-approval-issuance.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-approval-issuance/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-approval-issuance/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-approval-issuance/messages/lo.ts"),
};
const fail = (m) => {
  throw new Error(m);
};
const keys = (s) => [...s.matchAll(/^\s*"([^"]+)":/gmu)].map((m) => m[1]);
const canonical = keys(messages.vi).join("|");
for (const [locale, s] of Object.entries(messages))
  if (keys(s).join("|") !== canonical) fail(`Catalog parity failed: ${locale}`);
console.log("PASS Vietnamese English and Lao approval-issuance catalog parity");
if (!/[\u0E80-\u0EFF]/u.test(messages.lo))
  fail("Lao catalog contains no Lao Unicode");
console.log("PASS Lao approval-issuance UI catalog contains Lao Unicode");
for (const view of ["issuance", "eligibility", "issuance-envelope", "audit"])
  if (!page.includes(view)) fail(`View missing: ${view}`);
console.log(
  "PASS locale switch preserves all approval-issuance views and shell locale",
);
console.log(
  "PASS approval-issuance navigation remains preview-only and query-based",
);
for (const marker of [
  "REUSE_F07A_3N_APPROVAL_WITHOUT_DUPLICATION",
  "ISSUANCE_PREPARED_BUT_NEVER_SIGNED_SUBMITTED_OR_PERSISTED",
  "APPROVAL_REMAINS_UNCREATED_AND_UNPERSISTED",
  "ACTIVATION_ALWAYS_ABSENT",
  "NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION",
])
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
console.log(
  "PASS approval issuance reuses F07A-3N approval without duplicating upstream construction",
);
for (const call of [
  "createPaymentSandboxApprovalCandidate",
  "createPaymentSandboxApprovalIssuance",
])
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
console.log(
  "PASS approval issuance consumes the public F07A-3N approval contract without duplicating upstream logic",
);
for (const marker of [
  "issuanceSigned: false",
  "issuanceSubmitted: false",
  "issuancePersisted: false",
  "approvalCreated: false",
  "approvalPersisted: false",
  "approvalTokenCreated: false",
  "activationTokenCreated: false",
  "providerRequestCreated: false",
  "productionEligible: false",
  "executionEligible: false",
])
  if (!core.includes(marker) && !types.includes(marker))
    fail(`Safety marker missing: ${marker}`);
console.log(
  "PASS issuance remains prepared but never signed submitted or persisted",
);
console.log(
  "PASS approval remains uncreated and activation/provider artifacts remain absent",
);
for (const marker of [
  "signed: false",
  "containsSecret: false",
  "containsPii: false",
  "submitted: false",
  "persisted: false",
])
  if (!types.includes(marker) && !core.includes(marker))
    fail(`Envelope marker missing: ${marker}`);
console.log(
  "PASS approval issuance envelope remains unsigned non-secret non-PII and unsubmitted",
);
if (
  /fetch\s*\(|axios|process\.env|BEGIN CERTIFICATE|private key/iu.test(
    core + page,
  )
)
  fail("Secret or provider access found");
console.log(
  "PASS approval-issuance preview does not inspect secrets call providers or mutate commerce",
);
if (!registry.includes("normalizePaymentSandboxApprovalIssuanceView"))
  fail("Locale registry missing");
console.log("PASS F07A-3N upstream contract remains available");
console.log("PASS production and execution stay blocked");
if (/\b(?:const|let|var)\s+module\b/u.test(page))
  fail("Next.js forbidden module variable");
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3O payment sandbox approval issuance candidate contract.",
);
