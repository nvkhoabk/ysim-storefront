import type {
  GPayCallbackReconciliationResult,
  GPayGatewayCallbackVerification,
} from "@/lib/payment/adapters/gpay";

import {
  getGPayCommerceAutomationMode,
  runGPayCommerceAutomation,
  type GPayCommerceAutomationMode,
  type GPayCommerceAutomationResult,
} from "./gpay-commerce-automation";
import {
  isGPayImmediateSuccessDurabilityCandidate,
  persistGPayFastAckDurability,
  type PersistGPayFastAckDurabilityResult,
} from "./gpay-delayed-reconciliation";

export const GPAY_FAST_ACK_VERSION = "f06.1b.1-v1" as const;

export interface GPayFastAckPreparationResult {
  version: typeof GPAY_FAST_ACK_VERSION;
  automationMode: Exclude<GPayCommerceAutomationMode, "disabled">;
  paymentAutomation: GPayCommerceAutomationResult;
  durability: PersistGPayFastAckDurabilityResult;
}

export function isGPayFastAckEnabled(): boolean {
  return process.env.GPAY_FAST_ACK_ENABLED?.trim().toLowerCase() === "true";
}

export function isGPayFastAckCandidate(
  verification: GPayGatewayCallbackVerification,
  reconciliation: GPayCallbackReconciliationResult,
): boolean {
  return (
    isGPayFastAckEnabled() &&
    getGPayCommerceAutomationMode() !== "disabled" &&
    isGPayImmediateSuccessDurabilityCandidate(verification, reconciliation)
  );
}

export async function prepareGPayFastAck({
  verification,
  reconciliation,
  source,
}: {
  verification: GPayGatewayCallbackVerification;
  reconciliation: GPayCallbackReconciliationResult;
  source: "gpay-webhook" | "gpay-va-webhook";
}): Promise<GPayFastAckPreparationResult> {
  const automationMode = getGPayCommerceAutomationMode();

  if (automationMode === "disabled") {
    throw new Error(
      "GPay fast ACK không chạy khi commerce automation disabled.",
    );
  }
  if (!isGPayFastAckEnabled()) {
    throw new Error("GPay fast ACK chưa được bật.");
  }
  if (
    !isGPayImmediateSuccessDurabilityCandidate(verification, reconciliation)
  ) {
    throw new Error("Callback GPay không đủ điều kiện fast ACK.");
  }

  const paymentAutomation = await runGPayCommerceAutomation(
    verification,
    reconciliation,
    {
      modeOverride: "record",
      source,
    },
  );

  if (!paymentAutomation.paymentRecorded || !paymentAutomation.orderId) {
    throw new Error(
      "Không thể ACK GPay trước khi WooCommerce xác nhận payment đã được ghi bền vững.",
    );
  }

  const durability = await persistGPayFastAckDurability({
    verification,
    reconciliation,
    paymentAutomation,
    automationMode,
    fulfillmentMode: "live",
  });

  return {
    version: GPAY_FAST_ACK_VERSION,
    automationMode,
    paymentAutomation,
    durability,
  };
}
