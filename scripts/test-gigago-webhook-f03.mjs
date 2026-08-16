#!/usr/bin/env node

const args = process.argv.slice(2);

function argument(name, fallback = null) {
  const prefix = `--${name}=`;
  const match = args.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const orderId = Number.parseInt(argument("order-id", ""), 10);
const mode = argument("mode", "live");
const baseUrl = (
  argument("base-url") ||
  process.env.YSIM_LOCAL_BASE_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");
const testSecret = process.env.GIGAGO_TEST_SECRET?.trim();
const webhookToken = process.env.GIGAGO_WEBHOOK_TOKEN?.trim();

if (!Number.isInteger(orderId) || orderId <= 0) {
  console.error("FAIL: --order-id must be a positive integer.");
  process.exit(1);
}

if (mode !== "live" && mode !== "demo") {
  console.error("FAIL: --mode must be live or demo.");
  process.exit(1);
}

if (!testSecret || !webhookToken) {
  console.error(
    "FAIL: GIGAGO_TEST_SECRET and GIGAGO_WEBHOOK_TOKEN are required.",
  );
  process.exit(1);
}

async function readJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 300)}`);
  }
}

const statusResponse = await fetch(
  `${baseUrl}/api/fulfillment/gigago/test-order`,
  {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-ysim-test-secret": testSecret,
    },
    body: JSON.stringify({
      orderId,
      action: "status",
      mode,
    }),
  },
);
const statusBody = await readJson(statusResponse);

if (!statusResponse.ok || !statusBody?.success) {
  console.error(JSON.stringify(statusBody, null, 2));
  console.error(
    `FAIL: cannot resolve F02 status (HTTP ${statusResponse.status}).`,
  );
  process.exit(2);
}

const requestId = statusBody.result?.requestId;
const snapshot = statusBody.result?.snapshot;
const agencyOrder = snapshot?.agencyOrders?.[0] || null;
const deliveredEsims = Array.isArray(snapshot?.deliveredEsims)
  ? snapshot.deliveredEsims
  : [];

if (!requestId) {
  console.error("FAIL: F02 status did not return requestId.");
  process.exit(2);
}

const payload = {
  code: 200,
  message: "success!",
  totalRecords: 1,
  result: [
    {
      total_price: agencyOrder?.total_price || 0,
      order_detail: JSON.stringify(
        deliveredEsims.map((item) => ({
          qr_code: item.qr_code,
          msisdn: item.phone_number,
          iccid: item.iccid,
          short_link: item.short_link,
          code: item.id,
          ggg_code: item.ggg_plan_id,
          description: item.channel_notes,
          data: item.data,
          validity: item.validity,
          apn: null,
        })),
      ),
      website: "local-f03-test",
    },
  ],
  extra: {
    request_id: requestId,
    agency_order_id: 0,
    code: "local-f03-test",
    notes: `Synthetic F03 webhook for Woo order ${orderId}`,
    status: agencyOrder?.order_status || 0,
    website: "local-f03-test",
  },
};

const webhookResponse = await fetch(
  `${baseUrl}/api/fulfillment/gigago/webhook?token=${encodeURIComponent(
    webhookToken,
  )}`,
  {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  },
);
const webhookBody = await readJson(webhookResponse);

console.log(JSON.stringify(webhookBody, null, 2));

if (
  !webhookResponse.ok ||
  !webhookBody?.success ||
  webhookBody?.requestId !== requestId ||
  webhookBody?.orderId !== orderId
) {
  console.error(
    `FAIL: F03 webhook test returned HTTP ${webhookResponse.status}.`,
  );
  process.exit(3);
}

console.log(
  `PASS: Gigago F03 webhook accepted and reconciled Woo order ${orderId} (${mode}).`,
);
