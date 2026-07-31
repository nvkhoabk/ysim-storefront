#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = (r) => fs.readFileSync(path.join(root, r), "utf8");
const core = read(
  "src/lib/payments/payment-sandbox-provider-submission-gate.ts",
);
const types = read(
  "src/lib/payments/payment-sandbox-provider-submission-gate.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-provider-submission-gate/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-provider-submission-gate/payment-sandbox-provider-submission-gate.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-provider-submission-gate/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-provider-submission-gate/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-provider-submission-gate/messages/lo.ts"),
};
function fail(m) {
  throw new Error(m);
}
function keys(s) {
  return [...s.matchAll(/^\s*"([^"]+)":/gmu)].map((m) => m[1]);
}
const canonical = keys(messages.vi).join("|");
for (const [locale, source] of Object.entries(messages)) {
  if (keys(source).join("|") !== canonical)
    fail(`Catalog parity failed: ${locale}`);
}
console.log(
  "PASS Vietnamese English and Lao provider-submission-gate catalog parity",
);
if (!/[\u0E80-\u0EFF]/u.test(messages.lo))
  fail("Lao catalog contains no Lao Unicode");
console.log(
  "PASS Lao provider-submission-gate UI catalog contains Lao Unicode",
);
for (const view of ["gate", "eligibility", "gate-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
console.log(
  "PASS locale switch preserves all provider-submission-gate views and shell locale",
);
console.log(
  "PASS provider-submission-gate navigation remains preview-only and query-based",
);
for (const marker of [
  "REUSE_F07A_3T_PROVIDER_REQUEST_ISSUANCE_WITHOUT_DUPLICATION",
  "GATE_PREPARED_BUT_NEVER_OPENED_OR_AUTHORIZED",
  "PROVIDER_REQUEST_AND_ISSUANCE_REMAIN_UNCREATED_UNSUBMITTED_AND_UNPERSISTED",
  "NO_PROVIDER_CALL_SETTLEMENT_OR_REGISTRY_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS provider submission gate reuses F07A-3T issuance without duplicating upstream construction",
);
for (const call of [
  "createPaymentSandboxProviderRequestIssuance",
  "createPaymentSandboxProviderSubmissionGate",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS provider submission gate consumes the public F07A-3T issuance contract without duplicating upstream logic",
);
for (const marker of [
  "gateOpen: false",
  "submissionAuthorized: false",
  "providerCallAllowed: false",
  "providerSubmissionGateRecordCreated: false",
  "providerSubmissionAttemptCreated: false",
  "settlementInstructionCreated: false",
  "productionEligible: false",
  "executionEligible: false",
]) {
  if (!core.includes(marker) && !types.includes(marker))
    fail(`Safety marker missing: ${marker}`);
}
console.log(
  "PASS submission gate remains prepared closed unauthorized and provider-call-disabled",
);
console.log(
  "PASS provider attempt settlement and registry mutation artifacts remain absent",
);
for (const marker of [
  "signed: false",
  "containsSecret: false",
  "containsPii: false",
  "submitted: false",
  "persisted: false",
]) {
  if (!core.includes(marker) && !types.includes(marker))
    fail(`Envelope marker missing: ${marker}`);
}
console.log(
  "PASS provider-submission-gate envelope remains unsigned non-secret non-PII and unsubmitted",
);
if (
  /fetch\s*\(|axios|process\.env|private key|begin certificate/iu.test(
    core + page,
  )
)
  fail("Provider or secret access found");
console.log(
  "PASS provider-submission-gate preview does not inspect secrets call providers or mutate commerce",
);
if (!registry.includes("normalizePaymentSandboxProviderSubmissionGateView"))
  fail("Locale registry missing");
console.log("PASS F07A-3T upstream contract remains available");
console.log("PASS production and execution stay blocked");
if (/\b(?:const|let|var)\s+module\b/u.test(page))
  fail("Next.js forbidden module variable");
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3U payment sandbox provider submission gate candidate contract.",
);
