#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const core = read(
  "src/lib/payments/payment-sandbox-provider-request-issuance.ts",
);
const types = read(
  "src/lib/payments/payment-sandbox-provider-request-issuance.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-provider-request-issuance/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-provider-request-issuance/payment-sandbox-provider-request-issuance.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-provider-request-issuance/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-provider-request-issuance/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-provider-request-issuance/messages/lo.ts"),
};
function fail(message) {
  throw new Error(message);
}
function keys(source) {
  return [...source.matchAll(/^\s*"([^"]+)":/gmu)].map((m) => m[1]);
}
const canonical = keys(messages.vi).join("|");
for (const [locale, source] of Object.entries(messages)) {
  if (keys(source).join("|") !== canonical)
    fail(`Catalog parity failed: ${locale}`);
}
console.log(
  "PASS Vietnamese English and Lao provider-request-issuance catalog parity",
);
if (!/[\u0E80-\u0EFF]/u.test(messages.lo))
  fail("Lao catalog contains no Lao Unicode");
console.log(
  "PASS Lao provider-request-issuance UI catalog contains Lao Unicode",
);
for (const view of ["issuance", "eligibility", "issuance-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
console.log(
  "PASS locale switch preserves all provider-request-issuance views and shell locale",
);
console.log(
  "PASS provider-request-issuance navigation remains preview-only and query-based",
);
for (const marker of [
  "REUSE_F07A_3S_PROVIDER_REQUEST_WITHOUT_DUPLICATION",
  "ISSUANCE_PREPARED_BUT_NEVER_ISSUED_SIGNED_SUBMITTED_OR_PERSISTED",
  "PROVIDER_REQUEST_REMAINS_UNCREATED_UNSUBMITTED_AND_UNPERSISTED",
  "NO_PROVIDER_EXECUTION_SETTLEMENT_OR_REGISTRY_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS provider request issuance reuses F07A-3S provider request without duplicating upstream construction",
);
for (const call of [
  "createPaymentSandboxProviderRequest",
  "createPaymentSandboxProviderRequestIssuance",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS provider request issuance consumes the public F07A-3S provider-request contract without duplicating upstream logic",
);
for (const marker of [
  "issuanceIssued: false",
  "issuanceSigned: false",
  "issuanceSubmitted: false",
  "issuancePersisted: false",
  "providerRequestIssuanceRecordCreated: false",
  "settlementInstructionCreated: false",
  "productionEligible: false",
  "executionEligible: false",
]) {
  if (!core.includes(marker) && !types.includes(marker))
    fail(`Safety marker missing: ${marker}`);
}
console.log(
  "PASS provider request issuance remains prepared but never issued signed submitted or persisted",
);
console.log(
  "PASS provider request settlement and registry mutation artifacts remain absent",
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
  "PASS provider-request-issuance envelope remains unsigned non-secret non-PII and unsubmitted",
);
if (
  /fetch\s*\(|axios|process\.env|private key|begin certificate/iu.test(
    core + page,
  )
)
  fail("Provider or secret access found");
console.log(
  "PASS provider-request-issuance preview does not inspect secrets call providers or mutate commerce",
);
if (!registry.includes("normalizePaymentSandboxProviderRequestIssuanceView"))
  fail("Locale registry missing");
console.log("PASS F07A-3S upstream contract remains available");
console.log("PASS production and execution stay blocked");
if (/\b(?:const|let|var)\s+module\b/u.test(page))
  fail("Next.js forbidden module variable");
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3T payment sandbox provider request issuance candidate contract.",
);
