import type { GigagoFulfillmentSubmission } from "./gigago-fulfillment-service";

export interface GigagoDeliveryAssessment {
  delivered: boolean;
  expectedEsimCount: number;
  completedEsimCount: number;
  returnedEsimCount: number;
  deliveredEsimCount: number;
  agencyOrdersCompleted: boolean;
  allReturnedEsimsDelivered: boolean;
}

function positiveInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function nonNegativeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function assessGigagoSubmissionDelivery(
  submission: GigagoFulfillmentSubmission,
): GigagoDeliveryAssessment {
  const expectedEsimCount = submission.preview.items.reduce(
    (total, item) => total + positiveInteger(item.amount),
    0,
  );

  const agencyOrdersCompleted =
    submission.snapshot.agencyOrders.length > 0 &&
    submission.snapshot.agencyOrders.every((order) => {
      return (
        Number(order.order_status) === 1 ||
        String(order.order_status_name).trim().toLowerCase() === "completed"
      );
    });

  const completedEsimCount = submission.snapshot.agencyOrders.reduce(
    (total, order) => total + nonNegativeNumber(order.total_esim_completed),
    0,
  );

  const returnedEsimCount = submission.snapshot.deliveredEsims.length;
  const deliveredEsimCount = submission.snapshot.deliveredEsims.filter(
    (esim) => {
      return (
        Number(esim.status) === 1 ||
        String(esim.status_name).trim().toLowerCase() === "delivered"
      );
    },
  ).length;

  const allReturnedEsimsDelivered =
    returnedEsimCount > 0 && deliveredEsimCount === returnedEsimCount;

  const delivered =
    expectedEsimCount > 0 &&
    agencyOrdersCompleted &&
    allReturnedEsimsDelivered &&
    completedEsimCount === expectedEsimCount &&
    returnedEsimCount === expectedEsimCount &&
    deliveredEsimCount === expectedEsimCount;

  return {
    delivered,
    expectedEsimCount,
    completedEsimCount,
    returnedEsimCount,
    deliveredEsimCount,
    agencyOrdersCompleted,
    allReturnedEsimsDelivered,
  };
}
