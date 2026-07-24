import { createHash } from "node:crypto";

import {
  getWooCommerceAdminOrder,
  type WooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";
import {
  readWooCommerceOrderMetaString,
  updateWooCommerceAdminOrder,
  upsertWooCommerceOrderMeta,
} from "@/lib/woocommerce/order-admin-write-api";

import { GigagoClient } from "./gigago.client";
import { getGigagoConfig } from "./gigago.config";
import { GigagoError } from "./gigago.errors";
import type { GigagoAgencyOrder, GigagoDeliveredEsim } from "./gigago.types";
import type {
  GigagoPersistedEsim,
  GigagoWebhookEnvelope,
  GigagoWebhookExtra,
  GigagoWebhookOrderDetail,
  GigagoWebhookParsedPayload,
  GigagoWebhookReconciliationResult,
  GigagoWebhookResult,
} from "./gigago-webhook.types";

type JsonRecord = Record<string, unknown>;
type FulfillmentMode = "live" | "demo";

interface RequestIdentity {
  mode: FulfillmentMode;
  orderId: number;
}

interface FulfillmentMetadataKeys {
  requestId: string;
  agencyOrderId: string;
  orderStatus: string;
  submittedAt: string;
  planItems: string;
  lastCheckedAt: string;
  webhookReceivedAt: string;
  webhookPayloadSha256: string;
  webhookState: string;
  esims: string;
}

interface GigagoAuthoritativeSnapshot {
  agencyOrders: GigagoAgencyOrder[];
  deliveredEsims: GigagoDeliveredEsim[];
}

const LIVE_META: FulfillmentMetadataKeys = {
  requestId: "_ysim_gigago_request_id",
  agencyOrderId: "_ysim_gigago_agency_order_id",
  orderStatus: "_ysim_gigago_order_status",
  submittedAt: "_ysim_gigago_submitted_at",
  planItems: "_ysim_gigago_plan_items",
  lastCheckedAt: "_ysim_gigago_last_checked_at",
  webhookReceivedAt: "_ysim_gigago_webhook_received_at",
  webhookPayloadSha256: "_ysim_gigago_webhook_payload_sha256",
  webhookState: "_ysim_gigago_webhook_state",
  esims: "_ysim_gigago_esims",
};

const DEMO_META: FulfillmentMetadataKeys = {
  requestId: "_ysim_gigago_demo_request_id",
  agencyOrderId: "_ysim_gigago_demo_agency_order_id",
  orderStatus: "_ysim_gigago_demo_order_status",
  submittedAt: "_ysim_gigago_demo_submitted_at",
  planItems: "_ysim_gigago_demo_plan_items",
  lastCheckedAt: "_ysim_gigago_demo_last_checked_at",
  webhookReceivedAt: "_ysim_gigago_demo_webhook_received_at",
  webhookPayloadSha256: "_ysim_gigago_demo_webhook_payload_sha256",
  webhookState: "_ysim_gigago_demo_webhook_state",
  esims: "_ysim_gigago_demo_esims",
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized || normalized.toLowerCase() === "null") {
    return null;
  }

  return normalized;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function parseWebhookExtra(value: unknown): GigagoWebhookExtra {
  if (!isRecord(value)) {
    throw new GigagoError({
      code: "GIGAGO_RESPONSE_INVALID",
      message: "Gigago webhook thiếu object extra.",
      details: value,
    });
  }

  const requestId = stringValue(value.request_id);

  if (!requestId) {
    throw new GigagoError({
      code: "GIGAGO_RESPONSE_INVALID",
      message: "Gigago webhook thiếu extra.request_id.",
      details: value,
    });
  }

  return {
    request_id: requestId,
    agency_order_id: numberValue(value.agency_order_id) ?? undefined,
    code: stringValue(value.code) ?? undefined,
    notes: stringValue(value.notes) ?? undefined,
    status: numberValue(value.status) ?? undefined,
    website: stringValue(value.website) ?? undefined,
  };
}

function parseWebhookResults(value: unknown): GigagoWebhookResult[] {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new GigagoError({
      code: "GIGAGO_RESPONSE_INVALID",
      message: "Gigago webhook result phải là array.",
      details: value,
    });
  }

  return value.map((item) => {
    if (!isRecord(item)) {
      throw new GigagoError({
        code: "GIGAGO_RESPONSE_INVALID",
        message: "Gigago webhook result item không hợp lệ.",
        details: item,
      });
    }

    return {
      total_price: numberValue(item.total_price) ?? undefined,
      order_detail: stringValue(item.order_detail) ?? undefined,
      website: stringValue(item.website) ?? undefined,
    };
  });
}

