import {
  gpayFetch,
} from "../debug";

import {
  getGPayTokenConfig,
} from "./token.config";

import type {
  GPayAccessToken,
  GPayTokenMetadata,
} from "./token.types";

interface UnknownRecord {
  [key: string]: unknown;
}

let cachedToken:
  | GPayAccessToken
  | null = null;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getNestedRecord(
  value: unknown,
  key: string,
): UnknownRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const nested = value[key];

  return isRecord(nested)
    ? nested
    : null;
}

function getString(
  source: UnknownRecord,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = source[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return null;
}

function getNumber(
  source: UnknownRecord,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = source[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      const parsed =
        Number.parseInt(
          value.trim(),
          10,
        );

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function normalizeScope(
  value: unknown,
): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (
        item,
      ): item is string =>
        typeof item === "string",
    );
  }

  if (typeof value === "string") {
    return value
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function buildTokenBody(
  config:
    ReturnType<
      typeof getGPayTokenConfig
    >,
): string {
  if (
    config.contentType ===
    "application/x-www-form-urlencoded"
  ) {
    return new URLSearchParams({
      grant_type:
        config.grantType,
      client_id:
        config.clientId,
      client_secret:
        config.clientSecret,
    }).toString();
  }

  return JSON.stringify({
    client_id:
      config.clientId,

    client_secret:
      config.clientSecret,
  });
}

function parseGPayTokenResponse(
  body: unknown,
): GPayAccessToken {
  if (!isRecord(body)) {
    throw new Error(
      "GPay trả về token response không hợp lệ.",
    );
  }

  /*
   * Hỗ trợ cả response trực tiếp
   * và response lồng trong data.
   */
  const source =
    getNestedRecord(body, "data") ??
    body;

  const accessToken =
    getString(source, [
      "access_token",
      "accessToken",
      "token",
    ]);

  if (!accessToken) {
    throw new Error(
      "Không tìm thấy access token trong response GPay.",
    );
  }

  const tokenType =
    getString(source, [
      "token_type",
      "tokenType",
    ]) ??
    "Bearer";

  const expiresInSeconds =
    getNumber(source, [
      "expires_in",
      "expiresIn",
      "expires",
    ]) ??
    3600;

  const scopeValue =
    source.scope ??
    source.scopes;

  return {
    accessToken,
    tokenType,
    expiresInSeconds,

    expiresAt:
      Date.now() +
      expiresInSeconds * 1000,

    scope:
      normalizeScope(scopeValue),
  };
}

function isCachedTokenUsable(): boolean {
  if (!cachedToken) {
    return false;
  }

  const config =
    getGPayTokenConfig();

  const refreshAt =
    cachedToken.expiresAt -
    config.refreshMarginSeconds *
      1000;

  return Date.now() < refreshAt;
}

export async function getGPayAccessToken(
  options: {
    forceRefresh?: boolean;
  } = {},
): Promise<GPayAccessToken> {
  if (
    !options.forceRefresh &&
    isCachedTokenUsable() &&
    cachedToken
  ) {
    return cachedToken;
  }

  const config =
    getGPayTokenConfig();

  const result =
    await gpayFetch(
      config.tokenUrl,
      {
        operation:
          "gpay.token.create",

        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            config.contentType,
        },

        body:
          buildTokenBody(config),

        cache: "no-store",

        timeoutMs:
          config.timeoutMs,
      },
    );

  if (!result.response.ok) {
    throw new Error(
      [
        "GPay token API trả lỗi",
        `${result.response.status}`,
        result.response.statusText,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  cachedToken =
    parseGPayTokenResponse(
      result.body,
    );

  return cachedToken;
}

export function toGPayTokenMetadata(
  token: GPayAccessToken,
): GPayTokenMetadata {
  return {
    tokenType:
      token.tokenType,

    expiresInSeconds:
      token.expiresInSeconds,

    expiresAt:
      new Date(
        token.expiresAt,
      ).toISOString(),

    scope:
      token.scope,

    tokenLength:
      token.accessToken.length,
  };
}

export function clearGPayTokenCache():
  void {
  cachedToken = null;
}
