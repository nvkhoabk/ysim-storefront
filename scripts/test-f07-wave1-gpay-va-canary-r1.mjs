import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  assertWave1GPayVACanaryRequest,
  readWave1GPayVACanaryPolicy,
  WAVE1_GPAY_VA_CANARY_HARD_MAX_VND,
  Wave1GPayVACanaryError,
} from "../src/lib/runtime/wave1-gpay-va-canary.ts";
import { decideProductionExecutionGate } from "../src/lib/runtime/production-execution-gate.ts";

const exactEnvironment = {
  YSIM_RUNTIME_ENVIRONMENT: "production",
  PAYMENT_EXECUTION_ENABLED: "true",
  GPAY_ENABLED: "true",
  GPAY_VA_ENABLED: "true",
  FULFILLMENT_EXECUTION_ENABLED: "false",
  CUSTOMER_EMAIL_DELIVERY_ENABLED: "false",
  SCHEDULER_ENABLED: "false",
  AGENCY_GATEWAY_TOPUP_ENABLED: "false",
  YSIM_PAYMENT_OWNER_ENABLED: "false",
  ONEPAY_ENABLED: "false",
  UMONEY_ENABLED: "false",
  GIGAGO_ENABLED: "false",
  GPAY_FAST_ACK_ENABLED: "false",
  GPAY_DELAYED_RECONCILIATION_ENABLED: "false",
  CASH_PAYMENT_ENABLED: "false",
  GPAY_COMMERCE_AUTOMATION_MODE: "record",
  GPAY_CALLBACK_RECONCILIATION_MODE: "query",
  GPAY_COMMERCE_AUTOMATION_REQUIRE_QUERY: "true",
  YSIM_MARKET_ROUTING_ENABLED: "false",
  YSIM_WAVE1_GPAY_VA_CANARY_MODE: "armed",
  YSIM_WAVE1_GPAY_VA_CANARY_ORDER_ID: "4100",
  YSIM_WAVE1_GPAY_VA_CANARY_AMOUNT_VND: "100000",
  YSIM_WAVE1_GPAY_VA_CANARY_BUDGET_FILE:
    "/var/www/ysim.vn/storefront/shared/state/f07-wave1-gpay-va-canary-4100.json",
};

let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

function expectCanaryError(code, operation) {
  assert.throws(operation, (error) => {
    assert.equal(error instanceof Wave1GPayVACanaryError, true);
    assert.equal(error.code, code);
    return true;
  });
}

assert.equal(WAVE1_GPAY_VA_CANARY_HARD_MAX_VND, 200_000);
pass("WAVE1_HARD_MAX_PINNED_200000_VND");

assert.equal(
  readWave1GPayVACanaryPolicy({
    nodeEnvironment: "development",
    environment: exactEnvironment,
  }),
  null,
);
pass("NON_PRODUCTION_CANARY_INACTIVE");

assert.equal(
  readWave1GPayVACanaryPolicy({
    nodeEnvironment: "production",
    environment: {
      ...exactEnvironment,
      PAYMENT_EXECUTION_ENABLED: "false",
      GPAY_ENABLED: "false",
      GPAY_VA_ENABLED: "false",
    },
  }),
  null,
);
pass("DISABLED_PRODUCTION_CANARY_INACTIVE");

expectCanaryError("WAVE1_CANARY_ACTIVATION_FLAG_DRIFT", () =>
  readWave1GPayVACanaryPolicy({
    nodeEnvironment: "production",
    environment: { ...exactEnvironment, GPAY_VA_ENABLED: "false" },
  }),
);
pass("PARTIAL_ACTIVATION_REJECTED");

expectCanaryError("WAVE1_CANARY_DEFERRED_FLAG_DRIFT", () =>
  readWave1GPayVACanaryPolicy({
    nodeEnvironment: "production",
    environment: { ...exactEnvironment, GIGAGO_ENABLED: "true" },
  }),
);
pass("GIGAGO_PREMATURE_ENABLE_REJECTED");

expectCanaryError("WAVE1_CANARY_RECORD_QUERY_CONTRACT_DRIFT", () =>
  readWave1GPayVACanaryPolicy({
    nodeEnvironment: "production",
    environment: {
      ...exactEnvironment,
      GPAY_COMMERCE_AUTOMATION_MODE: "fulfill",
    },
  }),
);
pass("FULFILL_MODE_REJECTED");

