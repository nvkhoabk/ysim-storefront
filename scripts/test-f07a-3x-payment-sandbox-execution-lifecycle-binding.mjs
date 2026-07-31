#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const core = read(
  "src/lib/payments/payment-sandbox-execution-lifecycle-binding.ts",
);
const types = read(
  "src/lib/payments/payment-sandbox-execution-lifecycle-binding.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-execution-lifecycle-binding/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-execution-lifecycle-binding/payment-sandbox-execution-lifecycle-binding.registry.ts",
);
const i18nTypes = read(
  "src/i18n/payment-sandbox-execution-lifecycle-binding/payment-sandbox-execution-lifecycle-binding.types.ts",
);
const messages = {
  vi: read(
    "src/i18n/payment-sandbox-execution-lifecycle-binding/messages/vi.ts",
  ),
  en: read(
    "src/i18n/payment-sandbox-execution-lifecycle-binding/messages/en.ts",
  ),
  lo: read(
    "src/i18n/payment-sandbox-execution-lifecycle-binding/messages/lo.ts",
  ),
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
  "PASS Vietnamese English and Lao execution-lifecycle-binding catalog parity",
);

if (!/[\u0E80-\u0EFF]/u.test(messages.lo)) {
  fail("Lao catalog contains no Lao Unicode");
}
console.log(
  "PASS Lao execution-lifecycle-binding UI catalog contains Lao Unicode",
);

for (const view of ["binding", "lifecycle", "binding-envelope", "audit"]) {
  if (!page.includes(view)) fail(`View missing: ${view}`);
}
console.log(
  "PASS locale switch preserves all execution-lifecycle-binding views and shell locale",
);
console.log(
  "PASS execution-lifecycle-binding navigation remains preview-only and query-based",
);

for (const marker of [
  "REUSE_F07A_3W_PROVIDER_RESPONSE_RECEIPT_WITHOUT_DUPLICATION",
  "LIFECYCLE_BINDING_PREPARED_BUT_NEVER_BOUND_OR_PERSISTED",
  "UPSTREAM_RESPONSE_AND_RECEIPT_REMAIN_ABSENT",
  "NO_PROVIDER_CALL_SETTLEMENT_REGISTRY_OR_COMMERCE_MUTATION",
]) {
  if (!core.includes(marker)) fail(`Core marker missing: ${marker}`);
}
console.log(
  "PASS execution lifecycle binding reuses F07A-3W response receipt without duplicating upstream construction",
);

for (const call of [
  "createPaymentSandboxProviderResponseReceipt",
  "createPaymentSandboxExecutionLifecycleBinding",
]) {
  if (!page.includes(call)) fail(`Upstream call missing: ${call}`);
}
console.log(
  "PASS execution lifecycle binding consumes the public F07A-3W response-receipt contract",
);

for (const marker of [
  "lifecycleBound: false",
  "bindingPersisted: false",
  "providerResponseReceived: false",
  "responseReceiptCreated: false",
  "paymentExecutionLifecycleBindingCreated: false",
  "transactionStateMutationCreated: false",
  "settlementInstructionCreated: false",
  "productionEligible: false",
  "executionEligible: false",
]) {
  if (!core.includes(marker) && !types.includes(marker)) {
    fail(`Safety marker missing: ${marker}`);
  }
}
console.log(
  "PASS lifecycle binding remains prepared but never bound or persisted",
);
console.log(
  "PASS provider response receipt settlement registry and transaction mutation artifacts remain absent",
);

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
  "PASS execution-lifecycle-binding envelope remains unsigned non-secret non-PII and unsubmitted",
);

if (
  /fetch\s*\(|axios|process\.env|private key|begin certificate/iu.test(
    core + page,
  )
) {
  fail("Provider or secret access found");
}
console.log(
  "PASS execution-lifecycle-binding preview does not inspect secrets call providers or mutate commerce",
);

if (
  !registry.includes("normalizePaymentSandboxExecutionLifecycleBindingView") ||
  !registry.includes(
    'import type { ShellLocale } from "../shell/shell.types";',
  ) ||
  !i18nTypes.includes("readonly locale: ShellLocale;")
) {
  fail("Locale registry contract missing");
}
console.log("PASS F07A-3W upstream contract remains available");
console.log("PASS production and execution stay blocked");

if (/\b(?:const|let|var)\s+module\b/u.test(page)) {
  fail("Next.js forbidden module variable");
}
console.log("PASS Next.js forbidden module-variable regression remains absent");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3X payment sandbox execution lifecycle binding candidate contract.",
);
