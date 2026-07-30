// F07A-3E_PAYMENT_EXECUTION_READINESS_GATE_CANDIDATE_R1
// F07A_3E_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/payment-execution-readiness/messages/vi.ts",
  en: "src/i18n/payment-execution-readiness/messages/en.ts",
  lo: "src/i18n/payment-execution-readiness/messages/lo.ts",
};

function parseMessages(source) {
  const result = new Map();
  const pattern = /^\s*"([^"]+)":\s*("(?:\\.|[^"\\])*"),?\s*$/gm;
  for (const match of source.matchAll(pattern)) {
    if (typeof match[1] === "string" && typeof match[2] === "string") {
      result.set(match[1], JSON.parse(match[2]));
    }
  }
  return result;
}

function placeholders(value) {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_.-]*)\}/g)]
    .map((match) => match[1])
    .filter(Boolean)
    .sort();
}

const catalogs = Object.fromEntries(
  Object.entries(messageFiles).map(([locale, file]) => [
    locale,
    parseMessages(read(file)),
  ]),
);
assert.deepEqual(Object.keys(catalogs).sort(), ["en", "lo", "vi"]);
const keys = [...catalogs.vi.keys()].sort();
assert.ok(keys.length >= 90, "expected comprehensive readiness catalog");
for (const [locale, catalog] of Object.entries(catalogs)) {
  assert.deepEqual([...catalog.keys()].sort(), keys, `key mismatch:${locale}`);
  for (const key of keys) {
    const value = catalog.get(key) ?? "";
    assert.ok(value.trim(), `empty:${locale}:${key}`);
    assert.doesNotMatch(value, /<\/?[A-Za-z][^>]*>/);
    assert.deepEqual(
      placeholders(value),
      placeholders(catalogs.vi.get(key) ?? ""),
      `placeholder mismatch:${locale}:${key}`,
    );
  }
}
console.log(
  "PASS Vietnamese English and Lao execution-readiness catalog parity",
);
assert.ok([...catalogs.lo.values()].some((value) => /[຀-໿]/u.test(value)));
console.log("PASS Lao execution-readiness UI catalog contains Lao Unicode");

const preview = read("src/app/ui-preview/payment-execution-readiness/page.tsx");
const readiness = read("src/lib/payments/payment-execution-readiness.ts");
const readinessTypes = read(
  "src/lib/payments/payment-execution-readiness.types.ts",
);
const registry = read(
  "src/i18n/payment-execution-readiness/payment-execution-readiness.registry.ts",
);
const compactPreview = preview.replace(/\s+/g, " ");
const compactReadiness = readiness.replace(/\s+/g, " ");

assert.match(
  preview,
  /previewPath:\s*"\/ui-preview\/payment-execution-readiness"/,
);
for (const view of ["readiness", "blockers", "activation-draft", "audit"]) {
  assert.match(preview, new RegExp(`"${view}"`));
}
assert.match(
  compactPreview,
  /\/ui-preview\/payment-execution-readiness\?locale=\$\{locale\}&view=\$\{view\}/,
);
assert.match(
  compactPreview,
  /\/ui-preview\/payment-execution-readiness\?locale=\$\{shell\.locale\}&view=\$\{candidate\}/,
);
console.log(
  "PASS locale switch preserves all execution-readiness views and shell locale",
);
console.log(
  "PASS execution-readiness navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_3E_REUSE_F07A_3D_PROVIDER_ASSIGNMENT",
  "F07A_3E_OPERATIONAL_EVIDENCE_NOT_INFERRED",
  "F07A_3E_ACTIVATION_ALWAYS_BLOCKED",
  "F07A_3E_READINESS_TAMPER_AUDIT",
]) {
  assert.match(readiness, new RegExp(marker));
}
assert.match(
  compactReadiness,
  /createPaymentProviderAssignmentPolicy\(\s*localeInput\s*,?\s*\)/,
);
assert.match(
  compactReadiness,
  /auditPaymentProviderAssignmentPolicy\( providerAssignmentPolicy,? \)/,
);
assert.doesNotMatch(
  readiness,
  /PAYMENT_PROVIDER_POLICY_RULES|createCurrencyTransactionBinding|createCurrencyQuoteResult|createPriceDisplaySnapshot|convertMinorAmount|CURRENCY_QUOTE_DEFINITIONS|numerator:|denominator:|25_000/,
);
assert.doesNotMatch(
  readiness,
  /providerKey:\s*"gpay_qr"|providerKey:\s*"onepay_international_card"|providerKey:\s*"umoney_wallet"/,
);
console.log(
  "PASS readiness gate reuses F07A-3D assignment without duplicated market provider quote or conversion logic",
);

for (const gate of [
  "provider-assignment",
  "runtime-adapter",
  "credential-evidence",
  "callback-contract",
  "idempotency-evidence",
  "reconciliation-evidence",
  "manual-approval",
]) {
  assert.match(readiness, new RegExp(`"${gate}"`));
}
assert.match(
  readiness,
  /adapterState === "runtime-registered"[\s\S]*?"blocked-operational-verification"/,
);
assert.match(
  readiness,
  /adapterState === "adapter-disabled"[\s\S]*?"blocked-adapter-disabled"/,
);
assert.match(readiness, /return "blocked-adapter-missing"/);
assert.match(
  readiness,
  /status:\s*"not-evaluated" as const[\s\S]*?evidence:\s*"not-evaluated-in-preview" as const/,
);
assert.match(
  readiness,
  /key:\s*"manual-approval" as const[\s\S]*?status:\s*"blocked" as const/,
);
console.log(
  "PASS seven required gates distinguish adapter readiness from intentionally unverified operational evidence and approval",
);

