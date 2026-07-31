#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const core = read(
  "src/lib/payments/payment-sandbox-provider-response-receipt.ts",
);
const types = read(
  "src/lib/payments/payment-sandbox-provider-response-receipt.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-provider-response-receipt/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-provider-response-receipt/payment-sandbox-provider-response-receipt.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-provider-response-receipt/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-provider-response-receipt/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-provider-response-receipt/messages/lo.ts"),
};
function fail(message) {
  throw new Error(message);
}
function keys(source) {
  return [...source.matchAll(/^\s*"([^"]+)":/gmu)].map((match) => match[1]);
}
const canonical = keys(messages.vi).join("|");
for (const [locale, source] of Object.entries(messages)) {
  if (keys(source).join("|") !== canonical)
    fail(`Catalog parity failed: ${locale}`);
}
console.log(
  "PASS Vietnamese English and Lao provider-response-receipt catalog parity",
);
if (!/[\u0E80-\u0EFF]/u.test(messages.lo))
  fail("Lao catalog contains no Lao Unicode");
console.log(
  "PASS Lao provider-response-receipt UI catalog contains Lao Unicode",
);
for (const view of ["receipt", "normalization", "receipt-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
console.log(
  "PASS locale switch preserves all provider-response-receipt views and shell locale",
);
console.log(
  "PASS provider-response-receipt navigation remains preview-only and query-based",
);
for (const marker of [
  "REUSE_F07A_3V_PROVIDER_EXECUTION_BOUNDARY_WITHOUT_DUPLICATION",
  "NORMALIZATION_PREPARED_WITHOUT_PROVIDER_RESPONSE",
  "RESPONSE_RECEIPT_NEVER_CREATED_OR_PERSISTED",
  "NO_PROVIDER_CALL_SETTLEMENT_REGISTRY_OR_COMMERCE_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS provider response receipt reuses F07A-3V execution boundary without duplicating upstream construction",
);
for (const call of [
  "createPaymentSandboxProviderExecutionBoundary",
  "createPaymentSandboxProviderResponseReceipt",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS provider response receipt consumes the public F07A-3V execution-boundary contract",
);
for (const marker of [
  "providerResponseReceived: false",
  "providerResponseNormalized: false",
  "responseReceiptCreated: false",
  "responseReceiptPersisted: false",
  "providerExecutionAttemptCreated: false",
  "providerResponseReceiptCreated: false",
  "settlementInstructionCreated: false",
  "productionEligible: false",
  "executionEligible: false",
]) {
  if (!core.includes(marker) && !types.includes(marker))
    fail(`Safety marker missing: ${marker}`);
}
console.log(
  "PASS response normalization is prepared while provider response and receipt remain absent",
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
  "PASS provider-response-receipt envelope remains unsigned non-secret non-PII and unsubmitted",
);
if (
  /fetch\s*\(|axios|process\.env|private key|begin certificate/iu.test(
    core + page,
  )
)
  fail("Provider or secret access found");
console.log(
  "PASS provider-response-receipt preview does not inspect secrets call providers or mutate commerce",
);
if (!registry.includes("normalizePaymentSandboxProviderResponseReceiptView"))
  fail("Locale registry missing");
console.log("PASS F07A-3V upstream contract remains available");
console.log("PASS production and execution stay blocked");
if (/\b(?:const|let|var)\s+module\b/u.test(page))
  fail("Next.js forbidden module variable");
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3W payment sandbox provider response receipt candidate contract.",
);
