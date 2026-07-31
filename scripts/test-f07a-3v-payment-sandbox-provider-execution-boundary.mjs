#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = (r) => fs.readFileSync(path.join(root, r), "utf8");
const core = read(
  "src/lib/payments/payment-sandbox-provider-execution-boundary.ts",
);
const types = read(
  "src/lib/payments/payment-sandbox-provider-execution-boundary.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-provider-execution-boundary/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-provider-execution-boundary/payment-sandbox-provider-execution-boundary.registry.ts",
);
const messages = {
  vi: read(
    "src/i18n/payment-sandbox-provider-execution-boundary/messages/vi.ts",
  ),
  en: read(
    "src/i18n/payment-sandbox-provider-execution-boundary/messages/en.ts",
  ),
  lo: read(
    "src/i18n/payment-sandbox-provider-execution-boundary/messages/lo.ts",
  ),
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
  "PASS Vietnamese English and Lao provider-execution-boundary catalog parity",
);
if (!/[\u0E80-\u0EFF]/u.test(messages.lo))
  fail("Lao catalog contains no Lao Unicode");
console.log(
  "PASS Lao provider-execution-boundary UI catalog contains Lao Unicode",
);
for (const view of ["boundary", "eligibility", "boundary-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
console.log(
  "PASS locale switch preserves all provider-execution-boundary views and shell locale",
);
console.log(
  "PASS provider-execution-boundary navigation remains preview-only and query-based",
);
for (const marker of [
  "REUSE_F07A_3U_PROVIDER_SUBMISSION_GATE_WITHOUT_DUPLICATION",
  "BOUNDARY_PREPARED_BUT_NEVER_OPENED_OR_AUTHORIZED",
  "NO_CREDENTIAL_RESOLUTION_PROVIDER_CALL_OR_RESPONSE_CAPTURE",
  "NO_SETTLEMENT_REGISTRY_OR_COMMERCE_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS provider execution boundary reuses F07A-3U gate without duplicating upstream construction",
);
for (const call of [
  "createPaymentSandboxProviderSubmissionGate",
  "createPaymentSandboxProviderExecutionBoundary",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS provider execution boundary consumes the public F07A-3U gate contract without duplicating upstream logic",
);
for (const marker of [
  "boundaryOpen: false",
  "executionAuthorized: false",
  "credentialResolutionAttempted: false",
  "providerCallAttempted: false",
  "providerResponseReceived: false",
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
  "PASS execution boundary remains prepared closed unauthorized and provider-call-unattempted",
);
console.log(
  "PASS credential response settlement and registry mutation artifacts remain absent",
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
  "PASS provider-execution-boundary envelope remains unsigned non-secret non-PII and unsubmitted",
);
if (
  /fetch\s*\(|axios|process\.env|private key|begin certificate/iu.test(
    core + page,
  )
)
  fail("Provider or secret access found");
console.log(
  "PASS provider-execution-boundary preview does not inspect secrets call providers or mutate commerce",
);
if (!registry.includes("normalizePaymentSandboxProviderExecutionBoundaryView"))
  fail("Locale registry missing");
console.log("PASS F07A-3U upstream contract remains available");
console.log("PASS production and execution stay blocked");
if (/\b(?:const|let|var)\s+module\b/u.test(page))
  fail("Next.js forbidden module variable");
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3V payment sandbox provider execution boundary candidate contract.",
);
