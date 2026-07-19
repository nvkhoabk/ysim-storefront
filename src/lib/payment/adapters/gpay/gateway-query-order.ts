import {
  getGPayConfig,
} from "./config";

import {
  GPayError,
} from "./errors";

import {
  buildGPayGatewayUrl,
  getGPayGatewayConfig,
} from "./gateway-config";

import {
  buildGPaySecurityHeaders,
} from "./gateway-security";

import type {
  GPayGatewayMeta,
  GPayGatewayQueryOrderInput,
  GPayGatewayQueryOrderRequest,
  GPayGatewayQueryOrderResponse,
  GPayGatewayQueryOrderResult,
} from "./gateway-types";

import {
  getGPayAccessToken,
} from "./token";

import {
  gpayFetch,
} from "./debug";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseGatewayQueryResponse(
  value: unknown,
): GPayGatewayQueryOrderResponse {
  if (!isRecord(value)) {
    throw new GPayError({
      code:
        "GPAY_GATEWAY_RESPONSE_INVALID",
      message:
        "GPay Gateway query-order trả response không hợp lệ.",
      details: value,
    });
  }

  return value as GPayGatewayQueryOrderResponse;
}

function isSuccessMeta(
  meta: GPayGatewayMeta | undefined,
): boolean {
  return String(
    meta?.code ?? "",
  ) === "200";
}

function getGatewayErrorMessage(
  meta: GPayGatewayMeta | undefined,
): string {
  return (
    meta?.msg ||
    meta?.message ||
    meta?.internal_msg ||
    meta?.error?.message ||
    "GPay từ chối yêu cầu truy vấn đơn hàng."
  );
}

function validateInput(
  input: GPayGatewayQueryOrderInput,
): void {
  if (!input.gpayBillId?.trim()) {
    throw new GPayError({
      code:
        "GPAY_GATEWAY_INPUT_INVALID",
      message:
        "gpayBillId không được để trống.",
    });
  }

  if (!input.merchantOrderId?.trim()) {
    throw new GPayError({
      code:
        "GPAY_GATEWAY_INPUT_INVALID",
      message:
        "merchantOrderId không được để trống.",
    });
  }
}

function buildRequestBody(
  input: GPayGatewayQueryOrderInput,
): GPayGatewayQueryOrderRequest {
  validateInput(input);

  return {
    gpay_bill_id:
      input.gpayBillId.trim(),
    merchant_order_id:
      input.merchantOrderId.trim(),
  };
}

export async function queryGPayGatewayOrder(
  input: GPayGatewayQueryOrderInput,
  options: {
    forceTokenRefresh?: boolean;
  } = {},
): Promise<GPayGatewayQueryOrderResult> {
  const openApiConfig =
    getGPayConfig();

  const gatewayConfig =
    getGPayGatewayConfig();

  const tokenResult =
    await getGPayAccessToken({
      forceRefresh:
        options.forceTokenRefresh ===
        true,
    });

  const body =
    buildRequestBody(input);

  const bodyJson =
    JSON.stringify(body);

  const securityHeaders =
    await buildGPaySecurityHeaders({
      accessToken:
        tokenResult.token.accessToken,
      bodyJson,
    });

  const result = await gpayFetch(
    buildGPayGatewayUrl(
      openApiConfig.baseUrl,
      gatewayConfig.queryOrderPath,
    ),
    {
      operation:
        "gpay.gateway.query-order",
      requestId:
        securityHeaders[
          "x-requests-id"
        ],
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
        Authorization:
          securityHeaders.authorization,
        signature:
          securityHeaders.signature,
        "x-certificate":
          securityHeaders[
            "x-certificate"
          ],
        "x-requests-id":
          securityHeaders[
            "x-requests-id"
          ],
        "x-timestamp":
          securityHeaders[
            "x-timestamp"
          ],
      },
      body: bodyJson,
      cache: "no-store",
      timeoutMs:
        openApiConfig.requestTimeoutMs,
    },
  );

  const payload =
    parseGatewayQueryResponse(
      result.body,
    );

  if (
    !result.response.ok ||
    !isSuccessMeta(payload.meta)
  ) {
    throw new GPayError({
      code:
        "GPAY_GATEWAY_QUERY_REJECTED",
      status:
        result.response.status,
      message:
        getGatewayErrorMessage(
          payload.meta,
        ),
      details: {
        meta:
          payload.meta,
        request: body,
      },
    });
  }

  const data = payload.data;

  if (!data) {
    throw new GPayError({
      code:
        "GPAY_GATEWAY_RESPONSE_INVALID",
      message:
        "GPay Gateway query-order không trả data.",
      details: {
        meta:
          payload.meta,
      },
    });
  }

  return {
    provider: "gpay",
    gpayBillId:
      data.gpay_bill_id?.trim() ||
      body.gpay_bill_id,
    merchantOrderId:
      data.merchant_order_id?.trim() ||
      body.merchant_order_id,
    gpayTransactionId:
      data.gpay_trans_id?.trim() ||
      undefined,
    status:
      data.status?.trim() ||
      undefined,
    userPaymentMethod:
      data.user_payment_method?.trim() ||
      undefined,
    embedData:
      data.embed_data,
    tokenCached:
      tokenResult.cached,
    securityRequestId:
      securityHeaders[
        "x-requests-id"
      ],
    queriedAt:
      new Date().toISOString(),
  };
}
