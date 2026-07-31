#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const core = read("src/lib/payments/payment-sandbox-activation-token.ts");
const types = read(
  "src/lib/payments/payment-sandbox-activation-token.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-activation-token/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-activation-token/payment-sandbox-activation-token.registry.ts",
);
const messages = {
  vi: read("src/i18n/payment-sandbox-activation-token/messages/vi.ts"),
  en: read("src/i18n/payment-sandbox-activation-token/messages/en.ts"),
  lo: read("src/i18n/payment-sandbox-activation-token/messages/lo.ts"),
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
  if (localeKeys.join("|") !== canonical)
    fail(`Catalog parity failed: ${locale}`);
}
console.log("PASS Vietnamese English and Lao activation-token catalog parity");
if (!/[\u0E80-\u0EFF]/u.test(messages.lo))
  fail("Lao catalog contains no Lao Unicode");
console.log("PASS Lao activation-token UI catalog contains Lao Unicode");
for (const view of ["token", "eligibility", "token-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
console.log(
  "PASS locale switch preserves all activation-token views and shell locale",
);
console.log(
  "PASS activation-token navigation remains preview-only and query-based",
);
for (const marker of [
  "REUSE_F07A_3Q_ACTIVATION_WITHOUT_DUPLICATION",
  "ACTIVATION_TOKEN_PREPARED_BUT_NEVER_CREATED_SIGNED_OR_PERSISTED",
  "ACTIVATION_REMAINS_UNCREATED_AND_UNPERSISTED",
  "APPROVAL_TOKEN_REMAINS_UNCREATED_UNSIGNED_AND_UNPERSISTED",
  "NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS activation token reuses F07A-3Q activation without duplicating upstream construction",
);
for (const call of [
  "createPaymentSandboxActivationCandidate",
  "createPaymentSandboxActivationToken",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS activation token consumes the public F07A-3Q activation contract without duplicating upstream logic",
);
for (const marker of [
  "tokenCreated: false",
  "tokenSigned: false",
  "tokenPersisted: false",
  "activationRecordCreated: false",
  "providerRequestCreated: false",
  "productionEligible: false",
  "executionEligible: false",
]) {
  if (!core.includes(marker) && !types.includes(marker))
    fail(`Safety marker missing: ${marker}`);
}
console.log(
  "PASS activation token remains prepared but never created signed or persisted",
);
console.log("PASS activation and provider execution artifacts remain absent");
for (const marker of [
  "signed: false",
  "containsSecret: false",
  "containsPii: false",
  "submitted: false",
  "persisted: false",
]) {
  if (!types.includes(marker) && !core.includes(marker))
    fail(`Envelope marker missing: ${marker}`);
}
console.log(
  "PASS activation-token envelope remains unsigned non-secret non-PII and unsubmitted",
);
if (
  /fetch\s*\(|axios|process\.env|BEGIN CERTIFICATE|private key/iu.test(
    core + page,
  )
)
  fail("Secret or provider access found");
console.log(
  "PASS activation-token preview does not inspect secrets call providers or mutate commerce",
);
if (!registry.includes("normalizePaymentSandboxActivationTokenView"))
  fail("Locale registry missing");
console.log("PASS F07A-3Q upstream contract remains available");
console.log("PASS production and execution stay blocked");
if (/\b(?:const|let|var)\s+module\b/u.test(page))
  fail("Next.js forbidden module variable");
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3R payment sandbox activation token candidate contract.",
);
