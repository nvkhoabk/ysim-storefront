import assert from "node:assert/strict";
import { constants as fsConstants } from "node:fs";
import { access, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { reconcileVerifiedGPayVAWebhook } from "../src/features/payments/gpay-va/gpay-va.reconciliation.ts";
import {
  acquireGPayVACreateLock,
  GPayVACreateLockError,
} from "../src/features/payments/gpay-va/gpay-va.create-lock.ts";
import {
  decidePaymentProviderExecutionGate,
  decideProductionExecutionGate,
} from "../src/lib/runtime/production-execution-gate.ts";

const productionPaymentEnvironment = {
  YSIM_RUNTIME_ENVIRONMENT: "production",
  PAYMENT_EXECUTION_ENABLED: "true",
  GPAY_ENABLED: "true",
  GPAY_VA_ENABLED: "true",
  FULFILLMENT_EXECUTION_ENABLED: "false",
  CUSTOMER_EMAIL_DELIVERY_ENABLED: "false",
  SCHEDULER_ENABLED: "false",
  AGENCY_GATEWAY_TOPUP_ENABLED: "false",
  YSIM_PAYMENT_OWNER_ENABLED: "false",
  GIGAGO_ENABLED: "false",
  ONEPAY_ENABLED: "false",
  UMONEY_ENABLED: "false",
  CASH_PAYMENT_ENABLED: "false",
  GPAY_FAST_ACK_ENABLED: "false",
  GPAY_DELAYED_RECONCILIATION_ENABLED: "false",
  YSIM_WAVE1_GPAY_VA_CANARY_MODE: "armed",
  YSIM_WAVE1_GPAY_VA_CANARY_ORDER_ID: "4100",
  YSIM_WAVE1_GPAY_VA_CANARY_AMOUNT_VND: "100000",
  YSIM_WAVE1_GPAY_VA_CANARY_BUDGET_FILE: "/obsolete/canary.json",
};

let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

const checkoutGate = decideProductionExecutionGate({
  nodeEnvironment: "production",
  pathname: "/api/checkout",
  method: "POST",
  environment: productionPaymentEnvironment,
});
assert.deepEqual(checkoutGate, { allowed: true });
pass("PUBLIC_CHECKOUT_ALLOWED_BY_REAL_PAYMENT_SWITCH");

const checkoutDisabledGate = decideProductionExecutionGate({
  nodeEnvironment: "production",
  pathname: "/api/checkout",
  method: "POST",
  environment: {
    ...productionPaymentEnvironment,
    PAYMENT_EXECUTION_ENABLED: "false",
  },
});
assert.equal(checkoutDisabledGate.allowed, false);
assert.deepEqual(checkoutDisabledGate.missingFlags, [
  "PAYMENT_EXECUTION_ENABLED",
]);
pass("PUBLIC_CHECKOUT_FAILS_CLOSED_WHEN_PAYMENT_SWITCH_OFF");

const vaRouteGate = decideProductionExecutionGate({
  nodeEnvironment: "production",
  pathname: "/api/payments/gpay/virtual-account/webhook",
  method: "POST",
  environment: productionPaymentEnvironment,
});
assert.deepEqual(vaRouteGate, { allowed: true });
pass("GPAY_VA_ROUTE_ALLOWED_BY_PROVIDER_SWITCHES");

const vaProviderGate = decidePaymentProviderExecutionGate({
  nodeEnvironment: "production",
  providerId: "gpay_virtual_account",
  environment: productionPaymentEnvironment,
});
assert.deepEqual(vaProviderGate, { allowed: true });
pass("GPAY_VA_PROVIDER_ALLOWED_BY_PROVIDER_SWITCHES");

const vaDisabledGate = decidePaymentProviderExecutionGate({
  nodeEnvironment: "production",
  providerId: "gpay_virtual_account",
  environment: {
    ...productionPaymentEnvironment,
    GPAY_VA_ENABLED: "false",
  },
});
assert.equal(vaDisabledGate.allowed, false);
assert.deepEqual(vaDisabledGate.missingFlags, ["GPAY_VA_ENABLED"]);
pass("GPAY_VA_PROVIDER_FAILS_CLOSED_WHEN_VA_SWITCH_OFF");

const gpayDisabledGate = decidePaymentProviderExecutionGate({
  nodeEnvironment: "production",
  providerId: "gpay_virtual_account",
  environment: {
    ...productionPaymentEnvironment,
    GPAY_ENABLED: "false",
  },
});
assert.equal(gpayDisabledGate.allowed, false);
assert.deepEqual(gpayDisabledGate.missingFlags, ["GPAY_ENABLED"]);
pass("GPAY_VA_PROVIDER_FAILS_CLOSED_WHEN_GPAY_SWITCH_OFF");

const cashDisabledGate = decidePaymentProviderExecutionGate({
  nodeEnvironment: "production",
  providerId: "cash_agent",
  environment: productionPaymentEnvironment,
});
assert.equal(cashDisabledGate.allowed, false);
assert.deepEqual(cashDisabledGate.missingFlags, ["CASH_PAYMENT_ENABLED"]);
pass("CASH_REMAINS_INDEPENDENTLY_DISABLED");

for (const [providerId, providerFlag] of [
  ["onepay_card", "ONEPAY_ENABLED"],
  ["umoney_wallet", "UMONEY_ENABLED"],
]) {
  const deferredProviderGate = decidePaymentProviderExecutionGate({
    nodeEnvironment: "production",
    providerId,
    environment: productionPaymentEnvironment,
  });
  assert.equal(deferredProviderGate.allowed, false);
  assert.deepEqual(deferredProviderGate.missingFlags, [providerFlag]);
}
pass("ONEPAY_AND_UMONEY_REMAIN_INDEPENDENTLY_DISABLED");

const fulfillmentGate = decideProductionExecutionGate({
  nodeEnvironment: "production",
  pathname: "/api/fulfillment/gigago/test-order",
  method: "POST",
  environment: productionPaymentEnvironment,
});
assert.equal(fulfillmentGate.allowed, false);
assert.deepEqual(fulfillmentGate.missingFlags, [
  "FULFILLMENT_EXECUTION_ENABLED",
  "GIGAGO_ENABLED",
]);
pass("GIGAGO_REMAINS_INDEPENDENTLY_DISABLED");

const emailGate = decideProductionExecutionGate({
  nodeEnvironment: "production",
  pathname: "/api/customer-email/send",
  method: "POST",
  environment: productionPaymentEnvironment,
});
assert.equal(emailGate.allowed, false);
assert.deepEqual(emailGate.missingFlags, ["CUSTOMER_EMAIL_DELIVERY_ENABLED"]);
pass("CUSTOMER_EMAIL_REMAINS_INDEPENDENTLY_DISABLED");

const verification = {
  verified: true,
  verificationStrategy: "gpay-va-webhook-signature",
  normalizedStatus: "SUCCESS",
  callback: {
    merchantOrderId: "YSIM-4100-ABCDEF123456",
    gpayBillId: "9704000000000001",
    gpayTransactionId: "GPAY-TRANS-1",
    status: "ORDER_SUCCESS",
    embedData: "{}",
    userPaymentMethod: "VA",
    signature: "verified-signature",
  },
  parsedEmbedData: {},
  canonicalSha256: "a".repeat(64),
  contractVersion: "gpay-va-change-balance-v1",
};

const confirmedWebhook = reconcileVerifiedGPayVAWebhook({
  verification,
  merchantOrderIdMatches: true,
  accountNumberMatches: true,
  amountMatches: true,
});
assert.equal(confirmedWebhook.mode, "signed-webhook");
assert.equal(confirmedWebhook.attempted, false);
assert.equal(confirmedWebhook.confirmed, true);
assert.equal(confirmedWebhook.reason, "VA_SIGNED_CHANGE_BALANCE_CONFIRMED");
assert.equal(confirmedWebhook.providerQueryKind, "virtual-account-webhook");
pass("SIGNED_CHANGE_BALANCE_IS_REAL_VA_PAYMENT_EVIDENCE");

for (const mismatch of [
  {
    merchantOrderIdMatches: false,
    accountNumberMatches: true,
    amountMatches: true,
  },
  {
    merchantOrderIdMatches: true,
    accountNumberMatches: false,
    amountMatches: true,
  },
  {
    merchantOrderIdMatches: true,
    accountNumberMatches: true,
    amountMatches: false,
  },
]) {
  const result = reconcileVerifiedGPayVAWebhook({
    verification,
    ...mismatch,
  });
  assert.equal(result.confirmed, false);
}
pass("SIGNED_WEBHOOK_IDENTITY_OR_AMOUNT_MISMATCH_REJECTED");

const invalidSignature = reconcileVerifiedGPayVAWebhook({
  verification: { ...verification, verified: false },
  merchantOrderIdMatches: true,
  accountNumberMatches: true,
  amountMatches: true,
});
assert.equal(invalidSignature.confirmed, false);
assert.equal(invalidSignature.reason, "VA_CALLBACK_SIGNATURE_INVALID");
pass("INVALID_WEBHOOK_SIGNATURE_REJECTED");

const lockDirectory = await mkdtemp(
  path.join(os.tmpdir(), "ysim-gpay-va-lock-test-"),
);
const previousLockDirectory = process.env.GPAY_VA_CREATE_LOCK_DIR;

try {
  process.env.GPAY_VA_CREATE_LOCK_DIR = lockDirectory;
  const firstLock = await acquireGPayVACreateLock(4100);
  const lockStat = await stat(firstLock.path);
  assert.equal(lockStat.isFile(), true);

  // Windows does not expose POSIX permission bits through fs.stat(). A file
  // created with mode 0600 is therefore reported as 0666 on NTFS. Production
  // runs on Linux, where the restrictive mode remains directly verifiable.
  if (process.platform !== "win32") {
    assert.equal(lockStat.mode & 0o777, 0o600);
  }

  await assert.rejects(
    acquireGPayVACreateLock(4100),
    (error) =>
      error instanceof GPayVACreateLockError &&
      error.code === "GPAY_VA_CREATE_IN_PROGRESS",
  );

  await firstLock.release();
  const secondLock = await acquireGPayVACreateLock(4100);
  await secondLock.release();
} finally {
  if (previousLockDirectory === undefined) {
    delete process.env.GPAY_VA_CREATE_LOCK_DIR;
  } else {
    process.env.GPAY_VA_CREATE_LOCK_DIR = previousLockDirectory;
  }

  await rm(lockDirectory, { recursive: true, force: true });
}
pass("DURABLE_CREATE_LOCK_IS_ATOMIC_AND_RELEASABLE");

for (const obsoletePath of [
  "src/lib/runtime/wave1-gpay-va-canary.ts",
  "src/lib/runtime/wave1-gpay-va-budget.ts",
  "scripts/test-f07-wave1-gpay-va-canary-r1.mjs",
]) {
  await assert.rejects(access(obsoletePath, fsConstants.F_OK));
}
pass("WAVE1_CANARY_FILES_REMOVED");

const sourceFiles = [
  "src/app/api/checkout/route.ts",
  "src/app/api/payments/create/route.ts",
  "src/app/api/payments/gpay/virtual-account/webhook/route.ts",
  "src/features/payments/gpay-va/gpay-va.provider.ts",
  "src/features/payments/gpay-va/gpay-va.reconciliation.ts",
  "src/lib/runtime/production-execution-gate.ts",
];
const source = (
  await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))
).join("\n");
assert.doesNotMatch(source, /Wave1GPayVACanary|WAVE1_CANARY|YSIM_WAVE1_/u);
pass("WAVE1_CANARY_REFERENCES_REMOVED_FROM_RUNTIME");

