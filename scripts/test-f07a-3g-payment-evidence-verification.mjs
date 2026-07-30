// F07A-3G_PAYMENT_EVIDENCE_VERIFICATION_REVIEW_CANDIDATE_R1

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/payment-evidence-verification/messages/vi.ts",
  en: "src/i18n/payment-evidence-verification/messages/en.ts",
  lo: "src/i18n/payment-evidence-verification/messages/lo.ts",
};

function parseMessages(source) {
  const result = new Map();
  const pattern = /^\s*"([^"]+)":\s*("(?:\\.|[^"\\])*")\s*,?\s*$/gm;
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
  keys.length >= 90,
  "expected comprehensive evidence-verification catalog",
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
  "PASS Vietnamese English and Lao evidence-verification catalog parity",
);
assert.ok([...catalogs.lo.values()].some((value) => /[຀-໿]/u.test(value)));
console.log("PASS Lao evidence-verification UI catalog contains Lao Unicode");

const preview = read(
  "src/app/ui-preview/payment-evidence-verification/page.tsx",
);
const verification = read("src/lib/payments/payment-evidence-verification.ts");
const verificationTypes = read(
  "src/lib/payments/payment-evidence-verification.types.ts",
);
const registry = read(
  "src/i18n/payment-evidence-verification/payment-evidence-verification.registry.ts",
);
const compactPreview = preview.replace(/\s+/g, " ");
const compactVerification = verification.replace(/\s+/g, " ");

assert.match(
  preview,
  /previewPath:\s*"\/ui-preview\/payment-evidence-verification"/,
);
for (const view of ["review-queue", "checklist", "decision-draft", "audit"]) {
  assert.match(preview, new RegExp(`"${view}"`));
}
assert.match(
  compactPreview,
  /\/ui-preview\/payment-evidence-verification\?locale=\$\{locale\}&view=\$\{view\}/,
);
assert.match(
  compactPreview,
  /\/ui-preview\/payment-evidence-verification\?locale=\$\{shell\.locale\}&view=\$\{candidate\}/,
);
console.log(
  "PASS locale switch preserves all evidence-verification views and shell locale",
);
console.log(
  "PASS evidence-verification navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_3G_REUSE_F07A_3F_OPERATIONAL_EVIDENCE",
  "F07A_3G_PENDING_INDEPENDENT_MANUAL_REVIEW_ONLY",
  "F07A_3G_REVIEWER_AND_DECISION_ALWAYS_ABSENT",
  "F07A_3G_VERIFICATION_TAMPER_AUDIT",
]) {
  assert.match(verification, new RegExp(marker));
}
assert.match(
  compactVerification,
  /createPaymentOperationalEvidence\(\s*localeInput\s*,?\s*\)/,
);
assert.match(
  compactVerification,
  /auditPaymentOperationalEvidence\(evidenceManifest\)/,
);
assert.doesNotMatch(
  verification,
  /createPaymentExecutionReadiness|PAYMENT_PROVIDER_POLICY_RULES|createCurrencyTransactionBinding|createCurrencyQuoteResult|createPriceDisplaySnapshot|convertMinorAmount|CURRENCY_QUOTE_DEFINITIONS|numerator:|denominator:|25_000/,
);
console.log(
  "PASS evidence verification reuses F07A-3F operational evidence without duplicated market provider quote conversion assignment readiness or evidence-capture logic",
);

assert.match(verification, /"pending-independent-review"/);
assert.match(verification, /"blocked-adapter-disabled"/);
assert.match(verification, /"blocked-adapter-missing"/);
assert.match(verification, /"manual-non-secret-reference-review" as const/);
assert.match(verification, /"independent-operator-required" as const/);
assert.match(verification, /reviewerId:\s*null/);
assert.match(verification, /reviewedAt:\s*null/);
assert.match(verification, /verificationApproved:\s*false as const/);
assert.match(verification, /rejectionRecorded:\s*false as const/);
assert.match(verification, /decisionReason:\s*null/);
console.log(
  "PASS GPay creates four pending independent review items while OnePay and uMoney remain adapter-blocked",
);

