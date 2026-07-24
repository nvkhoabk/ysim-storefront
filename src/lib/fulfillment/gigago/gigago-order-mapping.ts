import type { WooCommerceAdminOrder } from "@/lib/woocommerce/order-admin-api";

import type { GigagoCreateOrderItem, GigagoPackage } from "./gigago.types";

export interface GigagoMappedOrderItem extends GigagoCreateOrderItem {
  wooLineItemIds: number[];
  wooLineItemNames: string[];
  packageName: string;
  packagePrice: number;
}

export interface GigagoOrderMappingIssue {
  code:
    | "ORDER_HAS_NO_LINE_ITEMS"
    | "LINE_ITEM_SKU_MISSING"
    | "LINE_ITEM_QUANTITY_INVALID"
    | "GIGAGO_PLAN_NOT_FOUND"
    | "DEMO_PLAN_NOT_FOUND";
  message: string;
  lineItemId?: number;
  sku?: string;
}

export interface GigagoOrderMappingResult {
  items: GigagoMappedOrderItem[];
  issues: GigagoOrderMappingIssue[];
}

function packageIndex(
  packages: readonly GigagoPackage[],
): Map<string, GigagoPackage> {
  return new Map(packages.map((item) => [item.ggg_plan_id.trim(), item]));
}

export function mapWooOrderToGigagoPlans(
  order: WooCommerceAdminOrder,
  packages: readonly GigagoPackage[],
): GigagoOrderMappingResult {
  const lineItems = order.line_items ?? [];
  const plans = packageIndex(packages);
  const grouped = new Map<string, GigagoMappedOrderItem>();
  const issues: GigagoOrderMappingIssue[] = [];

  if (lineItems.length === 0) {
    return {
      items: [],
      issues: [
        {
          code: "ORDER_HAS_NO_LINE_ITEMS",
          message: "WooCommerce order không có line item để fulfillment.",
        },
      ],
    };
  }

  for (const lineItem of lineItems) {
    const sku = lineItem.sku?.trim() ?? "";

    if (!sku) {
      issues.push({
        code: "LINE_ITEM_SKU_MISSING",
        message: `Line item ${lineItem.id} chưa có SKU.`,
        lineItemId: lineItem.id,
      });
      continue;
    }

    if (!Number.isInteger(lineItem.quantity) || lineItem.quantity <= 0) {
      issues.push({
        code: "LINE_ITEM_QUANTITY_INVALID",
        message: `Line item ${lineItem.id} có quantity không hợp lệ.`,
        lineItemId: lineItem.id,
        sku,
      });
      continue;
    }

    const matchedPackage = plans.get(sku);

    if (!matchedPackage) {
      issues.push({
        code: "GIGAGO_PLAN_NOT_FOUND",
        message: `Không tìm thấy Gigago plan trùng chính xác SKU ${sku}.`,
        lineItemId: lineItem.id,
        sku,
      });
      continue;
    }

    const current = grouped.get(matchedPackage.ggg_plan_id);

    if (current) {
      current.amount += lineItem.quantity;
      current.wooLineItemIds.push(lineItem.id);
      current.wooLineItemNames.push(lineItem.name);
      continue;
    }

    grouped.set(matchedPackage.ggg_plan_id, {
      ggg_plan_id: matchedPackage.ggg_plan_id,
      amount: lineItem.quantity,
      wooLineItemIds: [lineItem.id],
      wooLineItemNames: [lineItem.name],
      packageName: matchedPackage.name,
      packagePrice: matchedPackage.price,
    });
  }

  return {
    items: [...grouped.values()],
    issues,
  };
}

export function mapGigagoDemoPlan(
  packages: readonly GigagoPackage[],
  planId: string,
): GigagoOrderMappingResult {
  const matchedPackage = packageIndex(packages).get(planId);

  if (!matchedPackage) {
    return {
      items: [],
      issues: [
        {
          code: "DEMO_PLAN_NOT_FOUND",
          message: `Không tìm thấy Gigago demo plan ${planId}.`,
          sku: planId,
        },
      ],
    };
  }

  return {
    items: [
      {
        ggg_plan_id: matchedPackage.ggg_plan_id,
        amount: 1,
        wooLineItemIds: [],
        wooLineItemNames: ["Gigago sandbox demo"],
        packageName: matchedPackage.name,
        packagePrice: matchedPackage.price,
      },
    ],
    issues: [],
  };
}
