import { createHash } from "node:crypto";

import {
  getWooCommerceAdminOrder,
  type WooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";
import {
  readWooCommerceOrderMeta,
  readWooCommerceOrderMetaString,
  updateWooCommerceAdminOrder,
  upsertWooCommerceOrderMeta,
} from "@/lib/woocommerce/order-admin-write-api";

import { GigagoClient } from "./gigago.client";
import { getGigagoConfig } from "./gigago.config";
import { GigagoError } from "./gigago.errors";
import {
  mapGigagoDemoPlan,
  mapWooOrderToGigagoPlans,
  type GigagoMappedOrderItem,
  type GigagoOrderMappingIssue,
} from "./gigago-order-mapping";
import type {
  GigagoAgencyOrder,
  GigagoCreateOrderExtra,
  GigagoDeliveredEsim,
} from "./gigago.types";

export type GigagoFulfillmentMode = "live" | "demo";

export interface GigagoFulfillmentPreview {
  order: {
    id: number;
    number: string;
    status: string;
    currency: string;
    total: string;
    datePaid: string | null;
  };
  mode: GigagoFulfillmentMode;
  eligibleForSubmit: boolean;
  eligibilityReason: string;
  requestId: string;
  items: GigagoMappedOrderItem[];
  issues: GigagoOrderMappingIssue[];
}

export interface GigagoFulfillmentSnapshot {
  requestId: string;
  agencyOrders: GigagoAgencyOrder[];
  deliveredEsims: GigagoDeliveredEsim[];
}

export interface GigagoFulfillmentSubmission {
  created: boolean;
  recovered: boolean;
  preview: GigagoFulfillmentPreview;
  createResult: GigagoCreateOrderExtra | null;
  snapshot: GigagoFulfillmentSnapshot;
}

const LIVE_META = {
  requestId: "_ysim_gigago_request_id",
  agencyOrderId: "_ysim_gigago_agency_order_id",
  orderStatus: "_ysim_gigago_order_status",
  submittedAt: "_ysim_gigago_submitted_at",
  planItems: "_ysim_gigago_plan_items",
  lastCheckedAt: "_ysim_gigago_last_checked_at",
} as const;

const DEMO_META = {
  requestId: "_ysim_gigago_demo_request_id",
  agencyOrderId: "_ysim_gigago_demo_agency_order_id",
  orderStatus: "_ysim_gigago_demo_order_status",
  submittedAt: "_ysim_gigago_demo_submitted_at",
  planItems: "_ysim_gigago_demo_plan_items",
  lastCheckedAt: "_ysim_gigago_demo_last_checked_at",
} as const;

function metadataKeys(mode: GigagoFulfillmentMode) {
  return mode === "demo" ? DEMO_META : LIVE_META;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new GigagoError({
      code: "GIGAGO_CONFIG_ERROR",
      message: `Thiếu biến môi trường bắt buộc: ${name}.`,
    });
  }

  return value;
}

