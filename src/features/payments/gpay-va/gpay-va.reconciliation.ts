import type {
  GPayCallbackReconciliationResult,
  GPayGatewayCallbackVerification,
} from "@/lib/payment/adapters/gpay";

import { getGPayVirtualAccountDetail } from "./gpay-va.client";

export async function reconcileVerifiedGPayVAWebhook({
  verification,
  accountNumber,
  amountVnd,
}: {
  readonly verification: GPayGatewayCallbackVerification;
  readonly accountNumber: string;
  readonly amountVnd: number;
}): Promise<GPayCallbackReconciliationResult> {
  if (!verification.verified) {
    return {
      mode: "query",
      attempted: false,
      confirmed: false,
      reason: "VA_CALLBACK_SIGNATURE_INVALID",
      callbackStatus: verification.normalizedStatus,
    };
  }

  const detail = await getGPayVirtualAccountDetail(accountNumber);
  const queriedAccount = detail.account_number?.trim() ?? "";
  const queriedStatus = detail.status?.trim().toUpperCase() ?? "";
  const queriedAmount = detail.equal_amount;
  const accountMatches = queriedAccount === accountNumber;
  const amountMatches =
    Number.isSafeInteger(queriedAmount) && queriedAmount === amountVnd;
  const statusCompatible = queriedStatus === "OPEN";
  const confirmed = accountMatches && amountMatches && statusCompatible;

  return {
    mode: "query",
    attempted: true,
    confirmed,
    reason: confirmed
      ? "VA_DETAIL_QUERY_RECONCILIATION_CONFIRMED"
      : "VA_DETAIL_QUERY_RECONCILIATION_MISMATCH",
    callbackStatus: verification.normalizedStatus,
    queriedStatus: confirmed ? "SUCCESS" : "FAILED",
    gpayBillIdMatches: accountMatches,
    statusCompatible,
    providerQueryKind: "virtual-account-detail",
    accountNumberMatches: accountMatches,
    amountMatches,
    query: {
      status: queriedStatus,
      gpayTransactionId: verification.callback.gpayTransactionId,
      userPaymentMethod: "VA",
      providerQueryKind: "virtual-account-detail",
      accountNumber: queriedAccount,
      equalAmount: queriedAmount,
      virtualAccountStatus: queriedStatus,
      queriedAt: new Date().toISOString(),
    },
  };
}