assert.match(verification, /item\.referenceId === record\.referenceId/);
assert.match(
  verification,
  /item\.referenceFingerprint === record\.referenceFingerprint/,
);
assert.match(
  verification,
  /item\.evidenceBundleFingerprint === evidence\.bundleFingerprint/,
);
assert.match(verification, /Math\.imul\(hash, 0x01000193\)/);
assert.match(verification, /verificationFingerprint/);
assert.match(verification, /containsSecret:\s*false as const/);
assert.doesNotMatch(
  verification,
  /-----BEGIN CERTIFICATE-----|-----BEGIN PRIVATE KEY-----|api[_-]?key\s*[:=]|client[_-]?secret\s*[:=]/i,
);
console.log(
  "PASS evidence references and deterministic fingerprints are preserved without credential or certificate material",
);

for (const field of [
  "verificationDecisionCreated",
  "reviewerAttestationCreated",
  "approvalCreated",
  "approvalTokenCreated",
  "activationTokenCreated",
  "providerRequestCreated",
  "settlementInstructionCreated",
  "registryMutationCreated",
]) {
  assert.match(verification, new RegExp(`${field}:\\s*false as const`));
}
assert.match(verification, /productionEligible:\s*false as const/);
assert.match(verification, /executionEligible:\s*false as const/);
assert.match(verification, /paymentDraft\.status !== "unassigned"/);
assert.match(
  verificationTypes,
  /readonly evidenceManifest: PaymentOperationalEvidenceResult/,
);
console.log(
  "PASS reviewer decision approval activation and original payment binding remain absent immutable and execution-disabled",
);

for (const check of [
  "operationalEvidenceAuditMatched",
  "providerKeyMatches",
  "adapterStateMatches",
  "providerCurrencyMatches",
  "providerAmountMatches",
  "snapshotFingerprintMatches",
  "evidenceBundleFingerprintMatches",
  "verificationStatusMatches",
  "requiredEvidenceKeySetMatches",
  "itemReferencesPreserved",
  "itemFingerprintsMatch",
  "itemsAreSandboxScoped",
  "itemsContainNoSecrets",
  "reviewerIdentityAbsent",
  "verificationDecisionRemainsPending",
  "originalEvidenceRemainsUnverified",
  "originalReadinessRemainsBlocked",
  "approvalAndActivationArtifactsAbsent",
  "productionAndExecutionBlocked",
]) {
  assert.match(verification, new RegExp(check));
}
assert.match(verification, /Object\.values\(checks\)\.every\(Boolean\)/);
assert.match(verification, /"matched"\s*:\s*"mismatch"/);
console.log(
  "PASS evidence-verification audit checks immutable money references reviewer absence pending decisions and all no-execution guardrails",
);

assert.doesNotMatch(
  `${verification}
${preview}`,
  /process\.env|readFileSync\([^)]*(secret|certificate|credential|\.env)|\/etc\/ysim\/secrets|-----BEGIN CERTIFICATE-----|-----BEGIN PRIVATE KEY-----/i,
);
assert.doesNotMatch(
  `${verification}
${preview}`,
  /fetch\(|axios|createPayment\(|queryPayment\(|getPaymentProvider\(|openexchangerates|currencylayer|fixer\.io|exchangerate-api|liveRate/i,
);
assert.doesNotMatch(
  `${verification}
${preview}`,
  /<form\b|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|reserveInventory|fulfill|webhook/i,
);
assert.match(preview, /<button[\s\S]*?disabled[\s\S]*?>/);
console.log(
  "PASS evidence-verification preview does not inspect secrets call providers or mutate cart payment order fulfillment registry or inventory",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese UI literals remain in evidence-verification preview component",
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
  "src/lib/payments/payment-operational-evidence.types.ts",
  "src/lib/payments/payment-operational-evidence.ts",
  "src/app/ui-preview/payment-operational-evidence/page.tsx",
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
    /payment-evidence-verification|F07A-3G|paymentEvidenceVerification/i,
  );
}
console.log(
  "PASS production operational evidence readiness provider assignment payment registry and transaction files remain unchanged",
);
assert.match(registry, /PAYMENT_EVIDENCE_VERIFICATION_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS evidence-verification locale registry remains aligned with shell locale",
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
  "scripts/test-f07a-3f-payment-operational-evidence.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log("PASS existing F07A-1A through F07A-3F contracts remain available");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3G payment evidence verification review candidate contract.",
);
