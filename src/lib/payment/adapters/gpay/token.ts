import {
  buildGPayTokenUrl,
  getGPayConfig,
} from "./config";

import {
  GPayError,
} from "./errors";

import {
  getCachedGPayToken,
  setCachedGPayToken,
} from "./token-cache";

import type {
  GPayAccessToken,
  GPaySafeTokenInfo,
  GPayTokenResponse,
} from "./types";

import {
  gpayFetch,
} from "./debug";

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isValidGPayTokenResponse(
  value: unknown,
): value is GPayTokenResponse {
  if (!isObject(value)) {
    return false;
  }

  const meta = value.meta;
  const data = value.data;

  if (
    !isObject(meta) ||
    !isObject(data)
  ) {
    return false;
  }

  return (
    typeof meta.code === "string" &&
    typeof meta.message === "string" &&
    typeof data.access_token === "string" &&
    data.access_token.length > 0 &&
    typeof data.expires_in === "number" &&
    data.expires_in > 0 &&
    typeof data.token_type === "string" &&
    typeof data.scope === "string"
  );
}

function createAccessToken(
  response: GPayTokenResponse,
): GPayAccessToken {
  const obtainedAt = new Date();

  const expiresAt = new Date(
    obtainedAt.getTime() +
      response.data.expires_in * 1000,
  );

  return {
    accessToken:
      response.data.access_token,

    tokenType:
      response.data.token_type,

    scope:
      response.data.scope,

    expiresInSeconds:
      response.data.expires_in,

    obtainedAt:
      obtainedAt.toISOString(),

    expiresAt:
      expiresAt.toISOString(),
  };
}

async function parseJsonSafely(
  response: Response,
): Promise<unknown> {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return {
      unparsedResponse: rawText.slice(
        0,
        1_000,
      ),
    };
  }
}

export async function requestNewGPayAccessToken():
Promise<GPayAccessToken> {
  const config = getGPayConfig();

  const controller =
    new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, config.requestTimeoutMs);

  try {
    const httpResult = await gpayFetch(
      buildGPayTokenUrl(config),
      {
        operation:
          "gpay.openapi.token",

        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          client_id:
            config.clientId,

          client_secret:
            config.clientSecret,
        }),

        cache: "no-store",

        timeoutMs:
          config.requestTimeoutMs,
      },
    );

    const response =
      httpResult.response;

    const responseBody =
      httpResult.body;

    if (!response.ok) {
      throw new GPayError({
        code:
          "GPAY_TOKEN_REQUEST_FAILED",

        status: response.status,

        message:
          `GPay Token API trả HTTP ${response.status}.`,

        /*
         * Không đưa request body hoặc
         * client_secret vào details.
         */
        details: responseBody,
      });
    }

    if (
      !isValidGPayTokenResponse(
        responseBody,
      )
    ) {
      throw new GPayError({
        code:
          "GPAY_TOKEN_RESPONSE_INVALID",

        status: response.status,

        message:
          "GPay trả về dữ liệu token không đúng định dạng mong đợi.",

        details: responseBody,
      });
    }

    if (
      responseBody.meta.code !== "200"
    ) {
      throw new GPayError({
        code: "GPAY_TOKEN_REJECTED",

        status: response.status,

        message:
          responseBody.meta.message ||
          "GPay từ chối yêu cầu lấy token.",

        details: {
          code:
            responseBody.meta.code,

          error:
            responseBody.meta.error,
        },
      });
    }

    const token =
      createAccessToken(responseBody);

    setCachedGPayToken(
      token,
      config.tokenRefreshBufferSeconds,
    );

    return token;
  } catch (error) {
    if (error instanceof GPayError) {
      throw error;
    }

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new GPayError({
        code:
          "GPAY_TOKEN_REQUEST_FAILED",

        message:
          "Yêu cầu lấy GPay token đã hết thời gian chờ.",

        cause: error,
      });
    }

    throw new GPayError({
      code:
        "GPAY_TOKEN_REQUEST_FAILED",

      message:
        "Không thể kết nối tới GPay Token API.",

      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getGPayAccessToken(
  options?: {
    forceRefresh?: boolean;
  },
): Promise<{
  token: GPayAccessToken;
  cached: boolean;
}> {
  if (!options?.forceRefresh) {
    const cachedToken =
      getCachedGPayToken();

    if (cachedToken) {
      return {
        token: cachedToken,
        cached: true,
      };
    }
  }

  return {
    token:
      await requestNewGPayAccessToken(),

    cached: false,
  };
}

export function toSafeGPayTokenInfo(
  token: GPayAccessToken,
  cached: boolean,
): GPaySafeTokenInfo {
  return {
    tokenType: token.tokenType,
    scope: token.scope,
    obtainedAt: token.obtainedAt,
    expiresAt: token.expiresAt,
    expiresInSeconds:
      token.expiresInSeconds,
    cached,
  };
}
