export type GPayPaidOrderTransactionDisposition =
  "not-paid" | "same-transaction-duplicate" | "different-transaction-review";

export function classifyGPayPaidOrderTransaction({
  orderPaid,
  existingTransactionId,
  incomingTransactionId,
}: {
  readonly orderPaid: boolean;
  readonly existingTransactionId: string | null;
  readonly incomingTransactionId: string;
}): GPayPaidOrderTransactionDisposition {
  if (!orderPaid) {
    return "not-paid";
  }

  const existing = existingTransactionId?.trim() ?? "";
  const incoming = incomingTransactionId.trim();

  if (existing && incoming && existing === incoming) {
    return "same-transaction-duplicate";
  }

  return "different-transaction-review";
}
