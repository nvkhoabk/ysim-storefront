import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  assessGigagoFulfillmentTerminal,
  requiresGPayFulfillmentTerminalRevalidation,
  selectGigagoFulfillmentReplayAction,
  shouldPollGigagoProviderForTerminal,
} from "../src/lib/fulfillment/gigago/gigago-fulfillment-terminal.ts";

const HASH = "a".repeat(64);
let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

function evidence(overrides = {}) {
  return {
    orderStatus: "completed",
    deliveryStatus: "ready",
    deliveryHash: HASH,
    deliveredCount: 1,
    customerEmailStatus: "sent",
    customerEmailAttempts: 1,
    customerEmailDeliveryHash: HASH,
    mailOrchestrationStatus: "completed",
    mailOrchestrationRequestedHash: HASH,
    ...overrides,
  };
}

const terminal = assessGigagoFulfillmentTerminal(evidence());
assert.equal(terminal.state, "succeeded");
assert.equal(terminal.terminal, true);
assert.equal(terminal.reason, "FULFILLMENT_EMAIL_COMPLETED_EXACTLY_ONCE");
pass("TERMINAL_REQUIRES_DELIVERY_EMAIL_AND_COMPLETED_ORDER");

assert.equal(
  selectGigagoFulfillmentReplayAction({
    sameTransactionDuplicate: false,
    mode: "fulfill",
    priorSubmissionEvidence: false,
    terminalState: "pending",
  }),
  "submit",
);
pass("FIRST_FULFILLMENT_CAN_SUBMIT");

assert.equal(
  selectGigagoFulfillmentReplayAction({
    sameTransactionDuplicate: true,
    mode: "record",
    priorSubmissionEvidence: false,
    terminalState: "pending",
  }),
  "record-only",
);
pass("RECORD_REPLAY_NEVER_ENTERS_FULFILLMENT");

assert.equal(
  selectGigagoFulfillmentReplayAction({
    sameTransactionDuplicate: true,
    mode: "fulfill",
    priorSubmissionEvidence: true,
    terminalState: "succeeded",
  }),
  "local-terminal",
);
pass("TERMINAL_REPLAY_STOPS_BEFORE_PROVIDER");

assert.equal(
  selectGigagoFulfillmentReplayAction({
    sameTransactionDuplicate: true,
    mode: "fulfill",
    priorSubmissionEvidence: true,
    terminalState: "pending",
  }),
  "status-only",
);
pass("SUBMITTED_REPLAY_USES_STATUS_ONLY");

assert.equal(
  selectGigagoFulfillmentReplayAction({
    sameTransactionDuplicate: true,
    mode: "fulfill",
    priorSubmissionEvidence: false,
    terminalState: "pending",
  }),
  "submit",
);
pass("UNSUBMITTED_REPLAY_CAN_RECOVER_OR_SUBMIT");

assert.equal(shouldPollGigagoProviderForTerminal(terminal), false);
assert.equal(
  shouldPollGigagoProviderForTerminal(
    assessGigagoFulfillmentTerminal(evidence({ orderStatus: "processing" })),
  ),
  true,
);
pass("LOCAL_TERMINAL_EVIDENCE_PRECEDES_PROVIDER_POLL");

assert.equal(
  requiresGPayFulfillmentTerminalRevalidation({
    automationMode: "fulfill",
    state: "succeeded",
    terminal: false,
  }),
  true,
);
pass("LEGACY_UNBOUND_SUCCESS_REQUIRES_REVALIDATION");

assert.equal(
  requiresGPayFulfillmentTerminalRevalidation({
    automationMode: "fulfill",
    state: "succeeded",
    terminal: true,
  }),
  false,
);
pass("BOUND_TERMINAL_SUCCESS_REMAINS_TERMINAL");

assert.equal(
  "snapshot" in evidence(),
  false,
  "Raw QR/LPA snapshot must not be required by the terminal contract.",
);
pass("TERMINAL_CONTRACT_DOES_NOT_REQUIRE_RAW_SNAPSHOT");

assert.equal(
  assessGigagoFulfillmentTerminal(evidence({ orderStatus: "processing" }))
    .state,
  "pending",
);
pass("PROCESSING_ORDER_IS_NOT_TERMINAL");

assert.equal(
  assessGigagoFulfillmentTerminal(
    evidence({ customerEmailStatus: "pending", customerEmailAttempts: 0 }),
  ).state,
  "pending",
);
pass("PENDING_EMAIL_REMAINS_PENDING");

assert.equal(
  assessGigagoFulfillmentTerminal(
    evidence({ mailOrchestrationStatus: "requested" }),
  ).state,
  "pending",
);
pass("REQUESTED_MAIL_ORCHESTRATION_IS_NOT_TERMINAL");

assert.equal(
  assessGigagoFulfillmentTerminal(
    evidence({ deliveryStatus: "processing", deliveredCount: 0 }),
  ).state,
  "pending",
);
pass("PROVIDER_PROCESSING_REMAINS_PENDING");

assert.equal(
  assessGigagoFulfillmentTerminal(evidence({ deliveryHash: "invalid" }))
    .reason,
  "DELIVERY_HASH_INVALID",
);
pass("INVALID_DELIVERY_HASH_FAILS_CLOSED");

assert.equal(
  assessGigagoFulfillmentTerminal(
    evidence({ customerEmailStatus: "failed" }),
  ).state,
  "action-required",
);
pass("FAILED_EMAIL_REQUIRES_ACTION");

