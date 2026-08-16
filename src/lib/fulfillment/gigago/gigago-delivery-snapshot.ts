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

import type { GigagoMappedOrderItem } from "./gigago-order-mapping";
import {
  assessGigagoFulfillmentTerminal,
  type GigagoFulfillmentTerminalAssessment,
} from "./gigago-fulfillment-terminal";
import type { GigagoAgencyOrder, GigagoDeliveredEsim } from "./gigago.types";

export const GIGAGO_DELIVERY_SNAPSHOT_VERSION = "f05.1a-v1";

export const GIGAGO_DELIVERY_META = {
  version: "_ysim_esim_delivery_version",
  status: "_ysim_esim_delivery_status",
  completedAt: "_ysim_esim_delivery_completed_at",
  requestId: "_ysim_esim_delivery_request_id",
  count: "_ysim_esim_delivery_count",
  hash: "_ysim_esim_delivery_hash",
  snapshot: "_ysim_esim_delivery_snapshot",
  source: "_ysim_esim_delivery_source",
  customerEmailStatus: "_ysim_esim_customer_email_status",
  customerEmailSentAt: "_ysim_esim_customer_email_sent_at",
  customerEmailAttempts: "_ysim_esim_customer_email_attempts",
  customerEmailError: "_ysim_esim_customer_email_error",
  customerEmailLastAttemptAt: "_ysim_esim_customer_email_last_attempt_at",
  customerEmailDeliveryHash: "_ysim_esim_customer_email_delivery_hash",
  customerEmailActionId: "_ysim_esim_customer_email_action_id",
  adminEmailStatus: "_ysim_esim_admin_email_status",
  adminEmailSentAt: "_ysim_esim_admin_email_sent_at",
  adminEmailAttempts: "_ysim_esim_admin_email_attempts",
  adminEmailError: "_ysim_esim_admin_email_error",
  adminEmailLastAttemptAt: "_ysim_esim_admin_email_last_attempt_at",
  adminEmailDeliveryHash: "_ysim_esim_admin_email_delivery_hash",
  adminEmailActionId: "_ysim_esim_admin_email_action_id",
  actionRequiredEmailStatus: "_ysim_esim_action_required_email_status",
  actionRequiredEmailSentAt: "_ysim_esim_action_required_email_sent_at",
  actionRequiredEmailAttempts: "_ysim_esim_action_required_email_attempts",
  actionRequiredEmailError: "_ysim_esim_action_required_email_error",
  actionRequiredEmailLastAttemptAt:
    "_ysim_esim_action_required_email_last_attempt_at",
  actionRequiredEmailHash: "_ysim_esim_action_required_email_hash",
  actionRequiredEmailActionId: "_ysim_esim_action_required_email_action_id",
  actionRequiredEmailReason: "_ysim_esim_action_required_email_reason",
  mailOrchestrationVersion: "_ysim_esim_mail_orchestration_version",
  mailOrchestrationStatus: "_ysim_esim_mail_orchestration_status",
  mailOrchestrationRequestedAt: "_ysim_esim_mail_orchestration_requested_at",
  mailOrchestrationRequestedHash:
    "_ysim_esim_mail_orchestration_requested_hash",
  mailOrchestrationError: "_ysim_esim_mail_orchestration_error",
} as const;

export type GigagoDeliverySnapshotSource =
  | "fulfillment-submit"
  | "fulfillment-recovery"
  | "fulfillment-status"
  | "gigago-webhook"
  | "protected-fixture";

interface StoredPlanItem {
  ggg_plan_id: string;
  amount: number;
  woo_line_item_ids: number[];
}

export interface SecureEsimDeliveryItem {
  providerDetailId: number;
  providerOrderId: string;
  planId: string;
  wooLineItemIds: number[];
  iccid: string;
  phoneNumber: string | null;
  qrCode: string | null;
  shortLink: string | null;
  data: string;
  validity: string;
}

export interface SecureEsimDeliverySnapshot {
  version: typeof GIGAGO_DELIVERY_SNAPSHOT_VERSION;
  requestId: string;
  expectedEsimCount: number;
  items: SecureEsimDeliveryItem[];
}

export interface GigagoSecureDeliveryAssessment {
  ready: boolean;
  duplicate: boolean;
  persisted: boolean;
  requestId: string;
  expectedEsimCount: number;
  completedEsimCount: number;
  returnedEsimCount: number;
  deliveredEsimCount: number;
  agencyOrdersCompleted: boolean;
  allReturnedEsimsDelivered: boolean;
  allDeliveredEsimsInstallable: boolean;
  deliveryHash: string | null;
  issues: string[];
}

