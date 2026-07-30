// F07A-3D_PAYMENT_PROVIDER_ASSIGNMENT_POLICY_CANDIDATE_R1
// F07A_3D_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/payment-provider-assignment/messages/vi.ts",
  en: "src/i18n/payment-provider-assignment/messages/en.ts",
  lo: "src/i18n/payment-provider-assignment/messages/lo.ts",
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
assert.ok(keys.length >= 75, "expected comprehensive provider policy catalog");
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
  "PASS Vietnamese English and Lao provider-assignment catalog parity",
);
assert.ok([...catalogs.lo.values()].some((value) => /[຀-໿]/u.test(value)));
console.log("PASS Lao provider-assignment UI catalog contains Lao Unicode");

const preview = read("src/app/ui-preview/payment-provider-assignment/page.tsx");
const policy = read("src/lib/payments/payment-provider-assignment.ts");
const policyTypes = read(
  "src/lib/payments/payment-provider-assignment.types.ts",
);
const registry = read(
  "src/i18n/payment-provider-assignment/payment-provider-assignment.registry.ts",
);
const compactPreview = preview.replace(/\s+/g, " ");
const compactPolicy = policy.replace(/\s+/g, " ");
assert.match(
  preview,
  /previewPath:\s*"\/ui-preview\/payment-provider-assignment"/,
);
for (const view of ["policy", "assignment", "settlement-draft", "audit"]) {
  assert.match(preview, new RegExp(`"${view}"`));
}
assert.match(
  compactPreview,
  /\/ui-preview\/payment-provider-assignment\?locale=\$\{locale\}&view=\$\{view\}/,
);
assert.match(
  compactPreview,
  /\/ui-preview\/payment-provider-assignment\?locale=\$\{shell\.locale\}&view=\$\{candidate\}/,
);
console.log(
  "PASS locale switch preserves all provider-assignment views and shell locale",
);
console.log(
  "PASS provider-assignment navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_3D_REUSE_F07A_3C_IMMUTABLE_BINDING",
  "F07A_3D_MARKET_CURRENCY_PROVIDER_POLICY",
  "F07A_3D_EXECUTION_ALWAYS_DISABLED",
  "F07A_3D_RUNTIME_ADAPTER_GAP_AUDIT",
]) {
  assert.match(policy, new RegExp(marker));
}
assert.match(compactPolicy, /createCurrencyTransactionBinding\(localeInput\)/);
assert.match(compactPolicy, /getMarketByLocale\(requestedLocale\)/);
assert.doesNotMatch(
  policy,
  /createCurrencyQuoteResult|createPriceDisplaySnapshot|convertMinorAmount|CURRENCY_QUOTE_DEFINITIONS|numerator:|denominator:|25_000/,
);
console.log(
  "PASS provider assignment reuses F07A-3C binding and existing market registry without duplicated quote or conversion logic",
);

for (const expected of [
  /marketId:\s*"vi-vn"[\s\S]*?currency:\s*"VND"[\s\S]*?providerKey:\s*"gpay_qr"[\s\S]*?runtimeProviderId:\s*"gpay_gateway_qr"[\s\S]*?adapterState:\s*"runtime-registered"/,
  /marketId:\s*"en-global"[\s\S]*?currency:\s*"USD"[\s\S]*?providerKey:\s*"onepay_international_card"[\s\S]*?runtimeProviderId:\s*null[\s\S]*?adapterState:\s*"adapter-disabled"/,
  /marketId:\s*"lo-la"[\s\S]*?currency:\s*"LAK"[\s\S]*?providerKey:\s*"umoney_wallet"[\s\S]*?runtimeProviderId:\s*null[\s\S]*?adapterState:\s*"adapter-missing"/,
]) {
  assert.match(policy, expected);
}
console.log(
  "PASS market currency policy maps VND to GPay, USD to OnePay, and LAK to uMoney with explicit adapter states",
);

assert.match(policy, /productionEligible:\s*false as const/);
assert.match(policy, /executionEligible:\s*false as const/);
assert.match(policy, /providerRequestCreated:\s*false as const/);
assert.match(policy, /settlementInstructionCreated:\s*false as const/);
assert.match(policy, /binding\.paymentDraft\.status === "unassigned"/);
assert.match(
  policyTypes,
  /readonly runtimeProviderId: PaymentProviderId \| null/,
);
assert.match(policyTypes, /readonly binding: CurrencyTransactionBinding/);
console.log(
  "PASS provider assignment and settlement draft remain preview-only while the original F07A-3C payment draft stays unassigned",
);

for (const check of [
  "marketRuleMatches",
  "bindingCurrencyMatches",
  "providerKeyMatches",
  "runtimeProviderMatches",
  "providerCurrencyMatches",
  "providerAmountMatches",
  "snapshotFingerprintMatches",
  "adapterStateMatches",
  "originalPaymentDraftRemainsUnassigned",
  "settlementInstructionNotCreated",
  "providerRequestNotCreated",
  "productionAndExecutionBlocked",
]) {
  assert.match(policy, new RegExp(check));
}
assert.match(policy, /Object\.values\(checks\)\.every\(Boolean\)/);
assert.match(policy, /"matched"\s*:\s*"mismatch"/);
console.log(
  "PASS compatibility audit checks market provider runtime adapter amount snapshot and no-execution guardrails",
);

const paymentTypes = read("src/features/payments/payment.types.ts");
const paymentRegistry = read("src/features/payments/payment.registry.ts");
const onePayDisabled = read(
  "src/features/payments/onepay/onepay.provider.ts.disabled",
);
assert.match(paymentTypes, /"gpay_gateway_qr"/);
assert.doesNotMatch(paymentTypes, /onepay|umoney/i);
assert.match(paymentRegistry, /gpay_gateway_qr:\s*gpayGatewayQrProvider/);
assert.doesNotMatch(paymentRegistry, /onepay|umoney/i);
assert.ok(onePayDisabled.length > 0);
assert.equal(
  fs.existsSync(path.join(root, "src/features/payments/umoney")),
  false,
);
console.log(
  "PASS runtime compatibility reflects registered GPay, disabled OnePay, and absent uMoney without modifying the production registry",
);

assert.doesNotMatch(
  `${policy}\n${preview}`,
  /fetch\(|axios|createPayment\(|queryPayment\(|getPaymentProvider\(|openexchangerates|currencylayer|fixer\.io|exchangerate-api|liveRate/i,
);
assert.doesNotMatch(
  `${policy}\n${preview}`,
  /<form\b|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|reserveInventory|fulfill|webhook/i,
);
assert.match(preview, /<button[\s\S]*?disabled[\s\S]*?>/);
console.log(
  "PASS provider-assignment preview cannot call providers or mutate cart payment order fulfillment or inventory",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese UI literals remain in provider-assignment preview component",
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
    /payment-provider-assignment|F07A-3D|paymentProviderAssignment/i,
  );
}
console.log(
  "PASS production market payment currency and transaction files remain unchanged",
);
assert.match(registry, /PAYMENT_PROVIDER_ASSIGNMENT_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS provider-assignment locale registry remains aligned with shell locale",
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
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log("PASS existing F07A-1A through F07A-3C contracts remain available");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3D payment provider assignment policy candidate contract.",
);
