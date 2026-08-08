import type {
  GPayCallbackReconciliationResult,
  GPayGatewayCallbackVerification,
} from "@/lib/payment/adapters/gpay";

export function reconcileVerifiedGPayVAWebhook({
  verification,
  merchantOrderIdMatches,
  accountNumberMatches,
  amountMatches,
}: {
  readonly verification: GPayGatewayCallbackVerification;
  readonly merchantOrderIdMatches: boolean;
  readonly accountNumberMatches: boolean;
  readonly amountMatches: boolean;
}): GPayCallbackReconciliationResult {
  const transactionIdPresent = Boolean(
    verification.callback.gpayTransactionId.trim(),
  );
  const callbackSucceeded = verification.normalizedStatus === "SUCCESS";
  const confirmed =
    verification.verified &&
    callbackSucceeded &&
    transactionIdPresent &&
    merchantOrderIdMatches &&
    accountNumberMatches &&
    amountMatches;

  return {
    mode: "signed-webhook",
    attempted: false,
    confirmed,
    reason: !verification.verified
      ? "VA_CALLBACK_SIGNATURE_INVALID"
      : confirmed
        ? "VA_SIGNED_CHANGE_BALANCE_CONFIRMED"
        : "VA_SIGNED_CHANGE_BALANCE_IDENTITY_MISMATCH",
    callbackStatus: verification.normalizedStatus,
    merchantOrderIdMatches,
    gpayBillIdMatches: accountNumberMatches,
    statusCompatible: callbackSucceeded,
    providerQueryKind: "virtual-account-webhook",
    accountNumberMatches,
    amountMatches,
  };
}