export interface GigagoSecureDeliveryStatus {
  orderId: number;
  orderStatus: string;
  version: string | null;
  status: string | null;
  requestId: string | null;
  completedAt: string | null;
  deliveryHash: string | null;
  deliveredCount: number;
  source: string | null;
  customerEmailStatus: string | null;
  customerEmailAttempts: number;
  customerEmailDeliveryHashMatches: boolean;
  adminEmailStatus: string | null;
  mailOrchestrationVersion: string | null;
  mailOrchestrationStatus: string | null;
  mailOrchestrationRequestedAt: string | null;
  mailOrchestrationRequestMatchesDeliveryHash: boolean;
  deliveryTerminal: GigagoFulfillmentTerminalAssessment;
  items: Array<{
    planId: string;
    maskedIccid: string;
    hasQrCode: boolean;
    hasShortLink: boolean;
    hasPhoneNumber: boolean;
  }>;
}

function normalizedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized || normalized.toLowerCase() === "null") {
    return null;
  }

  return normalized;
}

function positiveInteger(value: unknown): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function nonNegativeNumber(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function numericArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => positiveInteger(item)).filter((item) => item > 0);
}

function storedPlanItems(order: WooCommerceAdminOrder): StoredPlanItem[] {
  const raw = readWooCommerceOrderMeta(order, "_ysim_gigago_plan_items");

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const record = item as Record<string, unknown>;
    const planId = normalizedString(record.ggg_plan_id);
    const amount = positiveInteger(record.amount);

    if (!planId || amount <= 0) {
      return [];
    }

    return [
      {
        ggg_plan_id: planId,
        amount,
        woo_line_item_ids: numericArray(record.woo_line_item_ids),
      },
    ];
  });
}

function expectedPlanItems(
  order: WooCommerceAdminOrder,
  provided: readonly GigagoMappedOrderItem[] | undefined,
): StoredPlanItem[] {
  if (provided && provided.length > 0) {
    return provided.map((item) => ({
      ggg_plan_id: item.ggg_plan_id,
      amount: positiveInteger(item.amount),
      woo_line_item_ids: item.wooLineItemIds.filter(
        (lineItemId) => positiveInteger(lineItemId) > 0,
      ),
    }));
  }

  return storedPlanItems(order);
}

function completedAgencyOrders(
  agencyOrders: readonly GigagoAgencyOrder[],
): boolean {
  return (
    agencyOrders.length > 0 &&
    agencyOrders.every((order) => {
      return (
        Number(order.order_status) === 1 ||
        normalizedString(order.order_status_name)?.toLowerCase() === "completed"
      );
    })
  );
}

function deliveredEsim(esim: GigagoDeliveredEsim): boolean {
  return (
    Number(esim.status) === 1 ||
    normalizedString(esim.status_name)?.toLowerCase() === "delivered"
  );
}

function canonicalSnapshot(snapshot: SecureEsimDeliverySnapshot): string {
  return JSON.stringify({
    version: snapshot.version,
    requestId: snapshot.requestId,
    expectedEsimCount: snapshot.expectedEsimCount,
    items: snapshot.items.map((item) => ({
      providerDetailId: item.providerDetailId,
      providerOrderId: item.providerOrderId,
      planId: item.planId,
      wooLineItemIds: item.wooLineItemIds,
      iccid: item.iccid,
      phoneNumber: item.phoneNumber,
      qrCode: item.qrCode,
      shortLink: item.shortLink,
      data: item.data,
      validity: item.validity,
    })),
  });
}

function deliveryHash(snapshot: SecureEsimDeliverySnapshot): string {
  return createHash("sha256")
    .update(canonicalSnapshot(snapshot), "utf8")
    .digest("hex");
}

function lineItemIdsByPlan(
  expectedItems: readonly StoredPlanItem[],
): Map<string, number[]> {
  const result = new Map<string, number[]>();

  for (const item of expectedItems) {
    const current = result.get(item.ggg_plan_id) ?? [];
    result.set(item.ggg_plan_id, [
      ...new Set([...current, ...item.woo_line_item_ids]),
    ]);
  }

  return result;
}

