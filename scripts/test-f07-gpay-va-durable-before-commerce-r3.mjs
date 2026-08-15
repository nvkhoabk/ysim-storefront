#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { reconcileVerifiedGPayVAWebhook } from "../src/features/payments/gpay-va/gpay-va.reconciliation.ts";
import {
  isGPayPaidOrderDurabilityPostcondition,
  isGPaySignedVAWebhookDurabilityCandidate,
} from "../src/lib/fulfillment/gigago/gpay-va-durability.ts";

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

let assertions = 0;

function expect(value, expected, name) {
  assert.equal(value, expected, name);
  assertions += 1;
  console.log(`${name}=PASS`);
}

const runtimeReconciliation = reconcileVerifiedGPayVAWebhook({
  verification,
  merchantOrderIdMatches: true,
  accountNumberMatches: true,
  amountMatches: true,
});

expect(
  runtimeReconciliation.mode,
  "signed-webhook",
  "PRODUCTION_RECONCILER_RETURNS_SIGNED_WEBHOOK_MODE",
);
expect(
  runtimeReconciliation.confirmed,
  true,
  "PRODUCTION_RECONCILER_CONFIRMS_BOUND_CALLBACK",
);
expect(
  isGPaySignedVAWebhookDurabilityCandidate(
    verification,
    runtimeReconciliation,
  ),
  true,
  "PRODUCTION_RECONCILIATION_OBJECT_IS_DURABILITY_CANDIDATE",
);

expect(
  isGPayPaidOrderDurabilityPostcondition({ status: "processing" }),
  true,
  "DURABILITY_GATE_ACCEPTS_WOO_PROCESSING_POSTCONDITION",
);
expect(
  isGPayPaidOrderDurabilityPostcondition({ status: "completed" }),
  true,
  "DURABILITY_GATE_ACCEPTS_WOO_COMPLETED_POSTCONDITION",
);
expect(
  isGPayPaidOrderDurabilityPostcondition({
    status: "pending",
    date_paid_gmt: "2026-08-15T17:31:00",
  }),
  true,
  "DURABILITY_GATE_ACCEPTS_EXPLICIT_PAID_TIMESTAMP",
);
expect(
  isGPayPaidOrderDurabilityPostcondition({ status: "pending" }),
  false,
  "DURABILITY_GATE_REJECTS_UNPAID_PENDING_ORDER",
);

for (const [name, input] of [
  ["PRODUCTION_RECONCILER_REJECTS_MERCHANT_MISMATCH", {
    merchantOrderIdMatches: false,
    accountNumberMatches: true,
    amountMatches: true,
  }],
  ["PRODUCTION_RECONCILER_REJECTS_ACCOUNT_MISMATCH", {
    merchantOrderIdMatches: true,
    accountNumberMatches: false,
    amountMatches: true,
  }],
  ["PRODUCTION_RECONCILER_REJECTS_AMOUNT_MISMATCH", {
    merchantOrderIdMatches: true,
    accountNumberMatches: true,
    amountMatches: false,
  }],
]) {
  const result = reconcileVerifiedGPayVAWebhook({ verification, ...input });
  expect(result.confirmed, false, name);
  expect(
    isGPaySignedVAWebhookDurabilityCandidate(verification, result),
    false,
    `${name}_NOT_DURABLE`,
  );
}

const commerceSource = await readFile(
  "src/lib/fulfillment/gigago/gpay-commerce-automation.ts",
  "utf8",
);
const prepaymentGateStart = commerceSource.indexOf(
  "export function assertGPayCommerceOrderEligible",
);
const prepaymentGateEnd = commerceSource.indexOf(
  "export function parseGPayCommerceEmbedData",
  prepaymentGateStart,
);
const prepaymentGateSource = commerceSource.slice(
  prepaymentGateStart,
  prepaymentGateEnd,
);
expect(
  /allowedOrderStatuses\(\)\.has\(status\)/u.test(prepaymentGateSource),
  true,
  "PREPAYMENT_GATE_RETAINS_CONFIGURED_STATUS_ALLOWLIST",
);

