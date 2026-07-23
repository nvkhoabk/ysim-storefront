import type {
  GPayGatewayQueryOrderResult,
} from "./gateway-types";

import {
  normalizeGPayGatewayStatus,
  type GPayGatewayCallbackVerification,
  type GPayGatewayNormalizedStatus,
} from "./gateway-callback";

import {
  queryGPayGatewayOrder,
} from "./gateway-query-order";

export type GPayCallbackReconciliationMode =
  | "verify-only"
  | "query";

export interface GPayCallbackReconciliationResult {
  mode:
    GPayCallbackReconciliationMode;
  attempted: boolean;
  confirmed: boolean | null;
  reason: string;
  callbackStatus:
    GPayGatewayNormalizedStatus;
  queriedStatus?:
    GPayGatewayNormalizedStatus;
  merchantOrderIdMatches?:
    boolean;
  gpayBillIdMatches?:
    boolean;
  statusCompatible?:
    boolean;
  embedDataMatches?:
    boolean;
  query?: {
    status?: string;
    gpayTransactionId?: string;
    userPaymentMethod?: string;
    queriedAt: string;
  };
}

export function getGPayCallbackReconciliationMode():
GPayCallbackReconciliationMode {
  return process.env
    .GPAY_CALLBACK_RECONCILIATION_MODE ===
    "query"
    ? "query"
    : "verify-only";
}

function statusesAreCompatible(
  callbackStatus:
    GPayGatewayNormalizedStatus,
  queriedStatus:
    GPayGatewayNormalizedStatus,
): boolean {
  if (
    callbackStatus ===
      "PENDING" ||
    queriedStatus ===
      "PENDING"
  ) {
    return true;
  }

  return (
    callbackStatus ===
    queriedStatus
  );
}

function safeQueryView(
  query:
    GPayGatewayQueryOrderResult,
) {
  return {
    status:
      query.status,

    gpayTransactionId:
      query
        .gpayTransactionId,

    userPaymentMethod:
      query
        .userPaymentMethod,

    queriedAt:
      query.queriedAt,
  };
}

export async function reconcileVerifiedGPayCallback(
  verification:
    GPayGatewayCallbackVerification,
): Promise<GPayCallbackReconciliationResult> {
  const mode =
    getGPayCallbackReconciliationMode();

  if (
    !verification
      .verified
  ) {
    return {
      mode,
      attempted:
        false,
      confirmed:
        false,
      reason:
        "CALLBACK_SIGNATURE_INVALID",
      callbackStatus:
        verification
          .normalizedStatus,
    };
  }

  if (
    mode ===
    "verify-only"
  ) {
    return {
      mode,
      attempted:
        false,
      confirmed:
        null,
      reason:
        "SIGNATURE_VERIFIED_QUERY_DISABLED",
      callbackStatus:
        verification
          .normalizedStatus,
    };
  }

  const query =
    await queryGPayGatewayOrder({
      gpayBillId:
        verification
          .callback
          .gpayBillId,

      merchantOrderId:
        verification
          .callback
          .merchantOrderId,
    });

  const queriedStatus =
    normalizeGPayGatewayStatus(
      query.status ??
      "",
    );

  const merchantOrderIdMatches =
    query
      .merchantOrderId ===
    verification
      .callback
      .merchantOrderId;

  const gpayBillIdMatches =
    query
      .gpayBillId ===
    verification
      .callback
      .gpayBillId;

  const statusCompatible =
    statusesAreCompatible(
      verification
        .normalizedStatus,
      queriedStatus,
    );

  const embedDataMatches =
    query.embedData ==
      null ||
    query.embedData ===
      verification
        .callback
        .embedData;

  const confirmed =
    merchantOrderIdMatches &&
    gpayBillIdMatches &&
    statusCompatible &&
    embedDataMatches;

  return {
    mode,
    attempted:
      true,
    confirmed,
    reason:
      confirmed
        ? "QUERY_RECONCILIATION_CONFIRMED"
        : "QUERY_RECONCILIATION_MISMATCH",

    callbackStatus:
      verification
        .normalizedStatus,

    queriedStatus,

    merchantOrderIdMatches,

    gpayBillIdMatches,

    statusCompatible,

    embedDataMatches,

    query:
      safeQueryView(
        query,
      ),
  };
}
