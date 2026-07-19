import {
  buildGPayQrTokenUrl,
  getGPayQrConfig,
  type GPayQrTokenStrategy,
} from "./qr-config";

import {
  GPayError,
} from "./errors";

import {
  getCachedGPayQrToken,
  setCachedGPayQrToken,
} from "./qr-token-cache";

import type {
  GPayLegacyQrTokenResponse,
  GPayQrAccessToken,
  GPayQrTokenResult,
} from "./qr-types";

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

function parseLegacyResponse(
  value: unknown,
): GPayLegacyQrTokenResponse {
  if (!isRecord(value)) {
    throw new GPayError({
      code:
        "GPAY_QR_TOKEN_RESPONSE_INVALID",

      message:
        "GPay QR Token API trả dữ liệu không hợp lệ.",

      details: value,
    });
  }

  return value as GPayLegacyQrTokenResponse;
}

function normalizeExpiresAt(
  value: string,
): string {
  const parsedTime =
    Date.parse(value);

  if (!Number.isFinite(parsedTime)) {
    throw new GPayError({
      code:
        "GPAY_QR_TOKEN_RESPONSE_INVALID",

      message:
        "GPay QR Token API trả expired_at không hợp lệ.",

      details: {
        expiredAt: value,
      },
    });
  }

  return new Date(
    parsedTime,
  ).toISOString();
}

async function requestLegacyQrToken():
Promise<GPayQrAccessToken> {
  const config =
    getGPayQrConfig();

  const result =
    await gpayFetch(
      buildGPayQrTokenUrl(config),
      {
        operation:
          "gpay.qr.token.legacy",

        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          merchant_code:
            config.merchantCode,

          password:
            config.password,
        }),

        cache: "no-store",

        timeoutMs:
          config.requestTimeoutMs,
      },
    );

  const payload =
    parseLegacyResponse(
      result.body,
    );

  const accessToken =
    payload.response?.token?.trim();

  const rawExpiresAt =
    payload.response?.expired_at?.trim();

  if (
    !result.response.ok ||
    !accessToken ||
    !rawExpiresAt
  ) {
    throw new GPayError({
      code:
        "GPAY_QR_TOKEN_REQUEST_FAILED",

      status:
        result.response.status,

      message:
        payload.meta?.msg ??
        payload.meta?.message ??
        "Không thể lấy QR Payment token từ GPay.",

      details: {
        meta:
          payload.meta,

        responseKeys:
          payload.response
            ? Object.keys(
                payload.response,
              )
            : [],
      },
    });
  }

  const normalized:
    GPayQrAccessToken = {
    accessToken,

    tokenType:
      "Bearer",

    expiresAt:
      normalizeExpiresAt(
        rawExpiresAt,
      ),

    obtainedAt:
      new Date().toISOString(),

    strategy:
      "legacy",
  };

  setCachedGPayQrToken(
    normalized,
  );

  return normalized;
}

async function requestOpenApiQrToken(
  forceRefresh: boolean,
): Promise<GPayQrTokenResult> {
  const result =
    await getGPayAccessToken({
      forceRefresh,
    });

  const normalized:
    GPayQrAccessToken = {
    accessToken:
      result.token.accessToken,

    tokenType:
      result.token.tokenType,

    expiresAt:
      result.token.expiresAt,

    obtainedAt:
      result.token.obtainedAt,

    strategy:
      "openapi",

    scope:
      result.token.scope,
  };

  return {
    token:
      normalized,

    cached:
      result.cached,
  };
}

export async function getGPayQrToken(
  options: {
    forceRefresh?: boolean;
    strategy?: GPayQrTokenStrategy;
  } = {},
): Promise<GPayQrTokenResult> {
  const strategy =
    options.strategy ??
    getGPayQrConfig()
      .tokenStrategy;

  if (
    strategy ===
    "openapi"
  ) {
    return requestOpenApiQrToken(
      options.forceRefresh ===
        true,
    );
  }

  if (
    options.forceRefresh !==
    true
  ) {
    const cachedToken =
      getCachedGPayQrToken(
        "legacy",
      );

    if (cachedToken) {
      return {
        token:
          cachedToken,

        cached:
          true,
      };
    }
  }

  const token =
    await requestLegacyQrToken();

  return {
    token,
    cached: false,
  };
}