const paidIdentityStart = commerceSource.indexOf(
  "export function assertGPayCommercePaidOrderIdentity",
);
const paidIdentityEnd = commerceSource.indexOf(
  "function eligibleReconciliation",
  paidIdentityStart,
);
const paidIdentitySource = commerceSource.slice(
  paidIdentityStart,
  paidIdentityEnd,
);
expect(
  /assertGPayCommerceOrderBinding\(order, embed\)/u.test(
    paidIdentitySource,
  ),
  true,
  "PAID_DURABILITY_GATE_RETAINS_ORDER_BINDING",
);
expect(
  /if \(!isWooCommerceOrderPaid\(order\)\)/u.test(paidIdentitySource),
  true,
  "PAID_DURABILITY_GATE_REQUIRES_PAID_POSTCONDITION",
);
expect(
  /assertGPayCommerceOrderValueContract\(order/u.test(paidIdentitySource),
  true,
  "PAID_DURABILITY_GATE_RETAINS_AMOUNT_CURRENCY_AND_LINE_ITEMS",
);
expect(
  /allowedOrderStatuses/u.test(paidIdentitySource),
  false,
  "PAID_DURABILITY_GATE_DOES_NOT_REUSE_PREPAYMENT_STATUS_ALLOWLIST",
);

const fastAckSource = await readFile(
  "src/lib/fulfillment/gigago/gpay-fast-ack.ts",
  "utf8",
);
const candidateStart = fastAckSource.indexOf(
  "export function isGPayFastAckCandidate",
);
const candidateEnd = fastAckSource.indexOf(
  "export async function prepareGPayFastAck",
  candidateStart,
);
const candidateSource = fastAckSource.slice(candidateStart, candidateEnd);
const prepareStart = candidateEnd;
const prepareSource = fastAckSource.slice(prepareStart);

expect(
  candidateStart >= 0 && candidateEnd > candidateStart,
  true,
  "DURABLE_BEFORE_COMMERCE_CANDIDATE_SOURCE_FOUND",
);
expect(
  /signedVAWebhookCandidate\s*\|\|\s*optionalQueryFastAckCandidate/u.test(
    candidateSource,
  ),
  true,
  "SIGNED_VA_PATH_DOES_NOT_DEPEND_ON_OPTIONAL_QUERY_FAST_ACK_FLAG",
);
expect(
  /isGPayFastAckEnabled\(\)\s*&&\s*isGPayImmediateSuccessDurabilityCandidate/u.test(
    candidateSource,
  ),
  true,
  "QUERY_FAST_ACK_REMAINS_FLAG_GATED",
);

const recordIndex = prepareSource.indexOf('modeOverride: "record"');
const persistIndex = prepareSource.indexOf(
  "await persistGPayFastAckDurability",
);
expect(
  recordIndex >= 0 && persistIndex > recordIndex,
  true,
  "PAYMENT_RECORD_PRECEDES_DURABLE_JOB_WRITE",
);
expect(
  /submitGigagoFulfillment|createPartnerOrder/u.test(prepareSource),
  false,
  "DURABLE_PREPARATION_CANNOT_CREATE_PROVIDER_ORDER",
);

const delayedSource = await readFile(
  "src/lib/fulfillment/gigago/gpay-delayed-reconciliation.ts",
  "utf8",
);
const fastPersistStart = delayedSource.indexOf(
  "export async function persistGPayFastAckDurability",
);
const fastPersistEnd = delayedSource.indexOf(
  "export async function persistGPayImmediateSuccessDurability",
  fastPersistStart,
);
const fastPersistSource = delayedSource.slice(
  fastPersistStart,
  fastPersistEnd,
);

expect(
  /!isGPayImmediateSuccessDurabilityCandidate[\s\S]*!isGPaySignedVAWebhookDurabilityCandidate/u.test(
    fastPersistSource,
  ),
  true,
  "FAST_ACK_PERSISTENCE_ACCEPTS_QUERY_OR_SIGNED_VA_EVIDENCE",
);
const persistJobIndex = fastPersistSource.indexOf("await persistJob(order, job)");
const returnIndex = fastPersistSource.indexOf("return {", persistJobIndex);
expect(
  persistJobIndex >= 0 && returnIndex > persistJobIndex,
  true,
  "JOB_WRITE_COMPLETES_BEFORE_ACK_RESULT_RETURNS",
);
expect(
  /state\s*=\s*"provider-confirmed"|\?\s*"succeeded"\s*:\s*"provider-confirmed"/u.test(
    fastPersistSource,
  ),
  true,
  "FULFILL_MODE_STARTS_FROM_DURABLE_PROVIDER_CONFIRMED_STATE",
);
expect(
  /assertGPayCommercePaidOrderIdentity\(order, embed\)/u.test(
    fastPersistSource,
  ),
  true,
  "FAST_ACK_JOB_WRITE_USES_PAID_POSTCONDITION_NOT_PREPAYMENT_STATUS_GATE",
);

const immediatePersistStart = fastPersistEnd;
const immediatePersistEnd = delayedSource.indexOf(
  "function syntheticQuery",
  immediatePersistStart,
);
const immediatePersistSource = delayedSource.slice(
  immediatePersistStart,
  immediatePersistEnd,
);
expect(
  /assertGPayCommercePaidOrderIdentity\(order, embed\)/u.test(
    immediatePersistSource,
  ),
  true,
  "IMMEDIATE_SUCCESS_JOB_WRITE_USES_PAID_POSTCONDITION",
);

const expectedIdentityStart = delayedSource.indexOf(
  "function expectedOrderIdentityMatches",
);
const expectedIdentityEnd = delayedSource.indexOf(
  "export function isGPayDelayedReconciliationCandidate",
  expectedIdentityStart,
);
expect(
  /assertGPayCommercePaidOrderIdentity\(order, embed\)/u.test(
    delayedSource.slice(expectedIdentityStart, expectedIdentityEnd),
  ),
  true,
  "DELAYED_COMMERCE_RESUME_USES_PAID_POSTCONDITION",
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
  "PENDING_FULFILLMENT_POLLS_EXISTING_PROVIDER_ORDER",
);
expect(
  /submitGigagoFulfillment|createPartnerOrder/u.test(pollSource),
  false,
  "PENDING_FULFILLMENT_NEVER_CREATES_PROVIDER_ORDER",
);

const webhookSource = await readFile(
  "src/app/api/payments/gpay/virtual-account/webhook/route.ts",
  "utf8",
);
const fastCandidateIndex = webhookSource.indexOf("isGPayFastAckCandidate(");
const synchronousCommerceIndex = webhookSource.indexOf(
  "const automation = await runGPayCommerceAutomation",
);
expect(
  fastCandidateIndex >= 0 &&
    synchronousCommerceIndex > fastCandidateIndex,
  true,
  "SIGNED_VA_DURABLE_BRANCH_PRECEDES_SYNCHRONOUS_COMMERCE_FALLBACK",
);
expect(
  /await prepareGPayFastAck[\s\S]*return NextResponse\.json/u.test(
    webhookSource.slice(fastCandidateIndex, synchronousCommerceIndex),
  ),
  true,
  "DURABLE_SIGNED_VA_BRANCH_RETURNS_BEFORE_SYNCHRONOUS_PROVIDER_CREATE",
);

console.log(`OFFLINE_REGRESSION_ASSERTIONS=${assertions}`);
console.log("F07_GPAY_VA_DURABLE_BEFORE_COMMERCE_R3_RESULT=PASS");
