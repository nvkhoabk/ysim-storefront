import {
  verifyGPayProviderSignature,
} from "./crypto";

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
  verificationStrategy: string | null;
  normalizedStatus: GPayGatewayNormalizedStatus;
  callback: GPayGatewayCallbackData;
  parsedEmbedData: Record<string, unknown> | null;
}

const CALLBACK_FIELD_ORDER = [
  "embed_data",
  "gpay_bill_id",
  "gpay_trans_id",
  "merchant_order_id",
  "status",
  "user_payment_method",
] as const;

function safeDecodeURIComponent(
  value: string,
): string {
  try {
    return decodeURIComponent(
      value.replace(/\+/g, "%20"),
    );
  } catch {
    return value;
  }
}

function removeSignatureFromRawQuery(
  rawQueryString: string,
): string {
  return rawQueryString
    .replace(/^\?/, "")
    .split("&")
    .filter(Boolean)
    .filter((segment) => {
      const equalsIndex =
        segment.indexOf("=");

      const rawKey =
        equalsIndex >= 0
          ? segment.slice(
              0,
              equalsIndex,
            )
          : segment;

      return (
        safeDecodeURIComponent(
          rawKey,
        ) !== "signature"
      );
    })
    .join("&");
}

function createCallbackData(
  searchParams: URLSearchParams,
): GPayGatewayCallbackData {
  return {
    embedData:
      searchParams.get(
        "embed_data",
      ) ?? "",

    gpayBillId:
      searchParams.get(
        "gpay_bill_id",
      ) ?? "",

    gpayTransactionId:
      searchParams.get(
        "gpay_trans_id",
      ) ?? "",

    merchantOrderId:
      searchParams.get(
        "merchant_order_id",
      ) ?? "",

    status:
      searchParams.get(
        "status",
      ) ?? "",

    userPaymentMethod:
      searchParams.get(
        "user_payment_method",
      ) ?? "",

    signature:
      searchParams.get(
        "signature",
      ) ?? "",
  };
}

function parseEmbedData(
  value: string,
): Record<string, unknown> | null {
  if (!value.trim()) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(value) as unknown;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<
        string,
        unknown
      >;
    }
  } catch {
    return null;
  }

  return null;
}

function createVerificationCandidates(
  rawQueryString: string,
  searchParams: URLSearchParams,
): Array<{
  strategy: string;
  rawInput: string;
}> {
  const orderedEntries =
    CALLBACK_FIELD_ORDER.map(
      (field) =>
        [
          field,
          searchParams.get(
            field,
          ) ?? "",
        ] as const,
    );

  const sortedEntries =
    [...orderedEntries].sort(
      ([left], [right]) =>
        left.localeCompare(
          right,
        ),
    );

  const candidates = [
    {
      strategy:
        "raw-query-without-signature",

      rawInput:
        removeSignatureFromRawQuery(
          rawQueryString,
        ),
    },

    {
      strategy:
        "ordered-key-value",

      rawInput:
        orderedEntries
          .map(
            ([key, value]) =>
              `${key}=${value}`,
          )
          .join("&"),
    },

    {
      strategy:
        "sorted-key-value",

      rawInput:
        sortedEntries
          .map(
            ([key, value]) =>
              `${key}=${value}`,
          )
          .join("&"),
    },

    {
      strategy:
        "ordered-values-concatenated",

      rawInput:
        orderedEntries
          .map(
            ([, value]) =>
              value,
          )
          .join(""),
    },

    {
      strategy:
        "ordered-values-ampersand",

      rawInput:
        orderedEntries
          .map(
            ([, value]) =>
              value,
          )
          .join("&"),
    },
  ];

  const seen =
    new Set<string>();

  return candidates.filter(
    (candidate) => {
      if (
        !candidate.rawInput ||
        seen.has(
          candidate.rawInput,
        )
      ) {
        return false;
      }

      seen.add(
        candidate.rawInput,
      );

      return true;
    },
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

export async function verifyGPayGatewayCallback(
  rawQueryString: string,
): Promise<GPayGatewayCallbackVerification> {
  const normalizedRawQuery =
    rawQueryString.replace(
      /^\?/,
      "",
    );

  if (!normalizedRawQuery) {
    throw new Error(
      "Callback GPay không có query string.",
    );
  }

  const searchParams =
    new URLSearchParams(
      normalizedRawQuery,
    );

  const callback =
    createCallbackData(
      searchParams,
    );

  if (
    !callback.signature.trim()
  ) {
    throw new Error(
      "Callback GPay không có chữ ký.",
    );
  }

  if (
    !callback.gpayBillId.trim() ||
    !callback
      .merchantOrderId
      .trim()
  ) {
    throw new Error(
      "Callback GPay thiếu mã hóa đơn hoặc mã đơn Merchant.",
    );
  }

  const candidates =
    createVerificationCandidates(
      normalizedRawQuery,
      searchParams,
    );

  let verificationStrategy:
    | string
    | null = null;

  for (
    const candidate
    of candidates
  ) {
    const verified =
      await verifyGPayProviderSignature(
        candidate.rawInput,
        callback.signature,
      );

    if (verified) {
      verificationStrategy =
        candidate.strategy;

      break;
    }
  }

  return {
    verified:
      verificationStrategy !==
      null,

    verificationStrategy,

    normalizedStatus:
      normalizeGPayGatewayStatus(
        callback.status,
      ),

    callback,

    parsedEmbedData:
      parseEmbedData(
        callback.embedData,
      ),
  };
}
