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
  GPayGatewayInitOrderInput,
  GPayGatewayInitOrderRequest,
  GPayGatewayInitOrderResponse,
  GPayGatewayInitOrderResult,
  GPayGatewayMeta,
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

function parseGatewayResponse(
  value: unknown,
): GPayGatewayInitOrderResponse {
  if (!isRecord(value)) {
    throw new GPayError({
      code:
        "GPAY_GATEWAY_RESPONSE_INVALID",
      message:
        "GPay Gateway trả response không hợp lệ.",
      details: value,
    });
  }

  return value as GPayGatewayInitOrderResponse;
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
    "GPay từ chối yêu cầu khởi tạo đơn hàng."
  );
}

function cleanOptionalString(
  value: string | undefined,
): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function validateInput(
  input: GPayGatewayInitOrderInput,
): void {
  if (
    !Number.isInteger(input.amount) ||
    input.amount <= 0
  ) {
    throw new GPayError({
      code:
        "GPAY_GATEWAY_INPUT_INVALID",
      message:
        "amount phải là số nguyên lớn hơn 0.",
    });
  }

  const requiredStrings: Array<[
    keyof GPayGatewayInitOrderInput,
    string,
  ]> = [
    ["callbackUrl", input.callbackUrl],
    ["customerId", input.customerId],
    ["embedData", input.embedData],
    ["paymentType", input.paymentType],
    ["requestId", input.requestId],
    ["webhookUrl", input.webhookUrl],
  ];

  for (const [field, value] of
    requiredStrings) {
    if (!value?.trim()) {
      throw new GPayError({
        code:
          "GPAY_GATEWAY_INPUT_INVALID",
        message:
          `${String(field)} không được để trống.`,
      });
    }
  }
}

function buildRequestBody(
  input: GPayGatewayInitOrderInput,
): GPayGatewayInitOrderRequest {
  validateInput(input);

  return {
    amount: input.amount,
    callback_url:
      input.callbackUrl.trim(),
    customer_id:
      input.customerId.trim(),
    embed_data:
      input.embedData,
    payment_type:
      input.paymentType.trim(),
    request_id:
      input.requestId.trim(),
    webhook_url:
      input.webhookUrl.trim(),

    address:
      cleanOptionalString(
        input.address,
      ),
    customer_name:
      cleanOptionalString(
        input.customerName,
      ),
    description:
      cleanOptionalString(
        input.description,
      ),
    email:
      cleanOptionalString(
        input.email,
      ),
    payment_method:
      cleanOptionalString(
        input.paymentMethod,
      ),
    phone:
      cleanOptionalString(
        input.phone,
      ),
    title:
      cleanOptionalString(
        input.title,
      ),
  };
}

export async function initGPayGatewayOrder(
  input: GPayGatewayInitOrderInput,
  options: {
    forceTokenRefresh?: boolean;
  } = {},
): Promise<GPayGatewayInitOrderResult> {
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

  /*
   * Chữ ký phải dùng đúng chuỗi JSON gửi đi.
   * Không stringify lại body sau khi tạo signature.
   */
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
      gatewayConfig.initOrderPath,
    ),
    {
      operation:
        "gpay.gateway.init-order",
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
    parseGatewayResponse(
      result.body,
    );

  const data = payload.data;

  if (
    !result.response.ok ||
    !isSuccessMeta(payload.meta) ||
    !data?.bill_id ||
    !data.bill_url ||
    !data.expired_time ||
    !data.request_id
  ) {
    throw new GPayError({
      code:
        "GPAY_GATEWAY_INIT_REJECTED",
      status:
        result.response.status,
      message:
        getGatewayErrorMessage(
          payload.meta,
        ),
      details: {
        meta: payload.meta,
        dataKeys:
          data && isRecord(data)
            ? Object.keys(data)
            : [],
        merchantRequestId:
          input.requestId,
        securityRequestId:
          securityHeaders[
            "x-requests-id"
          ],
      },
    });
  }

  return {
    provider: "gpay",
    billId: data.bill_id,
    billUrl: data.bill_url,
    expiredTime:
      data.expired_time,
    requestId: data.request_id,
    tokenCached:
      tokenResult.cached,
    securityRequestId:
      securityHeaders[
        "x-requests-id"
      ],
    createdAt:
      new Date().toISOString(),
  };
}
