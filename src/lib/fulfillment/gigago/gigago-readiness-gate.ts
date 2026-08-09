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
import {
  mapWooOrderToGigagoPlans,
  type GigagoMappedOrderItem,
  type GigagoOrderMappingIssue,
  type GigagoOrderMappingResult,
} from "./gigago-order-mapping";
import type { GigagoPackage } from "./gigago.types";

export type GigagoReadinessGateMode = "disabled" | "audit" | "block";
export type GigagoReadinessStatus = "skipped" | "ready" | "blocked";

export interface GigagoReadinessSnapshotItem {
  ggg_plan_id: string;
  amount: number;
  wooLineItemIds: number[];
  wooLineItemNames: string[];
  packageName: string;
  packagePrice: number;
}

export interface GigagoReadinessSnapshot {
  version: "f04.3-v1";
  orderId: number;
  environment: string;
  checkedAt: string;
  paymentProvider: string | null;
  mappingHash: string;
  lineItems: Array<{
    id: number;
    productId: number | null;
    variationId: number | null;
    sku: string;
    quantity: number;
  }>;
  items: GigagoReadinessSnapshotItem[];
}

export interface GigagoReadinessResult {
  orderId: number;
  mode: GigagoReadinessGateMode;
  status: GigagoReadinessStatus;
  ready: boolean;
  environment: string;
  checkedAt: string;
  mappingHash: string | null;
  items: GigagoMappedOrderItem[];
  issues: GigagoOrderMappingIssue[];
  snapshot: GigagoReadinessSnapshot | null;
  persisted: boolean;
}

export class GigagoReadinessError extends Error {
  readonly code = "FULFILLMENT_MAPPING_INVALID";
  readonly status = 422;
  readonly details: GigagoReadinessResult;

  constructor(result: GigagoReadinessResult) {
    super("Sản phẩm chưa sẵn sàng để phát hành eSIM.");
    this.name = "GigagoReadinessError";
    this.details = result;
  }
}

export const GIGAGO_READINESS_META = {
  status: "_ysim_gigago_readiness_status",
  version: "_ysim_gigago_readiness_version",
  checkedAt: "_ysim_gigago_readiness_checked_at",
  environment: "_ysim_gigago_readiness_environment",
  mappingHash: "_ysim_gigago_mapping_hash",
  snapshot: "_ysim_gigago_plan_snapshot",
  issues: "_ysim_gigago_mapping_issues",
  paymentProvider: "_ysim_gigago_readiness_payment_provider",
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

export function getGigagoReadinessGateMode(): GigagoReadinessGateMode {
  const configured =
    process.env.GIGAGO_READINESS_GATE_MODE?.trim().toLowerCase();

  if (configured === "audit" || configured === "block") {
    return configured;
  }

  return "disabled";
}

function stableMappingHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value), "utf8")
    .digest("hex");
}

function snapshotLineItems(order: WooCommerceAdminOrder) {
  return (order.line_items ?? []).map((lineItem) => {
    const extended = lineItem as typeof lineItem & {
      product_id?: number;
      variation_id?: number;
    };

    return {
      id: lineItem.id,
      productId: positiveInteger(extended.product_id),
      variationId: positiveInteger(extended.variation_id),
      sku: lineItem.sku?.trim() ?? "",
      quantity: lineItem.quantity,
    };
  });
}

function createSnapshot({
  order,
  environment,
  paymentProvider,
  items,
  checkedAt,
}: {
  order: WooCommerceAdminOrder;
  environment: string;
  paymentProvider: string | null;
  items: GigagoMappedOrderItem[];
  checkedAt: string;
}): GigagoReadinessSnapshot {
  const lineItems = snapshotLineItems(order);
  const snapshotItems = items.map((item) => ({
    ggg_plan_id: item.ggg_plan_id,
    amount: item.amount,
    wooLineItemIds: [...item.wooLineItemIds],
    wooLineItemNames: [...item.wooLineItemNames],
    packageName: item.packageName,
    packagePrice: item.packagePrice,
  }));
  const hashInput = {
    version: "f04.3-v1",
    orderId: order.id,
    environment,
    lineItems,
    items: snapshotItems,
  };

  return {
    version: "f04.3-v1",
    orderId: order.id,
    environment,
    checkedAt,
    paymentProvider,
    mappingHash: stableMappingHash(hashInput),
    lineItems,
    items: snapshotItems,
  };
}

async function persistReadiness(
  order: WooCommerceAdminOrder,
  result: GigagoReadinessResult,
): Promise<void> {
  const meta = upsertWooCommerceOrderMeta(order, {
    [GIGAGO_READINESS_META.status]: result.status,
    [GIGAGO_READINESS_META.version]: "f04.3-v1",
    [GIGAGO_READINESS_META.checkedAt]: result.checkedAt,
    [GIGAGO_READINESS_META.environment]: result.environment,
    [GIGAGO_READINESS_META.mappingHash]: result.mappingHash ?? "",
    [GIGAGO_READINESS_META.snapshot]: result.snapshot ?? null,
    [GIGAGO_READINESS_META.issues]: result.issues,
    [GIGAGO_READINESS_META.paymentProvider]:
      result.snapshot?.paymentProvider ?? "",
  });

  await updateWooCommerceAdminOrder(order.id, { meta_data: meta });
}