const providerSource = await readFile(
  "src/features/payments/gpay-va/gpay-va.provider.ts",
  "utf8",
);
const lockIndex = providerSource.indexOf("await acquireGPayVACreateLock");
const preparedIndex = providerSource.indexOf("const preparedMeta");
const providerCallIndex = providerSource.indexOf(
  "data = await createGPayVirtualAccount",
);
assert.ok(lockIndex > 0 && lockIndex < preparedIndex);
assert.ok(preparedIndex < providerCallIndex);
assert.match(
  providerSource,
  /getGPayCommerceAutomationMode\(\)\s*===\s*"fulfill"[\s\S]+?enforceGigagoReadinessBeforePayment/u,
);
pass("CREATE_LOCK_PRECEDES_PROVIDER_CALL_AND_RECORD_MODE_SKIPS_GIGAGO");

const reconciliationSource = await readFile(
  "src/features/payments/gpay-va/gpay-va.reconciliation.ts",
  "utf8",
);
assert.doesNotMatch(reconciliationSource, /getGPayVirtualAccountDetail/u);
assert.match(reconciliationSource, /mode:\s*"signed-webhook"/u);
pass("VA_OPEN_STATUS_IS_NOT_USED_AS_PAYMENT_CONFIRMATION");

const webhookSource = await readFile(
  "src/app/api/payments/gpay/virtual-account/webhook/route.ts",
  "utf8",
);
const signatureIndex = webhookSource.indexOf(
  "await verifyGPayVAWebhookSignature",
);
const orderIndex = webhookSource.indexOf(
  "await getWooCommerceAdminOrder(reference.orderId)",
);
const amountIndex = webhookSource.indexOf("payload.amount !== expectedAmount");
const automationIndex = webhookSource.indexOf(
  "await runGPayCommerceAutomation",
);
assert.ok(signatureIndex > 0 && signatureIndex < orderIndex);
assert.ok(orderIndex < amountIndex && amountIndex < automationIndex);
assert.match(webhookSource, /ORDER_ALREADY_PAID_DIFFERENT_TRANSACTION/u);
assert.match(webhookSource, /PAYMENT_RECEIVED_SIGNED_WEBHOOK_CONFIRMED/u);
pass("WEBHOOK_SECURITY_ORDER_AND_DUPLICATE_REVIEW_PRESERVED");

assert.doesNotMatch(
  webhookSource,
  /GPAY_DELAYED_RECONCILIATION_ENABLED|isGPayDelayedReconciliationEnabled/u,
);
pass("VA_SIGNED_WEBHOOK_DOES_NOT_REQUIRE_DELAYED_RECONCILIATION");

console.log(`F07_PRD_PAYMENT_CORE_CORRECTION_SOURCE_RESULT=PASS_ALL_${passed}`);
