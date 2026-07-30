// F07A-3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_CANDIDATE_R1
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/payment-sandbox-approval-request/messages/vi.ts",
  en: "src/i18n/payment-sandbox-approval-request/messages/en.ts",
  lo: "src/i18n/payment-sandbox-approval-request/messages/lo.ts",
};
function parseMessages(source) {
  const map = new Map();
  for (const match of source.matchAll(
    /^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)",?$/gm,
  )) {
    map.set(match[1], JSON.parse(`"${match[2]}"`));
  }
  return map;
}
function placeholders(value) {
  return [...value.matchAll(/\{([A-Za-z0-9_]+)\}/g)]
    .map((match) => match[1])
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
assert.ok(keys.length >= 85, "expected comprehensive approval-request catalog");
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
console.log("PASS Vietnamese English and Lao sandbox-approval catalog parity");
assert.ok([...catalogs.lo.values()].some((value) => /[຀-໿]/u.test(value)));
console.log("PASS Lao sandbox-approval UI catalog contains Lao Unicode");

const preview = read(
  "src/app/ui-preview/payment-sandbox-approval-request/page.tsx",
);
const approval = read("src/lib/payments/payment-sandbox-approval-request.ts");
const approvalTypes = read(
  "src/lib/payments/payment-sandbox-approval-request.types.ts",
);
const registry = read(
  "src/i18n/payment-sandbox-approval-request/payment-sandbox-approval-request.registry.ts",
);
const compactPreview = preview.replace(/\s+/g, " ");
const compactApproval = approval.replace(/\s+/g, " ");

assert.match(
  preview,
  /previewPath:\s*"\/ui-preview\/payment-sandbox-approval-request"/,
);
for (const view of ["request", "prerequisites", "approval-draft", "audit"])
  assert.match(preview, new RegExp(`"${view}"`));
assert.match(
  compactPreview,
  /\/ui-preview\/payment-sandbox-approval-request\?locale=\$\{locale\}&view=\$\{view\}/,
);
assert.match(
  compactPreview,
  /\/ui-preview\/payment-sandbox-approval-request\?locale=\$\{shell\.locale\}&view=\$\{candidate\}/,
);
console.log(
  "PASS locale switch preserves all sandbox-approval views and shell locale",
);
console.log(
  "PASS sandbox-approval navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_3H_REUSE_F07A_3G_VERIFICATION_REVIEW",
  "F07A_3H_UNSIGNED_APPROVAL_REQUEST_PACKET_ONLY",
  "F07A_3H_APPROVAL_SUBMISSION_AND_DECISION_ALWAYS_ABSENT",
  "F07A_3H_APPROVAL_REQUEST_TAMPER_AUDIT",
])
  assert.match(approval, new RegExp(marker));
assert.match(
  compactApproval,
  /createPaymentEvidenceVerification\(\s*localeInput\s*,?\s*\)/,
);
assert.match(
  compactApproval,
  /auditPaymentEvidenceVerification\(verificationReview\)/,
);
assert.doesNotMatch(
  approval,
  /createPaymentOperationalEvidence|createPaymentExecutionReadiness|PAYMENT_PROVIDER_POLICY_RULES|createCurrencyTransactionBinding|createCurrencyQuoteResult|createPriceDisplaySnapshot|convertMinorAmount|CURRENCY_QUOTE_DEFINITIONS|numerator:|denominator:|25_000/,
);
console.log(
  "PASS sandbox approval reuses F07A-3G verification review without duplicated market provider quote conversion assignment readiness evidence-capture or review logic",
);

assert.match(approval, /"blocked-pending-verification-decision"/);
assert.match(approval, /"blocked-adapter-disabled"/);
assert.match(approval, /"blocked-adapter-missing"/);
assert.match(approval, /"independent-review-complete"/);
assert.match(approval, /"verification-decision-issued"/);
assert.match(approval, /"reviewer-attestation-recorded"/);
assert.match(approval, /"manual-approval-authorized"/);
assert.match(approval, /requestPacketPrepared:\s*true as const/);
assert.match(approval, /approvalRequestSubmitted:\s*false as const/);
console.log(
  "PASS GPay prepares an unsigned blocked request packet while OnePay and uMoney remain adapter-blocked",
);