function buildSecureItems(
  expectedItems: readonly StoredPlanItem[],
  deliveredEsims: readonly GigagoDeliveredEsim[],
): SecureEsimDeliveryItem[] {
  const lineItems = lineItemIdsByPlan(expectedItems);

  return deliveredEsims
    .map((item) => ({
      providerDetailId: positiveInteger(item.id),
      providerOrderId: normalizedString(item.order_id) ?? "",
      planId: normalizedString(item.ggg_plan_id) ?? "",
      wooLineItemIds:
        lineItems.get(normalizedString(item.ggg_plan_id) ?? "") ?? [],
      iccid: normalizedString(item.iccid) ?? "",
      phoneNumber: normalizedString(item.phone_number),
      qrCode: normalizedString(item.qr_code),
      shortLink: normalizedString(item.short_link),
      data: normalizedString(item.data) ?? "",
      validity: normalizedString(item.validity) ?? "",
    }))
    .sort((left, right) => {
      return (
        left.providerDetailId - right.providerDetailId ||
        left.planId.localeCompare(right.planId)
      );
    });
}

function maskIccid(value: string): string {
  const normalized = value.trim();

  if (normalized.length <= 8) {
    return normalized ? "****" : "";
  }

  return `${normalized.slice(0, 4)}****${normalized.slice(-4)}`;
}