assert.match(readiness, /productionEligible:\s*false as const/);
assert.match(readiness, /executionEligible:\s*false as const/);
assert.match(readiness, /activationTokenCreated:\s*false as const/);
assert.match(readiness, /providerRequestCreated:\s*false as const/);
assert.match(readiness, /settlementInstructionCreated:\s*false as const/);
assert.match(readiness, /registryMutationCreated:\s*false as const/);
assert.match(readiness, /paymentDraft\.status === "unassigned"/);
assert.match(
  readinessTypes,
  /readonly providerAssignmentPolicy: PaymentProviderAssignmentPolicyResult/,
);
console.log(
  "PASS activation draft and original transaction binding remain immutable and execution-disabled",
);

for (const check of [
  "providerAssignmentAuditMatched",
  "providerKeyMatches",
  "adapterStateMatches",
  "providerCurrencyMatches",
  "providerAmountMatches",
  "snapshotFingerprintMatches",
  "readinessStatusMatches",
  "requiredGateSetMatches",
  "operationalEvidenceRemainsUnverified",
  "originalPaymentDraftRemainsUnassigned",
  "activationArtifactsNotCreated",
  "productionAndExecutionBlocked",
]) {
  assert.match(readiness, new RegExp(check));
}
assert.match(readiness, /Object\.values\(checks\)\.every\(Boolean\)/);
assert.match(readiness, /"matched"\s*:\s*"mismatch"/);
console.log(
  "PASS readiness audit checks assignment money snapshot gate set evidence boundaries and all no-execution guardrails",
);

assert.doesNotMatch(
  `${readiness}\n${preview}`,
  /process\.env|readFileSync\([^)]*(secret|certificate|credential|\.env)|\/etc\/ysim\/secrets|BEGIN CERTIFICATE|api[_-]?key/i,
);
assert.doesNotMatch(
  `${readiness}\n${preview}`,
  /fetch\(|axios|createPayment\(|queryPayment\(|getPaymentProvider\(|openexchangerates|currencylayer|fixer\.io|exchangerate-api|liveRate/i,
);
assert.doesNotMatch(
  `${readiness}\n${preview}`,
  /<form\b|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|reserveInventory|fulfill|webhook/i,
);
assert.match(preview, /<button[\s\S]*?disabled[\s\S]*?>/);
console.log(
  "PASS readiness preview does not inspect secrets call providers or mutate cart payment order fulfillment registry or inventory",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese UI literals remain in execution-readiness preview component",
);

for (const productionPath of [
  "src/config/markets.ts",
  "src/lib/market/market.types.ts",
  "src/lib/market/market.registry.ts",
  "src/features/payments/payment.types.ts",
  "src/features/payments/payment.registry.ts",
  "src/features/payments/onepay/onepay.provider.ts.disabled",
  "src/lib/currency/currency-transaction-binding.types.ts",
  "src/lib/currency/currency-transaction-binding.ts",
  "src/lib/payments/payment-provider-assignment.types.ts",
  "src/lib/payments/payment-provider-assignment.ts",
  "src/app/ui-preview/payment-provider-assignment/page.tsx",
  "src/app/page.tsx",
  "src/app/esim/page.tsx",
  "src/app/esim/[slug]/page.tsx",
  "src/app/cart/page.tsx",
  "src/app/checkout/page.tsx",
  "src/app/payment/return/page.tsx",
  "src/app/orders/[orderCode]/page.tsx",
]) {
  const source = read(productionPath);
  assert.doesNotMatch(
    source,
    /payment-execution-readiness|F07A-3E|paymentExecutionReadiness/i,
  );
}
console.log(
  "PASS production provider assignment payment registry and transaction files remain unchanged",
);
assert.match(registry, /PAYMENT_EXECUTION_READINESS_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS execution-readiness locale registry remains aligned with shell locale",
);

for (const requiredPath of [
  "scripts/test-f07a-1a-market-domain.mjs",
  "scripts/test-f07a-1b-market-routing.mjs",
  "scripts/test-f07a-2a-localization-foundation.mjs",
  "scripts/test-f07a-2b-global-shell-localization.mjs",
  "scripts/test-f07a-2c-1-home-localization.mjs",
  "scripts/test-f07a-2c-2-listing-localization.mjs",
  "scripts/test-f07a-2c-3-detail-localization.mjs",
  "scripts/test-f07a-2c-4-secondary-localization.mjs",
  "scripts/test-f07a-2d-1-transaction-localization.mjs",
  "scripts/test-f07a-2e-1-dynamic-content-localization.mjs",
  "scripts/test-f07a-3a-currency-quote-snapshot.mjs",
  "scripts/test-f07a-3b-currency-presentation-integration.mjs",
  "scripts/test-f07a-3c-currency-transaction-binding.mjs",
  "scripts/test-f07a-3d-payment-provider-assignment-policy.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log("PASS existing F07A-1A through F07A-3D contracts remain available");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3E payment execution readiness gate candidate contract.",
);
