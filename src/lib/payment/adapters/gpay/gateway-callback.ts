import {
  createHash,
} from "node:crypto";

import {
  verifyGPayProviderSignature,
} from "./crypto";

export const GPAY_CALLBACK_CONTRACT_VERSION =
  "gpay-confirmed-callback-v1";

export const GPAY_GATEWAY_CALLBACK_CANONICAL_FIELDS = [
  "merchant_order_id",
  "gpay_trans_id",
  "gpay_bill_id",
  "status",
  "embed_data",
  "user_payment_method",
] as const;

export type GPayGatewayNormalizedStatus =
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "PENDING";

export interface GPayGatewayCallbackData {
  embedData: string;
  gpayBillId: string;
  gpayTransactionId: string;
  merchantOrderId: string;
  status: string;
  userPaymentMethod: string;
  signature: string;
}

export interface GPayGatewayCallbackVerification {
  verified: boolean;
  verificationStrategy:
    | typeof GPAY_CALLBACK_CONTRACT_VERSION
    | null;
  normalizedStatus:
    GPayGatewayNormalizedStatus;
  callback:
    GPayGatewayCallbackData;
  parsedEmbedData:
    Record<string, unknown> |
    null;
  canonicalSha256: string;
  contractVersion:
    typeof GPAY_CALLBACK_CONTRACT_VERSION;
}

type GPayCallbackRecord =
  Record<
    string,
    unknown
  >;

function stringValue(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value
    : value == null
      ? ""
      : String(
          value,
        );
}

function parseEmbedData(
  value: string,
): Record<string, unknown> | null {
  if (
    !value.trim()
  ) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        value,
      ) as unknown;

    if (
      typeof parsed ===
        "object" &&
      parsed !==
        null &&
      !Array.isArray(
        parsed,
      )
    ) {
      return parsed as
        Record<
          string,
          unknown
        >;
    }
  } catch {
    return null;
  }

  return null;
}

function callbackFromRecord(
  record:
    GPayCallbackRecord,
): GPayGatewayCallbackData {
  return {
    merchantOrderId:
      stringValue(
        record
          .merchant_order_id,
      ),

    gpayTransactionId:
      stringValue(
        record
          .gpay_trans_id,
      ),

    gpayBillId:
      stringValue(
        record
          .gpay_bill_id,
      ),

    status:
      stringValue(
        record.status,
      ),

    embedData:
      stringValue(
        record.embed_data,
      ),

    userPaymentMethod:
      stringValue(
        record
          .user_payment_method,
      ),

    signature:
      stringValue(
        record.signature,
      ),
  };
}

export function createGPayGatewayCallbackData(
  source:
    URLSearchParams |
    GPayCallbackRecord,
): GPayGatewayCallbackData {
  if (
    source instanceof
    URLSearchParams
  ) {
    return callbackFromRecord(
      Object.fromEntries(
        source.entries(),
      ),
    );
  }

  return callbackFromRecord(
    source,
  );
}

export function parseGPayGatewayCallbackQuery(
  rawQueryString: string,
): GPayGatewayCallbackData {
  const normalized =
    rawQueryString
      .trim()
      .replace(
        /^\?/,
        "",
      );

  if (!normalized) {
    throw new Error(
      "Callback GPay không có query string.",
    );
  }

  return createGPayGatewayCallbackData(
    new URLSearchParams(
      normalized,
    ),
  );
}

export function buildGPayGatewayCallbackCanonicalString(
  callback:
    GPayGatewayCallbackData,
): string {
  return [
    [
      "merchant_order_id",
      callback
        .merchantOrderId,
    ],
    [
      "gpay_trans_id",
      callback
        .gpayTransactionId,
    ],
    [
      "gpay_bill_id",
      callback
        .gpayBillId,
    ],
    [
      "status",
      callback.status,
    ],
    [
      "embed_data",
      callback
        .embedData,
    ],
    [
      "user_payment_method",
      callback
        .userPaymentMethod,
    ],
  ]
    .map(
      (
        [
          key,
          value,
        ],
      ) =>
        `${key}=${value}`,
    )
    .join(
      "&",
    );
}

export function normalizeGPayGatewayStatus(
  status: string,
): GPayGatewayNormalizedStatus {
  switch (
    status
      .trim()
      .toUpperCase()
  ) {
    case "ORDER_SUCCESS":
    case "SUCCESS":
    case "PAID":
      return "SUCCESS";

    case "ORDER_FAILED":
    case "FAILED":
      return "FAILED";

    case "ORDER_CANCELLED":
    case "ORDER_CANCELED":
    case "CANCELLED":
    case "CANCELED":
      return "CANCELLED";

    case "ORDER_EXPIRED":
    case "EXPIRED":
      return "EXPIRED";

    default:
      return "PENDING";
  }
}

function validateCallbackIdentity(
  callback:
    GPayGatewayCallbackData,
): void {
  if (
    !callback
      .merchantOrderId
      .trim()
  ) {
    throw new Error(
      "Callback GPay thiếu merchant_order_id.",
    );
  }

  if (
    !callback
      .gpayBillId
      .trim()
  ) {
    throw new Error(
      "Callback GPay thiếu gpay_bill_id.",
    );
  }

  if (
    !callback
      .status
      .trim()
  ) {
    throw new Error(
      "Callback GPay thiếu status.",
    );
  }

  if (
    !callback
      .signature
      .trim()
  ) {
    throw new Error(
      "Callback GPay không có signature.",
    );
  }
}

export async function verifyGPayGatewayCallbackData(
  callback:
    GPayGatewayCallbackData,
): Promise<GPayGatewayCallbackVerification> {
  validateCallbackIdentity(
    callback,
  );

  const canonicalString =
    buildGPayGatewayCallbackCanonicalString(
      callback,
    );

  const canonicalSha256 =
    createHash(
      "sha256",
    )
      .update(
        canonicalString,
        "utf8",
      )
      .digest(
        "hex",
      );

  const verified =
    await verifyGPayProviderSignature(
      canonicalString,
      callback.signature,
    );

  return {
    verified,

    verificationStrategy:
      verified
        ? GPAY_CALLBACK_CONTRACT_VERSION
        : null,

    normalizedStatus:
      normalizeGPayGatewayStatus(
        callback.status,
      ),

    callback,

    parsedEmbedData:
      parseEmbedData(
        callback.embedData,
      ),

    canonicalSha256,

    contractVersion:
      GPAY_CALLBACK_CONTRACT_VERSION,
  };
}

export async function verifyGPayGatewayCallback(
  rawQueryString: string,
): Promise<GPayGatewayCallbackVerification> {
  return verifyGPayGatewayCallbackData(
    parseGPayGatewayCallbackQuery(
      rawQueryString,
    ),
  );
}
