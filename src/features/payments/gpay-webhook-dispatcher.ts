export type GPayUnifiedWebhookContract =
  "gateway" | "virtual-account" | "ambiguous" | "unknown";

type WebhookRecord = Record<string, unknown>;

const GATEWAY_IDENTITY_FIELDS = [
  "merchant_order_id",
  "gpay_bill_id",
  "status",
  "embed_data",
  "user_payment_method",
] as const;

function hasMeaningfulValue(record: WebhookRecord, field: string): boolean {
  const value = record[field];

  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

function cleanUpper(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function classifyGPayUnifiedWebhookPayload(
  record: WebhookRecord,
): GPayUnifiedWebhookContract {
  const action = cleanUpper(record.action);
  const hasGatewayIdentity = GATEWAY_IDENTITY_FIELDS.some((field) =>
    hasMeaningfulValue(record, field),
  );
  const hasVirtualAccountCore =
    hasMeaningfulValue(record, "gpay_trans_id") &&
    hasMeaningfulValue(record, "account_number") &&
    hasMeaningfulValue(record, "amount");
  const hasVirtualAccountIdentity =
    action === "CHANGE_BALANCE" || hasVirtualAccountCore;

  if (hasGatewayIdentity && hasVirtualAccountIdentity) {
    return "ambiguous";
  }

  if (hasVirtualAccountIdentity) {
    return "virtual-account";
  }

  if (hasGatewayIdentity) {
    return "gateway";
  }

  return "unknown";
}
