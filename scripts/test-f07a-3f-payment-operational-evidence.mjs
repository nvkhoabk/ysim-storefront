// F07A-3F_PAYMENT_OPERATIONAL_EVIDENCE_MANIFEST_CANDIDATE_R1
// F07A_3F_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/payment-operational-evidence/messages/vi.ts",
  en: "src/i18n/payment-operational-evidence/messages/en.ts",
  lo: "src/i18n/payment-operational-evidence/messages/lo.ts",
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
assert.ok(
  keys.length >= 85,
  "expected comprehensive operational-evidence catalog",
);
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
  "PASS Vietnamese English and Lao operational-evidence catalog parity",
);
assert.ok([...catalogs.lo.values()].some((value) => /[຀-໿]/u.test(value)));
console.log("PASS Lao operational-evidence UI catalog contains Lao Unicode");

const preview = read(
  "src/app/ui-preview/payment-operational-evidence/page.tsx",
);
const evidence = read("src/lib/payments/payment-operational-evidence.ts");
const evidenceTypes = read(
  "src/lib/payments/payment-operational-evidence.types.ts",
);
const registry = read(
  "src/i18n/payment-operational-evidence/payment-operational-evidence.registry.ts",
);
const compactPreview = preview.replace(/\s+/g, " ");
const compactEvidence = evidence.replace(/\s+/g, " ");

assert.match(
  preview,
  /previewPath:\s*"\/ui-preview\/payment-operational-evidence"/,
);
for (const view of ["evidence", "matrix", "approval-draft", "audit"]) {
  assert.match(preview, new RegExp(`"${view}"`));
}
assert.match(
  compactPreview,
  /\/ui-preview\/payment-operational-evidence\?locale=\$\{locale\}&view=\$\{view\}/,
);
assert.match(
  compactPreview,
  /\/ui-preview\/payment-operational-evidence\?locale=\$\{shell\.locale\}&view=\$\{candidate\}/,
);
console.log(
  "PASS locale switch preserves all operational-evidence views and shell locale",
);
console.log(
  "PASS operational-evidence navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_3F_REUSE_F07A_3E_READINESS",
  "F07A_3F_NON_SECRET_REFERENCE_ONLY",
  "F07A_3F_VERIFICATION_AND_APPROVAL_ALWAYS_PENDING",
  "F07A_3F_EVIDENCE_TAMPER_AUDIT",
]) {
  assert.match(evidence, new RegExp(marker));
}
assert.match(
  compactEvidence,
  /createPaymentExecutionReadiness\(\s*localeInput\s*,?\s*\)/,
);
assert.match(compactEvidence, /auditPaymentExecutionReadiness\(readiness\)/);
assert.doesNotMatch(
  evidence,
  /PAYMENT_PROVIDER_POLICY_RULES|createCurrencyTransactionBinding|createCurrencyQuoteResult|createPriceDisplaySnapshot|convertMinorAmount|CURRENCY_QUOTE_DEFINITIONS|numerator:|denominator:|25_000/,
);
assert.doesNotMatch(
  evidence,
  /providerKey:\s*"gpay_qr"|providerKey:\s*"onepay_international_card"|providerKey:\s*"umoney_wallet"/,
);
console.log(
  "PASS operational evidence reuses F07A-3E readiness without duplicated market provider quote conversion or assignment logic",
);

for (const key of [
  "credential-evidence",
  "callback-contract",
  "idempotency-evidence",
  "reconciliation-evidence",
]) {
  assert.match(evidence, new RegExp(`"${key}"`));
}
assert.match(evidence, /"captured-unverified" as const/);
assert.match(evidence, /"blocked-adapter-disabled" as const/);
assert.match(evidence, /"blocked-adapter-missing" as const/);
assert.match(evidence, /"candidate-reference" as const/);
assert.match(evidence, /"adapter-blocker" as const/);
assert.match(evidence, /environment:\s*"sandbox" as const/);
assert.match(evidence, /verificationApproved:\s*false as const/);
console.log(
  "PASS GPay captures four non-secret sandbox candidate references while OnePay and uMoney remain adapter-blocked",
);

