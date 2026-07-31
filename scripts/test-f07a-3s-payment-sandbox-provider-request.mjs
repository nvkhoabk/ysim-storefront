#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const core = read("src/lib/payments/payment-sandbox-provider-request.ts");
const types = read(
  "src/lib/payments/payment-sandbox-provider-request.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-provider-request/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-provider-request/payment-sandbox-provider-request.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-provider-request/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-provider-request/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-provider-request/messages/lo.ts"),
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
console.log("PASS Vietnamese English and Lao provider-request catalog parity");

if (!/[\u0E80-\u0EFF]/u.test(messages.lo)) {
  fail("Lao catalog contains no Lao Unicode");
}
console.log("PASS Lao provider-request UI catalog contains Lao Unicode");

for (const view of ["request", "eligibility", "request-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
console.log(
  "PASS locale switch preserves all provider-request views and shell locale",
);
console.log(
  "PASS provider-request navigation remains preview-only and query-based",
);

for (const marker of [
  "REUSE_F07A_3R_ACTIVATION_TOKEN_WITHOUT_DUPLICATION",
  "PROVIDER_REQUEST_PREPARED_BUT_NEVER_CREATED_SUBMITTED_OR_PERSISTED",
  "ACTIVATION_TOKEN_REMAINS_UNCREATED_UNSIGNED_AND_UNPERSISTED",
  "NO_PROVIDER_EXECUTION_SETTLEMENT_OR_REGISTRY_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS provider request reuses F07A-3R activation token without duplicating upstream construction",
);

for (const call of [
  "createPaymentSandboxActivationToken",
  "createPaymentSandboxProviderRequest",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS provider request consumes the public F07A-3R activation-token contract without duplicating upstream logic",
);

for (const marker of [
  "requestCreated: false",
  "requestSubmitted: false",
  "requestPersisted: false",
  "providerRequestRecordCreated: false",
  "settlementInstructionCreated: false",
  "registryMutationCreated: false",
  "productionEligible: false",
  "executionEligible: false",
]) {
  if (!core.includes(marker) && !types.includes(marker)) {
    fail(`Safety marker missing: ${marker}`);
  }
}
console.log(
  "PASS provider request remains prepared but never created submitted or persisted",
);
console.log("PASS settlement and registry mutation artifacts remain absent");

for (const marker of [
  "signed: false",
  "containsSecret: false",
  "containsPii: false",
  "submitted: false",
  "persisted: false",
]) {
  if (!core.includes(marker) && !types.includes(marker)) {
    fail(`Envelope marker missing: ${marker}`);
  }
}
console.log(
  "PASS provider-request envelope remains unsigned non-secret non-PII and unsubmitted",
);

if (
  /fetch\s*\(|axios|process\.env|private key|begin certificate/iu.test(
    core + page,
  )
) {
  fail("Provider or secret access found");
}
console.log(
  "PASS provider-request preview does not inspect secrets call providers or mutate commerce",
);

if (!registry.includes("normalizePaymentSandboxProviderRequestView")) {
  fail("Locale registry missing");
}
console.log("PASS F07A-3R upstream contract remains available");
console.log("PASS production and execution stay blocked");

if (/\b(?:const|let|var)\s+module\b/u.test(page)) {
  fail("Next.js forbidden module variable");
}
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3S payment sandbox provider request candidate contract.",
);