function parseCallbackOrderDetails(
  results: readonly GigagoWebhookResult[],
): GigagoWebhookOrderDetail[] {
  const details: GigagoWebhookOrderDetail[] = [];

  for (const result of results) {
    if (!result.order_detail) {
      continue;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(result.order_detail);
    } catch (error) {
      throw new GigagoError({
        code: "GIGAGO_RESPONSE_INVALID",
        message: "Gigago webhook order_detail không phải JSON string hợp lệ.",
        details: result.order_detail.slice(0, 500),
        cause: error,
      });
    }

    if (!Array.isArray(parsed)) {
      throw new GigagoError({
        code: "GIGAGO_RESPONSE_INVALID",
        message: "Gigago webhook order_detail phải chứa JSON array.",
        details: parsed,
      });
    }

    for (const item of parsed) {
      if (!isRecord(item)) {
        continue;
      }

      details.push({
        qr_code: stringValue(item.qr_code),
        msisdn: stringValue(item.msisdn),
        iccid: stringValue(item.iccid),
        short_link: stringValue(item.short_link),
        code: stringValue(item.code),
        ggg_code: stringValue(item.ggg_code),
        description: stringValue(item.description),
        data: stringValue(item.data),
        validity: stringValue(item.validity),
        apn: stringValue(item.apn),
      });
    }
  }

  return details;
}

export function parseGigagoWebhookPayload(
  value: unknown,
): GigagoWebhookParsedPayload {
  if (!isRecord(value)) {
    throw new GigagoError({
      code: "GIGAGO_RESPONSE_INVALID",
      message: "Gigago webhook JSON phải là object.",
      details: value,
    });
  }

  const code = numberValue(value.code);
  const message = stringValue(value.message);
  const totalRecords = numberValue(value.totalRecords);

  if (code !== 200 || !message || totalRecords == null) {
    throw new GigagoError({
      code: "GIGAGO_RESPONSE_INVALID",
      message: "Gigago webhook envelope không hợp lệ.",
      details: value,
    });
  }

  const result = parseWebhookResults(value.result);
  const extra = parseWebhookExtra(value.extra);
  const envelope: GigagoWebhookEnvelope = {
    code,
    message,
    totalRecords,
    result,
    extra,
  };

  return {
    envelope,
    callbackOrderDetails: parseCallbackOrderDetails(result),
  };
}

function parseRequestIdentity(requestId: string): RequestIdentity {
  const match = /^ysim-(live|demo)-wc-(\d+)-([a-f0-9]{16})$/i.exec(requestId);

  if (!match) {
    throw new GigagoError({
      code: "GIGAGO_API_REJECTED",
      message: "Gigago request_id không thuộc namespace fulfillment của YSim.",
      details: { requestId },
    });
  }

  const orderId = Number.parseInt(match[2], 10);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new GigagoError({
      code: "GIGAGO_API_REJECTED",
      message: "Không xác định được WooCommerce order từ request_id.",
      details: { requestId },
    });
  }

  return {
    mode: match[1].toLowerCase() as FulfillmentMode,
    orderId,
  };
}

function metadataKeys(mode: FulfillmentMode): FulfillmentMetadataKeys {
  return mode === "demo" ? DEMO_META : LIVE_META;
}

function deterministicRequestId(
  order: WooCommerceAdminOrder,
  mode: FulfillmentMode,
): string {
  const digest = createHash("sha256")
    .update(`${mode}:${order.id}:${order.order_key}`, "utf8")
    .digest("hex")
    .slice(0, 16);

  return `ysim-${mode}-wc-${order.id}-${digest}`;
}

function ensureRequestMatchesOrder(
  order: WooCommerceAdminOrder,
  mode: FulfillmentMode,
  requestId: string,
): void {
  const keys = metadataKeys(mode);
  const storedRequestId = readWooCommerceOrderMetaString(order, keys.requestId);
  const expectedRequestId = deterministicRequestId(order, mode);

  if (requestId !== expectedRequestId) {
    throw new GigagoError({
      code: "GIGAGO_API_REJECTED",
      message: "Gigago request_id không khớp WooCommerce order.",
      details: {
        orderId: order.id,
        requestId,
      },
    });
  }

  if (storedRequestId && storedRequestId !== requestId) {
    throw new GigagoError({
      code: "GIGAGO_API_REJECTED",
      message: "WooCommerce order đang liên kết với request_id khác.",
      details: {
        orderId: order.id,
        requestId,
      },
    });
  }
}

function payloadHash(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function queryAuthoritativeSnapshot(
  client: GigagoClient,
  requestId: string,
): Promise<GigagoAuthoritativeSnapshot> {
  const attempts = 3;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const [agencyOrders, deliveredEsims] = await Promise.all([
      client.getMyOrdersAgency({ requestId }),
      client.getOrderDetailAgency({ requestId }),
    ]);

    if (agencyOrders.length > 0 || deliveredEsims.length > 0) {
      return {
        agencyOrders,
        deliveredEsims,
      };
    }

    if (attempt < attempts) {
      await sleep(400 * attempt);
    }
  }

  return {
    agencyOrders: [],
    deliveredEsims: [],
  };
}