assert.equal(
  assessGigagoFulfillmentTerminal(evidence({ customerEmailAttempts: 2 }))
    .reason,
  "CUSTOMER_EMAIL_ATTEMPT_BUDGET_VIOLATED",
);
pass("SECOND_EMAIL_ATTEMPT_FAILS_CLOSED");

assert.equal(
  assessGigagoFulfillmentTerminal(
    evidence({ customerEmailDeliveryHash: "b".repeat(64) }),
  ).reason,
  "CUSTOMER_EMAIL_BINDING_INVALID",
);
pass("EMAIL_DELIVERY_HASH_MISMATCH_FAILS_CLOSED");

assert.equal(
  assessGigagoFulfillmentTerminal(
    evidence({ mailOrchestrationRequestedHash: "b".repeat(64) }),
  ).reason,
  "MAIL_ORCHESTRATION_BINDING_INVALID",
);
pass("MAIL_REQUEST_HASH_MISMATCH_FAILS_CLOSED");

assert.equal(
  assessGigagoFulfillmentTerminal(evidence({ orderStatus: "refunded" }))
    .reason,
  "WOO_ORDER_TERMINAL_FAILURE",
);
pass("FAILED_WOO_ORDER_REQUIRES_ACTION");

const automationSource = await readFile(
  "src/lib/fulfillment/gigago/gpay-commerce-automation.ts",
  "utf8",
);
assert.match(
  automationSource,
  /transactionDisposition === "same-transaction-duplicate"\s*&&\s*mode === "record"/u,
);
assert.match(automationSource, /FULFILLMENT_ALREADY_TERMINAL/u);
assert.match(automationSource, /FULFILLMENT_REPLAY_STATUS_POLL_REQUIRED/u);
assert.ok(
  automationSource.indexOf("await getGigagoSecureDeliveryStatus") <
    automationSource.indexOf("await submitGigagoFulfillment"),
);
assert.match(automationSource, /await submitGigagoFulfillment/u);
pass("SAME_PAYMENT_REPLAY_CAN_RESUME_IDEMPOTENT_FULFILLMENT");

const delayedSource = await readFile(
  "src/lib/fulfillment/gigago/gpay-delayed-reconciliation.ts",
  "utf8",
);
assert.match(delayedSource, /await getGigagoFulfillmentStatus/u);
assert.match(delayedSource, /await getGigagoSecureDeliveryStatus/u);
assert.match(
  delayedSource,
  /if \(resumingFulfillment\) \{\s*return pollPendingFulfillment/u,
);
const pollSource = delayedSource.slice(
  delayedSource.indexOf("async function pollPendingFulfillment"),
  delayedSource.indexOf("async function applyConfirmedCommerce"),
);
assert.ok(
  pollSource.indexOf("await getGigagoSecureDeliveryStatus") <
    pollSource.indexOf("await getGigagoFulfillmentStatus"),
);
assert.match(delayedSource, /requiresGPayFulfillmentTerminalRevalidation/u);
assert.match(delayedSource, /version: "f04\.3\.3\.2"/u);
assert.match(
  delayedSource,
  /automationMode === "record"[\s\S]*state = "succeeded"[\s\S]*state = "pending-fulfillment"/u,
);
assert.doesNotMatch(delayedSource, /submitGigagoFulfillment/u);
pass("PENDING_FULFILLMENT_POLLS_WITHOUT_PROVIDER_CREATE_OR_FALSE_SUCCESS");

const sweepSource = await readFile(
  "scripts/run-gpay-reconciliation-sweep-f06-1b-1.mjs",
  "utf8",
);
assert.match(sweepSource, /requiresTerminalRevalidation/u);
assert.match(sweepSource, /revalidate-legacy-terminal/u);
pass("SWEEP_DISCOVERS_LEGACY_UNBOUND_SUCCESS");

const snapshotSource = await readFile(
  "src/lib/fulfillment/gigago/gigago-delivery-snapshot.ts",
  "utf8",
);
assert.match(snapshotSource, /_ysim_esim_delivery_snapshot/u);
assert.doesNotMatch(snapshotSource, /_ysim_esim_secure_delivery_snapshot/u);
assert.match(snapshotSource, /deliveryTerminal/u);
pass("SOURCE_USES_ACTUAL_DELIVERY_SNAPSHOT_KEY_AND_SAFE_TERMINAL_VIEW");

const serviceSource = await readFile(
  "src/lib/fulfillment/gigago/gigago-fulfillment-service.ts",
  "utf8",
);
const testRouteSource = await readFile(
  "src/app/api/fulfillment/gigago/test-order/route.ts",
  "utf8",
);
assert.match(serviceSource, /config\.environment !== "sandbox"/u);
assert.match(testRouteSource, /config\.environment !== "sandbox"/u);
pass("PRODUCTION_GIGAGO_EXECUTION_BOUNDARY_REMAINS_CLOSED");

assert.doesNotMatch(
  `${automationSource}\n${delayedSource}\n${snapshotSource}`,
  /6403|G000185\.36/u,
);
pass("CORRECTIVE_CONTAINS_NO_ORDER_6403_SPECIAL_CASE");

console.log(
  `F07_GIGAGO_FULFILLMENT_TERMINAL_CORRECTIVE_RESULT=PASS_ALL_${passed}`,
);