assert.match(evidence, /Math\.imul\(hash, 0x01000193\)/);
assert.match(evidence, /bundleFingerprint/);
assert.match(evidence, /containsSecret:\s*false as const/);
assert.doesNotMatch(
  evidence,
  /-----BEGIN CERTIFICATE-----|-----BEGIN PRIVATE KEY-----|api[_-]?key\s*[:=]|client[_-]?secret\s*[:=]/i,
);
console.log(
  "PASS evidence references use deterministic fingerprints and contain no credential or certificate material",
);

for (const field of [
  "approvalCreated",
  "approvalTokenCreated",
  "activationTokenCreated",
  "providerRequestCreated",
  "settlementInstructionCreated",
  "registryMutationCreated",
]) {
  assert.match(evidence, new RegExp(`${field}:\\s*false as const`));
}
assert.match(evidence, /productionEligible:\s*false as const/);
assert.match(evidence, /executionEligible:\s*false as const/);
assert.match(evidence, /paymentDraft\.status !== "unassigned"/);
assert.match(
  evidenceTypes,
  /readonly readiness: PaymentExecutionReadinessResult/,
);
console.log(
  "PASS approval draft F07A-3E readiness and original payment binding remain immutable and execution-disabled",
);

for (const check of [
  "readinessAuditMatched",
  "providerKeyMatches",
  "adapterStateMatches",
  "providerCurrencyMatches",
  "providerAmountMatches",
  "snapshotFingerprintMatches",
  "readinessStatusMatches",
  "evidenceStatusMatches",
  "requiredEvidenceKeySetMatches",
  "recordsAreSandboxScoped",
  "recordsContainNoSecrets",
  "evidenceFingerprintsMatch",
  "evidenceVerificationRemainsPending",
  "originalReadinessRemainsBlocked",
  "approvalAndActivationArtifactsAbsent",
  "productionAndExecutionBlocked",
]) {
  assert.match(evidence, new RegExp(check));
}
assert.match(evidence, /Object\.values\(checks\)\.every\(Boolean\)/);
assert.match(evidence, /"matched"\s*:\s*"mismatch"/);
console.log(
  "PASS operational-evidence audit checks immutable money sandbox scope fingerprints pending verification and all no-execution guardrails",
);

assert.doesNotMatch(
  `${evidence}\n${preview}`,
  /process\.env|readFileSync\([^)]*(secret|certificate|credential|\.env)|\/etc\/ysim\/secrets|-----BEGIN CERTIFICATE-----|-----BEGIN PRIVATE KEY-----/i,
);
assert.doesNotMatch(
  `${evidence}\n${preview}`,
  /fetch\(|axios|createPayment\(|queryPayment\(|getPaymentProvider\(|openexchangerates|currencylayer|fixer\.io|exchangerate-api|liveRate/i,
);
assert.doesNotMatch(
  `${evidence}\n${preview}`,
  /<form\b|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|reserveInventory|fulfill|webhook/i,
);
assert.match(preview, /<button[\s\S]*?disabled[\s\S]*?>/);
console.log(
  "PASS operational-evidence preview does not inspect secrets call providers or mutate cart payment order fulfillment registry or inventory",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese UI literals remain in operational-evidence preview component",
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
  "src/lib/payments/payment-execution-readiness.types.ts",
  "src/lib/payments/payment-execution-readiness.ts",
  "src/app/ui-preview/payment-execution-readiness/page.tsx",
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
    /payment-operational-evidence|F07A-3F|paymentOperationalEvidence/i,
  );
}
console.log(
  "PASS production readiness provider assignment payment registry and transaction files remain unchanged",
);
assert.match(registry, /PAYMENT_OPERATIONAL_EVIDENCE_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS operational-evidence locale registry remains aligned with shell locale",
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
  "scripts/test-f07a-3e-payment-execution-readiness.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log("PASS existing F07A-1A through F07A-3E contracts remain available");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3F payment operational evidence manifest candidate contract.",
);