export async function checkGigagoFulfillmentReadiness(
  orderId: number,
  options: {
    paymentProvider?: string | null;
    persist?: boolean;
    modeOverride?: GigagoReadinessGateMode;
  } = {},
): Promise<GigagoReadinessResult> {
  const mode = options.modeOverride ?? getGigagoReadinessGateMode();
  const order = await getWooCommerceAdminOrder(orderId);
  const config = getGigagoConfig();
  const checkedAt = new Date().toISOString();

  if (mode === "disabled") {
    return {
      orderId,
      mode,
      status: "skipped",
      ready: false,
      environment: config.environment,
      checkedAt,
      mappingHash: null,
      items: [],
      issues: [],
      snapshot: null,
      persisted: false,
    };
  }

  const packages = await new GigagoClient(config).getPackages({}, "vi");
  const mapping = mapWooOrderToGigagoPlans(order, packages);
  const ready = mapping.issues.length === 0 && mapping.items.length > 0;
  const snapshot = ready
    ? createSnapshot({
        order,
        environment: config.environment,
        paymentProvider: options.paymentProvider?.trim() || null,
        items: mapping.items,
        checkedAt,
      })
    : null;
  const result: GigagoReadinessResult = {
    orderId,
    mode,
    status: ready ? "ready" : "blocked",
    ready,
    environment: config.environment,
    checkedAt,
    mappingHash: snapshot?.mappingHash ?? null,
    items: mapping.items,
    issues: mapping.issues,
    snapshot,
    persisted: options.persist !== false,
  };

  if (options.persist !== false) {
    await persistReadiness(order, result);
  }

  return result;
}

export async function enforceGigagoReadinessBeforePayment(input: {
  orderId: number;
  paymentProvider: string;
}): Promise<GigagoReadinessResult> {
  const result = await checkGigagoFulfillmentReadiness(input.orderId, {
    paymentProvider: input.paymentProvider,
    persist: true,
  });

  if (result.mode === "block" && !result.ready) {
    throw new GigagoReadinessError(result);
  }

  return result;
}

function parseSnapshot(value: unknown): GigagoReadinessSnapshot | null {
  if (!isRecord(value) || value.version !== "f04.3-v1") {
    return null;
  }

  if (
    !positiveInteger(value.orderId) ||
    typeof value.environment !== "string" ||
    typeof value.mappingHash !== "string" ||
    !Array.isArray(value.items)
  ) {
    return null;
  }

  const items: GigagoReadinessSnapshotItem[] = [];

  for (const candidate of value.items) {
    if (
      !isRecord(candidate) ||
      typeof candidate.ggg_plan_id !== "string" ||
      !positiveInteger(candidate.amount) ||
      !Array.isArray(candidate.wooLineItemIds) ||
      !Array.isArray(candidate.wooLineItemNames)
    ) {
      return null;
    }

    items.push({
      ggg_plan_id: candidate.ggg_plan_id,
      amount: candidate.amount as number,
      wooLineItemIds: candidate.wooLineItemIds.filter(
        (item): item is number => positiveInteger(item) !== null,
      ),
      wooLineItemNames: candidate.wooLineItemNames.filter(
        (item): item is string => typeof item === "string",
      ),
      packageName:
        typeof candidate.packageName === "string"
          ? candidate.packageName
          : candidate.ggg_plan_id,
      packagePrice:
        typeof candidate.packagePrice === "number" ? candidate.packagePrice : 0,
    });
  }

  return {
    version: "f04.3-v1",
    orderId: value.orderId as number,
    environment: value.environment,
    checkedAt: typeof value.checkedAt === "string" ? value.checkedAt : "",
    paymentProvider:
      typeof value.paymentProvider === "string" ? value.paymentProvider : null,
    mappingHash: value.mappingHash,
    lineItems: Array.isArray(value.lineItems)
      ? (value.lineItems as GigagoReadinessSnapshot["lineItems"])
      : [],
    items,
  };
}

export function readGigagoReadinessSnapshot(
  order: WooCommerceAdminOrder,
): GigagoReadinessSnapshot | null {
  const status = readWooCommerceOrderMetaString(
    order,
    GIGAGO_READINESS_META.status,
  );

  if (status !== "ready") {
    return null;
  }

  return parseSnapshot(
    readWooCommerceOrderMeta(order, GIGAGO_READINESS_META.snapshot),
  );
}

export function resolveGigagoMappingForOrder(
  order: WooCommerceAdminOrder,
  packages: readonly GigagoPackage[],
): GigagoOrderMappingResult {
  const snapshot = readGigagoReadinessSnapshot(order);

  if (
    snapshot &&
    snapshot.orderId === order.id &&
    snapshot.environment === getGigagoConfig().environment
  ) {
    return {
      items: snapshot.items.map((item) => ({ ...item })),
      issues: [],
    };
  }

  return mapWooOrderToGigagoPlans(order, packages);
}

export async function getGigagoReadinessStatus(orderId: number) {
  const order = await getWooCommerceAdminOrder(orderId);
  const snapshot = readGigagoReadinessSnapshot(order);

  return {
    orderId,
    status:
      readWooCommerceOrderMetaString(order, GIGAGO_READINESS_META.status) ??
      "missing",
    version:
      readWooCommerceOrderMetaString(order, GIGAGO_READINESS_META.version) ??
      null,
    checkedAt:
      readWooCommerceOrderMetaString(order, GIGAGO_READINESS_META.checkedAt) ??
      null,
    environment:
      readWooCommerceOrderMetaString(
        order,
        GIGAGO_READINESS_META.environment,
      ) ?? null,
    mappingHash:
      readWooCommerceOrderMetaString(
        order,
        GIGAGO_READINESS_META.mappingHash,
      ) ?? null,
    snapshotPresent: Boolean(snapshot),
    itemCount: snapshot?.items.length ?? 0,
    issues: readWooCommerceOrderMeta(order, GIGAGO_READINESS_META.issues) ?? [],
  };
}
