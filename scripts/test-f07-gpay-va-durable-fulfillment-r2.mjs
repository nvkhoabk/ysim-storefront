#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { isGPaySignedVAWebhookDurabilityCandidate } from "../src/lib/fulfillment/gigago/gpay-va-durability.ts";

const callback = {
  embedData: JSON.stringify({
    source: "ysim-storefront",
    orderId: 999999,
    orderNumber: "999999",
    orderKey: "wc_order_protected_test",
    paymentProvider: "gpay_virtual_account",
    merchantOrderId: "YSIM999999",
    amount: 100000,
    currency: "VND",
  }),
  gpayBillId: "PROTECTED_VA_ACCOUNT",
  gpayTransactionId: "PROTECTED_VA_TRANSACTION",
  merchantOrderId: "YSIM999999",
  status: "ORDER_SUCCESS",
  userPaymentMethod: "VA",
  signature: "verified-by-fixture",
};

const verification = {
  verified: true,
  verificationStrategy: "gpay-va-webhook-signature",
  normalizedStatus: "SUCCESS",
  callback,
  parsedEmbedData: JSON.parse(callback.embedData),
  canonicalSha256: "a".repeat(64),
  contractVersion: "gpay-va-change-balance-v1",
};

const signedVAReconciliation = {
  mode: "signed-webhook",
  attempted: false,
  confirmed: true,
  reason: "VA_SIGNED_CHANGE_BALANCE_CONFIRMED",
  callbackStatus: "SUCCESS",
  merchantOrderIdMatches: true,
  gpayBillIdMatches: true,
  statusCompatible: true,
  providerQueryKind: "virtual-account-webhook",
  accountNumberMatches: true,
  amountMatches: true,
};

let assertions = 0;

function expect(value, expected, name) {
  assert.equal(value, expected, name);
  assertions += 1;
  console.log(`${name}=PASS`);
}

expect(
  isGPaySignedVAWebhookDurabilityCandidate(
    verification,
    signedVAReconciliation,
  ),
  true,
  "SIGNED_VA_SUCCESS_IS_DURABILITY_CANDIDATE",
);

for (const [name, verificationOverride, reconciliationOverride] of [
  ["INVALID_SIGNATURE_REJECTED", { verified: false }, {}],
  ["NON_SUCCESS_CALLBACK_REJECTED", { normalizedStatus: "PENDING" }, {}],
  [
    "MISSING_TRANSACTION_ID_REJECTED",
    { callback: { ...callback, gpayTransactionId: "" } },
    {},
  ],
  ["UNCONFIRMED_WEBHOOK_REJECTED", {}, { confirmed: false }],
  ["WRONG_MODE_REJECTED", {}, { mode: "query", attempted: true }],
  [
    "WRONG_PROVIDER_KIND_REJECTED",
    {},
    { providerQueryKind: "virtual-account-detail" },
  ],
  ["MERCHANT_MISMATCH_REJECTED", {}, { merchantOrderIdMatches: false }],
  ["ACCOUNT_BINDING_MISMATCH_REJECTED", {}, { gpayBillIdMatches: false }],
  ["STATUS_MISMATCH_REJECTED", {}, { statusCompatible: false }],
  ["VA_ACCOUNT_MISMATCH_REJECTED", {}, { accountNumberMatches: false }],
  ["AMOUNT_MISMATCH_REJECTED", {}, { amountMatches: false }],
]) {
  const candidateVerification = {
    ...verification,
    ...verificationOverride,
    callback: {
      ...callback,
      ...(verificationOverride.callback ?? {}),
    },
  };
  const candidateReconciliation = {
    ...signedVAReconciliation,
    ...reconciliationOverride,
  };

  expect(
    isGPaySignedVAWebhookDurabilityCandidate(
      candidateVerification,
      candidateReconciliation,
    ),
    false,
    name,
  );
}

const delayedSource = await readFile(
  "src/lib/fulfillment/gigago/gpay-delayed-reconciliation.ts",
  "utf8",
);
const persistStart = delayedSource.indexOf(
  "export async function persistGPayImmediateSuccessDurability",
);
const persistEnd = delayedSource.indexOf("function syntheticQuery", persistStart);
const persistSource = delayedSource.slice(persistStart, persistEnd);

expect(persistStart >= 0 && persistEnd > persistStart, true, "PERSIST_SOURCE_FOUND");
expect(
  /!isGPayImmediateSuccessDurabilityCandidate[\s\S]*!isGPaySignedVAWebhookDurabilityCandidate/u.test(
    persistSource,
  ),
  true,
  "PERSIST_ACCEPTS_ONLY_QUERY_OR_SIGNED_VA_EVIDENCE",
);
const fastAckSource = await readFile(
  "src/lib/fulfillment/gigago/gpay-fast-ack.ts",
  "utf8",
);
expect(
  /isGPaySignedVAWebhookDurabilityCandidate/u.test(fastAckSource),
  true,
  "SIGNED_VA_NOW_USES_DURABLE_BEFORE_COMMERCE_FAST_ACK_BOUNDARY",
);
expect(
  /state = "pending-fulfillment"/u.test(persistSource),
  true,
  "PROCESSING_PROVIDER_RESULT_BECOMES_DURABLE_PENDING_FULFILLMENT",
);
expect(
  /await persistJob\(order, job\)/u.test(persistSource),
  true,
  "DURABLE_JOB_IS_PERSISTED_BEFORE_RETURN",
);

const webhookSource = await readFile(
  "src/app/api/payments/gpay/virtual-account/webhook/route.ts",
  "utf8",
);
const automationIndex = webhookSource.indexOf("await runGPayCommerceAutomation");
const candidateIndex = webhookSource.indexOf(
  "isGPaySignedVAWebhookDurabilityCandidate(verification, reconciliation)",
);
const persistIndex = webhookSource.indexOf(
  "await persistGPayImmediateSuccessDurability",
);
const scheduleIndex = webhookSource.indexOf(
  "await runGPayDelayedReconciliationSchedule(durabilityOrderId)",
);

expect(
  automationIndex >= 0 &&
    automationIndex < candidateIndex &&
    candidateIndex < persistIndex &&
    persistIndex < scheduleIndex,
  true,
  "VA_WEBHOOK_PERSISTS_JOB_BEFORE_ASYNC_SCHEDULE",
);
expect(
  /GPAY_DELAYED_RECONCILIATION_ENABLED|isGPayDelayedReconciliationEnabled/u.test(
    webhookSource,
  ),
  false,
  "SIGNED_VA_DURABILITY_IS_NOT_DISABLED_BY_OPTIONAL_QUERY_FLAG",
);

const pollStart = delayedSource.indexOf(
  "async function pollPendingFulfillment",
);
const pollEnd = delayedSource.indexOf(
  "async function applyConfirmedCommerce",
  pollStart,
);
const pollSource = delayedSource.slice(pollStart, pollEnd);

expect(
  /await getGigagoFulfillmentStatus/u.test(pollSource),
  true,
  "DURABLE_FULFILLMENT_USES_PROVIDER_STATUS_READ",
);
expect(
  /submitGigagoFulfillment|createPartnerOrder/u.test(pollSource),
  false,
  "DURABLE_FULFILLMENT_POLL_NEVER_CREATES_PROVIDER_ORDER",
);

console.log(`OFFLINE_REGRESSION_ASSERTIONS=${assertions}`);
console.log("F07_GPAY_VA_DURABLE_FULFILLMENT_R2_RESULT=PASS");
