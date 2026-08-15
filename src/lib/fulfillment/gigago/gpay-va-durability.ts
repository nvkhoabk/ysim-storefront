interface SignedVAWebhookVerificationEvidence {
  verified: boolean;
  normalizedStatus: string;
  callback: {
    gpayTransactionId: string;
  };
}

interface PaidWooOrderEvidence {
  status: string;
  date_paid?: string | null;
  date_paid_gmt?: string | null;
}

export function isGPayPaidOrderDurabilityPostcondition(
  order: PaidWooOrderEvidence,
): boolean {
  const status = order.status.trim().toLowerCase();

  return (
    Boolean(order.date_paid) ||
    Boolean(order.date_paid_gmt) ||
    status === "processing" ||
    status === "completed"
  );
}

interface SignedVAWebhookReconciliationEvidence {
  mode: string;
  attempted: boolean;
  confirmed: boolean | null;
  callbackStatus: string;
  providerQueryKind?: string;
  merchantOrderIdMatches?: boolean;
  gpayBillIdMatches?: boolean;
  statusCompatible?: boolean;
  accountNumberMatches?: boolean;
  amountMatches?: boolean;
}

export function isGPaySignedVAWebhookDurabilityCandidate(
  verification: SignedVAWebhookVerificationEvidence,
  reconciliation: SignedVAWebhookReconciliationEvidence,
): boolean {
  return (
    verification.verified === true &&
    verification.normalizedStatus === "SUCCESS" &&
    Boolean(verification.callback.gpayTransactionId.trim()) &&
    reconciliation.mode === "signed-webhook" &&
    reconciliation.attempted === false &&
    reconciliation.confirmed === true &&
    reconciliation.callbackStatus === "SUCCESS" &&
    reconciliation.providerQueryKind === "virtual-account-webhook" &&
    reconciliation.merchantOrderIdMatches === true &&
    reconciliation.gpayBillIdMatches === true &&
    reconciliation.statusCompatible === true &&
    reconciliation.accountNumberMatches === true &&
    reconciliation.amountMatches === true
  );
}