function providerStatus(snapshot: GigagoAuthoritativeSnapshot): string {
  const agencyStatuses = snapshot.agencyOrders
    .map((item) => stringValue(item.order_status_name))
    .filter((item): item is string => Boolean(item));

  if (agencyStatuses.length > 0) {
    return [...new Set(agencyStatuses)].join(", ");
  }

  const detailStatuses = snapshot.deliveredEsims
    .map((item) => stringValue(item.status_name))
    .filter((item): item is string => Boolean(item));

  return detailStatuses.length > 0
    ? [...new Set(detailStatuses)].join(", ")
    : "Awaiting reconciliation";
}

function persistedEsims(
  details: readonly GigagoDeliveredEsim[],
): GigagoPersistedEsim[] {
  return details.map((item) => ({
    providerDetailId: item.id,
    providerOrderId: stringValue(item.order_id) ?? "",
    planId: stringValue(item.ggg_plan_id) ?? "",
    status: numberValue(item.status) ?? 0,
    statusName: stringValue(item.status_name) ?? "Unknown",
    iccid: stringValue(item.iccid),
    phoneNumber: stringValue(item.phone_number),
    qrCode: stringValue(item.qr_code),
    shortLink: stringValue(item.short_link),
    data: stringValue(item.data) ?? "",
    validity: stringValue(item.validity) ?? "",
    price: numberValue(item.price) ?? 0,
  }));
}

async function persistWebhookReconciliation({
  order,
  mode,
  parsed,
  rawBody,
  snapshot,
}: {
  order: WooCommerceAdminOrder;
  mode: FulfillmentMode;
  parsed: GigagoWebhookParsedPayload;
  rawBody: string;
  snapshot: GigagoAuthoritativeSnapshot;
}): Promise<{ duplicate: boolean }> {
  const keys = metadataKeys(mode);
  const now = new Date().toISOString();
  const hash = payloadHash(rawBody);
  const previousHash = readWooCommerceOrderMetaString(
    order,
    keys.webhookPayloadSha256,
  );
  const providerAgencyOrderId =
    snapshot.agencyOrders[0]?.id ??
    parsed.envelope.extra.agency_order_id ??
    readWooCommerceOrderMetaString(order, keys.agencyOrderId) ??
    "";
  const reconciled =
    snapshot.agencyOrders.length > 0 || snapshot.deliveredEsims.length > 0;

  const meta = upsertWooCommerceOrderMeta(order, {
    [keys.requestId]: parsed.envelope.extra.request_id,
    [keys.agencyOrderId]: String(providerAgencyOrderId),
    [keys.orderStatus]: providerStatus(snapshot),
    [keys.lastCheckedAt]: now,
    [keys.webhookReceivedAt]: now,
    [keys.webhookPayloadSha256]: hash,
    [keys.webhookState]: reconciled
      ? "reconciled"
      : "accepted_awaiting_reconciliation",
    [keys.esims]: persistedEsims(snapshot.deliveredEsims),
  });

  await updateWooCommerceAdminOrder(order.id, {
    meta_data: meta,
  });

  return {
    duplicate: previousHash === hash,
  };
}

export async function reconcileGigagoWebhook({
  payload,
  rawBody,
}: {
  payload: unknown;
  rawBody: string;
}): Promise<GigagoWebhookReconciliationResult> {
  const parsed = parseGigagoWebhookPayload(payload);
  const requestId = parsed.envelope.extra.request_id;
  const identity = parseRequestIdentity(requestId);
  const order = await getWooCommerceAdminOrder(identity.orderId);

  ensureRequestMatchesOrder(order, identity.mode, requestId);

  const client = new GigagoClient(getGigagoConfig());
  const snapshot = await queryAuthoritativeSnapshot(client, requestId);
  const persistence = await persistWebhookReconciliation({
    order,
    mode: identity.mode,
    parsed,
    rawBody,
    snapshot,
  });
  const expectedCount = snapshot.agencyOrders.reduce((total, agencyOrder) => {
    const parsedTotal = Number.parseInt(agencyOrder.total_esims, 10);
    return total + (Number.isFinite(parsedTotal) ? parsedTotal : 0);
  }, 0);
  const deliveredCount = snapshot.deliveredEsims.filter(
    (item) => item.status === 1,
  ).length;

  return {
    acknowledged: true,
    duplicate: persistence.duplicate,
    reconciled:
      snapshot.agencyOrders.length > 0 || snapshot.deliveredEsims.length > 0,
    requestId,
    orderId: order.id,
    mode: identity.mode,
    providerOrderStatus: providerStatus(snapshot),
    deliveredCount,
    expectedCount,
  };
}