export async function persistGigagoSecureDeliverySnapshot(input: {
  order: WooCommerceAdminOrder;
  mode: "live" | "demo";
  requestId: string;
  agencyOrders: readonly GigagoAgencyOrder[];
  deliveredEsims: readonly GigagoDeliveredEsim[];
  expectedItems?: readonly GigagoMappedOrderItem[];
  source: GigagoDeliverySnapshotSource;
}): Promise<GigagoSecureDeliveryAssessment> {
  const expectedItems = expectedPlanItems(input.order, input.expectedItems);
  const expectedEsimCount = expectedItems.reduce(
    (total, item) => total + positiveInteger(item.amount),
    0,
  );
  const completedEsimCount = input.agencyOrders.reduce(
    (total, order) => total + nonNegativeNumber(order.total_esim_completed),
    0,
  );
  const returnedEsimCount = input.deliveredEsims.length;
  const deliveredItems = input.deliveredEsims.filter(deliveredEsim);
  const deliveredEsimCount = deliveredItems.length;
  const agencyOrdersCompleted = completedAgencyOrders(input.agencyOrders);
  const allReturnedEsimsDelivered =
    returnedEsimCount > 0 && deliveredEsimCount === returnedEsimCount;
  const secureItems = buildSecureItems(expectedItems, deliveredItems);
  const allDeliveredEsimsInstallable =
    secureItems.length > 0 &&
    secureItems.every((item) => {
      return (
        item.providerDetailId > 0 &&
        Boolean(item.providerOrderId) &&
        Boolean(item.planId) &&
        Boolean(item.iccid) &&
        Boolean(item.qrCode || item.shortLink)
      );
    });
  const issues: string[] = [];

  if (input.mode !== "live") {
    issues.push("DEMO_MODE_NOT_CUSTOMER_DELIVERABLE");
  }

  if (!input.requestId.trim()) {
    issues.push("REQUEST_ID_MISSING");
  }

  if (expectedEsimCount <= 0) {
    issues.push("EXPECTED_ESIM_COUNT_MISSING");
  }

  if (!agencyOrdersCompleted) {
    issues.push("AGENCY_ORDER_NOT_COMPLETED");
  }

  if (completedEsimCount !== expectedEsimCount) {
    issues.push("COMPLETED_ESIM_COUNT_MISMATCH");
  }

  if (returnedEsimCount !== expectedEsimCount) {
    issues.push("RETURNED_ESIM_COUNT_MISMATCH");
  }

  if (deliveredEsimCount !== expectedEsimCount) {
    issues.push("DELIVERED_ESIM_COUNT_MISMATCH");
  }

  if (!allReturnedEsimsDelivered) {
    issues.push("NOT_ALL_RETURNED_ESIMS_DELIVERED");
  }

  if (!allDeliveredEsimsInstallable) {
    issues.push("DELIVERED_ESIM_INSTALLATION_DATA_MISSING");
  }

  const ready = issues.length === 0;

  if (!ready) {
    return {
      ready: false,
      duplicate: false,
      persisted: false,
      requestId: input.requestId,
      expectedEsimCount,
      completedEsimCount,
      returnedEsimCount,
      deliveredEsimCount,
      agencyOrdersCompleted,
      allReturnedEsimsDelivered,
      allDeliveredEsimsInstallable,
      deliveryHash: null,
      issues,
    };
  }

  const snapshot: SecureEsimDeliverySnapshot = {
    version: GIGAGO_DELIVERY_SNAPSHOT_VERSION,
    requestId: input.requestId,
    expectedEsimCount,
    items: secureItems,
  };
  const hash = deliveryHash(snapshot);
  const previousHash = readWooCommerceOrderMetaString(
    input.order,
    GIGAGO_DELIVERY_META.hash,
  );

  if (previousHash === hash) {
    return {
      ready: true,
      duplicate: true,
      persisted: false,
      requestId: input.requestId,
      expectedEsimCount,
      completedEsimCount,
      returnedEsimCount,
      deliveredEsimCount,
      agencyOrdersCompleted,
      allReturnedEsimsDelivered,
      allDeliveredEsimsInstallable,
      deliveryHash: hash,
      issues: [],
    };
  }

  const now = new Date().toISOString();
  const metadata = upsertWooCommerceOrderMeta(input.order, {
    [GIGAGO_DELIVERY_META.version]: GIGAGO_DELIVERY_SNAPSHOT_VERSION,
    [GIGAGO_DELIVERY_META.status]: "ready",
    [GIGAGO_DELIVERY_META.completedAt]: now,
    [GIGAGO_DELIVERY_META.requestId]: input.requestId,
    [GIGAGO_DELIVERY_META.count]: expectedEsimCount,
    [GIGAGO_DELIVERY_META.hash]: hash,
    [GIGAGO_DELIVERY_META.snapshot]: snapshot,
    [GIGAGO_DELIVERY_META.source]: input.source,
    [GIGAGO_DELIVERY_META.customerEmailStatus]: "pending",
    [GIGAGO_DELIVERY_META.customerEmailSentAt]: "",
    [GIGAGO_DELIVERY_META.customerEmailAttempts]: 0,
    [GIGAGO_DELIVERY_META.customerEmailError]: "",
    [GIGAGO_DELIVERY_META.customerEmailLastAttemptAt]: "",
    [GIGAGO_DELIVERY_META.customerEmailDeliveryHash]: "",
    [GIGAGO_DELIVERY_META.customerEmailActionId]: 0,
    [GIGAGO_DELIVERY_META.adminEmailStatus]: "pending",
    [GIGAGO_DELIVERY_META.adminEmailSentAt]: "",
    [GIGAGO_DELIVERY_META.adminEmailAttempts]: 0,
    [GIGAGO_DELIVERY_META.adminEmailError]: "",
    [GIGAGO_DELIVERY_META.adminEmailLastAttemptAt]: "",
    [GIGAGO_DELIVERY_META.adminEmailDeliveryHash]: "",
    [GIGAGO_DELIVERY_META.adminEmailActionId]: 0,
    [GIGAGO_DELIVERY_META.actionRequiredEmailStatus]: "pending",
    [GIGAGO_DELIVERY_META.actionRequiredEmailSentAt]: "",
    [GIGAGO_DELIVERY_META.actionRequiredEmailAttempts]: 0,
    [GIGAGO_DELIVERY_META.actionRequiredEmailError]: "",
    [GIGAGO_DELIVERY_META.actionRequiredEmailLastAttemptAt]: "",
    [GIGAGO_DELIVERY_META.actionRequiredEmailHash]: "",
    [GIGAGO_DELIVERY_META.actionRequiredEmailActionId]: 0,
    [GIGAGO_DELIVERY_META.actionRequiredEmailReason]: "",
    [GIGAGO_DELIVERY_META.mailOrchestrationVersion]: "f05.1b2-v1",
    [GIGAGO_DELIVERY_META.mailOrchestrationStatus]: "requested",
    [GIGAGO_DELIVERY_META.mailOrchestrationRequestedAt]: now,
    [GIGAGO_DELIVERY_META.mailOrchestrationRequestedHash]: hash,
    [GIGAGO_DELIVERY_META.mailOrchestrationError]: "",
    _ysim_gigago_recovery_state: "succeeded",
    _ysim_gigago_auto_result: "delivered",
    _ysim_gigago_auto_error: "",
  });

  await updateWooCommerceAdminOrder(input.order.id, {
    meta_data: metadata,
  });

  return {
    ready: true,
    duplicate: false,
    persisted: true,
    requestId: input.requestId,
    expectedEsimCount,
    completedEsimCount,
    returnedEsimCount,
    deliveredEsimCount,
    agencyOrdersCompleted,
    allReturnedEsimsDelivered,
    allDeliveredEsimsInstallable,
    deliveryHash: hash,
    issues: [],
  };
}

