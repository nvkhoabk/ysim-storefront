import type {
  GPayTokenContentType,
} from "./token.types";

export interface GPayTokenConfig {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  contentType: GPayTokenContentType;
  grantType: string;
  timeoutMs: number;
  refreshMarginSeconds: number;
}

function requireEnvironmentVariable(
  name: string,
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Thiếu biến môi trường ${name}.`,
    );
  }

  return value;
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed =
    Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) &&
    parsed > 0
    ? parsed
    : fallback;
}

function getContentType():
  GPayTokenContentType {
  const value =
    process.env
      .GPAY_TOKEN_CONTENT_TYPE
      ?.trim();

  if (
    value ===
    "application/x-www-form-urlencoded"
  ) {
    return value;
  }

  return "application/json";
}

export function getGPayTokenConfig():
  GPayTokenConfig {
  return {
    tokenUrl:
      requireEnvironmentVariable(
        "GPAY_TOKEN_URL",
      ),

    clientId:
      requireEnvironmentVariable(
        "GPAY_CLIENT_ID",
      ),

    clientSecret:
      requireEnvironmentVariable(
        "GPAY_CLIENT_SECRET",
      ),

    contentType:
      getContentType(),

    grantType:
      process.env
        .GPAY_TOKEN_GRANT_TYPE
        ?.trim() ||
      "client_credentials",

    timeoutMs:
      parsePositiveInteger(
        process.env
          .GPAY_REQUEST_TIMEOUT_MS,
        15_000,
      ),

    refreshMarginSeconds:
      parsePositiveInteger(
        process.env
          .GPAY_TOKEN_REFRESH_MARGIN_SECONDS,
        120,
      ),
  };
}