function allowedLiveStatuses(): Set<string> {
  const configured =
    process.env.GIGAGO_FULFILLMENT_ALLOWED_ORDER_STATUSES?.trim() ||
    "processing,completed";

  return new Set(
    configured
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

function rejectedDemoStatuses(): Set<string> {
  return new Set(["cancelled", "refunded", "failed", "trash"]);
}

function deterministicRequestId(
  order: WooCommerceAdminOrder,
  mode: GigagoFulfillmentMode,
): string {
  const digest = createHash("sha256")
    .update(`${mode}:${order.id}:${order.order_key}`, "utf8")
    .digest("hex")
    .slice(0, 16);

  return `ysim-${mode}-wc-${order.id}-${digest}`;
}

function eligibility(
  order: WooCommerceAdminOrder,
  mode: GigagoFulfillmentMode,
): { eligible: boolean; reason: string } {
  const status = order.status.trim().toLowerCase();

  if (mode === "demo") {
    if (rejectedDemoStatuses().has(status)) {
      return {
        eligible: false,
        reason: `Không chạy demo fulfillment cho order trạng thái ${order.status}.`,
      };
    }

    return {
      eligible: true,
      reason: "Sandbox demo được phép chạy bằng explicit protected action.",
    };
  }

  if (!allowedLiveStatuses().has(status)) {
    return {
      eligible: false,
      reason: `Order trạng thái ${order.status}; cần một trong các trạng thái: ${[
        ...allowedLiveStatuses(),
      ].join(", ")}.`,
    };
  }

  return {
    eligible: true,
    reason: "WooCommerce order đã ở trạng thái cho phép fulfillment.",
  };
}

async function loadPreview(
  orderId: number,
  mode: GigagoFulfillmentMode,
  client: GigagoClient,
): Promise<{
  order: WooCommerceAdminOrder;
  preview: GigagoFulfillmentPreview;
}> {
  const order = await getWooCommerceAdminOrder(orderId);
  const packages = await client.getPackages({}, "vi");
  const mapping =
    mode === "demo"
      ? mapGigagoDemoPlan(
          packages,
          process.env.GIGAGO_F02_DEMO_PLAN_ID?.trim() || "GIGA-DEMO",
        )
      : mapWooOrderToGigagoPlans(order, packages);
  const orderEligibility = eligibility(order, mode);
  const keys = metadataKeys(mode);
  const requestId =
    readWooCommerceOrderMetaString(order, keys.requestId) ||
    deterministicRequestId(order, mode);

  return {
    order,
    preview: {
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        currency: order.currency,
        total: order.total,
        datePaid: order.date_paid ?? null,
      },
      mode,
      eligibleForSubmit:
        orderEligibility.eligible && mapping.issues.length === 0,
      eligibilityReason: orderEligibility.reason,
      requestId,
      items: mapping.items,
      issues: mapping.issues,
    },
  };
}

async function querySnapshot(
  client: GigagoClient,
  requestId: string,
): Promise<GigagoFulfillmentSnapshot> {
  const [agencyOrders, deliveredEsims] = await Promise.all([
    client.getMyOrdersAgency({ requestId }),
    client.getOrderDetailAgency({ requestId }),
  ]);

  return {
    requestId,
    agencyOrders,
    deliveredEsims,
  };
}

function statusFromSnapshot(snapshot: GigagoFulfillmentSnapshot): string {
  const deliveredStatuses = snapshot.deliveredEsims
    .map((item) => item.status_name?.trim())
    .filter(Boolean);

  if (deliveredStatuses.length > 0) {
    return [...new Set(deliveredStatuses)].join(", ");
  }

  const orderStatuses = snapshot.agencyOrders
    .map((item) => item.order_status_name?.trim())
    .filter(Boolean);

  return orderStatuses.length > 0
    ? [...new Set(orderStatuses)].join(", ")
    : "submitted";
}

async function persistSubmission(
  order: WooCommerceAdminOrder,
  mode: GigagoFulfillmentMode,
  requestId: string,
  items: readonly GigagoMappedOrderItem[],
  createResult: GigagoCreateOrderExtra | null,
  snapshot: GigagoFulfillmentSnapshot,
): Promise<void> {
  const keys = metadataKeys(mode);
  const now = new Date().toISOString();
  const agencyOrderId =
    createResult?.agency_order_id ??
    snapshot.agencyOrders[0]?.id ??
    readWooCommerceOrderMetaString(order, keys.agencyOrderId) ??
    "";

  const storedPlanItems = readWooCommerceOrderMeta(order, keys.planItems);
  const planItems =
    items.length > 0
      ? items.map((item) => ({
          ggg_plan_id: item.ggg_plan_id,
          amount: item.amount,
          woo_line_item_ids: item.wooLineItemIds,
        }))
      : (storedPlanItems ?? []);

  const meta = upsertWooCommerceOrderMeta(order, {
    [keys.requestId]: requestId,
    [keys.agencyOrderId]: String(agencyOrderId),
    [keys.orderStatus]: statusFromSnapshot(snapshot),
    [keys.submittedAt]:
      readWooCommerceOrderMetaString(order, keys.submittedAt) || now,
    [keys.planItems]: planItems,
    [keys.lastCheckedAt]: now,
  });

  await updateWooCommerceAdminOrder(order.id, {
    meta_data: meta,
  });
}

export async function previewGigagoFulfillment(
  orderId: number,
  mode: GigagoFulfillmentMode,
): Promise<GigagoFulfillmentPreview> {
  const config = getGigagoConfig();

  if (config.environment !== "sandbox") {
    throw new GigagoError({
      code: "GIGAGO_CONFIG_ERROR",
      message: "F02 protected test workflow chỉ chạy trong Gigago sandbox.",
    });
  }

  const { preview } = await loadPreview(
    orderId,
    mode,
    new GigagoClient(config),
  );

  return preview;
}

export async function submitGigagoFulfillment(
  orderId: number,
  mode: GigagoFulfillmentMode,
): Promise<GigagoFulfillmentSubmission> {
  const config = getGigagoConfig();

  if (config.environment !== "sandbox") {
    throw new GigagoError({
      code: "GIGAGO_CONFIG_ERROR",
      message: "F02 protected test workflow chỉ chạy trong Gigago sandbox.",
    });
  }

  const client = new GigagoClient(config);
  const { order, preview } = await loadPreview(orderId, mode, client);

  if (!preview.eligibleForSubmit) {
    throw new GigagoError({
      code: "GIGAGO_API_REJECTED",
      message:
        preview.issues.length > 0
          ? "WooCommerce order chưa map đầy đủ sang Gigago plans."
          : preview.eligibilityReason,
      details: preview,
    });
  }

  // Recovery first: deterministic request_id makes a retry safe when Gigago
  // succeeded but Woo metadata persistence failed.
  const existingSnapshot = await querySnapshot(client, preview.requestId);

  if (
    existingSnapshot.agencyOrders.length > 0 ||
    existingSnapshot.deliveredEsims.length > 0
  ) {
    await persistSubmission(
      order,
      mode,
      preview.requestId,
      preview.items,
      null,
      existingSnapshot,
    );

    return {
      created: false,
      recovered: true,
      preview,
      createResult: null,
      snapshot: existingSnapshot,
    };
  }

  const createResult = await client.createPartnerOrder({
    request_id: preview.requestId,
    orders: preview.items.map((item) => ({
      ggg_plan_id: item.ggg_plan_id,
      amount: item.amount,
    })),
    metadata: {
      note: `YSim WooCommerce order ${order.number} (${mode})`,
      url_notify: requiredEnvironment("GIGAGO_WEBHOOK_URL"),
    },
  });

  const snapshot = await querySnapshot(client, preview.requestId);

  await persistSubmission(
    order,
    mode,
    preview.requestId,
    preview.items,
    createResult,
    snapshot,
  );

  return {
    created: true,
    recovered: false,
    preview,
    createResult,
    snapshot,
  };
}

export async function getGigagoFulfillmentStatus(
  orderId: number,
  mode: GigagoFulfillmentMode,
): Promise<{
  orderId: number;
  mode: GigagoFulfillmentMode;
  requestId: string;
  snapshot: GigagoFulfillmentSnapshot;
}> {
  const config = getGigagoConfig();

  if (config.environment !== "sandbox") {
    throw new GigagoError({
      code: "GIGAGO_CONFIG_ERROR",
      message: "F02 protected test workflow chỉ chạy trong Gigago sandbox.",
    });
  }

  const client = new GigagoClient(config);
  const order = await getWooCommerceAdminOrder(orderId);
  const keys = metadataKeys(mode);
  const requestId =
    readWooCommerceOrderMetaString(order, keys.requestId) ||
    deterministicRequestId(order, mode);
  const snapshot = await querySnapshot(client, requestId);

  if (snapshot.agencyOrders.length > 0 || snapshot.deliveredEsims.length > 0) {
    await persistSubmission(order, mode, requestId, [], null, snapshot);
  }

  return {
    orderId,
    mode,
    requestId,
    snapshot,
  };
}