export async function getGigagoSecureDeliveryStatus(
  orderId: number,
): Promise<GigagoSecureDeliveryStatus> {
  const order = await getWooCommerceAdminOrder(orderId);
  const rawSnapshot = readWooCommerceOrderMeta(
    order,
    GIGAGO_DELIVERY_META.snapshot,
  );
  const snapshot =
    rawSnapshot &&
    typeof rawSnapshot === "object" &&
    !Array.isArray(rawSnapshot)
      ? (rawSnapshot as Partial<SecureEsimDeliverySnapshot>)
      : null;
  const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
  const deliveryHash = readWooCommerceOrderMetaString(
    order,
    GIGAGO_DELIVERY_META.hash,
  );
  const customerEmailStatus = readWooCommerceOrderMetaString(
    order,
    GIGAGO_DELIVERY_META.customerEmailStatus,
  );
  const customerEmailAttempts = positiveInteger(
    readWooCommerceOrderMeta(
      order,
      GIGAGO_DELIVERY_META.customerEmailAttempts,
    ),
  );
  const customerEmailDeliveryHash = readWooCommerceOrderMetaString(
    order,
    GIGAGO_DELIVERY_META.customerEmailDeliveryHash,
  );
  const mailOrchestrationStatus = readWooCommerceOrderMetaString(
    order,
    GIGAGO_DELIVERY_META.mailOrchestrationStatus,
  );
  const mailOrchestrationRequestedHash = readWooCommerceOrderMetaString(
    order,
    GIGAGO_DELIVERY_META.mailOrchestrationRequestedHash,
  );
  const deliveredCount = positiveInteger(
    readWooCommerceOrderMeta(order, GIGAGO_DELIVERY_META.count),
  );
  const deliveryStatus = readWooCommerceOrderMetaString(
    order,
    GIGAGO_DELIVERY_META.status,
  );
  const deliveryTerminal = assessGigagoFulfillmentTerminal({
    orderStatus: order.status,
    deliveryStatus,
    deliveryHash,
    deliveredCount,
    customerEmailStatus,
    customerEmailAttempts,
    customerEmailDeliveryHash,
    mailOrchestrationStatus,
    mailOrchestrationRequestedHash,
  });

  return {
    orderId,
    orderStatus: order.status,
    version: readWooCommerceOrderMetaString(
      order,
      GIGAGO_DELIVERY_META.version,
    ),
    status: deliveryStatus,
    requestId: readWooCommerceOrderMetaString(
      order,
      GIGAGO_DELIVERY_META.requestId,
    ),
    completedAt: readWooCommerceOrderMetaString(
      order,
      GIGAGO_DELIVERY_META.completedAt,
    ),
    deliveryHash,
    deliveredCount,
    source: readWooCommerceOrderMetaString(order, GIGAGO_DELIVERY_META.source),
    customerEmailStatus,
    customerEmailAttempts,
    customerEmailDeliveryHashMatches:
      Boolean(deliveryHash) && customerEmailDeliveryHash === deliveryHash,
    adminEmailStatus: readWooCommerceOrderMetaString(
      order,
      GIGAGO_DELIVERY_META.adminEmailStatus,
    ),
    mailOrchestrationVersion: readWooCommerceOrderMetaString(
      order,
      GIGAGO_DELIVERY_META.mailOrchestrationVersion,
    ),
    mailOrchestrationStatus,
    mailOrchestrationRequestedAt: readWooCommerceOrderMetaString(
      order,
      GIGAGO_DELIVERY_META.mailOrchestrationRequestedAt,
    ),
    mailOrchestrationRequestMatchesDeliveryHash:
      Boolean(deliveryHash) &&
      deliveryHash === mailOrchestrationRequestedHash,
    deliveryTerminal,
    items: items.flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return [];
      }

      const record = item as unknown as Record<string, unknown>;
      const planId = normalizedString(record.planId) ?? "";
      const iccid = normalizedString(record.iccid) ?? "";

      return [
        {
          planId,
          maskedIccid: maskIccid(iccid),
          hasQrCode: Boolean(normalizedString(record.qrCode)),
          hasShortLink: Boolean(normalizedString(record.shortLink)),
          hasPhoneNumber: Boolean(normalizedString(record.phoneNumber)),
        },
      ];
    }),
  };
}