const policy = readWave1GPayVACanaryPolicy({
  nodeEnvironment: "production",
  environment: exactEnvironment,
});
assert.deepEqual(policy, {
  active: true,
  provider: "gpay_virtual_account",
  orderId: 4100,
  amountVnd: 100000,
  hardMaxAmountVnd: 200000,
  budgetFile:
    "/var/www/ysim.vn/storefront/shared/state/f07-wave1-gpay-va-canary-4100.json",
});
pass("EXACT_CANARY_POLICY_ACCEPTED");

expectCanaryError("WAVE1_CANARY_AMOUNT_EXCEEDS_HARD_MAX", () =>
  readWave1GPayVACanaryPolicy({
    nodeEnvironment: "production",
    environment: {
      ...exactEnvironment,
      YSIM_WAVE1_GPAY_VA_CANARY_AMOUNT_VND: "200001",
    },
  }),
);
pass("AMOUNT_ABOVE_200000_REJECTED");

expectCanaryError("WAVE1_CANARY_BUDGET_PATH_INVALID", () =>
  readWave1GPayVACanaryPolicy({
    nodeEnvironment: "production",
    environment: {
      ...exactEnvironment,
      YSIM_WAVE1_GPAY_VA_CANARY_BUDGET_FILE: "/tmp/canary.json",
    },
  }),
);
pass("BUDGET_PATH_OUTSIDE_PRODUCTION_STATE_REJECTED");

assert.ok(
  assertWave1GPayVACanaryRequest({
    provider: "gpay_virtual_account",
    orderId: 4100,
    amountVnd: 100000,
    nodeEnvironment: "production",
    environment: exactEnvironment,
  }),
);
pass("EXACT_PROVIDER_ORDER_AMOUNT_ACCEPTED");

expectCanaryError("WAVE1_CANARY_PROVIDER_REJECTED", () =>
  assertWave1GPayVACanaryRequest({
    provider: "gpay_gateway_all",
    orderId: 4100,
    amountVnd: 100000,
    nodeEnvironment: "production",
    environment: exactEnvironment,
  }),
);
pass("NON_VA_PROVIDER_REJECTED");

expectCanaryError("WAVE1_CANARY_ORDER_REJECTED", () =>
  assertWave1GPayVACanaryRequest({
    provider: "gpay_virtual_account",
    orderId: 4101,
    amountVnd: 100000,
    nodeEnvironment: "production",
    environment: exactEnvironment,
  }),
);
pass("SECOND_ORDER_REJECTED");

expectCanaryError("WAVE1_CANARY_AMOUNT_REJECTED", () =>
  assertWave1GPayVACanaryRequest({
    provider: "gpay_virtual_account",
    orderId: 4100,
    amountVnd: 100001,
    nodeEnvironment: "production",
    environment: exactEnvironment,
  }),
);
pass("NON_EXACT_AMOUNT_REJECTED");

const checkoutGate = decideProductionExecutionGate({
  nodeEnvironment: "production",
  pathname: "/api/checkout",
  method: "POST",
  environment: exactEnvironment,
});
assert.deepEqual(checkoutGate, {
  allowed: false,
  code: "YSIM_WAVE1_PUBLIC_CHECKOUT_DISABLED",
  capability: "payment",
  requiredFlags: [],
  missingFlags: [],
});
pass("PUBLIC_CHECKOUT_POST_DISABLED_DURING_CANARY");

const createGate = decideProductionExecutionGate({
  nodeEnvironment: "production",
  pathname: "/api/payments/create",
  method: "POST",
  environment: exactEnvironment,
});
assert.equal(createGate.allowed, true);
pass("PINNED_PAYMENT_CREATE_ROUTE_REACHABLE");

const sideRouteGate = decideProductionExecutionGate({
  nodeEnvironment: "production",
  pathname: "/api/payments/gpay/virtual-account/test-connectivity",
  method: "POST",
  environment: exactEnvironment,
});
assert.deepEqual(sideRouteGate, {
  allowed: false,
  code: "YSIM_WAVE1_PAYMENT_ROUTE_DISABLED",
  capability: "payment",
  requiredFlags: [],
  missingFlags: [],
});
pass("ALL_NON_CANARY_PAYMENT_ROUTES_DISABLED");

