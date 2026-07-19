import {
  GPayError,
} from "./errors";

export interface GPayConfig {
  environment: "sandbox" | "production";

  baseUrl: string;

  tokenPath: string;

  clientId: string;

  clientSecret: string;

  requestTimeoutMs: number;

  tokenRefreshBufferSeconds: number;
}

function readRequiredEnvironmentVariable(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        `Thiếu biến môi trường bắt buộc: ${name}.`,
    });
  }

  return value;
}

function readPositiveInteger(
  name: string,
  fallback: number,
): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue =
    Number.parseInt(rawValue, 10);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue <= 0
  ) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        `${name} phải là số nguyên lớn hơn 0.`,
    });
  }

  return parsedValue;
}

function normalizeBaseUrl(
  value: string,
): string {
  return value.replace(/\/+$/, "");
}

function normalizePath(
  value: string,
): string {
  return value.startsWith("/")
    ? value
    : `/${value}`;
}

export function getGPayConfig(): GPayConfig {
  const environment =
    process.env.GPAY_ENVIRONMENT ===
    "production"
      ? "production"
      : "sandbox";

  const defaultBaseUrl =
    environment === "production"
      ? "https://openapi.g-pay.vn/v1"
      : "https://openapi-sandbox.g-pay.vn/v1";

  return {
    environment,

    baseUrl: normalizeBaseUrl(
      process.env.GPAY_BASE_URL?.trim() ||
        defaultBaseUrl,
    ),

    /*
     * Base URL chính thức đã chứa /v1,
     * nên token path mặc định là /auth/token.
     */
    tokenPath: normalizePath(
      process.env.GPAY_TOKEN_PATH?.trim() ||
        "/auth/token",
    ),

    clientId:
      readRequiredEnvironmentVariable(
        "GPAY_CLIENT_ID",
      ),

    clientSecret:
      readRequiredEnvironmentVariable(
        "GPAY_CLIENT_SECRET",
      ),

    requestTimeoutMs:
      readPositiveInteger(
        "GPAY_REQUEST_TIMEOUT_MS",
        15_000,
      ),

    /*
     * Làm mới token trước khi hết hạn.
     */
    tokenRefreshBufferSeconds:
      readPositiveInteger(
        "GPAY_TOKEN_REFRESH_BUFFER_SECONDS",
        120,
      ),
  };
}

export function buildGPayTokenUrl(
  config: GPayConfig,
): string {
  return `${config.baseUrl}${config.tokenPath}`;
}
