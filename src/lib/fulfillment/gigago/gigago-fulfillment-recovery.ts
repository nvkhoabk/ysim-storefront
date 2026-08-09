import {
  getWooCommerceAdminOrder,
  type WooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";
import {
  readWooCommerceOrderMetaString,
  updateWooCommerceAdminOrder,
  upsertWooCommerceOrderMeta,
} from "@/lib/woocommerce/order-admin-write-api";

import { assessGigagoSubmissionDelivery } from "./gigago-delivery-assessment";
import {
  submitGigagoFulfillment,
  type GigagoFulfillmentMode,
  type GigagoFulfillmentSubmission,
} from "./gigago-fulfillment-service";
import { getGigagoReadinessStatus } from "./gigago-readiness-gate";

export type PaymentLifecycleState = "pending" | "succeeded" | "unknown";
export type FulfillmentLifecycleState =
  "not-started" | "processing" | "succeeded" | "failed";

const RECOVERY_META = {
  state: "_ysim_gigago_recovery_state",
  attempts: "_ysim_gigago_recovery_attempts",
  lastAttemptedAt: "_ysim_gigago_recovery_last_attempted_at",
  lastError: "_ysim_gigago_recovery_last_error",
  lastResult: "_ysim_gigago_recovery_last_result",
} as const;

function orderPaid(order: WooCommerceAdminOrder): boolean {
  return (
    Boolean(order.date_paid) ||
    Boolean(order.date_paid_gmt) ||
    order.status === "processing" ||
    order.status === "completed"
  );
}

function metaInteger(order: WooCommerceAdminOrder, key: string): number {
  const raw = readWooCommerceOrderMetaString(order, key);
  const value = raw ? Number.parseInt(raw, 10) : 0;

  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function parseFulfillmentLifecycleState(
  value: string | null,
): FulfillmentLifecycleState | null {
  switch (value) {
    case "not-started":
    case "processing":
    case "succeeded":
    case "failed":
      return value;

    default:
      return null;
  }
}

function normalizedMetaValue(value: string | null): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

export async function getGigagoFulfillmentLifecycle(orderId: number) {
  const order = await getWooCommerceAdminOrder(orderId);
  const paid = orderPaid(order);
  const reconciliationState = readWooCommerceOrderMetaString(
    order,
    "_ysim_gpay_reconciliation_state",
  );
  const paymentMeta = readWooCommerceOrderMetaString(
    order,
    "_ysim_payment_status",
  );
  const requestId = readWooCommerceOrderMetaString(
    order,
    "_ysim_gigago_request_id",
  );
  const recoveryState = parseFulfillmentLifecycleState(
    readWooCommerceOrderMetaString(order, RECOVERY_META.state),
  );
  const autoResult = normalizedMetaValue(
    readWooCommerceOrderMetaString(order, "_ysim_gigago_auto_result"),
  );
  const autoError = readWooCommerceOrderMetaString(
    order,
    "_ysim_gigago_auto_error",
  );

  const paymentState: PaymentLifecycleState =
    paid && paymentMeta === "SUCCESS"
      ? "succeeded"
      : paid
        ? "unknown"
        : "pending";

  let fulfillmentState: FulfillmentLifecycleState;

  if (recoveryState) {
    fulfillmentState = recoveryState;
  } else if (
    autoError ||
    (paymentMeta === "SUCCESS" && reconciliationState === "failed")
  ) {
    fulfillmentState = "failed";
  } else if (autoResult === "delivered" || autoResult === "completed") {
    fulfillmentState = "succeeded";
  } else if (
    requestId ||
    autoResult === "success" ||
    autoResult === "submitted" ||
    autoResult === "processing"
  ) {
    // A successful submit only proves that Gigago accepted or already knows
    // the deterministic request. It does not prove that every requested eSIM
    // has reached Delivered state. A recovery/status refresh must confirm that.
    fulfillmentState = "processing";
  } else {
    fulfillmentState = "not-started";
  }

  const overallState =
    paymentState !== "succeeded"
      ? "awaiting-payment"
      : fulfillmentState === "succeeded"
        ? "completed"
        : fulfillmentState === "failed"
          ? "action-required"
          : fulfillmentState === "processing"
            ? "fulfillment-processing"
            : "awaiting-fulfillment";

  return {
    orderId,
    paymentState,
    fulfillmentState,
    overallState,
    orderStatus: order.status,
    datePaidPresent: Boolean(order.date_paid || order.date_paid_gmt),
    paymentStatus: paymentMeta,
    requestId,
    attempts: metaInteger(order, RECOVERY_META.attempts),
    lastAttemptedAt: readWooCommerceOrderMetaString(
      order,
      RECOVERY_META.lastAttemptedAt,
    ),
    lastError: readWooCommerceOrderMetaString(order, RECOVERY_META.lastError),
    readiness: await getGigagoReadinessStatus(orderId),
  };
}

async function persistRecoveryState(
  order: WooCommerceAdminOrder,
  entries: Record<string, unknown>,
): Promise<void> {
  await updateWooCommerceAdminOrder(order.id, {
    meta_data: upsertWooCommerceOrderMeta(order, entries),
  });
}

export async function retryGigagoFulfillment(input: {
  orderId: number;
  mode?: GigagoFulfillmentMode;
}): Promise<{
  lifecycle: Awaited<ReturnType<typeof getGigagoFulfillmentLifecycle>>;
  submission: GigagoFulfillmentSubmission;
}> {
  const mode = input.mode ?? "live";
  const order = await getWooCommerceAdminOrder(input.orderId);
  const paymentStatus = readWooCommerceOrderMetaString(
    order,
    "_ysim_payment_status",
  );

  if (!orderPaid(order) || paymentStatus !== "SUCCESS") {
    const error = new Error(
      "Chỉ được retry fulfillment khi Woo order đã paid và payment status là SUCCESS.",
    ) as Error & { code: string; status: number };
    error.name = "GigagoFulfillmentRecoveryError";
    error.code = "PAYMENT_NOT_CONFIRMED";
    error.status = 422;
    throw error;
  }

  const attempts = metaInteger(order, RECOVERY_META.attempts) + 1;
  const attemptedAt = new Date().toISOString();

  await persistRecoveryState(order, {
    [RECOVERY_META.state]: "processing",
    [RECOVERY_META.attempts]: attempts,
    [RECOVERY_META.lastAttemptedAt]: attemptedAt,
    [RECOVERY_META.lastError]: "",
  });

  try {
    const submission = await submitGigagoFulfillment(input.orderId, mode);
    const delivery = assessGigagoSubmissionDelivery(submission);
    const nextState: FulfillmentLifecycleState = delivery.delivered
      ? "succeeded"
      : "processing";
    const refreshed = await getWooCommerceAdminOrder(input.orderId);

    await persistRecoveryState(refreshed, {
      [RECOVERY_META.state]: nextState,
      [RECOVERY_META.attempts]: attempts,
      [RECOVERY_META.lastAttemptedAt]: attemptedAt,
      [RECOVERY_META.lastError]: "",
      [RECOVERY_META.lastResult]: {
        created: submission.created,
        recovered: submission.recovered,
        requestId: submission.preview.requestId,
        agencyOrderCount: submission.snapshot.agencyOrders.length,
        providerReturnedEsimCount: delivery.returnedEsimCount,
        providerDelivered: delivery.delivered,
        expectedEsimCount: delivery.expectedEsimCount,
        completedEsimCount: delivery.completedEsimCount,
        returnedEsimCount: delivery.returnedEsimCount,
        deliveredEsimCount: delivery.deliveredEsimCount,
        agencyOrdersCompleted: delivery.agencyOrdersCompleted,
        allReturnedEsimsDelivered: delivery.allReturnedEsimsDelivered,
        agencyOrderStatuses: submission.snapshot.agencyOrders.map(
          (agencyOrder) => agencyOrder.order_status_name,
        ),
        esimStatuses: submission.snapshot.deliveredEsims.map(
          (esim) => esim.status_name,
        ),
      },
    });

    return {
      lifecycle: await getGigagoFulfillmentLifecycle(input.orderId),
      submission,
    };
  } catch (error) {
    const refreshed = await getWooCommerceAdminOrder(input.orderId);
    const message = error instanceof Error ? error.message : String(error);

    await persistRecoveryState(refreshed, {
      [RECOVERY_META.state]: "failed",
      [RECOVERY_META.attempts]: attempts,
      [RECOVERY_META.lastAttemptedAt]: attemptedAt,
      [RECOVERY_META.lastError]: message,
    });

    throw error;
  }
}