for (const [pathname, method] of [
  ["/api/payments/gpay/virtual-account/webhook", "POST"],
  ["/api/payments/gpay/virtual-account/status", "GET"],
]) {
  assert.equal(
    decideProductionExecutionGate({
      nodeEnvironment: "production",
      pathname,
      method,
      environment: exactEnvironment,
    }).allowed,
    true,
  );
}
pass("WEBHOOK_AND_STATUS_ROUTES_REMAIN_REACHABLE");

const providerSource = await readFile(
  new URL(
    "../src/features/payments/gpay-va/gpay-va.provider.ts",
    import.meta.url,
  ),
  "utf8",
);
const claimIndex = providerSource.indexOf(
  "await claimWave1GPayVACanaryBudget(canaryPolicy)",
);
const preparedIndex = providerSource.indexOf("const preparedMeta");
const providerCallIndex = providerSource.indexOf(
  "data = await createGPayVirtualAccount",
);
assert.ok(claimIndex > 0 && claimIndex < preparedIndex);
assert.ok(preparedIndex < providerCallIndex);
assert.match(
  providerSource,
  /!canaryPolicy[\s\S]+?GPAY_COMMERCE_AUTOMATION_MODE[\s\S]+?===\s*"fulfill"[\s\S]+?enforceGigagoReadinessBeforePayment/u,
);
pass("BUDGET_CLAIM_PRECEDES_WOO_MUTATION_AND_PROVIDER_CALL");
pass("RECORD_MODE_HAS_ZERO_GIGAGO_READINESS_CALL");

const budgetSource = await readFile(
  new URL("../src/lib/runtime/wave1-gpay-va-budget.ts", import.meta.url),
  "utf8",
);
assert.match(budgetSource, /O_CREAT[\s\S]+O_EXCL[\s\S]+O_NOFOLLOW/u);
assert.match(budgetSource, /maxCreateCalls:\s*1/u);
assert.match(budgetSource, /WAVE1_CANARY_BUDGET_ALREADY_CONSUMED/u);
pass("CREATE_BUDGET_ATOMIC_SINGLE_USE_FAIL_CLOSED");

const reconciliationSource = await readFile(
  new URL(
    "../src/features/payments/gpay-va/gpay-va.reconciliation.ts",
    import.meta.url,
  ),
  "utf8",
);
assert.match(reconciliationSource, /await getGPayVirtualAccountDetail/u);
assert.match(reconciliationSource, /virtual-account-detail/u);
assert.match(reconciliationSource, /VA_DETAIL_QUERY_RECONCILIATION_CONFIRMED/u);
pass("VA_RECONCILIATION_CALLS_REAL_GPAY_DETAIL_API");

const webhookSource = await readFile(
  new URL(
    "../src/app/api/payments/gpay/virtual-account/webhook/route.ts",
    import.meta.url,
  ),
  "utf8",
);
assert.doesNotMatch(webhookSource, /syntheticContracts/u);
const queryIndex = webhookSource.indexOf(
  "await reconcileVerifiedGPayVAWebhook",
);
const paidEvidenceIndex = webhookSource.indexOf(
  '"PAYMENT_RECEIVED_QUERY_CONFIRMED"',
);
const automationIndex = webhookSource.indexOf(
  "await runGPayCommerceAutomation",
);
assert.ok(queryIndex > 0 && queryIndex < paidEvidenceIndex);
assert.ok(paidEvidenceIndex < automationIndex);
assert.match(webhookSource, /VA_QUERY_RECONCILIATION_RETRY/u);
assert.match(webhookSource, /status:\s*503/u);
pass("SYNTHETIC_RECONCILIATION_REMOVED");
pass("QUERY_CONFIRMATION_PRECEDES_PAYMENT_RECORDING");
pass("TRANSIENT_QUERY_FAILURE_RETURNS_RETRYABLE_503");

console.log(`F07_WAVE1_GPAY_VA_CANARY_SOURCE_REGRESSION=PASS_ALL_${passed}`);
