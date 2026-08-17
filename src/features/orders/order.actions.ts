"use server";

import {
  lookupSecureOrderResult,
  SecureOrderLookupError,
} from "@/features/orders/candidate/secure-order-result-mapper";

import type { SecureOrderLookupResponse } from "@/types/view-models/order-route-candidate";

export async function lookupSecureOrder({
  orderId,
  orderKey,
}: {
  orderId: number;
  orderKey: string;
}): Promise<SecureOrderLookupResponse> {
  if (
    !Number.isInteger(orderId) ||
    orderId <= 0 ||
    typeof orderKey !== "string" ||
    orderKey.trim().length < 8 ||
    orderKey.length > 200
  ) {
    throw new Error("Không thể xác minh quyền truy cập đơn hàng.");
  }

  try {
    return await lookupSecureOrderResult({
      orderId,
      orderKey: orderKey.trim(),
    });
  } catch (error) {
    if (error instanceof SecureOrderLookupError) {
      throw new Error("Không thể xác minh quyền truy cập đơn hàng.");
    }

    throw error;
  }
}
