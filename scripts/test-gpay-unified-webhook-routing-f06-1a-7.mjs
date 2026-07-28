#!/usr/bin/env node

function arg(name, fallback = null) {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const baseUrl = (arg("base-url", "http://localhost:3000") || "").replace(
  /\/$/,
  "",
);

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Response is not JSON: HTTP ${response.status} ${text.slice(0, 300)}`,
    );
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function post(payload) {
  const response = await fetch(`${baseUrl}/api/payments/gpay/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { response, body: await readJson(response) };
}

const healthResponse = await fetch(`${baseUrl}/api/payments/gpay/webhook`, {
  headers: { accept: "application/json" },
});
const health = await readJson(healthResponse);
assert(
  healthResponse.ok,
  `Unified webhook GET failed: HTTP ${healthResponse.status}`,
);
assert(
  health.unifiedWebhookDispatch === true,
  "Unified webhook health does not expose unifiedWebhookDispatch=true.",
);
assert(
  Array.isArray(health.supportedContracts) &&
    health.supportedContracts.includes("gpay-va-change-balance-v1"),
  "Unified webhook health does not expose the VA contract.",
);
console.log("PASS unified webhook health");

const vaProbe = await post({
  gpay_trans_id: "YSIM-ROUTING-PROBE-VA",
  bank_trace_id: "PROBE",
  bank_transaction_id: "PROBE",
  account_number: "000000000000000000",
  amount: 1,
  message: "YSIM-1-ROUTING-PROBE",
  merchant_code: "ROUTING-PROBE",
  action: "CHANGE_BALANCE",
  signature: "invalid-routing-probe-signature",
});
assert(
  (vaProbe.response.status === 401 &&
    vaProbe.body.code === "INVALID_SIGNATURE") ||
    (vaProbe.response.status === 503 && vaProbe.body.code === "VA_DISABLED"),
  `VA probe was not dispatched to the VA handler: HTTP ${vaProbe.response.status} ${JSON.stringify(vaProbe.body)}`,
);
console.log(
  `PASS VA dispatch probe: HTTP ${vaProbe.response.status} code=${vaProbe.body.code}`,
);

const gatewayProbe = await post({
  merchant_order_id: "YSIM-GATEWAY-ROUTING-PROBE",
  gpay_trans_id: "YSIM-GATEWAY-TRANS-PROBE",
  gpay_bill_id: "YSIM-GATEWAY-BILL-PROBE",
  status: "ORDER_SUCCESS",
  embed_data: "{}",
  user_payment_method: "ATM",
  signature: "invalid-routing-probe-signature",
});
assert(
  gatewayProbe.body.code !== "VA_DISABLED" &&
    gatewayProbe.body.code !== "INVALID_VA_CALLBACK",
  `Gateway probe was incorrectly dispatched to VA: ${JSON.stringify(gatewayProbe.body)}`,
);
console.log(
  `PASS Gateway dispatch probe: HTTP ${gatewayProbe.response.status} code=${gatewayProbe.body.code ?? "n/a"}`,
);

const ambiguousProbe = await post({
  merchant_order_id: "YSIM-AMBIGUOUS-PROBE",
  gpay_bill_id: "YSIM-AMBIGUOUS-BILL",
  status: "ORDER_SUCCESS",
  embed_data: "{}",
  gpay_trans_id: "YSIM-AMBIGUOUS-TRANS",
  account_number: "000000000000000000",
  amount: 1,
  action: "CHANGE_BALANCE",
  signature: "invalid-routing-probe-signature",
});
assert(
  ambiguousProbe.response.status === 400 &&
    ambiguousProbe.body.code === "AMBIGUOUS_CALLBACK_CONTRACT",
  `Ambiguous probe was not rejected safely: HTTP ${ambiguousProbe.response.status} ${JSON.stringify(ambiguousProbe.body)}`,
);
console.log("PASS ambiguous callback rejection");

const unknownProbe = await post({ hello: "world" });
assert(
  unknownProbe.response.status === 400 &&
    unknownProbe.body.code === "INVALID_CALLBACK",
  `Unknown probe was not rejected: HTTP ${unknownProbe.response.status} ${JSON.stringify(unknownProbe.body)}`,
);
console.log("PASS unknown callback rejection");
console.log("PASS: F06.1A-7 unified GPay webhook routing probes.");