for (const field of [
  "approvalRequestSubmitted",
  "approvalDecisionCreated",
  "reviewerAttestationCreated",
  "approverIdentityCreated",
  "approvalTokenCreated",
  "activationTokenCreated",
  "providerRequestCreated",
  "settlementInstructionCreated",
  "registryMutationCreated",
])
  assert.match(approval, new RegExp(`${field}:\\s*false as const`));
assert.match(approval, /productionEligible:\s*false as const/);
assert.match(approval, /executionEligible:\s*false as const/);
assert.match(approval, /item\.reviewerId !== null/);
assert.match(
  approval,
  /verification\.decisionDraft\.verificationDecisionCreated !== false/,
);
assert.match(approval, /paymentDraft\.status !== "unassigned"/);
assert.match(
  approvalTypes,
  /readonly verificationReview: PaymentEvidenceVerificationResult/,
);
console.log(
  "PASS reviewer approver verification approval activation and execution artifacts remain absent while the original payment binding stays unassigned",
);

assert.match(approval, /Math\.imul\(hash, 0x01000193\)/);
assert.match(approval, /requestFingerprint/);
for (const check of [
  "verificationAuditMatched",
  "providerKeyMatches",
  "adapterStateMatches",
  "providerCurrencyMatches",
  "providerAmountMatches",
  "snapshotFingerprintMatches",
  "evidenceBundleFingerprintMatches",
  "verificationFingerprintMatches",
  "requestStatusMatches",
  "requestFingerprintMatches",
  "prerequisiteKeySetMatches",
  "prerequisitesRemainUnsatisfied",
  "reviewerIdentityAbsent",
  "verificationDecisionAbsent",
  "approvalRequestNotSubmitted",
  "approvalDecisionAbsent",
  "approverIdentityAbsent",
  "approvalAndActivationArtifactsAbsent",
  "upstreamVerificationRemainsBlocked",
  "originalPaymentBindingRemainsUnassigned",
  "productionAndExecutionBlocked",
])
  assert.match(approval, new RegExp(check));
assert.match(approval, /Object\.values\(checks\)\.every\(Boolean\)/);
assert.match(approval, /"matched"\s*:\s*"mismatch"/);
console.log(
  "PASS sandbox-approval audit checks immutable upstream bindings prerequisites request identity and all no-execution guardrails",
);

assert.doesNotMatch(
  `${approval}
${preview}`,
  /process\.env|readFileSync\([^)]*(secret|certificate|credential|\.env)|\/etc\/ysim\/secrets|-----BEGIN CERTIFICATE-----|-----BEGIN PRIVATE KEY-----/i,
);
assert.doesNotMatch(
  `${approval}
${preview}`,
  /fetch\(|axios|createPayment\(|queryPayment\(|getPaymentProvider\(|openexchangerates|currencylayer|fixer\.io|exchangerate-api|liveRate/i,
);
assert.doesNotMatch(
  `${approval}
${preview}`,
  /<form|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|reserveInventory|fulfill|webhook/i,
);
assert.match(preview, /<button[\s\S]*?disabled[\s\S]*?>/);
console.log(
  "PASS sandbox-approval preview does not inspect secrets call providers submit approvals or mutate cart payment order fulfillment registry or inventory",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese UI literals remain in sandbox-approval preview component",
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
  "src/lib/payments/payment-evidence-verification.types.ts",
  "src/lib/payments/payment-evidence-verification.ts",
  "src/app/ui-preview/payment-evidence-verification/page.tsx",
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
    /payment-sandbox-approval-request|F07A-3H|paymentSandboxApprovalRequest/i,
  );
}
console.log(
  "PASS production verification evidence readiness provider assignment payment registry and transaction files remain unchanged",
);
assert.match(registry, /PAYMENT_SANDBOX_APPROVAL_REQUEST_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS sandbox-approval locale registry remains aligned with shell locale",
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
  "scripts/test-f07a-3g-payment-evidence-verification.mjs",
])
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
console.log("PASS existing F07A-1A through F07A-3G contracts remain available");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3H payment sandbox approval request candidate contract.",
);
